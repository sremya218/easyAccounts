from django.db import models

from accounts.models import Ledger

CREDIT_PERIOD_PARAMETER = (
    ('Months', 'Months'),
    ('Days', 'Days')
)

class Supplier(models.Model):

    ledger = models.ForeignKey(Ledger, null=True, blank=True)
    name = models.CharField("Supplier Name", max_length=200, null=True,blank=True, unique=True)
    address = models.TextField("Address", null=True, blank=True)
    contact_no = models.CharField("Contact no", max_length=200, null=True,blank=True)
    email = models.CharField("Email", max_length=200, null=True,blank=True)
    credit_period = models.IntegerField("Credit Period", null=True, blank=True)
    credit_period_parameter = models.CharField('Credit Period Parameter', max_length=100, null=True, blank=True, choices=CREDIT_PERIOD_PARAMETER)

    def __unicode__(self):

        return self.name

    class Meta:
        verbose_name_plural = 'Suppliers'

    def get_json_data(self):

        supplier_data = {
            'id': self.id,
            'name': self.name,
            'address': self.address if self.address else '',
            'contact': self.contact_no if self.contact_no else '',
            'ledger_id': self.ledger.id if self.ledger else '',
            'email': self.email if self.email else '',
            'credit_period': self.credit_period,
            'credit_period_parameter': self.credit_period_parameter,
            'ledger_name': self.ledger.name if self.ledger else '',
            'ledger_parent': self.ledger.parent.name if self.ledger and self.ledger.parent else '',
            'ledger_balance': self.ledger.balance if self.ledger else '',
        }
        return supplier_data

    def set_attributes(self, supplier_details):

        self.name = supplier_details['name']
        self.address = supplier_details['address']
        self.contact_no = supplier_details['contact']
        self.email = supplier_details['email']
        self.credit_period = supplier_details['credit_period']
        self.credit_period_parameter = supplier_details['credit_period_parameter']
        if self.ledger:
            supplier_ledger = self.ledger
            if supplier_ledger.name != self.name:
                supplier_ledger.name = self.name
            supplier_ledger.save()
        else:
            parent = Ledger.objects.get(name='Sundry Creditors')
            supplier_ledger = Ledger.objects.create(parent=parent, name=supplier_details['name'])
            self.ledger = supplier_ledger
        self.save()
        return self
