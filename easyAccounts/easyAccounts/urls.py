
from django.conf.urls import patterns, include, url
from django.conf import settings

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
	url(r'^admin/', include(admin.site.urls)),

	url(r'', include('dashboard.urls')),
  	
    url(r'^site_media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
    url(r'^accounts/', include('accounts.urls')),
    url(r'^suppliers/', include('suppliers.urls')),
    url(r'^administration/', include('administration.urls')),
    url(r'^customers/', include('customers.urls')),
    url(r'^inventory/', include('inventory.urls')),
    url(r'^purchase/', include('purchases.urls')),
    url(r'^sales/', include('sales.urls')),
)
