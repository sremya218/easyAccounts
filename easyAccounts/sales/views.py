# -*- coding: utf-8 -*- 

import simplejson
import ast
import goslate

from datetime import datetime
from reportlab.pdfgen import canvas
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle, SimpleDocTemplate, Spacer
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import magenta, red, green, black
from decimal import *
from num2words import num2words

from django.conf import settings
from django.shortcuts import render
from django.views.generic.base import View
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Q

from customers.models import Customer
from sales.models import (SalesItem, Sale,Invoice, Estimate, EstimateItem,  \
    Receipt, SalesReturn, SalesReturnItem, EditedInvoiceSale, \
    EditedInvoiceSaleItem, EditedReceipt, EditedInvoice, DeliveryNote, \
    DeliverynoteItem)
from inventory.models import Item, BatchItem, Batch,StockValue
from accounts.models import Ledger, LedgerEntry, Transaction
from administration.models import Salesman, SerialNoBill, SerialNoInvoice
from purchases.models import FreightValue
from dashboard.models import PostDatedCheque
from arabic_reshaper import reshape
style = [
    ('FONTNAME',(0,0),(-1,-1),'Helvetica') 
]
sales_receipt_style = [
    ('FONTNAME',(0,0),(-1,-1),'Helvetica') 
]
para_style = ParagraphStyle('fancy')
para_style.fontSize = 10.5
para_style.fontName = 'Helvetica'
# font_path = settings.PROJECT_ROOT.replace("\\", "/")+"/header/KacstOne.ttf"
font_path_regular = settings.PROJECT_ROOT.replace("\\", "/")+"/header/AdobeArabic-Regular.ttf"
# font_path_regular = settings.PROJECT_ROOT.replace("\\", "/")+"/header/AdobeArabic-Italic.ttf"
# font_path_regular = settings.PROJECT_ROOT.replace("\\", "/")+"/header/AdobeArabic-BoldItalic.ttf"
font_path_bold = settings.PROJECT_ROOT.replace("\\", "/")+"/header/AdobeArabic-Bold.ttf"
# font_path = settings.PROJECT_ROOT.replace("\\", "/")+"/header/AdobeArabic-Bold.ttf"
pdfmetrics.registerFont(TTFont('Arabic-normal', font_path_regular))
pdfmetrics.registerFont(TTFont('Arabic-bold', font_path_bold))

def normalReceipt(request):
    transaction_ref = request.GET.get('transaction_ref_no')            
    sale = Sale.objects.get(transaction_reference_no=transaction_ref)
    response = HttpResponse(content_type='application/pdf')
    p = SimpleDocTemplate(response, pagesize=A4)
    elements = []
    data = []
    if sale.bill_type == 'Receipt':
        heading = 'SALES RECEIPT'
    else:
        heading = 'SALES INVOICE'
    d = [[heading]]
    t = Table(d, colWidths=(450), rowHeights=25, style=sales_receipt_style)
    t.setStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),
                ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                ('FONTSIZE', (0,0), (0,0), 15),
                ])   
    elements.append(t)
    elements.append(Spacer(2,20 ))
    data = []
    if sale.invoice_set.all().count() > 0:
        invoice_no = sale.invoice_set.all()[0].invoice_no
    elif sale.receipt_set.all().count() > 0:
        invoice_no = sale.receipt_set.all()[0].receipt_no
    data.append(['Invoice No:', invoice_no, '','Date:', sale.sales_invoice_date.strftime('%d/%m/%Y')])
    table = Table(data, colWidths=(55, 30, 350, 30, 50), rowHeights=25, style=sales_receipt_style)
    table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                ('FONTNAME', (0, 0), (-1,-1), 'Helvetica'),
                ('FONTSIZE', (0,0), (-1,-1), 10.5),
                ])
    elements.append(table)
    data = []
    data.append(['Sold To:', sale.customer.name if sale.customer else ''])
    table = Table(data, colWidths=(50, 460), rowHeights=25, style=sales_receipt_style)
    table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                ('FONTNAME', (0, 0), (-1,-1), 'Helvetica'),
                ('FONTSIZE', (0,0), (-1,-1), 10.5),
                ])
    elements.append(table)
    data = []
    if sale.bill_type == 'Invoice':
        data.append(['Sl.No', 'Item', 'Quantity', 'MRP', 'Tax','Tax Amount', 'Amount'])
        table = Table(data, colWidths=(50, 170, 60, 60, 60, 70, 60), rowHeights=25, style=sales_receipt_style)
    else:
        data.append(['Sl.No', 'Item', 'Quantity', 'MRP','Amount'])
        table = Table(data, colWidths=(80, 180, 80, 80, 80), rowHeights=25, style=sales_receipt_style)
    table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                ('FONTNAME', (0, 0), (-1,-1), 'Helvetica'),
                ('FONTSIZE', (0,0), (-1,-1), 10.5),
                ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                ])
    elements.append(table)
    i = 0
    total_tax_amount = 0
    tax_amount = 0
    net_amount= 0
    data = []   
    for s_item in sale.salesitem_set.all().order_by('id'):
        i = i + 1
        quantity = str(round(s_item.quantity, 2))+" "+str(s_item.uom)
        if s_item.batch_item:
            item_obj = s_item.batch_item.item
        else:
            item_obj = s_item.item
        if sale.bill_type == 'Invoice':
            if item_obj.vat_type:
                tax_percentage = s_item.batch_item.item.vat_type.tax_percentage
                tax_amount = (float(tax_percentage)/100)*(float(s_item.quantity)*float(s_item.mrp))
                total_tax_amount = float(total_tax_amount) + tax_amount
                net_amount = float(s_item.net_amount) - tax_amount
                tax_percentage = str(s_item.batch_item.item.vat_type.tax_percentage) + "%"
            else:
                tax_percentage = ''
            data.append([i, Paragraph(item_obj.name, para_style), quantity, round(s_item.mrp, 2), tax_percentage,tax_amount, round(net_amount,2)])
        else:
            data.append([i, Paragraph(item_obj.name, para_style), quantity, round(s_item.mrp, 2), round(s_item.net_amount,2)])
    if sale.bill_type == 'Invoice':
        table = Table(data, colWidths=(50, 170, 60, 60, 60, 70,60), style=sales_receipt_style)
    else:
        table = Table(data, colWidths=(80, 180, 80, 80, 80),style=sales_receipt_style)
    table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
            ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
            ('BACKGROUND',(0, 0),(-1,-1),colors.white),
            ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
            ('BOX', (0,0), (-1,-1), 0.25, colors.black),
            ('FONTNAME', (0, 0), (-1,-1), 'Helvetica')
            ])
    elements.append(table)
    data = []
    if sale.bill_type == 'Invoice':
        data.append(['Total Tax', str(total_tax_amount)])
    data.append(['Discount', sale.discount])
    data.append(['Round Off', sale.round_off])
    if sale.bill_type == 'Invoice':
        data.append(['Cess', str(sale.cess) + " %"])
    data.append(['Total', sale.grant_total])
    if sale.bill_type == 'Invoice':
        table = Table(data, colWidths=(375, 155), rowHeights=25, style=style)
    else:
        table = Table(data, colWidths=(360, 140), rowHeights=25, style=style)
    table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                ('FONTNAME', (0, 0), (-1,-1), 'Helvetica')
                ])
    elements.append(table)
    data = []
    data.append(['Amount in words: ', num2words(sale.grant_total).title() + ' Only'])
    table = Table(data, colWidths=(80, 435), rowHeights=25, style=style)
    elements.append(table)
    data = []
    data.append(['DECLARATION'])
    table = Table(data, colWidths=(100), rowHeights=25, style=style)
    table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                ('FONTNAME', (0, 0), (-1,-1), 'Helvetica-Bold')
                ])
    elements.append(table)
    data = []
    data.append(['(To be furnished by the seller)'])
    table = Table(data, colWidths=(150), rowHeights=25, style=style)
    elements.append(table)
    data = []
    data.append(['Certified that all the particulars shown in the above tax invoice are true and correct and '])
    table = Table(data, colWidths=(300), rowHeights=25, style=style)
    elements.append(table)
    data = []
    data.append(['that my Registration under KVAT Act 2003 is valid as on the date of this bill.'])
    table = Table(data, colWidths=(500), rowHeights=25, style=style)
    elements.append(table)
    data = []
    # shop_details = Shope.objects.all()
    shop_name = ''
    elements.append(Spacer(2,20 ))
    # if shop_details.count() > 0:
    #     shop_name = shop_details[0].name
    shop_name = str('For ') + shop_name
    para_style.fontSize = 10
    data.append(['', Paragraph(shop_name, para_style)])
    table = Table(data, colWidths=(300, 200), style=sales_receipt_style)
    elements.append(table)
    elements.append(Spacer(2,20 ))
    elements.append(Spacer(2,20 ))
    data = []
    data.append(['','Managing Partner'])
    table = Table(data, colWidths=(300, 200), style=sales_receipt_style)
    elements.append(table)
    p.build(elements)  
    return response

def arabicreceipt(request):
    gs = goslate.Goslate()
    transaction_ref = request.GET.get('transaction_ref_no')            
    sales = Sale.objects.get(transaction_reference_no=transaction_ref)
    # sales_invoice_id = kwargs['sales_invoice_id']
    # sales_invoice = SalesInvoice.objects.get(id=sales_invoice_id)
    # sales = sales_invoice.sales

    response = HttpResponse(content_type='application/pdf')
    p = canvas.Canvas(response, pagesize=(1000, 1200))
    status_code = 200

    y = 1100
    style = [
        ('FONTSIZE', (0,0), (-1, -1), 12),
        ('FONTNAME',(0,0),(-1,-1),'Helvetica') 
    ]

    new_style = [
        ('FONTSIZE', (0,0), (-1, -1), 12),
        ('FONTNAME',(0,0),(-1,-1),'Helvetica') 
    ]

    para_style = ParagraphStyle('fancy')
    para_style.fontSize = 12
    para_style.fontName = 'Helvetica'
    para = Paragraph('<b> INVOICE </b>', para_style)

    data =[['', sales.sales_invoice_date.strftime('%d-%m-%Y'), para , sales.sales_invoice_number]]
    
    table = Table(data, colWidths=[30, 360, 420, 100], rowHeights=50, style=style) 
    # table.setStyle(TableStyle([
    #                ('FONTSIZE', (2,0), (2,0), 30),
    #                ]))     
    table.wrapOn(p, 200, 400)
    table.drawOn(p,50, 975)


    customer_name = ''
    customer_name = sales.customer.name

    data=[['', customer_name, '' ]]

    table = Table(data, colWidths=[30, 540, 60], rowHeights=30, style = style)      
    table.wrapOn(p, 200, 400)
    table.drawOn(p, 50, 935)

    data=[['', '', sales.sales_invoice_date.strftime('%d-%m-%Y')]]

    table = Table(data, colWidths=[450, 120, 70], rowHeights=50, style = style)      

    table.wrapOn(p, 200, 400)
    table.drawOn(p,50, 910)

    # if sales_invoice.quotation or sales_invoice.delivery_note:            
    #     data=[['', '', sales_invoice.delivery_note.delivery_note_number if sales_invoice.delivery_note else sales_invoice.quotation.reference_id]]

    #     table = Table(data, colWidths=[450, 120, 70], rowHeights=40, style = style)      
    #     table.wrapOn(p, 200, 400)
    #     table.drawOn(p,50, 880)

    y = 790

    i = 0
    i = i + 1

    TWOPLACES = Decimal(10) ** -2
    total_amount = 0
    for s_item in sales.salesitem_set.all().order_by('id'):
               
        y = y-40
        if y <= 70:
            y = 760
            p.showPage()
            p = header(p, sales_invoice)
        
        quantity = str(round(s_item.quantity, 2))
        para_style = ParagraphStyle('fancy')
        para_style.fontSize = 12
        para_style.fontName = 'Arabic-bold'
        para = Paragraph(gs.translate(s_item.batch_item.item.name, 'ar'), para_style)
        data1=[[i, s_item.batch_item.item.name, para, quantity, s_item.uom , round(s_item.net_amount,2)]]
        table = Table(data1, colWidths=[50, 100, 440, 80, 90, 100, 50], rowHeights=40, style=style)
        table.wrapOn(p, 200, 400)
        table.drawOn(p,20,y)
        i = i + 1
    y = 600
    if y <= 70:
        y = 760
        p.showPage()
        p = header(p,sales_invoice)

    total_amount_in_words = num2words(sales.grant_total).title() + ' Only'
    quantity = str(round(s_item.quantity, 2))
    para_style = ParagraphStyle('fancy')
    para_style.fontSize = 12
    para_style.fontName = 'Arabic-bold'
    para = Paragraph(gs.translate(total_amount_in_words, 'ar'), para_style)
    data=[[para, sales.grant_total]]  

    table = Table(data, colWidths=[700, 50], rowHeights=40, style = style)      

    table.wrapOn(p, 200, 100)
    table.drawOn(p, 200, 10)

    p.showPage()
    p.save()
    return response

class SalesEntry(View):
    def get(self, request, *args, **kwargs):
    	if request.user.first_name or request.user.last_name:
            name = request.user.first_name + ' '+request.user.last_name 
        else:
            name = request.user.username
        if request.GET.get('transaction_ref_no'):
            return arabicreceipt(request)

        else:
            current_date = datetime.now().date()
            return render(request, 'sales.html', {'current_date': current_date.strftime('%d/%m/%Y'),'prepared_by': name})

    def post(self, request, *args, **kwargs):
        sales_details = ast.literal_eval(request.POST['sales_details']) 
        try:
            sale = Sale()  
            sale.created_by =  request.user  
            sale.customer_tin = sales_details['customer_tin']
            sale.owner_tin = sales_details['owner_tin']
            sale.sales_invoice_date = datetime.strptime(sales_details['invoice_date'], '%d/%m/%Y')
            if sales_details['do_no']:
                sale.do_number = sales_details['do_no']
            sale.bill_type  = sales_details['bill_type']
            try:
                transaction_reference_no = Sale.objects.latest('id').id
                if sales_details['bill_type'] == 'Receipt':
                    sale.transaction_reference_no = 'SREC'+str(transaction_reference_no+1)
                else:
                    sale.transaction_reference_no = 'SINV'+str(transaction_reference_no+1)
            except:
                transaction_reference_no = '1'
                if sales_details['bill_type'] == 'Receipt':
                    sale.transaction_reference_no = 'SREC'+str(transaction_reference_no)
                else:
                    sale.transaction_reference_no = 'SINV'+str(transaction_reference_no)
            sale.payment_mode = sales_details['payment_mode']
            if sales_details['payment_mode'] == 'cheque':
                sale.bank_name = sales_details['bank_name']
                sale.branch = sales_details['branch']
                sale.cheque_number = sales_details['cheque_no']
                sale.cheque_date = datetime.strptime(sales_details['cheque_date'], '%d/%m/%Y')
            elif sales_details['payment_mode'] == 'card':
                sale.bank_name = sales_details['bank_name']
                sale.card_holder_name = sales_details['card_holder_name']
                sale.card_number = sales_details['card_no']
            if sales_details['salesman']:
                salesman = Salesman.objects.get(id=sales_details['salesman'])
                sale.salesman = salesman
            if sales_details['customer']:
                customer = Customer.objects.get(id=sales_details['customer'])
                sale.customer = customer
            if sales_details['discount'] !='':
                sale.discount = sales_details['discount']
            if sales_details['round_off'] != '':
                sale.round_off = sales_details['round_off']
            sale.grant_total = sales_details['grant_total']
            if sales_details['cess'] != '':
                sale.cess = sales_details['cess']
            sales_items = sales_details['items']            
            sale.save()
            if sales_details['deliverynote_id']:
                deliverynote = DeliveryNote.objects.get(id=sales_details['deliverynote_id'])
                sale.deliverynote = deliverynote
                deliverynote.is_converted = True
                deliverynote.save()
            if sales_details['invoice_no']:
                sale.sales_invoice_number = sales_details['invoice_no']
            
            try:
                serial_no_bill = SerialNoBill.objects.latest('id') 
            except:
                serial_no_bill = None
            try:
                serial_no_invoice = SerialNoInvoice.objects.latest('id') 
            except:
                serial_no_invoice = None
            if serial_no_bill and sales_details['bill_type']=='Receipt':
                if serial_no_bill.is_auto_generated:
                    receipt = Receipt()
                    receipt.sales = sale
                    try:
                        receipt_no  = Receipt.objects.latest('id').receipt_no
                        receipt.receipt_no = "RCPT-" + str(int(receipt_no.split('-')[1]) + 1)
                        sale.sales_invoice_number = receipt.receipt_no
                    except Exception as ex:
                        receipt_no = 1
                        receipt.receipt_no = "RCPT-" + str(receipt_no)
                        sale.sales_invoice_number = receipt.receipt_no
                    receipt.save()
                else:
                    receipt = Receipt()
                    receipt.sales = sale
                    try:
                        receipt_no  = Receipt.objects.latest('id').receipt_no
                        receipt.receipt_no = serial_no_bill.prefix+ str(int(receipt_no.split('-')[1]) + 1)
                        sale.sales_invoice_number = receipt.receipt_no
                    except Exception as ex:
                        receipt.receipt_no = serial_no_bill.prefix + str(int(serial_no_bill.starting_no) + 1)
                        sale.sales_invoice_number = receipt.receipt_no
                    receipt.save()
            elif sales_details['bill_type'] == 'Receipt':
                receipt = Receipt()
                receipt.sales = sale
                try:
                    receipt_no  = Receipt.objects.latest('id').receipt_no
                    receipt.receipt_no = "RCPT-" + str(int(receipt_no.split('-')[1]) + 1)
                    sale.sales_invoice_number = receipt.receipt_no
                except Exception as ex:
                    receipt_no = 1
                    receipt.receipt_no = "RCPT-" + str(receipt_no)
                    sale.sales_invoice_number = receipt.receipt_no
                receipt.save()
            if serial_no_invoice and sales_details['bill_type']=='Invoice':
                if serial_no_invoice.is_auto_generated:    
                    invoice = Invoice()
                    invoice.sales = sale
                    try:
                        invoice_no  = Invoice.objects.latest('id').invoice_no
                        invoice.invoice_no = "INVC-" + str(int(invoice_no.split('-')[1]) + 1)
                        sale.sales_invoice_number = invoice.invoice_no
                    except Exception as ex:
                        invoice_no = 1
                        invoice.invoice_no = "INVC-" + str(invoice_no)
                        sale.sales_invoice_number = invoice.invoice_no
                    invoice.invoice_type = "Tax Inclusive"
                    invoice.save()
                else:
                    invoice = Invoice()
                    invoice.sales = sale
                    try:
                        invoice_no  = Invoice.objects.latest('id').invoice_no
                        invoice.invoice_no = serial_no_invoice.prefix+ str(int(invoice_no.split('-')[1]) + 1)
                        sale.sales_invoice_number = invoice.invoice_no
                    except Exception as ex:
                        invoice.invoice_no = serial_no_invoice.prefix + str(int(serial_no_invoice.starting_no) + 1)
                        sale.sales_invoice_number = invoice.invoice_no
                    invoice.invoice_type = "Tax Inclusive"
                    invoice.save()
            elif sales_details['bill_type'] == 'Invoice':
                invoice = Invoice()
                invoice.sales = sale
                try:
                    invoice_no  = Invoice.objects.latest('id').invoice_no
                    invoice.invoice_no = "INVC-" + str(int(invoice_no.split('-')[1]) + 1)
                    sale.sales_invoice_number = invoice.invoice_no
                except Exception as ex:
                    invoice_no = 1
                    invoice.invoice_no = "INVC-" + str(invoice_no)
                    sale.sales_invoice_number = invoice.invoice_no
                invoice.invoice_type = "Tax Inclusive"
                invoice.save()
            sale.save()
            total_tax = 0
            total_cost_price = 0
            total_freight_value = 0
            total_purchase_price = 0
            stock_value_amount = 0
            for item in sales_items:
                print "item", item
                uom =  item['uom']
                selling_unit = item['uom']
                sales_item = SalesItem()
                sales_item.sales = sale
                batch_item_obj = BatchItem.objects.get(batch__id=item['batch_id'],item__id=item['id'])
                if sale.salesman and batch_item_obj.salesman_bonus_quantity:
                    if float(item['quantity']) >= float(batch_item_obj.salesman_bonus_quantity):
                        if batch_item_obj.salesman_bonus_points:
                            if sale.salesman.bonus_point:
                                sale.salesman.bonus_point = float(sale.salesman.bonus_point) + float(batch_item_obj.salesman_bonus_points.bonus_amount)
                            else:
                                sale.salesman.bonus_point = float(batch_item_obj.salesman_bonus_points.bonus_amount)
                            sale.salesman_bonus_point_amount = float(sale.salesman_bonus_point_amount) + float(batch_item_obj.salesman_bonus_points.bonus_amount)
                            sale.salesman.save()
                if sale.customer and batch_item_obj.customer_bonus_quantity:
                    if float(item['quantity']) >= float(batch_item_obj.customer_bonus_quantity):
                        if batch_item_obj.customer_bonus_points:
                            if sale.customer.bonus_point:
                                sale.customer.bonus_point = float(sale.customer.bonus_point) + float(batch_item_obj.customer_bonus_points.bonus_amount)
                            else:
                                sale.customer.bonus_point = float(batch_item_obj.customer_bonus_points.bonus_amount)
                            sale.customer_bonus_point_amount = float(sale.customer_bonus_point_amount) + float(batch_item_obj.customer_bonus_points.bonus_amount)
                            sale.customer.save()
                sale.save()
                sales_item.batch_item = batch_item_obj
                sales_item.quantity = item['quantity']
                sales_item.price_type = item['price_type']
                sales_item.uom = selling_unit
                sales_item.mrp = item['mrp']
                sales_item.net_amount = item['net_amount']                
                sales_item.save()
                total_tax = float(total_tax) + ( (float(sales_item.net_amount)) - (float(sales_item.mrp)*float(sales_item.quantity)))
                item_obj = Item.objects.get(id=item['id'])                
                if item_obj.smallest_unit == selling_unit:
                    quantity = item['quantity']
                else:
                    if selling_unit == 'box':
                        if item_obj.packets_per_box != None:
                            quantity = float(item['quantity']) * float(item_obj.packets_per_box)
                            if item_obj.pieces_per_packet != None:
                                quantity = float(quantity) * float(item_obj.pieces_per_packet)
                                if item_obj.unit_per_piece != None:
                                    quantity = float(quantity) * float(item_obj.unit_per_piece)
                            if item_obj.unit_per_packet != None:
                                quantity = float(quantity) * float(item_obj.unit_per_packet)
                        if item_obj.pieces_per_box != None:
                            quantity = float(item['quantity']) * float(item_obj.pieces_per_box)
                            if item_obj.unit_per_piece != None:
                                quantity = float(quantity) * float(item_obj.unit_per_piece)
                    if selling_unit == 'packet':
                        if item_obj.pieces_per_packet != None:
                            quantity = float(item['quantity']) * float(item_obj.pieces_per_packet)
                            if item_obj.unit_per_piece != None:
                                quantity = float(quantity) * float(item_obj.unit_per_piece)
                        elif item_obj.unit_per_packet != None:
                                quantity = float(item['quantity']) * float(item_obj.unit_per_packet)
                    if selling_unit == 'piece':
                        if item_obj.unit_per_piece != None:
                            quantity = float(item['quantity']) * float(item_obj.unit_per_piece)
                sales_item.quantity_in_purchase_unit = float(item['quantity_in_purchase_unit']) / float(item['quantity'])
                sales_item.quantity_in_smallest_unit = float(quantity) / float(item['quantity'])
                sales_item.save()
                batch_item_obj.quantity_in_purchase_unit = float(batch_item_obj.quantity_in_purchase_unit) - float(quantity)           
                batch_item_obj.quantity_in_smallest_unit = float(batch_item_obj.quantity_in_smallest_unit) - float(quantity)
                # total_cost_price = float(total_cost_price) + float(item['net_cp'])
                # total_freight_value = float(total_freight_value) + float(item['net_freight_charge'])
                sales_item.save()
                batch_item_obj.save()
            sale.sales_tax = total_tax
            sale.save()
            transaction_1 = Transaction()
            ledger_entry_debit_customer = LedgerEntry()
            if sales_details['customer']:
                customer = Customer.objects.get(id=sales_details['customer'])
                ledger_entry_debit_customer.ledger = customer.ledger
            else:
                parent = Ledger.objects.get(name='Sundry Debtors')
                counter_sales_ledger, created = Ledger.objects.get_or_create(name="Counter Sales", parent=parent)
                ledger_entry_debit_customer.ledger = counter_sales_ledger
            ledger_entry_debit_customer.debit_amount = sale.grant_total
            ledger_entry_debit_customer.date = sale.sales_invoice_date
            ledger_entry_debit_customer.transaction_reference_number = sale.transaction_reference_no
            ledger_entry_debit_customer.save()
            ledger_entry_credit_sales = LedgerEntry()
            sales_ledger = Ledger.objects.get(name='Sales')
            ledger_entry_credit_sales.ledger = sales_ledger
            ledger_entry_credit_sales.credit_amount = sales_details['tax_exclusive_total']
            ledger_entry_credit_sales.date = sale.sales_invoice_date
            ledger_entry_credit_sales.transaction_reference_number = sale.transaction_reference_no
            ledger_entry_credit_sales.save()
            transaction_1.credit_ledger = ledger_entry_credit_sales
            transaction_1.debit_ledger = ledger_entry_debit_customer
            transaction_1.transaction_ref = sale.transaction_reference_no
            transaction_1.debit_amount = ledger_entry_debit_customer.debit_amount
            transaction_1.credit_amount = ledger_entry_credit_sales.credit_amount
            sales_ledger.balance = float(sales_ledger.balance) - float(ledger_entry_credit_sales.credit_amount)
            sales_ledger.save()
            if sales_details['customer']:
                customer.ledger.balance = float(customer.ledger.balance) + float(ledger_entry_debit_customer.debit_amount)
                customer.ledger.save()
            else:
                counter_sales_ledger.balance = float(counter_sales_ledger.balance) + float(ledger_entry_debit_customer.debit_amount)
                counter_sales_ledger.save()
            if sale.payment_mode != 'credit':
                if sale.payment_mode == 'cash':
                    debit_ledger = Ledger.objects.get(name="Cash")
                elif sale.payment_mode == 'card' or sale.payment_mode == 'cheque':
                    debit_ledger = Ledger.objects.get(id=sales_details['bank_account_ledger'])
                ledger_entry_debit_accounts = LedgerEntry()
                ledger_entry_debit_accounts.ledger = debit_ledger
                ledger_entry_debit_accounts.debit_amount = sale.grant_total
                ledger_entry_debit_accounts.date = sale.sales_invoice_date
                ledger_entry_debit_accounts.transaction_reference_number = sale.transaction_reference_no
                ledger_entry_debit_accounts.save()

                ledger_entry_credit_customer = LedgerEntry()
                if sales_details['customer']:
                    customer = Customer.objects.get(id=sales_details['customer'])
                    ledger_entry_credit_customer.ledger = customer.ledger
                else:
                    counter_sales_ledger = Ledger.objects.get(name="Counter Sales")
                    ledger_entry_credit_customer.ledger = counter_sales_ledger
                ledger_entry_credit_customer.credit_amount = sale.grant_total
                ledger_entry_credit_customer.date = sale.sales_invoice_date
                ledger_entry_credit_customer.transaction_reference_number = sale.transaction_reference_no
                ledger_entry_credit_customer.save()
                debit_ledger.balance = float(debit_ledger.balance) + float(ledger_entry_debit_accounts.debit_amount)
                debit_ledger.save()
                if sales_details['customer']:
                    customer.ledger.balance = float(customer.ledger.balance) - float(ledger_entry_credit_customer.credit_amount)
                    customer.ledger.save()
                else:
                    counter_sales_ledger.balance = float(counter_sales_ledger.balance) - float(ledger_entry_credit_customer.credit_amount)
                    counter_sales_ledger.save()
                transaction_2 = Transaction()
                transaction_2.credit_ledger = ledger_entry_credit_customer
                transaction_2.debit_ledger = ledger_entry_debit_accounts
                transaction_2.transaction_ref = sale.transaction_reference_no
                transaction_2.debit_amount = sale.grant_total
                transaction_2.credit_amount = sale.grant_total
            if sale.payment_mode != 'credit':
                sale.paid = sale.grant_total
            else:
                sale.balance = sale.grant_total
            sale.save()
            transaction_3 = Transaction()
            credit_stock_ledger = Ledger.objects.get(name="Stock")
            ledger_entry_credit_stock = LedgerEntry()
            ledger_entry_credit_stock.ledger = credit_stock_ledger
            ledger_entry_credit_stock.credit_amount = stock_value_amount
            ledger_entry_credit_stock.date = sale.sales_invoice_date
            ledger_entry_credit_stock.transaction_reference_number = sale.transaction_reference_no
            ledger_entry_credit_stock.save()
            credit_stock_ledger.balance = float(credit_stock_ledger.balance) - float(ledger_entry_credit_stock.credit_amount)
            credit_stock_ledger.save()
            transaction_3.credit_ledger = ledger_entry_credit_stock
            transaction_3.transaction_ref = sale.transaction_reference_no
            transaction_3.credit_amount = ledger_entry_credit_stock.credit_amount
            
            if sales_details['bill_type'] == 'Invoice':
                transaction_4 = Transaction()
                credit_tax_ledger = Ledger.objects.get(name="Output Vat (Sales)")
                ledger_entry_credit_tax_account = LedgerEntry()
                ledger_entry_credit_tax_account.ledger = credit_tax_ledger
                ledger_entry_credit_tax_account.date = sale.sales_invoice_date
                ledger_entry_credit_tax_account.credit_amount = float(sale.grant_total) - float(sales_details['tax_exclusive_total'])
                ledger_entry_credit_tax_account.transaction_reference_number = sale.transaction_reference_no
                ledger_entry_credit_tax_account.save()
                credit_tax_ledger.balance = float(credit_tax_ledger.balance) - float(ledger_entry_credit_tax_account.credit_amount)
                credit_tax_ledger.save()
                transaction_4.credit_ledger = ledger_entry_credit_tax_account
                transaction_4.credit_amount = ledger_entry_credit_tax_account.credit_amount
                transaction_4.transaction_ref = sale.transaction_reference_no
                transaction_4.transaction_date = sale.sales_invoice_date
                transaction_4.narration = 'By Sales - '+ str(sale.sales_invoice_number)
                transaction_4.payment_mode = sale.payment_mode
                if sale.payment_mode != 'credit':
                    if sale.payment_mode == 'cheque':
                         transaction_4.bank_name = sale.bank_name
                         transaction_4.branch = sale.branch
                    elif sale.payment_mode == 'card':
                        transaction_4.bank_name = sale.bank_name
                        transaction_4.card_no = sale.card_number
                        transaction_4.card_holder_name = sale.card_holder_name
                transaction_4.save()
            transaction_1.transaction_date = sale.sales_invoice_date
            transaction_1.narration = 'By Sales - '+ str(sale.sales_invoice_number)
            transaction_1.payment_mode = sale.payment_mode
            if sale.payment_mode != 'credit':
                transaction_2.transaction_date = sale.sales_invoice_date
                transaction_2.narration = 'By Sales - '+ str(sale.sales_invoice_number)
                transaction_2.payment_mode = sale.payment_mode
            transaction_3.transaction_date = sale.sales_invoice_date
            transaction_3.narration = 'By Sales - '+ str(sale.sales_invoice_number)
            transaction_3.payment_mode = sale.payment_mode

            if sale.payment_mode != 'credit':
                if sale.payment_mode == 'cheque':
                    transaction_1.bank_name = sale.bank_name
                    transaction_2.bank_name = sale.bank_name
                    transaction_3.bank_name = sale.bank_name
                    transaction_1.cheque_number = sale.cheque_number
                    transaction_1.cheque_date = sale.cheque_date
                    transaction_1.branch = sale.branch
                    transaction_2.cheque_number = sale.cheque_number
                    transaction_2.cheque_date = sale.cheque_date
                    transaction_2.branch = sale.branch
                    transaction_3.cheque_number = sale.cheque_number
                    transaction_3.cheque_date = sale.cheque_date
                    transaction_3.branch = sale.branch
                elif sale.payment_mode == 'card':
                    transaction_1.bank_name = sale.bank_name
                    transaction_2.bank_name = sale.bank_name
                    transaction_3.bank_name = sale.bank_name
                    transaction_1.card_holder_name = sale.card_holder_name
                    transaction_1.card_no = sale.card_number
                    transaction_2.card_holder_name = sale.card_holder_name
                    transaction_2.card_no = sale.card_number
                    transaction_3.card_holder_name = sale.card_holder_name
                    transaction_3.card_no = sale.card_number
                transaction_2.save()
            transaction_1.save()
            transaction_3.save()
            
            try:
                stock_value = StockValue.objects.latest('id')
            except Exception as ex:
                stock_value = StockValue()
            if stock_value.stock_by_value is not None:
                stock_value.stock_by_value = float(stock_value.stock_by_value) - float(total_cost_price)
            else:
                stock_value.stock_by_value = 0 - float(total_cost_price)
            stock_value.save()
            try:
                freight = FreightValue.objects.latest('id')
            except:
                freight = FreightValue()
            if freight.freight_value is not None:
                freight.freight_value = float(freight.freight_value) - float(total_freight_value)
            else:
                freight.freight_value = 0 - float(total_freight_value)
            freight.save()
            if sale.payment_mode == 'cheque':
                post_dated_cheque = PostDatedCheque()
                type_name = 'sales'
                post_dated_cheque_obj = post_dated_cheque.set_attributes(type_name,sale)
                deleted = delete_post_dated_cheque_entries()
            res = {
                'result': 'ok',
                'message': 'Transaction saved',
                'transaction_reference_no': sale.transaction_reference_no,
            }
        except Exception as ex:
            print str(ex)
            res = {
                'result': 'error',
                'message': 'Transaction failed'+ str(ex)
            }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')
class SalesView(View):

    def get(self, request, *args, **kwargs):
        if request.is_ajax():
            sales_invoice = request.GET.get('ref_no', '')
            sale = []
            sales_details = {}
            sales_items_details = []
            if sales_invoice:
                sales = Sale.objects.filter(Q(sales_invoice_number=sales_invoice)|Q(transaction_reference_no=sales_invoice))
                if len(sales) > 0:
                    for sale in sales:
                        sale = sale
            if len(sales) == 0:
                receipts = Receipt.objects.filter(Q(receipt_no=sales_invoice))
                if len(receipts) > 0:
                    for receipt in receipts:
                        sale = receipt.sales
            if len(sales) == 0 and len(receipts) == 0:
                invoices = Invoice.objects.filter(Q(invoice_no=sales_invoice))
                if len(invoices) > 0:
                    for invoice in invoices:
                        sale = invoice.sales
            if sale:
                sales_data = sale.get_json_data()
                res = {
                    'sales_view': sales_data,
                    'result': 'ok',
                }
            else:
                res = {
                    'message': 'No Sales found',
                    'result': 'error',
                }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'sales_view.html', {})

class BillToInvoice(View):

    def get(self, request, *args, **kwargs):
        if request.is_ajax():
            sales_invoice = request.GET.get('ref_no', '')
            sale = []
            sales_details = {}
            sales_items_details = []
            if sales_invoice:
                sales = Sale.objects.filter(Q(sales_invoice_number=sales_invoice)|Q(transaction_reference_no=sales_invoice))
                if len(sales) > 0:
                    for sale in sales:
                        sale = sale
            if len(sales) == 0:
                receipts = Receipt.objects.filter(Q(receipt_no=sales_invoice))
                if len(receipts) > 0:
                    for receipt in receipts:
                        sale = receipt.sales
            if len(sales) == 0 and len(receipts) == 0:
                invoices = Invoice.objects.filter(Q(invoice_no=sales_invoice))
                if len(invoices) > 0:
                    for invoice in invoices:
                        sale = invoice.sales
            if sale:
                sales_data = sale.get_json_data()
                res = {
                    'sales': sales_data,
                    'result': 'ok',
                }
            else:
                res = {
                    'message': 'No Sales found',
                    'result': 'error',
                }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'receipt_to_invoice.html', {})

    def post(self, request, *args, **kwargs):
        sales_details = ast.literal_eval(request.POST['sales_details']) 
        # try:
        sale = EditedInvoiceSale()  
        sale.created_by =  request.user  
        sale.sales_invoice_date = datetime.strptime(sales_details['invoice_date'], '%d/%m/%Y')
        if sales_details['do_no']:
            sale.do_number = sales_details['do_no']
        sale.bill_type  = sales_details['bill_type']
        try:
            transaction_reference_no = EditedInvoiceSale.objects.latest('id').id
            if sales_details['bill_type'] == 'Receipt':
                sale.transaction_reference_no = 'SREC'+str(transaction_reference_no+1)
            else:
                sale.transaction_reference_no = 'SINV'+str(transaction_reference_no+1)
        except:
            transaction_reference_no = '1'
            if sales_details['bill_type'] == 'Receipt':
                sale.transaction_reference_no = 'SREC'+str(transaction_reference_no)
            else:
                sale.transaction_reference_no = 'SINV'+str(transaction_reference_no)
        sale.payment_mode = sales_details['payment_mode']
        if sales_details['payment_mode'] == 'cheque':
            sale.bank_name = sales_details['bank_name']
            sale.branch = sales_details['branch']
            sale.cheque_number = sales_details['cheque_no']
            sale.cheque_date = datetime.strptime(sales_details['cheque_date'], '%d/%m/%Y')
        elif sales_details['payment_mode'] == 'card':
            sale.bank_name = sales_details['bank_name']
            sale.card_holder_name = sales_details['card_holder_name']
            sale.card_number = sales_details['card_no']
        if sales_details['salesman']:
            salesman = Salesman.objects.get(id=sales_details['salesman'])
            sale.salesman = salesman
        if sales_details['customer']:
            customer = Customer.objects.get(id=sales_details['customer'])
            sale.customer = customer
        sale.discount = sales_details['discount']
        if sales_details['round_off'] != '':
            sale.round_off = sales_details['round_off']
        sale.grant_total = sales_details['grant_total']
        if sales_details['cess'] != '':
            sale.cess = sales_details['cess']
        sales_items = sales_details['items']
        sale.save()
        try:
            serial_no_bill = SerialNoBill.objects.latest('id') 
        except:
            serial_no_bill = None
        sale.sales_invoice_number = sales_details['invoice_no']
        try:
            serial_no_invoice = SerialNoInvoice.objects.latest('id') 
        except:
            serial_no_invoice = None
        if serial_no_bill and sales_details['bill_type']=='Receipt':
            if serial_no_bill.is_auto_generated:
                receipt = EditedReceipt()
                receipt.edited_invoice_sales = sale
                try:
                    receipt_no  = EditedReceipt.objects.latest('id').receipt_no
                    receipt.receipt_no = "RCPT-" + str(int(receipt_no.split('-')[1]) + 1)
                except Exception as ex:
                    print str(ex)
                    receipt_no = 1
                    receipt.receipt_no = "RCPT-" + str(receipt_no)
                receipt.save()
            else:
                receipt = EditedReceipt()
                receipt.edited_invoice_sales = sale
                try:
                    receipt_no  = EditedReceipt.objects.latest('id').receipt_no
                    receipt.receipt_no = serial_no_bill.prefix+ str(int(receipt_no.split('-')[1]) + 1)
                except Exception as ex:
                    print str(ex)
                    receipt.receipt_no = serial_no_bill.prefix + str(int(serial_no_bill.starting_no) + 1)
                
                receipt.save()
        elif sales_details['bill_type'] == 'Receipt':
            receipt = EditedReceipt()
            receipt.edited_invoice_sales = sale
            try:
                receipt_no  = EditedReceipt.objects.latest('id').receipt_no
                receipt.receipt_no = "RCPT-" + str(int(receipt_no.split('-')[1]) + 1)
            except Exception as ex:
                print str(ex)
                receipt_no = 1
                receipt.receipt_no = "RCPT-" + str(receipt_no)
            receipt.save()
        if serial_no_invoice and sales_details['bill_type']=='Invoice':
            if serial_no_invoice.is_auto_generated: 
                invoice = EditedInvoice()
                invoice.edited_invoice_sales = sale
                try:
                    invoice_no  = EditedInvoice.objects.latest('id').invoice_no

                    invoice.invoice_no = "INVC-" + str(int(invoice_no.split('-')[1]) + 1)
                except Exception as ex:
                    print str(ex)
                    invoice_no = 1
                    invoice.invoice_no = "INVC-" + str(invoice_no)
                invoice.invoice_type = "Tax Inclusive"
                invoice.save()
            else:
                invoice = EditedInvoice()
                invoice.edited_invoice_sales = sale
                try:
                    invoice_no  = EditedInvoice.objects.latest('id').invoice_no
                    invoice.invoice_no = serial_no_invoice.prefix+ str(int(invoice_no.split('-')[1]) + 1)
                except Exception as ex:
                    print str(ex)
                    invoice.invoice_no = serial_no_invoice.prefix + str(int(serial_no_invoice.starting_no) + 1)
                invoice.invoice_type = "Tax Inclusive"
                invoice.save()
        elif sales_details['bill_type'] == 'Invoice':
            invoice = EditedInvoice()
            invoice.edited_invoice_sales = sale
            try:
                invoice_no  = EditedInvoice.objects.latest('id').invoice_no
                print invoice_no,"invoice_no"
                invoice.invoice_no = "INVC-" + str(int(invoice_no.split('-')[1]) + 1)
            except Exception as ex:
                print str(ex)
                invoice_no = 1
                invoice.invoice_no = "INVC-" + str(invoice_no)
            invoice.invoice_type = "Tax Inclusive"
            invoice.save()

        total_cost_price = 0
        total_freight_value = 0
        total_purchase_price = 0
        stock_value_amount = 0
        for item in sales_items:
            uom =  item['uom']
            selling_unit = uom
            sales_item = EditedInvoiceSaleItem()
            sales_item.edited_invoice_sales = sale
            batch_item_obj = BatchItem.objects.get(batch__id=item['batch_id'],item__id=item['item_id'])
            sales_item.batch_item = batch_item_obj
            sales_item.quantity = item['quantity']
            sales_item.price_type = item['price_type']
            sales_item.uom = selling_unit
            sales_item.mrp = item['mrp']
            sales_item.net_amount = item['net_amount']                
            sales_item.save()
            item_obj = Item.objects.get(id=item['item_id'])                
            if item_obj.smallest_unit == selling_unit:
                quantity = item['quantity']
            else:
                if selling_unit == 'box':
                    if item_obj.packets_per_box != None:
                        quantity = float(item['quantity']) * float(item_obj.packets_per_box)
                        if item_obj.pieces_per_packet != None:
                            quantity = float(quantity) * float(item_obj.pieces_per_packet)
                            if item_obj.unit_per_piece != None:
                                quantity = float(quantity) * float(item_obj.unit_per_piece)
                        if item_obj.unit_per_packet != None:
                            quantity = float(quantity) * float(item_obj.unit_per_packet)
                    if item_obj.pieces_per_box != None:
                        quantity = float(item['quantity']) * float(item_obj.pieces_per_box)
                        if item_obj.unit_per_piece != None:
                            quantity = float(quantity) * float(item_obj.unit_per_piece)
                if selling_unit == 'packet':
                    if item_obj.pieces_per_packet != None:
                        quantity = float(item['quantity']) * float(item_obj.pieces_per_packet)
                        if item_obj.unit_per_piece != None:
                            quantity = float(quantity) * float(item_obj.unit_per_piece)
                    elif item_obj.unit_per_packet != None:
                            quantity = float(item['quantity']) * float(item_obj.unit_per_packet)
                if selling_unit == 'piece':
                    if item_obj.unit_per_piece != None:
                        quantity = float(item['quantity']) * float(item_obj.unit_per_piece)
            sales_item.quantity_in_purchase_unit = float(item['quantity_in_purchase_unit']) / float(item['quantity'])
            sales_item.quantity_in_smallest_unit = float(quantity) / float(item['quantity'])
            sales_item.save()
        if sales_details['bill_type'] == 'Invoice':
            transaction = Transaction()
            credit_tax_ledger = Ledger.objects.get(name="Output Vat (Sales)")
            ledger_entry_credit_tax_account = LedgerEntry()
            ledger_entry_credit_tax_account.ledger = credit_tax_ledger
            ledger_entry_credit_tax_account.date = sale.sales_invoice_date
            ledger_entry_credit_tax_account.credit_amount = float(sale.grant_total) - float(sales_details['tax_exclusive_total'])
            ledger_entry_credit_tax_account.transaction_reference_number = sale.transaction_reference_no
            ledger_entry_credit_tax_account.save()
            credit_tax_ledger.balance = float(credit_tax_ledger.balance) - float(ledger_entry_credit_tax_account.credit_amount)
            credit_tax_ledger.save()
            transaction.credit_ledger = ledger_entry_credit_tax_account
            transaction.credit_amount = ledger_entry_credit_tax_account.credit_amount
            transaction.transaction_ref = sale.transaction_reference_no
            transaction.transaction_date = sale.sales_invoice_date
            transaction.narration = 'By Edited Sales - '+ str(sale.sales_invoice_number)
            transaction.payment_mode = sale.payment_mode
            if sale.payment_mode != 'credit':
                if sale.payment_mode == 'cheque':
                    transaction.bank_name = sale.bank_name
                    transaction.branch = sale.branch
                elif sale.payment_mode == 'card':
                    transaction.bank_name = sale.bank_name
                    transaction.card_no = sale.card_number
                    transaction.card_holder_name = sale.card_holder_name
            transaction.save()
        res = {
                'result': 'ok',
                'message': 'Transaction saved',
                'transaction_reference_no': sale.transaction_reference_no,
            }
        # except Exception as ex:
        #     print str(ex)
        #     res = {
        #         'result': 'error',
        #         'message': 'Transaction failed'
        #     }   
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

class EditedSalesEntry(View):
    def get(self, request, *args, **kwargs):
        if request.user.first_name or request.user.last_name:
            name = request.user.first_name + ' '+request.user.last_name 
        else:
            name = request.user.username
        if request.GET.get('transaction_ref_no'):
            transaction_ref = request.GET.get('transaction_ref_no')
            
            sale = EditedInvoiceSale.objects.get(transaction_reference_no=transaction_ref)
            response = HttpResponse(content_type='application/pdf')
            p = SimpleDocTemplate(response, pagesize=A4)
            elements = []
            data = []
            if sale.bill_type == 'Receipt':
                heading = 'SALES RECEIPT'
            else:
                heading = 'SALES INVOICE'
            d = [[heading]]
            t = Table(d, colWidths=(450), rowHeights=25, style=sales_receipt_style)
            t.setStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),
                        ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                        ('FONTSIZE', (0,0), (0,0), 15),
                        ])   
            elements.append(t)
            elements.append(Spacer(2,20 ))
            data = []
            if sale.editedinvoice_set.all().count() > 0:
                invoice_no = sale.editedinvoice_set.all()[0].invoice_no
            elif sale.receipt_set.all().count() > 0:
                invoice_no = sale.editedreceipt_set.all()[0].receipt_no
            data.append(['Invoice No:', invoice_no, '','Date:', sale.sales_invoice_date.strftime('%d/%m/%Y')])
            table = Table(data, colWidths=(55, 30, 350, 30, 50), rowHeights=25, style=sales_receipt_style)
            table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                        ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                        ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                        ('FONTNAME', (0, 0), (-1,-1), 'Helvetica'),
                        ('FONTSIZE', (0,0), (-1,-1), 10.5),
                        ])
            elements.append(table)
            data = []
            data.append(['Sold To:', sale.customer.name if sale.customer else ''])
            table = Table(data, colWidths=(50, 460), rowHeights=25, style=sales_receipt_style)
            table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                        ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                        ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                        ('FONTNAME', (0, 0), (-1,-1), 'Helvetica'),
                        ('FONTSIZE', (0,0), (-1,-1), 10.5),
                        ])
            elements.append(table)
            data = []
            if sale.bill_type == 'Invoice':
                data.append(['Sl.No', 'Item', 'Quantity', 'MRP', 'Tax','Tax Amount', 'Amount'])
                table = Table(data, colWidths=(50, 170, 60, 60, 60, 70, 60), rowHeights=25, style=sales_receipt_style)
            else:
                data.append(['Sl.No', 'Item', 'Quantity', 'MRP','Amount'])
                table = Table(data, colWidths=(80, 180, 80, 80, 80), rowHeights=25, style=sales_receipt_style)
            table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                        ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                        ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                        ('FONTNAME', (0, 0), (-1,-1), 'Helvetica'),
                        ('FONTSIZE', (0,0), (-1,-1), 10.5),
                        ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                        ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                        ])
            elements.append(table)
            i = 0
            total_tax_amount = 0
            tax_amount = 0
            net_amount= 0
            data = []   
            for s_item in sale.editedinvoicesaleitem_set.all().order_by('id'):
                i = i + 1
                quantity = str(round(s_item.quantity, 2))+" "+str(s_item.uom)
                if s_item.batch_item:
                    item_obj = s_item.batch_item.item
                else:
                    item_obj = s_item.item
                if sale.bill_type == 'Invoice':
                    if item_obj.vat_type:
                        tax_percentage = s_item.batch_item.item.vat_type.tax_percentage
                        tax_amount = (float(tax_percentage)/100)*(float(s_item.quantity)*float(s_item.mrp))
                        total_tax_amount = float(total_tax_amount) + tax_amount
                        net_amount = float(s_item.net_amount) - tax_amount
                        tax_percentage = str(s_item.batch_item.item.vat_type.tax_percentage) + "%"
                    else:
                        tax_percentage = ''
                    data.append([i, Paragraph(item_obj.name, para_style), quantity, round(s_item.mrp, 2), tax_percentage,tax_amount, round(net_amount,2)])
                else:
                    data.append([i, Paragraph(item_obj.name, para_style), quantity, round(s_item.mrp, 2), round(s_item.net_amount,2)])
            if sale.bill_type == 'Invoice':
                table = Table(data, colWidths=(50, 170, 60, 60, 60, 70,60), style=sales_receipt_style)
            else:
                table = Table(data, colWidths=(80, 180, 80, 80, 80),style=sales_receipt_style)
            table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                    ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                    ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                    ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                    ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                    ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                    ('FONTNAME', (0, 0), (-1,-1), 'Helvetica')
                    ])
            elements.append(table)
            data = []
            if sale.bill_type == 'Invoice':
                data.append(['Total Tax', str(total_tax_amount)])
            data.append(['Discount', sale.discount])
            data.append(['Round Off', sale.round_off])
            if sale.bill_type == 'Invoice':
                data.append(['Cess', str(sale.cess) + " %"])
            data.append(['Total', sale.grant_total])
            if sale.bill_type == 'Invoice':
                table = Table(data, colWidths=(375, 155), rowHeights=25, style=style)
            else:
                table = Table(data, colWidths=(360, 140), rowHeights=25, style=style)
            table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                        ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                        ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                        ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                        ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                        ('FONTNAME', (0, 0), (-1,-1), 'Helvetica')
                        ])
            elements.append(table)
            data = []
            data.append(['Amount in words: ', num2words(sale.grant_total).title() + ' Only'])
            table = Table(data, colWidths=(80, 435), rowHeights=25, style=style)
            elements.append(table)
            data = []
            data.append(['DECLARATION'])
            table = Table(data, colWidths=(100), rowHeights=25, style=style)
            table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                        ('FONTNAME', (0, 0), (-1,-1), 'Helvetica-Bold')
                        ])
            elements.append(table)
            data = []
            data.append(['(To be furnished by the seller)'])
            table = Table(data, colWidths=(150), rowHeights=25, style=style)
            elements.append(table)
            data = []
            data.append(['Certified that all the particulars shown in the above tax invoice are true and correct and '])
            table = Table(data, colWidths=(300), rowHeights=25, style=style)
            elements.append(table)
            data = []
            data.append(['that my Registration under KVAT Act 2003 is valid as on the date of this bill.'])
            table = Table(data, colWidths=(500), rowHeights=25, style=style)
            elements.append(table)
            data = []
            # shop_details = Shope.objects.all()
            shop_name = ''
            elements.append(Spacer(2,20 ))
            # if shop_details.count() > 0:
            #     shop_name = shop_details[0].name
            shop_name = str('For ') + shop_name
            para_style.fontSize = 10
            data.append(['', Paragraph(shop_name, para_style)])
            table = Table(data, colWidths=(300, 200), style=sales_receipt_style)
            elements.append(table)
            elements.append(Spacer(2,20 ))
            elements.append(Spacer(2,20 ))
            data = []
            data.append(['','Managing Partner'])
            table = Table(data, colWidths=(300, 200), style=sales_receipt_style)
            elements.append(table)
            p.build(elements)  
            return response

        else:
            return render(request, 'receipt_to_invoice.html', {})

class SaleReturn(View):

    def get(self, request, *args, **kwargs):
        if request.is_ajax():
            sales_invoice = request.GET.get('sales_invoice_no', '')
            sale = []
            sales_details = []
            sales_items_details = []
            if sales_invoice:
                sales = Sale.objects.filter(Q(sales_invoice_number=sales_invoice)|Q(transaction_reference_no=sales_invoice))
                if len(sales) > 0:
                    for sale in sales:
                        sale = sale
            if len(sales) == 0:
                receipts = Receipt.objects.filter(Q(receipt_no=sales_invoice))
                if len(receipts) > 0:
                    for receipt in receipts:
                        sale = receipt.sales
            if len(sales) == 0 and len(receipts) == 0:
                invoices = Invoice.objects.filter(Q(invoice_no=sales_invoice))
                if len(invoices) > 0:
                    for invoice in invoices:
                        sale = invoice.sales
            if sale:
                sales_items = SalesItem.objects.filter(sales__id=sale.id)
                grant_total = 0
                for sales_item in sales_items:
                    returned_qty = 0.0
                    return_items = SalesReturnItem.objects.filter(sales_item=sales_item)
                    for r_item in return_items:
                        returned_qty = returned_qty + float(r_item.quantity)
                    if sales_item.batch_item:
                        item_obj = sales_item.batch_item.item
                    else:
                        item_obj = sales_item.item
                    if item_obj.vat_type:                            
                        tax = item_obj.vat_type.tax_percentage
                    else:
                        tax = 0
                    try:
                        invoice = Invoice.objects.get(sales=sale)
                        receipt = Receipt.objects.get(sales=sale)
                        tax_excl_amount =  float(sales_item.net_amount) * float(tax/100)
                        net_amount = float(sales_item.mrp) * float(sales_item.quantity)
                        grant_total = (float(grant_total) + float(net_amount))
                        bill_type = 'Receipt'
                    except Exception as ex:
                        print str(ex)
                        net_amount = sales_item.net_amount
                        tax_excl_amount = tax
                        grant_total = float(sale.grant_total) + float(sale.discount)
                        bill_type = sale.bill_type
                    sales_items_details.append({
                        'id': sales_item.id,
                        'item_id': item_obj.id,
                        'item_code': item_obj.code,
                        'item_name': item_obj.name,
                        'item_quantity': sales_item.quantity,
                        'type': item_obj.item_type,
                        'uom': sales_item.uom,
                        'net_amount': net_amount,
                        'tax': tax,
                        'mrp': sales_item.mrp,
                        'returned_qty': returned_qty,
                    })
                grant_total = float(grant_total) - float(sale.discount)
                discount_percent = float(sale.discount)/(float(sale.discount) + float(grant_total))
                sales_details.append({
                    'id': sale.id,
                    'sales_invoice': sale.sales_invoice_number if sale.sales_invoice_number else '',
                    'customer': sale.customer.name if sale.customer else '',
                    'salesman': sale.salesman.first_name + " " + sale.salesman.last_name if sale.salesman else '',
                    'discount': sale.discount,
                    'payment_mode': sale.payment_mode,
                    'grant_total': grant_total,
                    'sales_items': sales_items_details,
                    'bill_type': bill_type,
                    'discount_percent': round(discount_percent, 4),
                })
                print 'sales_invoice:',sale.sales_invoice_number
                sales_items_details = []
            res = {
                'sales_details': sales_details,
                'result': 'ok',
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'sales_return.html', {})

    def post(self, request, *args, **kwargs):
        sales_return_details = ast.literal_eval(request.POST['sales_return'])
        try:
            sales = Sale.objects.get(id=sales_return_details['sales_id'])
            sales_return = SalesReturn()
            sales_return.sales = sales
            sales_return.payment_mode = sales_return_details['payment_mode']
            if sales_return_details['payment_mode'] == 'cheque':
                sales_return.bank_name = sales_return_details['bank_name']
                sales_return.branch = sales_return_details['branch']
                sales_return.cheque_number = sales_return_details['cheque_no']
                sales_return.cheque_date = datetime.strptime(sales_return_details['cheque_date'], '%d/%m/%Y')
            elif sales_return_details['payment_mode'] == 'card':
                sales_return.bank_name = sales_return_details['bank_name']
                sales_return.card_holder_name = sales_return_details['card_holder_name']
                sales_return.card_number = sales_return_details['card_no']
            sales_return.return_invoice_number = sales_return_details['return_invoice']
            sales_return.invoice_date = datetime.strptime(sales_return_details['return_invoice_date'], '%d/%m/%Y')
            sales_return.grant_total = sales_return_details['return_balance'] 
            try:
                transaction_reference_no = SalesReturn.objects.latest('id').id
                if sales.bill_type == 'Receipt':
                    sales_return.transaction_reference_no = 'SRREC'+str(transaction_reference_no+1)
                else:
                    sales_return.transaction_reference_no = 'SRINV'+str(transaction_reference_no+1)
            except:
                transaction_reference_no = '1'
                if sales.bill_type == 'Receipt':
                    sales_return.transaction_reference_no = 'SRREC'+str(transaction_reference_no)
                else:
                    sales_return.transaction_reference_no = 'SINV'+str(transaction_reference_no)
            sales_return.save()
            sales_return_items = sales_return_details['items']
            total_cost_price = 0
            total_freight_value = 0
            stock_amount_value = 0
            total_tax_amount = 0
            for item in sales_return_items:
                if item['returned_qty'] != '' and float(item['returned_qty']) != 0 and item['type'] != 'Services':
                    sales_item = SalesItem.objects.get(id=item['id'])
                    return_item = SalesReturnItem()
                    return_item.sales_return = sales_return
                    return_item.sales_item = sales_item
                    return_item.quantity = item['returned_qty']
                    return_item.net_amount = item['balance']
                    return_item.uom = item['uom']
                    return_item.save()
                    if sales.bill_type == 'Invoice':
                        total_tax_amount = float(total_tax_amount) + (float(return_item.net_amount) - (float(item['mrp'])*float(return_item.quantity)))
                    if item['type'] == 'Stockable':
                        batch_item = sales_item.batch_item
                        purchase_quantity = float(sales_item.quantity_in_purchase_unit) * float(item['returned_qty'])
                        smallest_quantity = float(sales_item.quantity_in_smallest_unit) * float(item['returned_qty'])
                        batch_item.quantity_in_purchase_unit = float(batch_item.quantity_in_purchase_unit) + float(purchase_quantity)
                        batch_item.quantity_in_smallest_unit = float(batch_item.quantity_in_smallest_unit) + float(smallest_quantity)
                        # if batch_item.uom_conversion.purchase_unit == item['uom']:
                        #     quantity = float(return_item.quantity) * float(batch_item.uom_conversion.relation)
                        #     total_cost_price = float(total_cost_price) + (float(batch_item.cost_price) * float(return_item.quantity))
                        #     total_freight_value = float(total_freight_value) + (float(batch_item.freight_charge) * float(return_item.quantity))
                        #     stock_amount_value = float(stock_amount_value) + (float(batch_item.cost_price) * float(return_item.quantity))
                        # else:
                        #     quantity = return_item.quantity
                        #     stock_quantity = float(return_item.quantity) / float(batch_item.uom_conversion.relation)
                        #     total_cost_price = float(total_cost_price) + (float(batch_item.cost_price) * float(stock_quantity))
                        #     total_freight_value = float(total_freight_value) + (float(batch_item.freight_charge) * float(stock_quantity))
                        #     stock_amount_value = float(stock_amount_value) + (float(batch_item.cost_price) * float(stock_quantity))
                        #batch_item.quantity = float(batch_item.quantity) + float(quantity)
                        batch_item.save()


            debit_sales_return_entry = LedgerEntry()
            sales_return_ledger = Ledger.objects.get(name='Sales Return')
            debit_sales_return_entry.ledger = sales_return_ledger
            debit_sales_return_entry.debit_amount = float(sales_return.grant_total) - float(total_tax_amount)
            debit_sales_return_entry.date = sales_return.invoice_date
            debit_sales_return_entry.transaction_reference_number = sales_return.transaction_reference_no
            debit_sales_return_entry.save()
            sales_return_ledger.balance = float(sales_return_ledger.balance) + float(debit_sales_return_entry.debit_amount)
            sales_return_ledger.save()
            credit_customer_entry = LedgerEntry()
            if sales_return_details['customer']:
                customer = Customer.objects.get(name=sales_return_details['customer'])
                credit_customer_entry.ledger = customer.ledger
                customer.ledger.balance = float(customer.ledger.balance) - float(sales_return.grant_total)
                customer.ledger.save()
            else:
                counter_sales_ledger = Ledger.objects.get(name="Counter Sales")
                credit_customer_entry.ledger = counter_sales_ledger
                counter_sales_ledger.balance = float(counter_sales_ledger.balance) - float(sales_return.grant_total)
                counter_sales_ledger.save()
            credit_customer_entry.credit_amount = sales_return.grant_total
            credit_customer_entry.date = sales_return.invoice_date
            credit_customer_entry.transaction_reference_number = sales_return.transaction_reference_no
            credit_customer_entry.save()
            transaction_1 = Transaction()
            transaction_1.debit_ledger = debit_sales_return_entry
            transaction_1.credit_ledger = credit_customer_entry
            transaction_1.transaction_ref = sales_return.transaction_reference_no
            transaction_1.transaction_date = sales_return.invoice_date
            transaction_1.debit_amount = debit_sales_return_entry.debit_amount
            transaction_1.credit_amount = credit_customer_entry.credit_amount
            transaction_1.narration = 'By Sales Return- '+ str(sales_return.return_invoice_number)
            transaction_1.save()

            debit_stock_entry = LedgerEntry()
            stock_ledger = Ledger.objects.get(name='Stock')
            debit_stock_entry.ledger = stock_ledger
            debit_stock_entry.debit_amount = stock_amount_value
            debit_stock_entry.date = sales_return.invoice_date
            debit_stock_entry.transaction_reference_number = sales_return.transaction_reference_no
            debit_stock_entry.save()
            stock_ledger.balance = float(stock_ledger.balance) + stock_amount_value
            stock_ledger.save()

            transaction_2 = Transaction()
            transaction_2.transaction_ref = sales_return.transaction_reference_no
            transaction_2.debit_ledger = debit_stock_entry
            transaction_2.transaction_date = sales_return.invoice_date
            transaction_2.credit_amount = stock_amount_value
            transaction_2.narration = 'By Sales Return- '+ str(sales_return.return_invoice_number)
            transaction_2.save()
            #  For reducing the tax amount on conversion ( Receipt to Invoice )
            try:
                total_tax_on_return = 0
                sale_id = sales_return_details['sales_id']
                sale = Sale.objects.get(id=sale_id)
                receipt = Receipt.objects.get(sales=sale)
                invoice = Invoice.objects.get(sales=sale)
                for item in sales_return_items:
                    if item['returned_qty'] != '' and float(item['returned_qty']) != 0 and item['type'] != 'Services':
                        tot_amount = float(item['returned_qty']) * float(item['price'])
                        tax_amount = float(tot_amount) * (float(item['tax_on_sales']) / 100)
                        ledger = Ledger.objects.get(name="Output Vat (Sales)")
                        ledger.balance = float(ledger.balance) + float(tax_amount)
                        tot_amount = 0
                        tax_amount = 0
                        ledger.save()
            except Exception as ex:
                print str(ex)
                pass
            if sales_return_details['bill_type'] == 'Invoice':
                debit_tax_account_entry = LedgerEntry()
                debit_tax_ledger = Ledger.objects.get(name="Output Vat (Sales)")
                debit_tax_account_entry.ledger = debit_tax_ledger
                debit_tax_account_entry.debit_amount = total_tax_amount
                debit_tax_account_entry.date = sales_return.invoice_date
                debit_tax_account_entry.transaction_reference_number = sales_return.transaction_reference_no
                debit_tax_account_entry.save()
                debit_tax_ledger.balance = float(debit_tax_ledger.balance) + float(total_tax_amount)
                debit_tax_ledger.save()

                credit_cash_bank_entry = LedgerEntry()
                if sales_return.payment_mode == 'cash':
                    credit_ledger = Ledger.objects.get(name="Cash")
                elif sales_return.payment_mode == 'card' or sales_return.payment_mode == 'cheque':
                    credit_ledger = Ledger.objects.get(id=sales_return_details['bank_account_ledger'])
                # credit_cash_ledger = Ledger.objects.get(name="Cash")
                credit_cash_bank_entry.ledger = credit_ledger
                credit_cash_bank_entry.credit_amount = float(total_tax_amount)
                credit_cash_bank_entry.date = sales_return.invoice_date
                credit_cash_bank_entry.transaction_reference_number = sales_return.transaction_reference_no
                credit_cash_bank_entry.save()
                credit_ledger.balance = float(credit_ledger.balance) - float(credit_cash_bank_entry.credit_amount)
                credit_ledger.save()

                transaction_3 = Transaction()
                transaction_3.transaction_ref = sales_return.transaction_reference_no
                transaction_3.credit_ledger = credit_cash_ledger_entry
                transaction_3.debit_ledger = debit_tax_account_entry
                transaction_3.transaction_date = sales_return.invoice_date
                transaction_3.narration = 'By Sales Return- '+ str(sales_return.return_invoice_number)
                transaction_3.save()
            print 'stock value == ', stock_amount_value
            try:
                stock_value = StockValue.objects.latest('id')
            except Exception as ex:
                stock_value = StockValue()
            if stock_value.stock_by_value is not None:
                stock_value.stock_by_value = float(stock_value.stock_by_value) + float(stock_amount_value)
            else:
                stock_value.stock_by_value = float(stock_amount_value)
            stock_value.save()
            try:
                freight = FreightValue.objects.latest('id')
            except:
                freight = FreightValue()
            if freight.freight_value is not None:
                freight.freight_value = float(freight.freight_value) + float(total_freight_value)
            else:
                freight.freight_value = float(total_freight_value)
            freight.save()
            if sales_return.payment_mode == 'cheque':
                post_dated_cheque = PostDatedCheque()
                type_name = 'sales_return'
                post_dated_cheque_obj = post_dated_cheque.set_attributes(type_name, sales_return)
            res = {
                'result': 'ok',
                'transaction_reference_no': sales_return.transaction_reference_no,
            }

        except Exception as ex:
            print str(ex)
            res = {
                'result': 'error',
                'message': 'Return Invoice no already exists',
                'error_message': str(ex),
            }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

class SalesReturnView(View):

    def get(self, request, *args, **kwargs):
        if request.is_ajax():
            invoice_no = request.GET.get('ref_no', '')
            sale = []
            ctx_sales = {}
            ctx_sales_items = []
            try:    
                sales_return = SalesReturn.objects.get(return_invoice_number=invoice_no)
            except Exception as ex:
                try:
                    sales_return = SalesReturn.objects.get(transaction_reference_no=invoice_no)
                except:
                    res = {
                    'message': 'No Sales found',
                    'result': 'error',
                    }
                    response = simplejson.dumps(res)
                    return HttpResponse(response, status=200, mimetype='application/json')
            if sales_return:
                sales_items = sales_return.salesreturnitem_set.all()
                for item in sales_items:
                    ctx_sales_items.append({
                        'id': item.id,
                        'code': item.sales_item.batch_item.item.code,
                        'name': item.sales_item.batch_item.item.name,
                        'batch': item.sales_item.batch_item.batch.name,
                        'item_quantity': item.quantity,
                        'uom': item.uom,
                        'net_amount': item.net_amount,
                        'tax': item.sales_item.batch_item.item.vat_type.tax_percentage if item.sales_item.batch_item.item.vat_type else '',
                        'mrp': item.sales_item.mrp,
                    }) 
                ctx_sales.update({
                    'id': sales_return.id,
                    'sales_invoice': sales_return.return_invoice_number,
                    'invoice_date': sales_return.invoice_date.strftime('%d/%m/%Y'),
                    'customer': sales_return.sales.customer.name if sales_return.sales.customer else '',
                    'salesman': sales_return.sales.salesman.first_name + " " + sales_return.sales.salesman.last_name if sales_return.sales.salesman else '',
                    'grant_total': sales_return.grant_total,
                    'items': ctx_sales_items,
                    'bill_type': sales_return.sales.bill_type,
                    'do_no': sales_return.sales.do_number,
                    'payment_mode': sales_return.sales.payment_mode,
                    'bank_name': sales_return.sales.bank_name if sales_return.sales.bank_name else '',
                    'cheque_date': sales_return.sales.cheque_date.strftime('%d/%m/%Y') if sales_return.sales.cheque_date else '',
                    'cheque_number': sales_return.sales.cheque_number if sales_return.sales.cheque_number else '',
                    'branch': sales_return.sales.branch if sales_return.sales.branch else '',
                    'card_number': sales_return.sales.card_number if sales_return.sales.card_number else '',
                    'card_holder_name': sales_return.sales.card_holder_name if sales_return.sales.card_holder_name else '',
                    'round_off': sales_return.sales.round_off,
                    'roundoff': sales_return.sales.round_off,
                })
                ctx_sales_items = []
                res = {
                    'sales_view': ctx_sales,
                    'result': 'ok',
                }
            else:
                res = {
                    'message': 'No Sales found',
                    'result': 'error',
                }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'sales_return_view.html', {})

class EstimateEntry(View):

    def get(self, request, *args, **kwargs):
       
        current_date = datetime.now().date()
        return render(request, 'estimate.html', {'current_date': current_date.strftime('%d/%m/%Y'),})
        

    def post(self, request, *args, **kwargs):

        if request.is_ajax():
            estimate_details = ast.literal_eval(request.POST['estimate_details'])
            
            try:
                estimate_no_already_exists = Estimate.objects.get(estimate_invoice_number=estimate_details['estimate_no']) 
                res = {
                    'result': 'error',
                    'message': 'estimate no already exists',
                }
            except:
                estimate = Estimate()           
                if estimate_details['bill_type'] == 'NonTaxable':
                    estimate.bill_type = 'Tax Exclusive'
                else:
                    estimate.bill_type = 'Tax Inclusive'
                if estimate_details['estimate_no']:
                    estimate.estimate_invoice_number = estimate_details['estimate_no']
                else:
                    try:
                        invoice_no  = Estimate.objects.latest('id').id + 1
                    except:
                        invoice_no  = 1
                    estimate.auto_invoice_number = "EST" + str(invoice_no)
                    estimate.estimate_invoice_number = estimate.auto_invoice_number
                estimate.estimate_invoice_date = datetime.strptime(estimate_details['estimate_date'], '%d/%m/%Y')
                estimate.do_number = estimate_details['do_no']
                if estimate_details['salesman']:
                    salesman = Salesman.objects.get(id=estimate_details['salesman'])
                    estimate.salesman = salesman
                if estimate_details['customer']:
                    customer = Customer.objects.get(id=estimate_details['customer'])
                    estimate.customer = customer
                estimate.discount = estimate_details['discount']
                estimate.grant_total = estimate_details['grant_total']
                estimate_items = estimate_details['items']
            
                estimate.save()
                for item in estimate_items:
                    estimate_item = EstimateItem()
                    estimate_item.estimate = estimate
                    item_obj = Item.objects.get(id=item['id'])
                    estimate_item.item = item_obj
                    if item_obj.item_type == 'Stockable':
                        batch_item = BatchItem.objects.get(batch__id=item['batch_id'], item__id=item['id'])
                        estimate_item.batch_item = batch_item
                    estimate_item.quantity = item['quantity']
                    estimate_item.uom = item['uom']
                    estimate_item.mrp = item['current_item_price']
                    estimate_item.net_amount = item['net_amount']
                    estimate_item.save()
                estimate.save()
                res = {
                    'estimate_details': estimate_details,
                    'result': 'ok',
                    'id': estimate.id,
                    }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')

class EstimatePdf(View):

    def get(self, request, *args, **kwargs):

        estimate_id = kwargs['estimate_id']
        sale = Estimate.objects.get(id=estimate_id)
        if request.user.first_name or request.user.last_name:
            name = request.user.first_name + ' '+request.user.last_name 
        else:
            name = request.user.username
        response = HttpResponse(content_type='application/pdf')
        p = SimpleDocTemplate(response, pagesize=A4)
        elements = []
        data = []
        if sale.bill_type == 'Tax Exclusive':
            heading = 'Estimate RECEIPT'
        else:
            heading = 'Estimate INVOICE'
        d = [[heading]]
        t = Table(d, colWidths=(450), rowHeights=25, style=sales_receipt_style)
        t.setStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),
                    ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                    ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                    ('FONTSIZE', (0,0), (0,0), 15),
                    ])   
        elements.append(t)
        elements.append(Spacer(2,20 ))
        data = []
        
        invoice_no = sale.estimate_invoice_number
        
        data.append(['Invoice No:', invoice_no, '','Date:', sale.estimate_invoice_date.strftime('%d/%m/%Y')])
        table = Table(data, colWidths=(55, 30, 350, 30, 50), rowHeights=25, style=sales_receipt_style)
        table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                    ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                    ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                    ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                    ('FONTNAME', (0, 0), (-1,-1), 'Helvetica'),
                    ('FONTSIZE', (0,0), (-1,-1), 10.5),
                    ])
        elements.append(table)
        data = []
        data.append(['Sold To:', sale.customer.name if sale.customer else ''])
        table = Table(data, colWidths=(50, 460), rowHeights=25, style=sales_receipt_style)
        table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                    ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                    ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                    ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                    ('FONTNAME', (0, 0), (-1,-1), 'Helvetica'),
                    ('FONTSIZE', (0,0), (-1,-1), 10.5),
                    ])
        elements.append(table)
        data = []
        if sale.bill_type == 'Invoice':
            data.append(['Sl.No', 'Item', 'Quantity', 'MRP', 'Tax','Tax Amount', 'Amount'])
            table = Table(data, colWidths=(50, 170, 60, 60, 60, 70, 60), rowHeights=25, style=sales_receipt_style)
        else:
            data.append(['Sl.No', 'Item', 'Quantity', 'MRP','Amount'])
            table = Table(data, colWidths=(80, 180, 80, 80, 80), rowHeights=25, style=sales_receipt_style)
        table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                    ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                    ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                    ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                    ('FONTNAME', (0, 0), (-1,-1), 'Helvetica'),
                    ('FONTSIZE', (0,0), (-1,-1), 10.5),
                    ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                    ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                    ])
        elements.append(table)
        i = 0
        total_tax_amount = 0
        tax_amount = 0
        net_amount= 0
        data = []   
        for s_item in sale.estimateitem_set.all().order_by('id'):
            i = i + 1
            quantity = str(round(s_item.quantity, 2))+" "+str(s_item.uom)
            if s_item.batch_item:
                item_obj = s_item.batch_item.item
            else:
                item_obj = s_item.item
            if sale.bill_type == 'Invoice':
                if item_obj.vat_type:
                    tax_percentage = s_item.batch_item.item.vat_type.tax_percentage
                    tax_amount = (float(tax_percentage)/100)*(float(s_item.quantity)*float(s_item.mrp))
                    total_tax_amount = float(total_tax_amount) + tax_amount
                    net_amount = float(s_item.net_amount) - tax_amount
                    tax_percentage = str(s_item.batch_item.item.vat_type.tax_percentage) + "%"
                else:
                    tax_percentage = ''
                data.append([i, Paragraph(item_obj.name, para_style), quantity, round(s_item.mrp, 2), tax_percentage,tax_amount, round(net_amount,2)])
            else:
                data.append([i, Paragraph(item_obj.name, para_style), quantity, round(s_item.mrp, 2), round(s_item.net_amount,2)])
        if sale.bill_type == 'Invoice':
            table = Table(data, colWidths=(50, 170, 60, 60, 60, 70,60), style=sales_receipt_style)
        else:
            table = Table(data, colWidths=(80, 180, 80, 80, 80),style=sales_receipt_style)
        table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                ('FONTNAME', (0, 0), (-1,-1), 'Helvetica')
                ])
        elements.append(table)
        data = []
        if sale.bill_type == 'Invoice':
            data.append(['Total Tax', str(total_tax_amount)])
        data.append(['Discount', sale.discount])
        data.append(['Round Off', sale.round_off])
        if sale.bill_type == 'Invoice':
            data.append(['Cess', str(sale.cess) + " %"])
        data.append(['Total', sale.grant_total])
        if sale.bill_type == 'Invoice':
            table = Table(data, colWidths=(375, 155), rowHeights=25, style=style)
        else:
            table = Table(data, colWidths=(360, 140), rowHeights=25, style=style)
        table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                    ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                    ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                    ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                    ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                    ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                    ('FONTNAME', (0, 0), (-1,-1), 'Helvetica')
                    ])
        elements.append(table)
        data = []
        data.append(['Amount in words: ', num2words(sale.grant_total).title() + ' Only'])
        table = Table(data, colWidths=(80, 435), rowHeights=25, style=style)
        elements.append(table)
        data = []
        data.append(['DECLARATION'])
        table = Table(data, colWidths=(100), rowHeights=25, style=style)
        table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                    ('FONTNAME', (0, 0), (-1,-1), 'Helvetica-Bold')
                    ])
        elements.append(table)
        data = []
        data.append(['(To be furnished by the seller)'])
        table = Table(data, colWidths=(150), rowHeights=25, style=style)
        elements.append(table)
        data = []
        data.append(['Certified that all the particulars shown in the above tax invoice are true and correct and '])
        table = Table(data, colWidths=(300), rowHeights=25, style=style)
        elements.append(table)
        data = []
        data.append(['that my Registration under KVAT Act 2003 is valid as on the date of this bill.'])
        table = Table(data, colWidths=(500), rowHeights=25, style=style)
        elements.append(table)
        data = []
        # shop_details = Shope.objects.all()
        shop_name = ''
        elements.append(Spacer(2,20 ))
        # if shop_details.count() > 0:
        #     shop_name = shop_details[0].name
        # shop_name = str('For ') + shop_name
        para_style.fontSize = 10
        data.append(['', Paragraph(shop_name, para_style)])
        table = Table(data, colWidths=(300, 200), style=sales_receipt_style)
        elements.append(table)
        elements.append(Spacer(2,20 ))
        elements.append(Spacer(2,20 ))
        data = []
        data.append(['','Managing Partner'])
        table = Table(data, colWidths=(300, 200), style=sales_receipt_style)
        elements.append(table)
        p.build(elements)  
        return response
        
class EstimateView(View):

    def get(self, request, *args, **kwargs):
        if request.is_ajax():
            estimate_invoice_number  = request.GET.get('estimate_no', '')
            ctx_estimate = {}
            if estimate_invoice_number:
                try:
                    estimate = Estimate.objects.get(estimate_invoice_number=estimate_invoice_number)
                    ctx_items = []
                    for e_item in estimate.estimateitem_set.all():
                        stock = float(e_item.quantity) 
                        
                        ctx_items.append({
                            'name': e_item.item.name,
                            'code': e_item.item.code,
                            'batch_name': e_item.batch_item.batch.name if e_item.batch_item else '',
                            'stock': stock,
                            'tax_percentage': e_item.item.vat_type.tax_percentage if e_item.item.vat_type else '',
                            'mrp': e_item.mrp,
                            'stock_unit': e_item.uom,
                            'net_amount': e_item.net_amount,
                            'quantity': e_item.quantity,
                            
                        })
                    ctx_estimate.update({
                        'id': estimate.id,
                        'items': ctx_items,
                        'estimate_no': estimate.estimate_invoice_number,
                        'estimate_date': estimate.estimate_invoice_date.strftime('%d/%m/%Y'),
                        'payment_mode': estimate.payment_mode,
                        'discount': estimate.discount,
                        'grant_total': estimate.grant_total,
                        'do_no': estimate.do_number,
                        'bill_type': estimate.bill_type,
                        'salesman': estimate.salesman.first_name if estimate.salesman else '',
                        'customer':estimate.customer.name if estimate.customer else '',
                    })
                    res = {
                        'estimate':ctx_estimate,
                        'result': 'ok',
                    }
                except Exception as ex:
                    print str(ex)
                    res = {
                        'result': 'error',
                        'message': 'No Estimate with this Invoice No',
                        'estimate':ctx_estimate,
                    }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'estimate_view.html', {})

class DeliverynoteEntry(View):

    def get(self, request, *args, **kwargs):
       
        current_date = datetime.now().date()
        return render(request, 'deliveryreport.html', {'current_date': current_date.strftime('%d/%m/%Y'),})
    def post(self, request, *args, **kwargs):

        if request.is_ajax():
            delivery_details = ast.literal_eval(request.POST['delivery_details'])
            
            try:
                deliverynote_no_already_exists = DeliveryNote.objects.get(deliverynote_invoice_number=delivery_details['deliverynote_no']) 
                res = {
                    'result': 'error',
                    'message': 'delivery no already exists',
                }
            except:
                delivery = DeliveryNote()           
                if delivery_details['bill_type'] == 'NonTaxable':
                    delivery.bill_type = 'Tax Exclusive'
                else:
                    delivery.bill_type = 'Tax Inclusive'
                if delivery_details['deliverynote_no']:
                    delivery.deliverynote_invoice_number = delivery_details['deliverynote_no']
                else:
                    try:
                        invoice_no  = DeliveryNote.objects.latest('id').id + 1
                    except:
                        invoice_no  = 1
                    #console.log(invoice_no);
                    delivery.auto_invoice_number = "DEL" + str(invoice_no)
                    delivery.deliverynote_invoice_number = delivery.auto_invoice_number
                delivery.deliverynote_invoice_date = datetime.strptime(delivery_details['deliverynote_date'], '%d/%m/%Y')
                delivery.do_number = delivery_details['do_no']
                if delivery_details['salesman']:
                    salesman = Salesman.objects.get(id=delivery_details['salesman'])
                    delivery.salesman = salesman
                if delivery_details['customer']:
                    customer = Customer.objects.get(id=delivery_details['customer'])
                    delivery.customer = customer
                delivery.discount = delivery_details['discount']
                delivery.grant_total = delivery_details['grant_total']
                delivery_items = delivery_details['items']
            
                delivery.save()
                for item in delivery_items:
                    delivery_item = DeliverynoteItem()
                    delivery_item.delivery = delivery
                    item_obj = Item.objects.get(id=item['id'])
                    delivery_item.item = item_obj
                    if item_obj.item_type == 'Stockable':
                        batch_item = BatchItem.objects.get(batch__id=item['batch_id'], item__id=item['id'])
                        delivery_item.batch_item = batch_item
                    delivery_item.quantity = item['quantity']
                    uom = item['uom']
                    selling_unit = uom['uom']
                    delivery_item.uom = selling_unit
                    delivery_item.price_type = item['price_type']
                    delivery_item.mrp = item['current_item_price']
                    delivery_item.net_amount = item['net_amount']
                    delivery_item.save()
                delivery.save()
                res = {
                    'delivery_details': delivery_details,
                    'result': 'ok',
                    'id': delivery.id,
                    }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json') 
        #return render(request, 'deliveryreport.html', {})

class DeliverynotePdf(View):

    def get(self, request, *args, **kwargs):

        delivery_id = kwargs['delivery_id']
        deliverynote = DeliveryNote.objects.get(id=delivery_id)
        if request.user.first_name or request.user.last_name:
            name = request.user.first_name + ' '+request.user.last_name 
        else:
            name = request.user.username
        response = HttpResponse(content_type='application/pdf')
        p = SimpleDocTemplate(response, pagesize=A4)
        elements = []
        data = []
        if deliverynote.bill_type == 'Tax Exclusive':
            heading = 'DeliveryNote Receipt'
        else:
            heading = 'DeliveryNote Invoice'
        d = [[heading]]
        t = Table(d, colWidths=(450), rowHeights=25, style=sales_receipt_style)
        t.setStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),
                    ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                    ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                    ('FONTSIZE', (0,0), (0,0), 15),
                    ])   
        elements.append(t)
        elements.append(Spacer(2,20 ))
        data = []
        
        invoice_no = deliverynote.deliverynote_invoice_number
        
        data.append(['Invoice No:', invoice_no, '','Date:', deliverynote.deliverynote_invoice_date.strftime('%d/%m/%Y') if deliverynote.deliverynote_invoice_date else '' ])
        table = Table(data, colWidths=(55, 30, 350, 30, 50), rowHeights=25, style=sales_receipt_style)
        table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                    ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                    ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                    ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                    ('FONTNAME', (0, 0), (-1,-1), 'Helvetica'),
                    ('FONTSIZE', (0,0), (-1,-1), 10.5),
                    ])
        elements.append(table)
        data = []
        data.append(['Sold To:', deliverynote.customer.name if deliverynote.customer else ''])
        table = Table(data, colWidths=(50, 460), rowHeights=25, style=sales_receipt_style)
        table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                    ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                    ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                    ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                    ('FONTNAME', (0, 0), (-1,-1), 'Helvetica'),
                    ('FONTSIZE', (0,0), (-1,-1), 10.5),
                    ])
        elements.append(table)
        data = []
        if deliverynote.bill_type == 'Invoice':
            data.append(['Sl.No', 'Item', 'Quantity', 'MRP', 'Tax','Tax Amount', 'Amount'])
            table = Table(data, colWidths=(50, 170, 60, 60, 60, 70, 60), rowHeights=25, style=sales_receipt_style)
        else:
            data.append(['Sl.No', 'Item', 'Quantity', 'MRP','Amount'])
            table = Table(data, colWidths=(80, 180, 80, 80, 80), rowHeights=25, style=sales_receipt_style)
        table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                    ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                    ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                    ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                    ('FONTNAME', (0, 0), (-1,-1), 'Helvetica'),
                    ('FONTSIZE', (0,0), (-1,-1), 10.5),
                    ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                    ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                    ])
        elements.append(table)
        i = 0
        total_tax_amount = 0
        tax_amount = 0
        net_amount= 0
        data = []   
        for s_item in deliverynote.deliverynoteitem_set.all().order_by('id'):
            i = i + 1
            quantity = str(round(s_item.quantity, 2))+" "+str(s_item.uom)
            if s_item.batch_item:
                item_obj = s_item.batch_item.item
            else:
                item_obj = s_item.item
            if deliverynote.bill_type == 'Invoice':
                if item_obj.vat_type:
                    tax_percentage = s_item.batch_item.item.vat_type.tax_percentage
                    tax_amount = (float(tax_percentage)/100)*(float(s_item.quantity)*float(s_item.mrp))
                    total_tax_amount = float(total_tax_amount) + tax_amount
                    net_amount = float(s_item.net_amount) - tax_amount
                    tax_percentage = str(s_item.batch_item.item.vat_type.tax_percentage) + "%"
                else:
                    tax_percentage = ''
                data.append([i, Paragraph(item_obj.name, para_style), quantity, round(s_item.mrp, 2), tax_percentage,tax_amount, round(net_amount,2)])
            else:
                data.append([i, Paragraph(item_obj.name, para_style), quantity, round(s_item.mrp, 2), round(s_item.net_amount,2)])
        if deliverynote.bill_type == 'Invoice':
            table = Table(data, colWidths=(50, 170, 60, 60, 60, 70,60), style=sales_receipt_style)
        else:
            table = Table(data, colWidths=(80, 180, 80, 80, 80),style=sales_receipt_style)
        table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                ('FONTNAME', (0, 0), (-1,-1), 'Helvetica')
                ])
        elements.append(table)
        data = []
        if deliverynote.bill_type == 'Invoice':
            data.append(['Total Tax', str(total_tax_amount)])
        data.append(['Discount', deliverynote.discount])
        data.append(['Round Off', deliverynote.round_off])
        if deliverynote.bill_type == 'Invoice':
            data.append(['Cess', str(deliverynote.cess) + " %"])
        data.append(['Total', deliverynote.grant_total])
        if deliverynote.bill_type == 'Invoice':
            table = Table(data, colWidths=(375, 155), rowHeights=25, style=style)
        else:
            table = Table(data, colWidths=(360, 140), rowHeights=25, style=style)
        table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                    ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                    ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                    ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                    ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                    ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                    ('FONTNAME', (0, 0), (-1,-1), 'Helvetica')
                    ])
        elements.append(table)
        #data = []
        #data.append(['Amount in words: ', num2words(deliverynote.grant_total).title() + ' Only'])
        #table = Table(data, colWidths=(80, 435), rowHeights=25, style=style)
        #elements.append(table)
        #data = []
        #data.append(['DECLARATION'])
        #table = Table(data, colWidths=(100), rowHeights=25, style=style)
        #table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                    #('FONTNAME', (0, 0), (-1,-1), 'Helvetica-Bold')
                    #])
        #elements.append(table)
        #data = []
        #data.append(['(To be furnished by the seller)'])
        #table = Table(data, colWidths=(150), rowHeights=25, style=style)
        #elements.append(table)
        #data = []
        #data.append(['Certified that all the particulars shown in the above tax invoice are true and correct and '])
        #table = Table(data, colWidths=(300), rowHeights=25, style=style)
        #elements.append(table)
        #data = []
        #data.append(['that my Registration under KVAT Act 2003 is valid as on the date of this bill.'])
        #table = Table(data, colWidths=(500), rowHeights=25, style=style)
        #elements.append(table)
        #data = []
        #shop_name = ''
        #elements.append(Spacer(2,20 ))
        #para_style.fontSize = 10
        #data.append(['', Paragraph(shop_name, para_style)])
        #table = Table(data, colWidths=(300, 200), style=sales_receipt_style)
        #elements.append(table)
        #elements.append(Spacer(2,20 ))
        #elements.append(Spacer(2,20 ))
        #data = []
        #data.append(['','Managing Partner'])
        #table = Table(data, colWidths=(300, 200), style=sales_receipt_style)
        #elements.append(table)
        p.build(elements)  
        return response    

class DeliverynoteView(View):
    def get(self, request, *args, **kwargs):
        if request.is_ajax():
            deliverynote_invoice_number = request.GET.get('deliverynote_no', '')
            delivery_details = {}
            if deliverynote_invoice_number:
                try:
                    delivery = DeliveryNote.objects.get(deliverynote_invoice_number = deliverynote_invoice_number)
                    delivery_details = delivery.get_json_data()
                    
                    res = {
                        'delivery':delivery_details,
                        'result': 'ok',
                    }
                except Exception as ex:
                    print str(ex)
                    res = {
                        'result': 'error',
                        'message': 'No Deliverynote with this Invoice No',
                        'delivery':delivery_details,
                    }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'deliverynote_view.html', {})

class SalesReport(View):

    def get(self, request, *args, **kwargs):

        start_date = request.GET.get('start_date', '')
        end_date = request.GET.get('end_date', '')
        if not start_date and not end_date:
            return render(request, 'sales_report.html', {})
        else:
            startdate = datetime.strptime(start_date, '%d/%m/%Y')
            enddate = datetime.strptime(end_date, '%d/%m/%Y')
            if request.user.is_superuser:
                print "sdsa"
                sales = Sale.objects.filter(sales_invoice_date__gte=startdate,sales_invoice_date__lte=enddate ).order_by('sales_invoice_date')
                print sales
            else:
                sales = Sale.objects.filter(sales_invoice_date__gte=startdate,sales_invoice_date__lte=enddate ).exclude(bill_type='Receipt').order_by('sales_invoice_date')
            sales_details = []
            if request.is_ajax():
                for sale in sales:
                    sales_details.append(sale.get_json_data())
                res = {
                    'sales_details': sales_details,
                    'result': 'ok',
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
            else:
                response = HttpResponse(content_type='application/pdf')
                canvas_paper = canvas.Canvas(response, pagesize=(1000, 1250))
                y = 1150
                status_code = 200
                canvas_paper.setFontSize(20)
                canvas_paper.drawCentredString(500, y, 'Sales Report - ' + start_date + ' - ' +end_date )
                y1 = y - 100
                canvas_paper.setFontSize(12)
                # if request.user.is_superuser:
                canvas_paper.drawString(50, y - 100, 'Date')
                canvas_paper.drawString(120, y - 100, 'Invoice')
                canvas_paper.drawString(170, y - 100, 'Transaction')
                canvas_paper.drawString(250, y - 100, 'Salesman')
                canvas_paper.drawString(400, y - 100, 'Customer')
                canvas_paper.drawString(570, y - 100, 'Payment')
                canvas_paper.drawString(650, y - 100, 'Total')
                canvas_paper.drawString(730, y - 100, 'Discount')
                canvas_paper.drawString(800, y - 100, 'Tax')
                canvas_paper.drawString(860, y - 100, 'Round off')
                y1 = y1 - 30
                total = 0
                total_discount = 0
                for sale in sales:
                    if sale.invoice_set.all().count() > 0:
                        invoice_no = sale.invoice_set.all()[0].invoice_no
                    else:
                        invoice_no = sale.receipt_set.all()[0].receipt_no if sale.receipt_set.all().count() > 0 else sale.sales_invoice_number
                    canvas_paper.setFontSize(11)
                    canvas_paper.drawString(50, y1, sale.sales_invoice_date.strftime('%d/%m/%Y'))
                    canvas_paper.drawString(120, y1, str(invoice_no))
                    canvas_paper.drawString(170, y1, sale.transaction_reference_no)
                    if sale.salesman:
                        salesman = sale.salesman.first_name + str(' ') + sale.salesman.last_name                            
                    else:
                        salesman = ''
                    data=[[Paragraph(salesman, para_style)]]
                    table = Table(data, colWidths=[150], rowHeights=100, style=style)      
                    table.wrapOn(canvas_paper, 200, 400)
                    table.drawOn(canvas_paper, 250, y1 - 10)
                    # canvas_paper.drawString(350, y1, sale.salesman.first_name + str(' ') + sale.salesman.last_name)
                    if sale.customer:
                        data=[[Paragraph(sale.customer.name, para_style)]]
                        table = Table(data, colWidths=[170], rowHeights=100, style=style)      
                        table.wrapOn(canvas_paper, 200, 400)
                        table.drawOn(canvas_paper, 400, y1 - 10)
                    else:
                        canvas_paper.drawString(400, y1, ' ')
                    canvas_paper.drawString(570, y1, sale.payment_mode)
                    canvas_paper.drawString(650, y1, str(sale.grant_total))
                    canvas_paper.drawString(730, y1, str(sale.discount))
                    canvas_paper.drawString(800, y1, str(sale.sales_tax))
                    canvas_paper.drawString(860, y1, str(sale.round_off))
             
                    total_discount = float(total_discount) + float(sale.discount)
                    total = float(total) + float(sale.grant_total)
                    y1 = y1 - 30
                    if y1 < 270:
                        y1 = y - 50
                        canvas_paper.showPage()
                canvas_paper.drawString(50, y1, 'Total Amount: ')
                canvas_paper.drawString(140, y1, str(total))
                canvas_paper.drawString(435, y1, str(total_discount))
                canvas_paper.drawString(350, y1, 'Total Discount : ')
                canvas_paper.showPage()
                canvas_paper.save()
                return response

class SalesReturnReport(View):

    def get(self, request, *args, **kwargs):

        start_date = request.GET.get('start_date', '')
        end_date = request.GET.get('end_date', '')
        if not start_date and not end_date:
            return render(request, 'sales_return_report.html', {})
        else:
            startdate = datetime.strptime(start_date, '%d/%m/%Y')
            enddate = datetime.strptime(end_date, '%d/%m/%Y')
            if request.user.is_superuser:
                sales = SalesReturn.objects.filter(invoice_date__gte=startdate,invoice_date__lte=enddate ).order_by('invoice_date')
            else:
                sales = SalesReturn.objects.filter(invoice_date__gte=startdate,invoice_date__lte=enddate ).exclude(sales__bill_type='Receipt').order_by('invoice_date')
            sales_details = []
            if request.is_ajax():
                for sale in sales: 
                    total_tax = 0
                    for s_item in sale.sales.salesitem_set.all():
                        total_tax = float(total_tax) + ( (float(s_item.net_amount)) - (float(s_item.mrp)*float(s_item.quantity)))                       
                    sales_details.append({
                        'date': sale.invoice_date.strftime('%d/%m/%Y'),
                        'invoice': sale.return_invoice_number,
                        'transaction_ref': sale.transaction_reference_no,
                        'payment_mode': sale.sales.payment_mode,
                        'grant_total': sale.grant_total,
                        'discount': sale.sales.discount,
                        'salesman': sale.sales.salesman.first_name + ' ' + sale.sales.salesman.last_name if sale.sales.salesman else '',
                        'customer': sale.sales.customer.name if sale.sales.customer else '',
                        'tax': str(total_tax),
                        'round_off':str(sale.sales.round_off)
                    })
                res = {
                    'sales_details': sales_details,
                    'result': 'ok',
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
            else:
                response = HttpResponse(content_type='application/pdf')
                canvas_paper = canvas.Canvas(response, pagesize=(1000, 1250))
                y = 1150
                status_code = 200
                canvas_paper.setFontSize(20)
                canvas_paper.drawCentredString(500, y, 'Sales Report - ' + start_date + ' - ' +end_date )
                y1 = y - 100
                canvas_paper.setFontSize(12)
                # if request.user.is_superuser:
                canvas_paper.drawString(50, y - 100, 'Date')
                canvas_paper.drawString(120, y - 100, 'Invoice')
                canvas_paper.drawString(170, y - 100, 'Transaction')
                canvas_paper.drawString(250, y - 100, 'Salesman')
                canvas_paper.drawString(400, y - 100, 'Customer')
                canvas_paper.drawString(570, y - 100, 'Payment')
                canvas_paper.drawString(650, y - 100, 'Total')
                canvas_paper.drawString(730, y - 100, 'Discount')
                canvas_paper.drawString(800, y - 100, 'Tax')
                canvas_paper.drawString(860, y - 100, 'Round off')
                y1 = y1 - 30
                total = 0
                total_discount = 0
                for sale in sales:
                    total_tax = 0
                    for s_item in sale.sales.salesitem_set.all():
                        total_tax = float(total_tax) + ( (float(s_item.net_amount)) - (float(s_item.mrp)*float(s_item.quantity)))
                    canvas_paper.setFontSize(11)
                    canvas_paper.drawString(50, y1, sale.invoice_date.strftime('%d/%m/%Y'))
                    canvas_paper.drawString(120, y1, str(sale.return_invoice_number))
                    canvas_paper.drawString(170, y1, sale.transaction_reference_no)
                    if sale.sales.salesman:
                        salesman = sale.sales.salesman.first_name + str(' ') + sale.sales.salesman.last_name                            
                    else:
                        salesman = ''
                    data=[[Paragraph(salesman, para_style)]]
                    table = Table(data, colWidths=[150], rowHeights=100, style=style)      
                    table.wrapOn(canvas_paper, 200, 400)
                    table.drawOn(canvas_paper, 250, y1 - 10)
                    if sale.sales.customer:
                        data=[[Paragraph(sale.sales.customer.name, para_style)]]
                        table = Table(data, colWidths=[170], rowHeights=100, style=style)      
                        table.wrapOn(canvas_paper, 200, 400)
                        table.drawOn(canvas_paper, 400, y1 - 10)
                    else:
                        canvas_paper.drawString(400, y1, ' ')
                    canvas_paper.drawString(570, y1, sale.sales.payment_mode)
                    canvas_paper.drawString(650, y1, str(sale.grant_total))
                    canvas_paper.drawString(730, y1, str(sale.sales.discount))
                    canvas_paper.drawString(800, y1, str(total_tax))
                    canvas_paper.drawString(860, y1, str(sale.sales.round_off))
             
                    total_discount = float(total_discount) + float(sale.sales.discount)
                    total = float(total) + float(sale.grant_total)
                    y1 = y1 - 30
                    if y1 < 270:
                        y1 = y - 50
                        canvas_paper.showPage()
                canvas_paper.drawString(50, y1, 'Total Amount: ')
                canvas_paper.drawString(140, y1, str(total))
                canvas_paper.drawString(435, y1, str(total_discount))
                canvas_paper.drawString(350, y1, 'Total Discount : ')
                canvas_paper.showPage()
                canvas_paper.save()
                return response

class CustomerWiseSalesReport(View):

    def get(self, request, *args, **kwargs):

        customer_id = request.GET.get('customer_id', '')
        sales_details = []
        if customer_id:
            customer = Customer.objects.get(id=customer_id)
            sales = Sale.objects.filter(customer=customer)
            for sale in sales:
                sales_details.append(sale.get_json_data())
            if request.is_ajax():
                res = {
                    'result': 'ok',
                    'sales_details': sales_details,
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
            else:
                response = HttpResponse(content_type='application/pdf')
                p = SimpleDocTemplate(response, pagesize=A4)
                elements = []
                data = []
                
                heading = 'Sales Report - '+customer.name
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
                table = Table(data, colWidths=(50, 60, 80, 80, 80, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table)
                data = []  
                total = 0 
                for sale in sales:
                    i = 0
                    total_tax_amount = 0
                    tax_amount = 0
                    net_amount= 0
                    total = total + sale.grant_total
                    data.append([sale.sales_invoice_number, sale.sales_invoice_date.strftime('%d/%m/%Y'),sale.transaction_reference_no, \
                    sale.discount, sale.sales_tax, sale.grant_total])
                table = Table(data, colWidths=(50, 60, 80, 80, 80, 80), style=style)
                table.setStyle([
                            ('Fs/ONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table)
                data1 = []
                data1.append(['Grant Total :', total])
                table1 = Table(data1, colWidths=(60, 50), style=style)
                table1.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table1)
                p.build(elements)  
                return response

        return render(request, 'sales_customer_wise_report.html', {})

class CustomerWiseSalesReturnReport(View):

    def get(self, request, *args, **kwargs):

        customer_id = request.GET.get('customer_id', '')
        sales_details = []
        if customer_id:
            customer = Customer.objects.get(id=customer_id)
            sales = SalesReturn.objects.filter(sales__customer=customer)
            for sale in sales:
                sales_details.append(sale.get_json_data())
            if request.is_ajax():
                res = {
                    'result': 'ok',
                    'sales_details': sales_details,
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
            else:
                response = HttpResponse(content_type='application/pdf')
                p = SimpleDocTemplate(response, pagesize=A4)
                elements = []
                data = []
                
                heading = 'Sales Report - '+customer.name
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
                data.append(['Invoice', 'Date', 'Transaction', 'Tax', 'Grant Total'])
                table = Table(data, colWidths=(50, 60, 80,  80, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table)
                data = []
                total = 0
                for sale in sales:
                    total = total + sale.grant_total
                    data.append([sale.return_invoice_number, sale.invoice_date.strftime('%d/%m/%Y'),sale.transaction_reference_no, \
                    sale.sales.sales_tax, sale.grant_total])
                table = Table(data, colWidths=(50, 60, 80, 80, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table)
                data1 = []
                data1.append(['Grant Total :', total])
                table1 = Table(data1, colWidths=(60, 50), style=style)
                table1.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table1)
                p.build(elements)  
                return response

        return render(request, 'sales_return_customer_wise_report.html', {})

class BrandWiseSalesReport(View):

    def get(self, request, *args, **kwargs):

        brand_id = request.GET.get('brand_id', '')
        sales_item_details = []
        if brand_id:
            brand = Brand.objects.get(id=brand_id)
            sales_items = SalesItem.objects.filter(batch_item__item__brand=brand)
            grant_total = 0
            for sales_item in sales_items:
                grant_total = grant_total + sales_item.net_amount
                sales_item_details.append({
                    'invoice_no': sales_item.sales.sales_invoice_number,
                    'invoice_date': sales_item.sales.sales_invoice_date.strftime('%d/%m/%Y'),
                    'transaction_reference_no': sales_item.sales.transaction_reference_no,
                    'discount': sales_item.sales.discount,
                    'grant_total': grant_total,
                    'total_tax': sales_item.sales.sales_tax,
                    })
            if request.is_ajax():
                res = {
                    'result': 'ok',
                    'sales_details': sales_item_details,
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
            else:
                response = HttpResponse(content_type='application/pdf')
                p = SimpleDocTemplate(response, pagesize=A4)
                elements = []
                data = []
                
                heading = 'Brand Wise Sales Report - '+brand.name
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
                table = Table(data, colWidths=(50, 60, 80, 80, 80, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table)
                data = [] 
                grant_total = 0  
                for sales_item in sales_items:
                    grant_total = grant_total + sales_item.net_amount
                    data.append([sales_item.sales.sales_invoice_number, sales_item.sales.sales_invoice_date.strftime('%d/%m/%Y'),sales_item.sales.transaction_reference_no, \
                    sales_item.sales.discount, sales_item.sales.sales_tax, grant_total])
                table = Table(data, colWidths=(50, 60, 80, 80, 80, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table)
                p.build(elements)  
                return response

        return render(request, 'brand_wise_sales_report.html', {})

class CategoryWiseSalesReport(View):

    def get(self, request, *args, **kwargs):

        category_id = request.GET.get('category_id', '')
        sales_item_details = []
        if category_id:
            category = Category.objects.get(id=category_id)
            sales_items = SalesItem.objects.filter(batch_item__item__product__category=category)
            grant_total = 0
            for sales_item in sales_items:
                grant_total = grant_total + sales_item.net_amount
                sales_item_details.append({
                    'invoice_no': sales_item.sales.sales_invoice_number,
                    'invoice_date': sales_item.sales.sales_invoice_date.strftime('%d/%m/%Y'),
                    'transaction_reference_no': sales_item.sales.transaction_reference_no,
                    'discount': sales_item.sales.discount,
                    'grant_total': grant_total,
                    'total_tax': sales_item.sales.sales_tax,
                    })
            if request.is_ajax():
                res = {
                    'result': 'ok',
                    'sales_details': sales_item_details,
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
            else:
                response = HttpResponse(content_type='application/pdf')
                p = SimpleDocTemplate(response, pagesize=A4)
                elements = []
                data = []
                
                heading = 'Category Wise Sales Report - '+category.name
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
                table = Table(data, colWidths=(50, 60, 80, 80, 80, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table)
                data = []  
                grant_total = 0 
                total = 0
                for sales_item in sales_items:
                    grant_total = grant_total + sales_item.net_amount
                    total = total + grant_total
                    data.append([sales_item.sales.sales_invoice_number, sales_item.sales.sales_invoice_date.strftime('%d/%m/%Y'),sales_item.sales.transaction_reference_no, \
                    sales_item.sales.discount, sales_item.sales.sales_tax, grant_total])
                if len(data) > 0:
                    table = Table(data, colWidths=(50, 60, 80, 80, 80, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table)
                p.build(elements)  
                return response

        return render(request, 'category_wise_sales_report.html', {})

class SupplierWiseSalesReport(View):
    def get(self, request, *args, **kwargs):

        supplier_id = request.GET.get('supplier_id', '')
        sales_item_details = []
        if supplier_id:
            supplier = Supplier.objects.get(id=supplier_id)
            purchases = Purchase.objects.filter(supplier=supplier)
            for purchase in purchases:
                for p_item in purchase.purchaseitem_set.all():
                    sales_items = SalesItem.objects.filter(batch_item=p_item.batch_item)
                    for sales_item in sales_items:
                        sales_item_details.append({
                            'invoice_no': sales_item.sales.sales_invoice_number,
                            'invoice_date': sales_item.sales.sales_invoice_date.strftime('%d/%m/%Y'),
                            'transaction_reference_no': sales_item.sales.transaction_reference_no,
                            'discount': sales_item.sales.discount,
                            'grant_total': sales_item.sales.grant_total,
                            'total_tax': sales_item.sales.sales_tax,
                        })
            if request.is_ajax():
                res = {
                    'result': 'ok',
                    'sales_details': sales_item_details,
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
            else:
                response = HttpResponse(content_type='application/pdf')
                p = SimpleDocTemplate(response, pagesize=A4)
                elements = []
                data = []
                
                heading = 'Vendor Wise Sales Report - '+supplier.name
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
                table = Table(data, colWidths=(50, 60, 80, 80, 80, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table)
                data = [] 
                for sales_item in sales_item_details:
                    data.append([sales_item['invoice_no'], sales_item['invoice_date'],sales_item['transaction_reference_no'], \
                    sales_item['discount'], sales_item['total_tax'], sales_item['grant_total']])
                table = Table(data, colWidths=(50, 60, 80, 80, 80, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table)
                p.build(elements)  
                return response

        return render(request, 'vendor_wise_sales_report.html', {})
#class SupplierWiseItemSalesReport(view):

class ItemWiseSalesReport(View):

    def get(self, request, *args, **kwargs):

        item_id = request.GET.get('item_id', '')
        sales_item_details = []
        if item_id:
            item = Item.objects.get(id=item_id)
            sales_items = SalesItem.objects.filter(batch_item__item=item)
            for sales_item in sales_items:
                sales_item_details.append({
                    'invoice_no': sales_item.sales.sales_invoice_number,
                    'invoice_date': sales_item.sales.sales_invoice_date.strftime('%d/%m/%Y'),
                    'transaction_reference_no': sales_item.sales.transaction_reference_no,
                    'discount': sales_item.sales.discount,
                    'grant_total': sales_item.net_amount,
                    'total_tax': sales_item.sales.sales_tax,
                    })
            if request.is_ajax():
                res = {
                    'result': 'ok',
                    'sales_details': sales_item_details,
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
            else:
                response = HttpResponse(content_type='application/pdf')
                p = SimpleDocTemplate(response, pagesize=A4)
                elements = []
                data = []
                
                heading = 'Item Wise Sales Report - '+item.name
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
                table = Table(data, colWidths=(50, 60, 80, 80, 80, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table)
                data = []   
                for sales_item in sales_items:
                    data.append([sales_item.sales.sales_invoice_number, sales_item.sales.sales_invoice_date.strftime('%d/%m/%Y'),sales_item.sales.transaction_reference_no, \
                    sales_item.sales.discount, sales_item.sales.sales_tax, sales_item.net_amount])
                table = Table(data, colWidths=(50, 60, 80, 80, 80, 80), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table)
                p.build(elements)  
                return response

        return render(request, 'item_wise_sales_report.html', {})

class AreaWiseCustomerSalesReport(View):

    def get(self, request, *args, **kwargs):

        area = request.GET.get('area', '')
        sales_details = []
        if area:
            try:
                customers = Customer.objects.filter(area=area)
                for customer in customers:
                    sales = Sale.objects.filter(customer=customer)
                    for sale in sales:
                        sales_details.append(sale.get_json_data())

                if request.is_ajax():
                    res = {
                        'result': 'ok',
                        'sales_details': sales_details,
                    }
                else:
                    response = HttpResponse(content_type='application/pdf')
                    p = SimpleDocTemplate(response, pagesize=A4)
                    elements = []
                    data = []
                    
                    heading = 'Sales Report - '+ area
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
                    data.append(['Invoice', 'Date', 'Customer', 'Discount', 'Tax', 'Total Sales'])
                    table = Table(data, colWidths=(50, 60, 80, 80, 80, 80), style=style)
                    table.setStyle([
                                ('FONTSIZE', (0,0), (-1,-1), 10),
                                ])   
                    elements.append(table)
                    data = []  
                    total = 0 
                    for sale in sales:
                        total = total + sale.grant_total 
                        data.append([sale.sales_invoice_number, sale.sales_invoice_date.strftime('%d/%m/%Y'),sale.customer.name, \
                        sale.discount, sale.sales_tax, sale.grant_total])
                    table = Table(data, colWidths=(50, 60, 80, 80, 80, 80), style=style)
                    table.setStyle([
                                ('Fs/ONTSIZE', (0,0), (-1,-1), 10),
                                ]) 
                    elements.append(table)
                    data1 = []
                    data1.append(['Grant Total :', total])
                    table1 = Table(data1, colWidths=(60, 50), style=style)
                    table1.setStyle([
                                ('FONTSIZE', (0,0), (-1,-1), 10),
                                ])   
                    elements.append(table1)
                    p.build(elements)  
                    return response

            except:
                res = {
                    'result':'error',
                    'error_message': 'No customer present in this area'
                }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        elif request.GET.get('no_area', ''):
            customers = Customer.objects.all()
            area_list = []
            area_total = 0
            for customer in customers:
                if customer.area not in area_list:
                    area_list.append(customer.area) 
            for area in area_list:    
                sales = Sale.objects.filter(customer__area=area)
                for sale in sales:
                    sales_details.append({
                        'sales_invoice_number': sale.sales_invoice_number,
                        'sales_invoice_date': sale.sales_invoice_date.strftime('%d/%m/%Y'),
                        'customer_name': sale.customer.name,
                        'area':sale.customer.area if sale.customer.area else '',
                        'discount': sale.discount,
                        'grant_total': sale.grant_total,
                        'total_tax': sale.sales_tax,
                    })
            response = HttpResponse(content_type='application/pdf')
            p = SimpleDocTemplate(response, pagesize=A4)
            elements = []
            data = []
            
            heading = 'Sales Report'
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
            data.append(['Area', 'Customer', 'Total Sales'])
            table = Table(data, colWidths=(50, 60, 80), style=style)
            table.setStyle([
                        ('FONTSIZE', (0,0), (-1,-1), 10),
                        ])   
            elements.append(table)
            data = [] 
            data1 = [] 
            data2 = []
            total = 0 
            for area in area_list:
                customers =Customer.objects.filter(area=area)
                for customer in customers:  
                    data = []  
                    data1 = []
                    sales = Sale.objects.filter(customer=customer)
                    for sale in sales:
                        total = total + sale.grant_total
                    if customer.area:
                        data.append([area, customer.name,total])
                    if len(data) > 0:
                        table = Table(data, colWidths=(50, 60, 80), style=style)
                        table.setStyle([
                                    ('Fs/ONTSIZE', (0,0), (-1,-1), 10),
                                    ]) 
                        elements.append(table)
                    if customer.area:
                        data1.append(['Total Area Sales:',total])
                        table1 = Table(data1, colWidths=(80,60), style=style)
                        table1.setStyle([
                                    ('FONTSIZE', (0,0), (-1,-1), 10),
                                    ])   
                        elements.append(table1)
            p.build(elements)  
            return response
        return render(request, 'area_wise_customer_sales_report.html', {})

class DeliveryNoteToSales(View):

    def get(self, request, *args, **kwargs):
        if request.is_ajax():
            deliverynote_invoice_number = request.GET.get('delivery_note_no', '')
            
            if deliverynote_invoice_number:
                try:
                    delivery_note = DeliveryNote.objects.get(deliverynote_invoice_number = deliverynote_invoice_number,is_converted=False)
                    res = {
                        'result': 'ok',
                        'delivery_note':delivery_note.get_json_data(),
                    }
                except Exception as ex:
                    print str(ex)
                    res = {
                        'result': 'error',
                        'message': 'No Deliverynote with this delivery no',
                        'delivery_note': '',
                    }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'delivery_note_sales.html', {})
