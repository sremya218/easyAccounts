from django.db import models

CHOICES = (
    ('cash', 'Cash'),
    ('card', 'Card'),
    ('cheque', 'Cheque'),
    ('credit', 'Credit'),
)



class Ledger(models.Model):
    account_code = models.CharField("Account Code", max_length=200, null=True, blank=True)
    parent = models.ForeignKey("self", null=True, blank=True)
    name = models.CharField("Name", max_length=200, null=True, blank=True, unique=False)
    description = models.CharField("Description", max_length=200, null=True, blank=True)
    balance = models.DecimalField('Balance', max_digits=20, default=0, decimal_places=5)

    def __unicode__(self):
        return self.name + (("-" + self.account_code) if self.account_code else '')


    class Meta:
        verbose_name_plural = 'Ledgers'

    def get_json_data(self):

        ledger_data = {
            'id': self.id,
            'name': self.name,
            'account_code': self.account_code,
            'parent_id': self.parent.id if self.parent else '',
            'parent_name': self.parent.name if self.parent else '',
            'subledgers' : [],
            'index_val': 'first' if self.name == 'Assets' else 'no_class',
        }
        return ledger_data

    def set_attributes(self, ledger_details):

        self.name = ledger_details['name']
        if ledger_details.get('parent', ''): 
            parent = Ledger.objects.get(id=ledger_details['parent'])
            self.parent = parent
            try:
                latest_sub_ledger = Ledger.objects.filter(parent=parent).latest('id').id
            except:
                latest_sub_ledger = 0
            self.account_code = int(parent.account_code) + int(latest_sub_ledger) + 1
        else:
            self.parent = None
            root_ledgers = Ledger.objects.filter(parent=None).count()
            self.account_code = (root_ledgers + 1)*1000
        self.save()
        return self


class LedgerEntry(models.Model):
    ledger = models.ForeignKey(Ledger)
    credit_amount = models.DecimalField("Credit Amount", max_digits=14, null=True, blank=True, decimal_places=2)
    debit_amount = models.DecimalField("Debit Amount", max_digits=14, null=True, blank=True, decimal_places=2)
    date = models.DateField("Date", null=True, blank=True)
    transaction_reference_number = models.CharField("Transaction Reference", max_length=200, null=True, blank=True)
    
    def __unicode__(self):
        return self.ledger.name + (('-' + self.transaction_reference_number) if self.transaction_reference_number else '')

    class Meta:
        verbose_name_plural = 'Ledger Entries'

class Transaction(models.Model):

    transaction_ref = models.CharField("Transaction Reference", max_length=200, null=True, blank=True)
    debit_ledger = models.ForeignKey(LedgerEntry, related_name="debit_ledger", null=True, blank=True)
    credit_ledger = models.ForeignKey(LedgerEntry, related_name="credit_ledger", null=True, blank=True)
    transaction_date = models.DateField("Date of Transaction", null=True, blank=True)
    debit_amount = models.DecimalField("Debit Amount", max_digits=14, null=True, blank=True, decimal_places=2)
    credit_amount = models.DecimalField("Credit Amount", max_digits=14, null=True, blank=True, decimal_places=2)
    narration = models.TextField("Narration", null=True, blank=True)
    payment_mode = models.CharField("Payment Mode", max_length=200, choices=CHOICES)
    bank_name = models.CharField("Bank Name", max_length=200, null=True, blank=True)
    cheque_date = models.DateField("Cheque Date", null=True, blank=True)
    cheque_number = models.CharField("Cheque Number", max_length=200, null=True, blank=True)
    branch = models.CharField("Branch", max_length=200, null=True, blank=True)
    card_holder_name = models.CharField("Card Holder Name", max_length=200, null=True, blank=True)
    card_no = models.CharField("Card Number", max_length=200,null=True, blank=True)
    invoice = models.TextField("Invoice", null=True, blank=True)

    def __unicode__(self):
        return (self.debit_ledger.ledger.name) if self.debit_ledger else self.credit_ledger.ledger.name

    def get_json_data(self):

        transaction_data = {
            'id': self.id,
            'reference_no': self.transaction_ref,
            'debit_ledger_name': self.debit_ledger.ledger.name,
            'debit_ledger': self.debit_ledger.ledger.id,
            'credit_ledger': self.credit_ledger.ledger.id,
            'credit_ledger_name': self.credit_ledger.ledger.name,
            'transaction_date': self.transaction_date.strftime('%d/%m/%Y'),
            'amount': self.debit_amount,
            'narration': self.narration if self.narration else '',
            'payment_mode': self.payment_mode,
            'bank_name': self.bank_name if self.bank_name else '',
            'cheque_date': self.cheque_date.strftime('%d/%m/%Y') if self.cheque_date else '',
            'cheque_no': self.cheque_number if self.cheque_number else '',
            'branch': self.branch if self.branch else '',
            'card_holder_name': self.card_holder_name if self.card_holder_name else '',
            'card_no': self.card_no if self.card_no else '',
            'debit_amount': self.debit_amount if self.debit_ledger else '',
            'credit_amount': self.credit_amount if self.credit_ledger else '',
        }
        return transaction_data