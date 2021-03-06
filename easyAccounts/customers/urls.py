from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required

from customers.views import Customers, AddCustomer, DeleteCustomer, AccountsReceivable, \
ReceivedReport, EditCustomer, AreaSearch, CustomerBonusPointsReport

urlpatterns = patterns('',	
	url(r'^$', login_required(Customers.as_view(), login_url='/login/'),name='customers'),
	url(r'^add_customer/$', login_required(AddCustomer.as_view(), login_url='/login/'),name='add_customer'),
	url(r'^edit_customer/$', login_required(EditCustomer.as_view(), login_url='/login/'),name='edit_customer'),
	url(r'^delete_customer/$', login_required(DeleteCustomer.as_view(), login_url='/login/'),name='delete_customer'),
	url(r'^accounts_receivable/$', login_required(AccountsReceivable.as_view(), login_url='/login/'),name='accounts_receivable'),
	url(r'^received_report/$', login_required(ReceivedReport.as_view(), login_url='/login/'),name='received_report'),
	url(r'^area_search/$', login_required(AreaSearch.as_view(), login_url='/login/'),name='area_search'),
	url(r'customer_bonus_points/$', login_required(CustomerBonusPointsReport.as_view(), login_url='/login/'), name='customer_bonus_points'),
)	