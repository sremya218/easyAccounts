import simplejson
import ast
from datetime import datetime
import calendar

from django.shortcuts import render
from django.views.generic.base import View
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.conf import settings

from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle, SimpleDocTemplate, Spacer
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import cm

from inventory.models import Item, Batch, BatchItem, Category, Product, Brand, VatType, \
OpeningStockItem, OpeningStock, StockValue, OpeningStockValue
from accounts.models import Ledger, Transaction, LedgerEntry
from purchases.models import Purchase, PurchaseItem
from sales.models import Sale
from suppliers.models import Supplier

def get_category_details(request, categories):
    
    category_list = []
    if request.is_ajax():
        for category in categories:
            category_list.append(category.get_json_data())
        res = {
            'categories': category_list,
        }
        return res
class SearchBatch(View):

    def get(self, request, *args, **kwargs):

        batch_name = request.GET.get('batch_name', '')
        batches = Batch.objects.filter(name__istartswith=batch_name)
        batch_list = []
        for batch in batches:
            batch_data = batch.get_json_data()
            batch_list.append(batch_data)
        res = {
            'result': 'ok',
            'batches': batch_list,
        }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

class SearchBatchItem(View):
    def get(self, request, *args, **kwargs):
        batch = request.GET.get('batch', '')
        item_id = request.GET.get('item', '')
        type_name = ''
        if item_id and batch:
            item = Item.objects.get(id=item_id)
            batch_items = BatchItem.objects.filter(item=item, batch__name__istartswith=batch)
        else:
            item_name = request.GET.get('item_name', '')
            batch_id = request.GET.get('batch_id', '')
            type_name = request.GET.get('type_name', '')
            batch_items = BatchItem.objects.filter(item__name__istartswith=item_name, batch__id=batch_id)
        batch_items_list = []
        for batch_item in batch_items:
            bonus_point = ''
            bonus_quantity = ''
            if type_name:
                if type_name == 'Customer':
                    bonus_point = batch_item.customer_bonus_points.id if batch_item.customer_bonus_points else ''
                    bonus_quantity = batch_item.customer_bonus_quantity
                else:
                    bonus_point = batch_item.salesman_bonus_points.id if batch_item.salesman_bonus_points else ''
                    bonus_quantity = batch_item.salesman_bonus_quantity
            batch_items_list.append({
                'batch_id': batch_item.batch.id,
                'batch_name': batch_item.batch.name,
                'item_name': batch_item.item.product.category.name+ ' - ' + batch_item.item.product.name + ' - ' + str(batch_item.item.name) + (str(' - ') + str(batch_item.item.size) if batch_item.item.size else ''),
                'name': batch_item.item.name,
                'code': batch_item.item.code,
                'item_id': batch_item.item.id,
                'uom': batch_item.item.uom,
                'bonus_point': bonus_point,
                'bonus_quantity': bonus_quantity,
                'batch_item_id': batch_item.id,
            })
        res = {
            'result': 'ok',
            'batch_items': batch_items_list,
        }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')


class BatchList(View):
    def get(self, request, *args, **kwargs):
        batch_list = []
        batches = Batch.objects.all()
        if request.is_ajax():
            for batch in batches:
                batch_list.append(batch.get_json_data())
            res = {
                'result': 'ok',
                'batches': batch_list,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'batch_list.html', {})

class AddBatch(View):

    def get(self, request, *args, **kwargs):
        batch_id = request.GET.get('batch_id', '')
        if request.is_ajax()and request.GET.get('batch_id', ''):
            batch = Batch.objects.get(id=batch_id)
            res = {
                'result': 'ok',
                'batch': batch.get_json_data(),
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'add_batch.html', {'batch_id' : batch_id})

    def post(self, request, *args, **kwargs):
        
        batch = None
        if request.is_ajax():
            batch_details = ast.literal_eval(request.POST['batch_details'])
            if batch_details.get('id', ''):
                batches = Batch.objects.filter(name=batch_details['name']).exclude(id=batch_details['id'])
                if batches.count() == 0:
                    batch = Batch.objects.get(id=batch_details['id'])
                    batch_obj = batch.set_attributes(batch_details)
                else:
                    res = {
                        'result': 'error',
                        'message': 'Batch with this name already exists',
                    }
                    response = simplejson.dumps(res)
                    return HttpResponse(response, status=200, mimetype='application/json')
            else:
                try:
                    batch = Batch.objects.get(name=batch_details['name'])  
                    res = {
                        'result': 'error',
                        'message': 'Batch with this name already exists',
                    }
                    response = simplejson.dumps(res)
                    return HttpResponse(response, status=200, mimetype='application/json')
                except Exception as ex:
                    batch = Batch()
                    batch_obj = batch.set_attributes(batch_details)
            res = {
                'result': 'ok',
                'id': batch.id,
                'name': batch.name,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')

class EditBatch(View):

    def get(self, request, *args, **kwargs):
        batch_id = request.GET.get('batch_id', '')
        if request.is_ajax() and request.GET.get('batch_id', ''):
            batch = Batch.objects.get(id=batch_id)
            res = {
                'result': 'ok',
                'batch': batch.get_json_data(),
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'add_batch.html', {'batch_id' : batch_id})

class DeleteBatch(View):

    def get(self, request, *args, **kwargs):
    
        batch_id = request.GET.get('batch_id', '')
        batch = Batch.objects.get(id=batch_id)
        batch_items = BatchItem.objects.filter(batch=batch)
        if batch_items:
            return render(request, 'batch_list.html', {'msg' : 'Cannot delete this batch'})
        else:
            batch.delete()
        return HttpResponseRedirect(reverse('batches'))


class Categories(View):

    def get(self, request, *args, **kwargs):

        categories = Category.objects.all()
        if request.GET.get('category_name', ''):
            categories = Category.objects.filter(name__istartswith=request.GET.get('category_name', ''))
        if request.is_ajax():
            if request.GET.get('tree', '') == 'true':
                categories = Category.objects.filter(parent=None).order_by('id') 
            res = get_category_details(request, categories)
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'category_tree_view.html', {'categories': categories})

class AddCategory(View):

    def post(self, request, *args, **kwargs):

        if request.is_ajax(): 
            category_details = ast.literal_eval(request.POST['category'])
            if category_details.get('id', ''):
                category = Category.objects.get(id=category_details.get('id', ''))
                if category_details.get('parent_id', ''): 
                    category_obj = Category.objects.filter(parent__id=category_details['parent_id'],name=category_details['name']).exclude(id=category_details.get('id', ''))
                else:
                    category_obj = Category.objects.filter(name=category_details['name']).exclude(id=category_details.get('id', ''))
                if category_obj.count() == 0:
                    category_obj = category.set_attributes(category_details)
                    res = {
                        'result': 'ok',
                        'edited_category': category.get_json_data(),
                        'new_category': {}
                    }
                else:
                    res = {
                        'result': 'error',
                        'message': 'Category name already exists',
                    }
                    response = simplejson.dumps(res)
                    return HttpResponse(response, status=200, mimetype='application/json')
            else:
                try:
                    if category_details['parent_id'] != '': 
                        parent = Category.objects.get(id=category_details['parent_id'])
                        category = Category.objects.get(name=category_details['name'], parent=parent)
                    else:
                        category = Category.objects.get(name=category_details['name'])
                    res = {
                        'result': 'error',
                        'message': 'Category name already exists',
                    }
                except Exception as ex:
                    
                    category = Category()
                    category_obj = category.set_attributes(category_details)
                    res = {
                        'result': 'ok',
                        'message': 'ok',
                        'new_category': category.get_json_data()
                    }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')

class CategorySubcategoryList(View):

    def get(self, request, *args, **kwargs):

        category_id = kwargs['category_id']
        category = Category.objects.get(id=category_id)
        ctx_category_details = []
        ctx_subcategory = []
        subcategories = Category.objects.filter(parent=category)
        for subcatrgory in subcategories:
            ctx_subcategory.append(subcatrgory.get_json_data())
        category_data = category.get_json_data()
        category_data['subcategories'] = ctx_subcategory
        ctx_category_details.append(category_data)
        res = {
            'result': 'ok',
            'subcategories': ctx_subcategory,
            'category_details': ctx_category_details
        }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

class ItemList(View):

    def get(self, request, *args, **kwargs):       
        if request.is_ajax():
            items_list = []
            items = Item.objects.all()
            for item in items:
                item_data = item.get_json_data()                
                items_list.append(item_data)
            res = {
                'result': 'ok',
                'items': items_list,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'item_list.html', {})   

class AddItem(View):

    def get(self, request, *args, **kwargs):

        return render(request, 'add_inventory_item.html', {})

    def post(self, request, *args, **kwargs):

        item_details = ast.literal_eval(request.POST['item'])
        if item_details.get('id', ''):
            item = Item.objects.get(id=item_details['id'])
            item_obj = item.set_attributes(item_details)
        else:
            item = Item()
            item_obj = item.set_attributes(item_details)
        item_data = item_obj.get_json_data()
        res = {
            'result': 'ok',
            'item': item_data,
        }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

class DeleteItem(View):

    def get(self, request, *args, **kwargs):
        item_id = request.GET.get('item_id', '')
        item = Item.objects.get(id=item_id)
        if item.batchitem_set.all().count() == 0:
            item.delete()   
        return HttpResponseRedirect(reverse('items'))

class SearchItem(View):

    def get(self, request, *args, **kwargs):
        items_list = []
        try:
            item_code = request.GET.get('item_code', '')
            item_name = request.GET.get('item_name', '')
            brand = request.GET.get('brand', '')
            batch = request.GET.get('batch', '')
            product = request.GET.get('product', '')
            if brand == 'undefined':
                brand = ''
            if product == 'undefined':
                product = ''
            items = []
            if item_code:
                items = Item.objects.filter(code__istartswith=item_code, brand__id=brand, product__id=product)
            elif item_name:
                if brand and product:
                    items = Item.objects.filter(name__istartswith=item_name, brand__id=brand, product__id=product)
                else:
                    items = Item.objects.filter(name__istartswith=item_name)

            for item in items:
                purchase_price = 0
                quantity_in_purchase_unit = 0
                quantity_in_smallest_unit = 0
                purchase_price = 0
                cost_price = 0
                uom = ''
                item_name = ''
                batch_name = ''
                wholesale_profit = 0
                retail_profit = 0
                wholesale_price = 0
                retail_price = 0
                branch_price = 0
                customer_card_price = 0
                permissible_discount = 0
                stock = 0
                is_cost_price_existing = 'false'
                is_wholesale_profit = 'false'
                is_retail_profit = 'false'
                is_branch_price = 'false'
                is_customer_card_price = 'false'
                is_permissible_discount = 'false'
                print batch
                try:
                    if batch and batch != 'undefined':
                        batch_item = BatchItem.objects.get(item=item, batch__id=batch)

                        purchase_price = batch_item.purchase_price
                        quantity_in_purchase_unit = batch_item.quantity_in_actual_unit
                       
                        cost_price = batch_item.cost_price
                        uom = batch_item.uom
                        item_name = batch_item.item.name
                        batch_name = batch_item.batch.name
                        wholesale_profit = batch_item.whole_sale_profit_percentage
                        retail_profit = batch_item.retail_profit_percentage
                        wholesale_price = batch_item.whole_sale_price
                        retail_price = batch_item.retail_price
                        branch_price = batch_item.branch_price
                        customer_card_price = batch_item.customer_card_price
                        permissible_discount = batch_item.permissible_discount_percentage
                        is_cost_price_existing = 'true' if batch_item.cost_price else 'false',
                        is_wholesale_profit = 'true' if batch_item.whole_sale_profit_percentage else 'false',
                        is_retail_profit = 'true' if batch_item.retail_profit_percentage else 'false',
                        is_branch_price = 'true' if batch_item.branch_price else 'false',
                        is_customer_card_price =  'true' if batch_item.customer_card_price else 'false',
                        is_permissible_discount =  'true' if batch_item.permissible_discount_percentage else 'false',
                        
                    else:
                        purchase_price = 0
                        selling_price = 0
                        stock = 0
                except Exception as ex:
                    purchase_price = 0
                    quantity_in_purchase_unit = 0
                    quantity_in_smallest_unit = 0
                    purchase_price = 0
                    cost_price = 0
                    uom = ''
                    item_name = ''
                    batch_name = ''
                    wholesale_profit = 0
                    retail_profit = 0
                    wholesale_price = 0
                    retail_price = 0
                    branch_price = 0
                    customer_card_price = 0
                    permissible_discount = 0
                    stock = 0
                    is_cost_price_existing = 'false'
                    is_wholesale_profit = 'false'
                    is_retail_profit = 'false'
                    is_branch_price = 'false'
                    is_customer_card_price = 'false'
                    is_permissible_discount = 'false'
                item_data = item.get_json_data()
                item_data['purchase_price'] = purchase_price
                item_data['quantity_in_purchase_unit'] = quantity_in_purchase_unit
                item_data['purchase_price'] = purchase_price
                item_data['cost_price'] = cost_price
                item_data['uom'] = uom
                item_data['item_name'] = item_name
                item_data['batch_name'] = batch_name
                item_data['wholesale_profit'] = wholesale_profit
                item_data['retail_profit'] = retail_profit
                item_data['wholesale_price'] = wholesale_price
                item_data['retail_price'] = retail_price
                item_data['branch_price'] = branch_price
                item_data['customer_card_price'] = customer_card_price
                item_data['permissible_discount'] = permissible_discount
                item_data['is_cost_price_existing'] = is_cost_price_existing
                item_data['is_wholesale_profit'] = is_wholesale_profit
                item_data['is_retail_profit'] = is_retail_profit
                item_data['is_branch_price'] = is_branch_price
                item_data['is_customer_card_price'] = is_customer_card_price
                item_data['is_permissible_discount'] = is_permissible_discount
                items_list.append(item_data)                           
            res = {
                'result': 'ok',
                'items': items_list,
            }
        except Exception as ex:
            res = {
                'result': 'error',
                'error_message': str(ex),
            }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

class ItemUom(View):

    def get(self, request, *args, **kwargs):

        if request.is_ajax():
            item_id = request.GET.get('item')
            item = Item.objects.get(id=item_id)
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
            for uom in uom_list:
                if uom['uom'] == 'Kg':
                    uom_list.append({
                        'uom': 'gm',
                    })
                    uom_list.append({
                        'uom': 'mg',
                    })
                elif uom['uom'] == 'Metre':
                    uom_list.append({
                        'uom': 'cm',
                    })
                    uom_list.append({
                        'uom': 'mm',
                    })
                elif uom['uom'] == 'litre':
                    uom_list.append({
                        'uom': 'ml',
                    })
            res = {
                'uoms': uom_list,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')        

class UOMConversionView(View):

    def get(self, request, *args, **kwargs):
        if request.is_ajax():
            uom_list = settings.UOM
            res = {
                'result': 'ok',
                'uoms': uom_list,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')


class SearchProduct(View):

    def get(self, request, *args, **kwargs):
        name = request.GET.get('product_name', '')
        product_list = []
        category_id = request.GET.get('category_id', '')
        try:
            category = Category.objects.get(id=category_id)
            products = Product.objects.filter(name__istartswith=name, category=category)
        except:
            products = Product.objects.filter(name__istartswith=name)
        for product in products:
            product_list.append({
                'id': product.id,
                'name': product.name,
                'category_name': product.category.name,
            })
        res = {
            'result': 'ok',
            'products': product_list,
        }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')


class SearchBrand(View):

    def get(self, request, *args, **kwargs):
        name = request.GET.get('brand_name', '')
        brand_list = []
        brand_names = Brand.objects.filter(name__istartswith=name)
        for brand in brand_names:
            brand_list.append({
                'id': brand.id,
                'name': brand.name,
            })
        res = {
            'result': 'ok',
            'brand_list': brand_list,
        }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')        


class SearchVat(View):

    def get(self, request, *args, **kwargs):

        vat_type = request.GET.get('vat_type', '')
        vats = VatType.objects.filter(vat_type__istartswith=vat_type)
        vat_list = []
        for vat in vats:
            vat_list.append({
                'id': vat.id,
                'vat_type': vat.vat_type,
                'vat_percentage': vat.tax_percentage,
                'tax_percentage': vat.tax_percentage,
                'name': vat.vat_type,
                'vat_name': str(vat.vat_type)+ str(' - ') + str(vat.tax_percentage),
            })
        res = {
            'result': 'ok',
            'vat_list': vat_list,
        }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')


class DeleteCategory(View):

    def get(self, request, *args, **kwargs):

        category_id = request.GET.get('category_id', '')
        category = Category.objects.get(id=category_id)
        if category.product_set.all().count() == 0:
            category.delete()
        return HttpResponseRedirect(reverse('categories'))


class Products(View):

    def get(self, request, *args, **kwargs):
        products = Product.objects.all().order_by('name')
        product_list = []
        for product in products:
            product_list.append(product.get_json_data())
        if request.is_ajax():
            res = {
                'products': product_list,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'products.html', {})

class AddProduct(View):

    def get(self, request, *args, **kwargs):

        product_id = ''
        if request.GET.get('product_id', ''):
            product = Product.objects.get(id=request.GET.get('product_id', ''))
            product_id = product.id
        if request.is_ajax():
            res = {
                'product': product.get_json_data()
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'add_product.html', {'product_id': product_id})

    def post(self, request, *args, **kwargs):

        if request.is_ajax():
            product_details = ast.literal_eval(request.POST['product'])
            if product_details.get('id', ''):
                products = Product.objects.filter(name=product_details['name'], category__id=product_details['category_id']).exclude(id=product_details.get('id', ''))
                if products.count() > 0:
                    res = {
                        'result': 'error',
                        'message': 'Product name already exists',
                    }
                else:
                    product = Product.objects.get(id=product_details.get('id', ''))
                    product_obj = product.set_attributes(product_details)
                    res = {
                        'result': 'ok',
                    }
            else:
                try:
                    if product_details.get('category_id', ''):
                        product = Product.objects.get(name=product_details['name'], category__id=product_details['category_id'])
                    else:
                        category = Category.objects.get(name=product_details['new_category_name'])
                        product = Product.objects.get(name=product_details['name'], category=category)
                    res = {
                        'result': 'error',
                        'message': 'Product name already exists',
                    }
                except:
                    product = Product()
                    product_obj = product.set_attributes(product_details)
                    res = {
                        'result': 'ok',
                        'product': product.get_json_data(),
                    }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')

class EditProduct(View):

    def get(self, request, *args, **kwargs):
        product_id = ''
        if request.GET.get('product_id', ''):
            product = Product.objects.get(id=request.GET.get('product_id', ''))
            product_id = product.id
        if request.is_ajax():
            res = {
                'product': product.get_json_data()
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'add_product.html', {'product_id': product_id})

class DeleteProduct(View):

    def get(self, request, *args, **kwargs):
        product = Product.objects.get(id=request.GET.get('product_id', ''))
        if product.item_set.all().count() == 0:
            product.delete()
        return HttpResponseRedirect(reverse('products'))

class Brands(View):

    def get(self, request, *args, **kwargs):

        brands = Brand.objects.all()
        if request.is_ajax():
            brand_list = []
            for brand in brands:
                brand_list.append(brand.get_json_data())
            res = {
                'brands': brand_list,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'brands.html', {})

class AddBrand(View):

    def get(self, request, *args, **kwargs):

        brand_id = request.GET.get('brand_id', '')
        if request.GET.get('brand_id', '') and request.is_ajax():
            brand = Brand.objects.get(id=request.GET.get('brand_id', ''))
            res = {
                'brand': brand.get_json_data(),
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'add_brand.html', {'brand_id': brand_id})

    def post(self, request, *args, **kwargs):

        if request.is_ajax():
            brand_details = ast.literal_eval(request.POST['brand'])
            if brand_details.get('id', ''):
                brands = Brand.objects.filter(name=brand_details['name']).exclude(id=brand_details['id'])
                if brands.count() == 0:
                    brand = Brand.objects.get(id=brand_details['id'])
                    brand_obj = brand.set_attributes(brand_details)
                    res = {
                        'result': 'ok',
                    }
                else:
                    res = {
                        'result': 'error',
                        'message': 'Brand name already exists',
                    }
            else:
                brands = Brand.objects.filter(name=brand_details['name'])
                if brands.count() > 0:
                    res = {
                        'result': 'error',
                        'message': 'Brand name already exists',
                    }  
                else:
                    brand = Brand()
                    brand_obj = brand.set_attributes(brand_details)
                    res = {
                        'result': 'ok',
                        'brand': brand.get_json_data()
                    }    
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'add_brand.html', {})

class EditBrand(View):

    def get(self, request, *args, **kwargs):

        brand_id = request.GET.get('brand_id', '')
        if request.GET.get('brand_id', '') and request.is_ajax():
            brand = Brand.objects.get(id=request.GET.get('brand_id', ''))
            res = {
                'brand': brand.get_json_data(),
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'add_brand.html', {'brand_id': brand_id})

class DeleteBrand(View):

    def get(self, request, *args, **kwargs):
        brand_id = request.GET.get('brand_id', '')
        brand = Brand.objects.get(id=brand_id)
        if brand.item_set.all().count() == 0:
            brand.delete()
        else:
           return render(request, 'brands.html', {'msg': str(brand.name) + "can't be deleted"  })
        return HttpResponseRedirect(reverse('brands'))

class VatList(View):

    def get(self, request, *args, **kwargs):

        vat_list = VatType.objects.all()
        if request.is_ajax():
            vat_data = []
            for vat in vat_list:
                vat_data.append(vat.get_json_data())
            res = {
                'vat_list': vat_data
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'vat_list.html', {})

class AddVat(View):

    def get(self, request, *args, **kwargs):
        vat_id = request.GET.get('vat_id', '')
        if request.is_ajax():
            vat = VatType.objects.get(id=vat_id)
            res = {
                'vat': vat.get_json_data()
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'add_vat.html', {'vat_id': vat_id})

    def post(self, request, *args, **kwargs):

        vat_details = ast.literal_eval(request.POST['vat'])
        
        if vat_details.get('id',''):
            vats = VatType.objects.filter(vat_type=vat_details['name'] ,tax_percentage=vat_details['percentage']).exclude(id=vat_details['id'])
            if vats.count() > 0:
                res = {
                    'result': 'error',
                    'message': 'vat already exists',
                } 
            else:
                vat = VatType.objects.get(id=vat_details['id'])
                vat_obj = vat.set_attributes(vat_details)
                res = {
                    'result': 'ok',
                }
        else:
            try:
                vat = VatType.objects.get(vat_type=vat_details['name'] ,tax_percentage=vat_details['percentage'])
                res = {
                    'result': 'error',
                    'message': 'vat already exists',
                }   
            except Exception as ex:
                vat = VatType()
                vat_obj = vat.set_attributes(vat_details)
                res = {
                    'result': 'ok',
                    'vat': vat.get_json_data(),
                }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

class EditVat(View):

    def get(self, request, *args, **kwargs):
        vat_id = request.GET.get('vat_id', '')
        if request.is_ajax():
            vat = VatType.objects.get(id=vat_id)
            res = {
                'vat': vat.get_json_data()
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'add_vat.html', {'vat_id': vat_id})

class DeleteVat(View):

    def get(self, request, *args, **kwargs):

        vat_id = request.GET.get('vat_id', '')
        vat = VatType.objects.get(id=vat_id)
        if vat.item_set.all().count() == 0:
            vat.delete()
        return HttpResponseRedirect(reverse('vat'))


class OpeningStockView(View):

    def get(self, request, *args, **kwargs):

        return render(request, 'opening_stock.html', {})

    def post(self, request, *args, **kwargs):

        total_purchase_price = 0
        if request.is_ajax():
            opening_stock_items = ast.literal_eval(request.POST['opening_stock_items'])
            if opening_stock_items:
                cash_ledger = Ledger.objects.get(account_code='1005')
                stock_ledger = Ledger.objects.get(account_code='1006')
                transaction = Transaction()
                try:
                    transaction_ref = Transaction.objects.latest('id').id + 1
                except:
                    transaction_ref = '1'
              
                transaction.transaction_ref = 'OPSTK' + str(transaction_ref)
                
                try:
                    opening_stock = OpeningStock.objects.create(transaction_reference_no=transaction.transaction_ref, date=datetime.now() )
                    for item_detail in opening_stock_items:
                        try:
                            uom =  item_detail['purchase_unit']
                            purchase_unit = uom['uom']
                        except:
                            purchase_unit = item_detail['purchase_unit']
                        item = Item.objects.get(id=item_detail['id'])
                        batch = Batch.objects.get(id=item_detail['batch'])
                        batch_item, batch_item_created = BatchItem.objects.get_or_create(item=item,batch=batch)
                        try:
                            opening_stock_item = OpeningStockItem.objects.get(opening_stock=opening_stock,batch_item=batch_item)
                        except:
                            opening_stock_item = OpeningStockItem.objects.create(opening_stock=opening_stock,batch_item=batch_item)
                        opening_stock_item.quantity = item_detail['quantity']
                        opening_stock_item.purchase_price = item_detail['purchase_price']
                        opening_stock_item.net_amount = item_detail['net_amount']
                        opening_stock_item.uom = purchase_unit
                        opening_stock_item.save()
                        quantity = 0
                        selling_price = 0
                        purchase_price = 0                       
                        if item.smallest_unit == purchase_unit:
                            quantity = item_detail['quantity']
                        else:
                            quantity = float(item_detail['quantity'])
                        batch_item.set_quantity(item_detail['quantity'], purchase_unit)
                        batch_item.cost_price = item_detail['purchase_price']

                        if batch_item_created:
                            batch_item.purchase_price = item_detail['purchase_price']
                            batch_item.uom = purchase_unit
                        total_purchase_price = float(total_purchase_price) + float(item_detail['net_amount'])
                        batch_item.save()
                except Exception as ex:
                    res = {
                        'result': 'error',
                        'error_message': str(ex),
                    }
                    response = simplejson.dumps(res)
                    return HttpResponse(response, status=200, mimetype='application/json')

                ledger_entry_cash_ledger = LedgerEntry()
                ledger_entry_cash_ledger.ledger = cash_ledger
                ledger_entry_cash_ledger.credit_amount = total_purchase_price
                ledger_entry_cash_ledger.date = datetime.now()
                ledger_entry_cash_ledger.transaction_reference_number = transaction.transaction_ref
                ledger_entry_cash_ledger.save()
                ledger_entry_stock_ledger = LedgerEntry()
                ledger_entry_stock_ledger.ledger = stock_ledger
                ledger_entry_stock_ledger.debit_amount = total_purchase_price
                ledger_entry_stock_ledger.date = datetime.now()
                ledger_entry_stock_ledger.transaction_reference_number = transaction.transaction_ref 
                ledger_entry_stock_ledger.save()
                try:
                    stock_value = StockValue.objects.latest('id')
                except Exception as ex:
                    stock_value = StockValue()
                if stock_value.stock_by_value is not None:
                    stock_value.stock_by_value = float(stock_value.stock_by_value) + float(total_purchase_price)
                else:
                    stock_value.stock_by_value = float(total_purchase_price)
                stock_value.save()
                try:
                    opening_stock_value = OpeningStockValue.objects.latest('id')
                except Exception as ex:
                    opening_stock_value = OpeningStockValue()
                if opening_stock_value.stock_by_value is not None:
                    opening_stock_value.stock_by_value = float(opening_stock_value.stock_by_value) + float(total_purchase_price)
                else:
                    opening_stock_value.stock_by_value = float(total_purchase_price)
                opening_stock_value.save()
                transaction.narration = 'By Opening Stock - '+ str(transaction.transaction_ref )
                transaction.debit_amount = total_purchase_price
                transaction.credit_amount = total_purchase_price
                transaction.credit_ledger = ledger_entry_cash_ledger
                transaction.debit_ledger = ledger_entry_stock_ledger
                transaction.transaction_date = datetime.now()
                transaction.amount = total_purchase_price
                cash_ledger.balance = float(cash_ledger.balance) - float(total_purchase_price)
                stock_ledger.balance = float(stock_ledger.balance) + float(total_purchase_price)
                cash_ledger.save()
                stock_ledger.save()
                transaction.save()
            res = {
                'result': 'ok',
                'transaction_reference_no': transaction.transaction_ref
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')

class BatchItemDetailsView(View):

    def get(self, request, *args, **kwargs):

        batch_id = request.GET.get('batch_id', '')
        item_id = request.GET.get('item_id', '')
        try:
            batch_item = BatchItem.objects.get(batch__id=batch_id, item__id=item_id)
            res = {
                'result': 'ok',
                'batch_item': batch_item.get_json_data()
            }
        except Exception as ex:
            print ex
            res = {
                'result': 'error',
                'batch_item': {}
            }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

class SearchItemStock(View):
    def get(self, request, *args, **kwargs):
        try:
            item_name = request.GET.get('item_name', '')
            item_dict = []
            if item_name:
                items = Item.objects.filter(name__istartswith=item_name)
            for item in items:
                batch_items = item.batchitem_set.all()
                for batch_item in batch_items:
                    b_item = batch_item.get_json_data()
                    item_dict.append({
                        'id': item.id,
                        'name': item.name,
                        'item_name': str(item.name),
                        'category': item.product.category.name,
                        'code': item.code,
                        'product_name': item.product.name,
                        'brand_name': item.brand.name,                  
                        'stock': b_item["stock"],
                        'batch': batch_item.batch.name,
                        'uom': b_item["stock_unit"],
                        'size': item.size
                    })  
            res = {
                'result': 'ok',
                'items': item_dict,
            }
        except Exception as ex:
            res = {
                'result': 'error',
                'error_message': str(ex),
            }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

class BatchItemsView(View):

    def get(self, request, *args, **kwargs):
        batch_id = request.GET.get('batch_id', '')
        batch_item_list = []
        try:
            batch_items = BatchItem.objects.filter(batch__id=batch_id)
            for item in batch_items:
                batch_item_list.append(item.get_json_data())
            res = {
                'result': 'ok',
                'batch_items': batch_item_list,
            }
        except Exception as ex:
            print str(ex)
            res = {
                'result': 'error',
                'batch_items': []
            }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

class IsCategoryNameExists(View):

    def get(self, request, *args, **kwargs):

        if request.GET.get('name', ''):
            categories = Category.objects.filter(name=request.GET.get('name', ''))
            if categories.count() > 0:
                res = {
                    'result': 'error',
                    'message': 'Category with this name already exists',
                }
            else:
                res = {
                    'result': 'ok',
                }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')

class StockReport(View):

    def get(self, request, *args, **kwargs):
        items = Item.objects.all()
        item_list = []
        for item in items:
            quantity = 0
            batch_items = BatchItem.objects.filter(item=item)
            #batch_items =batch.get_json_data()
            for batch_item in batch_items:
                is_batch_item = True
                batch = batch_item.get_json_data()
                #quantity = float(quantity) + float(batch.stock)
                #item_list.append({
                    #'item_name': item.name,
                   # 'batch_name': batch_item.batch.name,
                    #'stock': batch.stock,
                    #'uom': batch_item.uom,
               # })
                item_list.append(batch)
        if request.is_ajax():
            res = {
                'result': 'ok',
                'stocks_report': item_list,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        elif request.GET.get('pdf', ''):
            current_date = datetime.now().strftime('%d-%m-%Y')
            style = [
                ('FONTNAME',(0,0),(-1,-1),'Helvetica') 
            ]
            response = HttpResponse(content_type='application/pdf')
            p = SimpleDocTemplate(response, pagesize=A4)
            elements = []
            d = [['Stock Report'+' '+str(current_date)]]
            t = Table(d, colWidths=(450), rowHeights=25, style=style)
            t.setStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),
                        ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                        ('FONTSIZE', (0,0), (-1,-1), 12),
                        ])   
            elements.append(t)
            data = []
            para_style = ParagraphStyle('fancy')
            para_style.fontSize = 10
            para_style.fontName = 'Helvetica'
            data.append(['Item', 'Batch', 'Stock', 'UOM'])
            table = Table(data, colWidths=(150, 150, 100, 80), style=style)
            table.setStyle([
                        ('FONTSIZE', (0,0), (-1,0), 11),
                        ])  
            elements.append(table)
            elements.append(Spacer(1,.1*cm ))
            data = []
            for item_data in item_list:
                item_name = Paragraph(item_data['item_name'], para_style)
                batch_name = Paragraph(item_data['batch_name'], para_style)
                data.append([item_name, batch_name, item_data['stock'], item_data['uom']])
            if len(data) > 0:
                table = Table(data, colWidths=(150, 150, 100, 80), style=style)
                elements.append(table)
            p.build(elements)  
            return response 
        return render(request, 'stock_report.html', {})

class StockAgingReport(View):

    def get(self, request, *args, **kwargs):
        if request.GET.get('batch', ''):
            stock_items = []
            
            current_month = datetime.now().month
            current_year = datetime.now().year
            ctx_months = []
            fields = ['Rcvd', 'Sold']
            for i in range(1,current_month + 1):
                ctx_months.append({
                    'name' : calendar.month_name[i][:3],
                    'fields': fields,
                })
            batch = Batch.objects.get(id=request.GET.get('batch', ''))
            for batch_item in batch.batchitem_set.all():
                ctx_month_details = []
                for i in range(1,current_month + 1):
                    month_name = calendar.month_name[i][:3]
                    month_details = []
                    opening_stock = OpeningStock.objects.filter(date__month=i, date__year=current_year)
                    purchases = Purchase.objects.filter(purchase_invoice_date__month=i, purchase_invoice_date__year=current_year)
                    sales = Sale.objects.filter(sales_invoice_date__month=i, sales_invoice_date__year=current_year)
                    p_quantity = 0
                    s_quantity = 0
                    opening_stock_quantity = 0
                    for stock in opening_stock:
                        for o_item in stock.openingstockitem_set.filter(batch_item=batch_item):
                            opening_stock_quantity = float(o_item.quantity) + float(opening_stock_quantity)
                    for purchase in purchases:
                        for p_item in purchase.purchaseitem_set.filter(batch_item=batch_item):
                            p_quantity = float(p_item.quantity) + float(p_quantity)
                    for sale in sales:
                        for s_item in sale.salesitem_set.filter(batch_item=batch_item):
                            quantity = float(s_item.quantity)
                            s_quantity = float(quantity) + float(s_quantity)
                    fields = [p_quantity + opening_stock_quantity, s_quantity]
                    ctx_month_details.append({
                        'name': month_name,
                        'fields' : fields
                    })
                stock_items.append({
                   'item_name' : batch_item.item.name,
                   'month_details': ctx_month_details,
                })
                ctx_month_details = []
            res = {
                'stock': stock_items,
                'months': ctx_months,
                'result': 'ok'
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        else:
            return render(request, 'stock_aging_report.html', {})


class CategoryWiseStockReport(View):

    def get(self, request, *args, **kwargs):
        if request.GET.get('category_id', ''):
            category = Category.objects.get(id=request.GET.get('category_id', ''))
            item_list = []
            batch_items = BatchItem.objects.filter(item__product__category=category)
            quantity = 0
            for batch_item in batch_items:
                is_batch_item = True
                #quantity = float(quantity) + float(batch_item.quantity_in_purchase_unit)
                batch = batch_item.get_json_data()
                #item_list.append({
                 #   'item_name': batch_item.item.name,
                  #  'product': batch_item.item.product.name if batch_item.item.product else '',
                   # 'batch_name': batch_item.batch.name,
                    #'stock': batch_item.quantity_in_purchase_unit,
                    #'uom': batch_item.uom,
                #})
                item_list.append(batch)
            if request.is_ajax():
                res = {
                    'result': 'ok',
                    'stock_details': item_list
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
            else:
                style = [
                    ('FONTNAME',(0,0),(-1,-1),'Helvetica') 
                ]
                response = HttpResponse(content_type='application/pdf')
                p = SimpleDocTemplate(response, pagesize=A4)
                elements = []
                d = [['Category Wise Stock Report - '+category.name]]
                t = Table(d, colWidths=(450), rowHeights=25, style=style)
                t.setStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),
                            ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                            ('FONTSIZE', (0,0), (-1,-1), 12),
                            ])   
                elements.append(t)
                data = []
                
                para_style = ParagraphStyle('fancy')
                para_style.fontSize = 10
                para_style.fontName = 'Helvetica'
                data.append(['Item', 'Batch', 'Stock', 'UOM'])
                table = Table(data, colWidths=(130, 130, 90, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,0), 11),
                            ])  
                elements.append(table)
                elements.append(Spacer(1,.1*cm ))
                data = []
                for item_data in item_list:
                    item_name = Paragraph(item_data['item_name'], para_style)
                    batch_name = Paragraph(item_data['batch_name'], para_style)
                    #product = Paragraph(item_data['product'], para_style)
                    #data.append([item_name, product, batch_name, item_data['stock'], item_data['uom']])
                    data.append([item_name,batch_name,item_data['stock'], item_data['stock_unit']])
                if len(data) > 0:
                    table = Table(data, colWidths=(130, 130, 90, 80), style=style)
                    elements.append(table)
                p.build(elements)  
                return response 
        return render(request, 'category_wise_stock_report.html', {})

class CategoryWiseStockAgingReport(View):

    def get(self, request, *args, **kwargs):
        if request.GET.get('category_id', ''):
            stock_items = []
            
            current_month = datetime.now().month
            current_year = datetime.now().year
            ctx_months = []
            fields = ['Rcvd', 'Sold']
            for i in range(1,current_month + 1):
                ctx_months.append({
                    'name' : calendar.month_name[i][:3],
                    'fields': fields,
                })
            category = Category.objects.get(id=request.GET.get('category_id', ''))
            batch_items = BatchItem.objects.filter(item__product__category=category)
            for batch_item in batch_items:
                ctx_month_details = []
                for i in range(1,current_month + 1):
                    month_name = calendar.month_name[i][:3]
                    month_details = []
                    opening_stock = OpeningStock.objects.filter(date__month=i, date__year=current_year)
                    purchases = Purchase.objects.filter(purchase_invoice_date__month=i, purchase_invoice_date__year=current_year)
                    sales = Sale.objects.filter(sales_invoice_date__month=i, sales_invoice_date__year=current_year)
                    p_quantity = 0
                    s_quantity = 0
                    opening_stock_quantity = 0
                    for stock in opening_stock:
                        for o_item in stock.openingstockitem_set.filter(batch_item=batch_item):
                            opening_stock_quantity = float(o_item.quantity) + float(opening_stock_quantity)
                    for purchase in purchases:
                        for p_item in purchase.purchaseitem_set.filter(batch_item=batch_item):
                            p_quantity = float(p_item.quantity) + float(p_quantity)
                    for sale in sales:
                        for s_item in sale.salesitem_set.filter(batch_item=batch_item):
                            quantity = float(s_item.quantity)
                            s_quantity = float(quantity) + float(s_quantity)
                    fields = [p_quantity + opening_stock_quantity, s_quantity]
                    ctx_month_details.append({
                        'name': month_name,
                        'fields' : fields
                    })
                stock_items.append({
                   'item_name' : batch_item.item.name,
                   'month_details': ctx_month_details,
                })
                ctx_month_details = []
            res = {
                'stock': stock_items,
                'months': ctx_months,
                'result': 'ok'
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        else:
            return render(request, 'category_stock_aging_report.html', {})

class CategoryWisePurchaseReport(View):

    def get(self, request, *args, **kwargs):
        if request.GET.get('category_id', ''):
            category = Category.objects.get(id=request.GET.get('category_id', ''))
            item_list = []
            purchase_items = PurchaseItem.objects.filter(batch_item__item__product__category=category)
            for p_item in purchase_items:
                is_purchase_item = True
                item_list.append({
                    'item_name': p_item.batch_item.item.name,
                    'product': p_item.batch_item.item.product.name if p_item.batch_item.item.product else '',
                    'batch_name': p_item.batch_item.batch.name,
                    'invoice': p_item.purchase.purchase_invoice_number,
                    'quantity': p_item.quantity,
                    'stock': p_item.batch_item.quantity_in_purchase_unit,
                    'uom': p_item.batch_item.uom,
                })
            if request.is_ajax():
                res = {
                    'result': 'ok',
                    'stock_details': item_list
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
            else:
                style = [
                    ('FONTNAME',(0,0),(-1,-1),'Helvetica') 
                ]
                response = HttpResponse(content_type='application/pdf')
                p = SimpleDocTemplate(response, pagesize=A4)
                elements = []
                d = [['Category Wise Purchase Report - '+category.name]]
                t = Table(d, colWidths=(450), rowHeights=25, style=style)
                t.setStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),
                            ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                            ('FONTSIZE', (0,0), (-1,-1), 12),
                            ])   
                elements.append(t)
                data = []
                para_style = ParagraphStyle('fancy')
                para_style.fontSize = 10
                para_style.fontName = 'Helvetica'
                data.append(['Item', 'Product', 'Invoice', 'Batch', 'Quantity Purchased', 'UOM'])
                table = Table(data, colWidths=(100, 90, 90, 100, 100, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,0), 11),
                            ])  
                elements.append(table)
                elements.append(Spacer(1,.1*cm ))
                data = []
                for item_data in item_list:
                    item_name = Paragraph(item_data['item_name'], para_style)
                    batch_name = Paragraph(item_data['batch_name'], para_style)
                    product = Paragraph(item_data['product'], para_style)
                    data.append([item_name, product, item_data['invoice'], batch_name, item_data['quantity'], item_data['uom']])
                if len(data) > 0:
                    table = Table(data, colWidths=(100, 90, 90, 100, 100, 80), style=style)
                    elements.append(table)
                p.build(elements)  
                return response 
        return render(request, 'category_purchase_report.html', {})

class CategoryWiseVendorReport(View):
    def get(self, request, *args, **kwargs):
        if request.GET.get('category_id', ''):
            category = Category.objects.get(id=request.GET.get('category_id', ''))
            item_list = []
            suppliers = Supplier.objects.all()
            for supplier in suppliers:
                purchase_items = PurchaseItem.objects.filter(batch_item__item__product__category=category, purchase__supplier=supplier)
                for p_item in purchase_items:
                    print p_item
                    is_purchase_item = True
                    item_list.append({
                        'supplier_name':supplier.name,
                        'item_name': p_item.batch_item.item.name,
                        'product': p_item.batch_item.item.product.name if p_item.batch_item.item.product else '',
                        'batch_name': p_item.batch_item.batch.name,
                        'invoice': p_item.purchase.purchase_invoice_number,
                        'quantity': p_item.quantity,
                        'stock': p_item.batch_item.quantity_in_purchase_unit,
                        'uom': p_item.batch_item.uom,
                        })
            if request.is_ajax():
                res = {
                    'result': 'ok',
                    'stock_details': item_list
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
            else:
                style = [
                    ('FONTNAME',(0,0),(-1,-1),'Helvetica') 
                ]
                response = HttpResponse(content_type='application/pdf')
                p = SimpleDocTemplate(response, pagesize=A4)
                elements = []
                d = [['Category Wise Vendor Report - '+category.name]]
                t = Table(d, colWidths=(450), rowHeights=25, style=style)
                t.setStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),
                            ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                            ('FONTSIZE', (0,0), (-1,-1), 12),
                            ])   
                elements.append(t)
                data = []
                para_style = ParagraphStyle('fancy')
                para_style.fontSize = 10
                para_style.fontName = 'Helvetica'
                data.append(['SupplierName', 'Item', 'Product', 'Invoice', 'Batch', 'Quantity Purchased', 'UOM'])
                table = Table(data, colWidths=(80,50, 90, 90, 80, 100, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,0), 11),
                            ])  
                elements.append(table)
                elements.append(Spacer(1,.1*cm ))
                data = []
                for item_data in item_list:
                    supplier_name = Paragraph(item_data['supplier_name'], para_style)
                    item_name = Paragraph(item_data['item_name'], para_style)
                    batch_name = Paragraph(item_data['batch_name'], para_style)
                    product = Paragraph(item_data['product'], para_style)
                    data.append([supplier_name,item_name, product, item_data['invoice'], batch_name, item_data['quantity'], item_data['uom']])
                if len(data) > 0:
                    table = Table(data, colWidths=(80,50, 90, 90, 80, 100, 80), style=style)
                    elements.append(table)
                p.build(elements)  
                return response 
        return render(request, 'category_wise_vendor_report.html', {})



class AddMultipleProducts(View):

    def get(self, request, *args, **kwargs):

        return render(request, 'add_bulk_products.html', {})

    def post(self, request, *args, **kwargs):

        if request.is_ajax():
            product_data = ast.literal_eval(request.POST['products'])
            for product_detail in product_data:
                if product_detail['category_id']:
                    category =Category.objects.get(id=product_detail['category_id'])
                    product, created = Product.objects.get_or_create(name=product_detail['name'],category=category)
            res = {
                'result': 'ok', 
            } 
            response = simplejson.dumps(res) 
            return HttpResponse(response, status=200, mimetype='application/json')

class AddMultipleBrand(View):

    def get(self, request, *args, **kwargs):

        return render(request, 'add_bulk_brand.html', {})

    def post(self, request, *args, **kwargs):

        if request.is_ajax():
            brand_data = ast.literal_eval(request.POST['brands'])
            for brand_detail in brand_data:
                brand, created = Brand.objects.get_or_create(name=brand_detail['name'])
            res = {
                'result': 'ok', 
            } 
            response = simplejson.dumps(res) 
            return HttpResponse(response, status=200, mimetype='application/json')

class AddMultipleVat(View):

    def get(self, request, *args, **kwargs):

        return render(request, 'add_bulk_vat.html', {})

    def post(self, request, *args, **kwargs):

        if request.is_ajax():
            vat_data = ast.literal_eval(request.POST['vats'])
            for vat_detail in vat_data:
                if vat_detail['vat_type'] != '':
                    vat, created = VatType.objects.get_or_create(vat_type=vat_detail['vat_type'],tax_percentage=vat_detail['tax_percentage'])
            res = {
                'result': 'ok', 
            } 
            response = simplejson.dumps(res) 
            return HttpResponse(response, status=200, mimetype='application/json')

class CategoryWiseProfitReport(View):

    def get(self, request, *args, **kwargs):
        category_id = request.GET.get('category_id', '')
        profit_details = []
        if category_id:
            category = Category.objects.get(id=category_id)
            batch_items = BatchItem.objects.filter(item__product__category=category)
            for batch_item in batch_items:
                purchase_total = 0
                purchased_qty = 0
                sold_qty = 0
                sold_amt = 0
                if batch_item.cost_price > 0:
                    purchase_items = batch_item.purchaseitem_set.all()
                    sales_items = batch_item.salesitem_set.all()
                    for purchase_item in purchase_items:
                        purchased_qty = float(purchased_qty) + float(purchase_item.quantity)
                        purchase_total = float(purchase_total) + (float(purchase_item.quantity) * float(batch_item.cost_price))
                    for sales_item in sales_items:
                        sold_qty = float(sold_qty) + (float(sales_item.quantity_in_purchase_unit) * float(sales_item.quantity))
                        sold_amt = float(sold_amt) + ((float(sales_item.quantity_in_purchase_unit) * float(sales_item.quantity)) * float(sales_item.mrp))
                    profit = float(sold_amt) - float(purchase_total)
                    profit_details.append({
                        'name': batch_item.item.name,
                        'batch': batch_item.batch.name,
                        'purchased_qty': purchased_qty,
                        'purchased_amt': purchase_total,
                        'sold_qty': sold_qty,
                        'sold_amt': sold_amt,
                        'profit': profit,
                    })
        
            if request.is_ajax():
                res = {
                    'profit_details': profit_details,
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
            else:
                style = [
                    ('FONTNAME',(0,0),(-1,-1),'Helvetica') 
                ]
                response = HttpResponse(content_type='application/pdf')
                p = SimpleDocTemplate(response, pagesize=A4)
                elements = []
                d = [['Category Wise Profit Report - '+category.name]]
                t = Table(d, colWidths=(450), rowHeights=25, style=style)
                t.setStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),
                            ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                            ('FONTSIZE', (0,0), (-1,-1), 12),
                            ])   
                elements.append(t)
                data = []

                para_style = ParagraphStyle('fancy')
                para_style.fontSize = 10
                para_style.fontName = 'Helvetica'
                data.append(['Name', 'Qty.Purchased', 'Purchased amt.', 'Qty. Sold', 'Sold amt.', 'Profit'])
                table = Table(data, colWidths=(120, 90, 90, 90, 80, 90), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,0), 11),
                            ])  
                elements.append(table)
                elements.append(Spacer(1,.1*cm ))
                data = []
                for item_data in profit_details:
                    item_name = Paragraph(item_data['name']+' - '+item_data['batch'], para_style)
                    data.append([item_name, item_data['purchased_qty'], item_data['purchased_amt'], item_data['sold_qty'], item_data['sold_amt'], item_data['profit']])
                if len(data) > 0:
                    table = Table(data, colWidths=(120, 90, 90, 90, 80, 90), style=style)
                    elements.append(table)
                p.build(elements)  
                return response 
        return render(request, 'category_wise_profit_report.html', {})