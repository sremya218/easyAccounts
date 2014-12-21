from django.core.management.base import BaseCommand
import datetime
from django.template.loader import render_to_string
from django.core.mail import send_mail, BadHeaderError, EmailMultiAlternatives
from django.conf import settings

from inventory.models import BatchItem
from dashboard.models import StockQuantityAlert, PostDatedCheque


class Command(BaseCommand):
    help = "Create initial test user and pre-requisite data"

    def handle(self, *args, **options):

        # Stock Quantity Alert
        try:
            batch_items = BatchItem.objects.filter(quantity_in_purchase_unit=0)
            stock_zero_objs = StockQuantityAlert.objects.all()
            for stock_obj in stock_zero_objs:
                batch_items_list = stock_obj.batch_items.all()
                for batch_item in batch_items_list:
                    if batch_item.quantity_in_purchase_unit > 0:
                        stock_obj.batch_items.remove(batch_item)
            try:
                stock_quantity_obj = StockQuantityAlert.objects.latest('id')
            except Exception as Ex:
                stock_quantity_obj = StockQuantityAlert()
            if stock_quantity_obj:
                stock_quantity_obj.save()
                for batch_item in batch_items:
                    stock_quantity_obj.batch_items.add(batch_item)
        except Exception as ex:
            print str(ex), 'except'

        # Post Dated Cheque
        current_date = datetime.datetime.now().date()
        post_dated_cheques = PostDatedCheque.objects.filter(cheque_date=current_date)
        post_dated_cheques_list = []
        for post_dated_cheque in post_dated_cheques:
            post_dated_cheques_list.append({
                'narration': post_dated_cheque.narration,
                'cheque_date': post_dated_cheque.cheque_date,
                'transaction_ref': post_dated_cheque.transaction_ref,
            })
        






