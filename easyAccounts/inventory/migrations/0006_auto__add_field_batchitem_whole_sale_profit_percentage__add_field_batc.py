# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'BatchItem.whole_sale_profit_percentage'
        db.add_column(u'inventory_batchitem', 'whole_sale_profit_percentage',
                      self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=5),
                      keep_default=False)

        # Adding field 'BatchItem.retail_profit_percentage'
        db.add_column(u'inventory_batchitem', 'retail_profit_percentage',
                      self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=20, decimal_places=5),
                      keep_default=False)

    def backwards(self, orm):
        # Deleting field 'BatchItem.whole_sale_profit_percentage'
        db.delete_column(u'inventory_batchitem', 'whole_sale_profit_percentage')

        # Deleting field 'BatchItem.retail_profit_percentage'
        db.delete_column(u'inventory_batchitem', 'retail_profit_percentage')

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
            'batch_price': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'cost_price': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '50', 'decimal_places': '5'}),
            'customer_bonus_points': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'Customer Bonus'", 'null': 'True', 'to': u"orm['administration.BonusPoint']"}),
            'customer_bonus_quantity': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '15', 'decimal_places': '2', 'blank': 'True'}),
            'customer_card_price': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            'freight_charge': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '20', 'decimal_places': '5'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'item': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['inventory.Item']", 'null': 'True', 'blank': 'True'}),
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