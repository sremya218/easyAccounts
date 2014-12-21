from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required


from sales.views import (SalesEntry, SalesView, BillToInvoice, EditedSalesEntry, SaleReturn,\
SalesReturnView, EstimateEntry, EstimatePdf, EstimateView, SalesReport, SalesReturnReport, \
CustomerWiseSalesReport, CustomerWiseSalesReturnReport, BrandWiseSalesReport, CategoryWiseSalesReport,\
SupplierWiseSalesReport, ItemWiseSalesReport, AreaWiseCustomerSalesReport, DeliverynotePdf,DeliverynoteView,\
DeliverynoteEntry,DeliveryNoteToSales, EditSales, TaxWiseSalesReport, InvoiceSearch)

urlpatterns = patterns('',
	url(r'edited_sales_entry/$', login_required(EditedSalesEntry.as_view(), login_url='/login/'), name='edited_sales_entry'),
	url(r'sales_entry/$', login_required(SalesEntry.as_view(), login_url='/login/'), name='sales_entry'),
	url(r'^edit_sales/$', login_required(EditSales.as_view(), login_url='/login/'), name='edit_sales'),
	url(r'^sales_return_entry/$', login_required(SaleReturn.as_view(), login_url='/login/'), name='sales_return_entry'),

	url(r'^sales_report/$', login_required(SalesReport.as_view(), login_url='/login/'), name='sales_report'),
	url(r'^sales_return_report/$', login_required(SalesReturnReport.as_view(), login_url='/login/'), name='sales_return_report'),
	url(r'^sales_report_customer_wise/$', login_required(CustomerWiseSalesReport.as_view(), login_url='/login/'), name='sales_report_customer_wise'),
	url(r'^sales_return_customer_wise/$', login_required(CustomerWiseSalesReturnReport.as_view(), login_url='/login/'), name='sales_return_customer_wise'),
	url(r'^sales_report_brand_wise/$', login_required(BrandWiseSalesReport.as_view(), login_url='/login/'), name='sales_report_brand_wise'),
	url(r'^sales_report_category_wise/$', login_required(CategoryWiseSalesReport.as_view(), login_url='/login/'), name='sales_report_category_wise'),
	url(r'^sales_report_vendor_wise/$', login_required(SupplierWiseSalesReport.as_view(), login_url='/login/'), name='sales_report_vendor_wise'),
	url(r'^sales_report_item_wise/$', login_required(ItemWiseSalesReport.as_view(), login_url='/login/'), name='sales_report_item_wise'),
	url(r'^sales_report_area_customer_wise/$', login_required(AreaWiseCustomerSalesReport.as_view(), login_url='/login/'), name='sales_report_area_customer_wise'),
	url(r'^sales_report_tax/$', login_required(TaxWiseSalesReport.as_view(), login_url='/login/'), name='sales_report_tax'),

	url(r'^estimate_entry/$', login_required(EstimateEntry.as_view(), login_url='/login/'), name='estimate_entry'),
	url(r'^estimate_pdf/(?P<estimate_id>\d+)/$', login_required(EstimatePdf.as_view(), login_url='/login/'), name='estimate_pdf'),
	url(r'^estimate_view/$', login_required(EstimateView.as_view(), login_url='/login/'), name='estimate_view'),

	url(r'^sales_view/$', login_required(SalesView.as_view(), login_url='/login/'), name='sales_view'),
	url(r'^sales_return_view/$', login_required(SalesReturnView.as_view(), login_url='/login/'), name='sales_return_view'),

	# url(r'^change_sales_discount/$', login_required(ChangeSalesDiscount.as_view(), login_url='/login/'), name='change_sales_discount')
	url(r'receipt_to_invoice/$', login_required(BillToInvoice.as_view(), login_url='/login/'), name='receipt_to_invoice'),

	url(r'^deliverynote_entry/$', login_required(DeliverynoteEntry.as_view(), login_url='/login/'), name='deliverynote_entry'),
	url(r'^deliverynote_pdf/(?P<delivery_id>\d+)/$', login_required(DeliverynotePdf.as_view(), login_url='/login/'), name='deliverynote_pdf'),
	url(r'^deliverynote_view/$', login_required(DeliverynoteView.as_view(), login_url='/login/'), name='deliverynote_view'),
	url(r'^deliverynote_sales/$', login_required(DeliveryNoteToSales.as_view(), login_url='/login/'), name='deliverynote_sales'),

	url(r'^invoice_no_search/$', login_required(InvoiceSearch.as_view(), login_url='/login/'), name='invoice_no_search'),
)