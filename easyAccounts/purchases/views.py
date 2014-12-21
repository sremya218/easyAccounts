import ast
import simplejson
import datetime
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle, SimpleDocTemplate, Spacer
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors

from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.views.generic.base import View
from django.core.urlresolvers import reverse

from purchases.models import Purchase, PurchaseItem, PurchaseReturn, PurchaseReturnItem
from suppliers.models import Supplier
from accounts.models import Ledger, LedgerEntry, Transaction
from inventory.models import Item, BatchItem, Batch, StockValue, VatType
from dashboard.models import PostDatedCheque
from dashboard.views import delete_post_dated_cheque_entries
from accounts.utils import create_ledger_entry, create_transaction

style = [
    ('FONTNAME',(0,0),(-1,-1),'Helvetica') 
]
para_style = ParagraphStyle('fancy')
para_style.fontSize = 10
para_style.fontName = 'Helvetica'

class PurchaseEntry(View):

    def get(self, request, *args, **kwargs):
        return render(request, 'purchase.html', {})

    def post(self, request, *args, **kwargs):
        purchase_details = ast.literal_eval(request.POST['purchase_details'])
        try:
            purchase = Purchase.objects.create(purchase_invoice_number=purchase_details['invoice_no'])
            transaction_ref = 'PRINV' + str(purchase.id)
            purchase_data = purchase.set_attributes(purchase_details, transaction_ref)
            
            # Transaction 1 - Credit entry for Supplier and Debit entry for purchase
            transaction_1 = Transaction()
            if purchase.supplier:
                supplier = purchase.supplier
                purchase_ledger = Ledger.objects.get(account_code='4002')
                purchase_debit_amount = float(purchase.grant_total) - float(purchase.purchase_tax)
                ledger_entry_credit_supplier = create_ledger_entry(supplier.ledger, purchase.purchase_invoice_date, transaction_ref, None, purchase.grant_total)
                ledger_entry_debit_purchase = create_ledger_entry(purchase_ledger,purchase.purchase_invoice_date, transaction_ref, purchase_debit_amount, None)
                
                transaction_1 = create_transaction(ledger_entry_debit_purchase, ledger_entry_credit_supplier)
                
                
                # Transaction 2 - Credit entry for Cash or Bank account and Debit entry for Supplier 
                if purchase.payment_mode != 'credit':
                    purchase.paid = purchase.grant_total
                    credit_ledger = None
                    if purchase.payment_mode == 'cash':
                        credit_ledger = Ledger.objects.get(account_code="1005")
                    elif purchase.payment_mode == 'card' or purchase.payment_mode == 'cheque':
                        credit_ledger = Ledger.objects.get(id=purchase_details['bank_account_ledger'])
                    ledger_entry_credit_accounts = create_ledger_entry(credit_ledger, purchase.purchase_invoice_date, transaction_ref, None, purchase.grant_total)
                   
                    transaction_2 = Transaction()
                    if purchase.supplier:
                        ledger_entry_debit_supplier = create_ledger_entry(supplier.ledger, purchase.purchase_invoice_date, transaction_ref, purchase.grant_total, None)
                       
                        if supplier.ledger:
                            supplier.ledger.balance = float(supplier.ledger.balance) + float(purchase.grant_total)
                            supplier.ledger.save()
                        debit_ledger = ledger_entry_debit_supplier
                    if credit_ledger:
                        credit_ledger.balance = float(credit_ledger.balance) - float(purchase.grant_total)
                        credit_ledger.save()
                    if debit_ledger:
                        transaction_2 = create_transaction(debit_ledger,ledger_entry_credit_accounts)
                    else:
                        transaction_2 = create_transaction(None,ledger_entry_credit_accounts)    
                   
                    transaction_2.transaction_date = purchase.purchase_invoice_date
                    transaction_2.narration = 'By Purchase - '+ str(purchase.purchase_invoice_number)
                    transaction_2.payment_mode = purchase.payment_mode
                    transaction_2.save()
                else:
                    purchase.balance = purchase.grant_total
                purchase.save()
            else:
                transaction_2 = ''

                purchase_ledger = Ledger.objects.get(account_code='4002')
               
                ledger_entry_debit_purchase = create_ledger_entry(purchase_ledger, purchase.purchase_invoice_date, transaction_ref,float(purchase.grant_total) - float(purchase.purchase_tax), None)
                
                
                purchase_ledger.balance = float(purchase_ledger.balance) + (float(purchase.grant_total) - float(purchase.purchase_tax))
                purchase_ledger.save()

                if purchase.payment_mode != 'credit':
                    purchase.paid = purchase.grant_total
                    credit_ledger = None
                    if purchase.payment_mode == 'cash':
                        credit_ledger = Ledger.objects.get(account_code="1005")
                    elif purchase.payment_mode == 'card' or purchase.payment_mode == 'cheque':
                        credit_ledger = Ledger.objects.get(id=purchase_details['bank_account_ledger'])
                   
                    ledger_entry_credit_accounts = create_ledger_entry(credit_ledger, purchase.purchase_invoice_date, transaction_ref, None, purchase.grant_total)
                transaction_1 = create_transaction(ledger_entry_debit_purchase, ledger_entry_credit_accounts)
               
            # Transaction 3 - Debit entry for Stock
            debit_stock_ledger = Ledger.objects.get(account_code="1006")
            
            stock_amount = purchase.grant_total - purchase.purchase_tax
            
            ledger_entry_debit_stock = create_ledger_entry(debit_stock_ledger, purchase.purchase_invoice_date, transaction_ref, stock_amount, None)
            debit_stock_ledger.balance = float(debit_stock_ledger.balance) + float(stock_amount)
            debit_stock_ledger.save()
            ledger_entry_debit_stock.save()
            
            transaction_3 = create_transaction(ledger_entry_debit_stock,None)
            # Transaction 4 - Debit Entry for Tax account
            
            debit_tax_ledger = Ledger.objects.get(account_code="2010")
            
            ledger_entry_debit_tax_account = create_ledger_entry(debit_tax_ledger, purchase.purchase_invoice_date, transaction_ref, purchase.purchase_tax,None)
            debit_tax_ledger.balance = float(debit_tax_ledger.balance) + float(purchase.purchase_tax)
            debit_tax_ledger.save()
            
            transaction_4 = create_transaction(ledger_entry_debit_tax_account, None)
            transaction_1.transaction_date = purchase.purchase_invoice_date
            transaction_1.narration = 'By Purchase - '+ str(purchase.purchase_invoice_number)
            transaction_1.payment_mode = purchase.payment_mode
            if purchase.payment_mode != 'credit':
                
                transaction_4.transaction_date = purchase.purchase_invoice_date
                transaction_4.narration = 'By Purchase - '+ str(purchase.purchase_invoice_number)
                transaction_4.payment_mode = purchase.payment_mode

            transaction_3.transaction_date = purchase.purchase_invoice_date
            transaction_3.narration = 'By Purchase - '+ str(purchase.purchase_invoice_number)
            transaction_3.payment_mode = purchase.payment_mode

            if purchase.payment_mode != 'credit':
                if purchase.payment_mode == 'cheque':
                    if transaction_2:
                        transaction_2.bank_name = purchase.bank_name
                        transaction_2.cheque_number = purchase.cheque_number
                        transaction_2.cheque_date = purchase.cheque_date
                        transaction_2.branch = purchase.branch
                    transaction_1.bank_name = purchase.bank_name
                    transaction_3.bank_name = purchase.bank_name
                    transaction_4.bank_name = purchase.bank_name
                    transaction_1.cheque_number = purchase.cheque_number
                    transaction_1.cheque_date = purchase.cheque_date
                    transaction_1.branch = purchase.branch
                    transaction_3.cheque_number = purchase.cheque_number
                    transaction_3.cheque_date = purchase.cheque_date
                    transaction_3.branch = purchase.branch
                    transaction_4.branch = purchase.branch
                elif purchase.payment_mode == 'card':
                    if transaction_2:
                        transaction_2.card_holder_name = purchase.card_holder_name
                        transaction_2.card_no = purchase.card_number
                        transaction_2.bank_name = purchase.bank_name
                    transaction_1.bank_name = purchase.bank_name
                    transaction_3.bank_name = purchase.bank_name
                    transaction_4.bank_name = purchase.bank_name
                    transaction_1.card_holder_name = purchase.card_holder_name
                    transaction_1.card_no = purchase.card_number
                    transaction_3.card_holder_name = purchase.card_holder_name
                    transaction_3.card_no = purchase.card_number
                    transaction_4.card_no = purchase.card_number
                    transaction_4.card_holder_name = purchase.card_holder_name
                if transaction_2:
                    transaction_2.save()
                transaction_4.save()
            transaction_1.save()
            transaction_3.save()
            

            try:
                stock_value = StockValue.objects.latest('id')
            except Exception as ex:
                stock_value = StockValue()
            if stock_value.stock_by_value is not None:
                stock_value.stock_by_value = float(stock_amount) + float(stock_value.stock_by_value)
            else:
                stock_value.stock_by_value = float(stock_amount)

            stock_value.save()

            # Post Dated Cheque Entry for the Notifications
            if purchase.payment_mode == 'cheque':
                post_dated_cheque = PostDatedCheque()
                type_name = 'purchase'
                post_dated_cheque_obj = post_dated_cheque.set_attributes(type_name, purchase)
                deleted = delete_post_dated_cheque_entries()
            res = {
                'result': 'ok',
                'transaction_reference_no': transaction_1.transaction_ref,
            }
        except Exception as ex:
            res = {
                'result': 'error',
                'error_message': str(ex),
                'message': 'Purchase Invoice number already exists',
            }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype="application/json")

class PurchaseReturnEntry(View):
    def get(self, request, *args, **kwargs):
        if request.is_ajax():
            purchase_invoice = request.GET.get('purchase_invoice_no', '')
            purchases = []
            ctx_purchases = []
            if purchase_invoice:
                purchases = Purchase.objects.filter(purchase_invoice_number=purchase_invoice)
            for purchase in purchases:
                ctx_purchases.append({
                    'id': purchase.id,
                    'purchase_invoice': purchase.purchase_invoice_number,
                    'supplier': purchase.supplier.name if purchase.supplier else '',
                    'discount': purchase.discount,
                })
            res = {
                'purchase_deatails': ctx_purchases,
                'result': 'ok',
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'purchase_return.html', {})
        

    def post(self, request, *args, **kwargs):

        purchase_return_details = ast.literal_eval(request.POST['purchase_return_details'])
        try:
            purchase = Purchase.objects.get(id=purchase_return_details['purchase_id'])
            purchase_return = PurchaseReturn.objects.create(return_invoice_number=purchase_return_details['return_invoice'])
            transaction_ref = 'PRRINV' + str(purchase_return.id)
            purchase_return_obj = purchase_return.set_attributes(purchase_return_details, transaction_ref)

            # Transaction 1 - Debit entry for Supplier and credit entry for Purchase Return
            transaction_1 = Transaction()
            if purchase.supplier:
                debit_supplier_entry = LedgerEntry()
                debit_supplier_entry.ledger = purchase.supplier.ledger
                debit_supplier_entry.debit_amount = purchase_return.grant_total
                debit_supplier_entry.date = purchase_return.invoice_date
                debit_supplier_entry.transaction_reference_number = transaction_ref
                debit_supplier_entry.save()
                purchase.supplier.ledger.balance = float(purchase.supplier.ledger.balance) + float(purchase_return.grant_total)
                purchase.supplier.ledger.save()
                transaction_1.debit_ledger = debit_supplier_entry
            credit_purchase_return_entry = LedgerEntry()
            purchase_return_ledger = Ledger.objects.get(account_code='4003')
            credit_purchase_return_entry.ledger = purchase_return_ledger
            credit_purchase_return_entry.credit_amount = float(purchase_return.grant_total) - float(purchase_return.purchase_tax)
            credit_purchase_return_entry.date = purchase_return.invoice_date
            credit_purchase_return_entry.transaction_reference_number = transaction_ref
            credit_purchase_return_entry.save()
            purchase_return_ledger.balance = float(purchase_return_ledger.balance) - float(credit_purchase_return_entry.credit_amount)
            purchase_return_ledger.save()

            transaction_1.transaction_ref = transaction_ref
            transaction_1.credit_ledger = credit_purchase_return_entry
            transaction_1.transaction_date = purchase_return.invoice_date
            transaction_1.debit_amount = float(purchase_return.purchase_tax) + float(purchase_return.grant_total)
            transaction_1.credit_amount = credit_purchase_return_entry.credit_amount
            transaction_1.narration = 'By Purchase Return- '+ str(purchase_return.return_invoice_number)
            transaction_1.save()

            # Transaction 2 - Credit Entry for Stock

            credit_stock_entry = LedgerEntry()
            stock_ledger = Ledger.objects.get(account_code='1006')
            credit_stock_entry.ledger = stock_ledger
            credit_stock_entry.credit_amount = float(purchase_return.grant_total) - float(purchase_return.purchase_tax)
            credit_stock_entry.date = purchase_return.invoice_date
            credit_stock_entry.transaction_reference_number = transaction_ref
            credit_stock_entry.save()
            stock_ledger.balance = float(stock_ledger.balance) - float(credit_stock_entry.credit_amount)
            stock_ledger.save()

            transaction_2 = Transaction()
            transaction_2.transaction_ref = transaction_ref
            transaction_2.credit_ledger = credit_stock_entry
            transaction_2.transaction_date = purchase_return.invoice_date
            transaction_2.credit_amount = purchase_return.grant_total
            transaction_2.narration = 'By Purchase Return- '+ str(purchase_return.return_invoice_number)
            transaction_2.save()

            try:
                stock_value = StockValue.objects.latest('id')
            except Exception as ex:
                stock_value = StockValue()
            if stock_value.stock_by_value is not None:
                stock_value.stock_by_value = float(stock_value.stock_by_value) - (float(purchase_return.grant_total) - float(purchase_return.purchase_tax))
            else:
                stock_value.stock_by_value = 0 - (float(purchase_return.grant_total) - float(purchase_return.purchase_tax))
            stock_value.save()
            
            # Transaction 3 - Credit Entry for Tax Account

            credit_tax_account_entry = LedgerEntry()
            credit_tax_ledger = Ledger.objects.get(account_code="2010")
            credit_tax_account_entry.ledger = credit_tax_ledger
            credit_tax_account_entry.credit_amount = purchase_return.purchase_tax
            credit_tax_account_entry.date = purchase_return.invoice_date
            credit_tax_account_entry.transaction_reference_number = transaction_ref
            credit_tax_account_entry.save()
            credit_tax_ledger.balance = float(credit_tax_ledger.balance) - purchase_return.purchase_tax
            credit_tax_ledger.save()

            transaction_3 = Transaction()
            transaction_3.transaction_ref = transaction_ref
            transaction_3.credit_ledger = credit_tax_account_entry
            transaction_3.transaction_date = purchase_return.invoice_date
            transaction_3.credit_amount = purchase_return.purchase_tax
            transaction_3.narration = 'By Purchase Return- '+ str(purchase_return.return_invoice_number)
            transaction_3.save()

            # Transaction 4 - Debit entry for Purchase Return and Credit entry for Supplier
            transaction_4 = Transaction()
            if purchase.supplier:
                credit_supplier_entry = LedgerEntry()
                credit_supplier_entry.ledger = purchase.supplier.ledger
                credit_supplier_entry.credit_amount = purchase_return.grant_total
                credit_supplier_entry.date = purchase_return.invoice_date
                credit_supplier_entry.transaction_reference_number = transaction_ref
                credit_supplier_entry.save()
                purchase.supplier.ledger.balance = float(purchase.supplier.ledger.balance) - float(purchase_return.grant_total)
                purchase.supplier.ledger.save()
                transaction_4.credit_ledger = credit_supplier_entry
                transaction_4.credit_amount = credit_supplier_entry.credit_amount
            debit_cash_bank_entry = LedgerEntry()
            if purchase_return.payment_mode == 'cash':
                debit_ledger = Ledger.objects.get(account_code="1005")
            elif purchase_return.payment_mode == 'card' or purchase_return.payment_mode == 'cheque':
                debit_ledger = Ledger.objects.get(id=purchase_return_details['bank_account_ledger'])
            debit_cash_bank_entry.ledger = debit_ledger
            debit_cash_bank_entry.debit_amount = float(purchase_return.grant_total)
            debit_cash_bank_entry.date = purchase_return.invoice_date
            debit_cash_bank_entry.transaction_reference_number = transaction_ref
            debit_cash_bank_entry.save()
            debit_ledger.balance = float(debit_ledger.balance) + float(purchase_return.grant_total)
            debit_ledger.save()
            
            transaction_4.transaction_ref = transaction_ref
            transaction_4.debit_ledger = debit_cash_bank_entry
            
            transaction_4.transaction_date = purchase_return.invoice_date
            transaction_4.debit_amount = float(purchase_return.purchase_tax) + float(purchase_return.grant_total)
            
            transaction_4.narration = 'By Purchase Return- '+ str(purchase_return.return_invoice_number)
            transaction_4.save()

            # Post Dated Cheque Entry for the Notifications
            if purchase_return.payment_mode == 'cheque':
                post_dated_cheque = PostDatedCheque()
                type_name = 'purchase_return'
                post_dated_cheque_obj = post_dated_cheque.set_attributes(type_name, purchase_return)
                deleted = delete_post_dated_cheque_entries()
            res = {
                'result': 'ok',
                'transaction_reference_no': transaction_ref,
            }
        except Exception as ex:
            res = {
                'result': 'error',
                'message': 'Retrun Invoice no already exists',
                'error_message': str(ex),
            }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

class PriceSettings(View):

    def get(self, request, *args, **kwargs):

        return render(request, 'price_settings.html', {})

    def post(self, request, *args, **kwargs):

        if request.is_ajax():
            price_details = ast.literal_eval(request.POST['price_settings'])
            items = price_details['items']
            for item in items:
                if price_details['is_purchase_price_settings'] == 'true':
                    batch_item = BatchItem.objects.get(id=item['batch_item_id'])
                else:
                    try:
                        batch_item = BatchItem.objects.get(id=item['batch_id'])
                    except:
                        batch_item = BatchItem.objects.get(item__id=item['item_id'])
                batch_item.cost_price = item['cost_price']
                batch_item.whole_sale_profit_percentage = item['wholesale_profit']
                batch_item.retail_profit_percentage = item['retail_profit']
                batch_item.whole_sale_price = item['wholesale_price']
                batch_item.retail_price = item['retail_price']
                batch_item.branch_price = item['branch_price']
                batch_item.customer_card_price = item['customer_card_price']
                batch_item.freight_charge = float(batch_item.cost_price) - float(batch_item.purchase_price)
                batch_item.permissible_discount_percentage = item['permissible_discount']
                batch_item.save();

                quantity_unit = batch_item.uom
                batch_item.small_wholesale_price = batch_item.whole_sale_price
                batch_item.small_retail_price = batch_item.retail_price
                batch_item.small_branch_price = batch_item.branch_price
                batch_item.small_customer_card_price = batch_item.customer_card_price
                item = batch_item.item
                if quantity_unit=='box':
                    if batch_item.item.packets_per_box != None:
                        batch_item.small_wholesale_price = float(batch_item.small_wholesale_price)/float(item.packets_per_box)
                        batch_item.small_retail_price = float(batch_item.small_retail_price)/float(item.packets_per_box)
                        batch_item.small_branch_price = float(batch_item.small_branch_price)/float(item.packets_per_box)
                        batch_item.small_customer_card_price = float(batch_item.small_customer_card_price)/float(item.packets_per_box)
                        quantity_unit = 'packet' 
                    if batch_item.item.pieces_per_box != None:
                        batch_item.small_wholesale_price = float(batch_item.small_wholesale_price)/float(item.packets_per_box)
                        batch_item.small_retail_price = float(batch_item.small_retail_price)/float(item.packets_per_box)
                        batch_item.small_branch_price = float(batch_item.small_branch_price)/float(item.packets_per_box)
                        batch_item.small_customer_card_price = float(batch_item.small_customer_card_price)/float(item.packets_per_box)
                        quantity_unit = 'piece' 
                    if batch_item.item.unit_per_box != None:
                        batch_item.small_wholesale_price = float(batch_item.small_wholesale_price)/float(item.unit_per_box)
                        batch_item.small_retail_price = float(batch_item.small_retail_price)/float(item.unit_per_box)
                        batch_item.small_branch_price = float(batch_item.small_branch_price)/float(item.unit_per_box)
                        batch_item.small_customer_card_price = float(batch_item.small_customer_card_price)/float(item.unit_per_box)  
                        quantity_unit = item.smallest_unit
                if quantity_unit=='packet':    
                    if batch_item.item.pieces_per_packet != None:
                        batch_item.small_wholesale_price = float(batch_item.small_wholesale_price)/float(item.pieces_per_packet)
                        batch_item.small_retail_price = float(batch_item.small_retail_price)/float(item.pieces_per_packet)
                        batch_item.small_branch_price = float(batch_item.small_branch_price)/float(item.pieces_per_packet)
                        batch_item.small_customer_card_price = float(batch_item.small_customer_card_price)/float(item.pieces_per_packet)  
                        quantity_unit = 'piece'
                    if batch_item.item.unit_per_packet != None:
                        batch_item.small_wholesale_price = float(batch_item.small_wholesale_price)/float(item.unit_per_packet)
                        batch_item.small_retail_price = float(batch_item.small_retail_price)/float(item.unit_per_packet)
                        batch_item.small_branch_price = float(batch_item.small_branch_price)/float(item.unit_per_packet)
                        batch_item.small_customer_card_price = float(batch_item.small_customer_card_price)/float(item.unit_per_packet)  
                        quantity_unit = item.smallest_unit
                if quantity_unit=='piece':
                    if batch_item.item.unit_per_piece != None:
                        batch_item.small_wholesale_price = float(batch_item.small_wholesale_price)/float(item.unit_per_piece)
                        batch_item.small_retail_price = float(batch_item.small_retail_price)/float(item.unit_per_piece)
                        batch_item.small_branch_price = float(batch_item.small_branch_price)/float(item.unit_per_piece)
                        batch_item.small_customer_card_price = float(batch_item.small_customer_card_price)/float(item.unit_per_piece)  
                        quantity_unit = item.smallest_unit       
                print "batch_item.small_wholesale_price", batch_item.small_wholesale_price
                if batch_item.item.smallest_unit == 'Kg':
                    batch_item.small_wholesale_price = float(batch_item.small_wholesale_price)/(1000*1000)
                    batch_item.small_retail_price = float(batch_item.small_retail_price)/(1000*1000)
                    batch_item.small_branch_price = float(batch_item.small_branch_price)/(1000*1000)
                    batch_item.small_customer_card_price = float(batch_item.small_customer_card_price)/(1000*1000)
                if batch_item.item.smallest_unit == 'gm':
                    batch_item.small_wholesale_price = float(batch_item.small_wholesale_price)/1000
                    batch_item.small_retail_price = float(batch_item.small_retail_price)/1000
                    batch_item.small_branch_price = float(batch_item.small_branch_price)/1000
                    batch_item.small_customer_card_price = float(batch_item.small_customer_card_price)/1000
                if batch_item.item.smallest_unit == 'Metre':
                    batch_item.small_wholesale_price = float(batch_item.small_wholesale_price)/(100*100)
                    batch_item.small_retail_price = float(batch_item.small_retail_price)/(100*100)
                    batch_item.small_branch_price = float(batch_item.small_branch_price)/(100*100)
                    batch_item.small_customer_card_price = float(batch_item.small_customer_card_price)/(100*100)
                if batch_item.item.smallest_unit == 'cm':
                    batch_item.small_wholesale_price = float(batch_item.small_wholesale_price)/100
                    batch_item.small_retail_price = float(batch_item.small_retail_price)/100
                    batch_item.small_branch_price = float(batch_item.small_branch_price)/100
                    batch_item.small_customer_card_price = float(batch_item.small_customer_card_price)/100

                if batch_item.item.smallest_unit == 'litre':
                    batch_item.small_wholesale_price = float(batch_item.small_wholesale_price)/100
                    batch_item.small_retail_price = float(batch_item.small_retail_price)/100
                    batch_item.small_branch_price = float(batch_item.small_branch_price)/100
                    batch_item.small_customer_card_price = float(batch_item.small_customer_card_price)/100

                if batch_item.item.smallest_unit == 'sqrmetre':
                    batch_item.small_wholesale_price = float(batch_item.small_wholesale_price)/10.7639
                    batch_item.small_retail_price = float(batch_item.small_retail_price)/10.7639
                    batch_item.small_branch_price = float(batch_item.small_branch_price)/10.7639
                    batch_item.small_customer_card_price = float(batch_item.small_customer_card_price)/10.7639
                batch_item.save()
            res = {
                'result': 'ok',
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'price_settings.html', {})

class PurchaseItemsDetails(View):

    def get(self, request, *args, **kwargs):

        purchase_invoice = request.GET.get('invoice', '')
        purchase_item_details = []
        # try:
        if request.GET.get('invoice', ''):  
            purchase_items = PurchaseItem.objects.filter(purchase__purchase_invoice_number=purchase_invoice).order_by('id')
        elif request.GET.get('item_name', '') and request.GET.get('purchase_id', ''):
            purchase_items = PurchaseItem.objects.filter(purchase__purchase_invoice_number=request.GET.get('purchase_id', ''), batch_item__item__name__istartswith=request.GET.get('item_name', '')).order_by('id')
        elif request.GET.get('purchase_id', ''):
            purchase_items = PurchaseItem.objects.filter(purchase__purchase_invoice_number=request.GET.get('purchase_id', '')).order_by('id')
        print "prchase items", purchase_items
        for purchase_item in purchase_items:
            print "in purchase itm", purchase_item, purchase_item.purchasereturnitem_set.all()
            returned_qty = 0.0
            return_items = PurchaseReturnItem.objects.filter(purchase_item=purchase_item)
            print "return_items", return_items
            for r_item in return_items:
                print r_item, ":dftgdgdg"
                returned_qty = returned_qty + float(r_item.quantity)
            purchase_item_data = purchase_item.get_json_data()
            purchase_item_data['returned_qty'] = returned_qty
            purchase_item_details.append(purchase_item_data)
        res = {
            'result': 'ok',
            'purchase_items': purchase_item_details,
        }
        # except Exception as ex:
        #     res = {
        #         'result': 'error',
        #     }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

class PurchaseView(View):

    def get(self, request, *args, **kwargs):

        return render(request, 'view_purchase.html', {})

class PurchaseDetails(View):

    def get(self, request, *args, **kwargs):

        purchase_invoice = request.GET.get('invoice', '')
        supplier = request.GET.get('supplier', '')
        if not supplier:
            supplier = 'undefined'
        purchase_data = {}
        try:
            if purchase_invoice and supplier != 'undefined':
                purchase = Purchase.objects.get(purchase_invoice_number=purchase_invoice, supplier__ledger__id=supplier, payment_mode='credit')
            else:
                try:
                    purchase = Purchase.objects.get(purchase_invoice_number=purchase_invoice)
                except Exception as ex:
                    print str(ex)
                    purchase = Purchase.objects.get(transaction_reference_no=purchase_invoice)
            if purchase:
                purchase_data = purchase.get_json_data()
                res = {
                    'purchase': purchase_data,
                    'result': 'ok',
                    'message': '',
                }
            else:
                res = {
                    'result': 'error',
                    'message': str(ex),
                    'purchase': purchase_data,
                }
        except Exception as ex:
            res = {
                'result': 'error',
                'message': str(ex),
                'purchase': purchase_data,
            }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

class PurchaseReturnView(View):

    def get(self, request, *args, **kwargs):
        invoice_no = request.GET.get('invoice_no', '')
        purchase_return_data = {}
        if invoice_no:
            try:
                purchase_return = None
                try:    
                    purchase_return = PurchaseReturn.objects.get(return_invoice_number=invoice_no)
                except Exception as ex:
                    purchase_return = PurchaseReturn.objects.get(transaction_reference_no=invoice_no)
                if purchase_return:
                    items_details = []
                    for p_item in purchase_return.purchasereturnitem_set.all():
                        returned_qty = 0.0
                        return_items = PurchaseReturnItem.objects.filter(purchase_item=p_item)
                        for r_item in return_items:
                            returned_qty = returned_qty + float(r_item.quantity)
                        item_data = p_item.get_json_data()
                        item_data['returned_qty'] = returned_qty
                        items_details.append(item_data)
                    purchase_return_data = purchase_return.get_json_data()
                    purchase_return_data['items'] = items_details
                    res = {
                        'purchase_return': purchase_return_data,
                        'result': 'ok',
                    }
                else:
                    res = {
                        'result': 'error',
                        'message': 'No Purchase Return with this Invoice No',
                        'purchase_return': purchase_return_data,
                    }
            except Exception as ex:
                res = {
                    'result': 'error',
                    'error': str(ex),
                    'message': 'No Purchase Return with this Invoice No',
                    'purchase_return': purchase_return_data,
                }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'purchase_return_view.html', {})

class PurchaseReport(View):

    def get(self, request, *args, **kwargs):
        start_date = request.GET.get('start_date', '')
        end_date = request.GET.get('end_date', '')
        purchase_details = []
       
        if start_date and end_date:
            start = datetime.datetime.strptime(start_date, '%d/%m/%Y')
            end = datetime.datetime.strptime(end_date, '%d/%m/%Y')
            purchases = Purchase.objects.filter(purchase_invoice_date__gte=start, purchase_invoice_date__lte=end).order_by('purchase_invoice_date')
            for purchase in purchases:
                purchase_details.append(purchase.get_json_data())
            if request.is_ajax():
                res = {
                    'result': 'ok',
                    'purchase_details': purchase_details,
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
            else:
                response = HttpResponse(content_type='application/pdf')
                p = SimpleDocTemplate(response, pagesize=A4)
                elements = []
                data = []
                heading = 'Purchase Report - '+start_date+' - '+end_date
                d = [[heading]]
                t = Table(d, colWidths=(450), rowHeights=25, style=style)
                t.setStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),
                            ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(t)
                elements.append(Spacer(2,20 ))
                data = []
                data.append(['Invoice', 'Date', 'Transaction', 'Supplier', 'Discount', 'Tax', 'Grant Total'])
                total = 0
                for purchase in purchases:
                    supplier = Paragraph(purchase.supplier.name, para_style) if purchase.supplier else ''
                    total = float(total) + float(purchase.grant_total)
                    data.append([purchase.purchase_invoice_number, purchase.purchase_invoice_date.strftime('%d/%m/%Y'),purchase.transaction_reference_no, \
                       supplier, purchase.discount, purchase.purchase_tax, purchase.grant_total])
                table = Table(data, colWidths=(50, 60, 80, 120, 80, 80, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])
                elements.append(table)  
                elements.append(Spacer(2,20 ))
                data = []
                data.append(['Total : ', total])
                table = Table(data, colWidths=(100, 100), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])
                elements.append(table)
                p.build(elements)  
                return response
        return render(request, 'purchase_date_wise_report.html', {})

class PurchaseReturnReport(View):

    def get(self, request, *args, **kwargs):
        start_date = request.GET.get('start_date', '')
        end_date = request.GET.get('end_date', '')
        purchase_return_details = []
        if start_date and end_date:
            start = datetime.datetime.strptime(start_date, '%d/%m/%Y')
            end = datetime.datetime.strptime(end_date, '%d/%m/%Y')
            purchase_returns = PurchaseReturn.objects.filter(invoice_date__gte=start, invoice_date__lte=end).order_by('invoice_date')
            for purchase_return in purchase_returns:
                purchase_return_details.append(purchase_return.get_json_data())
            if request.is_ajax():
                res = {
                    'result': 'ok',
                    'purchase_return_details': purchase_return_details,
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
            else:
                response = HttpResponse(content_type='application/pdf')
                p = SimpleDocTemplate(response, pagesize=A4)
                elements = []
                data = []
                heading = 'Purchase Return Report - '+start_date+' - '+end_date
                d = [[heading]]
                t = Table(d, colWidths=(450), rowHeights=25, style=style)
                t.setStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),
                            ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(t)
                elements.append(Spacer(2,20 ))
                data = []
                data.append(['Invoice', 'Date', 'Transaction', 'Supplier', 'Discount', 'Tax', 'Grant Total'])
                for purchase_return in purchase_returns:
                    supplier = Paragraph(purchase_return.purchase.supplier.name, para_style) if purchase_return.purchase.supplier else ''
                    data.append([purchase_return.return_invoice_number, purchase_return.invoice_date.strftime('%d/%m/%Y'),purchase_return.transaction_reference_no, \
                        supplier, purchase_return.discount, purchase_return.purchase_tax, purchase_return.grant_total])
                table = Table(data, colWidths=(50, 60, 80, 120, 80, 80, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table)
                p.build(elements)  
                return response
        return render(request, 'purchase_return_date_wise_report.html', {})

class SupplierWisePurchaseReport(View):

    def get(self, request, *args, **kwargs):

        supplier_id = request.GET.get('supplier_id', '')
        purchase_details = []
        if supplier_id:
            supplier = Supplier.objects.get(id=supplier_id)
            purchases = Purchase.objects.filter(supplier=supplier)
            for purchase in purchases:
                purchase_details.append(purchase.get_json_data())
            if request.is_ajax():
                res = {
                    'result': 'ok',
                    'purchase_details': purchase_details,
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
            else:
                response = HttpResponse(content_type='application/pdf')
                p = SimpleDocTemplate(response, pagesize=A4)
                elements = []
                data = []
                heading = 'Purchase Report - '+supplier.name
                d = [[heading]]
                t = Table(d, colWidths=(450), rowHeights=25, style=style)
                t.setStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),
                            ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(t)
                elements.append(Spacer(2,20 ))
                data = []
                data.append(['Invoice', 'Date', 'Transaction', 'Discount', 'Tax', 'Grant Total'])
                for purchase in purchases:
                    data.append([purchase.purchase_invoice_number, purchase.purchase_invoice_date.strftime('%d/%m/%Y'),purchase.transaction_reference_no, \
                        purchase.discount, purchase.purchase_tax, purchase.grant_total])
                table = Table(data, colWidths=(50, 60, 80, 80, 80, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table)
                p.build(elements)  
                return response

        return render(request, 'purchase_supplier_wise_report.html', {})

class SupplierWisePurchaseReturnReport(View):

    def get(self, request, *args, **kwargs):

        supplier_id = request.GET.get('supplier_id', '')
        purchase_return_details = []
        if supplier_id:
            supplier = Supplier.objects.get(id=supplier_id)
            purchase_returns = PurchaseReturn.objects.filter(purchase__supplier=supplier)
            for purchase_return in purchase_returns:
                purchase_return_details.append(purchase_return.get_json_data())
            if request.is_ajax():
                res = {
                    'result': 'ok',
                    'purchase_return_details': purchase_return_details,
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
            else:
                response = HttpResponse(content_type='application/pdf')
                p = SimpleDocTemplate(response, pagesize=A4)
                elements = []
                data = []
                heading = 'Purchase Return Report - '+supplier.name
                d = [[heading]]
                t = Table(d, colWidths=(450), rowHeights=25, style=style)
                t.setStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),
                            ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(t)
                elements.append(Spacer(2,20 ))
                data = []
                data.append(['Invoice', 'Date', 'Transaction', 'Discount', 'Tax', 'Grant Total'])
                for purchase_return in purchase_returns:
                    data.append([purchase_return.return_invoice_number, purchase_return.invoice_date.strftime('%d/%m/%Y'),purchase_return.transaction_reference_no, \
                        purchase_return.discount, purchase_return.purchase_tax, purchase_return.grant_total])
                table = Table(data, colWidths=(50, 60, 80, 80, 80, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table)
                p.build(elements)  
                return response
        return render(request, 'purchase_return_supplier_wise_report.html', {})

class TaxWisePurchaseReport(View):

    def get(self, request, *args, **kwargs):

        vat_id = request.GET.get('vat', '')
        purchase_item_details = []
        
        if vat_id:
            vat_type = VatType.objects.get(id=vat_id)
            items = Item.objects.filter(vat_type=vat_type)
            for item in items:
                try:
                    purchase_items = PurchaseItem.objects.filter(batch_item__item=item)
                    for purchase_item in purchase_items:
                        purchase_item_details.append({
                            'invoice_no': purchase_item.purchase.purchase_invoice_number,
                            'invoice_date': purchase_item.purchase.purchase_invoice_date.strftime('%d/%m/%Y'),
                            'supplier': purchase_item.purchase.supplier.name,
                            'grant_total': purchase_item.purchase.grant_total,
                            })
                except:
                    purchase_item_details = []
            if request.is_ajax():
                res = {
                    'result': 'ok',
                    'purchase_details': purchase_item_details,
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
            else:
                response = HttpResponse(content_type='application/pdf')
                p = SimpleDocTemplate(response, pagesize=A4)
                elements = []
                data = []
                
                heading = 'Tax Wise Purchase Report - '+vat_type.vat_type
                d = [[heading]]
                t = Table(d, colWidths=(450), rowHeights=25, style=style)
                t.setStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),
                            ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   

                elements.append(t)
                elements.append(Spacer(2,20 ))
                data = []
                data.append(['Invoice', 'Date', 'Supplier', 'Grant Total'])
                table = Table(data, colWidths=(50, 60, 80, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table)
                data = []   
                for purchase_item in purchase_items:
                    data.append([purchase_item.purchase.purchase_invoice_number, purchase_item.purchase.purchase_invoice_date.strftime('%d/%m/%Y'),purchase_item.purchase.supplier.name, \
                    purchase_item.purchase.grant_total])
                if len(data) > 0:
                    table = Table(data, colWidths=(50, 60, 80, 80), style=style)
                    table.setStyle([
                                ('FONTSIZE', (0,0), (-1,-1), 10),
                                ])   
                    elements.append(table)
                p.build(elements)  
                return response
        elif request.GET.get('all', ''):
            vat_type = VatType.objects.all()
            items = Item.objects.filter(vat_type=vat_type)
            for item in items:
                try:
                    purchase_items = PurchaseItem.objects.filter(batch_item__item=item)
                    for purchase_item in purchase_items:
                        purchase_item_details.append({
                            'invoice_no': purchase_item.purchase.purchase_invoice_number,
                            'invoice_date': purchase_item.purchase.purchase_invoice_date.strftime('%d/%m/%Y'),
                            'supplier': purchase_item.purchase.supplier.name,
                            'grant_total': purchase_item.purchase.grant_total,
                            })
                except:
                    purchase_item_details = []
            if request.is_ajax():
                res = {
                    'result': 'ok',
                    'purchase_details': purchase_item_details,
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
            else:
                response = HttpResponse(content_type='application/pdf')
                p = SimpleDocTemplate(response, pagesize=A4)
                elements = []
                data = []
                
                heading = 'Tax Wise Purchase Report'
                d = [[heading]]
                t = Table(d, colWidths=(450), rowHeights=25, style=style)
                t.setStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),
                            ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   

                elements.append(t)
                elements.append(Spacer(2,20 ))
                data = []
                data.append(['Invoice', 'Date', 'Supplier', 'Grant Total'])
                table = Table(data, colWidths=(50, 60, 80, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table)
                data = []   
                for purchase_item in purchase_items:
                    data.append([purchase_item.purchase.purchase_invoice_number, purchase_item.purchase.purchase_invoice_date.strftime('%d/%m/%Y'),purchase_item.purchase.supplier.name, \
                    purchase_item.purchase.grant_total])
                if len(data) > 0:
                    table = Table(data, colWidths=(50, 60, 80, 80, 80, 80), style=style)
                    table.setStyle([
                                ('FONTSIZE', (0,0), (-1,-1), 10),
                                ])   
                    elements.append(table)
                p.build(elements)  
                return response

        return render(request, 'tax_wise_purchase_report.html', {})


class PurchaseEdit(View):

    def get(self, request, *args, **kwargs):

        return render(request, 'purchase_edit.html', {})

    def post(self, request, *args, **kwargs):
        purchase_details = ast.literal_eval(request.POST['purchase_details'])
        # try:
        purchase = Purchase.objects.get(purchase_invoice_number=purchase_details['invoice_no'])
        purchase.purchase_invoice_date = datetime.datetime.strptime(purchase_details['invoice_date'], '%d/%m/%Y')
        purchase.do_number = purchase_details['do_no']
        purchase.supplier_tin = purchase_details['supplier_tin']
        purchase.owner_tin = purchase_details['owner_tin']
        purchase.save()
        # Transaction 1 - Credit entry for Supplier and Debit entry for purchase
        if purchase.supplier:
            supplier = Supplier.objects.get(id=purchase_details['supplier'])
            if supplier != purchase.supplier:
                supplier_ledger_entries = LedgerEntry.objects.filter(transaction_reference_number=purchase.transaction_reference_no, ledger=purchase.supplier.ledger)
            else:
                supplier_ledger_entries = LedgerEntry.objects.filter(transaction_reference_number=purchase.transaction_reference_no, ledger=supplier.ledger)
            for supplier_ledger_entry_data in supplier_ledger_entries:
                if supplier_ledger_entry_data.credit_amount > 0:
                    supplier_credit_ledger_entry = supplier_ledger_entry_data
                else:
                    supplier_debit_ledger_entry = supplier_ledger_entry_data
            transaction_1 = Transaction.objects.get(debit_ledger__ledger__account_code=4002, transaction_ref=purchase.transaction_reference_no)
            if transaction_1.credit_ledger.ledger == purchase.supplier.ledger:
                if purchase.supplier.id != purchase_details['supplier']:
                    is_new_supplier = True
                    old_supplier_ledger = purchase.supplier.ledger
                    old_supplier_ledger.balance = (float(old_supplier_ledger.balance) + float(purchase.grant_total))
                    
                    new_supplier_ledger = supplier.ledger
                    new_supplier_ledger.balance = float(new_supplier_ledger.balance) - float(purchase_details['grant_total'])
                    purchase.supplier = supplier
                    purchase.save()
                    supplier_credit_ledger_entry.ledger = new_supplier_ledger
                    if float(supplier_credit_ledger_entry.credit_amount) != float(purchase_details['grant_total']):
                        supplier_credit_ledger_entry.credit_amount = purchase_details['grant_total']
                    supplier_credit_ledger_entry.save()
                else:
                    is_new_supplier = False
                    if float(supplier_credit_ledger_entry.credit_amount) != float(purchase_details['grant_total']):
                        supplier_ledger = purchase.supplier.ledger
                        supplier_ledger.balance = (float(supplier_ledger.balance) + float(purchase.grant_total)) - float(purchase_details['grant_total'])
                        supplier_ledger.save()
                        supplier_credit_ledger_entry.credit_amount = purchase_details['grant_total']
                    supplier_credit_ledger_entry.save()
                transaction_1.credit_ledger = supplier_credit_ledger_entry
                transaction_1.credit_amount = purchase_details['grant_total']
                transaction_1.payment_mode = purchase.payment_mode
                transaction_1.save()
            # Debit Purchase Ledger Edit
                debit_purchase_entry = transaction_1.debit_ledger
                new_purchase_amount = float(purchase_details['grant_total']) - float(purchase_details['purchase_tax'])
                if float(debit_purchase_entry.debit_amount) != float(new_purchase_amount):
                    purchase_ledger = debit_purchase_entry.ledger
                    purchase_ledger.balance = (float(purchase_ledger.balance) - float(debit_purchase_entry.debit_amount)) + float(new_purchase_amount)
                    purchase_ledger.save()
                    debit_purchase_entry.debit_amount = new_purchase_amount
                    debit_purchase_entry.save()
                transaction_1.debit_ledger = debit_purchase_entry
                transaction_1.debit_amount = debit_purchase_entry.debit_amount
                transaction_1.save()
                # Transaction 2 - Credit entry for Cash or Bank account and Debit entry for Supplier 
                if purchase.payment_mode != 'credit':
                    purchase.paid = purchase.grant_total
                    if is_new_supplier:
                        transaction_2 = Transaction.objects.get(debit_ledger=supplier_debit_ledger_entry)
                        old_supplier_ledger.balance = (float(old_supplier_ledger.balance) - float(purchase.grant_total))
                        old_supplier_ledger.save()
                        new_supplier_ledger.balance = float(new_supplier_ledger.balance) + float(purchase_details['grant_total'])
                        new_supplier_ledger.save()
                        supplier_debit_ledger_entry.ledger = new_supplier_ledger
                        supplier_debit_ledger_entry.debit_amount = purchase_details['grant_total']
                        supplier_debit_ledger_entry.save()
                    else:
                        transaction_2 = Transaction.objects.get(debit_ledger=supplier_debit_ledger_entry)
                        if float(supplier_debit_ledger_entry.debit_amount) != float(purchase_details['grant_total']):
                            supplier_debit_ledger_entry.ledger.balance = (float(supplier_debit_ledger_entry.ledger.balance) - float(supplier_debit_ledger_entry.debit_amount)) + float(purchase_details['grant_total'])
                            supplier_debit_ledger_entry.ledger.save()
                            supplier_debit_ledger_entry.debit_amount = purchase_details['grant_total']
                            supplier_debit_ledger_entry.save()
                        transaction_2 = Transaction.objects.get(debit_ledger=supplier_debit_ledger_entry)
                    transaction_2.debit_amount = purchase_details['grant_total']
                    transaction_2.debit_ledger = supplier_debit_ledger_entry 
                    transaction_2.payment_mode = purchase_details['payment_mode']
                    transaction_2.transaction_date = purchase.purchase_invoice_date
                    transaction_2.save()
                    credit_ledger = None
                    if purchase.payment_mode == 'cash':
                        credit_ledger = Ledger.objects.get(account_code="1005")
                    elif purchase.payment_mode == 'card' or purchase.payment_mode == 'cheque':
                        credit_ledger = transaction_2.credit_ledger.ledger
                    credit_entry = transaction_2.credit_ledger
                    if credit_entry.ledger != credit_ledger:
                        credit_entry.ledger.balance = (float(credit_entry.ledger.balance) + float(purchase.grant_total)) 
                        credit_entry.ledger.save()
                        credit_entry.ledger = credit_ledger
                        credit_ledger.balance = float(credit_ledger.balance) - float(purchase_details['grant_total'])
                        credit_ledger.save()
                    else:
                        credit_ledger = credit_entry.ledger
                        credit_ledger.balance = (float(credit_ledger.balance) + float(purchase.grant_total)) - float(purchase_details['grant_total'])
                        credit_ledger.save()
                    credit_entry.credit_amount = purchase_details['grant_total']
                    credit_entry.save()
                    transaction_2.credit_ledger = credit_entry
                    transaction_2.credit_amount = purchase_details['grant_total']
                    transaction_2.save()

            else:
                if float(purchase.grant_total) != float(purchase_details['grant_total']):
                    debit_purchase_entry = transaction_1.debit_ledger
                    new_purchase_amount = float(purchase_details['grant_total']) - float(purchase_details['purchase_tax'])
                    if float(debit_purchase_entry.debit_amount) != float(new_purchase_amount):
                        purchase_ledger = debit_purchase_entry.ledger
                        purchase_ledger.balance = (float(purchase_ledger.balance) - float(debit_purchase_entry.debit_amount)) + float(new_purchase_amount)
                        purchase_ledger.save()
                        debit_purchase_entry.debit_amount = new_purchase_amount
                        debit_purchase_entry.save()
                    transaction_1.debit_ledger = debit_purchase_entry
                    transaction_1.debit_amount = debit_purchase_entry.debit_amount
                    transaction_1.save()
                    credit_entry = transaction_1.credit_ledger
                    credit_ledger = credit_entry.ledger
                    if credit_entry.credit_amount != purchase_details['grant_total']:
                        credit_ledger.balance = (float(credit_ledger.balance) + float(purchase.grant_total)) - float(purchase_details['grant_total'])
                        credit_ledger.save()
                        credit_entry.credit_amount = purchase_details['grant_total']
                        credit_entry.save()
                        transaction_1.credit_ledger = credit_entry
                        transaction_1.credit_amount = purchase_details['grant_total']
                    transaction_1.transaction_date = purchase.purchase_invoice_date
                    transaction_1.save()
                transaction_2 = Transaction.objects.get(debit_ledger__ledger=purchase.supplier.ledger, transaction_ref=purchase.transaction_reference_no)
                supplier_credit_ledger_entry = transaction_2.credit_ledger
                supplier_debit_ledger_entry = transaction_2.debit_ledger
                if purchase.supplier.id != purchase_details['supplier']:
                    is_new_supplier = True
                    old_supplier_ledger = purchase.supplier.ledger
                    old_supplier_ledger.balance = (float(old_supplier_ledger.balance) + float(purchase.grant_total))
                    
                    new_supplier_ledger = supplier.ledger
                    new_supplier_ledger.balance = float(new_supplier_ledger.balance) - float(purchase_details['grant_total'])
                    purchase.supplier = supplier
                    purchase.save()
                    supplier_credit_ledger_entry.ledger = new_supplier_ledger
                    if float(supplier_credit_ledger_entry.credit_amount) != float(purchase_details['grant_total']):
                        supplier_credit_ledger_entry.credit_amount = purchase_details['grant_total']
                    supplier_credit_ledger_entry.save()
                else:
                    is_new_supplier = False
                    if float(supplier_credit_ledger_entry.credit_amount) != float(purchase_details['grant_total']):
                        supplier_ledger = purchase.supplier.ledger
                        supplier_ledger.balance = (float(supplier_ledger.balance) + float(purchase.grant_total)) - float(purchase_details['grant_total'])
                        supplier_ledger.save()
                        supplier_credit_ledger_entry.credit_amount = purchase_details['grant_total']
                    supplier_credit_ledger_entry.save()
                if is_new_supplier:
                    old_supplier_ledger.balance = (float(old_supplier_ledger.balance) - float(purchase.grant_total))
                    old_supplier_ledger.save()
                    new_supplier_ledger.balance = float(new_supplier_ledger.balance) + float(purchase_details['grant_total'])
                    new_supplier_ledger.save()
                    supplier_debit_ledger_entry.ledger = new_supplier_ledger
                    supplier_debit_ledger_entry.debit_amount = purchase_details['grant_total']
                    supplier_debit_ledger_entry.save()
                else:
                    if float(supplier_debit_ledger_entry.debit_amount) != float(purchase_details['grant_total']):
                        supplier_debit_ledger_entry.ledger.balance = (float(supplier_debit_ledger_entry.ledger.balance) - float(supplier_debit_ledger_entry.debit_amount)) + float(purchase_details['grant_total'])
                        supplier_debit_ledger_entry.ledger.save()
                        supplier_debit_ledger_entry.debit_amount = purchase_details['grant_total']
                        supplier_debit_ledger_entry.save()
                    transaction_2 = Transaction.objects.get(debit_ledger=supplier_debit_ledger_entry)
                transaction_2.debit_amount = purchase_details['grant_total']
                transaction_2.debit_ledger = supplier_debit_ledger_entry 
                transaction_2.payment_mode = purchase_details['payment_mode']
                transaction_2.transaction_date = purchase.purchase_invoice_date
                transaction_2.credit_ledger = supplier_credit_ledger_entry
                transaction_2.credit_amount = purchase_details['grant_total']
                transaction_2.payment_mode = purchase.payment_mode
                transaction_2.save()
        else:
            if purchase_details['supplier']:
                supplier = Supplier.objects.get(id=purchase_details['supplier'])
                transaction_2 = Transaction()
                ledger_entry_credit_supplier = LedgerEntry()
                ledger_entry_credit_supplier.ledger = supplier.ledger
                ledger_entry_credit_supplier.credit_amount = purchase.grant_total
                ledger_entry_credit_supplier.date = purchase.purchase_invoice_date
                ledger_entry_credit_supplier.transaction_reference_number = purchase.transaction_reference_no
                ledger_entry_credit_supplier.save()
                supplier.ledger.balance = float(supplier.ledger.balance) - float(purchase.grant_total)
                supplier.ledger.save()
                ledger_entry_debit_supplier = LedgerEntry()
                ledger_entry_debit_supplier.ledger = supplier.ledger
                ledger_entry_debit_supplier.debit_amount = purchase.grant_total 
                ledger_entry_debit_supplier.date = purchase.purchase_invoice_date
                ledger_entry_debit_supplier.transaction_reference_number = purchase.transaction_reference_no
                ledger_entry_debit_supplier.save()
                if supplier.ledger:
                    supplier.ledger.balance = float(supplier.ledger.balance) + float(purchase.grant_total)
                    supplier.ledger.save()
                purchase.supplier = supplier
                purchase.save()
                transaction_2.transaction_ref = purchase.transaction_reference_no
                transaction_2.debit_ledger = ledger_entry_debit_supplier
                transaction_2.credit_ledger = ledger_entry_credit_supplier
                transaction_2.transaction_date = purchase.purchase_invoice_date
                transaction_2.debit_amount = purchase.grant_total
                transaction_2.credit_amount = purchase.grant_total
                transaction_2.narration = 'By Purchase - '+ str(purchase.purchase_invoice_number)
                transaction_2.payment_mode = purchase.payment_mode
                if purchase.payment_mode == 'cheque':
                    transaction_2.bank_name = purchase.bank_name
                    transaction_2.cheque_number = purchase.cheque_number
                    transaction_2.cheque_date = purchase.cheque_date
                    transaction_2.branch = purchase.branch
                elif purchase.payment_mode == 'card':
                    transaction_2.card_holder_name = purchase.card_holder_name
                    transaction_2.card_no = purchase.card_number
                    transaction_2.bank_name = purchase.bank_name
                transaction_2.save()
            if float(purchase.grant_total) != float(purchase_details['grant_total']):
                transaction_1 = Transaction.objects.get(transaction_ref=purchase.transaction_reference_no, debit_ledger__ledger__account_code=4002)
                debit_purchase_entry = transaction_1.debit_ledger
                new_purchase_amount = float(purchase_details['grant_total']) - float(purchase_details['purchase_tax'])
                if float(debit_purchase_entry.debit_amount) != float(new_purchase_amount):
                    purchase_ledger = debit_purchase_entry.ledger
                    purchase_ledger.balance = (float(purchase_ledger.balance) - float(debit_purchase_entry.debit_amount)) + float(new_purchase_amount)
                    purchase_ledger.save()
                    debit_purchase_entry.debit_amount = new_purchase_amount
                    debit_purchase_entry.save()
                transaction_1.debit_ledger = debit_purchase_entry
                transaction_1.debit_amount = debit_purchase_entry.debit_amount
                transaction_1.save()
                credit_entry = transaction_1.credit_ledger
                credit_ledger = credit_entry.ledger
                if credit_entry.credit_amount != purchase_details['grant_total']:
                    credit_ledger.balance = (float(credit_ledger.balance) + float(purchase.grant_total)) - float(purchase_details['grant_total'])
                    credit_ledger.save()
                    credit_entry.credit_amount = purchase_details['grant_total']
                    credit_entry.save()
                    transaction_1.credit_ledger = credit_entry
                    transaction_1.credit_amount = purchase_details['grant_total']
                transaction_1.transaction_date = purchase.purchase_invoice_date
                transaction_1.save()

        # Transaction 3 - Debit entry for Stock
        debit_stock_ledger = Ledger.objects.get(account_code="1006")
        ledger_stock_entry = LedgerEntry.objects.get(ledger=debit_stock_ledger, transaction_reference_number=purchase.transaction_reference_no)
        transaction_3 = Transaction.objects.get(debit_ledger=ledger_stock_entry)
        stock_amount = float(purchase_details['grant_total']) - float(purchase_details['purchase_tax'])
        if float(ledger_stock_entry.debit_amount) != float(stock_amount):
            debit_stock_ledger.balance = (float(debit_stock_ledger.balance) - float(ledger_stock_entry.debit_amount)) + float(stock_amount)
            debit_stock_ledger.save()
        ledger_stock_entry.debit_amount = stock_amount
        ledger_stock_entry.save()
        transaction_3.debit_amount = stock_amount
        transaction_3.save()
        try:
            stock_value = StockValue.objects.latest('id')
        except Exception as ex:
            stock_value = StockValue()
        if stock_value.stock_by_value is not None:
            stock_value.stock_by_value = float(stock_amount) + float(stock_value.stock_by_value)
        else:
            stock_value.stock_by_value = float(stock_amount)
        stock_value.save()
        # Transaction 4 - Debit Entry for Tax account
        debit_tax_ledger = Ledger.objects.get(account_code="2010")
        try:
            ledger_entry_debit_tax_account = LedgerEntry.objects.get(ledger=debit_tax_ledger, transaction_reference_number=purchase.transaction_reference_no)
            transaction_4 = Transaction.objects.get(debit_ledger=ledger_entry_debit_tax_account)
            if float(purchase.purchase_tax) != float(purchase_details['purchase_tax']):
                debit_tax_ledger.balance = (float(debit_tax_ledger.balance) - float(ledger_entry_debit_tax_account.debit_amount)) + float(purchase_details['purchase_tax'])
                debit_tax_ledger.save()
                ledger_entry_debit_tax_account.debit_amount = purchase_details['purchase_tax']
                ledger_entry_debit_tax_account.save()
            transaction_4.debit_amount = purchase_details['purchase_tax']
            transaction_4.save()
            transaction_4.transaction_date = purchase.purchase_invoice_date
            transaction_4.save()
        except:
            pass
        purchase_items = purchase_details['items']
        purchase.purchase_tax = purchase_details['purchase_tax']
        purchase.grant_total = purchase_details['grant_total']
        purchase.discount = purchase_details['discount']
        total_quantity = 0
        if purchase.payment_mode != 'credit':
            purchase.paid = purchase.grant_total
        else:
            purchase.balance = purchase.grant_total
        purchase.save()
        deleted_items = purchase_details['d_items']
        for purchase_item_data in deleted_items:
            purchase_item = PurchaseItem.objects.get(id=purchase_item_data['purchase_item_id'])
            item = Item.objects.get(id=purchase_item_data['id'])
            batch = Batch.objects.get(id=purchase_item_data['batch'])
            batch_item = BatchItem.objects.get(batch=batch, item=item)
            try:
                uom =  purchase_item_data['purchase_unit']
                purchase_unit = uom['uom']
            except:
                purchase_unit = purchase_item_data['purchase_unit']
            purchased_smallest_quantity = float(purchase_item.quantity) * float(purchase_item.quantity_in_smallest_unit)
            batch_item.quantity_in_purchase_unit = float(batch_item.quantity_in_purchase_unit) - float(purchase_item_data['quantity'])
            batch_item.quantity_in_smallest_unit = float(batch_item.quantity_in_smallest_unit) - float(purchased_smallest_quantity)
            batch_item.save()
            purchase_item.delete()
        for purchase_item_data in purchase_items:
            total_quantity = float(total_quantity) + float(purchase_item_data['quantity'])
        unit_item_discount = float(purchase.discount)/float(total_quantity)
        for purchase_item_data in purchase_items:
            item = Item.objects.get(id=purchase_item_data['id'])
            batch = Batch.objects.get(id=purchase_item_data['batch'])                
            batch_item, batch_item_created = BatchItem.objects.get_or_create(batch=batch, item=item)
            purchase_item, created = PurchaseItem.objects.get_or_create(purchase=purchase, batch_item=batch_item)
            quantity = 0
            try:
                uom =  purchase_item_data['purchase_unit']
                purchase_unit = uom['uom']
            except:
                purchase_unit = purchase_item_data['purchase_unit']
            if item.smallest_unit == purchase_unit:
                quantity = purchase_item_data['quantity']
            else:
                if purchase_unit == 'box':
                    if item.packets_per_box != None:
                        quantity = float(purchase_item_data['quantity']) * float(item.packets_per_box)
                        if item.pieces_per_packet != None:
                            quantity = float(quantity) * float(item.pieces_per_packet)
                            if item.unit_per_piece != None:
                                quantity = float(quantity) * float(item.unit_per_piece)
                        if item.unit_per_packet != None:
                            quantity = float(quantity) * float(item.unit_per_packet)
                    if item.pieces_per_box != None:
                        quantity = float(purchase_item_data['quantity']) * float(item.pieces_per_box)
                        if item.unit_per_piece != None:
                            quantity = float(quantity) * float(item.unit_per_piece)
                if purchase_unit == 'packet':
                    if item.pieces_per_packet != None:
                        quantity = float(purchase_item_data['quantity']) * float(item.pieces_per_packet)
                        if item.unit_per_piece != None:
                            quantity = float(quantity) * float(item.unit_per_piece)
                    elif item.unit_per_packet != None:
                            quantity = float(purchase_item_data['quantity']) * float(item.unit_per_packet)
                if purchase_unit == 'piece':
                    if item.unit_per_piece != None:
                        quantity = float(purchase_item_data['quantity']) * float(item.unit_per_piece)
            if not created:
                if float(purchase_item.quantity) != purchase_item_data['quantity']:
                    old_quantity = purchase_item.quantity
                    old_quantity_in_smallest_unit = float(purchase_item.quantity) * float(purchase_item.quantity_in_smallest_unit)
                    new_smallest_quantity = float(purchase_item_data['quantity']) * float(purchase_item.quantity_in_smallest_unit)
                    batch_item.quantity_in_purchase_unit = (float(batch_item.quantity_in_purchase_unit) - float(purchase_item.quantity))+ float(purchase_item_data['quantity'])
                    batch_item.quantity_in_smallest_unit = (float(batch_item.quantity_in_smallest_unit) - float(old_quantity_in_smallest_unit)) + float(new_smallest_quantity)
                    purchase_item.quantity = purchase_item_data['quantity']
                    purchase_item.quantity_in_smallest_unit = float(quantity) / float(purchase_item_data['quantity'])
            if purchase_item_data['tax_inclusive'] == 'true':
                purchase_item.tax_included = True
            else:
                purchase_item.tax_included = False
            purchase_item.net_amount = purchase_item_data['net_amount']
            purchase_item.unit_discount = unit_item_discount
            purchase_item.save()
            batch_item.save()
        
        transaction_3.transaction_date = purchase.purchase_invoice_date
        
        transaction_3.save()
        res = {
            'result': 'ok',
            'transaction_reference_no': purchase.transaction_reference_no,
        }
        # except Exception as ex:
        #     res = {
        #         'result': 'error',
        #         'error_message': str(ex),
        #         'message': 'Purchase Invoice number already exists',
        #     }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype="application/json")

class PurchaseInvoiceSearch(View):

    def get(self, request, *args, **kwargs):
        invoice_no = request.GET.get('invoice', '')
        print invoice_no
        if invoice_no:
            purchases = Purchase.objects.filter(purchase_invoice_number__istartswith=invoice_no)
        invoice_no_list= []
        if request.is_ajax():
            for purchase in purchases:
                invoice_no_list.append({'invoice_no':purchase.purchase_invoice_number})
            res = {
                'result': 'ok',
                'invoice_nos': invoice_no_list,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')