# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Transaction'
        db.create_table(u'accounts_transaction', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('transaction_ref', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('debit_ledger', self.gf('django.db.models.fields.related.ForeignKey')(blank=True, related_name='debit_ledger', null=True, to=orm['accounts.LedgerEntry'])),
            ('credit_ledger', self.gf('django.db.models.fields.related.ForeignKey')(blank=True, related_name='credit_ledger', null=True, to=orm['accounts.LedgerEntry'])),
            ('transaction_date', self.gf('django.db.models.fields.DateField')(null=True, blank=True)),
            ('debit_amount', self.gf('django.db.models.fields.DecimalField')(null=True, max_digits=14, decimal_places=2, blank=True)),
            ('credit_amount', self.gf('django.db.models.fields.DecimalField')(null=True, max_digits=14, decimal_places=2, blank=True)),
            ('narration', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('payment_mode', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('bank_name', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('cheque_date', self.gf('django.db.models.fields.DateField')(null=True, blank=True)),
            ('cheque_number', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('branch', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('card_holder_name', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('card_no', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
        ))
        db.send_create_signal(u'accounts', ['Transaction'])

    def backwards(self, orm):
        # Deleting model 'Transaction'
        db.delete_table(u'accounts_transaction')

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
        },
        u'accounts.transaction': {
            'Meta': {'object_name': 'Transaction'},
            'bank_name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'branch': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'card_holder_name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'card_no': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'cheque_date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'cheque_number': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'credit_amount': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '14', 'decimal_places': '2', 'blank': 'True'}),
            'credit_ledger': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'credit_ledger'", 'null': 'True', 'to': u"orm['accounts.LedgerEntry']"}),
            'debit_amount': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '14', 'decimal_places': '2', 'blank': 'True'}),
            'debit_ledger': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'debit_ledger'", 'null': 'True', 'to': u"orm['accounts.LedgerEntry']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'narration': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'payment_mode': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'transaction_date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'transaction_ref': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['accounts']