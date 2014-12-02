from django.db import models

from accounts.models import Ledger

class Customer(models.Model):
    ledger = models.ForeignKey(Ledger, null=True, blank=True)
    name = models.CharField("Customer Name", max_length=200, null=True,blank=True, unique=True)
    address = models.TextField("Address", null=True, blank=True)
    area = models.CharField('Area', max_length=200, null=True)
    contact_number = models.CharField("Contact Number", max_length=200, null=True,blank=True)
    email = models.CharField("Email", max_length=200, null=True,blank=True)
    bonus_point = models.DecimalField('Bonus Points', max_digits=14, decimal_places=2, null=True, blank=True)

    def __unicode__(self):
        return self.name

    class Meta:

        verbose_name_plural = 'Customer'

    def get_json_data(self):
        
        customer_data = {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'area': self.area,
            'contact_number': self.contact_number if self.contact_number else '',
            'ledger_id': self.ledger.id if self.ledger else '',
            'email': self.email if self.email else '',
            'bonus_point': self.bonus_point if self.bonus_point else '',
            'ledger_name': self.ledger.name if self.ledger else '',
            'ledger_balance': self.ledger.balance if self.ledger else '',
        }
        return customer_data

    def set_attributes(self, customer_details):

        self.name = customer_details['name']
        self.address = customer_details['address']
        self.contact_number = customer_details['contact_number']
        self.email = customer_details['email']
        self.area = customer_details['area']
        if self.ledger:
            customer_ledger = self.ledger
            if customer_ledger.name != self.name:
                customer_ledger.name = self.name
            customer_ledger.save()
        else:
            parent = Ledger.objects.get(name='Sundry Debtors')
            customer_ledger = Ledger.objects.create(parent=parent, name=customer_details['name'])
            self.ledger = customer_ledger
        self.save()
        return self

