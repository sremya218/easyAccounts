function get_bank_account_details($scope, $http) {
	$http.get('/accounts/bank_accounts/').success(function(data){
		$scope.bank_accounts = data.bank_accounts;
	}).error(function(data, status) {
		console.log('Request failed' || data);
	});
}
function hide_purchase_popup_divs() {
	$('#payment_details').css('display', 'none');
	$('#new_batch').css('display', 'none');
	$('#add_item').css('display', 'none');
	$('#add_product').css('display', 'none');
	$('#add_brand').css('display', 'none');
	$('#add_supplier').css('display', 'none');
	$('#add_vat').css('display', 'none');
	$('#transaction_reference_no_details').css('display', 'none');
	$('#bank_account_details').css('display', 'none');
	$('#cost_price_calculator').css('display', 'none');
}
function hide_purchase_return_popups(){
	$('#payment_details').css('display', 'none');
	$('#bank_account_details').css('display', 'none');
	$('#transaction_reference_no_details').css('display', 'none');
}
function create_new_bank_acount($scope, $http, from) {
	params = {
		'bank_account': $scope.bank_account_name,
		'csrfmiddlewaretoken': $scope.csrf_token,
	}
	$http({
		method: 'post',
		url: '/accounts/bank_accounts/',
		data: $.param(params),
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	}).success(function(data) {
		if (data.result == 'ok') {
			if (from == 'purchase') {
				$scope.purchase.bank_account_ledger = data.bank_account.id;
				$scope.payment_mode_details($scope.purchase.payment_mode);
				$scope.bank_account_error = '';
			} else if (from == 'sales'){
				$scope.sales.bank_account_ledger = data.bank_account.id;
				$scope.payment_mode_details($scope.sales.payment_mode);
				$scope.bank_account_error = '';
			} else if (from == 'purchase_return') {
				$scope.purchase_return.bank_account_ledger = data.bank_account.id;
				$scope.payment_mode_details($scope.purchase_return.payment_mode);
				$scope.bank_account_error = '';
			} else if (from == 'payments') {
				get_bank_account_details($scope, $http);
				$scope.payment.bank_account = data.bank_account.id;
				$scope.bank_account_error = '';
				hide_popup();
			} else if (from == 'sales_return') {
				$scope.sales_return.bank_account_ledger = data.bank_account.id;
				$scope.payment_mode_details($scope.sales_return.payment_mode);
				$scope.bank_account_error = '';
			} else if (from == 'receipts') {
				get_bank_account_details($scope, $http);
				$scope.receipt.bank_account = data.bank_account.id;
				$scope.bank_account_error = '';
				hide_popup();
			} 
		} else {
			$scope.bank_account_error = data.message;
		}
	}).error(function(data, status){
		console.log('Request failed' || data);
	});
}
function get_batch_items($scope, $http, batch_id, from){
	$http.get('/inventory/batch_items/?batch_id='+batch_id).success(function(data){
		$scope.batch_items = data.batch_items;

	}).error(function(data, status){
		console.log('Request failed');
	})
}
function get_purchase_invoice_items_details($scope, $http, from, invoice){
	$http.get('/purchase/purchase_items_details/?invoice='+invoice).success(function(data){
		$scope.batch_items = data.purchase_items;
		if ($scope.batch_items.length == 0){
			$scope.batch_items = [];
			$scope.no_purchase_invoice_msg = 'No purchase with this Purchase Invoice';
		}
	}).error(function(data, status){
		console.log('Request failed');
	});
}
function is_category_name_exists($scope, $http, category_name, from){
	$http.get('/inventory/is_category_name_exists/?name='+category_name).success(function(data){
		if (data.result == 'error'){
			$scope.no_categories_msg = data.message;
			$scope.category_name_exists = true;
		} else {
			$scope.no_categories_msg = '';
			$scope.category_name_exists = false;
		}
	}).error(function(data, status){
		console.log('Request failed');
	});
}
function PurchaseController($scope, $http){
	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if ($scope.suppliers != undefined && $scope.suppliers.length > 0) {
			if($scope.focusIndex < $scope.suppliers.length-1){
				$scope.focusIndex++; 
			}
		} else if ($scope.current_purchase_item.batches != undefined && $scope.current_purchase_item.batches.length > 0) {
			if($scope.focusIndex < $scope.current_purchase_item.batches.length-1){
				$scope.focusIndex++; 
			}
		} else if ($scope.current_purchase_item.items != undefined && $scope.current_purchase_item.items.length > 0) {
			if($scope.focusIndex < $scope.current_purchase_item.items.length-1){
				$scope.focusIndex++; 
			}
		} else if ($scope.products != undefined && $scope.products.length > 0) {
			if($scope.focusIndex < $scope.products.length-1){
				$scope.focusIndex++; 
			}
		} else if ($scope.brands != undefined && $scope.brands.length > 0) {
			if($scope.focusIndex < $scope.brands.length-1){
				$scope.focusIndex++; 
			}
		} else if ($scope.vat_list != undefined && $scope.vat_list.length > 0) {
			if($scope.focusIndex < $scope.vat_list.length-1){
				$scope.focusIndex++; 
			}
		} else if ($scope.categories != undefined && $scope.categories.length > 0) {
			if($scope.focusIndex < $scope.categories.length-1){
				$scope.focusIndex++; 
			}
		} 
	}});
	$scope.$on('keydown', function( msg, code ) {
	    $scope.keys.forEach(function(o) {
	      if ( o.code !== code ) { return; }
	      o.action();
	      $scope.$apply();
	    });
  	});
  	$scope.select_list_item = function(index) {
		if ($scope.suppliers != undefined && $scope.suppliers.length > 0) {
			supplier = $scope.suppliers[index];
			$scope.select_supplier(supplier);
		} else if ($scope.current_purchase_item != undefined && $scope.current_purchase_item.batches != undefined && $scope.current_purchase_item.batches.length > 0) {
			batch = $scope.current_purchase_item.batches[index];
			$scope.select_batch(batch);
		} else if ($scope.current_purchase_item != undefined && $scope.current_purchase_item.items != undefined && $scope.current_purchase_item.items.length > 0) {
			item = $scope.current_purchase_item.items[index];
			$scope.select_item_details(item);
		} else if ($scope.products != undefined && $scope.products.length > 0) {
			product = $scope.products[index];
			$scope.select_product_details(product);
		} else if ($scope.brands != undefined && $scope.brands.length > 0) {
			brand = $scope.brands[index];
			$scope.select_brand_details(brand);
		} else if ($scope.vat_list != undefined && $scope.vat_list.length > 0) {
			vat = $scope.vat_list[index];
			$scope.select_vat_details(vat);
		} else if ($scope.categories != undefined && $scope.categories.length > 0) {
			category = $scope.categories[index];
			$scope.select_category_details(category);
		}
	}
	$scope.init = function(csrf_token){
		$scope.items_list = [];
		for (var i=0; i<5; i++){
			$scope.items_list.push(
				{
					'id': '',
		            'name': '',
		            'batch': '',
		            'uom': '',
		            'quantity': 1,
		            'purchase_price': 0,
		            'net_amount': 0,
		            'tax_inclusive': false,
		            'tax': '',
		        }	
			)
		}
		$scope.csrf_token = csrf_token;
		$scope.purchase = {
			'invoice_no': '',
			'invoice_date': '',
			'discount': 0,
			'payment_mode': 'cash',
			'supplier': '',
			'bank_name': '',
			'branch': '',
			'cheque_no': '',
			'cheque_date': '',
			'card_no': '',
			'grant_total': 0,
			'do_no': '',
			'items': $scope.items_list,
			'card_holder_name': '',
			'quantity_choosed': '',
			'purchase_tax': 0,
			'bank_account_ledger': '',
			'supplier_tin': '',
			'owner_tin': '',
		}
	}
	$scope.get_tax_inclusive_details = function(item){
		if (item.tax_inclusive == false) {
			item.tax_inclusive = true;
		} else {
			item.tax_inclusive = false;
		}
		$scope.calculate_net_amount(item);
	}	
	$scope.add_bulk_items = function (){
		for (var i=0; i<5; i++){
			$scope.purchase.items.push(
			{
				'id': '',
	            'name': '',
	            'batch': '',
	            'uom': '',
	            'quantity': 1,
	            'purchase_price': 0,
	            'net_amount': 0,
	            'tax_inclusive': false,
	            'tax': '',
	        });
		}
	}
	$scope.search_items = function(item) {
		item.item_search=true;
		item.batch_search = false;
		$scope.current_purchase_item = item;
		$scope.current_purchase_item.id = '';
		$scope.current_purchase_item.items = [];
		get_item_search_list($scope, $http, $scope.current_purchase_item.name, item.batch, 'purchase');
	}
	$scope.select_item_details = function(item) {
		$scope.current_purchase_item.name = item.name;
		$scope.current_purchase_item.id = item.id;
		$scope.current_purchase_item.tax = item.tax;
		$scope.current_purchase_item.items = [];
		if ($scope.current_purchase_item.batch) {
			$scope.select_batch($scope.current_purchase_item.batch);
		}
		hide_popup();
		$scope.current_purchase_item.item_search = false;
		get_item_uoms($scope, $http);
		$scope.focusIndex = 0;
	}
	$scope.search_batch = function(item) {
		item.batch_search = true;
		item.item_search = false;
		$scope.current_purchase_item = item;
		$scope.current_purchase_item.batch = '';
		$scope.batch_name = item.batch_name;
		get_batch_search_details($scope, $http, 'purchase');
	}
	$scope.hide_item = function(item){
		$scope.focusIndex = 0;
		item.batch_search = false;
		if (item.item_search == true){
			item.item_search = false;
		} else {
			item.item_search = true;
		}
	}
	$scope.hide_batch = function(item){
		$scope.focusIndex = 0;
		item.item_search = false;
		if (item.batch_search == true){
			item.batch_search = false;
		} else {
			item.batch_search = true;
		}
	}
	$scope.select_batch = function(batch) {
		$scope.batch_selected = true;
		$scope.current_purchase_item.batch_name = batch.name;
		$scope.current_purchase_item.batch = batch.id;
		if ($scope.current_purchase_item.id) {
			$scope.get_batch($scope.current_purchase_item);
		} 
		$scope.current_purchase_item.batches = [];
		$scope.current_purchase_item.batch_search = false;
		$scope.focusIndex = 0;
	}
	$scope.get_batch = function(item){
		$http.get('/inventory/batch_item_details/?batch_id='+item.batch+'&item_id='+item.id).success(function(data){
        	item.stock = data.stock;
        	item.purchase_unit = data.batch_item.uom;
        	item.purchase_price = data.batch_item.purchase_price;
        	if (item.purchase_unit) {
        		$scope.current_purchase_item.uom_exists = true;
        	} else
        		$scope.current_purchase_item.uom_exists = false;
			item.quantity = 0;
	    }).error(function(data, status) {
	    	console.log('Request failed' || data);
	    });
	}
	$scope.save_quantity = function(item) {
		item.quantity_entered = item.quantity;
		$scope.calculate_net_amount(item);
	}
	$scope.calculate_net_amount = function(item) {
		if (item.purchase_price != Number(item.purchase_price)) {
			item.purchase_price = 0.00;
		} 
		if (item.quantity != Number(item.quantity)) {
			item.quantity = 0.00;
		} 
		if (item.tax_inclusive == false) {
			item.net_amount = item.quantity*item.purchase_price;
		} else {
			tax_percentage = item.tax/100;
			tax_purchase_price = parseFloat(tax_percentage)*parseFloat(item.purchase_price)
			purchase_price = parseFloat(item.purchase_price)+parseFloat(tax_purchase_price);
			item.net_amount = (parseFloat(item.quantity)*parseFloat(purchase_price)).toFixed(2);
			if(item.net_amount != Number(item.net_amount)) {
				item.net_amount = 0;
			}
		}	
		$scope.calculate_total_purchase_amount();
	}
	$scope.calculate_total_purchase_amount = function() {
		var total_amount = 0.00;
		var purchase_tax = 0.00;
		for (var i=0; i< $scope.purchase.items.length; i++) {
			item_tax = 0.00;
			if ($scope.purchase.items[i].purchase_price != Number($scope.purchase.items[i].purchase_price)) {
				$scope.purchase.items[i].purchase_price = 0.00;
			} 
			if ($scope.purchase.items[i].quantity != Number($scope.purchase.items[i].quantity)) {
				$scope.purchase.items[i].quantity = 0.00;
			} 
			if ($scope.purchase.items[i].tax_inclusive == false) {
				$scope.purchase.items[i].net_amount = parseFloat($scope.purchase.items[i].quantity)*parseFloat($scope.purchase.items[i].purchase_price);
				item_tax = 0.00;
			} else {
				tax_percentage = $scope.purchase.items[i].tax/100;
				tax_purchase_price = parseFloat(tax_percentage)*parseFloat($scope.purchase.items[i].purchase_price);
				purchase_price = parseFloat($scope.purchase.items[i].purchase_price)+parseFloat(tax_purchase_price);
				$scope.purchase.items[i].net_amount = (parseFloat($scope.purchase.items[i].quantity)*parseFloat(purchase_price)).toFixed(2);
				if ($scope.purchase.items[i].net_amount != Number($scope.purchase.items[i].net_amount)){
					$scope.purchase.items[i].net_amount = 0;
				}
				item_tax = (parseFloat($scope.purchase.items[i].quantity)*parseFloat(tax_purchase_price)).toFixed(2);
			}
			total_amount = parseFloat(total_amount)+parseFloat($scope.purchase.items[i].net_amount);
			purchase_tax = parseFloat(purchase_tax)+parseFloat(item_tax);
			// $scope.calculate_total_grant_discount(total_amount, purchase_tax);
		}
		if (($scope.purchase.discount != Number($scope.purchase.discount)) || $scope.purchase.discount.length == 0)
			$scope.purchase.discount = 0.00;
		$scope.purchase.grant_total = parseFloat(total_amount) - parseFloat($scope.purchase.discount);
		$scope.purchase.purchase_tax = purchase_tax;
	}
	$scope.add_new_purchase_item = function() {
		$scope.purchase.items.push(
		{
			'id': '',
            'name': '',
            'batch': '',
            'uom': '',
            'quantity': '',
            'purchase_price': 0,
            'net_amount': '',
            'tax_inclusive': false,
            'tax': '',
        });
	}
	$scope.search_supplier = function() {
		$scope.select_supplier_flag = true;
		$scope.purchase.supplier = '';
		search_supplier($scope, $http);
	}
	$scope.select_supplier = function(supplier) {
		$scope.purchase.supplier = supplier.id;
		$scope.suppliers = [];
		$scope.supplier_name = supplier.name;
		$scope.select_supplier_flag = false;
		$scope.focusIndex = 0;
	}
	$scope.remove_purchase_item = function(item) {
		var index = $scope.purchase.items.indexOf(item);
		$scope.purchase.items.splice(index, 1);
	}
	$scope.get_saved_purchase_details = function() {
		$scope.no_draft_purchase = '';
		if ($scope.draft_invoice_no.length > 0) {
			$http.get('/purchases/draft_purchase/?invoice_no='+$scope.draft_invoice_no).success(function(data){
				if (data.result == 'ok') {
					$scope.purchase = data.purchase;
					$scope.supplier_name = $scope.purchase.supplier_name;
				} else 
					$scope.no_draft_purchase = data.message;
			}).error(function(data, status){
				console.log('Request failed' || data);
			});
		}
	}
	$scope.payment_mode_details = function(payment_mode) {
		$scope.bank_name = '';
		$scope.branch = '';
		$scope.cheque_no = '';
		$scope.card_no = '';
		$scope.card_holder_name = '';
		hide_purchase_popup_divs();
		$('#payment_details').css('display', 'block');
		create_popup();
		if (payment_mode == 'cheque') {
			$scope.is_cheque_payment = true;
		} else if (payment_mode == 'card') {
			$scope.is_cheque_payment = false;
		} else {
			hide_purchase_popup_divs();
		}
	}
	$scope.bank_account_details = function(payment_mode) {

		get_bank_account_details($scope, $http);
		$scope.purchase.payment_mode = payment_mode;
		hide_purchase_popup_divs();
		$('#bank_account_details').css('display', 'block');
		$scope.other_bank_account = false;
		$scope.bank_account_error = '';
		$scope.bank_account = '';
		$scope.bank_account_name = '';
		if ($scope.purchase.payment_mode == 'cheque') {
			$scope.is_cheque = true;
		} else {
			$scope.is_cheque = false;
		}
		create_popup();

	}
	$scope.create_new_bank_acount = function() {
		if ($scope.bank_account_name == '' || $scope.bank_account_name == undefined) {
			$scope.bank_account_error = 'Please enter the Bank account name';
		} else {
			create_new_bank_acount($scope, $http, 'purchase');
		}
	}
	$scope.add_bank_account_details = function() {
		if ($scope.bank_account) {
			$scope.purchase.bank_account_ledger = $scope.bank_account;
			$scope.payment_mode_details($scope.purchase.payment_mode);
		} else {
			$scope.bank_account_error = 'Please choose the Bank account';
		}
	}
	$scope.hide_popup_payment_details = function() {
		$scope.purchase.bank_name = $scope.bank_name;
		$scope.purchase.branch = $scope.branch;
		$scope.purchase.cheque_no = $scope.cheque_no;
		$scope.purchase.card_no = $scope.card_no;
		$scope.purchase.card_holder_name = $scope.card_holder_name;
		hide_popup();
	}
	$scope.hide_popup = function() {
		hide_popup();
	}
	$scope.save_purchase = function() {
		$scope.purchase.invoice_date = $('#invoice_date').val();
		$scope.purchase.cheque_date = $('#cheque_date').val();

		if ($scope.validate_purchase()) {
			for(var i=0; i < $scope.purchase.items.length; i++) {
				if ($scope.purchase.items[i].batch_search == false) {
					$scope.purchase.items[i].batch_search = "false";
				} else {
					$scope.purchase.items[i].batch_search = "true";
				}
				if ($scope.purchase.items[i].item_search == false) {
					$scope.purchase.items[i].item_search = "false";
				} else {
					$scope.purchase.items[i].item_search = "true";
				}
				if ($scope.purchase.items[i].uom_exists == false) {
					$scope.purchase.items[i].uom_exists = "false";
				} else {
					$scope.purchase.items[i].uom_exists = "true";
				}
				if ($scope.purchase.items[i].tax_inclusive == false) {
					$scope.purchase.items[i].tax_inclusive = "false";
				} else {
					$scope.purchase.items[i].tax_inclusive = "true";
				}
			}
			params = {
				'purchase_details': angular.toJson($scope.purchase),
				'csrfmiddlewaretoken': $scope.csrf_token,
			}
			show_loader();
			$http({
				method: 'post',
				url: '/purchase/entry/',
				data: $.param(params),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).success(function(data){
				hide_loader();
				if (data.result == 'ok') {
					hide_purchase_popup_divs()
					$scope.transaction_reference_no = data.transaction_reference_no;
					$scope.transaction_name = ' Purchase ';
					$('#transaction_reference_no_details').css('display', 'block');
					create_popup();
				} else {
					$scope.validate_purchase_msg = data.message;
					for(var i=0; i < $scope.purchase.items.length; i++) {
						if ($scope.purchase.items[i].batch_search == "false") {
							$scope.purchase.items[i].batch_search = false;
						} else {
							$scope.purchase.items[i].batch_search = true;
						}
						if ($scope.purchase.items[i].item_search == "false") {
							$scope.purchase.items[i].item_search = false;
						} else {
							$scope.purchase.items[i].item_search = true;
						}
						if ($scope.purchase.items[i].uom_exists == "false") {
							$scope.purchase.items[i].uom_exists = false;
						} else {
							$scope.purchase.items[i].uom_exists = true;
						}
					}
				}
			}).error(function(data, status){
				console.log('Request failed' || data);
			});	
		}
	}
	$scope.validate_purchase = function() {
		if ($scope.purchase.invoice_no == '' || $scope.purchase.invoice_no == undefined) {
			$scope.validate_purchase_msg = 'Please enter Invoice Number';
			return false;
		} else if ($scope.purchase.invoice_date == '') {
			$scope.validate_purchase_msg = 'Please choose Invoice Date';
			return false;
		} else if ($scope.purchase.supplier == '' || $scope.purchase.supplier == undefined) {
			$scope.validate_purchase_msg = 'Please choose Supplier';
			return false;
		} /*else if ($scope.purchase.supplier_tin == '') {
			$scope.validate_purchase_msg = 'Please enter Supplier Tin Number';
			return false;
		} else if ($scope.purchase.owner_tin == '') {
			$scope.validate_purchase_msg = 'Please enter Tin Number';
			return false;
		}*/ else if ($scope.purchase.payment_mode == '' || $scope.purchase.payment_mode == undefined) { 
			$scope.validate_purchase_msg = 'Please choose Payment Mode';
			return false;
		} else if (($scope.purchase.payment_mode == 'cheque' || $scope.purchase.payment_mode == 'card') && ($scope.purchase.bank_account_ledger == '' || $scope.purchase.bank_account_ledger == undefined)) {
			$scope.validate_purchase_msg = 'Please choose Bank Account Details';
			$scope.bank_account_details($scope.purchase.payment_mode);
			return false;
		} else if (($scope.purchase.payment_mode == 'card' || $scope.purchase.payment_mode == 'cheque' ) && ($scope.purchase.bank_name == '' || $scope.purchase.bank_name == undefined)) {
			$scope.validate_purchase_msg = 'Please enter bank name';
			$scope.payment_mode_details($scope.purchase.payment_mode);
			return false;
		} else if (($scope.purchase.payment_mode == 'card') && ($scope.purchase.card_no == '' || $scope.purchase.card_no == undefined)) {
			$scope.validate_purchase_msg = 'Please enter Card No';
			$scope.payment_mode_details($scope.purchase.payment_mode);
			return false;
		} else if (($scope.purchase.payment_mode == 'card') && ($scope.purchase.card_holder_name == '' || $scope.purchase.card_holder_name == undefined)) {
			$scope.validate_purchase_msg = 'Please enter Card Holder Name';
			$scope.payment_mode_details($scope.purchase.payment_mode);
			return false;
		} else if (($scope.purchase.payment_mode == 'cheque') && ($scope.purchase.branch == '' || $scope.purchase.branch == undefined)) {
			$scope.validate_purchase_msg = 'Please enter Branch';
			$scope.payment_mode_details($scope.purchase.payment_mode);
			return false;
		} else if (($scope.purchase.payment_mode == 'cheque') && $scope.purchase.cheque_date == '') {
			$scope.validate_purchase_msg = 'Please choose Cheque Date';
			$scope.payment_mode_details($scope.purchase.payment_mode);
			return false;
		} else if (($scope.purchase.payment_mode == 'cheque') && ($scope.purchase.cheque_no == '' || $scope.purchase.cheque_no == undefined)) {
			$scope.validate_purchase_msg = 'Please enter Cheque Number';
			$scope.payment_mode_details($scope.purchase.payment_mode);
			return false;
		} else if ($scope.purchase.items.length == 0) {
			$scope.validate_purchase_msg = 'Please choose Items';
			return false;
		} else if ($scope.purchase.discount != Number($scope.purchase.discount)) {
			$scope.validate_purchase_msg = 'Please enter valid Discount';
			return false;
		} else if ($scope.purchase.items.length > 0) {
			for (var i =0; i<$scope.purchase.items.length; i++) {
				if ($scope.purchase.items[i].id == '') {
					$scope.validate_purchase_msg = 'Please choose item in row '+ (i+1);
					return false;
				} else if ($scope.purchase.items[i].batch == '') {
					$scope.validate_purchase_msg = 'Please choose batch in row '+ (i+1);
					return false;
				} else if ($scope.purchase.items[i].purchase_unit == '') {
					$scope.validate_purchase_msg = 'Please enter purchase unit in row '+ (i+1);
					return false;
				} else if ($scope.purchase.items[i].quantity == '' || $scope.purchase.items[i].quantity <= 0) {
					$scope.validate_purchase_msg = 'Please enter quantity in row '+ (i+1);
					return false;
				} else if (($scope.purchase.items[i].purchase_price == '' || $scope.purchase.items[i].purchase_price == undefined) && $scope.purchase.items[i].purchase_price !=0 ) {
					$scope.validate_purchase_msg = 'Please enter unit purchase price in row '+ (i+1);
					return false;
				} 
			}
		} return true;
	} 
	$scope.add_new_item = function(item) {
		$scope.current_purchase_item = item;
		$scope.product_name = '';
		$scope.brand_name = '';
		$scope.vat_type = '';
		$scope.piece_per_packet = '';
	    $scope.unit_per_piece = '';
	    $scope.unit_per_box = '';
	    $scope.per_box = false;
		$scope.per_packet = false;
	    $scope.per_piece = false;
		$scope.item = {
			'id': '',
			'name': '',
			'vat': '',
			'product': '',
			'brand': '',
			'description': '',
			'cess': '',
			'size':'',
			'barcode': '',
			'vat_type': '',
			'offer_quantity': '',
			'uom': '',
	        'piece_per_packet': '',
	        'unit_per_box': '',
	        'unit_per_piece': '',
	        'smallest_unit': '',
	        'packets_per_box_1': '',
	        'pieces_per_box_1': '',
	        'pieces_per_packet_1': '',
	        'unit_per_piece_1': '',
	        'unit_per_packet_1': '',
	        'new_item': 'true',
		}
		hide_purchase_popup_divs();
		$scope.no_product_msg = '';
        $scope.no_brand_msg = '';
        $scope.no_vat_msg = '';
        $scope.validate_item_error_msg = '';
		get_conversions($scope, $http);
		$('#add_item').css('display', 'block');
		create_popup();
	}
	$scope.save_item = function() {
		if($scope.piece_per_packet == '' && $scope.unit_per_piece == '' && $scope.unit_per_box == ''){
            $scope.item.smallest_unit = $scope.item.uom;
        } else if($scope.piece_per_packet == '' && $scope.unit_per_piece == ''){
            $scope.item.smallest_unit = $scope.unit_per_box;
        } else if($scope.unit_per_piece == '' && $scope.piece_per_packet != ''){
            $scope.item.smallest_unit = $scope.piece_per_packet;   
        } else
            $scope.item.smallest_unit = $scope.unit_per_piece;   
        $scope.item.unit_per_piece_1 = $scope.item.unit_per_piece;
        if($scope.item.uom == 'box' && $scope.unit_per_box == 'packet')
            $scope.item.packets_per_box_1 = $scope.item.unit_per_box;
        if($scope.item.uom == 'box' && $scope.unit_per_box == 'piece')
            $scope.item.pieces_per_box_1 = $scope.item.unit_per_box;
        if($scope.item.uom == 'packet' && $scope.unit_per_box == 'piece')
            $scope.item.pieces_per_packet_1 = $scope.item.unit_per_box;
        if($scope.piece_per_packet == 'piece')
            $scope.item.pieces_per_packet_1 = $scope.item.piece_per_packet;
        else
            $scope.item.unit_per_packet_1 = $scope.item.piece_per_packet;
        if($scope.item.uom == 'packet' && $scope.unit_per_box != 'piece')
            $scope.item.unit_per_packet_1 = $scope.item.unit_per_box;
        if($scope.item.uom == 'piece')
            $scope.item.unit_per_piece_1 = $scope.item.unit_per_box;
		save_item($scope, $http, 'purchase');
	}
	$scope.show_per_box = function(item){
        item.unit_per_box = '';
        item.piece_per_packet = '';
        $scope.piece_per_packet = '';
        item.unit_per_piece = '';
        $scope.unit_per_piece = '';
        $scope.unit_per_box = '';
        if(item.uom == 'box' || item.uom == 'packet' || item.uom =='piece'){
            if(item.uom == 'piece'){
                index = $scope.uom_boxes.indexOf('packet');
                $scope.uom_boxes.splice(index,1);
                index = $scope.uom_boxes.indexOf('box');
                $scope.uom_boxes.splice(index,1);
            }
            $scope.per_box = true;
            $scope.per_packet = false;
            $scope.per_piece = false;
        } else{
            $scope.per_packet = false;
            $scope.per_piece = false;
            $scope.per_box = false;
        }
    }
    $scope.show_per_packet = function(item){
        item.piece_per_packet = '';
        $scope.piece_per_packet = '';
        item.unit_per_piece = '';
        $scope.unit_per_piece = '';      
        if($scope.unit_per_box == 'packet'){
            $scope.per_packet = true;
            $scope.per_piece = false;
        }
        else if($scope.unit_per_box == 'piece'){
        	index = $scope.uom_pieces.indexOf('packet');
            $scope.uom_pieces.splice(index,1);
            index = $scope.uom_pieces.indexOf('box');
            $scope.uom_pieces.splice(index,1);
            $scope.per_piece = true;
            $scope.per_packet = false;
        } else{
            $scope.per_packet = false;
            $scope.per_piece = false;
        }
    }
    $scope.show_per_piece = function(item){
        if($scope.piece_per_packet == 'piece'){
            $scope.per_piece = true;
        } else{
            $scope.per_piece = false;
        }
    }
    $scope.get_products = function() {
    	$scope.item.product = '';
        if($scope.product_name){
		  	get_product_search_list($scope, $http);
        }
	}
	$scope.select_product_details = function(product) {
		$scope.item.product = product.id;
		$scope.product_name = product.name + '-' + product.category_name;
		$scope.products = [];
		$scope.focusIndex = 0;
	}
	$scope.get_brands = function() {
		$scope.item.brand = '';
		get_brand_search_list($scope, $http);
	}
	$scope.select_brand_details = function(brand) {
		$scope.item.brand = brand.id;
		$scope.brand_name = brand.name;
		$scope.brands = [];
		$scope.focusIndex = 0;
	}
	$scope.get_vat_list = function() {
		get_vat_search_details($scope, $http);
	}
	$scope.select_vat_details = function(vat) {
		$scope.item.vat = vat.id;
		$scope.vat_type = vat.vat_name;
		$scope.vat_list = [];
		$scope.focusIndex = 0;
	}
	$scope.new_batch = function(item) {
		$scope.batch = {
			'id': '',
			'name': '',
			'created_date':'',
			'expiry_date': '',
		}
		$scope.current_purchase_item = item;
		hide_purchase_popup_divs();
		$('#new_batch').css('display', 'block');
		create_popup();
	}
	$scope.save_batch = function() {
		save_batch($scope, $http, 'purchase');

	}
	$scope.hide_popup_transaction_details = function() {
		hide_popup();
		document.location.href = '/purchase/entry/';
	}
	$scope.new_supplier = function(purchase) {
		$scope.error_supplier = '';
		$scope.current_purchase = purchase;
		$scope.supplier = {
			'name': '',
			'address': '',
			'contact': '',
			'email': '',
			'credit_period': '',
			'credit_period_parameter': '',
		}
	    hide_purchase_popup_divs();
	    $('#add_supplier').css('display', 'block');
	    create_popup();
	}
	$scope.save_supplier = function() {
		save_supplier($scope, $http, 'purchase');
	}
	$scope.new_product = function(){
		$scope.new_inventory_item = $scope.item;
		$scope.product = {
            'name': '',
            'category_id': '',
            'id': '',
        }
        hide_purchase_popup_divs();
        $('#add_product').css('display', 'block');
        create_popup();
	}
	$scope.get_category_list = function() {
		if ($scope.category_name.length>0)
        	search_category($scope, $http, $scope.category_name);
    }
    $scope.select_category_details = function(category){
    	$scope.product.category_id = category.id;
        $scope.category_name = category.name;
        $scope.categories = [];
        $scope.focusIndex = 0;
    }
    $scope.save_product = function(){

    	save_product($scope, $http, 'item_add');
    }
    $scope.new_brand = function(){
    	$scope.new_inventory_item = $scope.item;
    	hide_purchase_popup_divs();
    	$scope.brand = {
	        'name': '',
	    }
    	$('#add_brand').css('display', 'block');
    	create_popup();
    }
    $scope.hide_popups = function(){
    	hide_purchase_popup_divs();
    	$('#add_item').css('display', 'block');
        create_popup();
    }
    $scope.save_brand = function(){
    	save_brand($scope, $http, 'item_add');
    }
    $scope.new_vat = function(){
    	$scope.new_inventory_item = $scope.item;
    	hide_purchase_popup_divs();
    	$scope.vat={
            'id': '',
            'name': '',
            'percentage':0,
        }
    	$('#add_vat').css('display', 'block');
    	create_popup();
    }
    $scope.save_vat = function() {
        save_vat($scope, $http, 'item_add');
    }
    $scope.new_category = function() {
    	$scope.is_new_category = true;
    	$scope.no_categories_msg = '';
    	$scope.categories = [];
    }
    $scope.is_category_name_exists = function(){
    	is_category_name_exists($scope, $http, $scope.product.new_category_name, 'item_add');
    }
    $scope.search_category = function(){
    	$scope.no_categories_msg = '';
    	$scope.is_new_category = false;
    }
}

function PriceSettingController($scope, $http){
	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if ($scope.suppliers != undefined && $scope.suppliers.length > 0) {
			if($scope.focusIndex < $scope.suppliers.length-1){
				$scope.focusIndex++; 
			}
		} else if ($scope.batches != undefined && $scope.batches.length > 0) {
			if($scope.focusIndex < $scope.batches.length-1){
				$scope.focusIndex++; 
			}
		} else if ($scope.items != undefined && $scope.items.length > 0) {
			if($scope.focusIndex < $scope.items.length-1){
				$scope.focusIndex++; 
			}
		} 
	}});
	$scope.$on('keydown', function( msg, code ) {
	    $scope.keys.forEach(function(o) {
	      if ( o.code !== code ) { return; }
	      o.action();
	      $scope.$apply();
	    });
  	});
  	$scope.select_list_item = function(index) {
		if ($scope.suppliers != undefined && $scope.suppliers.length > 0) {
			supplier = $scope.suppliers[index];
			$scope.select_supplier(supplier);
		} else if ($scope.batches != undefined && $scope.batches.length > 0) {
			batch = $scope.batches[index];
			$scope.select_batch(batch);
		} else if ($scope.items != undefined && $scope.items.length > 0) {
			item = $scope.items[index];
			$scope.select_batch_item(item);
		} 
	}

	$scope.price_settings = {
		'batch': '',
		'items': [],
		'is_purchase_price_settings': 'false',
	}
	$scope.init = function(csrf_token){
		$scope.csrf_token = csrf_token;
		$scope.is_purchase_invoice = true;
		$scope.is_batch_items = false;
		$scope.price_setting_type = 'batch_item';
	}
	$scope.get_batch_details = function(){
		$scope.price_settings.batch = '';
		$scope.price_settings.is_purchase_price_settings = 'false';
		$scope.batch_items = [];
		$scope.items_name = '';
		$scope.batches = [];
		$scope.no_batch_msg = '';
		$scope.no_batch_item_msg = '';
		if ($scope.batch_name.length > 0)
			get_batch_search_details($scope, $http, 'price_settings');

	}
	$scope.select_batch = function(batch){
		$scope.price_settings.batch = batch.id;
		$scope.batches = [];
		$scope.batch_name = batch.name;
		$scope.focusIndex = 0;
		get_batch_items($scope, $http, $scope.price_settings.batch, 'price_settings')
	}
	$scope.get_batch_item_list = function(){
		$scope.price_settings.is_purchase_price_settings = 'false';
		if ($scope.price_settings.batch == '' || $scope.price_settings.batch == undefined){
			$scope.no_batch_item_msg = 'Please choose batch'
		} else {
			if ($scope.items_name.length > 0) {
				get_item_search_list($scope, $http, $scope.items_name, $scope.price_settings.batch, '');
			} else {
				get_batch_items($scope, $http, $scope.price_settings.batch, 'price_settings');
				$scope.items = [];
			}	
		}
	}
	$scope.select_batch_item = function(item){
		$scope.batch_items = [];
		$scope.items_name = item.name;
		$scope.batch_items.push(item);
		$scope.items = [];
		$scope.focusIndex = 0;
	}
	$scope.change_price_setting_type = function(price_setting_type){
		if (price_setting_type == 'purchase'){
			$scope.is_batch_items = true;
			$scope.is_purchase_invoice = false;
			$scope.batch_items = [];
			$scope.no_batch_msg = '';
			$scope.no_batch_item_msg = '';
			$scope.batch_name = '';
			$scope.items_name = '';
		} else if (price_setting_type == 'batch_item'){
			$scope.is_purchase_invoice = true;
			$scope.is_batch_items = false;
			$scope.no_purchase_invoice_msg = '';
			$scope.validate_price_settings_error_msg = '';
			$scope.purchase_invoice = '';
			$scope.batch_items = [];
		}
	}
	$scope.calculate_price_profit = function(item){
		if (item.wholesale_profit != Number(item.wholesale_profit)){
			item.wholesale_profit = 0;
		}
		if (item.retail_profit != Number(item.retail_profit)){
			item.retail_profit = 0;
		}
		cost_price = item.cost_price;
		if (item.wholesale_profit > 0)
			item.wholesale_price = (parseFloat(cost_price)+(parseFloat(cost_price)*(parseFloat(item.wholesale_profit)/100))).toFixed(2);
		else
			item.wholesale_price = 0
		if (item.retail_profit > 0)
			item.retail_price = (parseFloat(cost_price)+(parseFloat(cost_price)*(parseFloat(item.retail_profit)/100))).toFixed(2);
		else 
			item.retail_price = 0
	}
	$scope.get_purchase_invoice_details = function(){
		$scope.price_settings.is_purchase_price_settings = 'true';
		if ($scope.purchase_invoice.length > 0){
			get_purchase_invoice_items_details($scope, $http, 'price_settings', $scope.purchase_invoice);
		}
	}
	$scope.calculate_cost_price = function(item){
		$scope.choosed_item = item;
		hide_purchase_popup_divs();
		$('#cost_price_calculator').css('display', 'block');
		create_popup();
	}
	$scope.validate_price_settings = function(){
		if (($scope.price_settings.batch == '' || $scope.price_settings.batch == undefined) && ($scope.batch_items == undefined)) {
			$scope.validate_price_settings_error_msg = 'Please choose batch items or enter purchase invoice';
			return false;
		} else if ($scope.batch_items != undefined && $scope.batch_items.length == 0){
			$scope.validate_price_settings_error_msg = 'Please choose items';
			return false;
		} else if ($scope.batch_items.length > 0){
			for(var i=0; i<$scope.batch_items.length; i++){
				if ($scope.batch_items[i].cost_price == '' || $scope.batch_items[i].cost_price == undefined){
					$scope.validate_price_settings_error_msg = 'Please enter cost price in row '+(i+1);
					return false;
				} else if ($scope.batch_items[i].cost_price != Number($scope.batch_items[i].cost_price)){
					$scope.validate_price_settings_error_msg = 'Please enter valid cost price in row '+(i+1);
					return false;
				} else if ($scope.batch_items[i].wholesale_profit == '' || $scope.batch_items[i].wholesale_profit == undefined){
					$scope.validate_price_settings_error_msg = 'Please enter whole sale profit in row '+(i+1);
					return false;
				} else if ($scope.batch_items[i].wholesale_profit != Number($scope.batch_items[i].wholesale_profit)){
					$scope.validate_price_settings_error_msg = 'Please enter valid whole sale profit in row '+(i+1);
					return false;
				} else if ($scope.batch_items[i].wholesale_profit > 100){
					$scope.validate_price_settings_error_msg = 'Please enter valid whole sale profit in row '+(i+1);
					return false;
				} else if ($scope.batch_items[i].retail_profit == '' || $scope.batch_items[i].retail_profit == undefined){
					$scope.validate_price_settings_error_msg = 'Please enter retail profit in row '+(i+1);
					return false;
				} else if ($scope.batch_items[i].retail_profit != Number($scope.batch_items[i].retail_profit)){
					$scope.validate_price_settings_error_msg = 'Please enter valid retail profit in row '+(i+1);
					return false;
				} else if ($scope.batch_items[i].retail_profit > 100){
					$scope.validate_price_settings_error_msg = 'Please enter valid retail profit in row '+(i+1);
					return false;
				} else if ($scope.batch_items[i].branch_price == '' || $scope.batch_items[i].branch_price == undefined){
					$scope.validate_price_settings_error_msg = 'Please enter branch price in row '+(i+1);
					return false;
				} else if ($scope.batch_items[i].branch_price != Number($scope.batch_items[i].branch_price)){
					$scope.validate_price_settings_error_msg = 'Please enter valid branch price in row '+(i+1);
					return false;
				} else if ($scope.batch_items[i].customer_card_price == '' || $scope.batch_items[i].customer_card_price == undefined){
					$scope.validate_price_settings_error_msg = 'Please enter customer card price in row '+(i+1);
					return false;
				} else if ($scope.batch_items[i].customer_card_price != Number($scope.batch_items[i].customer_card_price)){
					$scope.validate_price_settings_error_msg = 'Please enter valid customer card price in row '+(i+1);
					return false;
				} else if (($scope.batch_items[i].permissible_discount != 0)&&($scope.batch_items[i].permissible_discount == '' || $scope.batch_items[i].permissible_discount == undefined)){
					$scope.validate_price_settings_error_msg = 'Please enter permissible discount in row '+(i+1);
					return false;
				} else if (($scope.batch_items[i].permissible_discount != 0) && ($scope.batch_items[i].permissible_discount != Number($scope.batch_items[i].permissible_discount))){
					$scope.validate_price_settings_error_msg = 'Please enter valid permissible discount in row '+(i+1);
					return false;
				}
			}
		} return true;
	}
	$scope.save_price_settings = function(){
		$scope.price_settings.items = $scope.batch_items;

		if ($scope.validate_price_settings()){
			for (var i=0; i<$scope.price_settings.items.length; i++){
				if ($scope.price_settings.items[i].tax_inclusive == true)
					$scope.price_settings.items[i].tax_inclusive = 'true';
				else
					$scope.price_settings.items[i].tax_inclusive = 'false';
			}
			params = {
				'csrfmiddlewaretoken': $scope.csrf_token,
				'price_settings': angular.toJson($scope.price_settings),
			}
			$http({
				method: 'post',
				url: '/purchase/price_settings/',
				data: $.param(params),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).success(function(data){
				document.location.href = '/purchase/price_settings/';
			}).error(function(data, status){
				console.log('Request failed');
			});
		}
	}
	$scope.calculate_unit_transportation_charge = function() {
		$scope.unit_transportation_charge = 0
		if ($scope.choosed_item.quantity_in_purchase_unit != Number($scope.choosed_item.quantity_in_purchase_unit)) {
			$scope.choosed_item.quantity_in_purchase_unit = 0;
		}
		if ($scope.total_transportation_charge != Number($scope.total_transportation_charge)) {
			$scope.total_transportation_charge = 0;
		}
		if ($scope.choosed_item.quantity_in_purchase_unit == 0) {
			$scope.unit_transportation_charge = 0
		} else {
			$scope.unit_transportation_charge =  parseFloat($scope.total_transportation_charge)/parseFloat($scope.choosed_item.quantity_in_purchase_unit);
		}
		$scope.calculate_costprice();
	}
	$scope.calculate_unit_handling_charge = function() {
		if ($scope.choosed_item.quantity_in_purchase_unit != Number($scope.choosed_item.quantity_in_purchase_unit)) {
			$scope.choosed_item.quantity_in_purchase_unit = 0;
		}
		if ($scope.total_handling_charge != Number($scope.total_handling_charge)) {
			$scope.total_handling_charge = 0;
		}
		if ($scope.choosed_item.quantity_in_purchase_unit == 0) {
			$scope.unit_handling_charge = 0
		} else {
			$scope.unit_handling_charge =  parseFloat($scope.total_handling_charge)/parseFloat($scope.choosed_item.quantity_in_purchase_unit);
		}
		$scope.calculate_costprice();
	}
	$scope.calculate_unit_expense_charge = function() {
		if ($scope.choosed_item.quantity_in_purchase_unit != Number($scope.choosed_item.quantity_in_purchase_unit)) {
			$scope.choosed_item.quantity_in_purchase_unit = 0;
		}
		if ($scope.total_expense_charge != Number($scope.total_expense_charge)) {
			$scope.total_expense_charge = 0;
		}
		if ($scope.choosed_item.quantity_in_purchase_unit == 0) {
			$scope.unit_expense_charge = 0
		} else {
			$scope.unit_expense_charge =  parseFloat($scope.total_expense_charge)/parseFloat($scope.choosed_item.quantity_in_purchase_unit);
		}
		$scope.calculate_costprice();
	}
	$scope.calculate_costprice = function() {
		if ($scope.unit_expense_charge != Number($scope.unit_expense_charge) || $scope.unit_expense_charge == 0) {
			$scope.unit_expense_charge = 0;
		}
		if ($scope.unit_handling_charge != Number($scope.unit_handling_charge) || $scope.unit_handling_charge.length == 0) {
			$scope.unit_handling_charge = 0;
		}
		if ($scope.unit_transportation_charge != Number($scope.unit_transportation_charge) || $scope.unit_transportation_charge.length == 0) {
			$scope.unit_transportation_charge = 0;
		}
		var cost_price = (parseFloat($scope.unit_transportation_charge) + parseFloat($scope.unit_handling_charge) + parseFloat($scope.unit_expense_charge) + parseFloat($scope.choosed_item.purchase_price)).toFixed(2);
		if (cost_price == Number(cost_price)) {
			$scope.cost_price = cost_price;
		} else {
			$scope.cost_price = 0;
		}
	}
	$scope.close_cost_price_calculator = function() {
		if ($scope.cost_price != Number($scope.cost_price) || $scope.cost_price == undefined || $scope.cost_price.length == 0) {
			$scope.cost_price = 0.00
		}
		if ($scope.cost_price != 0)
			$scope.choosed_item.cost_price = $scope.cost_price;
		else
			$scope.choosed_item.cost_price = $scope.choosed_item.purchase_price;
		$scope.unit_handling_charge = '';
		$scope.total_handling_charge = '';
		$scope.unit_expense_charge = '';
		$scope.total_expense_charge = '';
		$scope.unit_transportation_charge = '';
		$scope.total_transportation_charge = '';
		$scope.cost_price = '';
		hide_popup();
	}
	
}

function ViewPurchaseController($scope, $http){
	$scope.init = function(csrf_token){
		$scope.csrf_token = csrf_token;
	}
	$scope.get_purchase_details = function(){
		$scope.purchase = {};
		if ($scope.invoice_no.length >0) {
			$http.get('/purchase/purchase_details/?invoice='+$scope.invoice_no).success(function(data){
				$scope.purchase = data.purchase;
				$scope.no_purchase_error = '';
				if (data.message.length > 0){
					$scope.no_purchase_error = 'No Purchase with this Purchase Invoice';
				}
			}).error(function(data, status){
				console.log('Request failed');
			});
		}
	}
	$scope.show_payment_details = function(){
		if ($scope.purchase.payment_mode == 'cheque') {
			$scope.is_cheque = true;
		} else {
			$scope.is_cheque = false;
		}
		create_popup();
		$scope.bank_name = $scope.purchase.bank_name;
		$scope.cheque_date = $scope.purchase.cheque_date;
		$scope.cheque_number = $scope.purchase.cheque_number;
		$scope.branch = $scope.purchase.branch;
		$scope.card_number = $scope.purchase.card_number;
		$scope.card_holder_name = $scope.purchase.card_holder_name;
	}
	$scope.hide_popup = function(){
		hide_popup();
	}
}

function PurchaseReturnController($scope, $http){
	$scope.purchase_return_items = [];
	$scope.purchase_return = {
		'purchase_id': '',
		'purchase_invoice': '',
		'return_invoice': '',
		'return_invoice_date': '',
		'grant_total': 0,
		'payment_mode': 'cash',
		'purchase_tax': 0,
		'bank_account_ledger': '',
		'bank_name': '',
		'branch': '',
		'cheque_no': '',
		'card_no': '',
		'card_holder_name': '',
		'supplier': '',
		'items': [{
			'id': '',
			'name': '',
			'code': '',
			'purchased_quantity': 0,
			'quantity': 0,
			'returned_qty': 0,
			'purchase_price':0,
			'purchase_unit': '',
			'net_amount': 0,
			'stock': 0,
		}],
	}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
  	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if($scope.focusIndex < $scope.current_purchase_return_item.items.length-1){
			$scope.focusIndex++; 
		}
	}});
	$scope.$on('keydown', function( msg, code ) {
	    $scope.keys.forEach(function(o) {
	      if ( o.code !== code ) { return; }
	      o.action();
	      $scope.$apply();
	    });
  	});
  	$scope.select_list_item = function(index) {
  		if ($scope.current_purchase_return_item != undefined) {
			purchase_item = $scope.current_purchase_return_item.items[index];
			if (purchase_item != undefined)
				$scope.select_purchase_item(purchase_item);
		}
	}
	$scope.get_purchase_details = function() {
		$scope.no_purchase_message = '';
		$scope.purchase_return = {
			'purchase_id': '',
			'purchase_invoice': '',
			'return_invoice': '',
			'return_invoice_date': '',
			'grant_total': 0,
			'purchase_tax': 0,
			'supplier': '',
			'payment_mode': 'cash',
			'bank_account_ledger': '',
			'bank_name': '',
			'branch': '',
			'cheque_no': '',
			'card_no': '',
			'card_holder_name': '',
			'cheque_date': '',
		}
		$scope.selected_item = {
			'id': '',
			'name':'',
			'code': '',
			'purchased_quantity': 0,
			'quantity': 0,
			'returned_qty':0,
			'batch_name':'',
			'stock': 0,
			'purchase_unit':'',
			'purchase_price': 0,
			'items':[],
		}
		$scope.purchase_return.items = [];
		$scope.purchase_return.items.push($scope.selected_item);
		$scope.current_purchase_return_item = $scope.selected_item;
		if ($scope.purchase_invoice != undefined && $scope.purchase_invoice.length > 0) {
			show_loader();
			$http.get('/purchase/return/?purchase_invoice_no='+$scope.purchase_invoice).success(function(data){
				hide_loader();				
				if (data.result == 'ok') {
					if (data.purchase_deatails.length == 0) {
						$scope.no_purchase_message = 'No such Purchase';
						$scope.purchase_return.supplier = '';
					} else {
						$scope.purchase_return.supplier = data.purchase_deatails[0].supplier;
						$scope.purchase_return.purchase_id = data.purchase_deatails[0].id;
						$scope.purchase_return.purchase_invoice = data.purchase_deatails[0].purchase_invoice;
					}

				}
			}).error(function(data, status) {
				console.log('Request failed' || data);
			});
		}
	}
	$scope.load_all_items = function() {
		if ($scope.purchase_return.purchase_invoice == '' || $scope.purchase_return.purchase_invoice == undefined) {
			$scope.no_purchase_message = 'Please enter the Purchase Invoice Number';
		} else {
			show_loader();
			$http.get('/purchase/purchase_items_details/?purchase_id='+$scope.purchase_invoice+'&all_items=true').success(function(data){
				$scope.purchase_return.items = [];
				for (var i=0; i<data.purchase_items.length; i++) {
					$scope.selected_item = {
						'id': data.purchase_items[i].id,
						'name':data.purchase_items[i].item_name,
						'purchased_quantity': data.purchase_items[i].purchased_quantity,
						'quantity': 0,
						'returned_qty':data.purchase_items[i].returned_qty,
						'batch_name':data.purchase_items[i].batch_name,
						'stock': data.purchase_items[i].stock,
						'purchase_unit':data.purchase_items[i].purchase_unit,
						'purchase_price': data.purchase_items[i].purchase_price,
						'tax_inclusive': data.purchase_items[i].tax_inclusive,
						'tax': data.purchase_items[i].tax,
						'items':[],
					}
					$scope.purchase_return.items.push($scope.selected_item);
				}
				hide_loader();
			}).error(function(data, status) {
				console.log('Request failed' || data);
			});
		}
	}
	$scope.get_purchase_item_details = function(item) {
		$scope.no_purchase_message = '';
		item.id = '';
		item.code = '';
		item.batch_name = ''
		item.purchased_quantity = 0;
		item.quantity = 0;
		item.returned_qty = 0;
		item.purchase_price = 0;
		item.purchase_unit = '';
		item.net_amount = 0;
		item.stock = 0;
		if ($scope.purchase_return.purchase_invoice == '' || $scope.purchase_return.purchase_invoice == undefined) {
			$scope.no_purchase_message = 'Please enter the Purchase Invoice Number';
			item.name = '';
		} else {
			$scope.current_purchase_return_item  = item;
			show_loader();
			$scope.no_item_error_message = '';
			$http.get('/purchase/purchase_items_details/?purchase_id='+$scope.purchase_invoice+'&item_name='+item.name).success(function(data){
				item.items = data.purchase_items;
				if (data.purchase_items.length == 0){
					$scope.no_item_error_message = 'No such item';
				}
				hide_loader();
			}).error(function(data, status) {
				console.log('Request failed' || data);
			});
		}
	}
	$scope.select_purchase_item = function(purchase_item) {
		$scope.item_selected_msg = '';
		for (var i=0; i<$scope.purchase_return.items.length; i++) {
			if ($scope.purchase_return.items[i].id == purchase_item.id) {
				$scope.item_selected_msg = 'Item is already selected';
				$scope.current_purchase_return_item.items = [];
				$scope.current_purchase_return_item.name = '';
				$scope.current_purchase_return_item.id = '';
				$scope.current_purchase_return_item.purchased_quantity = 0;
				$scope.current_purchase_return_item.quantity = 0;
				$scope.current_purchase_return_item.returned_qty = 0;
				$scope.current_purchase_return_item.purchase_price = 0;
				$scope.current_purchase_return_item.purchase_unit = '';
				$scope.current_purchase_return_item.net_amount = 0;
				$scope.current_purchase_return_item.stock = 0;
				$scope.current_purchase_return_item.tax = '';
				$scope.current_purchase_return_item.tax_inclusive = false;
			} 
		}
		if ($scope.item_selected_msg.length == 0) {
			$scope.current_purchase_return_item.id = purchase_item.id;
			$scope.current_purchase_return_item.name = purchase_item.item_name;
			$scope.current_purchase_return_item.purchased_quantity = purchase_item.purchased_quantity;
			$scope.current_purchase_return_item.quantity = 0;
			$scope.current_purchase_return_item.tax = purchase_item.tax;
			$scope.current_purchase_return_item.tax_inclusive = purchase_item.tax_inclusive;
			$scope.current_purchase_return_item.returned_qty = purchase_item.returned_qty;
			$scope.current_purchase_return_item.batch_name = purchase_item.batch_name;
			$scope.current_purchase_return_item.stock = purchase_item.stock;
			$scope.current_purchase_return_item.purchase_unit = purchase_item.purchase_unit;
			$scope.current_purchase_return_item.purchase_price = purchase_item.purchase_price;
			$scope.current_purchase_return_item.items = [];
		}
	}
	$scope.remove_purchase_return_item = function(item) {
		var index = $scope.purchase_return.items.indexOf(item);
		$scope.purchase_return.items.splice(index, 1);
	}
	$scope.add_new_purchase_return_item = function() {
		$scope.purchase_return.items.push(
		{
			'id': '',
            'name': '',
            'code': '',
            'batch': '',
            'stock': 0,
            'purchase_unit': '',
            'quantity': 0,
            'purchase_price': 0,
            'net_amount': 0,
            'items': [],
			'purchased_quantity': 0,
			'returned_qty': 0,
        });
	}
	
	$scope.validate_purchase_return = function() {
		if ($scope.purchase_return.purchase_invoice == '' || $scope.purchase_return.purchase_invoice == undefined) {
			$scope.validate_purchase_return_msg = 'Please enter the Purchase Invoice No';
			return false;
		} else if ($scope.purchase_return.return_invoice == '' || $scope.purchase_return.return_invoice == undefined) {
			$scope.validate_purchase_return_msg = 'Please enter the Return Invoice No';
			return false;
		} else if ($scope.purchase_return.return_invoice_date == '' || $scope.purchase_return.return_invoice_date == undefined) {
			$scope.validate_purchase_return_msg = 'Please choose the Return Invoice Date';
			return false;
		} else if ($scope.purchase_return.return_invoice_date == '' || $scope.purchase_return.return_invoice_date == undefined) {
			$scope.validate_purchase_return_msg = 'Please choose the Return Invoice Date';
			return false;
		} else if (($scope.purchase_return.payment_mode == 'cheque' || $scope.purchase_return.payment_mode == 'card') && ($scope.purchase_return.bank_account_ledger == '' || $scope.purchase_return.bank_account_ledger == undefined)) {
			$scope.validate_purchase_return_msg = 'Please choose Bank Account Details';
			$scope.bank_account_details($scope.purchase_return.payment_mode);
			return false;
		} else if (($scope.purchase_return.payment_mode == 'card' || $scope.purchase_return.payment_mode == 'cheque' ) && ($scope.purchase_return.bank_name == '' || $scope.purchase_return.bank_name == undefined)) {
			$scope.validate_purchase_return_msg = 'Please enter bank name';
			$scope.payment_mode_details($scope.purchase_return.payment_mode);
			return false;
		} else if (($scope.purchase_return.payment_mode == 'card') && ($scope.purchase_return.card_no == '' || $scope.purchase_return.card_no == undefined)) {
			$scope.validate_purchase_return_msg = 'Please enter Card No';
			$scope.payment_mode_details($scope.purchase_return.payment_mode);
			return false;
		} else if (($scope.purchase_return.payment_mode == 'card') && ($scope.purchase_return.card_holder_name == '' || $scope.purchase_return.card_holder_name == undefined)) {
			$scope.validate_purchase_return_msg = 'Please enter Card Holder Name';
			$scope.payment_mode_details($scope.purchase_return.payment_mode);
			return false;
		} else if (($scope.purchase_return.payment_mode == 'cheque') && ($scope.purchase_return.branch == '' || $scope.purchase_return.branch == undefined)) {
			$scope.validate_purchase_return_msg = 'Please enter Branch';
			$scope.payment_mode_details($scope.purchase_return.payment_mode);
			return false;
		} else if (($scope.purchase_return.payment_mode == 'cheque') && $scope.purchase_return.cheque_date == '') {
			$scope.validate_purchase_return_msg = 'Please choose Cheque Date';
			$scope.payment_mode_details($scope.purchase_return.payment_mode);
			return false;
		} else if (($scope.purchase_return.payment_mode == 'cheque') && ($scope.purchase_return.cheque_no == '' || $scope.purchase_return.cheque_no == undefined)) {
			$scope.validate_purchase_return_msg = 'Please enter Cheque Number';
			$scope.payment_mode_details($scope.purchase_return.payment_mode);
			return false;
		} else if ($scope.purchase_return.items.length == 0) {
			$scope.validate_purchase_return_msg = 'Please add items';
			return false;
		} else if ($scope.purchase_return.items.length > 0) {
			for (var i=0; i<$scope.purchase_return.items.length; i++) {
				purchase_remaining_quantity = parseFloat($scope.purchase_return.items[i].purchased_quantity) - (parseFloat($scope.purchase_return.items[i].quantity) + parseFloat($scope.purchase_return.items[i].returned_qty));
				stock_remaining_quantity = parseFloat($scope.purchase_return.items[i].stock) - parseFloat($scope.purchase_return.items[i].quantity);
				if ($scope.purchase_return.items[i].name == '' || $scope.purchase_return.items[i].name == undefined) {
					$scope.validate_purchase_return_msg = 'Please enter the item name ';
					return false;
				} else if ($scope.purchase_return.items[i].quantity == '' || $scope.purchase_return.items[i].quantity == undefined) {
					$scope.validate_purchase_return_msg = 'Please enter the Quantity for the item '+$scope.purchase_return.items[i].name;
					return false;
				} else if ($scope.purchase_return.items[i].quantity == 0) {
					$scope.validate_purchase_return_msg = 'Please enter the Quantity for the item '+$scope.purchase_return.items[i].name;
					return false;
				} else if (purchase_remaining_quantity < 0) {
					$scope.validate_purchase_return_msg = 'Please quantity exceeds Purchased quantity for the item '+$scope.purchase_return.items[i].name;
					return false;
				} else if (stock_remaining_quantity < 0) {
					$scope.validate_purchase_return_msg = 'Please quantity exceeds Stock for the item '+$scope.purchase_return.items[i].name;
					return false;
				} 
			}
		} return true;
	}
	$scope.save_purchase_return = function() {
		$scope.purchase_return.return_invoice_date = $('#invoice_date').val();
		$scope.purchase_return.cheque_date = $('#cheque_date').val();
		if ($scope.validate_purchase_return()) {
			show_loader();
			for (var i=0; i<$scope.purchase_return.items.length; i++){
				if ($scope.purchase_return.items[i].tax_inclusive == true){
					$scope.purchase_return.items[i].tax_inclusive = 'true';
				} else {
					$scope.purchase_return.items[i].tax_inclusive = 'false';
				}
			}
			params = {
				'purchase_return_details': angular.toJson($scope.purchase_return),
				'csrfmiddlewaretoken': $scope.csrf_token,
			}
			$http({
				method: 'post',
				url: '/purchase/return/',
				data: $.param(params),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).success(function(data){
				hide_loader();
				if (data.result == 'ok') {
					$scope.transaction_reference_no = data.transaction_reference_no;
					$scope.transaction_name = ' Purchase Return';
					hide_purchase_return_popups();
					$('#transaction_reference_no_details').css('display', 'block');
					create_popup();
				} else {
					$scope.validate_purchase_return_msg = data.message;
				}
				
			}).error(function(data, status){
				console.log('Request failed' || data);
			});
		}
	}
	$scope.hide_popup = function(){
		hide_popup();
	}
	$scope.hide_popup_transaction_details = function() {
		hide_popup();
		document.location.href = '/purchase/return/';
	}
	$scope.calculate_net_amount = function(item) {
		$scope.choosed_item = item;
		if (item.quantity != Number(item.quantity)) {
			item.quantity = 0;
		}
		if (item.tax_inclusive == true) {
			tax_percentage = item.tax/100;
			tax_purchase_price = parseFloat(tax_percentage)*parseFloat(item.purchase_price);
			purchase_price = parseFloat(item.purchase_price)+parseFloat(tax_purchase_price);
			item.net_amount = (parseFloat(item.quantity)*parseFloat(purchase_price)).toFixed(2);
			if (item.net_amount != Number(item.net_amount)){
				item.net_amount = 0;
			}
			item_tax = (parseFloat(item.quantity)*parseFloat(tax_purchase_price)).toFixed(2);
		} else {
			item.net_amount = item.quantity*item.purchase_price;
		}
		
		$scope.calculate_grant_total();

	}
	$scope.calculate_grant_total = function() {
		grant_total = 0;
		total_tax = 0;
		for (var i=0; i<$scope.purchase_return.items.length; i++) {
			if ($scope.purchase_return.items[i].net_amount == Number($scope.purchase_return.items[i].net_amount))
				grant_total = parseFloat(grant_total)+parseFloat($scope.purchase_return.items[i].net_amount);
			if ($scope.purchase_return.items[i].tax_inclusive == true) {
				tax_percentage = $scope.purchase_return.items[i].tax/100;
				tax_purchase_price = parseFloat(tax_percentage)*parseFloat($scope.purchase_return.items[i].purchase_price);
				purchase_price = parseFloat($scope.purchase_return.items[i].purchase_price)+parseFloat(tax_purchase_price);
				$scope.purchase_return.items[i].net_amount = (parseFloat($scope.purchase_return.items[i].quantity)*parseFloat(purchase_price)).toFixed(2);
				if ($scope.purchase_return.items[i].net_amount != Number($scope.purchase_return.items[i].net_amount)){
					$scope.purchase_return.items[i].net_amount = 0;
				}
				item_tax = (parseFloat($scope.purchase_return.items[i].quantity)*parseFloat(tax_purchase_price)).toFixed(2);
				total_tax = parseFloat(total_tax) + parseFloat(item_tax);
				item_tax = 0;
			} 
		}
		$scope.purchase_return.grant_total = grant_total;
		$scope.purchase_return.purchase_tax = total_tax;
	}
	$scope.bank_account_details = function(payment_mode) {
		get_bank_account_details($scope, $http);
		$scope.purchase_return.payment_mode = payment_mode;
		hide_purchase_return_popups();
		$('#bank_account_details').css('display', 'block');
		$scope.other_bank_account = false;
		$scope.bank_account_error = '';
		$scope.bank_account = '';
		$scope.bank_account_name = '';
		if ($scope.purchase_return.payment_mode == 'cheque') {
			$scope.is_cheque = true;
		} else {
			$scope.is_cheque = false;
		}
		create_popup();
	}
	$scope.create_new_bank_acount = function() {
		if ($scope.bank_account_name == '' || $scope.bank_account_name == undefined) {
			$scope.bank_account_error = 'Please enter the Bank account name';
		} else {
			create_new_bank_acount($scope, $http, 'purchase_return');
		}
	}
	$scope.add_bank_account_details = function() {
		if ($scope.bank_account) {
			$scope.purchase_return.bank_account_ledger = $scope.bank_account;
			$scope.payment_mode_details($scope.purchase_return.payment_mode);
		} else {
			$scope.bank_account_error = 'Please choose the Bank account';
		}
	}
	$scope.hide_popup_payment_details = function() {
		$scope.purchase_return.bank_name = $scope.bank_name;
		$scope.purchase_return.branch = $scope.branch;
		$scope.purchase_return.cheque_no = $scope.cheque_no;
		$scope.purchase_return.card_no = $scope.card_no;
		$scope.purchase_return.card_holder_name = $scope.card_holder_name;
		hide_popup();
	}
	$scope.payment_mode_details = function(payment_mode) {
		$scope.bank_name = '';
		$scope.branch = '';
		$scope.cheque_no = '';
		$scope.cheque_date = '';
		$scope.card_no = '';
		$scope.card_holder_name = '';
		hide_purchase_return_popups();
		$('#payment_details').css('display', 'block');
		create_popup();
		if (payment_mode == 'cheque') {
			$scope.is_cheque_payment = true;
		} else if (payment_mode == 'card') {
			$scope.is_cheque_payment = false;
		} else {
			hide_purchase_return_popups();
		}
	}
}

function PurchaseReturnViewController($scope, $http) {
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.get_purchase_return_details = function() {
		$http.get('/purchase/purchase_return_view/?invoice_no='+$scope.purchase_return_invoice).success(function(data) {
			$scope.purchase_error_message = '';
			if (data.result == 'ok') {
				$scope.purchase_return = data.purchase_return;
			} else {
				$scope.purchase_error_message = data.message;
				$scope.purchase_return = data.purchase_return;
			}
		}).error(function(data, status){
			console.log('Request failed' || data);
		});
	}
	$scope.show_payment_details = function() {
		if ($scope.purchase_return.payment_mode == 'cheque') {
			$scope.is_cheque = true;
		} else {
			$scope.is_cheque = false;
		}
		create_popup();
		$scope.bank_name = $scope.purchase_return.bank_name;
		$scope.cheque_date = $scope.purchase_return.cheque_date;
		$scope.cheque_number = $scope.purchase_return.cheque_number;
		$scope.branch = $scope.purchase_return.branch;
		$scope.card_number = $scope.purchase_return.card_number;
		$scope.card_holder_name = $scope.purchase_return.card_holder_name;
	}
	$scope.hide_popup = function() {
		hide_popup();
		$scope.bank_name = '';
		$scope.cheque_date = '';
		$scope.cheque_number = '';
		$scope.branch = '';
		$scope.card_number = '';
		$scope.card_holder_name = '';
	}
}
function PurchaseReportController($scope, $http) {
	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if ($scope.suppliers != undefined && $scope.suppliers.length > 0) {
			if($scope.focusIndex < $scope.suppliers.length-1){
				$scope.focusIndex++; 
			}
		} 
	}});
	$scope.$on('keydown', function( msg, code ) {
	    $scope.keys.forEach(function(o) {
	      if ( o.code !== code ) { return; }
	      o.action();
	      $scope.$apply();
	    });
  	});
  	$scope.select_list_item = function(index) {
		if ($scope.suppliers != undefined && $scope.suppliers.length > 0) {
			supplier = $scope.suppliers[index];
			$scope.select_supplier(supplier);
		} 
	}
	$scope.select_supplier = function(supplier) {
		$scope.supplier = supplier.id;
		$scope.suppliers = [];
		$scope.supplier_name = supplier.name;
		$scope.focusIndex = 0;
	}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.get_supplier_details = function(){
		$scope.supplier = '';
		if ($scope.supplier_name.length > 0)
			search_supplier($scope, $http);
	}
	$scope.generate_report = function(type) {
		$scope.report_mesg = '';
		var start_date = $('#start_date').val();
		var end_date = $('#end_date').val();
		if (start_date == '' || start_date == undefined) {
			$scope.report_mesg = 'Please Choose start date';
		} else if (end_date == '' || end_date == undefined) {
			$scope.report_mesg = 'Please Choose end date';
		} else {
			if (type == 'view') { 
				show_loader();
				$http.get('/purchase/purchase_report/?start_date='+start_date+'&end_date='+end_date).success(function(data){
					$scope.purchases = data.purchase_details;
					if ($scope.purchases.length == 0)
						$scope.report_mesg = 'No Purchases';
					else {
						paginate($scope.purchases, $scope, 15);
					}
					hide_loader();
				}).error(function(data, status){
					console.log(data);
				});
			} else
				document.location.href = '/purchase/purchase_report/?start_date='+start_date+'&end_date='+end_date;
		}
	}
	$scope.generate_supplier_report = function(type_name){
		$scope.report_mesg = '';
		if ($scope.supplier == '' || $scope.supplier == undefined) {
			$scope.report_mesg = 'Please Choose supplier';
		} else {
			if (type_name == 'view') { 
				show_loader();
				$http.get('/purchase/purchase_report_supplier_wise/?supplier_id='+$scope.supplier).success(function(data){
					$scope.purchases = data.purchase_details;
					if ($scope.purchases.length == 0)
						$scope.report_mesg = 'No Purchases';
					else {
						paginate($scope.purchases, $scope, 15);
					}
					hide_loader();
				}).error(function(data, status){
					console.log(data);
				});
			} else
				document.location.href = '/purchase/purchase_report_supplier_wise/?supplier_id='+$scope.supplier;
		}
	}
	$scope.select_page = function(page){
        select_page(page, $scope.purchases, $scope, 15);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
}
function PurchaseReturnReportController($scope, $http) {

	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if ($scope.suppliers != undefined && $scope.suppliers.length > 0) {
			if($scope.focusIndex < $scope.suppliers.length-1){
				$scope.focusIndex++; 
			}
		} 
	}});
	$scope.$on('keydown', function( msg, code ) {
	    $scope.keys.forEach(function(o) {
	      if ( o.code !== code ) { return; }
	      o.action();
	      $scope.$apply();
	    });
  	});
  	$scope.select_list_item = function(index) {
		if ($scope.suppliers != undefined && $scope.suppliers.length > 0) {
			supplier = $scope.suppliers[index];
			$scope.select_supplier(supplier);
		} 
	}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.select_supplier = function(supplier) {
		$scope.supplier = supplier.id;
		$scope.suppliers = [];
		$scope.supplier_name = supplier.name;
		$scope.focusIndex = 0;
	}
	$scope.get_supplier_details = function(){
		$scope.supplier = '';
		$scope.purchase_returns = [];
		if ($scope.supplier_name.length > 0)
			search_supplier($scope, $http);
	}
	$scope.generate_report = function(type) {
		var start_date = $('#start_date').val();
		var end_date = $('#end_date').val();
		$scope.report_mesg = '';
		if (start_date == '' || start_date == undefined) {
			$scope.report_mesg = 'Please Choose start date';
		} else if (end_date == '' || end_date == undefined) {
			$scope.report_mesg = 'Please Choose end date';
		} else {
			if (type == 'view') { 
				show_loader();
				$http.get('/purchase/purchase_return_report/?start_date='+start_date+'&end_date='+end_date).success(function(data){
					$scope.purchase_returns = data.purchase_return_details;
					if ($scope.purchase_returns.length == 0)
						$scope.report_mesg = 'No Purchases';
					else {
						paginate($scope.purchase_returns, $scope, 15);
					}
					hide_loader();
				}).error(function(data, status){
					console.log(data);
				});
			} else
				document.location.href = '/purchase/purchase_return_report/?start_date='+start_date+'&end_date='+end_date;
		}
	}
	$scope.select_page = function(page){
        select_page(page, $scope.purchase_returns, $scope, 15);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
    $scope.generate_supplier_wise_report = function(type_name){
    	$scope.report_mesg = '';
    	if ($scope.supplier == '' || $scope.supplier == undefined) {
			$scope.report_mesg = 'Please Choose supplier';
		} else {
			if (type_name == 'view') { 
				show_loader();
				$http.get('/purchase/purchase_return_report_supplier_wise/?supplier_id='+$scope.supplier).success(function(data){
					$scope.purchase_returns = data.purchase_return_details;
					if ($scope.purchase_returns.length == 0)
						$scope.report_mesg = 'No Purchases';
					else {
						paginate($scope.purchase_returns, $scope, 15);
					}
					hide_loader();
				}).error(function(data, status){
					console.log(data);
				});
			} else
				document.location.href = '/purchase/purchase_return_report_supplier_wise/?supplier_id='+$scope.supplier;
		}
    }
}
function VendorStockReportController($scope, $http){

	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if ($scope.suppliers != undefined && $scope.suppliers.length > 0) {
			if($scope.focusIndex < $scope.suppliers.length-1){
				$scope.focusIndex++; 
			}
		} 
	}});
	$scope.$on('keydown', function( msg, code ) {
	    $scope.keys.forEach(function(o) {
	      if ( o.code !== code ) { return; }
	      o.action();
	      $scope.$apply();
	    });
  	});
  	$scope.select_list_item = function(index) {
		if ($scope.suppliers != undefined && $scope.suppliers.length > 0) {
			supplier = $scope.suppliers[index];
			$scope.select_supplier(supplier);
		} 
	}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.select_supplier = function(supplier) {
		$scope.supplier = supplier.id;
		$scope.suppliers = [];
		$scope.supplier_name = supplier.name;
		$scope.focusIndex = 0;
	}
	$scope.get_supplier_details = function(){
		$scope.supplier = '';
		$scope.vendor_stock_details = [];
		if ($scope.supplier_name.length > 0)
			search_supplier($scope, $http);
	}
	$scope.generate_supplier_stock_report = function(view_type){
		$scope.report_mesg = '';
    	if ($scope.supplier == '' || $scope.supplier == undefined) {
			$scope.report_mesg = 'Please Choose supplier';
		} else {
			if (view_type == 'view') { 
				show_loader();
				$http.get('/suppliers/vendor_stock_report/?supplier_id='+$scope.supplier).success(function(data){
					$scope.vendor_stock_details = data.vendor_stock_details;
					if ($scope.vendor_stock_details.length == 0)
						$scope.report_mesg = 'No Purchases for this Vendor';
					else {
						paginate($scope.vendor_stock_details, $scope, 15);
					}
					hide_loader();
				}).error(function(data, status){
					console.log(data);
				});
			} else
				document.location.href = '/suppliers/vendor_stock_report/?supplier_id='+$scope.supplier;
		}
	}
}
function VendorWiseItemReportController($scope, $http){

	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if ($scope.suppliers != undefined && $scope.suppliers.length > 0) {
			if($scope.focusIndex < $scope.suppliers.length-1){
				$scope.focusIndex++; 
			}
		} 
	}});
	$scope.$on('keydown', function( msg, code ) {
	    $scope.keys.forEach(function(o) {
	      if ( o.code !== code ) { return; }
	      o.action();
	      $scope.$apply();
	    });
  	});
  	$scope.select_list_item = function(index) {
		if ($scope.suppliers != undefined && $scope.suppliers.length > 0) {
			supplier = $scope.suppliers[index];
			$scope.select_supplier(supplier);
		} 
	}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.select_supplier = function(supplier) {
		$scope.supplier = supplier.id;
		$scope.suppliers = [];
		$scope.supplier_name = supplier.name;
		$scope.focusIndex = 0;
	}
	$scope.get_supplier_details = function(){
		$scope.supplier = '';
		$scope.vendor_item_details = [];
		if ($scope.supplier_name.length > 0)
			search_supplier($scope, $http);
	}
	$scope.generate_supplier_item_report = function(view_type){
		$scope.report_mesg = '';
    	if ($scope.supplier == '' || $scope.supplier == undefined) {
			$scope.report_mesg = 'Please Choose supplier';
		} else {
			if (view_type == 'view') { 
				show_loader();
				$http.get('/suppliers/vendor_wise_item_report/?supplier_id='+$scope.supplier).success(function(data){
					$scope.vendor_item_details = data.vendor_item_details;
					if ($scope.vendor_item_details.length == 0)
						$scope.report_mesg = 'No Purchases for this Vendor';
					else {
						paginate($scope.vendor_item_details, $scope, 15);
					}
					hide_loader();
				}).error(function(data, status){
					console.log(data);
				});
			} else
				document.location.href = '/suppliers/vendor_wise_item_report/?supplier_id='+$scope.supplier;
		}
	}
}