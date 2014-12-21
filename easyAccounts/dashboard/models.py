from django.db import models
from datetime import datetime
from inventory.models import BatchItem

class PostDatedCheque(models.Model):

    cheque_date = models.DateField('Cheque Date', null=True, blank=True)
    transaction_ref = models.CharField('Transaction Reference No', max_length=150, null=True, blank=True)
    narration = models.TextField('Narration', null=True, blank=True)

    def __unicode__(self):

    	return self.transaction_ref

    class Meta:

    	verbose_name_plural = 'Post Dated Cheque'

    def set_attributes(self, type_name, obj):

    	if type_name == 'purchase':
	    	self.cheque_date = obj.cheque_date
	    	self.transaction_ref = obj.transaction_reference_no
	    	self.narration = 'Purchase Invoice No: '+str(obj.purchase_invoice_number)+', Amount : '+ str(obj.grant_total)+', Dated : '+obj.purchase_invoice_date.strftime('%d/%m/%Y')
    	elif type_name == 'purchase_return':
            self.cheque_date = obj.cheque_date
            self.transaction_ref = obj.transaction_reference_no
            self.narration = 'Purchase Return Invoice No: '+str(obj.return_invoice_number)+', Amount : '+ str(obj.grant_total)+', Dated : '+obj.invoice_date.strftime('%d/%m/%Y')
        elif type_name == 'sales':
            self.cheque_date = obj.cheque_date
            self.transaction_ref = obj.transaction_reference_no
            self.narration = 'Sales Invoice No: '+str(obj.sales_invoice_number)+', Amount : '+ str(obj.grant_total)+', Dated : '+obj.sales_invoice_date.strftime('%d/%m/%Y')
        elif type_name == 'sales_return':
            self.cheque_date = obj.cheque_date
            self.transaction_ref = obj.transaction_reference_no
            self.narration = 'Sales Return Invoice No: '+str(obj.return_invoice_number)+', Amount : '+ str(obj.grant_total)+', Dated : '+obj.invoice_date.strftime('%d/%m/%Y')
        elif type_name == 'purchase_payment':
            self.cheque_date = obj.cheque_date
            self.transaction_ref = obj.transaction_ref
        elif type_name == 'sales_receipt':
            self.cheque_date = obj.cheque_date
            self.transaction_ref = obj.transaction_ref
        elif type_name == 'other':
            self.cheque_date = obj.cheque_date
            self.transaction_ref = obj.transaction_ref
        self.save()
    	return self

    def get_json_data(self):

    	post_dated_cheque_data = {
    		'id': self.id,
    		'cheque_date': self.cheque_date.strftime('%d/%m/%Y') if self.cheque_date else '',
    		'transaction_ref': self.transaction_ref,
    		'narration': self.narration,
    	}
    	return self

class StockQuantityAlert(models.Model):

    batch_items = models.ManyToManyField(BatchItem, null=True, blank=True)

    class Meta:
        verbose_name_plural = 'Stock Quantity Alert'