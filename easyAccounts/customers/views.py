import simplejson
import ast
from datetime import datetime
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, SimpleDocTemplate, Spacer
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.enums import TA_CENTER


from django.shortcuts import render
from django.core.urlresolvers import reverse
from django.views.generic.base import View
from django.http import Http404, HttpResponse, HttpResponseRedirect

from customers.models import Customer
from accounts.models import Ledger, LedgerEntry
from sales.models import Sale



style = [
    ('FONTSIZE', (0,0), (-1, -1), 12),
    ('FONTNAME',(0,0),(-1,-1),'Helvetica') 
]

para_style = ParagraphStyle('fancy')
para_style.fontSize = 12
para_style.fontName = 'Helvetica'


class Customers(View):

    def get(self, request, *args, **kwargs):
        customer_name = request.GET.get('name', '')
        cust_count = 0
        if customer_name:
            customers = Customer.objects.filter(name__istartswith=customer_name)
        else:
            customers = Customer.objects.all()
            cust_count = Customer.objects.all().count()
        customer_list= []
        if request.is_ajax():
            for customer in customers:
                customer_data = customer.get_json_data()
                cust_count = Customer.objects.all().count()
                customer_list.append(customer_data)
            res = {
                'result': 'ok',
                'customers': customer_list,
                'cust_count':cust_count,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'customers.html', {'customers': customers})

class AddCustomer(View):

    def get(self, request, *args, **kwargs):

        customer_id = request.GET.get('customer_id', '')
        if customer_id:
            customer = Customer.objects.get(id=customer_id)
            customer_details = {}
            if request.is_ajax():
                customer_details = customer.get_json_data()
                res = {
                    'result': 'ok',
                    'customer': customer_details,
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'add_customer.html', {'customer_id':customer_id})
        
    def post(self, request, *args, **kwargs):

        if request.is_ajax():
            customer_details = ast.literal_eval(request.POST['customer'])
            if customer_details.get('id', ''):
                customers = Customer.objects.filter(name=customer_details['name']).exclude(id=customer_details['id'])
                if customers.count() == 0:
                    customer = Customer.objects.get(id=customer_details['id'])
                    customer_obj = customer.set_attributes(customer_details)
                else:
                    res = {
                        'result': 'error',
                        'message': 'Customer with this name already exists',
                    }
                    response = simplejson.dumps(res)
                    return HttpResponse(response, status=200, mimetype="application/json")
            else:
                try:
                    customer = Customer.objects.get(name=customer_details['name'])
                    res = {
                        'result': 'error',
                        'message': 'Customer with this name already exists',
                    }
                    response = simplejson.dumps(res)
                    return HttpResponse(response, status=200, mimetype="application/json")
                except:
                    customer = Customer.objects.create(name=customer_details['name'])
                    customer_obj = customer.set_attributes(customer_details)
            res = {
                'result': 'ok',
                'customer':customer.get_json_data(),
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'add_customer.html', {'customer_id':customer.id})
            
class DeleteCustomer(View):

    def get(self, request, *args, **kwargs):
    
        customer_id = request.GET.get('customer_id', '')
        customer = Customer.objects.get(id=customer_id)
        customer.delete()
        return HttpResponseRedirect(reverse('customers'))

class AccountsReceivable(View):

    def get(self, request, *args, **kwargs):
        account_receivables_list = []
        #account_receivables = Ledger.objects.filter(parent__name='Sundry Debtors')
        #accounts_receivables = Sale.objects.filter(payment_mode='credit')
        customers = Customer.objects.all()

        if request.is_ajax():
            for customer in customers:
                sales = Sale.objects.filter(customer=customer, payment_mode='credit')
                for sale in sales:
                    if sale.balance > 0:
                        account_receivables_list.append({
                            'account_name': customer.name,
                            'invoice': sale.sales_invoice_number,
                            'particulars': 'Sales',
                            'amount': sale.balance,
                        })
            res = {
                'result': 'ok',
                'account_receivables': account_receivables_list,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        if request.GET.get('report_type',''):
            response = HttpResponse(content_type='application/pdf')
            p = SimpleDocTemplate(response, pagesize=A4)
            elements = []
            data = []
            d = [ ['Accounts Receivable Report ']]
            t = Table(d, colWidths=(450), rowHeights=25, style=style)
            t.setStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),
                        ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                        ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                        ('FONTSIZE', (0,0), (0,0), 20),
                        ('FONTSIZE', (1,0), (-1,-1), 17),
                        ])   
            elements.append(t)
            elements.append(Spacer(2, 5))
            data.append(['Account Name', 'Invoice', 'Particulars', 'Total Amount'])
            if len(data) > 0:
                for customer in customers:
                    sales = Sale.objects.filter(customer=customer, payment_mode='credit')
                    for sale in sales:
                        if sale.balance > 0:
                            data.append([Paragraph(customer.name, para_style), sale.sales_invoice_number, 'Sales',sale.balance])
            table = Table(data, colWidths=(200,150,100, 100), rowHeights=25, style=style)
            table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                ('FONTNAME', (0, -1), (-1,-1), 'Helvetica')
                ])   
            elements.append(table)
            p.build(elements)   
            return response
        else:            
            return render(request, 'accounts_receivable.html',{})
        

class ReceivedReport(View):

    def get(self, request, *args, **kwargs):
        
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        customer_name = request.GET.get('customer_name')
        if start_date:
            start_date = datetime.strptime(start_date, '%d/%m/%Y')
        if end_date:
            end_date = datetime.strptime(end_date, '%d/%m/%Y')
        if request.is_ajax():
            sales_details = []
            if customer_name:
                customers = Customer.objects.filter(name=customer_name) 
                for customer in customers:
                    sales =Sale.objects.filter(customer=customer)
                    for sale in sales:
                        sales_details.append(sale.get_json_data())
            else:
                customers = Customer.objects.all()
                for customer in customers:
                    sales =Sale.objects.filter(customer=customer,sales_invoice_date__gte=start_date,sales_invoice_date__lte=end_date).order_by('sales_invoice_date')
                    for sale in sales:
                        sales_details.append(sale.get_json_data())
            res = {
                'result': 'ok',
                'sales_details': sales_details,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        if request.GET.get('report_type',''):
            response = HttpResponse(content_type='application/pdf')
            
            p = SimpleDocTemplate(response, pagesize=A4)
            elements = []
            data = []
            d = [ ['Date Wise Received Report ']]
            t = Table(d, colWidths=(450), rowHeights=25, style=style)
            t.setStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),
                        ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                        ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                        ('FONTSIZE', (0,0), (0,0), 17),
                        ])   
            elements.append(t)
            
            elements.append(Spacer(2, 5))
            data.append(['Date',Paragraph('Customer Name',para_style), 'Invoice', Paragraph('Type/ Particulars ',para_style),Paragraph('Payment Terms',para_style), Paragraph('Total Amount',para_style)])
            
            count = 0
            if customer_name:
                customers = Customer.objects.filter(name=customer_name) 
                for customer in customers:
                    sales =Sale.objects.filter(customer=customer)
                    for sale in sales:
                        data.append([sale.sales_invoice_date,Paragraph(customer.name, para_style), sale.sales_invoice_number, 'Sales', '', sale.grant_total])
            else:
                customers = Customer.objects.all()
                for customer in customers:
                    sales =Sale.objects.filter(customer=customer,sales_invoice_date__gte=start_date,sales_invoice_date__lte=end_date).order_by('sales_invoice_date')
                    for sale in sales:
                        data.append([sale.sales_invoice_date.strftime('%d/%m/%Y'),Paragraph(customer.name, para_style), sale.sales_invoice_number, 'Sales', '', sale.grant_total])
            customers = Customer.objects.all()
                    
            table = Table(data, colWidths=(80,80,80,80,80,80), rowHeights=25, style=style)
            table.setStyle([('ALIGN',(0,0),(-1,-1),'LEFT'),
                ('TEXTCOLOR',(0,0),(-1,-1),colors.black),
                ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                ('BACKGROUND',(0, 0),(-1,-1),colors.white),
                ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                ('FONTNAME', (0, -1), (-1,-1), 'Helvetica')
                ])   
            elements.append(table)
            p.build(elements) 
            return response
        else:            
            return render(request, 'received_report.html',{})
        
class EditCustomer(View):

    def get(self, request, *args, **kwargs):

        customer_id = request.GET.get('customer_id', '')
        if customer_id:
            customer = Customer.objects.get(id=customer_id)
            customer_details = {}
            if request.is_ajax():
                customer_details = customer.get_json_data()
                res = {
                    'result': 'ok',
                    'customer': customer_details,
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'add_customer.html', {'customer_id':customer_id})

class AreaSearch(View):

    def get(self, request, *args, **kwargs):
        area = request.GET.get('area', '')
        if area:
            customers = Customer.objects.filter(area__istartswith=area)
        
        area_list= []
        if request.is_ajax():
            for customer in customers:
                area_list.append({'area':customer.area})
            res = {
                'result': 'ok',
                'areas': area_list,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')

class CustomerBonusPointsReport(View):

    def get(self, request, *args, **kwargs):

        customer = request.GET.get('customer', '')
        start_date = request.GET.get('start_date', '')
        end_date = request.GET.get('end_date', '')
        bonus_point_details = []
        if customer and start_date and end_date:
            start_date = datetime.strptime(start_date, '%d/%m/%Y')
            end_date = datetime.strptime(end_date, '%d/%m/%Y')
            sales = Sale.objects.filter(customer__id=customer, sales_invoice_date__gte=start_date, sales_invoice_date__lte=end_date)
            for sale in sales:
                if sale.customer_bonus_point_amount > 0:
                    bonus_point_details.append({
                        'date': sale.sales_invoice_date.strftime('%d/%m/%Y'),
                        'invoice': sale.sales_invoice_number,
                        'bill_amount': sale.grant_total,
                        'amount': sale.customer_bonus_point_amount
                    })
            if request.is_ajax():
                res = {
                    'result': 'ok',
                    'bonus_point_details': bonus_point_details,
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
                customer_obj = Customer.objects.get(id=customer)
                heading = 'Customer Bonus Points - '+start_date.strftime('%d/%m/%Y')+' - '+request.GET.get('end_date', '')+' - '+customer_obj.name
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
                data.append(['Date', 'Particulars', 'Bill Amount', 'Amount'])
                table = Table(data, colWidths=(70, 150, 105, 105), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,0), 11),
                            ])  
                elements.append(table)
                elements.append(Spacer(1, 20))
                data = []
                for bonus_point in bonus_point_details:
                    data.append([bonus_point['date'],bonus_point['invoice'], bonus_point['bill_amount'], bonus_point['amount']])
                if len(data) > 0:
                    table = Table(data, colWidths=(70, 150, 105, 105), style=style) 
                    elements.append(table)
                p.build(elements)  
                return response  
        return render(request, 'customer_bonus_points.html', {})