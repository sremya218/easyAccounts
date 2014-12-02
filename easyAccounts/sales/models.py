from django.db import models
from django.contrib.auth.models import User

from inventory.models import Item, BatchItem
from customers.models import Customer
from administration.models import Salesman

PAYMENT_MODE = (
    ('cash', 'Cash'),
    ('cheque', 'Cheque'),
    ('card', 'Card'),
    ('credit', 'Credit'),
)

INVOICE_TYPE = (
    ('Tax Exclusive', 'Tax Exclusive'),
    ('Tax Inclusive', 'Tax Inclusive'),
)

BILL_TYPE = (
    ('Receipt', 'Receipt'),
    ('Invoice', 'Invoice'),
)


class DeliveryNote(models.Model):
    customer = models.ForeignKey(Customer, null=True, blank=True)
    salesman = models.ForeignKey(Salesman, null=True, blank=True)
    do_number = models.CharField('DO Number', max_length=200, null=True, blank=True)
    bill_type = models.CharField('Bill Type', max_length=200, choices=INVOICE_TYPE, null=True, blank=True)

    deliverynote_invoice_number = models.CharField('Deliverynote Invoice Number', max_length=200, null=True, blank=True)
    auto_invoice_number = models.CharField('Auto Invoice Number', max_length=200, null=True, blank=True, unique=True)
    deliverynote_invoice_date = models.DateField('Deliverynote Invoice Date', null=True, blank=True)

    discount = models.DecimalField('Discount', max_digits=14, decimal_places=2, default=0)
    grant_total = models.DecimalField('Grant Total', max_digits=14, decimal_places=2, default=0)
    round_off = models.DecimalField('Round off', max_digits=14, decimal_places=2, default=0)
    cess = models.DecimalField('Cess', max_digits=14, decimal_places=2, default=0)
    is_converted = models.BooleanField('Is converted to sales',default=False)

    def __unicode__(self):

        return str(self.deliverynote_invoice_number)

    class Meta:

        verbose_name_plural = 'deliverynotes'

    def get_json_data(self):
        d_items = []
        for d_item in self.deliverynoteitem_set.all():
            d_items.append(d_item.get_json_data())
        deliverynote_data = {
            'deliverynote_id' : self.id,
            'customer_id': self.customer.id if self.customer else '',
            'salesman_id': self.salesman.id if self.salesman else '',
            'customer': self.customer.name if self.customer else '',
            'salesman': self.salesman.first_name+ '' +self.salesman.last_name if self.salesman else '',
            'do_no': self.do_number if self.do_number else '',
            'discount' : self.discount if self.discount else '',
            'grant_total' : self.grant_total if self.grant_total else '',
            'round_off': self.round_off if self.round_off else '',
            'cess': self.cess if self.cess else '',
            'items': d_items,
        }
        return deliverynote_data

class DeliverynoteItem(models.Model):

    delivery = models.ForeignKey(DeliveryNote, null=True, blank=True)
    item = models.ForeignKey(Item, null=True, blank=True)
    batch_item = models.ForeignKey(BatchItem, null=True, blank=True)

    price_type = models.CharField('Price Type', max_length=200, null=True, blank=True)
    quantity = models.DecimalField('Quantity', max_digits=20, decimal_places=10, default=0)
    uom = models.CharField('Uom', max_length=200, null=True, blank=True)
    mrp = models.DecimalField('MRP', max_digits=20, decimal_places=10, default=0)
    net_amount = models.DecimalField('Net Amount', max_digits=20, decimal_places=10, default=0)

    def __unicode__(self):

        return str(self.delivery.deliverynote_invoice_number) + str(' - ') + str(self.item.code)


    class Meta:

        verbose_name_plural = 'Deliverynote Item'

    def get_json_data(self):

        item = Item.objects.get(id=self.batch_item.item.id)
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
        deliverynote_item_data = {
            'id': self.batch_item.item.id,
            'item_id': self.batch_item.item.id,
            'code': self.batch_item.item.code,
            'name': self.batch_item.item.name,
            'batch': self.batch_item.batch.name,
            'batch_name': self.batch_item.batch.name,
            'item_quantity': self.quantity,
            'uom': self.uom,
            'net_amount': self.net_amount,
            'tax': self.batch_item.item.vat_type.tax_percentage if self.batch_item.item.vat_type else '',
            'mrp': self.mrp,
            'type': self.batch_item.item.item_type,
            'price_type' : self.price_type,
            'quantity': self.quantity,
            'batch_id' : self.batch_item.batch.id,
            'uoms': uom_list,
            'stock': self.batch_item.quantity_in_purchase_unit,
            'stock_unit': self.batch_item.uom,
            'whole_sale_price' : self.batch_item.whole_sale_price,
            'retail_price' : self.batch_item.retail_price,
            'branch_price' : self.batch_item.branch_price,
            'customer_card_price' : self.batch_item.customer_card_price,
            'packets_per_box': self.batch_item.item.packets_per_box if self.batch_item.item.packets_per_box else '',
            'pieces_per_box': self.batch_item.item.pieces_per_box if self.batch_item.item.pieces_per_box else '',
            'pieces_per_packet': self.batch_item.item.pieces_per_packet if self.batch_item.item.pieces_per_packet else '',
            'unit_per_piece': self.batch_item.item.unit_per_piece if self.batch_item.item.unit_per_piece else '',
            'smallest_unit': self.batch_item.item.smallest_unit if self.batch_item.item.smallest_unit else '',
            'unit_per_packet': self.batch_item.item.unit_per_packet if self.batch_item.item.unit_per_packet else '',
            'quantity_in_purchase_unit': self.batch_item.quantity_in_purchase_unit,
            'quantity_in_smallest_unit': self.batch_item.quantity_in_smallest_unit,
        }
        return deliverynote_item_data
        
class Sale(models.Model):

    customer = models.ForeignKey(Customer, null=True, blank=True)
    salesman = models.ForeignKey(Salesman, null=True, blank=True)
    created_by = models.ForeignKey(User, null=True, blank=True)
    do_number = models.CharField('DO Number', max_length=200, null=True, blank=True)
    bill_type = models.CharField('Bill Type', max_length=200, choices=BILL_TYPE, null=True, blank=True) 
    transaction_reference_no = models.CharField('Transaction Reference Number', null=True, blank=True, max_length=200)
    deliverynote = models.ForeignKey(DeliveryNote, null=True, blank=True)

    sales_invoice_number = models.CharField('Sales Invoice Number', max_length=200, null=True, blank=True)
    sales_invoice_date = models.DateField('Sales Invoice Date', null=True, blank=True)

    payment_mode = models.CharField('Payment mode', max_length=200, choices=PAYMENT_MODE, null=True, blank=True)
    bank_name = models.CharField('Bank Name', max_length=200, null=True, blank=True)
    card_number = models.CharField('Card Number', max_length=200, null=True, blank=True)
    cheque_date = models.DateField("Cheque Date", null=True, blank=True)
    cheque_number = models.CharField("Cheque Number", max_length=200, null=True, blank=True)
    branch = models.CharField("Branch", max_length=200, null=True, blank=True)
    card_holder_name = models.CharField("Card Holder Name", max_length=200, null=True, blank=True)
    
    discount = models.DecimalField('Discount', max_digits=14, decimal_places=2, default=0)
    grant_total  = models.DecimalField('Grant Total', max_digits=14, decimal_places=2, default=0)
    round_off = models.DecimalField('Round off', max_digits=14, decimal_places=2, default=0)
    cess = models.DecimalField('Cess', max_digits=14, decimal_places=2, default=0)

    sales_tax = models.DecimalField('Sales Tax', max_digits=14, decimal_places=2, default=0)
    customer_tin = models.CharField('Customer Tin Number', max_length=100, null=True, blank=True)
    owner_tin = models.CharField('Owner Tin Number', max_length=100, null=True, blank=True)

    paid = models.DecimalField('Paid', max_digits=14, decimal_places=2, default=0)
    balance = models.DecimalField('Balance', max_digits=14, decimal_places=2, default=0)
    
    customer_bonus_point_amount = models.DecimalField('Customer Bonus Point Amount', max_digits=14, decimal_places=2, default=0)
    salesman_bonus_point_amount = models.DecimalField('Salesman Bonus Point Amount', max_digits=14, decimal_places=2, default=0)

    def __unicode__(self):

        return self.transaction_reference_no

    class Meta:

        verbose_name_plural = 'Sales'

    def get_json_data(self):
        s_items = []
        for s_item in self.salesitem_set.all():
            s_items.append(s_item.get_json_data())
            if self.bill_type == 'Invoice':
                invoice = Invoice.objects.get(sales__id=self.id)
                ref_no = invoice.invoice_no
            else:
                receipt = Receipt.objects.get(sales__id=self.id)
                ref_no = receipt.receipt_no
        if self.created_by.first_name or self.created_by.last_name:
                name = self.created_by.first_name + ' '+self.created_by.last_name 
        else:
            name = self.created_by.username
        sales_data = {
            'id': self.id,
            'transaction_reference_no': self.transaction_reference_no,
            'sales_invoice': self.sales_invoice_number if self.sales_invoice_number else ref_no,
            'invoice_no': self.sales_invoice_number if self.sales_invoice_number else ref_no,
            'invoice_date': self.sales_invoice_date.strftime('%d/%m/%Y'),
            'customer': self.customer.name if self.customer else '',
            'salesman': self.salesman.first_name + " " + self.salesman.last_name if self.salesman else '',
            'customer_id':self.customer.id if self.customer else '',
            'salesman_id':self.salesman.id if self.salesman else '',
            'discount': self.discount,
            'customer_tin':self.customer_tin,
            'owner_tin':self.owner_tin,
            'grant_total': self.grant_total,
            'items': s_items,
            'bill_type': self.bill_type,
            'do_no': self.do_number if self.do_number else '',
            'payment_mode': self.payment_mode,
            'bank_name': self.bank_name if self.bank_name else '',
            'cheque_date': self.cheque_date.strftime('%d/%m/%Y') if self.cheque_date else '',
            'cheque_no': self.cheque_number if self.cheque_number else '',
            'branch': self.branch if self.branch else '',
            'card_no': self.card_number if self.card_number else '',
            'card_holder_name': self.card_holder_name if self.card_holder_name else '',
            'round_off': self.round_off,
            'roundoff': self.round_off,
            'sales_tax':self.sales_tax,
            'prepared_by': name,
            'paid': self.paid,
            'balance': self.balance,
        }
        return sales_data

class SalesItem(models.Model):

    sales = models.ForeignKey(Sale)
    batch_item = models.ForeignKey(BatchItem, null=True, blank=True)
    item = models.ForeignKey(Item, null=True,blank=True)

    price_type = models.CharField('Price Type', max_length=200, null=True, blank=True)
    quantity = models.DecimalField('Quantity', max_digits=20, decimal_places=10, default=0)
    uom = models.CharField('Uom', max_length=200, null=True, blank=True)
    mrp = models.DecimalField('MRP', max_digits=20, decimal_places=10, default=0)
    net_amount = models.DecimalField('Net Amount', max_digits=20, decimal_places=10, default=0)
    quantity_in_purchase_unit = models.DecimalField('Quantity in purchase unit', max_digits=20, decimal_places=10, default=0)
    quantity_in_smallest_unit = models.DecimalField('Quantity in smallest unit', max_digits=20, decimal_places=10, default=0)

    def __unicode__(self):

        return str(self.sales.id)

    class Meta:

        verbose_name_plural = 'Sales Item'

    def get_json_data(self):

        item = Item.objects.get(id=self.batch_item.item.id)
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
        sales_item_data = {
            'id': self.id,
            'item_id': self.batch_item.item.id,
            'code': self.batch_item.item.code,
            'name': self.batch_item.item.name,
            'batch': self.batch_item.batch.name,
            'batch_name': self.batch_item.batch.name,
            'item_quantity': self.quantity,
            'uom': self.uom,
            'net_amount': self.net_amount,
            'tax': self.batch_item.item.vat_type.tax_percentage if self.batch_item.item.vat_type else '',
            'mrp': self.mrp,
            'type': self.batch_item.item.item_type,
            'price_type' : self.price_type,
            'quantity': self.quantity,
            'batch_id' : self.batch_item.batch.id,
            'uoms': uom_list,
            'stock': self.batch_item.quantity_in_purchase_unit,
            'stock_unit': self.batch_item.uom,
            'whole_sale_price' : self.batch_item.whole_sale_price,
            'retail_price' : self.batch_item.retail_price,
            'branch_price' : self.batch_item.branch_price,
            'customer_card_price' : self.batch_item.customer_card_price,
            'packets_per_box': self.batch_item.item.packets_per_box if self.batch_item.item.packets_per_box else '',
            'pieces_per_box': self.batch_item.item.pieces_per_box if self.batch_item.item.pieces_per_box else '',
            'pieces_per_packet': self.batch_item.item.pieces_per_packet if self.batch_item.item.pieces_per_packet else '',
            'unit_per_piece': self.batch_item.item.unit_per_piece if self.batch_item.item.unit_per_piece else '',
            'smallest_unit': self.batch_item.item.smallest_unit if self.batch_item.item.smallest_unit else '',
            'unit_per_packet': self.batch_item.item.unit_per_packet if self.batch_item.item.unit_per_packet else '',
            'quantity_in_purchase_unit': self.batch_item.quantity_in_purchase_unit,
            'quantity_in_smallest_unit': self.batch_item.quantity_in_smallest_unit,
        }
        return sales_item_data

class Receipt(models.Model):

    sales = models.ForeignKey(Sale)

    receipt_no = models.CharField('Receipt Number', max_length=200, null=True, blank=True, unique=True)


class Invoice(models.Model):

    sales = models.ForeignKey(Sale)
    
    invoice_no = models.CharField('Invoice Number', max_length=200, null=True, blank=True, unique=True)
    invoice_type = models.CharField('Invoice Type', max_length=200, choices=INVOICE_TYPE, null=True, blank=True)    

class Estimate(models.Model):

    customer = models.ForeignKey(Customer, null=True, blank=True)
    salesman = models.ForeignKey(Salesman, null=True, blank=True)
    do_number = models.CharField('DO Number', max_length=200, null=True, blank=True)
    bill_type = models.CharField('Bill Type', max_length=200, choices=INVOICE_TYPE, null=True, blank=True)

    estimate_invoice_number = models.CharField('Estimate Invoice Number', max_length=200, null=True, blank=True)
    auto_invoice_number = models.CharField('Auto Invoice Number', max_length=200, null=True, blank=True, unique=True)
    estimate_invoice_date = models.DateField('Estimate Invoice Date', null=True, blank=True)

    payment_mode = models.CharField('Payment mode', max_length=200, choices=PAYMENT_MODE, null=True, blank=True)
    bank_name = models.CharField('Bank Name', max_length=200, null=True, blank=True)
    card_number = models.CharField('Card Number', max_length=200, null=True, blank=True)
    cheque_date = models.DateField("Cheque Date", null=True, blank=True)
    cheque_number = models.CharField("Cheque Number", max_length=200, null=True, blank=True)
    branch = models.CharField("Branch", max_length=200, null=True, blank=True)
    card_holder_name = models.CharField("Card Holder Name", max_length=200, null=True, blank=True)
    
    discount = models.DecimalField('Discount', max_digits=14, decimal_places=2, default=0)
    grant_total = models.DecimalField('Grant Total', max_digits=14, decimal_places=2, default=0)
    round_off = models.DecimalField('Round off', max_digits=14, decimal_places=2, default=0)
    cess = models.DecimalField('Cess', max_digits=14, decimal_places=2, default=0)
    
    def __unicode__(self):

        return self.estimate_invoice_number

    class Meta:

        verbose_name_plural = 'Estimates'

class EstimateItem(models.Model):

    estimate = models.ForeignKey(Estimate, null=True, blank=True)
    item = models.ForeignKey(Item, null=True, blank=True)
    batch_item = models.ForeignKey(BatchItem, null=True, blank=True)

    quantity = models.DecimalField('Quantity', max_digits=20, decimal_places=10, default=0)
    uom = models.CharField('Uom', max_length=200, null=True, blank=True)
    mrp = models.DecimalField('MRP', max_digits=20, decimal_places=10, default=0)
    net_amount = models.DecimalField('Net Amount', max_digits=20, decimal_places=10, default=0)

    def __unicode__(self):

        return self.estimate.estimate_invoice_number + ' - ' + self.item.code

    class Meta:

        verbose_name_plural = 'Estimate Item'


class SalesReturn(models.Model):

    sales = models.ForeignKey(Sale, null=True, blank=True)
    
    transaction_reference_no = models.CharField('Transaction Reference Number', null=True, blank=True, max_length=200)
    return_invoice_number = models.CharField('Return Invoice Number', max_length=200, null=True, blank=True, unique=True)
    invoice_date = models.DateField('Invoice Date', null=True, blank=True)
    grant_total = models.DecimalField('Grant Total', max_digits=20, decimal_places=2, default=0)

    payment_mode = models.CharField('Payment mode', max_length=200, choices=PAYMENT_MODE, null=True, blank=True)
    bank_name = models.CharField('Bank Name', max_length=200, null=True, blank=True)
    card_number = models.CharField('Card Number', max_length=200, null=True, blank=True)
    cheque_date = models.DateField("Cheque Date", null=True, blank=True)
    cheque_number = models.CharField("Cheque Number", max_length=200, null=True, blank=True)
    branch = models.CharField("Branch", max_length=200, null=True, blank=True)
    card_holder_name = models.CharField("Card Holder Name", max_length=200, null=True, blank=True)

    def __unicode__(self):
        return self.sales.transaction_reference_no

    class Meta:

        verbose_name_plural = 'Sales Return'

class SalesReturnItem(models.Model):

    sales_return = models.ForeignKey(SalesReturn, null=True, blank=True)
    sales_item = models.ForeignKey(SalesItem)

    uom = models.CharField('Uom', max_length=200, null=True, blank=True)
    quantity = models.DecimalField('Quantity', max_digits=20, decimal_places=10, default=0)
    net_amount = models.DecimalField('Net Amount', max_digits=20, decimal_places=10, default=0)

    def __unicode__(self):
        return self.sales_item.sales.transaction_reference_no

    class Meta:

        verbose_name_plural = 'Sales Return Item'

class EditedInvoiceSale(models.Model):

    customer = models.ForeignKey(Customer, null=True, blank=True)
    salesman = models.ForeignKey(Salesman, null=True, blank=True)
    created_by = models.ForeignKey(User, null=True, blank=True)
    do_number = models.CharField('DO Number', max_length=200, null=True, blank=True)
    bill_type = models.CharField('Bill Type', max_length=200, choices=BILL_TYPE, null=True, blank=True) 
    transaction_reference_no = models.CharField('Transaction Reference Number', null=True, blank=True, max_length=200)

    sales_invoice_number = models.CharField('Sales Invoice Number', max_length=200, null=True, blank=True)
    sales_invoice_date = models.DateField('Sales Invoice Date', null=True, blank=True)

    payment_mode = models.CharField('Payment mode', max_length=200, choices=PAYMENT_MODE, null=True, blank=True)
    bank_name = models.CharField('Bank Name', max_length=200, null=True, blank=True)
    card_number = models.CharField('Card Number', max_length=200, null=True, blank=True)
    cheque_date = models.DateField("Cheque Date", null=True, blank=True)
    cheque_number = models.CharField("Cheque Number", max_length=200, null=True, blank=True)
    branch = models.CharField("Branch", max_length=200, null=True, blank=True)
    card_holder_name = models.CharField("Card Holder Name", max_length=200, null=True, blank=True)
    
    discount = models.DecimalField('Discount', max_digits=14, decimal_places=2, default=0)
    grant_total  = models.DecimalField('Grant Total', max_digits=14, decimal_places=2, default=0)
    round_off = models.DecimalField('Round off', max_digits=14, decimal_places=2, default=0)
    cess = models.DecimalField('Cess', max_digits=14, decimal_places=2, default=0)

    def __unicode__(self):

        return self.transaction_reference_no

    class Meta:

        verbose_name_plural = 'Bill To Invoice' 

class EditedInvoiceSaleItem(models.Model):

    edited_invoice_sales = models.ForeignKey(EditedInvoiceSale)
    batch_item = models.ForeignKey(BatchItem, null=True, blank=True)
    item = models.ForeignKey(Item, null=True,blank=True)

    price_type = models.CharField('Price Type', max_length=200, null=True, blank=True)
    quantity = models.DecimalField('Quantity', max_digits=20, decimal_places=10, default=0)
    uom = models.CharField('Uom', max_length=200, null=True, blank=True)
    mrp = models.DecimalField('MRP', max_digits=20, decimal_places=10, default=0)
    net_amount = models.DecimalField('Net Amount', max_digits=20, decimal_places=10, default=0)
    quantity_in_purchase_unit = models.DecimalField('Quantity in purchase unit', max_digits=20, decimal_places=10, default=0)
    quantity_in_smallest_unit = models.DecimalField('Quantity in smallest unit', max_digits=20, decimal_places=10, default=0)

    def __unicode__(self):

        return str(self.edited_invoice_sales.id)

    class Meta:

        verbose_name_plural = 'Bill To Invoice Item'

class EditedReceipt(models.Model):

    edited_invoice_sales = models.ForeignKey(EditedInvoiceSale)

    receipt_no = models.CharField('Receipt Number', max_length=200, null=True, blank=True, unique=True)


class EditedInvoice(models.Model):

    edited_invoice_sales = models.ForeignKey(EditedInvoiceSale)
    
    invoice_no = models.CharField('Invoice Number', max_length=200, null=True, blank=True, unique=True)
    invoice_type = models.CharField('Invoice Type', max_length=200, choices=INVOICE_TYPE, null=True, blank=True)



