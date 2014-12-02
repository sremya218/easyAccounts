from django.contrib import admin

from purchases.models import Purchase, PurchaseItem, PurchaseReturn, PurchaseReturnItem

admin.site.register(Purchase)
admin.site.register(PurchaseItem)
admin.site.register(PurchaseReturn)
admin.site.register(PurchaseReturnItem)