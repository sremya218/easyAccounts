from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required

from accounts.views import AddLedger, DeleteLedger, LedgerSubledgerList, LedgerTreeView, BankAccountDetails, \
PaymentsView, ReceiptsView, OtherTransactionView, EditTransactions, OpeningBalance, DayBookView, CashBookView, \
BankBookView

urlpatterns = patterns('',
	url(r'add_ledger/$', login_required(AddLedger.as_view(), login_url='/login/'),name='add_ledger'),
	url(r'delete_ledger/$', login_required(DeleteLedger.as_view(), login_url='/login/'),name='delete_ledger'),
	url(r'subledger_list/(?P<ledger_id>\d+)/$', login_required(LedgerSubledgerList.as_view(), login_url='/login/'), name='subledger_list'),
	url(r'chart_of_accounts/$', login_required(LedgerTreeView.as_view(), login_url='/login/'),name='chart_of_accounts'),
	url(r'bank_accounts/$', login_required(BankAccountDetails.as_view(), login_url='/login/'),name='bank_accounts'),	

	url(r'payments/$', login_required(PaymentsView.as_view(), login_url='/login/'), name='payments'),
	url(r'receipts/$', login_required(ReceiptsView.as_view(), login_url='/login/'), name='receipts'),
	url(r'other_transactions/$', login_required(OtherTransactionView.as_view(), login_url='/login/'), name='other_transactions'),
	url(r'edit_transactions/$', login_required(EditTransactions.as_view(), login_url='/login/'), name='edit_transactions'),

	url(r'opening_balance/$', login_required(OpeningBalance.as_view(), login_url='/login/'), name='opening_balance'),
	url(r'day_book/$', login_required(DayBookView.as_view(), login_url='/login/'), name='day_book'),
	url(r'cash_book/$', login_required(CashBookView.as_view(), login_url='/login/'), name='cash_book'),
	url(r'bank_book/$', login_required(BankBookView.as_view(), login_url='/login/'), name='bank_book'),
)