from django.db import models
from django.contrib.auth.models import User

BONUS_TYPE = (
    ('Salesman', 'Salesman'),
    ('Customer', 'Customer'),
)


class Permission(models.Model):

    accounts_permission = models.BooleanField('Accounts Permission', default=False)
    inventory_permission = models.BooleanField('Inventory Permission', default=False)
    purchase_permission = models.BooleanField('Purchase Permission', default=False)
    sales_permission = models.BooleanField('Sales Permission', default=False)
    suppliers = models.BooleanField('Suppliers Permission', default=False)
    customers = models.BooleanField('Customers Permission', default=False)
    reports = models.BooleanField('Reports Permission', default=False)

    class Meta:
        verbose_name_plural = 'Permission'


class Staff(models.Model):

    user = models.ForeignKey(User, null=True, blank=True)
    designation = models.CharField('Designation', max_length=200, null=True, blank=True)
    address = models.TextField('Address', null=True, blank=True)
    contact_no = models.CharField('Contact No', max_length=15, null=True)
    permission = models.ForeignKey(Permission, null=True, blank=True)

    def __unicode__(self):
        return self.user.first_name + str(' - ') + self.user.first_name

    class Meta:
        verbose_name_plural = 'Staff'

    def get_json_data(self):

        staff_data = {
            'id': self.id,
            'name': self.user.first_name + ' ' +self.user.last_name if self.user else '',
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'username': self.user.username,
            'address': self.address,
            'contact_no': self.contact_no,
            'designation': self.designation,
            'email': self.user.email if self.user else '',
            'accounts_permission': 'true' if self.permission and self.permission.accounts_permission else 'false',
            'inventory_permission': 'true' if self.permission and self.permission.inventory_permission else 'false',
            'purchase_permission': 'true' if self.permission and self.permission.purchase_permission else 'false',
            'sales_permission': 'true' if self.permission and self.permission.sales_permission else 'false',
            'suppliers_permission': 'true' if self.permission and self.permission.suppliers else 'false',
            'customers_permission': 'true' if self.permission and self.permission.customers else 'false',
            'reports_permission': 'true' if self.permission and self.permission.reports else 'false',
        }
        return staff_data

    def set_attributes(self, staff_details, address):

        self.user.first_name = staff_details['first_name']
        self.user.last_name = staff_details['last_name']
        self.user.email = staff_details['email']
        self.user.save()
        self.designation = staff_details['designation']
        self.address = address
        self.contact_no = staff_details['contact_no']
        self.save()
        return self


class BonusPoint(models.Model):

    bonus_type = models.CharField('Bonus Type', max_length=200, choices=BONUS_TYPE, null=True, blank=True)
    bonus_point = models.CharField('Bonus Point', max_length=200, null=True, blank=True)
    bonus_amount = models.DecimalField('Bonus Amount', max_digits=15, decimal_places=2, null=True, blank=True)

    def __unicode__(self):
        return self.bonus_type + str(' - ') + str(self.bonus_point)

    class Meta:
        verbose_name_plural = 'Bonus Point'

    def get_json_data(self):

        bonus_point_data = {
            'id': self.id,
            'type': self.bonus_type,
            'point': self.bonus_point,
            'amount': self.bonus_amount,
            'name': self.bonus_point + ' - ' + str(self.bonus_amount),
        }
        return bonus_point_data

    def set_attributes(self, bonus_point_details):
        
        self.bonus_amount = bonus_point_details['amount']
        self.bonus_type = bonus_point_details['type']
        self.bonus_point = bonus_point_details['point']
        self.save()
        return self

class Salesman(models.Model):

    first_name = models.CharField('First Name', max_length=200, null=True)
    last_name = models.CharField('Last Name', max_length=200, null=True)
    address = models.TextField('Address', null=True, blank=True)
    contact_no = models.CharField('Contact No', max_length=15, null=True)
    email = models.CharField("Email", max_length=200, null=True,blank=True)
    bonus_point = models.DecimalField('Bonus Points', max_digits=14, decimal_places=2, null=True, blank=True)
    incentive_per_sale = models.DecimalField("Incentive/sale", max_digits=14, decimal_places=2, null=True, blank=True)
    
    def __unicode__(self):
        return self.first_name + " " + self.last_name

    class Meta:
        verbose_name_plural = 'Salesman'

    def get_json_data(self):

        salesman_data = {
            'id': self.id,
            'name': self.first_name + " " + self.last_name,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'address': self.address,
            'contact_no': self.contact_no,
            'email': self.email if self.email else '',
            'bonus_point': self.bonus_point if self.bonus_point else 0,
            'incentive_per_sale': self.incentive_per_sale if self.incentive_per_sale else 0
        }
        return salesman_data

    def set_attributes(self, salesman_details):
        self.first_name = salesman_details['first_name']
        self.last_name = salesman_details['last_name']
        self.address = salesman_details['address']
        self.contact_no = salesman_details['contact_no']
        if salesman_details['email']:
            self.email = salesman_details['email']
        self.save()
        return self

class SerialNoBill(models.Model):

    user = models.ForeignKey(User, null=True, blank=True)
    is_auto_generated =  models.BooleanField('Is Auto Generated Serial No', default=False)
    prefix = models.CharField('Prefix' ,max_length=200, null=True)
    starting_no = models.DecimalField('Starting Number',max_digits=14, decimal_places=2, null=True)

    def __unicode__(self):
        return self.prefix + " " + str(self.starting_no)

    class Meta:
        verbose_name_plural = 'Serial No Bill'

    def set_attributes(self, serial_no_details,request):
        self.user = request.user
        self.prefix = serial_no_details['prefix'] + '-'
        if serial_no_details['starting_no'] == '':
            self.starting_no = 0
        else:
            self.starting_no = serial_no_details['starting_no']
        if serial_no_details['settings_type'] == 'Auto Generated No':
            self.is_auto_generated = True
        self.save()
        return self

class SerialNoInvoice(models.Model):

    user = models.ForeignKey(User, null=True, blank=True)
    is_auto_generated =  models.BooleanField('Is Auto Generated Serial No', default=False)
    prefix = models.CharField('Prefix' ,max_length=200, null=True)
    starting_no = models.DecimalField('Starting Number',max_digits=14, decimal_places=2, null=True)


    def __unicode__(self):
        return self.prefix + " " + str(self.starting_no)

    class Meta:
        verbose_name_plural = 'Serial No Invoice'

    def set_attributes(self, serial_no_details,request):
        self.user = request.user
        self.prefix = serial_no_details['prefix'] + '-'
        if serial_no_details['starting_no'] == '':
            self.starting_no = 0
        else:
            self.starting_no = serial_no_details['starting_no']
        if serial_no_details['settings_type'] == 'Auto Generated No':
            self.is_auto_generated = True
        self.save()
        return self