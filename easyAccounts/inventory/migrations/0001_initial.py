# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Category'
        db.create_table(u'inventory_category', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('parent', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['inventory.Category'], null=True, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
        ))
        db.send_create_signal(u'inventory', ['Category'])

        # Adding model 'Product'
        db.create_table(u'inventory_product', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('category', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['inventory.Category'])),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
        ))
        db.send_create_signal(u'inventory', ['Product'])

        # Adding model 'Brand'
        db.create_table(u'inventory_brand', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200, unique=True, null=True, blank=True)),
        ))
        db.send_create_signal(u'inventory', ['Brand'])

        # Adding model 'VatType'
        db.create_table(u'inventory_vattype', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('vat_type', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('tax_percentage', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=14, decimal_places=2)),
        ))
        db.send_create_signal(u'inventory', ['VatType'])

        # Adding model 'Item'
        db.create_table(u'inventory_item', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('vat_type', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['inventory.VatType'], null=True, blank=True)),
            ('product', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['inventory.Product'], null=True, blank=True)),
            ('brand', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['inventory.Brand'], null=True, blank=True)),
            ('room_number', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('shelf_number', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('code', self.gf('django.db.models.fields.CharField')(unique=True, max_length=200, blank=True)),
            ('item_type', self.gf('django.db.models.fields.CharField')(default='Stockable', max_length=50)),
            ('cess', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=14, decimal_places=2)),
            ('size', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('barcode', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('description', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('offer_quantity', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=50, decimal_places=5)),
            ('uom', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('packets_per_box', self.gf('django.db.models.fields.DecimalField')(max_length=200, null=True, max_digits=50, decimal_places=5, blank=True)),
            ('pieces_per_box', self.gf('django.db.models.fields.DecimalField')(max_length=200, null=True, max_digits=50, decimal_places=5, blank=True)),
            ('pieces_per_packet', self.gf('django.db.models.fields.DecimalField')(max_length=200, null=True, max_digits=50, decimal_places=5, blank=True)),
            ('unit_per_piece', self.gf('django.db.models.fields.DecimalField')(max_length=200, null=True, max_digits=50, decimal_places=5, blank=True)),
            ('smallest_unit', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('unit_per_packet', self.gf('django.db.models.fields.DecimalField')(max_length=200, null=True, max_digits=50, decimal_places=5, blank=True)),
        ))
        db.send_create_signal(u'inventory', ['Item'])

        # Adding model 'Batch'
        db.create_table(u'inventory_batch', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('created_date', self.gf('django.db.models.fields.DateField')(null=True, blank=True)),
            ('expiry_date', self.gf('django.db.models.fields.DateField')(null=True, blank=True)),
        ))
        db.send_create_signal(u'inventory', ['Batch'])

        # Adding model 'UOMConversion'
        db.create_table(u'inventory_uomconversion', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('purchase_unit', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('selling_unit', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('relation', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=50, decimal_places=5)),
            ('status', self.gf('django.db.models.fields.CharField')(default='not used', max_length=15)),
        ))
        db.send_create_signal(u'inventory', ['UOMConversion'])

        # Adding model 'BatchItem'
        db.create_table(u'inventory_batchitem', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('batch', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['inventory.Batch'], null=True, blank=True)),
            ('item', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['inventory.Item'], null=True, blank=True)),
            ('quantity_in_purchase_unit', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=50, decimal_places=5)),
            ('quantity_in_smallest_unit', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=50, decimal_places=5)),
            ('purchase_price', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=50, decimal_places=5)),
            ('cost_price', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=50, decimal_places=5)),
            ('uom_conversion', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['inventory.UOMConversion'], null=True, blank=True)),
            ('uom', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('whole_sale_profit_percentage', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=5)),
            ('retail_profit_percentage', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=5)),
            ('whole_sale_price', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=5)),
            ('retail_price', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=5)),
            ('branch_price', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=5)),
            ('customer_card_price', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=5)),
            ('freight_charge', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=5)),
            ('permissible_discount_percentage', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=5)),
            ('salesman_bonus_points', self.gf('django.db.models.fields.related.ForeignKey')(blank=True, related_name='Salesman Bonus', null=True, to=orm['administration.BonusPoint'])),
            ('customer_bonus_points', self.gf('django.db.models.fields.related.ForeignKey')(blank=True, related_name='Customer Bonus', null=True, to=orm['administration.BonusPoint'])),
            ('customer_bonus_quantity', self.gf('django.db.models.fields.DecimalField')(null=True, max_digits=15, decimal_places=2, blank=True)),
            ('salesman_bonus_quantity', self.gf('django.db.models.fields.DecimalField')(null=True, max_digits=15, decimal_places=2, blank=True)),
        ))
        db.send_create_signal(u'inventory', ['BatchItem'])

        # Adding model 'OpeningStock'
        db.create_table(u'inventory_openingstock', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('date', self.gf('django.db.models.fields.DateField')(null=True, blank=True)),
            ('transaction_reference_no', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
        ))
        db.send_create_signal(u'inventory', ['OpeningStock'])

        # Adding model 'OpeningStockItem'
        db.create_table(u'inventory_openingstockitem', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('opening_stock', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['inventory.OpeningStock'], null=True, blank=True)),
            ('batch_item', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['inventory.BatchItem'], null=True, blank=True)),
            ('quantity', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=5)),
            ('uom', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('purchase_price', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=5)),
            ('net_amount', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=5)),
        ))
        db.send_create_signal(u'inventory', ['OpeningStockItem'])

        # Adding model 'StockValue'
        db.create_table(u'inventory_stockvalue', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('stock_by_value', self.gf('django.db.models.fields.DecimalField')(null=True, max_digits=20, decimal_places=5, blank=True)),
        ))
        db.send_create_signal(u'inventory', ['StockValue'])

        # Adding model 'OpeningStockValue'
        db.create_table(u'inventory_openingstockvalue', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('stock_by_value', self.gf('django.db.models.fields.DecimalField')(null=True, max_digits=20, decimal_places=5, blank=True)),
        ))
        db.send_create_signal(u'inventory', ['OpeningStockValue'])

    def backwards(self, orm):
        # Deleting model 'Category'
        db.delete_table(u'inventory_category')

        # Deleting model 'Product'
        db.delete_table(u'inventory_product')

        # Deleting model 'Brand'
        db.delete_table(u'inventory_brand')

        # Deleting model 'VatType'
        db.delete_table(u'inventory_vattype')

        # Deleting model 'Item'
        db.delete_table(u'inventory_item')

        # Deleting model 'Batch'
        db.delete_table(u'inventory_batch')

        # Deleting model 'UOMConversion'
        db.delete_table(u'inventory_uomconversion')

        # Deleting model 'BatchItem'
        db.delete_table(u'inventory_batchitem')

        # Deleting model 'OpeningStock'
        db.delete_table(u'inventory_openingstock')

        # Deleting model 'OpeningStockItem'
        db.delete_table(u'inventory_openingstockitem')

        # Deleting model 'StockValue'
        db.delete_table(u'inventory_stockvalue')

        # Deleting model 'OpeningStockValue'
        db.delete_table(u'inventory_openingstockvalue')

    models = {
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
            'branch_price': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'cost_price': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '50', 'decimal_places': '5'}),
            'customer_bonus_points': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'Customer Bonus'", 'null': 'True', 'to': u"orm['administration.BonusPoint']"}),
            'customer_bonus_quantity': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '15', 'decimal_places': '2', 'blank': 'True'}),
            'customer_card_price': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'freight_charge': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'item': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['inventory.Item']", 'null': 'True', 'blank': 'True'}),
            'permissible_discount_percentage': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'purchase_price': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '50', 'decimal_places': '5'}),
            'quantity_in_purchase_unit': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '50', 'decimal_places': '5'}),
            'quantity_in_smallest_unit': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '50', 'decimal_places': '5'}),
            'retail_price': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'retail_profit_percentage': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'salesman_bonus_points': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'Salesman Bonus'", 'null': 'True', 'to': u"orm['administration.BonusPoint']"}),
            'salesman_bonus_quantity': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '15', 'decimal_places': '2', 'blank': 'True'}),
            'uom': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'uom_conversion': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['inventory.UOMConversion']", 'null': 'True', 'blank': 'True'}),
            'whole_sale_price': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'whole_sale_profit_percentage': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'})
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
            'room_number': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'shelf_number': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'size': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'smallest_unit': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'unit_per_packet': ('django.db.models.fields.DecimalField', [], {'max_length': '200', 'null': 'True', 'max_digits': '50', 'decimal_places': '5', 'blank': 'True'}),
            'unit_per_piece': ('django.db.models.fields.DecimalField', [], {'max_length': '200', 'null': 'True', 'max_digits': '50', 'decimal_places': '5', 'blank': 'True'}),
            'uom': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'vat_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['inventory.VatType']", 'null': 'True', 'blank': 'True'})
        },
        u'inventory.openingstock': {
            'Meta': {'object_name': 'OpeningStock'},
            'date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'transaction_reference_no': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        u'inventory.openingstockitem': {
            'Meta': {'object_name': 'OpeningStockItem'},
            'batch_item': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['inventory.BatchItem']", 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'net_amount': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'opening_stock': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['inventory.OpeningStock']", 'null': 'True', 'blank': 'True'}),
            'purchase_price': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'quantity': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'uom': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        u'inventory.openingstockvalue': {
            'Meta': {'object_name': 'OpeningStockValue'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'stock_by_value': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '20', 'decimal_places': '5', 'blank': 'True'})
        },
        u'inventory.product': {
            'Meta': {'object_name': 'Product'},
            'category': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['inventory.Category']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        u'inventory.stockvalue': {
            'Meta': {'object_name': 'StockValue'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'stock_by_value': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '20', 'decimal_places': '5', 'blank': 'True'})
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
        }
    }

    complete_apps = ['inventory']