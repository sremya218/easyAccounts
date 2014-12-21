import simplejson
import ast
from datetime import datetime
import calendar
from operator import itemgetter
from reportlab.pdfgen import canvas
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle, SimpleDocTemplate, Spacer
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from num2words import num2words

from django.shortcuts import render
from django.views.generic.base import View
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

from sales.models import Sale, SalesItem
from purchases.models import Purchase, PurchaseReturn
from accounts.models import Ledger, LedgerEntry
from inventory.models import Category
from dashboard.models import PostDatedCheque

style = [
    ('FONTNAME',(0,0),(-1,-1),'Helvetica') 
]
sales_receipt_style = [
    ('FONTNAME',(0,0),(-1,-1),'Helvetica') 
]
para_style = ParagraphStyle('fancy')
para_style.fontSize = 10.5
para_style.fontName = 'Helvetica'

def delete_post_dated_cheque_entries():
    current_date = datetime.now().date()
    predated_cheques = PostDatedCheque.objects.filter(cheque_date__lt=current_date)
    for predated_cheque in predated_cheques:
        predated_cheque.delete()
    return True

def get_expense_amount(expense, month, year, amount):

    child_expense_ledgers = Ledger.objects.filter(parent=expense)
    ledger_entries = LedgerEntry.objects.filter(date__month=month, date__year=year, ledger=expense)
    for ledger_entry in ledger_entries:
        if ledger_entry.debit_amount:
            amount = float(amount) + float(ledger_entry.debit_amount)
    if child_expense_ledgers.count() > 0:
        for ledger in child_expense_ledgers:
            amount = get_expense_amount(ledger, month, year, amount)
    return amount

class Login(View):
    def get(self, request, *args, **kwargs):
        return render(request, 'login.html', {})

    def post(self, request, *args, **kwargs):

        user = authenticate(username=request.POST['username'], password=request.POST['password'])
        if user and user.is_active:
            login(request, user)
            return HttpResponseRedirect(reverse('dashboard'))
        else:
            context = {
                'message' : 'Username or password is incorrect',
                'username': request.POST['username']
            }
            return render(request, 'login.html', context)

class DashBoard(View):

    def get(self, request, *args, **kwargs):
        current_date = datetime.now().date()
        return render(request, 'dashboard.html', {'current_date': current_date})


class Logout(View):
    def get(self, request, *args, **kwargs):
        logout(request)
        return HttpResponseRedirect(reverse('login'))

class HelpView(View):

    def get(self, request, *args, **kwargs):

        return render(request, 'help.html', {})

class SettingsView(View):

    def get(self, request, *args, **kwargs):

        return render(request, 'settings.html', {})

class MonthlySalesView(View):

    def get(self, request, *args, **kwargs):

        if request.is_ajax():
            monthly_sales = []
            current_year = datetime.now().year
            for i in range(1,13):
                sales = Sale.objects.filter(sales_invoice_date__month=i, sales_invoice_date__year=current_year)
                monthly_total_amount = 0
                for sale in sales:
                    monthly_total_amount = float(monthly_total_amount) + float(sale.grant_total)
                monthly_sales.append(monthly_total_amount)
            res = {
                'result': 'ok',
                'monthly_sales': monthly_sales,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')

class YearWiseSalesView(View):

    def get(self, request, *args, **kwargs):
        if request.is_ajax():
            yearly_sales = []
            current_year = datetime.now().year
            years = []
            for year in range((current_year - 4), current_year + 1):
                years.append(year)
                sales = Sale.objects.filter(sales_invoice_date__year=year)
                yearly_total_amount = 0
                for sale in sales:
                    yearly_total_amount = float(yearly_total_amount) + float(sale.grant_total)
                yearly_sales.append(yearly_total_amount)
            res = {
                'result': 'ok',
                'yearly_sales': yearly_sales,
                'years': years,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')

class MonthlyStatisticsView(View):

    def get(self, request, *args, **kwargs):

        if request.is_ajax():
            monthly_sales = []
            monthly_purchase = []
            monthly_expense = []
            monthly_profit = []
            current_year = datetime.now().year
            for i in range(1,13):
                sales = Sale.objects.filter(sales_invoice_date__month=i, sales_invoice_date__year=current_year)
                purchases = Purchase.objects.filter(purchase_invoice_date__month=i, purchase_invoice_date__year=current_year)
                purchase_returns = PurchaseReturn.objects.filter(invoice_date__month=i, invoice_date__year=current_year)
                monthly_total_sale_amount = 0
                monthly_total_purchase_amount = 0
                monthly_expense_amount = 0
                monthly_profit_amount = 0
                monthly_total_purchase_return_amount = 0
                for sale in sales:
                    monthly_total_sale_amount = float(monthly_total_sale_amount) + float(sale.grant_total)
                monthly_sales.append(monthly_total_sale_amount)
                for purchase in purchases:
                    monthly_total_purchase_amount = float(monthly_total_purchase_amount) + float(purchase.grant_total)
                for purchase_return in purchase_returns:
                    monthly_total_purchase_return_amount = float(monthly_total_purchase_return_amount) + float(purchase_return.grant_total)
                monthly_total_purchase_amount = float(monthly_total_purchase_amount) - float(monthly_total_purchase_return_amount)
                monthly_purchase.append(monthly_total_purchase_amount)
                consumable = Ledger.objects.get(account_code=6000)
                indirect_expense_amount = get_expense_amount(consumable, i, current_year, 0)
                inward_freight_ledger = Ledger.objects.get(account_code=4001)
                monthly_expense_amount = get_expense_amount(inward_freight_ledger, i, current_year, indirect_expense_amount)
                monthly_expense.append(monthly_expense_amount)
                monthly_profit_amount = float(monthly_total_sale_amount) - (float(monthly_total_purchase_amount) + float(monthly_expense_amount))
                monthly_profit.append(monthly_profit_amount)
            res = {
                'result': 'ok',
                'monthly_sales': monthly_sales,
                'monthly_purchase': monthly_purchase,
                'monthly_expense': monthly_expense,
                'monthly_profit': monthly_profit,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')

class RevenueSplitup(View):

    def get(self, request, *args, **kwargs):
        categories = Category.objects.all()
        category_details = []
        category_data = []
        current_year = datetime.now().year
        sales = Sale.objects.filter(sales_invoice_date__year=current_year)
        sales_total = 0
        for sale in sales:
            grant_total = 0
            grant_total = float(sale.grant_total) + float(sale.discount)
            sales_total = float(grant_total) + float(sales_total)

        for category in categories:
            percentage = 0
            sales_items = SalesItem.objects.filter(batch_item__item__product__category=category, sales__sales_invoice_date__year=current_year)
            grant_total = 0
            for sales_item in sales_items:
                grant_total = grant_total + sales_item.net_amount
            if sales_total > 0:
                percentage = float(grant_total) / float(sales_total) * 100
            category_details.append({
                'total': grant_total,
                'name': category.name,
                'percentage': percentage
            })
        category_data = sorted(category_details, key=itemgetter('percentage'), reverse=True) 
        pie_data = []
        if len(category_data) > 5:
            pie_data = category_data[:5]
            percentage = 0
            for cat_data in range(5, len(category_data)):
                percentage = float(category_data[cat_data]['percentage']) + float(percentage)
            pie_data.append({
                'name': 'Others',
                'percentage': percentage   
            })
        else:
            pie_data = category_data
        res = {
            'result': 'ok',
            'category_data': pie_data,
            'current_year': current_year,
        }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')
        
class ResetPassword(View):

    def get(self, request, *args, **kwargs):

        return render(request, 'reset_password.html', {})

    def post(self, request, *args, **kwargs):

        if request.is_ajax():
            pass_dict = request.POST
            user = request.user
            user.set_password(pass_dict['new_password'])
            user.save()
            res = {
                'result': 'ok',
                'message': 'Password Changed Successfully',
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'reset_password.html', {})

class ForgotPassword(View):

    def get(self, request, *args, **kwargs):

        return render(request, 'forgot_password.html', {})

    def post(self, request, *args, **kwargs):

        if request.is_ajax():
            pass_dict = request.POST
            try:
                user = User.objects.get(username=pass_dict['username'])
                user.set_password(pass_dict['new_password'])
                user.save()
                res = {
                    'result': 'ok',
                    'message': 'Password Changed Successfully',
                }
            except:
                res = {
                    'result': 'ok',
                    'message': 'User Doest Not Exists',
                }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'reset_password.html', {})

class PDCReport(View):

    def get(self, request, *args, **kwargs):
        current_date = datetime.now()
        post_dated_cheques = PostDatedCheque.objects.filter(cheque_date__gt=current_date)
        response = HttpResponse(content_type='application/pdf')
        p = SimpleDocTemplate(response, pagesize=A4)
        elements = []
        data = []
        
        heading = 'PDC  Report - '+str(current_date.strftime('%d/%m/%Y'))
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
        if post_dated_cheques:
            data.append([ 'Cheque Date', 'Transaction Ref No','Narration'])
            table = Table(data, colWidths=(100, 100, 100), style=style)
            table.setStyle([
                        ('FONTSIZE', (0,0), (-1,-1), 10),
                        ])   
            elements.append(table)
            data = []
            total = 0
            for post_dated_cheque in post_dated_cheques:
                data.append([post_dated_cheque.cheque_date.strftime('%d/%m/%Y'),post_dated_cheque.transaction_ref,Paragraph(post_dated_cheque.narration,para_style)])
            table = Table(data, colWidths=(100, 100, 100), style=style)
            table.setStyle([
                        ('FONTSIZE', (0,0), (-1,-1), 10),
                        ])   
            elements.append(table)
        p.build(elements)  
        return response
        