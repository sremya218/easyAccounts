import simplejson
import ast
from datetime import datetime
import decimal
import itertools

from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, SimpleDocTemplate, Spacer, TableStyle
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import cm

from django.shortcuts import render
from django.core.urlresolvers import reverse
from django.views.generic.base import View
from django.http import HttpResponse, HttpResponseRedirect
from django.db.models import Q

from accounts.models import Ledger, LedgerEntry, Transaction

style = [
    ('FONTSIZE', (0,0), (-1, -1), 12),
    ('FONTNAME',(0,0),(-1,-1),'Helvetica') 
]

para_style = ParagraphStyle('fancy')
para_style.fontSize = 12
para_style.fontName = 'Helvetica'

class AddLedger(View):

    def get(self, request, *args, **kwargs):
        ledger_id = request.GET.get('ledger_id', '')
        if ledger_id:
            ledger = Ledger.objects.get(id=ledger_id)
            if request.is_ajax():
                res = {
                    'ledger': ledger.get_json_data(),
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'add_ledger.html', {'ledger_id' : ledger_id})

    def post(self, request, *args, **kwargs):

        if request.is_ajax(): 
            ledger_details = ast.literal_eval(request.POST['ledger'])
            if ledger_details.get('id', ''):
                ledger = Ledger.objects.get(id=ledger_details.get('id', ''))
                if ledger_details.get('parent', ''): 
                    ledger_obj = Ledger.objects.filter(parent__id=ledger_details['parent'],name=ledger_details['name']).exclude(id=ledger_details.get('id', ''))
                else:
                    ledger_obj = Ledger.objects.filter(name=ledger_details['name']).exclude(id=ledger_details.get('id', ''))
                if ledger_obj.count() == 0:
                    ledger_obj = ledger.set_attributes(ledger_details)
                    res = {
                        'result': 'ok',
                        'new_ledger': ledger.get_json_data()
                    }
                else:
                    res = {
                        'result': 'error',
                        'message': 'Ledger name already exists',
                    }
                    response = simplejson.dumps(res)
                    return HttpResponse(response, status=200, mimetype='application/json')
            else:
                try:
                    if ledger_details['parent'] != '': 
                        parent = Ledger.objects.get(id=ledger_details['parent'])
                        ledger = Ledger.objects.get(name=ledger_details['name'], parent=parent)
                    else:
                        ledger = Ledger.objects.get(name=ledger_details['name'])
                    res = {
                        'result': 'error',
                        'message': 'Ledger name already exists',
                    }
                except Exception as ex:
                    
                    ledger = Ledger()
                    ledger_obj = ledger.set_attributes(ledger_details)
                    res = {
                        'result': 'ok',
                        'message': 'ok',
                        'new_ledger': ledger.get_json_data()
                    }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')

class LedgerTreeView(View):
    def get(self, request, *args, **kwargs):
        ledger_name = request.GET.get('name', '')
        filtr = request.GET.get('filter', '')
        if ledger_name:
            ledgers = Ledger.objects.filter(name__istartswith=ledger_name)
        else:
            ledgers = Ledger.objects.filter(parent=None)
        ledger_list = []
        if request.is_ajax():
            for ledger in ledgers:
                ledger_list.append(ledger.get_json_data())
            res = {
                'result': 'ok',
                'ledgers': ledger_list,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'ledgers.html', {})

class LedgerBalance(View):
    def get(self, request, *args, **kwargs):
        ledger_name = request.GET.get('ledger_name', '')
        ledger_list = []
        ledgers = Ledger.objects.filter(name__istartswith=ledger_name)
        for ledger in ledgers: 
            if ledger.ledger_set.all().count() == 0:           
                ledger_list.append({
                    'id': ledger.id,
                    'name': ledger.name,
                    'balance': ledger.balance
                })            
        res = {
            'result': 'ok',
            'ledgers': ledger_list,
        }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

class DeleteLedger(View):

    def get(self, request, *args, **kwargs):
        ledger_id = request.GET.get('ledger_id', '')
        ledger = Ledger.objects.get(id=ledger_id)
        ledger.delete()
        return HttpResponseRedirect(reverse('ledgers'))    

class LedgerSubledgerList(View):

    def get(self, request, *args, **kwargs):
        ledger_id = kwargs['ledger_id']
        if request.is_ajax():
            ledger = Ledger.objects.get(id=ledger_id)
            subledgers = []
            sub_ledgers = Ledger.objects.filter(parent=ledger)
            for sub_ledger in sub_ledgers:
                subledgers.append(sub_ledger.get_json_data())
            res = {
                'subledgers': subledgers,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')      
        context = {
            'ledger_id': ledger_id,
        }
        return render(request, 'ledgers.html', context)     
        
class BankAccountDetails(View):

    def get(self, request, *args, **kwargs):

        bank_accounts = Ledger.objects.filter(parent__account_code='1003')
        ctx_bank_accounts = []
        for bank_account in bank_accounts:
            ctx_bank_accounts.append({
                'id': bank_account.id,
                'name': bank_account.name,
            })
        res = {
            'result': 'ok',
            'bank_accounts': ctx_bank_accounts,
        }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

    def post(self, request, *args, **kwargs):

        bank_account = Ledger.objects.get(name='Bank')
        try:
            new_bank_account = Ledger.objects.get(parent=bank_account, name=request.POST['bank_account'])
            res = {
                'result': 'error',
                'message': 'Bank Account with this name already exists',
            }
        except:
            new_bank_account = Ledger.objects.create(parent=bank_account, name=request.POST['bank_account'])
            latest_sub_ledger = Ledger.objects.filter(parent=bank_account).latest('id').id
            account_code = int(bank_account.account_code) + int(latest_sub_ledger) + 1
            new_bank_account.account_code = account_code
            new_bank_account.save()
            res = {
                'result': 'ok',
                'bank_account': {
                    'id': new_bank_account.id
                },
            }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

class PaymentsView(View):

    def get(self, request, *args, **kwargs):

        return render(request, 'payments.html', {})

    def post(self, request, *args, **kwargs):

        if request.is_ajax():
            payment_details = ast.literal_eval(request.POST['payment'])
            transaction = Transaction()            
            if payment_details['mode'] == 'cash':
                credit_ledger = Ledger.objects.get(account_code="1005")
                ledger_entry = LedgerEntry()
                ledger_entry.ledger = credit_ledger
                ledger_entry.credit_amount = payment_details['amount']
                ledger_entry.date = datetime.strptime(payment_details['transaction_date'], '%d/%m/%Y')
            else:
                credit_ledger = Ledger.objects.get(id=payment_details['bank_account'])
                ledger_entry = LedgerEntry()
                ledger_entry.ledger = credit_ledger
                ledger_entry.credit_amount = payment_details['amount']
                ledger_entry.date = datetime.strptime(payment_details['transaction_date'], '%d/%m/%Y')
            ledger_entry.save()
            credit_ledger.balance = float(credit_ledger.balance) - float(payment_details['amount'])
            credit_ledger.save()
            try:
                transaction_ref = Transaction.objects.latest('id').id
                transaction.transaction_ref = 'PY'+str(transaction_ref+1)
            except:
                transaction_ref = '1'
                transaction.transaction_ref = 'PY'+str(transaction_ref)
            ledger_entry.transaction_reference_number = transaction.transaction_ref 
            ledger_entry.save()
            transaction.credit_ledger = ledger_entry
            ledger_id = payment_details['ledger']
            ledger = Ledger.objects.get(id=ledger_id)
            debit_ledger_entry = LedgerEntry()
            debit_ledger_entry.ledger = ledger
            debit_ledger_entry.debit_amount = payment_details['amount']
            debit_ledger_entry.date = datetime.strptime(payment_details['transaction_date'], '%d/%m/%Y')
            debit_ledger_entry.save()
            ledger.balance = float(ledger.balance) + float(debit_ledger_entry.debit_amount)
            ledger.save()
            transaction.debit_ledger = debit_ledger_entry
            transaction.transaction_date = datetime.strptime(payment_details['transaction_date'], '%d/%m/%Y')
            transaction.debit_amount = payment_details['amount']
            transaction.credit_amount = payment_details['amount']
            if payment_details.get('narration', ''):
                transaction.narration = payment_details['narration']
            transaction.payment_mode = payment_details['mode']
            if payment_details['mode'] == 'card' or payment_details['mode'] == 'cheque':
                transaction.bank_name = payment_details['bank_name']
                if payment_details['mode'] == 'card':
                    transaction.card_holder_name = payment_details['card_holder_name']
                    transaction.card_no = payment_details['card_no']
                elif payment_details['mode'] == 'cheque':
                    transaction.cheque_date = datetime.strptime(payment_details['cheque_date'], '%d/%m/%Y')
                    transaction.cheque_number = payment_details['cheque_number']
                    transaction.branch = payment_details['branch']
            transaction.save()
            res = {
                'result': 'ok',
                'message': 'Payment saved successfully',
                'transaction_reference_no': transaction.transaction_ref,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json') 

class ReceiptsView(View) :

    def get(self, request, *args, **kwargs):

        return render(request, 'receipts.html', {})

    def post(self, request, *args, **kwargs):

        if request.is_ajax():
            receipt_details = ast.literal_eval(request.POST['receipt'])
            transaction = Transaction()            
            if receipt_details['mode'] == 'cash':
                debit_ledger = Ledger.objects.get(account_code="1005")
                ledger_entry = LedgerEntry()
                ledger_entry.ledger = debit_ledger
                ledger_entry.debit_amount = receipt_details['amount']
                ledger_entry.date = datetime.strptime(receipt_details['transaction_date'], '%d/%m/%Y')
            else:
                debit_ledger = Ledger.objects.get(id=receipt_details['bank_account'])
                ledger_entry = LedgerEntry()
                ledger_entry.ledger = debit_ledger
                ledger_entry.debit_amount = receipt_details['amount']
                ledger_entry.date = datetime.strptime(receipt_details['transaction_date'], '%d/%m/%Y')
            ledger_entry.save()
            debit_ledger.balance = float(debit_ledger.balance) + float(receipt_details['amount'])
            debit_ledger.save()
            try:
                transaction_ref = Transaction.objects.latest('id').id
                transaction.transaction_ref = 'RCPT'+str(transaction_ref+1)
            except:
                transaction_ref = '1'
                transaction.transaction_ref = 'RCPT'+str(transaction_ref)
            transaction.save()
            ledger_entry.transaction_reference_number = transaction.transaction_ref
            ledger_entry.save()
            transaction.debit_ledger = ledger_entry
            ledger_id = receipt_details['ledger']
            ledger = Ledger.objects.get(id=ledger_id)
            credit_ledger_entry = LedgerEntry()
            credit_ledger_entry.ledger = ledger
            credit_ledger_entry.credit_amount = receipt_details['amount']
            credit_ledger_entry.date = datetime.strptime(receipt_details['transaction_date'], '%d/%m/%Y')
            credit_ledger_entry.transaction_reference_number = transaction.transaction_ref
            credit_ledger_entry.save()
            ledger.balance = float(ledger.balance) - float(credit_ledger_entry.credit_amount)
            ledger.save()
            transaction.credit_ledger = credit_ledger_entry
            transaction.transaction_date = datetime.strptime(receipt_details['transaction_date'], '%d/%m/%Y')
            transaction.credit_amount = receipt_details['amount']
            transaction.debit_amount = receipt_details['amount']
            if receipt_details.get('narration', ''):
                transaction.narration = receipt_details['narration']
            transaction.payment_mode = receipt_details['mode']
            if receipt_details['mode'] == 'card' or receipt_details['mode'] == 'cheque':
                transaction.bank_name = receipt_details['bank_name']
                if receipt_details['mode'] == 'card':
                    transaction.card_holder_name = receipt_details['card_holder_name']
                    transaction.card_no = receipt_details['card_no']
                elif receipt_details['mode'] == 'cheque':
                    transaction.cheque_date = datetime.strptime(receipt_details['cheque_date'], '%d/%m/%Y')
                    transaction.cheque_number = receipt_details['cheque_number']
                    transaction.branch = receipt_details['branch']
            transaction.save()
            res = {
                'result': 'ok',
                'message': 'Receipt saved successfully',
                'transaction_reference_no': transaction.transaction_ref,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')  

class OtherTransactionView(View):

    def get(self, request, *args, **kwargs):   
        
        return render(request, 'other_transaction.html', {})          

    def post(self, request, *args, **kwargs):

        if request.is_ajax():
            transaction_details = ast.literal_eval(request.POST['transaction'])
            transaction = Transaction()
            debit_ledger = Ledger.objects.get(id=transaction_details['debit_ledger'])
            credit_ledger = Ledger.objects.get(id=transaction_details['credit_ledger'])
            transaction.transaction_date = datetime.strptime(transaction_details['transaction_date'], '%d/%m/%Y')
            transaction.debit_amount = transaction_details['amount']
            transaction.credit_amount = transaction_details['amount']
            if transaction_details.get('narration', ''):
                transaction.narration = transaction_details['narration']
            debit_ledger_entry = LedgerEntry()
            debit_ledger_entry.ledger = debit_ledger
            debit_ledger_entry.debit_amount = transaction_details['amount']
            debit_ledger_entry.date = datetime.strptime(transaction_details['transaction_date'], '%d/%m/%Y')
            debit_ledger_entry.save()
            credit_ledger_entry = LedgerEntry()
            credit_ledger_entry.ledger = credit_ledger
            credit_ledger_entry.credit_amount = transaction_details['amount']
            credit_ledger_entry.date = datetime.strptime(transaction_details['transaction_date'], '%d/%m/%Y')
            credit_ledger_entry.save()
            debit_ledger.balance = float(debit_ledger.balance) + float(transaction_details['amount'])
            debit_ledger.save()
            credit_ledger.balance = float(credit_ledger.balance) - float(transaction_details['amount'])
            credit_ledger.save()
            try:
                transaction_ref = Transaction.objects.latest('id').id
                transaction.transaction_ref = 'OT'+str(transaction_ref+1)
            except:
                transaction_ref = '1'
                transaction.transaction_ref = 'OT'+str(transaction_ref)
            debit_ledger_entry.transaction_reference_number = transaction.transaction_ref
            debit_ledger_entry.save()
            credit_ledger_entry.transaction_reference_number = transaction.transaction_ref
            credit_ledger_entry.save()
            transaction.debit_ledger = debit_ledger_entry
            transaction.credit_ledger = credit_ledger_entry
            transaction.save()
            res = {
                'result': 'ok',
                'message': 'Transaction saved successfully',
                'transaction_reference_no': transaction.transaction_ref,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json') 

class EditTransactions(View):

    def get(self, request, *args, **kwargs):
        transaction_details = {}
        transaction_no = request.GET.get('transaction_no', '')
        if request.is_ajax():
            if transaction_no:
                try:
                    transaction = Transaction.objects.get(transaction_ref=transaction_no)
                    transaction_details = transaction.set_attributes()
                    is_payment = 'false'
                    is_receipt = 'false'
                    is_other_transaction = 'false'
                    ref_id = transaction_no[:2]
                    if ref_id == 'PY':
                        is_payment = 'true'
                    elif ref_id == 'RC':
                        is_receipt = 'true'
                    elif ref_id == 'OT':
                        is_other_transaction = 'true'
                    res = {
                        'result': 'ok',
                        'transaction_details': transaction_details,
                        'is_transaction': 'true',
                        'is_payment': is_payment,
                        'is_receipt': is_receipt,
                        'is_other_transaction': is_other_transaction,
                    }
                except Exception as ex:
                    res = {
                        'result': 'error',
                        'transaction_details': transaction_details,
                        'message': 'No such transaction',
                        'is_transaction': 'false',
                    }   
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'edit_transactions.html', {})

    def post(self, request, *args, **kwargs):

        transaction_details = ast.literal_eval(request.POST['transaction_details'])
        transaction = Transaction.objects.get(id=transaction_details['id'])
        ref_id = transaction.transaction_ref[:2]
        if ref_id == 'PY':
            if transaction.debit_ledger.ledger.id != transaction_details['debit_ledger']:
                new_ledger = Ledger.objects.get(id=transaction_details['debit_ledger'])
                transaction.debit_ledger.ledger.balance = float(transaction.debit_ledger.ledger.balance) - float(transaction.debit_ledger.debit_amount)
                transaction.debit_ledger.ledger.save()
                transaction.debit_ledger.ledger = new_ledger
                transaction.debit_ledger.ledger.balance = float(transaction.debit_ledger.ledger.balance) + float(transaction_details['amount'])
                transaction.debit_ledger.ledger.save()
                transaction.debit_ledger.debit_amount = transaction_details['amount']
                transaction.debit_ledger.save()
            else:
                transaction.debit_ledger.ledger.balance = float(transaction_details['amount']) + (float(transaction.debit_ledger.ledger.balance) - float(transaction.debit_ledger.debit_amount))
                transaction.debit_ledger.debit_amount = transaction_details['amount']
                transaction.debit_ledger.ledger.save()
                transaction.debit_ledger.save()
            transaction.credit_ledger.ledger.balance = (float(transaction.credit_ledger.ledger.balance) + float(transaction.credit_ledger.credit_amount)) - float(transaction_details['amount'])
            transaction.credit_ledger.credit_amount = transaction_details['amount']
            transaction.credit_ledger.ledger.save()
            transaction.credit_ledger.save()
        elif ref_id == 'RC':
            if transaction.credit_ledger.ledger.id != transaction_details['credit_ledger']:
                new_ledger = Ledger.objects.get(id=transaction_details['credit_ledger'])
                transaction.credit_ledger.ledger.balance = float(transaction.credit_ledger.ledger.balance) + float(transaction.credit_ledger.credit_amount)
                transaction.credit_ledger.ledger.save()
                transaction.credit_ledger.ledger = new_ledger
                transaction.credit_ledger.ledger.balance = float(transaction.credit_ledger.ledger.balance) - float(transaction_details['amount'])
                transaction.credit_ledger.ledger.save()
                transaction.credit_ledger.credit_amount = transaction_details['amount']
                transaction.credit_ledger.save()
            else:
                transaction.credit_ledger.ledger.balance = (float(transaction.credit_ledger.ledger.balance) + float(transaction.credit_ledger.credit_amount)) - float(transaction_details['amount'])
                transaction.credit_ledger.ledger.save()
                transaction.credit_ledger.credit_amount = transaction_details['amount']
                transaction.credit_ledger.save()
            transaction.debit_ledger.ledger.balance = float(transaction_details['amount']) + (float(transaction.debit_ledger.ledger.balance) - float(transaction.debit_ledger.debit_amount))
            transaction.debit_ledger.ledger.save()
            transaction.debit_ledger.debit_amount = transaction_details['amount']
            transaction.debit_ledger.save()
        elif ref_id == 'OT':
            is_other_transaction = 'true'
            if transaction.debit_ledger.ledger.id != transaction_details['debit_ledger']:
                new_ledger = Ledger.objects.get(id=transaction_details['debit_ledger'])
                transaction.debit_ledger.ledger.balance = float(transaction.debit_ledger.ledger.balance) - float(transaction.debit_ledger.debit_amount)
                transaction.debit_ledger.ledger.save()
                transaction.debit_ledger.ledger = new_ledger
                transaction.debit_ledger.ledger.balance = float(transaction.debit_ledger.ledger.balance) + float(transaction_details['amount'])
                transaction.debit_ledger.ledger.save()
                transaction.debit_ledger.debit_amount = transaction_details['amount']
                transaction.debit_ledger.save()
            else:
                transaction.debit_ledger.ledger.balance = float(transaction_details['amount']) + (float(transaction.debit_ledger.ledger.balance) - float(transaction.debit_ledger.debit_amount))
                transaction.debit_ledger.ledger.save()
                transaction.debit_ledger.debit_amount = transaction_details['amount']
                transaction.debit_ledger.save()

            if transaction.credit_ledger.ledger.id != transaction_details['credit_ledger']:
                new_ledger = Ledger.objects.get(id=transaction_details['credit_ledger'])
                transaction.credit_ledger.ledger.balance = float(transaction.credit_ledger.ledger.balance) + float(transaction.credit_ledger.credit_amount)
                transaction.credit_ledger.ledger.save()
                transaction.credit_ledger.ledger = new_ledger
                transaction.credit_ledger.ledger.balance = float(transaction.credit_ledger.ledger.balance) - float(transaction_details['amount'])
                transaction.credit_ledger.ledger.save()
                transaction.credit_ledger.credit_amount = transaction_details['amount']
                transaction.credit_ledger.save()
            else:
                transaction.credit_ledger.ledger.balance = (float(transaction.credit_ledger.ledger.balance) + float(transaction.credit_ledger.credit_amount)) - float(transaction_details['amount'])
                transaction.credit_ledger.ledger.save()
                transaction.credit_ledger.credit_amount = transaction_details['amount']
                transaction.credit_ledger.save()
        transaction.debit_amount = transaction_details['amount']
        transaction.credit_amount = transaction_details['amount']
        if transaction_details.get('bank_name', ''):
            transaction.bank_name = transaction_details['bank_name']
        if transaction_details.get('cheque_no', ''):
            transaction.cheque_number = transaction_details['cheque_no']
        if transaction_details.get('cheque_date', ''):
            transaction.cheque_date = datetime.strptime(transaction_details['cheque_date'], '%d/%m/%Y')
        if transaction_details.get('branch', ''):
            transaction.branch = transaction_details['branch']
        if transaction_details.get('card_holder_name', ''):
            transaction.card_holder_name = transaction_details['card_holder_name']
            transaction.card_no = transaction_details['card_no']
        transaction.save()
        res = {
            'result': 'ok',
        }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

class OpeningBalance(View):

    def get(self, request, *args, **kwargs):

        return render(request, 'opening_balance.html', {})

    def post(self, request, *args, **kwargs):

        opening_balance_details = ast.literal_eval(request.POST['opening_balance'])
        ledger =  Ledger.objects.get(id=opening_balance_details['ledger'])
        opening_balance_ledger_entry = LedgerEntry()
        opening_balance_ledger_entry.ledger = ledger
        if float(opening_balance_details['amount']) < 0:
            opening_balance_ledger_entry.credit_amount = abs(float(opening_balance_details['amount']))
        else:
            opening_balance_ledger_entry.debit_amount = opening_balance_details['amount']
        opening_balance_ledger_entry.date = datetime.strptime(opening_balance_details.get('date', ''), '%d/%m/%Y')
        opening_balance_ledger_entry.save()
        opening_balance_ledger_entry.ledger.balance = float(opening_balance_ledger_entry.ledger.balance) + float(opening_balance_details['amount'])
        opening_balance_ledger_entry.ledger.save()

        transaction = Transaction()
        transaction.debit_ledger = opening_balance_ledger_entry
        transaction.debit_amount = opening_balance_ledger_entry.debit_amount
        transaction.transaction_date = opening_balance_ledger_entry.date
        transaction.save()
        transaction.transaction_ref = 'OPBL' + str(transaction.id)
        transaction.narration = 'Through Opening Balance'
        transaction.save()
        opening_balance_ledger_entry.transaction_reference_number = transaction.transaction_ref
        opening_balance_ledger_entry.save()
        res = {
            'result': 'ok',
            'transaction_reference_no': transaction.transaction_ref,
        }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

class DayBookView(View):

    def get(self, request, *args, **kwargs):
        current_date = datetime.now().date()
        if request.GET.get('date', ''):
            date = datetime.strptime(request.GET.get('date', ''), '%d/%m/%Y')
            stock_ledger = Ledger.objects.get(name="Stock")
            if request.GET.get('ledger',''):
                ledger = Ledger.objects.get(id=request.GET.get('ledger',''))
                if request.GET.get('end_date', ''):
                    end_date = datetime.strptime(request.GET.get('end_date', ''), '%d/%m/%Y')
                    transactions = Transaction.objects.filter(Q(transaction_date__gte=date), Q(transaction_date__lte=end_date), Q(debit_ledger__ledger=ledger) | Q(credit_ledger__ledger=ledger)).order_by('transaction_date')
                else:
                    transactions = Transaction.objects.filter(Q(transaction_date=date), Q(debit_ledger__ledger=ledger) | Q(credit_ledger__ledger=ledger)).order_by('transaction_date')
            else:
                if request.GET.get('end_date', ''):
                    end_date = datetime.strptime(request.GET.get('end_date', ''), '%d/%m/%Y')
                    transactions = Transaction.objects.filter(transaction_date__gte=date, transaction_date__lte=end_date).order_by('transaction_date')
                else:
                    transactions = Transaction.objects.filter(Q(transaction_date=date)).order_by('transaction_date')
            if request.is_ajax():
                transaction_entries_list = []
                for transaction in transactions:
                    stock_transaction = False
                    if transaction.debit_ledger:
                        if transaction.debit_ledger.ledger == stock_ledger:
                            stock_transaction = True
                            continue
                    if transaction.credit_ledger:
                        if transaction.credit_ledger.ledger == stock_ledger:
                            stock_transaction = True
                            continue
                    if not stock_transaction: 
                        if transaction.debit_ledger:
                            transaction_entries_list.append({
                                'id': transaction.id,
                                'transaction_ref': transaction.transaction_ref,
                                'debit_ledger': transaction.debit_ledger.ledger.name if transaction.debit_ledger else '',
                                'debit_amount': transaction.debit_amount,
                                'date': transaction.transaction_date.strftime('%d/%m/%Y'),
                            })
                        if transaction.credit_ledger:
                            transaction_entries_list.append({
                                'id': transaction.id,
                                'transaction_ref': transaction.transaction_ref,
                                'credit_ledger': transaction.credit_ledger.ledger.name if transaction.credit_ledger else '',
                                'credit_amount': transaction.credit_amount,
                                'date': transaction.transaction_date.strftime('%d/%m/%Y'),
                            })
                res = {
                    'result': 'ok',
                    'transaction_entries': transaction_entries_list,
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
                if date and request.GET.get('end_date', '') and request.GET.get('ledger',''):
                    heading = 'Day Book - '+date.strftime('%d/%m/%Y')+' - '+request.GET.get('end_date', '')+' - '+ledger.name
                elif date and request.GET.get('end_date', ''):
                    heading = 'Day Book - '+date.strftime('%d/%m/%Y')+' - '+request.GET.get('end_date', '')
                elif date:
                    heading = 'Day Book - '+date.strftime('%d/%m/%Y')
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
                data.append(['Date', 'Ref no', 'Particulars', 'Debit amt.', 'Credit amt.'])
                table = Table(data, colWidths=(70, 80, 150, 105, 105), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,0), 11),
                            ])  
                elements.append(table)
                elements.append(Spacer(1,.1*cm ))
                data = []
                for transaction in transactions:
                    stock_transaction = False
                    if transaction.debit_ledger:
                        if transaction.debit_ledger.ledger == stock_ledger:
                            stock_transaction = True
                            continue
                    if transaction.credit_ledger:
                         if transaction.credit_ledger.ledger == stock_ledger:
                            stock_transaction = True
                            continue
                    if not stock_transaction:  
                        particulars = Paragraph(transaction.narration, para_style)
                        if transaction.debit_ledger:
                            data.append([transaction.transaction_date.strftime('%d/%m/%Y'),transaction.transaction_ref, \
                        particulars, transaction.debit_amount, ''])
                        if transaction.credit_ledger:
                            data.append([transaction.transaction_date.strftime('%d/%m/%Y'),transaction.transaction_ref, \
                        particulars, '', transaction.credit_amount])
                if len(data) > 0:
                    table = Table(data, colWidths=(70, 80, 150, 105, 105), style=style) 
                    elements.append(table)
                p.build(elements)  
                return response  
        return render(request, 'day_book.html', {'current_date': current_date.strftime('%d/%m/%Y')})

class CashBookView(View):

    def get(self, request, *args, **kwargs):
        start_date = request.GET.get('start_date', '')
        end_date = request.GET.get('end_date', '')
        cash_entries_list = []
        if start_date and end_date:
            start_date = datetime.strptime(request.GET.get('start_date', ''), '%d/%m/%Y')
            end_date = datetime.strptime(request.GET.get('end_date', ''), '%d/%m/%Y')
            ledger = Ledger.objects.get(name='Cash')
            cash_entries = Transaction.objects.filter(Q(debit_ledger__ledger=ledger)| Q(credit_ledger__ledger=ledger), Q(transaction_date__gte=start_date), Q(transaction_date__lte=end_date)).order_by('transaction_date')
            if request.is_ajax():
                for cash_entry in cash_entries:
                    cash_entries_list.append({
                        'transaction_ref': cash_entry.transaction_ref,
                        'debit_ledger': cash_entry.debit_ledger.ledger.name,
                        'debit_ledger_debit': cash_entry.debit_ledger.debit_amount if cash_entry.debit_ledger.debit_amount else '',
                        'debit_ledger_credit': cash_entry.debit_ledger.credit_amount if cash_entry.debit_ledger.credit_amount else '',
                        'credit_ledger': cash_entry.credit_ledger.ledger.name,
                        'credit_ledger_debit': cash_entry.credit_ledger.debit_amount if cash_entry.credit_ledger.debit_amount else '',
                        'credit_ledger_credit': cash_entry.credit_ledger.credit_amount if cash_entry.credit_ledger.credit_amount else '',
                        'debit_amount': cash_entry.debit_amount,
                        'credits': cash_entry.credit_amount,
                        'date': cash_entry.transaction_date.strftime('%d/%m/%Y'),
                    })
                res = {
                    'result': 'ok',
                    'cash_entries': cash_entries_list,
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
                heading = 'Cash Book - '+start_date.strftime('%d/%m/%Y')+' - '+end_date.strftime('%d/%m/%Y')
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
                data.append(['Date', 'Ref no', 'Particulars', 'Debit amt.', 'Credit amt.'])
                table = Table(data, colWidths=(70, 80, 150, 105, 105), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,0), 11),
                            ])  
                elements.append(table)
                elements.append(Spacer(1,.1*cm ))
                data = []
                for cash_entry in cash_entries:
                    particulars = Paragraph(cash_entry.narration, para_style)
                    if cash_entry.debit_ledger.ledger.name != 'Cash':
                        data.append([cash_entry.transaction_date.strftime('%d/%m/%Y'),cash_entry.transaction_ref, \
                        particulars, '', cash_entry.credit_amount])
                    else:
                        data.append([cash_entry.transaction_date.strftime('%d/%m/%Y'),cash_entry.transaction_ref, \
                        particulars, cash_entry.debit_amount, ''])
                if len(data) > 0:
                    table = Table(data, colWidths=(70, 80, 150, 105, 105), style=style)
                    table.setStyle([
                                ('FONTSIZE', (0,0), (-1,0), 11),
                                ])  
                    elements.append(table)
                p.build(elements)  
                return response  
        return render(request, 'cash_book.html', {})

class BankBookView(View):

    def get(self, request, *args, **kwargs):
        if request.GET.get('start_date', '') and request.GET.get('end_date', ''):
            start_date = datetime.strptime(request.GET.get('start_date', ''), '%d/%m/%Y')
            end_date = datetime.strptime(request.GET.get('end_date', ''), '%d/%m/%Y')
            ledgers = Ledger.objects.get(name='Bank').ledger_set.all()
            if request.is_ajax():
                bank_entries_list = []
                for ledger in ledgers:
                    bank_entries = Transaction.objects.filter(Q(debit_ledger__ledger=ledger)| Q(credit_ledger__ledger=ledger), Q(transaction_date__gte=start_date), Q(transaction_date__lte=end_date)).order_by('transaction_date')
                    for bank_entry in bank_entries:
                        bank_entries_list.append({
                            'transaction_ref': bank_entry.transaction_ref,
                            'debit_ledger': bank_entry.debit_ledger.ledger.name,
                            'debit_ledger_debit': bank_entry.debit_ledger.debit_amount if bank_entry.debit_ledger.debit_amount else '',
                            'debit_ledger_credit': bank_entry.debit_ledger.credit_amount if bank_entry.debit_ledger.credit_amount else '',
                            'credit_ledger': bank_entry.credit_ledger.ledger.name,
                            'credit_ledger_debit': bank_entry.credit_ledger.debit_amount if bank_entry.credit_ledger.debit_amount else '',
                            'credit_ledger_credit': bank_entry.credit_ledger.credit_amount if bank_entry.credit_ledger.credit_amount else '',
                            'debit_amount': bank_entry.debit_amount,
                            'credit_amount': bank_entry.credit_amount,
                            'date': bank_entry.transaction_date.strftime('%d/%m/%Y'),
                            'narration': bank_entry.narration,
                        })
                res = {
                    'result': 'ok',
                    'bank_entries': bank_entries_list,
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
                heading = 'Bank Book - '+start_date.strftime('%d/%m/%Y')+' - '+end_date.strftime('%d/%m/%Y')
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
                data.append(['Date', 'Ref no', 'Particulars', 'Debit amt.', 'Credit amt.'])
                table = Table(data, colWidths=(70, 80, 150, 105, 105), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,0), 11),
                            ])  
                elements.append(table)
                elements.append(Spacer(1,.1*cm ))
                data = []
                for ledger in ledgers:
                    bank_entries = Transaction.objects.filter(Q(debit_ledger__ledger=ledger)| Q(credit_ledger__ledger=ledger), Q(transaction_date__gte=start_date), Q(transaction_date__lte=end_date)).order_by('transaction_date')
                    for bank_entry in bank_entries:
                        data.append([bank_entry.transaction_date.strftime('%d/%m/%Y'), bank_entry.transaction_ref, bank_entry.narration, bank_entry.debit_amount, bank_entry.credit_amount])
                if len(data) > 0:
                    table = Table(data, colWidths=(70, 80, 150, 105, 105), style=style)
                    table.setStyle([
                                ('FONTSIZE', (0,0), (-1,0), 11),
                                ])  
                    elements.append(table)
                p.build(elements)  
                return response  
        return render(request, 'bank_book.html', {})

