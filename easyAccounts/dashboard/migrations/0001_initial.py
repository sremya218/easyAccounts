# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'PostDatedCheque'
        db.create_table(u'dashboard_postdatedcheque', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('cheque_date', self.gf('django.db.models.fields.DateField')(null=True, blank=True)),
            ('transaction_ref', self.gf('django.db.models.fields.CharField')(max_length=150, null=True, blank=True)),
            ('narration', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
        ))
        db.send_create_signal(u'dashboard', ['PostDatedCheque'])

    def backwards(self, orm):
        # Deleting model 'PostDatedCheque'
        db.delete_table(u'dashboard_postdatedcheque')

    models = {
        u'dashboard.postdatedcheque': {
            'Meta': {'object_name': 'PostDatedCheque'},
            'cheque_date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'narration': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'transaction_ref': ('django.db.models.fields.CharField', [], {'max_length': '150', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['dashboard']