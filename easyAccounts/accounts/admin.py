from django.contrib import admin

from accounts.models import Ledger, LedgerEntry, Transaction

admin.site.register(Ledger)
admin.site.register(LedgerEntry)
admin.site.register(Transaction)