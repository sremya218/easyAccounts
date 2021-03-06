# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'FreightValue'
        db.create_table(u'purchases_freightvalue', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('freight_value', self.gf('django.db.models.fields.DecimalField')(null=True, max_digits=20, decimal_places=5, blank=True)),
        ))
        db.send_create_signal(u'purchases', ['FreightValue'])

        # Adding model 'PurchaseItem'
        db.create_table(u'purchases_purchaseitem', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('purchase', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['purchases.Purchase'], null=True, blank=True)),
            ('batch_item', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['inventory.BatchItem'], null=True, blank=True)),
            ('quantity', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=5)),
            ('purchase_price', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=5)),
            ('net_amount', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=5)),
            ('uom', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('unit_discount', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=5)),
            ('quantity_in_smallest_unit', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=10)),
            ('tax_included', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('tax', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=5)),
        ))
        db.send_create_signal(u'purchases', ['PurchaseItem'])

        # Adding model 'PurchaseReturnItem'
        db.create_table(u'purchases_purchasereturnitem', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('purchase_return', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['purchases.PurchaseReturn'])),
            ('purchase_item', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['purchases.PurchaseItem'])),
            ('quantity', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=10)),
            ('net_amount', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=10)),
        ))
        db.send_create_signal(u'purchases', ['PurchaseReturnItem'])

        # Adding model 'PurchaseReturn'
        db.create_table(u'purchases_purchasereturn', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('purchase', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['purchases.Purchase'], null=True, blank=True)),
            ('return_invoice_number', self.gf('django.db.models.fields.CharField')(max_length=200, unique=True, null=True, blank=True)),
            ('invoice_date', self.gf('django.db.models.fields.DateField')(null=True, blank=True)),
            ('grant_total', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=2)),
            ('discount', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=2)),
            ('purchase_tax', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=5)),
            ('transaction_reference_no', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
        ))
        db.send_create_signal(u'purchases', ['PurchaseReturn'])

        # Adding model 'Purchase'
        db.create_table(u'purchases_purchase', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('supplier', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['suppliers.Supplier'], null=True, blank=True)),
            ('do_number', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('transaction_reference_no', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('purchase_invoice_number', self.gf('django.db.models.fields.CharField')(max_length=200, unique=True, null=True, blank=True)),
            ('purchase_invoice_date', self.gf('django.db.models.fields.DateField')(null=True, blank=True)),
            ('payment_mode', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('bank_name', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('card_number', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('cheque_date', self.gf('django.db.models.fields.DateField')(null=True, blank=True)),
            ('cheque_number', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('branch', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('card_holder_name', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('discount', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=14, decimal_places=2)),
            ('purchase_tax', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=5)),
            ('grant_total', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=14, decimal_places=2)),
        ))
        db.send_create_signal(u'purchases', ['Purchase'])

    def backwards(self, orm):
        # Deleting model 'FreightValue'
        db.delete_table(u'purchases_freightvalue')

        # Deleting model 'PurchaseItem'
        db.delete_table(u'purchases_purchaseitem')

        # Deleting model 'PurchaseReturnItem'
        db.delete_table(u'purchases_purchasereturnitem')

        # Deleting model 'PurchaseReturn'
        db.delete_table(u'purchases_purchasereturn')

        # Deleting model 'Purchase'
        db.delete_table(u'purchases_purchase')

    models = {
        u'accounts.ledger': {
            'Meta': {'object_name': 'Ledger'},
            'account_code': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'balance': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['accounts.Ledger']", 'null': 'True', 'blank': 'True'})
        },
        u'administration.bonuspoint': {
            'Meta': {'object_name': 'BonusPoint'},
            'bonus_amount': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '15', 'decimal_places': '2', 'blank': 'True'}),
            'bonus_point': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'bonus_type': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'inventory.batch': {
            'Meta': {'object_name': 'Batch'},
            'created_date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'expiry_date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        u'inventory.batchitem': {
            'Meta': {'object_name': 'BatchItem'},
            'batch': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['inventory.Batch']", 'null': 'True', 'blank': 'True'}),
            'cost_price': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '50', 'decimal_places': '5'}),
            'customer_bonus_points': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'Customer Bonus'", 'null': 'True', 'to': u"orm['administration.BonusPoint']"}),
            'customer_bonus_quantity': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '15', 'decimal_places': '2', 'blank': 'True'}),
            'freight_charge': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'item': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['inventory.Item']", 'null': 'True', 'blank': 'True'}),
            'purchase_price': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '50', 'decimal_places': '5'}),
            'quantity_in_purchase_unit': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '50', 'decimal_places': '5'}),
            'quantity_in_smallest_unit': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '50', 'decimal_places': '5'}),
            'retail_price': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'salesman_bonus_points': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'Salesman Bonus'", 'null': 'True', 'to': u"orm['administration.BonusPoint']"}),
            'salesman_bonus_quantity': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '15', 'decimal_places': '2', 'blank': 'True'}),
            'uom': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'uom_conversion': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['inventory.UOMConversion']", 'null': 'True', 'blank': 'True'}),
            'whole_sale_price': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'})
        },
        u'inventory.brand': {
            'Meta': {'object_name': 'Brand'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'unique': 'True', 'null': 'True', 'blank': 'True'})
        },
        u'inventory.category': {
            'Meta': {'object_name': 'Category'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['inventory.Category']", 'null': 'True', 'blank': 'True'})
        },
        u'inventory.item': {
            'Meta': {'object_name': 'Item'},
            'barcode': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'brand': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['inventory.Brand']", 'null': 'True', 'blank': 'True'}),
            'cess': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '14', 'decimal_places': '2'}),
            'code': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '200', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'item_type': ('django.db.models.fields.CharField', [], {'default': "'Stockable'", 'max_length': '50'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'offer_quantity': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '50', 'decimal_places': '5'}),
            'packets_per_box': ('django.db.models.fields.DecimalField', [], {'max_length': '200', 'null': 'True', 'max_digits': '50', 'decimal_places': '5', 'blank': 'True'}),
            'pieces_per_box': ('django.db.models.fields.DecimalField', [], {'max_length': '200', 'null': 'True', 'max_digits': '50', 'decimal_places': '5', 'blank': 'True'}),
            'pieces_per_packet': ('django.db.models.fields.DecimalField', [], {'max_length': '200', 'null': 'True', 'max_digits': '50', 'decimal_places': '5', 'blank': 'True'}),
            'product': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['inventory.Product']", 'null': 'True', 'blank': 'True'}),
            'size': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'smallest_unit': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'unit_per_packet': ('django.db.models.fields.DecimalField', [], {'max_length': '200', 'null': 'True', 'max_digits': '50', 'decimal_places': '5', 'blank': 'True'}),
            'unit_per_piece': ('django.db.models.fields.DecimalField', [], {'max_length': '200', 'null': 'True', 'max_digits': '50', 'decimal_places': '5', 'blank': 'True'}),
            'uom': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'vat_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['inventory.VatType']", 'null': 'True', 'blank': 'True'})
        },
        u'inventory.product': {
            'Meta': {'object_name': 'Product'},
            'category': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['inventory.Category']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        u'inventory.uomconversion': {
            'Meta': {'object_name': 'UOMConversion'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'purchase_unit': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'relation': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '50', 'decimal_places': '5'}),
            'selling_unit': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'status': ('django.db.models.fields.CharField', [], {'default': "'not used'", 'max_length': '15'})
        },
        u'inventory.vattype': {
            'Meta': {'object_name': 'VatType'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'tax_percentage': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '14', 'decimal_places': '2'}),
            'vat_type': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        u'purchases.freightvalue': {
            'Meta': {'object_name': 'FreightValue'},
            'freight_value': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '20', 'decimal_places': '5', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'purchases.purchase': {
            'Meta': {'object_name': 'Purchase'},
            'bank_name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'branch': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'card_holder_name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'card_number': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'cheque_date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'cheque_number': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'discount': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '14', 'decimal_places': '2'}),
            'do_number': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'grant_total': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '14', 'decimal_places': '2'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'payment_mode': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'purchase_invoice_date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'purchase_invoice_number': ('django.db.models.fields.CharField', [], {'max_length': '200', 'unique': 'True', 'null': 'True', 'blank': 'True'}),
            'purchase_tax': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'supplier': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['suppliers.Supplier']", 'null': 'True', 'blank': 'True'}),
            'transaction_reference_no': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        u'purchases.purchaseitem': {
            'Meta': {'object_name': 'PurchaseItem'},
            'batch_item': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['inventory.BatchItem']", 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'net_amount': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'purchase': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['purchases.Purchase']", 'null': 'True', 'blank': 'True'}),
            'purchase_price': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'quantity': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'quantity_in_smallest_unit': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '10'}),
            'tax': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'tax_included': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'unit_discount': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'uom': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        u'purchases.purchasereturn': {
            'Meta': {'object_name': 'PurchaseReturn'},
            'discount': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '2'}),
            'grant_total': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '2'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'invoice_date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'purchase': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['purchases.Purchase']", 'null': 'True', 'blank': 'True'}),
            'purchase_tax': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'return_invoice_number': ('django.db.models.fields.CharField', [], {'max_length': '200', 'unique': 'True', 'null': 'True', 'blank': 'True'}),
            'transaction_reference_no': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        u'purchases.purchasereturnitem': {
            'Meta': {'object_name': 'PurchaseReturnItem'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'net_amount': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '10'}),
            'purchase_item': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['purchases.PurchaseItem']"}),
            'purchase_return': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['purchases.PurchaseReturn']"}),
            'quantity': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '10'})
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

    complete_apps = ['purchases']