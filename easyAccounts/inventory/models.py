
from datetime import datetime
from jsonfield import JSONField

from django.db import models
from administration.models import BonusPoint
from utils import calculate_actual_quantity

ITEM_TYPES = (
    ('Stockable', 'Stockable'),
    ('Non Stockable', 'Non Stockable'),
    ('Services', 'Services'),
)

class Category(models.Model):

    parent = models.ForeignKey('self', null=True, blank=True)
    name = models.CharField('Name', max_length=200, null=True, blank=True, unique=False)

    def __unicode__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Category'

    def get_json_data(self):

        category_data = {
            'id': self.id,
            'name': self.name,
            'parent_id': self.parent.id if self.parent else '',
            'parent_name': self.parent.name if self.parent else '',
            'subcategories': [],
            'subcategories_count': Category.objects.filter(parent=self.parent).count() if self.parent else 0,
        }
        return category_data

    def set_attributes(self, category_details):

        self.name = category_details['name']
        if category_details.get('parent_id', ''): 
            parent = Category.objects.get(id=category_details['parent_id'])
            self.parent = parent
        else:
            self.parent = None
        self.save()
        return self

class Product(models.Model):

    category = models.ForeignKey(Category)
    name = models.CharField('Name', max_length=200, null=True, blank=True)

    def __unicode__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Product'

    def get_json_data(self):

        product_data = {
            'id': self.id,
            'name': self.name,
            'category_id': self.category.id,
            'category_name': self.category.name,
        }
        return product_data

    def set_attributes(self, product_details):
        self.name = product_details['name']
        if product_details.get('category_id', ''):
            self.category = Category.objects.get(id=product_details.get('category_id', ''))
        else:
            category, created = Category.objects.get_or_create(name=product_details['new_category_name'])
            self.category = category
        self.save()
        return self
    

class Brand(models.Model):

    name = models.CharField('Name', max_length=200, null=True, blank=True, unique=True)

    def __unicode__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Brand'

    def get_json_data(self):

        brand_data = {
            'id': self.id,
            'name': self.name,
        }
        return brand_data

    def set_attributes(self, brand_details):
        self.name = brand_details['name']
        self.save()
        return self


class VatType(models.Model):

    vat_type = models.CharField('Vat Type', max_length=200, null=True, blank=True)
    tax_percentage = models.DecimalField('Tax Percentage', max_digits=14, decimal_places=2, default=0)

    def __unicode__(self):
        return self.vat_type

    class Meta:
        verbose_name_plural = 'Vat Type'

    def get_json_data(self):

        vat_data = {
            'id': self.id,
            'name': self.vat_type,
            'percentage': self.tax_percentage,
        }
        return vat_data

    def set_attributes(self, vat_details):
        self.vat_type = vat_details['name']
        self.tax_percentage = vat_details['percentage']
        self.save()
        return self

class Item(models.Model):

    vat_type = models.ForeignKey(VatType, null=True, blank=True)
    product = models.ForeignKey(Product, null=True, blank=True)
    brand = models.ForeignKey(Brand, null=True, blank=True)

    name = models.CharField('Name', max_length=200, null=True, blank=True)
    code = models.CharField('Code', max_length=200, unique=True, blank=True)
    item_type =  models.CharField('Item Type', default='Stockable', choices=ITEM_TYPES, max_length=50)
    cess = models.DecimalField('Cess', max_digits=14, decimal_places=2, default=0)
    size = models.CharField('Size', max_length=200, null=True, blank=True)
    barcode = models.CharField('Barcode', max_length=200, null=True, blank=True)
    description = models.TextField('Description', null=True, blank=True)
    offer_quantity = models.DecimalField('Quantity', default=0, max_digits=50, decimal_places=5)
    uom = models.CharField('UOM', max_length=200, null=True, blank=True)
    packets_per_box = models.DecimalField('Packets per box', max_length=200, null=True, blank=True, max_digits=50, decimal_places=5, default=None)
    pieces_per_box = models.DecimalField('Pieces per box', max_length=200, null=True, blank=True, max_digits=50, decimal_places=5, default=None)
    pieces_per_packet = models.DecimalField('Pieces per packet', max_length=200, null=True, blank=True, max_digits=50, decimal_places=5, default=None)
    unit_per_piece = models.DecimalField('Unit per piece', max_length=200, null=True, blank=True, max_digits=50, decimal_places=5, default=None)
    smallest_unit = models.CharField('Smallest Unit', max_length=200, null=True, blank=True)
    unit_per_packet = models.DecimalField('Unit per packet', max_length=200, null=True, blank=True, max_digits=50, decimal_places=5, default=None) 
    unit_per_box = models.DecimalField('Unit per box', max_length=200, null=True, blank=True, max_digits=50, decimal_places=5, default=None) 
    actual_smallest_uom = models.CharField('Actual Smallest UOM', max_length=200, null=True, blank=True)
    uoms = JSONField('UOMs', null=True, blank=True)

    room_number = models.CharField('Room Number', null=True, blank=True, max_length=200)
    shelf_number = models.CharField('Shelf Number', null=True, blank=True, max_length=200)


    def save(self, *args, **kwargs):
        super(Item, self).save() # for getting pk
        if self.product and self.brand and self.name:
            self.code = self.product.name[:3] + self.brand.name[:3] + self.name[:3]
        elif self.brand:
            self.code = self.name[:3] + self.brand.name[:3]
        if self.product:
            self.code = self.product.name[:3] + self.brand.name[:3] + self.name[:3] + (str(self.pk) if self.pk  else '')
        elif self.brand: 
            self.code =  self.brand.name[:3] + self.name[:3] + (str(self.pk) if self.pk  else '')
        if self.item_type == 'Services':
            self.code =  'SER' + self.name[:3] + (str(self.pk) if self.pk  else '')
        if self.item_type == 'Non Stockable':
            self.code =  'NS' + self.name[:3] + (str(self.pk) if self.pk  else '')
        super(Item, self).save()
    def __unicode__(self):
        return str(self.code) + ' - ' + self.name

    class Meta:
        verbose_name_plural = 'Item'

    def get_json_data(self):
        item_data = {
            'id': self.id,
            'item_id':self.id,
            'name': self.name,
            'type': self.item_type,
            'code': self.code,
            'product_name': self.product.name if self.product else '',
            'brand_name': self.brand.name if self.brand else '',
            'product': self.product.id if self.product else '',
            'brand': self.brand.id if self.brand else '',
            'vat_name': self.vat_type.vat_type + str(' - ') + str(self.vat_type.tax_percentage) if self.vat_type else '',
            'vat': self.vat_type.id if self.vat_type else '',
            'tax': self.vat_type.tax_percentage if self.vat_type and self.vat_type.tax_percentage else '',
            'barcode': self.barcode,
            'description': self.description,
            'cess': self.cess,
            'size': self.size,
            'uom':self.uom,
            'packets_per_box': self.packets_per_box if self.packets_per_box else '',
            'pieces_per_box': self.pieces_per_box if self.pieces_per_box else '',
            'pieces_per_packet': self.pieces_per_packet if self.pieces_per_packet else '',
            'unit_per_piece': self.unit_per_piece if self.unit_per_piece else '',
            'smallest_unit': self.smallest_unit if self.smallest_unit else '',
            'unit_per_packet': self.unit_per_packet if self.unit_per_packet else '',
            'room_number': self.room_number,
            'shelf_number': self.shelf_number
        }
        return item_data        
    
    def set_attributes(self, item_details):
        print item_details

        if item_details['product'] != '' :
            product = Product.objects.get(id=int(item_details['product']))
        else:
            product = ''
        if item_details['brand'] != '' :
            brand = Brand.objects.get(id=int(item_details['brand']))
        else:
            brand = ''
        try:
            vat_type = VatType.objects.get(id=item_details['vat']) 
        except Exception as ex:
            vat_type = None
        if product:
            self.product = product
        if brand:
            self.brand = brand
        uoms = []
        self.name = item_details['name']
        if vat_type != None:
            self.vat_type = vat_type
        if item_details.get('cess', ''):
            self.cess = item_details['cess']
        self.item_type = item_details['type']
        self.size = item_details['size']
        self.barcode = item_details['barcode']
        self.description = item_details['description'] 
        self.room_number = item_details['room_number']
        self.shelf_number = item_details['shelf_number']
        if item_details['new_item'] == 'true':
            self.uom = item_details['uom']  
            self.unit_per_box = None
            self.unit_per_packet = None
            self.unit_per_piece = None
            uoms.append(item_details['uom'])
            smallest_unit = item_details.get('smallest_uom', '')
            self.smallest_unit = smallest_unit
            self.actual_smallest_uom = smallest_unit
            uoms.append(smallest_unit)
            if item_details.get('box_uom', '') == 'packet':
                self.packets_per_box = item_details.get('unit_per_box', None) if item_details.get('unit_per_box', None) else None
                uoms.append('packet')
            else:
                self.packets_per_box = None
            if item_details.get('box_uom', '') == 'piece':
                self.pieces_per_box = item_details.get('unit_per_box', None) if item_details.get('unit_per_box', None) else None
                uoms.append('piece')
            else:
                self.pieces_per_box = None
                if item_details.get('box_uom', '') == 'packet':
                    self.unit_per_box = None
                else:
                    self.unit_per_box = item_details.get('unit_per_box', None) if item_details.get('unit_per_box', None) else None
            if item_details.get('packet_uom', '') == 'piece':
                self.pieces_per_packet = item_details.get('unit_per_packet', None) if item_details.get('unit_per_packet', None) else None
                uoms.append('piece')
            else:
                self.pieces_per_packet = None
                if item_details.get('unit_per_packet', '') != '':
                    self.unit_per_packet = item_details.get('unit_per_packet', None) if item_details.get('unit_per_packet', None) else None
                else: 
                    self.unit_per_packet = None
            if item_details.get('unit_per_piece', '') != '':
                self.unit_per_piece = item_details.get('unit_per_piece', None) if item_details.get('unit_per_piece', None) else None

            if smallest_unit == 'Kg' or smallest_unit == 'mg' or smallest_unit == 'gm' or smallest_unit == 'tonne':
                self.actual_smallest_uom = 'mg' 
            if smallest_unit == 'tonne':
                uoms.extend(['Kg', 'mg', 'gm', 'tonne'])
            if smallest_unit == 'Kg':
                uoms.extend(['Kg', 'mg', 'gm'])
            if smallest_unit == 'gm':
                uoms.extend(['mg', 'gm'])
            if smallest_unit == 'mg':
                uoms.extend(['mg'])
            if smallest_unit == 'Metre' or smallest_unit == 'cm' or smallest_unit == 'mm':
                self.actual_smallest_uom = 'mm'
            if smallest_unit == 'Metre':
                uoms.extend(['Metre', 'cm', 'mm'])
            if smallest_unit == 'cm':
                uoms.extend(['cm', 'mm'])
            if smallest_unit == 'mm':
                uoms.extend(['mm'])
            if smallest_unit == 'litre' or smallest_unit == 'ml':
                self.actual_smallest_uom = 'ml' 
            if smallest_unit == 'litre':
                uoms.extend(['litre', 'ml'])
            if smallest_unit == 'ml':
                uoms.extend(['ml'])
            if smallest_unit == 'sqrfeet' or smallest_unit == 'sqrmetre':
                self.actual_smallest_uom = 'sqrfeet' 
            if smallest_unit == 'sqrmetre':
                uoms.extend(['sqrfeet', 'sqrmetre'])
            if smallest_unit == 'sqrfeet':
                uoms.extend(['sqrfeet'])
            self.uoms = list(set(uoms))
        self.save()
        return self
        

class Batch(models.Model):

    name = models.CharField('Batch name', max_length=200)
    created_date = models.DateField('Created', null=True, blank=True)
    expiry_date = models.DateField('Expiry date', null=True, blank=True)

    def __unicode__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Batch'

    def get_json_data(self):

        batch_data = {
            'id': self.id,
            'name': self.name,
            'created_date': self.created_date.strftime('%d/%m/%Y') if self.created_date else '',
            'expiry_date': self.expiry_date.strftime('%d/%m/%Y') if self.expiry_date else '',
        }
        return batch_data

    def set_attributes(self, batch_details):

        self.name = batch_details['name']
        self.created_date = datetime.strptime(batch_details['created_date'], '%d/%m/%Y')
        if batch_details['expiry_date']:
            self.expiry_date = datetime.strptime(batch_details['expiry_date'], '%d/%m/%Y')
        else:
            self.expiry_date = None;
        self.save()
        return self


UOM_STATUS_CHOICES = (
    ('used', 'used'),
    ('not used', 'not used')
)


class BatchItem(models.Model):

    batch = models.ForeignKey(Batch, null=True, blank=True)
    item = models.ForeignKey(Item, null=True, blank=True)

    quantity_in_actual_unit = models.FloatField('Quantity in Actual Smallest Unit', default=0, max_length=100)
    purchase_price = models.DecimalField('Purchase Price', default=0, max_digits=50, decimal_places=5)    
    cost_price = models.DecimalField('Cost Price', default=0, max_digits=50, decimal_places=5)
    
    uom = models.CharField('UOM', max_length=200, null=True, blank=True)
    whole_sale_profit_percentage = models.DecimalField('Whole Sale Profit Percentage', max_digits=20, decimal_places=5, default=0)
    retail_profit_percentage = models.DecimalField('Retail Profit Percentage', max_digits=20, decimal_places=5, default=0)
    whole_sale_price = models.DecimalField('Whole Sale Price', max_digits=20, decimal_places=5, default=0)
    retail_price = models.DecimalField('Retail Price', max_digits=20, decimal_places=5, default=0)
    branch_price = models.DecimalField('Batch Price', max_digits=20, decimal_places=5, default=0)
    customer_card_price = models.DecimalField('Customer card Price', max_digits=20, decimal_places=5, default=0)
    small_wholesale_price = models.DecimalField('Small Whole Sale Price', max_digits=50, decimal_places=25, default=0)
    small_retail_price = models.DecimalField('Small Retail Price', max_digits=50, decimal_places=25, default=0)
    small_branch_price = models.DecimalField('Small Batch Price', max_digits=50, decimal_places=25, default=0)
    small_customer_card_price = models.DecimalField('Small Customer card Price', max_digits=50, decimal_places=25, default=0)
    freight_charge = models.DecimalField('Freight charge', max_digits=20, decimal_places=5, default=0)
    permissible_discount_percentage = models.DecimalField('Permissible Discount Percentage', max_digits=20, decimal_places=5, default=0)
    salesman_bonus_points = models.ForeignKey(BonusPoint, null=True, blank=True, related_name='Salesman Bonus')
    customer_bonus_points = models.ForeignKey(BonusPoint, null=True, blank=True, related_name='Customer Bonus')
    customer_bonus_quantity = models.FloatField('Customer Bonus Quantity', null=True, blank=True, max_length=100)
    salesman_bonus_quantity = models.FloatField('Salesman Bonus Quantity', null=True, blank=True, max_length=100)    
    
    def __unicode__(self):
        return self.batch.name + ' - ' + self.item.code+ ' - ' + self.item.name

    class Meta:
        verbose_name_plural = 'Batch Item'

    def get_json_data(self):
        uoms = []
        stock_unit = self.item.actual_smallest_uom
        stock = self.quantity_in_actual_unit
        wholesale_price = self.small_wholesale_price
        retail_price = self.small_retail_price
        branch_price = self.small_branch_price
        customer_card_price =  self.small_customer_card_price
        uoms.append({
            'uom': self.item.actual_smallest_uom, 
            'stock': stock, 
            'wholesale_price': wholesale_price,
            'retail_price': retail_price,
            'branch_price': branch_price,
            'customer_card_price': customer_card_price,
        })
        if self.quantity_in_actual_unit > 1:
            if self.item.actual_smallest_uom == 'mg':
                stock = stock/1000
                stock_unit = 'gm'

                wholesale_price = float(wholesale_price) * 1000
                retail_price = float(retail_price) * 1000
                branch_price = float(branch_price) * 1000
                customer_card_price =  float(customer_card_price) * 1000
                uoms.append({
                    'uom': 'gm', 
                    'stock': stock,
                    'wholesale_price': wholesale_price,
                    'retail_price': retail_price,
                    'branch_price': branch_price,
                    'customer_card_price': customer_card_price,
                })
                if stock_unit > 1:
                    stock = stock/1000
                    stock_unit = 'Kg'
                    wholesale_price = float(wholesale_price) * 1000
                    retail_price = float(retail_price) * 1000
                    branch_price = float(branch_price) * 1000
                    customer_card_price =  float(customer_card_price) * 1000
                    uoms.append({
                        'uom': 'Kg', 
                        'stock': stock,
                        'wholesale_price': wholesale_price,
                        'retail_price': retail_price,
                        'branch_price': branch_price,
                        'customer_card_price': customer_card_price,
                    })
            if self.item.actual_smallest_uom == 'mm':
                stock = stock/100
                stock_unit = 'cm'
                wholesale_price = float(wholesale_price) * 100
                retail_price = float(retail_price) * 100
                branch_price = float(branch_price) * 100
                customer_card_price =  float(customer_card_price) * 100
                uoms.append({
                    'uom': 'cm', 
                    'stock': stock,
                    'wholesale_price': wholesale_price,
                    'retail_price': retail_price,
                    'branch_price': branch_price,
                    'customer_card_price': customer_card_price,
                })
                if stock_unit > 1:
                    stock = stock/100
                    stock_unit = 'Metre'
                    wholesale_price = float(wholesale_price) * 100
                    retail_price = float(retail_price) * 100
                    branch_price = float(branch_price) * 100
                    customer_card_price =  float(customer_card_price) * 100
                    uoms.append({
                        'uom':' Metre', 
                        'stock': stock,
                        'wholesale_price': wholesale_price,
                        'retail_price': retail_price,
                        'branch_price': branch_price,
                        'customer_card_price': customer_card_price,
                    })
            if self.item.actual_smallest_uom == 'ml':
                stock = stock/1000
                stock_unit = 'litre'
                wholesale_price = float(wholesale_price) * 1000
                retail_price = float(retail_price) * 1000
                branch_price = float(branch_price) * 1000
                customer_card_price =  float(customer_card_price) * 1000
                uoms.append({
                    'uom': 'litre', 
                    'stock': stock,
                    'wholesale_price': wholesale_price,
                    'retail_price': retail_price,
                    'branch_price': branch_price,
                    'customer_card_price': customer_card_price,
                })
            if self.item.actual_smallest_uom == 'sqrfeet':
                stock = stock/10.7639
                stock_unit = 'sqrmetre' 
                wholesale_price = float(wholesale_price) * 10.7639
                retail_price = float(retail_price) * 10.7639
                branch_price = float(branch_price) * 10.7639
                customer_card_price =  float(customer_card_price) * 10.7639 
                uoms.append({
                    'uom': 'sqrmetre', 
                    'stock': stock,
                    'wholesale_price': wholesale_price,
                    'retail_price': retail_price,
                    'branch_price': branch_price,
                    'customer_card_price': customer_card_price,
                })
        
            if stock > 1:
                if self.item.unit_per_piece is not None:
                    if float(stock)/float(self.item.unit_per_piece) > 1:
                        stock = float(stock)/float(self.item.unit_per_piece)
                        stock_unit = 'piece'
                        wholesale_price = float(wholesale_price) * float(self.item.unit_per_piece)
                        retail_price = float(retail_price) * float(self.item.unit_per_piece)
                        branch_price = float(branch_price) * float(self.item.unit_per_piece)
                        customer_card_price =  float(customer_card_price) * float(self.item.unit_per_piece)
                        uoms.append({
                            'uom': 'piece', 
                            'stock': stock,
                            'wholesale_price': wholesale_price,
                            'retail_price': retail_price,
                            'branch_price': branch_price,
                            'customer_card_price': customer_card_price,
                        })
                if self.item.unit_per_packet is not None:
                    if float(stock)/float(self.item.unit_per_packet) > 1:
                        stock = float(stock)/float(self.item.unit_per_packet)
                        stock_unit = 'packet'
                        wholesale_price = float(wholesale_price) * float(self.item.unit_per_packet)
                        retail_price = float(retail_price) * float(self.item.unit_per_packet)
                        branch_price = float(branch_price) * float(self.item.unit_per_packet)
                        customer_card_price =  float(customer_card_price) * float(self.item.unit_per_packet)
                        uoms.append({
                            'uom': 'packet', 
                            'stock': stock,
                            'wholesale_price': wholesale_price,
                            'retail_price': retail_price,
                            'branch_price': branch_price,
                            'customer_card_price': customer_card_price,
                        })
                if self.item.unit_per_box is not None:
                    if float(stock)/float(self.item.unit_per_box) > 1:
                        stock = float(stock)/float(self.item.unit_per_box)
                        stock_unit = 'box'
                        wholesale_price = float(wholesale_price) * float(self.item.unit_per_box)
                        retail_price = float(retail_price) * float(self.item.unit_per_box)
                        branch_price = float(branch_price) * float(self.item.unit_per_box)
                        customer_card_price =  float(customer_card_price) * float(self.item.unit_per_box)

                        uoms.append({
                            'uom': 'box', 
                            'stock': stock,
                            'wholesale_price': wholesale_price,
                            'retail_price': retail_price,
                            'branch_price': branch_price,
                            'customer_card_price': customer_card_price,
                        })

                if stock > 1 and stock_unit == 'piece':
                    if self.item.pieces_per_packet is not None and float(stock)/float(self.item.pieces_per_packet) > 1:
                        stock = float(stock)/float(self.item.pieces_per_packet)
                        stock_unit = 'packet'
                        wholesale_price = float(wholesale_price) * float(self.item.pieces_per_packet)
                        retail_price = float(retail_price) * float(self.item.pieces_per_packet)
                        branch_price = float(branch_price) * float(self.item.pieces_per_packet)
                        customer_card_price =  float(customer_card_price) * float(self.item.pieces_per_packet)
                        uoms.append({
                            'uom': 'packet', 
                            'stock': stock,
                            'wholesale_price': wholesale_price,
                            'retail_price': retail_price,
                            'branch_price': branch_price,
                            'customer_card_price': customer_card_price,
                        })
                    if self.item.pieces_per_box is not None and float(stock)/float(self.item.pieces_per_box) > 1:
                        stock = float(stock)/float(self.item.pieces_per_box)
                        stock_unit = 'box'
                        wholesale_price = float(wholesale_price) * float(self.item.pieces_per_box)
                        retail_price = float(retail_price) * float(self.item.pieces_per_box)
                        branch_price = float(branch_price) * float(self.item.pieces_per_box)
                        customer_card_price =  float(customer_card_price) * float(self.item.pieces_per_box)
                        uoms.append({
                            'uom': 'box', 
                            'stock': stock,
                            'wholesale_price': wholesale_price,
                            'retail_price': retail_price,
                            'branch_price': branch_price,
                            'customer_card_price': customer_card_price,
                        })

                if stock > 1 and stock_unit == 'packet':
                    if self.item.packets_per_box is not None and float(stock)/float(self.item.packets_per_box) > 1:
                        stock = float(stock)/float(self.item.packets_per_box)
                        stock_unit = 'box'
                        wholesale_price = float(wholesale_price) * float(self.item.packets_per_box)
                        retail_price = float(retail_price) * float(self.item.packets_per_box)
                        branch_price = float(branch_price) * float(self.item.packets_per_box)
                        customer_card_price =  float(customer_card_price) * float(self.item.packets_per_box)
                        uoms.append({
                            'uom': 'box', 
                            'stock': stock,
                            'wholesale_price': wholesale_price,
                            'retail_price': retail_price,
                            'branch_price': branch_price,
                            'customer_card_price': customer_card_price,
                        })
       
        batch_item_details = {
            'batch_item_id': self.item.id,
            'item_name': self.item.name,
            'code': self.item.code,                                                                                                      
            'batch_name': self.batch.name,
            'batch_id': self.id,
            'stock': stock,
            'quantity': '', #for getting sales quantity
            'stock_unit': stock_unit,
            'tax': self.item.vat_type.tax_percentage if self.item.vat_type else '',
            'offer_quantity': self.item.offer_quantity if self.item.offer_quantity else '',
            # 'whole_sale_price_sales': self.whole_sale_price,
            'retail_price_sales': self.retail_price,
            'freight_charge': self.freight_charge if self.freight_charge else 0,
            'purchase_unit': self.uom,
            'purchase_price': self.purchase_price,            
            'purchase_price': self.purchase_price,
            'cost_price': self.cost_price,
            'uom': self.uom,
            'wholesale_profit': self.whole_sale_profit_percentage,
            'retail_profit': self.retail_profit_percentage,
            'wholesale_price': self.whole_sale_price,
            'retail_price': self.retail_price,
            'branch_price': self.branch_price,
            'customer_card_price': self.customer_card_price,
            'permissible_discount': self.permissible_discount_percentage,
            'is_cost_price_existing': 'true' if self.cost_price else 'false',
            'is_wholesale_profit': 'true' if self.whole_sale_profit_percentage else 'false',
            'is_retail_profit': 'true' if self.retail_profit_percentage else 'false',
            'is_branch_price': 'true' if self.branch_price else 'false',
            'is_customer_card_price': 'true' if self.customer_card_price else 'false',
            'is_permissible_discount': 'true' if self.permissible_discount_percentage else 'false',
            'uoms': uoms
        }
        return batch_item_details

    def set_quantity(self, quantity, quantity_unit):
        item = self.item
        raw_quantity = quantity = float(quantity)
        print "in set quantity", quantity, quantity_unit
        if type(quantity_unit) == 'dict':
            quantity_unit = quantity_unit['uom']
        actual_quantity = calculate_actual_quantity(item, quantity, quantity_unit)
        self.quantity_in_actual_unit = self.quantity_in_actual_unit + float(actual_quantity)
        self.save()


class OpeningStock(models.Model):

    date = models.DateField('Date',null=True, blank=True)
    transaction_reference_no = models.CharField('Transaction Reference Number', null=True, blank=True, max_length=200)

    def __unicode__(self):
        return str(self.date)+ ' - ' + self.transaction_reference_no

    class Meta:
        verbose_name_plural = 'Opening Stock'


class OpeningStockItem(models.Model):

    opening_stock = models.ForeignKey(OpeningStock, null=True, blank=True)
    batch_item = models.ForeignKey(BatchItem, null=True, blank=True)

    quantity = models.DecimalField('Quantity', max_digits=20, decimal_places=5, default=0)
    uom = models.CharField('Uom', max_length=200, null=True, blank=True)
    purchase_price = models.DecimalField('Purchase Price', max_digits=20, decimal_places=5, default=0)
    net_amount = models.DecimalField('Net Amount', max_digits=20, decimal_places=5, default=0)
    
    def __unicode__(self):
        return str(self.opening_stock.date) + ' - ' + self.opening_stock.transaction_reference_no

    class Meta:
        verbose_name_plural = 'Opening Stock Item'

class StockValue(models.Model):

    stock_by_value = models.DecimalField('Balance', max_digits=20, null=True, blank=True, decimal_places=5)

    def __unicode__(self):
        return str(self.stock_by_value)
    class Meta:
        verbose_name_plural = 'Stock Value'

class OpeningStockValue(models.Model):

    stock_by_value = models.DecimalField('Balance', max_digits=20, null=True, blank=True, decimal_places=5)

    def __unicode__(self):
        return str(self.stock_by_value)
    class Meta:
        verbose_name_plural = 'Opening Stock Value'