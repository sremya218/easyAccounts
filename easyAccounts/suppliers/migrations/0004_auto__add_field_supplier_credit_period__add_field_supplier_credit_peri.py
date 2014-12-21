# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Supplier.credit_period'
        db.add_column(u'suppliers_supplier', 'credit_period',
                      self.gf('django.db.models.fields.IntegerField')(null=True, blank=True),
                      keep_default=False)

        # Adding field 'Supplier.credit_period_parameter'
        db.add_column(u'suppliers_supplier', 'credit_period_parameter',
                      self.gf('django.db.models.fields.CharField')(max_length=100, null=True, blank=True),
                      keep_default=False)

    def backwards(self, orm):
        # Deleting field 'Supplier.credit_period'
        db.delete_column(u'suppliers_supplier', 'credit_period')

        # Deleting field 'Supplier.credit_period_parameter'
        db.delete_column(u'suppliers_supplier', 'credit_period_parameter')

    models = {
        u'accounts.ledger': {
            'Meta': {'object_name': 'Ledger'},
            'balance': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['accounts.Ledger']", 'null': 'True', 'blank': 'True'})
        },
        u'suppliers.supplier': {
            'Meta': {'object_name': 'Supplier'},
            'address': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'contact_no': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'credit_period': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'credit_period_parameter': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'ledger': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['accounts.Ledger']", 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'unique': 'True', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['suppliers']