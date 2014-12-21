# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'LedgerEntry'
        db.create_table(u'accounts_ledgerentry', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('ledger', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['accounts.Ledger'])),
            ('credit_amount', self.gf('django.db.models.fields.DecimalField')(null=True, max_digits=14, decimal_places=2, blank=True)),
            ('debit_amount', self.gf('django.db.models.fields.DecimalField')(null=True, max_digits=14, decimal_places=2, blank=True)),
            ('date', self.gf('django.db.models.fields.DateField')(null=True, blank=True)),
            ('transaction_reference_number', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
        ))
        db.send_create_signal(u'accounts', ['LedgerEntry'])

    def backwards(self, orm):
        # Deleting model 'LedgerEntry'
        db.delete_table(u'accounts_ledgerentry')

    models = {
        u'accounts.ledger': {
            'Meta': {'object_name': 'Ledger'},
            'balance': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['accounts.Ledger']", 'null': 'True', 'blank': 'True'})
        },
        u'accounts.ledgerentry': {
            'Meta': {'object_name': 'LedgerEntry'},
            'credit_amount': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '14', 'decimal_places': '2', 'blank': 'True'}),
            'date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'debit_amount': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '14', 'decimal_places': '2', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'ledger': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['accounts.Ledger']"}),
            'transaction_reference_number': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['accounts']