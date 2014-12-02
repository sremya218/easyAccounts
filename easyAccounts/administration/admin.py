from django.contrib import admin

from administration.models import Staff, Salesman, BonusPoint,SerialNoBill, SerialNoInvoice

admin.site.register(Staff)
admin.site.register(Salesman)
admin.site.register(BonusPoint)
admin.site.register(SerialNoBill)
admin.site.register(SerialNoInvoice)


