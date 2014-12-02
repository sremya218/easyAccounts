from django.contrib import admin


from sales.models import (Sale, SalesItem, Estimate, EstimateItem, Receipt, Invoice,\
 SalesReturn, SalesReturnItem, EditedReceipt ,EditedInvoice, EditedInvoiceSaleItem, \
 EditedInvoiceSale, DeliveryNote)


admin.site.register(Sale)
admin.site.register(SalesItem)
admin.site.register(Estimate)
admin.site.register(EstimateItem)
admin.site.register(Receipt)
admin.site.register(Invoice)
admin.site.register(SalesReturn)
admin.site.register(SalesReturnItem)
admin.site.register(EditedInvoiceSale)
admin.site.register(EditedInvoiceSaleItem)
admin.site.register(EditedReceipt)
admin.site.register(EditedInvoice)
admin.site.register(DeliveryNote)
