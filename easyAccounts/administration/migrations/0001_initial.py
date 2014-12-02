# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Permission'
        db.create_table(u'administration_permission', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('accounts_permission', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('inventory_permission', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('purchase_permission', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('sales_permission', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('suppliers', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('customers', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal(u'administration', ['Permission'])

        # Adding model 'Staff'
        db.create_table(u'administration_staff', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'], null=True, blank=True)),
            ('designation', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('address', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('contact_no', self.gf('django.db.models.fields.CharField')(max_length=15, null=True)),
            ('permission', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['administration.Permission'], null=True, blank=True)),
        ))
        db.send_create_signal(u'administration', ['Staff'])

        # Adding model 'BonusPoint'
        db.create_table(u'administration_bonuspoint', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('bonus_type', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('bonus_point', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('bonus_amount', self.gf('django.db.models.fields.DecimalField')(null=True, max_digits=15, decimal_places=2, blank=True)),
        ))
        db.send_create_signal(u'administration', ['BonusPoint'])

        # Adding model 'Salesman'
        db.create_table(u'administration_salesman', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('first_name', self.gf('django.db.models.fields.CharField')(max_length=200, null=True)),
            ('last_name', self.gf('django.db.models.fields.CharField')(max_length=200, null=True)),
            ('address', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('contact_no', self.gf('django.db.models.fields.CharField')(max_length=15, null=True)),
            ('email', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('bonus_point', self.gf('django.db.models.fields.DecimalField')(null=True, max_digits=14, decimal_places=2, blank=True)),
        ))
        db.send_create_signal(u'administration', ['Salesman'])

        # Adding model 'SerialNoBill'
        db.create_table(u'administration_serialnobill', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'], null=True, blank=True)),
            ('is_auto_generated', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('prefix', self.gf('django.db.models.fields.CharField')(max_length=200, null=True)),
            ('starting_no', self.gf('django.db.models.fields.DecimalField')(null=True, max_digits=14, decimal_places=2)),
        ))
        db.send_create_signal(u'administration', ['SerialNoBill'])

        # Adding model 'SerialNoInvoice'
        db.create_table(u'administration_serialnoinvoice', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'], null=True, blank=True)),
            ('is_auto_generated', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('prefix', self.gf('django.db.models.fields.CharField')(max_length=200, null=True)),
            ('starting_no', self.gf('django.db.models.fields.DecimalField')(null=True, max_digits=14, decimal_places=2)),
        ))
        db.send_create_signal(u'administration', ['SerialNoInvoice'])

    def backwards(self, orm):
        # Deleting model 'Permission'
        db.delete_table(u'administration_permission')

        # Deleting model 'Staff'
        db.delete_table(u'administration_staff')

        # Deleting model 'BonusPoint'
        db.delete_table(u'administration_bonuspoint')

        # Deleting model 'Salesman'
        db.delete_table(u'administration_salesman')

        # Deleting model 'SerialNoBill'
        db.delete_table(u'administration_serialnobill')

        # Deleting model 'SerialNoInvoice'
        db.delete_table(u'administration_serialnoinvoice')

    models = {
        u'administration.bonuspoint': {
            'Meta': {'object_name': 'BonusPoint'},
            'bonus_amount': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '15', 'decimal_places': '2', 'blank': 'True'}),
            'bonus_point': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'bonus_type': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'administration.permission': {
            'Meta': {'object_name': 'Permission'},
            'accounts_permission': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'customers': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'inventory_permission': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'purchase_permission': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'sales_permission': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'suppliers': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        u'administration.salesman': {
            'Meta': {'object_name': 'Salesman'},
            'address': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'bonus_point': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '14', 'decimal_places': '2', 'blank': 'True'}),
            'contact_no': ('django.db.models.fields.CharField', [], {'max_length': '15', 'null': 'True'}),
            'email': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True'})
        },
        u'administration.serialnobill': {
            'Meta': {'object_name': 'SerialNoBill'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_auto_generated': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'prefix': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True'}),
            'starting_no': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '14', 'decimal_places': '2'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']", 'null': 'True', 'blank': 'True'})
        },
        u'administration.serialnoinvoice': {
            'Meta': {'object_name': 'SerialNoInvoice'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_auto_generated': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'prefix': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True'}),
            'starting_no': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '14', 'decimal_places': '2'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']", 'null': 'True', 'blank': 'True'})
        },
        u'administration.staff': {
            'Meta': {'object_name': 'Staff'},
            'address': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'contact_no': ('django.db.models.fields.CharField', [], {'max_length': '15', 'null': 'True'}),
            'designation': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'permission': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['administration.Permission']", 'null': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']", 'null': 'True', 'blank': 'True'})
        },
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        }
    }

    complete_apps = ['administration']