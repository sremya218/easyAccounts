import simplejson
import ast
from datetime import datetime
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
from django.contrib.admin.util import lookup_field

from administration.models import Staff, Permission, BonusPoint, Salesman, SerialNoBill, SerialNoInvoice

from sales.models import Receipt,Invoice,Sale
from inventory.models import BatchItem
from customers.models import Customer

style = [
    ('FONTNAME',(0,0),(-1,-1),'Helvetica') 
]
sales_receipt_style = [
    ('FONTNAME',(0,0),(-1,-1),'Helvetica') 
]
para_style = ParagraphStyle('fancy')
para_style.fontSize = 10.5
para_style.fontName = 'Helvetica'

class StaffList(View):

    def get(self, request, *args, **kwargs):
        if request.user.is_superuser:
            staffs = Staff.objects.all()
            staff_data = []
            if request.is_ajax():
                
                for staff in staffs:
                    staff_data.append(staff.get_json_data())
                res = {
                    'result': 'ok',
                    'staffs': staff_data,
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
            return render(request, 'staffs.html', {})
        else:
            return render(request, 'staffs.html', {'message': 'You have no permission to access this page'})


class AddStaff(View):

    def get(self, request, *args, **kwargs):

        return render(request, 'add_staff.html', {})

    def post(self, request, *args, **kwargs):
        if request.is_ajax():
            staff_details = ast.literal_eval(request.POST['staff_details'])
            if staff_details.get('id', ''):
                staff = Staff.objects.get(id=staff_details['id'])
                user = staff.user
            else:
                try:
                    user = User.objects.get(username=staff_details['username'])
                    res = {
                        'result': 'error',
                        'message': 'Username already exists',
                    }
                except Exception as ex:
                    user = User.objects.create(username=staff_details['username'])
                    user.set_password(staff_details['password'])
                    user.save()
                    staff = Staff.objects.create(user=user)
            staff_data = staff.set_attributes(staff_details, request.POST['address'])
            res = {
                'result': 'ok',
                'name': staff.user.first_name + '  ' + staff.user.last_name,
                'id': staff.id,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')


class EditStaff(View):

    def get(self, request, *args, **kwargs):
        staff_id = request.GET.get('staff_id')
        context = {
            'staff_id': staff_id,
        }
        if request.is_ajax():
            staff_id = request.GET.get('staff_id')
            staff = Staff.objects.get(id=staff_id)
            staff_details = []
            staff_data = staff.get_json_data()
            staff_details.append(staff_data)
            res = {
                'result': 'ok',
                'staff': staff_details,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'edit_staff.html',context)


class DeleteStaff(View):

    def get(self, request, *args, **kwargs):
        staff_id = request.GET.get('staff_id', '')
        if staff_id:
            staff = Staff.objects.get(id=staff_id)
            staff.user.delete()
            staff.delete()
        return HttpResponseRedirect(reverse('staffs'))


class CheckStaffUserExists(View):
    def get(self, request, *args, **kwargs):
        username = request.GET.get('username', '')
        if username:
            try:
                user = User.objects.get(username=username)
                res = {
                    'result': 'error',
                    'message': 'Username already exists',
                }
            except Exception as ex:
                res = {
                    'result': 'ok',
                }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')


class SearchStaff(View):

    def get(self, request, *args, **kwargs):

        staff_name = request.GET.get('staff_name', '')
        ctx_staffs = []
        if staff_name:
            staffs = Staff.objects.filter(user__first_name__istartswith=staff_name)
            for staff in staffs:
                staff_data = staff.get_json_data()
                ctx_staffs.append(staff_data)
        res = {
            'result': 'ok',
            'staffs': ctx_staffs,
        }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

class GetStaffPermissions(View):

    def get(self, request, *args, **kwargs):

        user = request.user
        staff = user.staff_set.all()
        if staff.count() > 0:
            staff = staff[0]
            res = {
                'result': 'ok',
                'staff': staff.get_json_data(),
                'is_staff': True,
            }
        else:
            res = {
                'result': 'ok',
                'staff': {},
                'is_staff': False,
            }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')


class SetPermissions(View):

    def get(self, request, *args, **kwargs):
        return render(request, 'permission.html', {})
    def post(self, request, *args, **kwargs):

        permission_details = ast.literal_eval(request.POST['staff_permission'])
        staff_id = permission_details['staff']
        staff = Staff.objects.get(id=staff_id)
        if staff.permission:
            permission = staff.permission
        else:
            permission = Permission()
        if permission_details['accounts_permission'] == 'true':
            permission.accounts_permission = True
        else:
            permission.accounts_permission = False
        if permission_details['inventory_permission'] == 'true':
            permission.inventory_permission = True
        else:
            permission.inventory_permission = False
        if permission_details['purchase_permission'] == 'true':
            permission.purchase_permission = True
        else:
            permission.purchase_permission = False
        if permission_details['sales_permission'] == 'true':
            permission.sales_permission = True
        else:
            permission.sales_permission = False
        if permission_details['suppliers_permission'] == 'true':
            permission.suppliers = True
        else:
            permission.suppliers = False
        if permission_details['customers_permission'] == 'true':
            permission.customers = True
        else:
            permission.customers = False
        if permission_details['reports_permission'] == 'true':
            permission.reports_permission = True
        else:
            permission.reports_permission = False
        permission.save()
        staff.permission = permission
        staff.save()
        res = {
            'result': 'ok'
        }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')


class BonusPointList(View):
    def get(self, request, *args, **kwargs):
        if request.is_ajax():
            bonus_points = BonusPoint.objects.all().order_by('id')
            bonus_point_list = []
            if request.GET.get('type_name', ''):
                bonus_points = BonusPoint.objects.filter(bonus_type=request.GET.get('type_name', ''))
            for bonus_point in bonus_points:
                bonus_point_data = bonus_point.get_json_data()
                bonus_point_list.append(bonus_point_data)
            res = {
                'bonus_points': bonus_point_list,
            } 
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'bonus_points.html', {})

class CreateBonusPoint(View):

    def get(self, request, *args, **kwargs):
        bonus_point_id = request.GET.get('bonus_point_id', '')
        if request.is_ajax() and bonus_point_id:
            bonus_point = BonusPoint.objects.get(id=bonus_point_id)
            bonus_point_details = bonus_point.get_json_data()
            res = {
                'bonus_point': bonus_point_details,
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'create_bonus_point.html', {'bonus_point_id': bonus_point_id})

    def post(self, request, *args, **kwargs):

        bonus_point_details = ast.literal_eval(request.POST['bonus_point'])
        if bonus_point_details.get('id', ''):
            bonus_points = BonusPoint.objects.filter(bonus_type=bonus_point_details['type'], bonus_point=bonus_point_details['point']).exclude(id=bonus_point_details['id'])
            if bonus_points.count() == 0:
                bonus_point = BonusPoint.objects.get(id=bonus_point_details['id'])
                bonus_point_obj = bonus_point.set_attributes(bonus_point_details)
            else:
                res = {
                    'result': 'error',
                    'message': 'Bonus Point already exists',
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
        else:
            try:
                bonus_point = BonusPoint.objects.get(bonus_type=bonus_point_details['type'], bonus_point=bonus_point_details['point'])
                res = {
                    'result': 'error',
                    'message': 'Bonus Point already exists',
                }
                response = simplejson.dumps(res)
                return HttpResponse(response, status=200, mimetype='application/json')
            except Exception as ex:
                bonus_point = BonusPoint()
                bonus_point_obj = bonus_point.set_attributes(bonus_point_details)
        res = {
            'result': 'ok',
        }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')


class SalesmenList(View):

    def get(self, request, *args, **kwargs):

        if request.is_ajax():
            try:
                salesman_name = request.GET.get('salesman_name', '')
                if salesman_name:
                    salesmen = Salesman.objects.filter(first_name__istartswith=salesman_name)
                else:
                    salesmen = Salesman.objects.all()
                salesman_list= []
                for salesman in salesmen:
                    salesman_data = salesman.get_json_data()
                    salesman_list.append(salesman_data)
                res = {
                    'result': 'ok',
                    'salesmen': salesman_list,
                }
            except Exception as ex:
                print ex
                res = {
                    'result': 'error',
                }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
      
        return render(request, 'salesmen.html', {})


class AddSalesman(View):

    def get(self, request, *args, **kwargs):
        salesman_id = request.GET.get('salesman_id', '')
        if request.is_ajax() and request.GET.get('salesman_id', ''):
            try:
                salesman = Salesman.objects.get(id=salesman_id)
                salesman_details = salesman.get_json_data() 
                res = {
                    'result': 'ok',
                    'salesman': salesman_details,
                }
            except Exception as ex:
                res = {
                    'result': 'error',
                }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')
        return render(request, 'add_salesman.html', {'salesman_id': salesman_id})

    def post(self, request, *args, **kwargs):

        if request.is_ajax():
            salesman_details = ast.literal_eval(request.POST['salesman_details'])
            try:
                if salesman_details.get('id', ''):
                    salesman = Salesman.objects.get(id=salesman_details.get('id', ''))
                else:
                    salesman = Salesman()
                salesman_obj = salesman.set_attributes(salesman_details)
                res = {
                    'result': 'ok',
                    'message': 'ok',
                    'salesman' : salesman.get_json_data()
                }
            except Exception as ex:
                res = {
                    'result': 'error',
                }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')


class DeleteSalesman(View):

    def get(self, request, *args, **kwargs):
        salesman_id = request.GET.get('id', '')
        salesman = Salesman.objects.get(id=salesman_id)
        salesman.delete()
        return HttpResponseRedirect(reverse('salesmen'))


class Incentives(View):
    def get(self, request, *args, **kwargs):
        return render(request, 'incentives.html', {})

class SalesmanSales(View):

    def get(self, request, *args, **kwargs):

        salesman_id = request.GET.get('salesman_id', '')
        start_date = request.GET.get('start_date', '')
        end_date = request.GET.get('end_date', '')
        salesman = Salesman.objects.get(id=salesman_id)
        sales = Sale.objects.filter(salesman=salesman, sales_invoice_date__gte=datetime.strptime(start_date, '%d/%m/%Y'), sales_invoice_date__lte=datetime.strptime(end_date, '%d/%m/%Y'))
        res = {
            'result': 'ok',
            'no_of_sales': sales.count(),
        }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')  
    def post(self, request, *args, **kwargs):

        if request.is_ajax():
            incentive_details = ast.literal_eval(request.POST['incentives_details'])
            try:
                salesman = Salesman.objects.get(id=incentive_details['salesman_id'])
                salesman.incentive_per_sale = incentive_details['incentive_per_sale']
                salesman.save()
                res = {
                    'result': 'ok',
                }
            except:
                res = {
                    'result': 'error',
                }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')

class SalesmanIncentivesReport(View):

    def get(self, request, *args, **kwargs):

        salesman_id = request.GET.get('salesman_id', '')
        start_date = request.GET.get('start_date', '')
        end_date = request.GET.get('end_date', '')
        sales_details = []
        if salesman_id and start_date and end_date:
            salesman = Salesman.objects.get(id=salesman_id)
            sales = Sale.objects.filter(salesman=salesman, sales_invoice_date__gte=datetime.strptime(start_date, '%d/%m/%Y'), sales_invoice_date__lte=datetime.strptime(end_date, '%d/%m/%Y'))
            for sale in sales:
                sales_details.append(sale.get_json_data())
            response = HttpResponse(content_type='application/pdf')
            p = SimpleDocTemplate(response, pagesize=A4)
            elements = []
            data = []
            
            heading = 'Salesman Incentive Report - '+salesman.first_name + '' + salesman.last_name
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
            if sales:
                data.append([ 'Date', 'Invoice','Grant Total','Incentive'])
                table = Table(data, colWidths=(100, 100, 100,  100), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table)
                data = []
                total = 0
                for sale in sales:
                    total = total + sale.grant_total
                    data.append([sale.sales_invoice_date.strftime('%d/%m/%Y'),sale.sales_invoice_number,sale.grant_total,salesman.incentive_per_sale if salesman.incentive_per_sale else 0])
                table = Table(data, colWidths=(100, 100, 100, 100), style=style)
                table.setStyle([
                            ('FONTSIZE', (0,0), (-1,-1), 10),
                            ])   
                elements.append(table)
            p.build(elements)  
            return response
        return render(request, 'salesman_incentives_report.html', {})

class DeleteBonusPoints(View):

    def get(self, request, *args, **kwargs):

        bonus_point_id = request.GET.get('bonus_point_id', '')
        bonus_point = BonusPoint.objects.get(id=bonus_point_id)
        bonus_point.delete()
        return HttpResponseRedirect(reverse('bonus_points'))


class SetBonusPoint(View):

    def get(self, request, *args, **kwargs):

        return render(request, 'set_bonus_point.html', {})

    def post(self, request, *args, **kwrags):

        batch_bonus_details = ast.literal_eval(request.POST['bonus_point_details'])
        batch_item = BatchItem.objects.get(item__id=batch_bonus_details['batch_item'])
        bonus_point = BonusPoint.objects.get(id=batch_bonus_details['bonus_point'])
        if batch_bonus_details['bonus_type'] == 'Salesman':
            batch_item.salesman_bonus_points = bonus_point
            batch_item.salesman_bonus_quantity = batch_bonus_details['bonus_quantity']
        else:
            batch_item.customer_bonus_points = bonus_point
            batch_item.customer_bonus_quantity = batch_bonus_details['bonus_quantity']
        batch_item.save()
        res = {
            'result': 'ok',
        }
        response = simplejson.dumps(res)
        return HttpResponse(response, status=200, mimetype='application/json')

class ViewBonusPoint(View):

    def get(self, request, *args, **kwargs):

        return render(request, 'view_bonus_point.html', {})

class ClearBonusPoint(View):

    def post(self, request, *args, **kwargs):

        if request.is_ajax():
            person_type = request.POST['type']
            if person_type == 'Customer':
                person = Customer.objects.get(id=request.POST['person_id'])
            else:
                person = Salesman.objects.get(id=request.POST['person_id'])
            if person and request.POST['clearing_amount'] > 0 and person.bonus_point > 0:
                person.bonus_point = float(person.bonus_point) - float(request.POST['clearing_amount'])
            person.save()
            res = {
                'result': 'ok',
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json') 

class ViewSerialNosettings(View):

    def get(self, request, *args, **kwargs):

        return render(request, 'view_serial_no.html', {})

class SetSerialNo(View):
    
    def post(self, request, *args, **kwargs):   

        if request.is_ajax():
            serial_no_details = ast.literal_eval(request.POST['serial_no'])
            if serial_no_details:
                if serial_no_details['serial_no_type'] == 'Bill':
                    serial_no = SerialNoBill()
                    serial_no_obj = serial_no.set_attributes(serial_no_details,request)
                elif serial_no_details['serial_no_type'] == 'Invoice':
                    serial_no = SerialNoInvoice()
                    serial_no_obj = serial_no.set_attributes(serial_no_details,request)
            res = {
                'result': 'ok',
            }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')

class GetSerialNo(View):

    def get(self, request, *args, **kwargs):

        if request.is_ajax():

            serial_no_type = request.GET.get('type')
            try:
                serial_no_bill = SerialNoBill.objects.latest('id') 
            except:
                serial_no_bill = None
            try:
                serial_no_invoice = SerialNoInvoice.objects.latest('id') 
            except:
                serial_no_invoice = None
            if serial_no_bill and serial_no_type == 'Receipt':
                if serial_no_bill.is_auto_generated:
                    try:
                        receipt_no  = Receipt.objects.latest('id').receipt_no
                        receipt_no = "RCPT-" + str(int(receipt_no.split('-')[1]) + 1)
                    except Exception as ex:
                        print str(ex)
                        receipt_no = "RCPT-" + str(1)
                else:
                    try:
                        receipt_no  = Receipt.objects.latest('id').receipt_no
                        receipt_no = serial_no_bill.prefix+ str(int(receipt_no.split('-')[1]) + 1)
                        
                    except Exception as ex:
                        receipt_no = serial_no_bill.prefix + str(int(serial_no_bill.starting_no) + 1)    
                res = {
                'result': 'ok',
                'serial_no': receipt_no,
                }
            elif serial_no_type == 'Receipt':
                try:
                    receipt_no  = Receipt.objects.latest('id').receipt_no
                    receipt_no = "RCPT-" + str(int(receipt_no.split('-')[1]) + 1)
                except Exception as ex:
                    receipt_no = "RCPT-" + str(1)
                   
                res = {
                'result': 'ok',
                'serial_no': receipt_no,
                }
            if serial_no_type == 'Invoice' and serial_no_invoice:
                if serial_no_invoice.is_auto_generated:  
                    try:
                        invoice_no  = Invoice.objects.latest('id').invoice_no
                        invoice_no = "INVC-" + str(int(invoice_no.split('-')[1]) + 1)
                    except Exception as ex:
                        invoice_no = "INVC-" + str(1)
                else:
                    try:
                        invoice_no  = Invoice.objects.latest('id').invoice_no
                        invoice_no = serial_no_invoice.prefix+ str(int(invoice_no.split('-')[1]) + 1)
                    except Exception as ex:
                        print str(ex)
                        invoice_no = serial_no_invoice.prefix + str(int(serial_no_invoice.starting_no) + 1)
                res = {
                'result': 'ok',
                'serial_no': invoice_no,
                }
            elif serial_no_type == 'Invoice':
                try:
                    invoice_no  = Invoice.objects.latest('id').invoice_no
                    invoice_no = "INVC-" + str(int(invoice_no.split('-')[1]) + 1)
                except Exception as ex:
                    print str(ex)
                    invoice_no = "INVC-" + str(1)
                res = {
                'result': 'ok',
                'serial_no': invoice_no,
                }
            response = simplejson.dumps(res)
            return HttpResponse(response, status=200, mimetype='application/json')