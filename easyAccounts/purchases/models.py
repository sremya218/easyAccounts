import datetime

from django.db import models
from inventory.models import Item, Batch, BatchItem
from suppliers.models import Supplier

from inventory.utils import calculate_actual_quantity


PAYMENT_MODE = (
    ('cash', 'Cash'),
    ('cheque', 'Cheque'),
    ('card', 'Card'),
    ('credit', 'Credit'),
)

class Purchase(models.Model):

    supplier = models.ForeignKey(Supplier, null=True, blank=True)
    do_number = models.CharField('DO Number', max_length=200, null=True, blank=True)
    transaction_reference_no = models.CharField('Transaction Reference Number', null=True, blank=True, max_length=200)

    purchase_invoice_number = models.CharField('Purchase Invoice Number', max_length=200, null=True, blank=True, unique=True)
    purchase_invoice_date = models.DateField('Purchase Invoice Date', null=True, blank=True)

    payment_mode = models.CharField('Payment mode', max_length=200, choices=PAYMENT_MODE, null=True, blank=True)
    bank_name = models.CharField('Bank Name', max_length=200, null=True, blank=True)
    card_number = models.CharField('Card Number', max_length=200, null=True, blank=True)
    cheque_date = models.DateField("Cheque Date", null=True, blank=True)
    cheque_number = models.CharField("Cheque Number", max_length=200, null=True, blank=True)
    branch = models.CharField("Branch", max_length=200, null=True, blank=True)
    card_holder_name = models.CharField("Card Holder Name", max_length=200, null=True, blank=True)
    
    discount = models.DecimalField('Discount', max_digits=14, decimal_places=2, default=0)
    purchase_tax = models.DecimalField('Purchase Tax', max_digits=20, decimal_places=2, default=0)
    grant_total = models.DecimalField('Grant Total', max_digits=14, decimal_places=2, default=0)

    supplier_tin = models.CharField('Supplier Tin Number', max_length=100, null=True, blank=True)
    owner_tin = models.CharField('Owner Tin Number', max_length=100, null=True, blank=True)

    paid = models.DecimalField('Paid', max_digits=14, decimal_places=2, default=0)
    balance = models.DecimalField('Balance', max_digits=14, decimal_places=2, default=0)

    def __unicode__(self):

        return self.purchase_invoice_number

    class Meta:

        verbose_name_plural = 'Purchase'

    def get_json_data(self):
        p_items = []
        for p_item in self.purchaseitem_set.all():
            p_items.append(p_item.get_json_data())
        purchase_data = {
            'id': self.id,
            'do_no': self.do_number, 
            'invoice_no': self.purchase_invoice_number, 
            'invoice_date': self.purchase_invoice_date.strftime('%d/%m/%Y') if self.purchase_invoice_date else '',
            'supplier_name': self.supplier.name if self.supplier else '',
            'payment_mode': self.payment_mode,
            'items': p_items,
            'discount': self.discount,
            'bank_name': self.bank_name,
            'branch': self.branch, 
            'cheque_no': self.cheque_number if self.cheque_number else '', 
            'cheque_date': self.cheque_date.strftime('%d/%m/%Y') if self.cheque_date else '',
            'card_no': self.card_number if self.card_number else '',
            'grant_total': self.grant_total,
            'card_holder_name': self.card_holder_name if self.card_holder_name else '',
            'purchase_tax': self.purchase_tax,
            'bank_name': self.bank_name if self.bank_name else '',
            'card_number': self.card_number if self.card_number else '',
            'cheque_date': self.cheque_date.strftime('%d/%m/%Y') if self.cheque_date else '',
            'cheque_number': self.cheque_number if self.cheque_number else '',
            'branch': self.branch if self.branch else '',
            'card_holder_name': self.card_holder_name if self.card_holder_name else '',
            'transaction_ref': self.transaction_reference_no,
            'supplier_tin': self.supplier_tin,
            'owner_tin': self.owner_tin,
            'balance': self.balance,
            'paid': self.paid,
            'supplier': self.supplier.id if self.supplier else '',
            'supplier_exists': self.supplier.id if self.supplier else ''
        }
        return purchase_data

    def set_attributes(self, purchase_details, transaction_ref):

        self.do_number = purchase_details['do_no']
        if purchase_details['supplier']:
            supplier = Supplier.objects.get(id=purchase_details['supplier'])
            self.supplier = supplier
        self.purchase_invoice_date = datetime.datetime.strptime(purchase_details['invoice_date'], '%d/%m/%Y')
        self.payment_mode = purchase_details['payment_mode']
        if purchase_details['discount'] != '':
            self.discount = purchase_details['discount']
        self.grant_total = purchase_details['grant_total']
        self.purchase_tax = float(purchase_details['purchase_tax'])
        self.supplier_tin = purchase_details['supplier_tin']
        self.owner_tin = purchase_details['owner_tin']
        if self.payment_mode == 'cheque':
            self.bank_name = purchase_details['bank_name']
            self.branch = purchase_details['branch']
            self.cheque_date = datetime.datetime.strptime(purchase_details['cheque_date'], '%d/%m/%Y')
            self.cheque_number = purchase_details['cheque_no']
        elif self.payment_mode == 'card':
            self.bank_name = purchase_details['bank_name']
            self.card_number = purchase_details['card_no']  
            self.card_holder_name = purchase_details['card_holder_name'] 
        self.transaction_reference_no = transaction_ref
        self.save()
        purchase_item_details = purchase_details['items']
        total_quantity = 0
        for purchase_item_data in purchase_item_details:
            total_quantity = float(total_quantity) + float(purchase_item_data['quantity'])
        unit_item_discount = float(self.discount)/float(total_quantity)
        for purchase_item_data in purchase_item_details:
            quantity = 0
            try:
                uom =  purchase_item_data['purchase_unit']
                purchase_unit = uom['uom']
            except:
                purchase_unit = purchase_item_data['purchase_unit']
            item = Item.objects.get(id=purchase_item_data['id'])
            batch = Batch.objects.get(id=purchase_item_data['batch'])                
            batch_item, batch_item_created = BatchItem.objects.get_or_create(batch=batch, item=item)
            if item.smallest_unit == purchase_unit:
                quantity = purchase_item_data['quantity']
            else:
                quantity = float(purchase_item_data['quantity'])
            batch_item.set_quantity(quantity, purchase_item_data['purchase_unit'])   
            if batch_item_created:
                batch_item.purchase_price = purchase_item_data['purchase_price']
                batch_item.uom = purchase_unit
                batch_item.save()                            
            purchase_item, created = PurchaseItem.objects.get_or_create(purchase=self, batch_item=batch_item)
            purchase_item_data = purchase_item.set_attributes(batch_item, quantity, purchase_item_data, purchase_unit, unit_item_discount, batch_item_created)
        return self

class PurchaseItem(models.Model):

    purchase = models.ForeignKey(Purchase, null=True, blank=True)
    batch_item = models.ForeignKey(BatchItem, null=True, blank=True)

    quantity = models.DecimalField('Quantity', max_digits=20, decimal_places=5, default=0)
    purchase_price = models.DecimalField('Purchase Price', max_digits=20, decimal_places=5, default=0)
    
    net_amount = models.DecimalField('Net Amount', max_digits=20, decimal_places=5, default=0)
    uom = models.CharField('Purchase Unit', max_length=200, null=True, blank=True)
    
    unit_discount = models.DecimalField('Unit Discount', max_digits=20, decimal_places=5, default=0)
    
    quantity_in_smallest_unit = models.DecimalField('Quantity in smallest unit', max_digits=20, decimal_places=10, default=0)
    
    tax_included = models.BooleanField('Tax Included', default=False)
    
    def __unicode__(self):

        return self.purchase.purchase_invoice_number + ' - ' + self.batch_item.item.code

    class Meta:

        verbose_name_plural = 'Purchase Item'

    def get_json_data(self):

        item = self.batch_item.item
        batch = self.batch_item.get_json_data()
        uom_list = []
        uom_list.append({
            'uom': item.uom,
        })
        if item.packets_per_box != None:
            uom_list.append({
                'uom': 'packet',
            })
        if item.pieces_per_packet != None or item.pieces_per_box != None:
            uom_list.append({
                'uom': 'piece',
            })
        if item.smallest_unit != item.uom and item.smallest_unit != 'packet' and item.smallest_unit != 'piece':
            uom_list.append({
                'uom': item.smallest_unit if item.smallest_unit else '',
            })
        purchase_item_data = {
            'item_id': self.batch_item.item.id,
            'purchase_item_id': self.id,
            'code':self.batch_item.item.code,
            'batch_item_id': self.batch_item.id,
            'stock': batch['stock'],
            'quantity_in_smallest_unit': self.batch_item.quantity_in_actual_unit,
            'tax_inclusive': self.tax_included,
            'tax': self.batch_item.item.vat_type.tax_percentage if self.batch_item.item.vat_type else '',
            'purchase_price': self.batch_item.purchase_price,
            'cost_price': self.batch_item.cost_price,
            'net_amount': self.net_amount,
            'name': self.batch_item.item.name,
            'batch_name': self.batch_item.batch.name,
            'batch': self.batch_item.id,
            'uom': self.batch_item.uom,
            'wholesale_profit': self.batch_item.whole_sale_profit_percentage,
            'retail_profit': self.batch_item.retail_profit_percentage,
            'wholesale_price': self.batch_item.whole_sale_price,
            'retail_price': self.batch_item.retail_price,
            'branch_price': self.batch_item.branch_price,
            'customer_card_price': self.batch_item.customer_card_price,
            'permissible_discount': self.batch_item.permissible_discount_percentage,
            'is_cost_price_existing': 'true' if self.batch_item.cost_price else 'false',
            'is_wholesale_profit': 'true' if self.batch_item.whole_sale_profit_percentage else 'false',
            'is_retail_profit': 'true' if self.batch_item.retail_profit_percentage else 'false',
            'is_branch_price': 'true' if self.batch_item.branch_price else 'false',
            'is_customer_card_price': 'true' if self.batch_item.customer_card_price else 'false',
            'is_permissible_discount': 'true' if self.batch_item.permissible_discount_percentage else 'false',
            'purchased_quantity': self.quantity,
            'stock_unit': batch['stock_unit'],
            'purchase_unit': self.uom,
            'uoms':uom_list,
        }
        return purchase_item_data

    def set_attributes(self, batch_item, quantity, purchase_item_data, purchase_unit, unit_item_discount, batch_item_created):
        self.quantity = purchase_item_data['quantity']
        self.purchase_price = purchase_item_data['purchase_price']
        self.quantity_in_smallest_unit = float(quantity) / float(purchase_item_data['quantity'])
        self.net_amount = purchase_item_data['net_amount']
        if purchase_item_data['tax_inclusive'] == 'true':
            self.tax_included = True
        else:
            self.tax_included = False
        self.uom = purchase_unit
        self.unit_discount = unit_item_discount
        self.save()
        

class PurchaseReturn(models.Model):

    purchase = models.ForeignKey(Purchase, null=True, blank=True)
    return_invoice_number = models.CharField('Return Invoice Number', max_length=200, null=True, blank=True, unique=True)
    invoice_date = models.DateField('Invoice Date', null=True, blank=True)
    grant_total = models.DecimalField('Grant Total', max_digits=20, decimal_places=2, default=0)

    discount = models.DecimalField('Discount', max_digits=20, decimal_places=2, default=0)
    purchase_tax = models.DecimalField('Return Tax', max_digits=20, decimal_places=2, default=0)
    transaction_reference_no = models.CharField('Transaction Reference Number', null=True, blank=True, max_length=200)

    payment_mode = models.CharField('Payment mode', max_length=200, choices=PAYMENT_MODE, null=True, blank=True)
    bank_name = models.CharField('Bank Name', max_length=200, null=True, blank=True)
    card_number = models.CharField('Card Number', max_length=200, null=True, blank=True)
    cheque_date = models.DateField("Cheque Date", null=True, blank=True)
    cheque_number = models.CharField("Cheque Number", max_length=200, null=True, blank=True)
    branch = models.CharField("Branch", max_length=200, null=True, blank=True)
    card_holder_name = models.CharField("Card Holder Name", max_length=200, null=True, blank=True)

    def __unicode__(self):
        return self.purchase.purchase_invoice_number if self.purchase else self.return_invoice_number

    class Meta:

        verbose_name_plural = 'Purchase Return'

    def get_json_data(self):

        purchase_return_data = {
            'invoice_no': self.return_invoice_number,
            'invoice_date': self.invoice_date.strftime('%d/%m/%Y'),
            'discount': self.discount,
            'purchase_tax': self.purchase_tax,
            'discount': self.discount,
            'grant_total': self.grant_total,
            'supplier': self.purchase.supplier.name if self.purchase.supplier else '',
            'transaction_ref': self.transaction_reference_no,
            'purchase_invoice': self.purchase.purchase_invoice_number,
            'payment_mode': self.payment_mode,
            'bank_name': self.bank_name,
            'card_number': self.card_number,
            'cheque_date': self.cheque_date.strftime('%d/%m/%Y') if self.cheque_date else '',
            'cheque_number': self.cheque_number,
            'branch': self.branch,
            'card_holder_name': self.card_holder_name,
        }
        return purchase_return_data

    def set_attributes(self, purchase_return_details, transaction_reference_no):

        purchase = Purchase.objects.get(id=purchase_return_details['purchase_id'])
        returned_quantity = 0
        self.invoice_date = datetime.datetime.strptime(purchase_return_details['return_invoice_date'], '%d/%m/%Y')
        self.purchase = purchase
        self.grant_total = purchase_return_details['grant_total']
        self.purchase_tax = purchase_return_details['purchase_tax']
        self.transaction_reference_no = transaction_reference_no
        self.payment_mode = purchase_return_details['payment_mode']
        if self.payment_mode == 'cheque' or self.payment_mode == 'card':
            self.bank_name = purchase_return_details['bank_name']
            if self.payment_mode == 'cheque':
                self.cheque_date = datetime.datetime.strptime(purchase_return_details['cheque_date'], '%d/%m/%Y')
                self.cheque_number = purchase_return_details['cheque_no']
                self.branch = purchase_return_details['branch']
            else:
                self.card_number = purchase_return_details['card_no']
                self.card_holder_name = purchase_return_details['card_holder_name']
        purchase_return_items = purchase_return_details['items']
        for pr_item in purchase_return_items:
            returned_quantity = float(returned_quantity) + float(pr_item['quantity'])
            purchase_item = PurchaseItem.objects.get(id=pr_item['purchase_item_id'])
            return_item, created = PurchaseReturnItem.objects.get_or_create(purchase_return=self, purchase_item=purchase_item)
            if created:
                return_item.quantity = pr_item['quantity']
                return_item.net_amount = pr_item['net_amount']
            return_item.save()
            batch_item = purchase_item.batch_item
            actual_quantity = calculate_actual_quantity(batch_item.item, return_item.quantity, purchase_item.uom)
            batch_item.quantity_in_actual_unit= float(batch_item.quantity_in_actual_unit) - actual_quantity
            batch_item.save() 
        purchased_quantity = 0
        unit_item_discount = 0
        for item in purchase.purchaseitem_set.all():
            purchased_quantity = float(purchased_quantity) + float(item.quantity)
        if float(purchase.discount) > 0:
            unit_item_discount = float(purchase.discount) / float(purchased_quantity)
        self.discount = float(returned_quantity) * float(unit_item_discount)
        self.grant_total = float(self.grant_total) - float(self.discount)
        self.save()
        return self

class PurchaseReturnItem(models.Model):

    purchase_return = models.ForeignKey(PurchaseReturn)
    purchase_item = models.ForeignKey(PurchaseItem)

    quantity = models.DecimalField('Quantity', max_digits=20, decimal_places=10, default=0)
    net_amount = models.DecimalField('Net Amount', max_digits=20, decimal_places=10, default=0)

    def __unicode__(self):
        return self.purchase_item.purchase.purchase_invoice_number 

    class Meta:

        verbose_name_plural = 'Purchase Return Item'

    def get_json_data(self):

        purchase_return_item_data = {
            'name': self.purchase_item.batch_item.item.name,
            'batch_name': self.purchase_item.batch_item.batch.name,
            'stock': self.purchase_item.batch_item.quantity_in_actual_unit,
            'purchased_quantity': self.purchase_item.quantity,
            'tax_inclusive': self.purchase_item.tax_included,
            'tax': self.purchase_item.batch_item.item.vat_type.tax_percentage if self.purchase_item.batch_item.item.vat_type else '',
            'purchase_unit': self.purchase_item.uom,
            'purchase_price': self.purchase_item.purchase_price,
            'net_amount': self.net_amount,
            'quantity': self.quantity,
        }
        return purchase_return_item_data


class FreightValue(models.Model):

    freight_value = models.DecimalField('Freight', max_digits=20, decimal_places=5, null=True, blank=True)


    def __unicode__(self):
        return str(self.freight_value)

    class Meta:

        verbose_name_plural = 'Freight Value'
