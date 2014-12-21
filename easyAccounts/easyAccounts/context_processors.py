from django.contrib.sites.models import Site
from django.db import models
from datetime import datetime

def date_and_time(request):

	date = datetime.now()

	return{
		'date' : date,
	}