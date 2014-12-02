from django.conf.urls import patterns, url
from django.contrib.auth.decorators import login_required

from administration.views import (StaffList, AddStaff, CheckStaffUserExists, EditStaff, \
	DeleteStaff, SearchStaff, SetPermissions, CreateBonusPoint, BonusPointList, AddSalesman, \
	DeleteSalesman,Incentives, SalesmenList, DeleteBonusPoints, SetBonusPoint, ViewBonusPoint, \
	ClearBonusPoint, ViewSerialNosettings, SetSerialNo, GetSerialNo, SalesmanSales, SalesmanIncentivesReport,\
	GetStaffPermissions)

urlpatterns = patterns('',
	url(r'^staffs/$', login_required(StaffList.as_view(), login_url="login"), name="staffs"),
	url(r'^add_staff/$', login_required(AddStaff.as_view(), login_url="login"), name="add_staff"),
	url(r'^edit_staff/$', login_required(EditStaff.as_view(), login_url="login"), name="edit_staff"),
	url(r'^check_staff_user_exists/$', login_required(CheckStaffUserExists.as_view()), name='check_staff_user_exists'),
	url(r'^delete_staff/$', login_required(DeleteStaff.as_view(), login_url="login"), name="delete_staff"),
	url(r'^search_staff/$', login_required(SearchStaff.as_view(), login_url="login"), name='search_staff'),
	
	url(r'^salesmen_list/$', login_required(SalesmenList.as_view(), login_url="login"), name="salesmen_list"),
	url(r'^salesman/$', login_required(AddSalesman.as_view(), login_url="login"), name="salesman"),

	url(r'^permissions/$', login_required(SetPermissions.as_view(), login_url="login"), name='permissions'),
	
    url(r'^delete_salesman/$', login_required(DeleteSalesman.as_view(), login_url="login"), name="delete_salesman"),

    url(r'^incentives/$', login_required(Incentives.as_view(), login_url="login"), name='incentives'),
    url(r'^salesman/sales/$', login_required(SalesmanSales.as_view(), login_url="login"), name='salesman_sales'),
     url(r'^salesman_incentive_report/$', login_required(SalesmanIncentivesReport.as_view(), login_url="login"), name='salesman_incentive_report'),

	url(r'^create_bonus_point/$', login_required(CreateBonusPoint.as_view(), login_url="login"), name='create_bonus_point'),
    url(r'^bonus_points/$', login_required(BonusPointList.as_view(), login_url="login"), name='bonus_points'),
    url(r'^delete_bonus_point/$', login_required(DeleteBonusPoints.as_view(), login_url="login"), name='delete_bonus_point'),

    url(r'^set_bonus_point/$', login_required(SetBonusPoint.as_view(), login_url="login"), name='set_bonus_point'),
    url(r'^view_bonus_point/$', login_required(ViewBonusPoint.as_view(), login_url="login"), name='view_bonus_point'),
    url(r'^clear_bonus_point/$', login_required(ClearBonusPoint.as_view(), login_url="login"), name='clear_bonus_point'),

    url(r'^view_serial_no_settings/$', login_required(ViewSerialNosettings.as_view(), login_url="login"), name='view_serial_no_settings'),
    url(r'^set_serial_no/$', login_required(SetSerialNo.as_view(), login_url="login"), name='set_serial_no'),
    url(r'^get_serial_no/$', login_required(GetSerialNo.as_view(), login_url="login"), name='get_serial_no'),
    url(r'^get_staff_permissions/$', login_required(GetStaffPermissions.as_view(), login_url='/login/'), name="get_staff_permissions"),


)