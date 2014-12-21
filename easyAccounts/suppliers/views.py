import ast
import simplejson
import datetime

from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle, SimpleDocTemplate, Spacer
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import cm

from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.views.generic.base import View
from django.core.urlresolvers import reverse

from models import Supplier
from accounts.models import Ledger, Transaction
from purchases.models import PurchaseItem, Purchase

style = [
    ('FONTSIZE', (0,0), (-1, -1), 12),
    ('FONTNAME',(0,0),(-1,-1),'Helvetica') 
]

para_style = ParagraphStyle('fancy')
para_style.fontSize = 10
para_style.fontName = 'Helvetica'

class AddNewSupplier(View):
    def get(self, request, *args, **kwargs):
        if request.is_ajax() and request.GET.get('supplier_id', ''):
            supplier = Supplier.objects.get(id=request.GET.get('supplier_id', ''))
            supplier_data = supplier.get_json_data()
            response = simplejson.dumps({'supplier': supplier_data})
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'add_supplier.html', {'supplier_id': request.GET.get('supplier', '')})

    def post(self, request, *args, **kwargs):

        supplier_details = ast.literal_eval(request.POST['supplier'])
        if supplier_details.get('id', ''):
            suppliers = Supplier.objects.filter(name=supplier_details['name']).exclude(id=supplier_details['id'])
            if suppliers.count() == 0:
                supplier = Supplier.objects.get(id=supplier_details['id'])
                supplier_obj = supplier.set_attributes(supplier_details)
            else:
                res = {
                    'result': 'error',
                    'message': 'Supplier with this name already exists',
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype="application/json")
        else:
            try:
                supplier = Supplier.objects.get(name=supplier_details['name'])
                res = {
                    'result': 'error',
                    'message': 'Supplier with this name already exists',
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype="application/json")
            except:
                supplier = Supplier.objects.create(name=supplier_details['name'])
                supplier_obj = supplier.set_attributes(supplier_details)
        res = {
            'result': 'ok',
            'supplier': supplier.get_json_data(),
        }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

class EditSupplier(View):
    def get(self, request, *args, **kwargs):
        if request.is_ajax() and request.GET.get('supplier_id', ''):
            supplier = Supplier.objects.get(id=request.GET.get('supplier_id', ''))
            supplier_data = supplier.get_json_data()
            response = simplejson.dumps({'supplier': supplier_data})
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'add_supplier.html', {'supplier_id': request.GET.get('supplier_id', '')})
        

class Suppliers(View):

    def get(self, request, *args, **kwargs):

        suppliers = Supplier.objects.all().order_by('name')
        if request.GET.get('supplier_name', ''):
            suppliers = Supplier.objects.filter(name__istartswith=request.GET.get('supplier_name', '')).order_by('name')
        suppliers_list = []
        if request.is_ajax():
            for supplier in suppliers:
                supplier_data = supplier.get_json_data()
                suppliers_list.append(supplier_data)
            res = {
                'suppliers': suppliers_list,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')

        return render(request, 'suppliers.html', {})

class DeleteSupplier(View):

    def get(self, request, *args, **kwargs):
        
        supplier = Supplier.objects.get(id=request.GET.get('supplier_id', ''))
        if supplier.purchase_set.all().count() == 0:
            supplier.delete()
        else:
            return render(request, 'suppliers.html', {'msg':str(supplier.name) +" can't be deleted"})
        return HttpResponseRedirect(reverse('suppliers'))


class AccountsPayable(View):

    def get(self, request, *args, **kwargs):

        suppliers = Supplier.objects.all()
        supplier_details = []
        if request.is_ajax():
            for supplier in suppliers:
                payment_terms = str(supplier.credit_period) + ' - ' +  supplier.credit_period_parameter
                purchases = Purchase.objects.filter(supplier=supplier, payment_mode='credit')
                for purchase in purchases:
                    if purchase.balance > 0:
                        supplier_details.append({
                            'account_name': supplier.name,
                            'invoice': purchase.purchase_invoice_number,
                            'particulars': 'Purchase',
                            'payment_terms': payment_terms,
                            'amount': purchase.balance,
                        })
            res = {
                'supplier_details': supplier_details,
                'result': 'ok',
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        else:
            if request.GET.get('pdf', ''):
                response = HttpResponse(content_type='application/pdf')
                p = SimpleDocTemplate(response, pagesize=A4)
                elements = []
                d = [['Accounts Payable']]
                t = Table(d, colWidths=(450), rowHeights=25, style=style)
                t.setStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),
                            ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                            ('FONTSIZE', (0,0), (0,0), 15),
                            ])   
                elements.append(t)
                elements.append(Spacer(2,20 ))
                data = []
                data.append(['Account Name', 'Invoice', 'Type/Particulars ','Payment Terms', 'Total Amount'])
                table = Table(data, colWidths=(150, 80, 150, 100, 80), rowHeights=25, style=style)
                table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                            ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                            ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                            ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                            ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                            ('FONTNAME', (0, 0), (-1,-1), 'Helvetica'),
                            ('FONTSIZE', (0,0), (-1,-1), 12),
                            ])
                elements.append(table)
                data = []
                i = 0
                para_style.fontSize = 10
                for supplier in suppliers:
                    payment_terms = str(supplier.credit_period) + ' - ' +  supplier.credit_period_parameter
                    purchases = Purchase.objects.filter(supplier=supplier, payment_mode='credit')
                    for purchase in purchases:
                        if purchase.balance > 0:
                            data.append([Paragraph(supplier.name, para_style), purchase.purchase_invoice_number, 'Purchase', payment_terms, purchase.balance])
                if len(data) > 0:
                    table = Table(data, colWidths=(150, 80, 150, 100, 80),style=style)
                    table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                        ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                        ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                        ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                        ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                        ('FONTNAME', (0, 0), (-1,-1), 'Helvetica'),
                        ('FONTSIZE', (0,0), (-1,-1), 10),
                        ])
                    elements.append(table)
                p.build(elements)  
                return response
            else:
                return render(request, 'account_payable.html', {})

class SupplierStockReport(View):

    def get(self, request, *args, **kwargs):

        supplier_id = request.GET.get('supplier_id', '')
        vendor_wise_stock_details = []
        if supplier_id:
            supplier = Supplier.objects.get(id=supplier_id)
            purchase_items = PurchaseItem.objects.filter(purchase__supplier=supplier).order_by('id')
            batch_ids = []
            batch = []
            for p_item in purchase_items:
                if p_item.batch_item.batch.id not in batch_ids:
                    batch = p_item.get_json_data()
                    vendor_wise_stock_details.append({
                        'item_name': batch['name'],
                        'item_code': batch['code'],
                        'batch_name': batch['batch_name'],
                        'uom': batch['stock_unit'],
                        'stock': batch['stock'],
                    })
                    #vendor_wise_stock_details.append({
                     #   'item_name': p_item.batch_item.item.name,
                      #  'item_code': p_item.batch_item.item.code,
                       # 'batch_name': p_item.batch_item.batch.name,
                       # 'uom': p_item.batch_item.item.uom,
                        #'stock': p_item.batch_item.stock,
                    #})
                    #batch_ids.append(p_item.batch_item.batch.id)
                    batch_ids.append(p_item.get_json_data())
            if request.is_ajax():
                res = {
                    'result': 'ok',
                    'vendor_stock_details': vendor_wise_stock_details
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
                data = []
                heading = 'Vendor Wise Stock Report - '+supplier.name
                d = [[heading]]
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
                for vendor_data in vendor_wise_stock_details:
                    item_name = Paragraph(vendor_data['item_name'], para_style)
                    batch_name = Paragraph(vendor_data['batch_name'], para_style)
                    data.append([item_name, batch_name, vendor_data['stock'], vendor_data['uom']])
                if len(data) > 0:
                    table = Table(data, colWidths=(150, 150, 100, 80), style=style)
                    elements.append(table)
                p.build(elements)  
                return response 
        return render(request, 'vendor_wise_stock_report.html', {})
class SupplierItemReport(View):
    def get(self, request, *args, **kwargs):

        supplier_id = request.GET.get('supplier_id', '')
        vendor_wise_item_details = []
        if supplier_id:
            supplier = Supplier.objects.get(id=supplier_id)
            purchase_items = PurchaseItem.objects.filter(purchase__supplier=supplier).order_by('id')
            #batch_ids = []
            #item_list=[]
            for p_item in purchase_items:
                
                    vendor_wise_item_details.append(
                        p_item.get_json_data()
                    )
                    
            if request.is_ajax():
                res = {
                    'result': 'ok',
                    'vendor_item_details': vendor_wise_item_details
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
                data = []
                heading = 'Vendor Wise Stock Report - '+supplier.name
                d = [[heading]]
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
                data.append(['Item', 'Batch', 'Quantity', 'UOM'])
                table = Table(data, colWidths=(150, 150, 100, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,0), 11),
                            ])  
                elements.append(table)
                elements.append(Spacer(1,.1*cm ))
                data = []
                for vendor_data in vendor_wise_item_details:
                    item_name = Paragraph(vendor_data['item_name'], para_style)
                    batch_name = Paragraph(vendor_data['batch_name'], para_style)
                    data.append([item_name, batch_name, vendor_data['quantity'], vendor_data['uom']])
                if len(data) > 0:
                    table = Table(data, colWidths=(150, 150, 100, 80), style=style)
                    elements.append(table)
                p.build(elements)  
                return response 
        return render(request, 'vendor_wise_item_report.html', {})

class SupplierPaymentReport(View):

    def get(self, request, *args, **kwargs):
        start_date = request.GET.get('start_date', '')
        end_date = request.GET.get('end_date', '')
        supplier_id = request.GET.get('supplier', '')
        supplier_payments = []
        if start_date and end_date and supplier_id:
            start_date = datetime.datetime.strptime(request.GET.get('start_date', ''), '%d/%m/%Y')
            end_date = datetime.datetime.strptime(request.GET.get('end_date', ''), '%d/%m/%Y')
            supplier = Supplier.objects.get(id=supplier_id)
            ledger = supplier.ledger
            supplier_transactions = Transaction.objects.filter(debit_ledger__ledger=ledger,transaction_date__gte=start_date,transaction_date__lte=end_date).order_by('transaction_date')
            for transaction in supplier_transactions:
                supplier_payments.append({
                    'transaction_ref': transaction.transaction_ref,
                    'debit_ledger': transaction.debit_ledger.ledger.name,
                    'debit_ledger_debit': transaction.debit_ledger.debit_amount if transaction.debit_ledger and transaction.debit_ledger.debit_amount else '',
                    'debit_ledger_credit': transaction.debit_ledger.credit_amount if transaction.debit_ledger and transaction.debit_ledger.credit_amount else '',
                    'credit_ledger': transaction.credit_ledger.ledger.name,
                    'credit_ledger_debit': transaction.credit_ledger.debit_amount if transaction.credit_ledger and transaction.credit_ledger.debit_amount else '',
                    'credit_ledger_credit': transaction.credit_ledger.credit_amount if transaction.credit_ledger and transaction.credit_ledger.credit_amount else '',
                    'debit_amount': transaction.debit_amount,
                    'credits': transaction.credit_amount,
                    'date': transaction.transaction_date.strftime('%d/%m/%Y'),
                    'invoice': transaction.invoice,
                    'narration': transaction.narration
                })
            if request.is_ajax():
                res = {
                    'result': 'ok',
                    'supplier_transactions': supplier_payments,
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
                data = []
                heading = 'Vendor Payment Report - '+start_date.strftime('%d/%m/%Y')+' - '+end_date.strftime('%d/%m/%Y') + ' - '+supplier.name
                d = [[heading]]
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
                data.append(['Date', 'Ref no', 'Particulars', 'Debit amt.'])
                table = Table(data, colWidths=( 80, 100, 155, 105), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 11),
                            ])  
                elements.append(table)
                elements.append(Spacer(1,.1*cm ))
                data = []
                for payments in supplier_payments:
                    if payments['invoice']:
                        particulars = Paragraph(payments['invoice'], para_style)
                    else:
                        particulars = Paragraph(payments['narration'], para_style)
                    data.append([payments['date'],payments['transaction_ref'], particulars, payments['debit_amount']])
                if len(data) > 0:
                    table = Table(data, colWidths=(80, 100, 155, 105), style=style)
                    table.setStyle([
                                ('FONTSIZE', (0,0), (-1,0), 10),
                                ])  
                    elements.append(table)
                p.build(elements)  
                return response  
        return render(request, 'supplier_payment_report.html', {})