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
        if customer_name:
            customers = Customer.objects.filter(name__istartswith=customer_name)
        else:
            customers = Customer.objects.all()
        customer_list= []
        if request.is_ajax():
            for customer in customers:
                customer_data = customer.get_json_data()
                customer_list.append(customer_data)
            res = {
                'result': 'ok',
                'customers': customer_list,
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
        account_receivables = Ledger.objects.filter(parent__name='Sundry Debtors')
        if request.is_ajax():
            for account_receivable in account_receivables:
                debit_balance = 0
                credit_balance = 0
                if account_receivable.balance >= 0:
                    debit_balance = account_receivable.balance
                else:
                    credit_balance = account_receivable.balance
                account_receivables_list.append({
                    'id': account_receivable.id,
                    'name': account_receivable.name,
                    'debit_balance': abs(debit_balance),
                    'credit_balance': abs(credit_balance),
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
            data.append(['No', 'Ledger Name', 'Cr', 'Dr'])
            count = 0
            if len(account_receivables) > 0:
                for account_receivable in account_receivables:
                    debit_balance = 0
                    credit_balance = 0
                    if account_receivable.balance >= 0:
                        debit_balance = abs(account_receivable.balance)
                    else:
                        credit_balance = abs(account_receivable.balance)
                    data.append([str(count+1),Paragraph(account_receivable.name,para_style),debit_balance, credit_balance])
                    count = count + 1
            table = Table(data, colWidths=(100,100,100,100), rowHeights=25, style=style)
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
        if not start_date:            
            return render(request, 'received_report.html', {})
        elif not end_date:
            return render(request, 'received_report.html', {}) 
        else:
            start_date = datetime.strptime(start_date, '%d/%m/%Y')
            end_date = datetime.strptime(end_date, '%d/%m/%Y')
        if request.is_ajax():
            ledger_entries_list = []
            count = 1
            customers = Customer.objects.all()
            for customer in customers:
                if customer.ledger.balance <=0:
                    ledger_entries = LedgerEntry.objects.filter(ledger=customer.ledger,date__gte=start_date, date__lte=end_date).order_by('-date')

                    for ledger_entry in ledger_entries:
                        if not ledger_entry.debit_amount:
                            ledger_entries_list.append({
                                'count': count,
                                'customer_name': customer.name,
                                'name': ledger_entry.ledger.name,
                                'credit_amount': ledger_entry.credit_amount,
                                'debit_amount': ledger_entry.debit_amount,
                                'date': ledger_entry.date.strftime('%d/%m/%Y'),
                                })
                            count = count + 1
            res = {
                'result': 'ok',
                'ledger_entries': ledger_entries_list,
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
            data.append(['No','Date', 'Customer Name', 'Cr', 'Dr'])
            
            count = 0
            customers = Customer.objects.all()
            for customer in customers:
                
                if customer.ledger.balance <= 0:
                    ledger_entries = LedgerEntry.objects.filter(ledger=customer.ledger, date__gte=start_date, date__lte=end_date).order_by('-date')
                    if len(ledger_entries) > 0:
                        for ledger_entry in ledger_entries:
                            if not ledger_entry.debit_amount:
                                data.append([str(count+1),ledger_entry.date.strftime('%d/%m/%Y') if ledger_entry.date else '',Paragraph(customer.name, para_style),str(ledger_entry.credit_amount)if ledger_entry.credit_amount else '',str(ledger_entry.debit_amount)if ledger_entry.debit_amount else ''])
                                count = count + 1
            table = Table(data, colWidths=(100,100,100,100,100), rowHeights=25, style=style)
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
            return render(request, 'ledger_report.html',{})
        
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
