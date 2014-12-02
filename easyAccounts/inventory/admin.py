from django.contrib import admin

from models import Item, Product, Category, Brand, Batch, BatchItem, VatType, OpeningStock, \
OpeningStockItem, StockValue, OpeningStockValue

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(Brand)
admin.site.register(Batch)
admin.site.register(Item)
admin.site.register(BatchItem)
admin.site.register(VatType)
admin.site.register(OpeningStock)
admin.site.register(OpeningStockItem)
admin.site.register(OpeningStockValue)
admin.site.register(StockValue)