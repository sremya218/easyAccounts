from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required

from suppliers.views import AddNewSupplier, Suppliers, DeleteSupplier, AccountsPayable, EditSupplier, \
SupplierStockReport, SupplierItemReport, SupplierPaymentReport

urlpatterns = patterns('',
	url(r'add/$', login_required(AddNewSupplier.as_view(), login_url="/login/"), name="add_supplier"),
	url(r'edit/$', login_required(EditSupplier.as_view(), login_url="/login/"), name="edit_supplier"),
	url(r'delete/$', login_required(DeleteSupplier.as_view(), login_url="/login/"), name="delete_supplier"),
	url(r'accounts_payable/$', login_required(AccountsPayable.as_view(), login_url="/login/"), name="accounts_payable"),
	url(r'vendor_stock_report/$', login_required(SupplierStockReport.as_view(), login_url='/login/'), name='vendor_stock_report'),
	url(r'vendor_wise_item_report/$', login_required(SupplierItemReport.as_view(), login_url='/login/'), name='vendor_wise_item_report'),
	url(r'vendor_wise_payment_report/$', login_required(SupplierPaymentReport.as_view(), login_url='/login/'), name='vendor_wise_payment_report'),
	url(r'^$', login_required(Suppliers.as_view(), login_url="/login/"), name="suppliers"),
)
