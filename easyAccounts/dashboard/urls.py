from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required
from views import Login, DashBoard, Logout, HelpView, SettingsView, MonthlySalesView, YearWiseSalesView,\
MonthlyStatisticsView, RevenueSplitup, ResetPassword, ForgotPassword, PDCReport

urlpatterns = patterns('',
	url(r'^login/$', Login.as_view(), name="login"),
	url(r'^logout/$', Logout.as_view(), name="logout"),
	url(r'^forgot_password/$', ForgotPassword.as_view(), name="forgot_password"),
	url(r'^reset_password/$', ResetPassword.as_view(), name="reset_password"),
	url(r'^$', login_required(DashBoard.as_view(), login_url='/login/'), name="dashboard"),
	url(r'^help/$', login_required(HelpView.as_view(), login_url='/login/'), name="help"),
	url(r'^settings/$', login_required(SettingsView.as_view(), login_url='/login/'), name="settings"),
	url(r'^monthly_sales/$', login_required(MonthlySalesView.as_view(), login_url='/login/'), name="monthly_sales"),
	url(r'^year_wise_sales/$', login_required(YearWiseSalesView.as_view(), login_url='/login/'), name="year_wise_sales"),
	url(r'^monthly_statistics/$', login_required(MonthlyStatisticsView.as_view(), login_url='/login/'), name="monthly_statistics"),
	url(r'^revenue_splitup/$', login_required(RevenueSplitup.as_view(), login_url='/login/'), name="revenue_splitup"),
	url(r'^pdc_report/$', login_required(PDCReport.as_view(), login_url='/login/'), name="pdc_report"),
)