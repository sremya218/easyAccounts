from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required

from inventory.views import SearchBatch, SearchBatchItem, BatchList, AddBatch, DeleteBatch, Categories, AddCategory, \
	ItemList, AddItem, DeleteItem, SearchItem, ItemUom, UOMConversionView, SearchProduct, SearchBrand,\
	SearchVat, DeleteCategory, Products, AddProduct, DeleteProduct, Brands, AddBrand, DeleteBrand, VatList, \
	AddVat, DeleteVat, OpeningStockView, BatchItemDetailsView, EditVat, EditBrand, EditProduct, \
	EditBatch, CategorySubcategoryList, SearchItemStock, BatchItemsView, IsCategoryNameExists, StockReport, \
	StockAgingReport, CategoryWiseStockReport, CategoryWiseStockAgingReport, CategoryWiseVendorReport, CategoryWisePurchaseReport, \
	AddMultipleProducts, AddMultipleBrand, AddMultipleVat, CategoryWiseProfitReport


urlpatterns = patterns('',
	url(r'^categories/$', login_required(Categories.as_view(), login_url='/login/'),name='categories'),
	url(r'^subcategory_list/(?P<category_id>\d+)/$', login_required(CategorySubcategoryList.as_view(), login_url='/login/'), name='subcategory_list'),
	url(r'^add_category/$', login_required(AddCategory.as_view(), login_url='/login/'),name='add_category'),
	url(r'^delete_category/$', login_required(DeleteCategory.as_view(), login_url='/login/'),name='delete_category'),
	url(r'^is_category_name_exists/$', login_required(IsCategoryNameExists.as_view(), login_url='/login/'),name='is_category_name_exists'),

	url(r'^search_batch/$', login_required(SearchBatch.as_view(), login_url='/login/'), name='search_batch'),
	url(r'^search_batch_item/$', login_required(SearchBatchItem.as_view(), login_url='/login/'), name='search_batch_item'),

	url(r'^items/$', login_required(ItemList.as_view(), login_url='/login/'),name='items'),
	url(r'^add_item/$', login_required(AddItem.as_view(), login_url='/login/'),name='add_item'),
	url(r'^item_uoms/$', login_required(ItemUom.as_view(), login_url='/login/'), name='item_uoms'),
	url(r'^delete_item/$', login_required(DeleteItem.as_view(), login_url='/login/'),name='delete_item'),
	url(r'^search_item/$', login_required(SearchItem.as_view(), login_url='/login/'), name='search_item'),
	url(r'^uom_conversion/$', login_required(UOMConversionView.as_view(), login_url="login"), name='uom_conversion'),

	url(r'^search_product/$', login_required(SearchProduct.as_view(), login_url='/login/'), name='search_product'),
	url(r'^search_brand/$', login_required(SearchBrand.as_view(), login_url='/login/'), name='search_brand'),
	url(r'^search_vat/$', login_required(SearchVat.as_view(), login_url='/login/'), name='search_vat'),

	url(r'^batches/$', login_required(BatchList.as_view(), login_url='/login/'),name='batches'),
	url(r'^add_batch/$', login_required(AddBatch.as_view(), login_url='/login/'), name='add_batch'),
	url(r'^edit_batch/$', login_required(EditBatch.as_view(), login_url='/login/'), name='edit_batch'),
	url(r'^delete_batch/$', login_required(DeleteBatch.as_view(), login_url='/login/'), name='delete_batch'),
	url(r'^batch_item_details/$', login_required(BatchItemDetailsView.as_view(), login_url='/login/'), name="batch_item_details"),
	url(r'^batch_items/$', login_required(BatchItemsView.as_view(), login_url='/login/'), name="batch_items"),

	url(r'^products/$', login_required(Products.as_view(), login_url='/login/'),name='products'),
	url(r'^add_product/$', login_required(AddProduct.as_view(), login_url='/login/'),name='add_product'),
	url(r'^edit_product/$', login_required(EditProduct.as_view(), login_url='/login/'),name='edit_product'),
	url(r'^delete_product/$', login_required(DeleteProduct.as_view(), login_url='/login/'),name='delete_product'),
	url(r'^add_multiple_product/$', login_required(AddMultipleProducts.as_view(), login_url='/login/'),name='add_multiple_product'),

	url(r'^brands/$', login_required(Brands.as_view(), login_url='/login/'),name='brands'),
	url(r'^add_brand/$', login_required(AddBrand.as_view(), login_url='/login/'),name='add_brand'),
	url(r'^edit_brand/$', login_required(EditBrand.as_view(), login_url='/login/'),name='edit_brand'),
	url(r'^delete_brand/$', login_required(DeleteBrand.as_view(), login_url='/login/'),name='delete_brand'),
	url(r'^add_multiple_brand/$', login_required(AddMultipleBrand.as_view(), login_url='/login/'),name='add_multiple_brand'),

	url(r'^vat/$', login_required(VatList.as_view(), login_url='/login/'),name='vat'),
	url(r'^add_vat/$', login_required(AddVat.as_view(), login_url='/login/'),name='add_vat'),
	url(r'^edit_vat/$', login_required(EditVat.as_view(), login_url='/login/'),name='edit_vat'),
	url(r'^delete_vat/$', login_required(DeleteVat.as_view(), login_url='/login/'),name='delete_vat'),
	url(r'^add_multiple_vat/$', login_required(AddMultipleVat.as_view(), login_url='/login/'),name='add_multiple_vat'),

	url(r'^opening_stock/$', login_required(OpeningStockView.as_view(), login_url='/login/'), name='opening_stock'),
	url(r'^search_item_stock/$', login_required(SearchItemStock.as_view(), login_url='/login/'), name='search_item_stock'),

	url(r'^stock_report/$', login_required(StockReport.as_view(), login_url='/login/'), name='stock_report'),
	url(r'^stock_aging_report/$', login_required(StockAgingReport.as_view(), login_url='/login/'), name='stock_aging_report'),
	url(r'^catergory_wise_stock_report/$', login_required(CategoryWiseStockReport.as_view(), login_url='/login/'), name='catergory_wise_stock_report'),
	url(r'^category_stock_aging_report/$', login_required(CategoryWiseStockAgingReport.as_view(), login_url='/login/'), name='category_stock_aging_report'),
	url(r'^category_purchase_report/$', login_required(CategoryWisePurchaseReport.as_view(), login_url='/login/'), name='category_purchase_report'),
	url(r'^category_vendor_report/$', login_required(CategoryWiseVendorReport.as_view(), login_url='/login/'), name='category_vendor_report'),
	url(r'^category_profit_report/$', login_required(CategoryWiseProfitReport.as_view(), login_url='/login/'), name='category_profit_report'),

)
