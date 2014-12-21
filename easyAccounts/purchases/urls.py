from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required

from purchases.views import PurchaseEntry, PriceSettings, PurchaseItemsDetails, PurchaseView, PurchaseDetails, \
 PurchaseReturnEntry, PurchaseReturnView, PurchaseReport, PurchaseReturnReport, SupplierWisePurchaseReport, \
 SupplierWisePurchaseReturnReport, PurchaseEdit, PurchaseInvoiceSearch

urlpatterns = patterns('',
	url(r'entry/$', login_required(PurchaseEntry.as_view(), login_url='/login/'), name="purchase_entry"),
	url(r'edit/$', login_required(PurchaseEdit.as_view(), login_url='/login/'), name="purchase_edit"),
	url(r'purchase_return_view/$', login_required(PurchaseReturnView.as_view(), login_url='/login/'), name='purchase_return_view'),
	url(r'view/$', login_required(PurchaseView.as_view(), login_url='/login/'), name="purchase_view"),
	url(r'return/$', login_required(PurchaseReturnEntry.as_view(), login_url='/login/'), name="purchase_return"),
	url(r'purchase_details/$', login_required(PurchaseDetails.as_view(), login_url='/login/'), name="purchase_details"),
	url(r'price_settings/$', login_required(PriceSettings.as_view(), login_url='/login/'), name="price_settings"),
	url(r'purchase_items_details/$', login_required(PurchaseItemsDetails.as_view(), login_url='/login/'), name='purchase_items_details'),
	url(r'purchase_report/$', login_required(PurchaseReport.as_view(), login_url='/login/'), name='purchase_report'),
	url(r'purchase_report_supplier_wise/$', login_required(SupplierWisePurchaseReport.as_view(), login_url='/login/'), name='purchase_report_supplier_wise'),
	url(r'purchase_return_report/$', login_required(PurchaseReturnReport.as_view(), login_url='/login/'), name='purchase_return_report'),
	url(r'purchase_return_report_supplier_wise/$', login_required(SupplierWisePurchaseReturnReport.as_view(), login_url='/login/'), name='purchase_return_report_supplier_wise'),
	url(r'purchase_invoice_no_search/$', login_required(PurchaseInvoiceSearch.as_view(), login_url='/login/'), name='purchase_invoice_no_search'),
)