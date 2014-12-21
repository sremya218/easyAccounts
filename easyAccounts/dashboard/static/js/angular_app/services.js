'use strict';

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
var stock_serv = angular.module('easyAccounts.services', ['ngResource']);

stock_serv.value('version', '0.1');

stock_serv.factory('share', function()
{
    return {
        messages : {
            show : false,
            type : '',
            message : ''
        },
        loader : {
            show : false
        }
    };
});

stock_serv.factory('stock_items', function() {
    
    var itemsService = {};
    itemsService.stock_items = [];
    itemsService.add = function(items) {
        stock_items = items;
    };
    itemsService.list = function() {
        return stock_items;
    };    
    return itemsService;
});