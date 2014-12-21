function hide_sales_popup_divs() {
	$('#payment_details').css('display', 'none');
	$('#add_salesman').css('display', 'none');
	$('#add_customer').css('display', 'none');
	$('#bank_account_details').css('display', 'none');
	$('#transaction_reference_no_details').css('display', 'none');
	$('#dialogue_popup').css('display', 'none');
	$('#dialogue_popup_container').css('display', 'none');
	$('#popup_overlay').css('display', 'none');
	$('#view_bonus_amount').css('display', 'none');
}
function hide_estimate_popup_divs() {
	$('#payment_details').css('display', 'none');
	$('#add_salesman').css('display', 'none');
	$('#dialogue_popup').css('display', 'none');
	$('#dialogue_popup_container').css('display', 'none');
	$('#popup_overlay').css('display', 'none');
}
function hide_delivery_popup_divs() {
	$('#payment_details').css('display', 'none');
	$('#add_salesman').css('display', 'none');
	$('#dialogue_popup').css('display', 'none');
	$('#dialogue_popup_container').css('display', 'none');
	$('#popup_overlay').css('display', 'none');
}
function SalesController($scope, $http){
	$scope.current_sales_item = [];
	$scope.choosed_item = [];
	$scope.product_name = '';
	$scope.no_customer_msg = "";
	$scope.select_all_price_type = false;
	$scope.bank_account = '';
	$scope.salesman_name = '';
	$scope.salesmen = '';
	$scope.customers = '';
	$scope.init = function(csrf_token){
		$scope.csrf_token = csrf_token;
		$scope.keyboard_control();		
		$scope.sales = {
			'deliverynote_id': '',
			'invoice_no': '',
			'invoice_date': '',
			'discount': 0,
			'payment_mode': 'cash',
			'customer': '',
			'salesman': '',
			'customer_tin': '',
			'owner_tin': '',
			'grant_total': 0,
			'tax_exclusive_total': 0,
			'Paid': 0,
			'balance': 0,
			'do_no': '',
			'items': [
				{
					'id': '',
		            'name': '',
		            'code': '',
		            'batch_name': '',
		            'batch_id': '',
		            'stock': '',
		            'stock_unit': '',
		            'uom': '',
		            'quantity': '',
		            'net_amount': '',
		            'tax_exclusive_amount': '',
		            'mrp': '',
		            'current_item_price': 0,
		            'price_type': 'Whole Sale Price',
		            'tax': '',
		            'uoms': [],
		        },
			],
			'quantity_choosed': '',
			'bank_name': '',
			'branch': '',
			'cheque_no': '',
			'card_no': '',
			'card_holder_name': '',
			'cheque_date': '',
			'bill_type': 'Receipt',
			'bank_account_ledger': '',
			'round_off': '',
			'cess': '',
		}
		get_serial_no($scope,$http,'Receipt');
	}
	$scope.add_bulk_items = function (){
		for (var i=0; i<5; i++){
			$scope.add_new_sales_item();
		}
	}
	$scope.keyboard_control = function(){
		$scope.focusIndex = 0;
		$scope.keys = [];
		$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});		
		$scope.keys.push({ code: 38, action: function() { 
			if($scope.focusIndex > 0){
				$scope.focusIndex--; 
			}
		}});
		$scope.keys.push({ code: 40, action: function() { 
			if($scope.salesmen.length > 0){
				$scope.item_list = $scope.salesmen;
			}
			else if($scope.customers.length > 0){
				$scope.item_list = $scope.customers;
			}
			else if($scope.current_sales_item.items.length > 0){
				$scope.item_list = $scope.current_sales_item.items;
			}
			else if($scope.current_sales_item.batches.length > 0){
				$scope.item_list = $scope.current_sales_item.batches;
			}
			if($scope.focusIndex < $scope.item_list.length-1){
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
	}
	$scope.select_list_item = function(index) {
		if($scope.salesmen.length > 0){
			salesman = $scope.salesmen[index];
			$scope.select_salesman(salesman);
		} else if($scope.customers.length > 0){
			customer = $scope.customers[index];
			$scope.select_customer(customer);
		} else if($scope.current_sales_item.items.length > 0){
			item = $scope.current_sales_item.items[index];
			$scope.get_item_details(item);
		} else if($scope.current_sales_item.batches != undefined){ 
			if($scope.current_sales_item.batches.length > 0){
				batch = $scope.current_sales_item.batches[index];
				$scope.select_batch(batch);
			}
		}
		
	}

	$scope.add_new_sales_item = function(){
		$scope.sales.items.push({
			'id': '',
			'name': '',
            'code': '',
            'batch_name': '',
            'batch_id': '',
            'stock': '',
            'stock_unit': '',
            'uom': '',
            'quantity': '',
            'net_amount': '',
            'tax_exclusive_amount': '',
            'mrp': '',
            'current_item_price': 0,
            'purchase_unit': '',
            'relation': '',
            'whole_sale_price': '',
			'retail_price': '',
			'price_type': 'Whole Sale Price',
			'tax': '',
			'offer_quantity': '',
			'packets_per_box': '',
			'pieces_per_box': '',
			'pieces_per_packet': '',
			'unit_per_piece': '',
			'smallest_unit': '',
			'unit_per_packet': '',
			'item_uom': '',
			'cost_price': 0,
			'net_cp': 0,
			'current_item_cp': 0,
			'freight_charge': 0,
			'current_item_freight_charge': 0,
			'net_freight_charge': 0,
		});
		
	}
	$scope.search_sales_items = function(item){

		item.item_search=true;
		$scope.no_item_msg = '';
		$scope.current_sales_item = item;
		$scope.current_sales_item.code = "";
		$scope.current_sales_item.id = "";
		$scope.current_sales_item.batch_name = '';
		$scope.current_sales_item.batch_id = '';
		$scope.current_sales_item.stock = '';
		$scope.current_sales_item.stock_unit = '';
		$scope.current_sales_item.current_item_price = '';
		$scope.current_sales_item.mrp = '';
		$scope.current_sales_item.quantity = '';
		$scope.current_sales_item.net_amount = '';
		if($scope.current_sales_item.name.length > 0)
			get_item_search_list($scope, $http, $scope.current_sales_item.name,$scope.current_sales_item.batch_name,'sales');
	}
	$scope.get_item_details = function(item){
		$scope.current_sales_item.name = item.name;
		$scope.current_sales_item.id = item.id;
		$scope.current_sales_item.code = item.code;
		$scope.current_sales_item.type = item.type;
		$scope.items = "";
		$scope.current_sales_item.item_search = false;
	}
	$scope.search_salesman = function(){
		if($scope.salesman_name.length == 0){
			$scope.salesmen = "";
			$scope.no_salesman_message = "";
		}
		else{
			$scope.sales.salesman = "";
			search_salesmen($scope,$http);
		}	
	}
	$scope.select_salesman = function(salesman){
		$scope.salesman_name = salesman.name;
		$scope.sales.salesman = salesman.id;
		$scope.salesmen = "";
		$scope.select_salesman_flag = false;
		$scope.no_salesman_message = "";
		hide_sales_popup_divs();
		$scope.name = salesman.name;
	}
	$scope.search_batch = function(item){
		if(item.id != ''){
			$scope.no_batch_msg = "";
			$scope.current_sales_item = item;
			$scope.batch_name = item.batch_name;
			$scope.item = item.id;
			$scope.current_sales_item.batches = [];
			get_batch_search_details($scope, $http,'sales');
			if($scope.current_sales_item.batches.length == 0)
				$scope.no_batch_msg = "No such batch";
		} else
			$scope.no_batch_msg = "Please choose an item";
	}
	$scope.new_salesman = function(sales) {
		$scope.current_sales = sales;
		$scope.salesman = {
			'first_name': '',
			'last_name': '',
			'address': '',
			'contact_no': '',
			'email': '',
		}
	    hide_sales_popup_divs();
	    $('#add_salesman_popup').css('display', 'block');
	    $('#add_customer_popup').css('display', 'none');
	    create_popup();
	}
	$scope.save_salesman = function() {
		save_salesman($scope, $http, 'sales');
		$scope.no_salesman_message = "";
	}
	$scope.save_customer = function(){
		save_customer($scope, $http, 'sales');	
		$scope.no_customer_msg = "";
	}
	$scope.hide_popup = function() {
        $scope.salesman = {
            'name': '',
            'address': '',
            'mobile': '',
            'telephone_number': '',
            'email': '',
        }
        $scope.validate_salesman_error_msg = "";
        $('#dialogue_popup_container').css('display', 'none');
        $('#popup_overlay').css('display', 'none');
    }
	$scope.select_batch = function(batch){
		$scope.no_batch_msg = '';
		$scope.current_sales_item.batch_name = batch.name;
		$scope.current_sales_item.batch_id = batch.id;
		$scope.batch_items_list = "";
		if ($scope.current_sales_item.id) {
			$http.get('/inventory/batch_item_details/?batch_id='+$scope.current_sales_item.batch_id+'&item_id='+$scope.current_sales_item.id).success(function(data){
	        	$scope.current_sales_item.batches = [];
	        	$scope.current_sales_item.stock = data.batch_item.stock;
	        	$scope.current_sales_item.stock_unit = data.batch_item.stock_unit;
	        	$scope.current_sales_item.uoms = data.batch_item.uoms;
	        	$scope.current_sales_item.wholesale_price = data.batch_item.whole_sale_price,
	            $scope.current_sales_item.retail_price = data.batch_item.retail_price,
	            $scope.current_sales_item.branch_price = data.batch_item.branch_price,
	            $scope.current_sales_item.customer_card_price = data.batch_item.customer_card_price,
	        	$scope.current_sales_item.price_type = 'Retail Price';
	        	$scope.current_sales_item.mrp = data.batch_item.retail_price_sales;
	        	$scope.current_sales_item.tax = data.batch_item.tax;
	        	
		    }).error(function(data, status) {
		    	console.log('Request failed' || data);
		    });
		}
		$scope.current_sales_item.batches = "";
	}
	$scope.change_bill_type = function(bill_type){
		for(var i = 0; i < $scope.sales.items.length; i++){
			if($scope.sales.items[i].uom != '' && $scope.sales.items[i].quantity.length > 0){
				$scope.sales.items[i].net_amount = parseFloat( $scope.sales.items[i].quantity) * parseFloat($scope.sales.items[i].current_item_price);
				$scope.sales.items[i].tax_exclusive_amount = $scope.sales.items[i].net_amount;
				if(bill_type == 'Invoice'){
					$scope.sales.items[i].net_amount = parseFloat($scope.sales.items[i].net_amount) + (parseFloat($scope.sales.items[i].net_amount) * parseFloat($scope.sales.items[i].tax/100))	
				}
			}
		}
		if(bill_type == 'Invoice')
			get_serial_no($scope,$http,'Invoice');
		else
			get_serial_no($scope,$http,'Receipt');
		$scope.calculate_total_amount();
	}	
	$scope.calculate_quantity_from_uom = function(item){
		$scope.validate_sales_msg = "";
    	for(i=0; i<item.uoms.length; i++) {
    		if(item.uoms[i].uom == item.uom){
    			if(item.quantity > item.uoms[i].stock){
    				$scope.validate_sales_msg = "Quantity Out of Stock";
    			} else {
    				if(item.price_type == 'Whole Sale Price'){
    					item.mrp = item.uoms[i].wholesale_price;
						item.net_amount = item.quantity*item.uoms[i].wholesale_price;
    				}
    					
    				if(item.price_type == 'Retail Price'){
    					item.mrp = item.uoms[i].retail_price;
    					item.net_amount = item.quantity*item.uoms[i].retail_price;
    				}
    					
    				if(item.price_type == 'Branch Price'){
    					item.mrp = item.uoms[i].branch_price;
    					item.net_amount = item.quantity*item.uoms[i].branch_price;
    				}
    					
    				if(item.price_type == 'Customer Card Price'){
    					item.mrp = item.uoms[i].customer_card_price;
    					item.net_amount = item.quantity*item.uoms[i].customer_card_price;
    				}
    			}
    		}
    	}    	
		item.tax_exclusive_amount = item.net_amount;
    	if($scope.sales.bill_type == 'Invoice'){
			item.net_amount = parseFloat(item.net_amount) + (parseFloat(item.net_amount) * parseFloat(item.tax/100));
		}
    	item.current_item_price = item.mrp;
		$scope.calculate_total_amount();
	}
	$scope.calculate_total_amount = function(){
		$scope.sales.grant_total = 0;
		$scope.sales.tax_exclusive_total = 0;
		if ($scope.sales.cess != Number($scope.sales.cess)) {
			$scope.sales.cess = 0;
		}
		for(var i = 0; i < $scope.sales.items.length; i++){
			if(Number($scope.sales.items[i].net_amount)){
				$scope.sales.grant_total = parseFloat($scope.sales.grant_total) + parseFloat($scope.sales.items[i].net_amount);
				$scope.sales.tax_exclusive_total = parseFloat($scope.sales.tax_exclusive_total) + parseFloat($scope.sales.items[i].tax_exclusive_amount);
			}
		}
		if($scope.sales.discount.length != 0 && Number($scope.sales.discount)){
			$scope.sales.grant_total = parseFloat($scope.sales.grant_total) - parseFloat($scope.sales.discount)
			$scope.sales.tax_exclusive_total = parseFloat($scope.sales.tax_exclusive_total) - parseFloat($scope.sales.discount)
		}
		if ($scope.sales.round_off != Number($scope.sales.round_off)) {
			$scope.sales.round_off = 0;
		}
		if($scope.sales.round_off.length != 0 && Number($scope.sales.round_off)){
			$scope.sales.grant_total = parseFloat($scope.sales.grant_total) - parseFloat($scope.sales.round_off)
			$scope.sales.tax_exclusive_total = parseFloat($scope.sales.tax_exclusive_total) - parseFloat($scope.sales.round_off)
		}
		if($scope.sales.payment_mode  == 'credit'){
			if($scope.sales.Paid.length != 0 && Number($scope.sales.Paid)){
				//$scope.sales.grant_total = parseFloat($scope.sales.grant_total) - parseFloat($scope.sales.Paid)
				$scope.sales.balance = parseFloat($scope.sales.grant_total) - parseFloat($scope.sale.Paid)
				$scope.sales.tax_exclusive_total = parseFloat($scope.sales.tax_exclusive_total) - parseFloat($scope.sales.Paid)
			}
		}
		if($scope.sales.cess.length != 0 && Number($scope.sales.cess)){
			cess = parseFloat($scope.sales.grant_total)*(parseFloat($scope.sales.cess)/100);
			cess = cess.toFixed(2);
			$scope.sales.grant_total = parseFloat($scope.sales.grant_total) + parseFloat(cess);
		}
		$scope.sales.grant_total = $scope.sales.grant_total.toFixed(2);
	}
	$scope.search_customer = function(){
		if($scope.customer_name.length == 0){
			$scope.customers = "";
			$scope.no_customer_msg = "";
		} else {
			$scope.sales.customer = "";
			get_customer_search_list($scope, $http);
		}		
	}
	$scope.select_customer = function(customer){
		$scope.customer_name = customer.name;
		$scope.sales.customer = customer.id;
		$scope.customers = "";
		$scope.select_customer_flag = false;
		$scope.no_customer_msg = "";
		hide_sales_popup_divs();
		$scope.name = customer.name;
	}
	$scope.new_customer = function(sales) {
		$scope.current_sales = sales;
	    $scope.customer= {
	        'name': '',
	        'area': '', 
	        'address': '',
	        'mobile': '',
	        'contact_number': '',
	        'email': '',
	    }
	    hide_sales_popup_divs();
	    $('#add_salesman_popup').css('display', 'none');
	    $('#add_customer_popup').css('display', 'block');
	    create_popup();
	}
	$scope.payment_mode_details = function(payment_mode) {
		hide_sales_popup_divs();
		$('#payment_details').css('display', 'block');
		$('#add_customer_popup').css('display', 'none');
		$('#add_salesman_popup').css('display', 'none');
		create_popup();
		if (payment_mode == 'cheque') {
			$scope.is_cheque_payment = true;
		} else if (payment_mode == 'card') {
			$scope.is_cheque_payment = false;
		} else {
			hide_sales_popup_divs();
		}
	}
	$scope.bank_account_details = function(payment_mode) {
		get_bank_account_details($scope, $http);
		$scope.sales.payment_mode = payment_mode;
		hide_sales_popup_divs();
		$('#bank_account_details').css('display', 'block');
		$('#add_customer_popup').css('display', 'none');
		$('#add_salesman_popup').css('display', 'none');
		$scope.other_bank_account = false;
		$scope.bank_account_error = '';
		$scope.bank_account = '';
		$scope.bank_account_name = '';
		if ($scope.sales.payment_mode == 'cheque') {
			$scope.is_cheque = true;
		} else {
			$scope.is_cheque = false;
		}
		create_popup();
	}
	$scope.add_bank_account_details = function() {
		if($scope.bank_account != ''){
			$scope.sales.bank_account_ledger = $scope.bank_account;
			$scope.payment_mode_details($scope.sales.payment_mode);
		}
	}
	$scope.create_new_bank_acount = function() {
		if ($scope.bank_account_name == '' || $scope.bank_account_name == undefined) {
			$scope.bank_account_error = 'Please enter the Bank account name';
		} else {
			create_new_bank_acount($scope, $http, 'sales');
		}
	}
	$scope.validate_sales = function(){
		$scope.validate_sales_msg = "";
		if($scope.salesman_name != '' && $scope.sales.salesman == ''){
			$scope.validate_sales_msg = "Please select a salesman from the list";
			return false;
		} else if($scope.no_customer_msg != ""){
			$scope.validate_sales_msg = "Please select a valid customer or leave the field empty";
			return false;
		} else if (($scope.sales.payment_mode == 'card' || $scope.sales.payment_mode == 'cheque' ) && ($scope.sales.bank_name == '' || $scope.sales.bank_name == undefined)) {
			$scope.validate_sales_msg = 'Please enter bank name';
			return false;
		} else if (($scope.sales.payment_mode == 'card') && ($scope.sales.card_no == '' || $scope.sales.card_no == undefined)) {
			$scope.validate_sales_msg = 'Please enter Card No';
			return false;
		} else if (($scope.sales.payment_mode == 'card') && ($scope.sales.card_holder_name == '' || $scope.sales.card_holder_name == undefined)) {
			$scope.validate_sales_msg = 'Please enter Card Holder Name';
			return false;
		} else if (($scope.sales.payment_mode == 'cheque') && ($scope.sales.branch == '' || $scope.sales.branch == undefined)) {
			$scope.validate_sales_msg = 'Please enter Branch';
			return false;
		} else if (($scope.sales.payment_mode == 'cheque') && $scope.sales.cheque_date == '') {
			$scope.validate_sales_msg = 'Please choose Cheque Date';
			return false;
		} else if (($scope.sales.payment_mode == 'cheque') && ($scope.sales.cheque_no == '' || $scope.sales.cheque_no == undefined)) {
			$scope.validate_sales_msg = 'Please choose Cheque Number';
			return false;
		} else if($scope.sales.customer == '' && $scope.sales.payment_mode == 'credit'){
			$scope.validate_estimate_msg = 'Please choose Customer';
			return false;
		}
		for(var i = 0; i < $scope.sales.items.length; i++){
			if ($scope.sales.items[i].code == '') {
				$scope.validate_sales_msg = 'Item code cannot be null in row' + (i+1);
				return false;
			} else if ($scope.sales.items[i].name == '') {
				$scope.validate_sales_msg = 'Item name cannot be null in row' + (i+1);
				return false;
			} else if ($scope.sales.items[i].batch_id == '' && $scope.sales.items[i].type == 'Stockable') {
				$scope.validate_sales_msg = 'Please choose batch for the item in row '+ (i+1);
				return false;
			} else if ($scope.sales.items[i].uom == '' && $scope.sales.items[i].type == 'Stockable') {
				$scope.validate_sales_msg = 'Please choose the unit of measurement in row '+ (i+1);
				return false;
			} else if ($scope.sales.items[i].quantity == '') {
				$scope.validate_sales_msg = 'Please enter the quantity in row '+ (i+1);
				return false;
			} else if($scope.sales.items[i].current_item_price == ''){
				$scope.validate_sales_msg = 'Please enter mrp in row'+ (i+1);
				return false;
			}else if (($scope.sales.items[i].stock == ''|| $scope.sales.items[i].stock == 0 || $scope.sales.items[i].stock == undefined) && $scope.sales.items[i].type == 'Stockable') {
				$scope.validate_sales_msg = 'There is no stock for the choosen batch in row '+ (i+1);
				return false;
			}
			if($scope.sales.items[i].uom == $scope.sales.items[i].stock_unit && $scope.sales.items[i].type == 'Stockable'){
				if($scope.sales.items[i].quantity > $scope.sales.items[i].stock){
					$scope.validate_sales_msg = "Out of Stock quantity in row " + (i+1);
					return false;
				}
			} else if($scope.sales.items[i].uom == $scope.sales.items[i].purchase_unit && $scope.sales.items[i].type == 'Stockable'){
				if($scope.sales.items[i].quantity*$scope.sales.items[i].relation > $scope.sales.items[i].stock){
					$scope.validate_sales_msg = "Out of Stock in row " + (i+1);
					return false;
				}
			}
		} return true;
	}
	$scope.calculate_amount = function(item){
		if (item.quantity != Number(item.quantity) || item.quantity == '') 
			item.quantity = 0
		if (item.current_item_price != Number(item.current_item_price) || item.current_item_price  == '')
			item.current_item_price = 0
		item.net_amount = parseFloat(item.quantity) * parseFloat(item.current_item_price)
		item.tax_exclusive_amount = item.net_amount;
		$scope.calculate_total_amount();
	}
	$scope.save_sales = function(){
		if($scope.validate_sales()){
			$scope.sales.invoice_date = $('#invoice_date').val();
			for(var i = 0; i < $scope.sales.items.length; i++){
				if($scope.sales.items[i].item_search == true)
					$scope.sales.items[i].item_search = "true"
				else
					$scope.sales.items[i].item_search = "false"
				if($scope.sales.items[i].net_freight_charge == null)
					$scope.sales.items[i].net_freight_charge = ''				
			}	
			params = {
				'sales_details': angular.toJson($scope.sales),
				'csrfmiddlewaretoken': $scope.csrf_token,
			}
			show_loader();
			$http({
				method: 'post',
				url: '/sales/sales_entry/',
				data: $.param(params),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).success(function(data){
				hide_loader();
				if(data.result == 'ok'){
					hide_sales_popup_divs($scope, $http);
					$scope.transaction_reference_no = data.transaction_reference_no;
					$scope.transaction_name = ' Sales ';
					hide_popup();
					$('#add_salesman_popup').css('display', 'none');
	    			$('#add_customer_popup').css('display', 'none');
					$('#transaction_reference_no_details').css('display', 'block');

					create_popup();
				} else {
					$scope.validate_sales_msg = data.message;
				}
			}).error(function(data, status){
				console.log('Request failed' || data);
			})
		}
	}
	$scope.hide_popup_transaction_details = function() {	
	  	$('#transaction_reference_no_details').css('display', 'none');	
	  	hide_popup();
	  	document.location.href = "/sales/sales_entry/";
		url = '/sales/sales_entry?transaction_ref_no='+$scope.transaction_reference_no;
		var win = window.open(url, '_blank');
  		win.focus();
	}
	$scope.remove_item = function(item) {
		var index = $scope.sales.items.indexOf(item);
		$scope.sales.items.splice(index, 1);
		$scope.calculate_total_amount();
	}
	$scope.hide_popup_payment_details = function(){
		$scope.sales.bank_name = $scope.bank_name;
		$scope.sales.branch = $scope.branch;
		$scope.sales.cheque_no = $scope.cheque_no;
		$scope.sales.card_no = $scope.card_no;
		$scope.sales.card_holder_name = $scope.card_holder_name;
		$scope.sales.cheque_date = document.getElementById("cheque_date").value;
		hide_sales_popup_divs();
	}
}


function SalesViewController($scope, $http){
	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if ($scope.invoice_nos != undefined && $scope.invoice_nos.length > 0) {
			if($scope.focusIndex < $scope.invoice_nos.length-1){
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
		if ($scope.invoice_nos != undefined && $scope.invoice_nos.length > 0) {
			invoice_no = $scope.invoice_nos[index];
			$scope.select_invoice(invoice_no);
		} 
	}
	$scope.init = function(csrf_token){
		$scope.csrf_token = csrf_token;
		$scope.ref_no = '';
		$scope.sales_view = {
			'do_no': '',
			'sales_invoice': '',
			'invoice_date': '',
			'salesman': '',
			'customer': '',
			'bill_type': '',
			'payment_mode': '',
	        'bank_name': '',
            'cheque_date': '',
            'cheque_no': '',
            'branch': '',
            'card_no': '',
            'card_holder_name': '',
			'items': {
				'name': '',
				'code': '',
				'batch': '',
				'item_quantity': '',
				'mrp': '',
				'tax': '',
				'net_amount': '',
			},
			'discount': '',
			'grant_total': '',
		}
	}
	$scope.get_sales_details = function(){
		if($scope.ref_no != ''){
			$http.get('/sales/sales_view/?ref_no='+$scope.ref_no).success(function(data) {
				if (data.result == 'ok') {
					$scope.sales_view = data.sales_view;
					$scope.transaction_reference_no = data.sales_view.transaction_reference_no;
					$scope.sales_error_message = '';
				} else{
					$scope.sales_error_message = "No sales found";
					$scope.sales_view = '';
				}					
			}).error(function(data, status){
				console.log('Request failed' || data);
			});
		} else{
			$scope.sales_view = "";
		}
	}
	$scope.search_invoice = function(){
		if ($scope.sales_invoice.length > 0){
			$http.get('/sales/invoice_no_search/?sales_invoice='+$scope.sales_invoice).success(function(data){
	        $scope.invoice_nos = data.invoice_nos;
	        
		    }).error(function(data, status){
		        $scope.message = data.message;
		    })
		}
			
	}
	$scope.select_invoice = function(invoice_no){
		select_invoice_flag = false;
		$scope.ref_no = invoice_no.invoice_no;
		$scope.focusIndex = 0;
		$scope.invoice_nos = [];
		$scope.get_sales_details($scope,$http);
	}
	$scope.print_sales = function(){
		if(!$scope.ref_no == ''){
			document.location.href = '/sales/sales_entry?transaction_ref_no='+$scope.transaction_reference_no;
		}
	}
	$scope.show_payment_details = function(){
		if ($scope.sales_view.payment_mode == 'cheque') {
			$scope.is_cheque = true;
		} else {
			$scope.is_cheque = false;
		}
		create_popup();
		$scope.bank_name = $scope.sales_view.bank_name;
		$scope.cheque_date = $scope.sales_view.cheque_date;
		$scope.cheque_number = $scope.sales_view.cheque_no;
		$scope.branch = $scope.sales_view.branch;
		$scope.card_number = $scope.sales_view.card_no;
		$scope.card_holder_name = $scope.sales_view.card_holder_name;
	}
	$scope.hide_popup = function() {
		hide_popup();
	}
	$scope.change_discount = function() {
		$scope.edit_discount = true;
		$scope.sales_view.new_discount = $scope.sales_view.discount;
	}
	$scope.save_sales = function() {
		balance = (parseFloat($scope.sales_view.grant_total) + parseFloat($scope.sales_view.roundoff)) - (parseFloat($scope.sales_view.discount) + parseFloat($scope.sales_view.round_off));
		if ($scope.sales_view.round_off != Number($scope.sales_view.round_off)) {
			$scope.sales_view.round_off = 0;
		}
		if (balance <= 0) {
			$scope.validate_sales_msg = 'Please check the New Discount with the Grant Total';
		} else {
			params = {
				'csrfmiddlewaretoken': $scope.csrf_token,
				'sales_id': $scope.sales_view.id,
				'round_off': $scope.sales_view.round_off,
			}
			$http({
				method: 'post',
				data: $.param(params),
				url: '/sales/change_sales_discount/',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).success(function(data){
				document.location.href = '/sales/sales_view/';
			}).error(function(data, status){
				console.log('Request failed' || data);
			});
		}
	}

}
function BillToInvoiceController($scope, $http){
	$scope.show_sales_details = false;
	$scope.salesman_name = '';
	$scope.salesmen = '';
	$scope.customers = '';
	$scope.current_sales_item = [];
	$scope.init = function(csrf_token){
		$scope.csrf_token = csrf_token;
		$scope.keyboard_control();
		$scope.ref_no = '';
	}
	$scope.keyboard_control = function(){
		$scope.focusIndex = 0;
		$scope.keys = [];
		$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});		
		$scope.keys.push({ code: 38, action: function() { 
			if($scope.focusIndex > 0){
				$scope.focusIndex--; 
			}
		}});
		$scope.keys.push({ code: 40, action: function() { 
			if($scope.salesmen.length > 0){
				$scope.item_list = $scope.salesmen;
			}
			else if($scope.customers.length > 0){
				$scope.item_list = $scope.customers;
			}
			else if($scope.current_sales_item.items.length > 0){
				$scope.item_list = $scope.current_sales_item.items;
			}
			else if($scope.current_sales_item.batches.length > 0){
				$scope.item_list = $scope.current_sales_item.batches;
			}
			if($scope.focusIndex < $scope.item_list.length-1){
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
	}
	$scope.select_list_item = function(index) {
		if($scope.salesmen.length > 0){
			salesman = $scope.salesmen[index];
			$scope.select_salesman(salesman);
		} else if($scope.customers.length > 0){
			customer = $scope.customers[index];
			$scope.select_customer(customer);
		} else if($scope.current_sales_item.items.length > 0){
			item = $scope.current_sales_item.items[index];
			$scope.get_item_details(item);
		} else if($scope.current_sales_item.batches != undefined){ 
			if($scope.current_sales_item.batches.length > 0){
				batch = $scope.current_sales_item.batches[index];
				$scope.select_batch(batch);
			}
		}
	}
	$scope.get_sales_details = function(){
		if($scope.ref_no != ''){
			$http.get('/sales/receipt_to_invoice/?ref_no='+$scope.ref_no).success(function(data) {
				if (data.result == 'ok') {
					$scope.show_sales_details = true;
					$scope.sales = data.sales;
					$scope.customer_name = data.sales.customer;
					$scope.salesman_name = data.sales.salesman;
					$scope.sales.customer = data.sales.customer_id;
					$scope.sales.salesman = data.sales.salesman_id;
					$scope.transaction_reference_no = data.sales.transaction_reference_no;
					$scope.sales_error_message = '';
				} else{
					$scope.sales_error_message = "No sales found";
					$scope.sales = '';
				}					
			}).error(function(data, status){
				console.log('Request failed' || data);
			});
		} else{
			$scope.sales = "";
		}
	}
	$scope.get_batch = function(item){
		$http.get('/inventory/batch_item_details/?batch_id='+item.batch_id+'&item_id='+item.id).success(function(data){
        	$scope.current_delivery_item = data.batch_item
        	console.log($scope.current_delivery_item);
        	item.price_type = 'Retail Price';
        	item.mrp = data.batch_item.retail_price_sales;
        	
	    }).error(function(data, status) {
	    	console.log('Request failed' || data);
	    });
	}
	$scope.add_new_sales_item = function(){
		$scope.sales.items.push({
			'id': '',
			'name': '',
            'code': '',
            'batch_name': '',
            'batch_id': '',
            'stock': '',
            'stock_unit': '',
            'selling_units':[],
            'uom': '',
            'quantity': '',
            'net_amount': '',
            'tax_exclusive_amount': '',
            'mrp': '',
            'current_item_price': 0,
            'selling_unit': '',
            'purchase_unit': '',
            'relation': '',
            'whole_sale_price': '',
			'retail_price': '',
			'price_type': 'Whole Sale Price',
			'tax': '',
			'offer_quantity': '',
			'packets_per_box': '',
			'pieces_per_box': '',
			'pieces_per_packet': '',
			'unit_per_piece': '',
			'smallest_unit': '',
			'unit_per_packet': '',
			'item_uom': '',
			'cost_price': 0,
			'net_cp': 0,
			'current_item_cp': 0,
			'freight_charge': 0,
			'current_item_freight_charge': 0,
			'net_freight_charge': 0,
		});
		$scope.selling_units = {
			'unit': '',
		}
	}
	$scope.search_sales_items = function(item){

		item.item_search=true;
		$scope.no_item_msg = '';
		$scope.current_sales_item.items = [];
		$scope.current_sales_item = item;
		// $scope.item_name = item.name;
		$scope.current_sales_item.code = "";
		$scope.current_sales_item.id = "";
		$scope.current_sales_item.batch_name = '';
		$scope.current_sales_item.batch_id = '';
		$scope.current_sales_item.stock = '';
		$scope.current_sales_item.stock_unit = '';
		$scope.current_sales_item.current_item_price = '';
		$scope.current_sales_item.mrp = '';
		$scope.current_sales_item.quantity = '';
		$scope.current_sales_item.net_amount = '';
		if($scope.current_sales_item.name.length > 0)
			get_item_search_list($scope, $http, $scope.current_sales_item.name,$scope.current_sales_item.batch_name,'sales');
	}
	$scope.get_item_details = function(item){
		$scope.current_sales_item.name = item.name;
		$scope.current_sales_item.item_id = item.id;
		$scope.current_sales_item.code = item.code;
		$scope.current_sales_item.type = item.type;
/*		if($scope.current_sales_item.type == 'Non Stockable' || $scope.current_sales_item.type == 'Services'){
			$scope.current_sales_item.tax = item.tax;
			get_conversions($scope,$http);
		}*/
		$scope.current_sales_item.items = []
		$scope.items = "";
		$scope.current_sales_item.item_search = false;
	}
	$scope.search_salesman = function(){
		select_salesman_flag=true;
		if($scope.salesman_name.length == 0){
			$scope.salesmen = "";
			$scope.no_salesman_message = "";
		}
		else{
			$scope.sales.salesman = "";
			search_salesmen($scope,$http);
		}	
	}
	$scope.select_salesman = function(salesman){
		$scope.salesman_name = salesman.name;
		$scope.sales.salesman = salesman.id;
		$scope.salesmen = "";
		$scope.select_salesman_flag = false;
		$scope.no_salesman_message = "";
		hide_sales_popup_divs();
		$scope.name = salesman.name;
		// $scope.bonus_point = salesman.bonus_point;
		// $('#view_bonus_amount').css('display', 'block');
		// create_popup();
	}
	$scope.search_batch = function(item){
		if(item.item_id != ''){
			$scope.no_batch_msg = "";
			$scope.current_sales_item = item;
			$scope.batch_name = item.batch_name;
			$scope.item = item.item_id;
			$scope.current_sales_item.batches = [];
			get_batch_search_details($scope, $http,'sales');
			if($scope.current_sales_item.batches.length == 0)
				$scope.no_batch_msg = "No such batch";
		} else
			$scope.no_batch_msg = "Please choose an item";
	}
	$scope.new_salesman = function() {
		$scope.salesman = {
			'first_name': '',
			'last_name': '',
			'address': '',
			'contact_no': '',
			'email': '',
		}
	    hide_sales_popup_divs();
	    $('#new_salesman').css('display', 'block');
	    $('#add_customer_popup').css('display', 'none');
	    create_popup();
	}
	$scope.save_salesman = function() {
		save_salesman($scope, $http, 'bill_to_invoice');
		$scope.no_salesman_message = "";
	}
	$scope.save_customer = function(){
		save_customer($scope, $http, 'bill_to_invoice');	
		$scope.no_customer_msg = "";
	}
	$scope.hide_popup = function() {
        $scope.salesman = {
            'name': '',
            'address': '',
            'mobile': '',
            'telephone_number': '',
            'email': '',
        }
        $scope.validate_salesman_error_msg = "";
        $('#dialogue_popup_container').css('display', 'none');
        $('#popup_overlay').css('display', 'none');
    }
	$scope.select_batch = function(batch){
		$scope.no_batch_msg = '';
		$scope.current_sales_item.batch_name = batch.name;
		$scope.current_sales_item.batch_id = batch.id;
		$scope.batch_items_list = "";
		if ($scope.current_sales_item.id) {
			$http.get('/inventory/batch_item_details/?batch_id='+$scope.current_sales_item.batch_id+'&item_id='+$scope.current_sales_item.id).success(function(data){
	        	$scope.current_sales_item.batches = [];
	        	$scope.current_sales_item.stock = data.batch_item.stock;
	        	$scope.current_sales_item.stock_unit = data.batch_item.stock_unit;
	        	$scope.current_sales_item.uoms = data.batch_item.uoms;
	        	$scope.current_sales_item.wholesale_price = data.batch_item.whole_sale_price,
	            $scope.current_sales_item.retail_price = data.batch_item.retail_price,
	            $scope.current_sales_item.branch_price = data.batch_item.branch_price,
	            $scope.current_sales_item.customer_card_price = data.batch_item.customer_card_price,
	        	$scope.current_sales_item.price_type = 'Retail Price';
	        	$scope.current_sales_item.mrp = data.batch_item.retail_price_sales;
	        	$scope.current_sales_item.tax = data.batch_item.tax;
	        	
		    }).error(function(data, status) {
		    	console.log('Request failed' || data);
		    });
		}
		$scope.current_sales_item.batches = "";
	}
	$scope.calculate_quantity_from_uom = function(item){
		$scope.validate_sales_msg = "";
    	for(i=0; i<item.uoms.length; i++) {
    		if(item.uoms[i].uom == item.uom){
    			if(item.quantity > item.uoms[i].stock){
    				$scope.validate_sales_msg = "Quantity Out of Stock";
    			} else {
    				if(item.price_type == 'Whole Sale Price'){
    					item.mrp = item.uoms[i].wholesale_price;
						item.net_amount = item.quantity*item.uoms[i].wholesale_price;
    				}
    					
    				if(item.price_type == 'Retail Price'){
    					item.mrp = item.uoms[i].retail_price;
    					item.net_amount = item.quantity*item.uoms[i].retail_price;
    				}
    					
    				if(item.price_type == 'Branch Price'){
    					item.mrp = item.uoms[i].branch_price;
    					item.net_amount = item.quantity*item.uoms[i].branch_price;
    				}
    					
    				if(item.price_type == 'Customer Card Price'){
    					item.mrp = item.uoms[i].customer_card_price;
    					item.net_amount = item.quantity*item.uoms[i].customer_card_price;
    				}
    			}
    		}
    	}    	
		item.tax_exclusive_amount = item.net_amount;
    	if($scope.sales.bill_type == 'Invoice'){
			item.net_amount = parseFloat(item.net_amount) + (parseFloat(item.net_amount) * parseFloat(item.tax/100));
		}
    	item.current_item_price = item.mrp;
		$scope.calculate_total_amount();
	}
	$scope.calculate_total_amount = function(){
		$scope.sales.grant_total = 0;
		$scope.sales.tax_exclusive_total = 0;
		if ($scope.sales.cess != Number($scope.sales.cess)) {
			$scope.sales.cess = 0;
		}
		for(var i = 0; i < $scope.sales.items.length; i++){
			if(Number($scope.sales.items[i].net_amount)){
				$scope.sales.grant_total = parseFloat($scope.sales.grant_total) + parseFloat($scope.sales.items[i].net_amount);
				$scope.sales.tax_exclusive_total = parseFloat($scope.sales.tax_exclusive_total) + parseFloat($scope.sales.items[i].tax_exclusive_amount);
			}
		}
		if($scope.sales.discount.length != 0 && Number($scope.sales.discount)){
			$scope.sales.grant_total = parseFloat($scope.sales.grant_total) - parseFloat($scope.sales.discount)
			$scope.sales.tax_exclusive_total = parseFloat($scope.sales.tax_exclusive_total) - parseFloat($scope.sales.discount)
		}
		if ($scope.sales.round_off != Number($scope.sales.round_off)) {
			$scope.sales.round_off = 0;
		}
		if($scope.sales.round_off.length != 0 && Number($scope.sales.round_off)){

			console.log("sss")
			$scope.sales.grant_total = parseFloat($scope.sales.grant_total) - parseFloat($scope.sales.round_off)
			$scope.sales.tax_exclusive_total = parseFloat($scope.sales.tax_exclusive_total) - parseFloat($scope.sales.round_off)
		}
		if($scope.sales.Paid.length != 0 && Number($scope.sales.Paid)){
			$scope.sales.grant_total = parseFloat($scope.sales.grant_total) - parseFloat($scope.sales.Paid)
			$scope.sales.tax_exclusive_total = parseFloat($scope.sales.tax_exclusive_total) - parseFloat($scope.sales.Paid)
		}
		if($scope.sales.cess.length != 0 && Number($scope.sales.cess)){
			cess = parseFloat($scope.sales.grant_total)*(parseFloat($scope.sales.cess)/100);
			cess = cess.toFixed(2);
			$scope.sales.grant_total = parseFloat($scope.sales.grant_total) + parseFloat(cess);
		}
		$scope.sales.grant_total = $scope.sales.grant_total.toFixed(2);
	}
	
	$scope.print_sales = function(){
		document.location.href = '/sales/sales_entry?transaction_ref_no='+$scope.transaction_reference_no;
	}
	$scope.show_payment_details = function(){
		if ($scope.sales_view.payment_mode == 'cheque') {
			$scope.is_cheque = true;
		} else {
			$scope.is_cheque = false;
		}
		create_popup();
		$scope.bank_name = $scope.sales.bank_name;
		$scope.cheque_date = $scope.sales.cheque_date;
		$scope.cheque_number = $scope.sales.cheque_number;
		$scope.branch = $scope.sales.branch;
		$scope.card_number = $scope.sales.card_number;
		$scope.card_holder_name = $scope.sales.card_holder_name;
	}
	$scope.hide_popup = function() {
		hide_popup();
	}
	$scope.change_bill_type = function(bill_type){
		for(var i = 0; i < $scope.sales.items.length; i++){
			if($scope.sales.items[i].uom != '' && $scope.sales.items[i].quantity != ''){
				$scope.sales.items[i].net_amount = parseFloat( $scope.sales.items[i].quantity) * parseFloat($scope.sales.items[i].mrp);
				$scope.sales.items[i].tax_exclusive_amount = $scope.sales.items[i].net_amount;
				if(bill_type == 'Invoice'){
					$scope.sales.items[i].net_amount = parseFloat($scope.sales.items[i].net_amount) + (parseFloat($scope.sales.items[i].net_amount) * parseFloat($scope.sales.items[i].tax/100))	
					
				}
			}
		}
		$scope.calculate_total_amount();
	}
	// $scope.change_price_type = function(){
	// 	 for(var i = 0; i < $scope.sales.items.length; i++){
	// 		if($scope.select_all_price_type == true){
	// 			$scope.sales.items[i].price_type = false;
	// 		}
	// 		else{
	// 			$scope.sales.items[i].price_type = true;
	// 		}
	// 	}
	// 	for(var i = 0; i < $scope.sales.items.length; i++){
	// 		$scope.calculate_quantity_from_uom($scope.sales.items[i]);			
	// 	}
	// }
	$scope.validate_sales = function(){
		$scope.validate_sales_msg = "";
		if (($scope.sales.payment_mode == 'card' || $scope.sales.payment_mode == 'cheque' ) && ($scope.sales.bank_name == '' || $scope.sales.bank_name == undefined)) {
			$scope.validate_sales_msg = 'Please enter bank name';
			return false;
		} else if (($scope.sales.payment_mode == 'card') && ($scope.sales.card_no == '' || $scope.sales.card_no == undefined)) {
			$scope.validate_sales_msg = 'Please enter Card No';
			return false;
		} else if (($scope.sales.payment_mode == 'card') && ($scope.sales.card_holder_name == '' || $scope.sales.card_holder_name == undefined)) {
			$scope.validate_sales_msg = 'Please enter Card Holder Name';
			return false;
		} else if (($scope.sales.payment_mode == 'cheque') && ($scope.sales.branch == '' || $scope.sales.branch == undefined)) {
			$scope.validate_sales_msg = 'Please enter Branch';
			return false;
		} else if (($scope.sales.payment_mode == 'cheque') && $scope.sales.cheque_date == '') {
			$scope.validate_sales_msg = 'Please choose Cheque Date';
			return false;
		} else if (($scope.sales.payment_mode == 'cheque') && ($scope.sales.cheque_no == '' || $scope.sales.cheque_no == undefined)) {
			$scope.validate_sales_msg = 'Please choose Cheque Number';
			return false;
		} else if($scope.sales.customer == '' && $scope.sales.payment_mode == 'credit'){
			$scope.validate_estimate_msg = 'Please choose Customer';
			return false;
		}
		for(var i = 0; i < $scope.sales.items.length; i++){
			if ($scope.sales.items[i].code == '') {
				$scope.validate_sales_msg = 'Item code cannot be null in row' + (i+1);
				return false;
			} else if ($scope.sales.items[i].name == '') {
				$scope.validate_sales_msg = 'Item name cannot be null in row' + (i+1);
				return false;
			} else if ($scope.sales.items[i].batch_id == '' && $scope.sales.items[i].type == 'Stockable') {
				$scope.validate_sales_msg = 'Please choose batch for the item in row '+ (i+1);
				return false;
			} else if ($scope.sales.items[i].uom == '' && $scope.sales.items[i].type != 'Services') {
				$scope.validate_sales_msg = 'Please choose the unit of measurement in row '+ (i+1);
				return false;
			} else if ($scope.sales.items[i].quantity == '') {
				$scope.validate_sales_msg = 'Please enter the quantity in row '+ (i+1);
				return false;
			} else if ($scope.sales.items[i].stock == ''|| $scope.sales.items[i].stock == 0 || $scope.sales.items[i].stock == undefined) {
				$scope.validate_sales_msg = 'There is no stock for the chooseen batch in row '+ (i+1);
				return false;
			}
			// if($scope.sales.items[i].uom == $scope.sales.items[i].stock_unit && $scope.sales.items[i].type == 'Stockable'){
			// 	if($scope.sales.items[i].quantity > $scope.sales.items[i].stock){
			// 		$scope.validate_sales_msg = "Out of Stock quantity in row " + (i+1);
			// 		return false;
			// 	}
			// } else if($scope.sales.items[i].uom == $scope.sales.items[i].purchase_unit && $scope.sales.items[i].type == 'Stockable'){
			// 	if($scope.sales.items[i].quantity*$scope.sales.items[i].relation > $scope.sales.items[i].stock){
			// 		$scope.validate_sales_msg = "Out of Stock in row " + (i+1);
			// 		return false;
			// 	}
			// }
		} return true;
	}
	$scope.calculate_amount = function(item){
		if (item.quantity != Number(item.quantity) || item.quantity == '') 
			item.quantity = 0
		if (item.current_item_price != Number(item.current_item_price) || item.current_item_price  == '')
			item.current_item_price = 0
		item.net_amount = parseFloat(item.quantity) * parseFloat(item.current_item_price)
		item.tax_exclusive_amount = item.net_amount;
		$scope.calculate_total_amount();
	}
	$scope.remove_item = function(item) {
		var index = $scope.sales.items.indexOf(item);
		$scope.sales.items.splice(index, 1);
		$scope.calculate_total_amount();
	}
	$scope.save_sales = function(){
		if($scope.validate_sales()){
			$scope.sales.invoice_date = $('#invoice_date').val();
			for(var i = 0; i < $scope.sales.items.length; i++){
				if($scope.sales.items[i].item_search == true)
					$scope.sales.items[i].item_search = "true";
				else
					$scope.sales.items[i].item_search = "false"
				if($scope.sales.items[i].net_freight_charge == null){
					$scope.sales.items[i].net_freight_charge = '';
					
				}
				if($scope.sales.items[i].net_cp == null){
					$scope.sales.items[i].net_cp = '';
				}
			if($scope.sales.customer_tin == null)
				$scope.sales.customer_tin = '';
			if($scope.sales.owner_tin == null)
				$scope.sales.owner_tin = '';
			if($scope.sales.do_no == null)
				$scope.sales.do_no = '';	
			}	
			params = {
				'sales_details': angular.toJson($scope.sales),
				'csrfmiddlewaretoken': $scope.csrf_token,
			}
			show_loader();
			$http({
				method: 'post',
				url: '/sales/receipt_to_invoice/',
				data: $.param(params),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).success(function(data){
				hide_loader();
				if(data.result == 'ok'){
					hide_sales_popup_divs($scope, $http);
					$scope.transaction_reference_no = data.transaction_reference_no;
					$scope.transaction_name = ' Sales ';
					hide_popup();
					$('#add_salesman_popup').css('display', 'none');
	    			$('#add_customer_popup').css('display', 'none');
					$('#transaction_reference_no_details').css('display', 'block');
					create_popup();
				} else {
					$scope.validate_sales_msg = data.message;
				}
			}).error(function(data, status){
				console.log('Request failed' || data);
			})
		}
	}
	$scope.search_customer = function(){
		if($scope.customer_name.length == 0){
			$scope.customers = "";
			$scope.no_customer_msg = "";
		} else {
			$scope.sales.customer = "";
			get_customer_search_list($scope, $http);
		}		
	}
	$scope.select_customer = function(customer){
		$scope.customer_name = customer.name;
		$scope.sales.customer = customer.id;
		$scope.customers = "";
		$scope.select_customer_flag = false;
		$scope.no_customer_msg = "";
		hide_sales_popup_divs();
		$scope.name = customer.name;
		// $scope.bonus_point = customer.bonus_point;
		// $('#view_bonus_amount').css('display', 'block');
		// create_popup();
	}
	$scope.new_customer = function(sales) {
		$scope.current_sales = sales;
	    $scope.customer= {
	        'name': '',
	        'area': '', 
	        'address': '',
	        'mobile': '',
	        'contact_number': '',
	        'email': '',
	    }
	    hide_sales_popup_divs();
	    $('#add_salesman_popup').css('display', 'none');
	    $('#add_customer_popup').css('display', 'block');
	    create_popup();
	}
	$scope.payment_mode_details = function(payment_mode) {
		hide_sales_popup_divs();
		$('#payment_details').css('display', 'block');
		$('#add_customer_popup').css('display', 'none');
		$('#add_salesman_popup').css('display', 'none');
		create_popup();
		if (payment_mode == 'cheque') {
			$scope.is_cheque_payment = true;
		} else if (payment_mode == 'card') {
			$scope.is_cheque_payment = false;
		} else {
			hide_sales_popup_divs();
		}
	}
	$scope.bank_account_details = function(payment_mode) {
		get_bank_account_details($scope, $http);
		$scope.sales.payment_mode = payment_mode;
		hide_sales_popup_divs();
		$('#bank_account_details').css('display', 'block');
		$('#add_customer_popup').css('display', 'none');
		$('#add_salesman_popup').css('display', 'none');
		$scope.other_bank_account = false;
		$scope.bank_account_error = '';
		$scope.bank_account = '';
		$scope.bank_account_name = '';
		if ($scope.sales.payment_mode == 'cheque') {
			$scope.is_cheque = true;
		} else {
			$scope.is_cheque = false;
		}
		create_popup();
	}
	$scope.hide_popup_payment_details = function() {
		$scope.sales.bank_name = $scope.bank_name;
		$scope.sales.branch = $scope.branch;
		$scope.sales.cheque_no = $scope.cheque_no;
		$scope.sales.card_no = $scope.card_no;
		$scope.sales.card_holder_name = $scope.card_holder_name;
		hide_popup();
	}
	$scope.add_bank_account_details = function() {
		if($scope.bank_account != ''){
			$scope.sales.bank_account_ledger = $scope.bank_account;
			$scope.payment_mode_details($scope.sales.payment_mode);
		}
	}
	$scope.hide_popup_transaction_details = function() {
		document.location.href = '/sales/edited_sales_entry/?transaction_ref_no='+$scope.transaction_reference_no;
	}
	$scope.create_new_bank_acount = function() {
		if ($scope.bank_account_name == '' || $scope.bank_account_name == undefined) {
			$scope.bank_account_error = 'Please enter the Bank account name';
		} else {
			create_new_bank_acount($scope, $http, 'sales');
		}
	}
}

function SalesReturnController($scope, $http){
	$scope.bank_account = '';
	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if ($scope.invoice_nos != undefined && $scope.invoice_nos.length > 0) {
			if($scope.focusIndex < $scope.invoice_nos.length-1){
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
		if ($scope.invoice_nos != undefined && $scope.invoice_nos.length > 0) {
			invoice_no = $scope.invoice_nos[index];
			$scope.select_invoice(invoice_no);
		} 
	}
	$scope.init = function(csrf_token){
		$scope.csrf_token = csrf_token;
		$scope.sales_invoice = '';
		$scope.items = [];
		$scope.sales_return = {
			'sales_id': '',
			'sales_invoice': '',
			'return_invoice': '',
			'return_invoice_date': '',
			'customer': '',
			'salesman': '',
			'payment_mode': 'cash',
			'bank_name': '',
			'branch': '',
			'cheque_no': '',
			'card_no': '',
			'card_holder_name': '',
			'bank_account_ledger': '',
			'cheque_date': '',
			'grant_total': 0,
			'discount': 0,
			'items': [],
			'return_balance': 0,
			'bill_type': '',
			'total_tax': 0,
		}
	}
	$scope.search_invoice = function(){
		if ($scope.sales_invoice.length > 0){
			$http.get('/sales/invoice_no_search/?sales_invoice='+$scope.sales_invoice).success(function(data){
	        $scope.invoice_nos = data.invoice_nos;
	        
		    }).error(function(data, status){
		        $scope.message = data.message;
		    })
		}
			
	}
	$scope.select_invoice = function(invoice_no){
		select_invoice_flag = false;
		$scope.sales_invoice = invoice_no.invoice_no;
		$scope.focusIndex = 0;
		$scope.invoice_nos = [];
		$scope.get_sales_details($scope,$http);
	}
	$scope.get_sales_details = function(){
		$scope.no_sales_message = '';
		$scope.sales_return = {
			'sales_id': '',
			'sales_invoice': '',
			'return_invoice': '',
			'return_invoice_date': '',
			'payment_mode': 'cash',
			'bank_name': '',
			'branch': '',
			'cheque_no': '',
			'card_no': '',
			'card_holder_name': '',
			'bank_account_ledger': '',
			'cheque_date': '',
			'customer': '',
			'salesman': '',
			'grant_total': 0,
			'discount': 0,
			'items': [],
			'return_balance': 0,
			'bill_type': '',
			'total_tax': 0,
		}
		if ($scope.sales_invoice.length > 0) {
			$http.get('/sales/sales_return_entry/?sales_invoice_no='+$scope.sales_invoice).success(function(data){
				if (data.result == 'ok') {
					if (data.sales_details.length == 0) {
						$scope.no_sales_message = 'No such Sales';
						$scope.sales_return.customer = '';
						$scope.sales_return.salesman = '';
					} else {
						$scope.items = data.sales_details[0].sales_items;
						$scope.sales_return.customer = data.sales_details[0].customer;
						$scope.sales_return.salesman = data.sales_details[0].salesman;
						$scope.sales_return.sales_id = data.sales_details[0].id;
						$scope.sales_return.sales_invoice = data.sales_details[0].sales_invoice;
						$scope.sales_return.grant_total = data.sales_details[0].grant_total;
						$scope.sales_return.discount = data.sales_details[0].discount;
						$scope.sales_return.return_balance = 0;
						$scope.sales_return.bill_type = data.sales_details[0].bill_type;
						$scope.sales_return.discount_percent = data.sales_details[0].discount_percent;
						for(var i = 0; i < $scope.items.length; i++){
							$scope.sales_return.items.push({
								'id': $scope.items[i].id,
								'name': $scope.items[i].item_name,
								'code': $scope.items[i].item_code,
								'type': $scope.items[i].type,
								'purchased_quantity': $scope.items[i].item_quantity,
								'uom': $scope.items[i].uom,
								'returned_qty': 0,
								'net_amount': $scope.items[i].net_amount,
								'balance': 0,
								'tax_on_sales': $scope.items[i].tax,
								'tax_on_return': 0,
								'price': parseFloat($scope.items[i].net_amount)/parseFloat($scope.items[i].item_quantity),
								'mrp': $scope.items[i].mrp,
								'return_history': $scope.items[i].returned_qty,
							})
						}
					}
				}
			}).error(function(data, status) {
				console.log('Request failed' || data);
			});
		}
	}
	$scope.hide_popup = function() {
		hide_popup();
	}
	$scope.payment_mode_details = function(payment_mode) {
		hide_sales_popup_divs();
		$('#payment_details').css('display', 'block');
		create_popup();
		if (payment_mode == 'cheque') {
			$scope.is_cheque_payment = true;
		} else if (payment_mode == 'card') {
			$scope.is_cheque_payment = false;
		} else {
			hide_sales_popup_divs();
		}
	}
	$scope.bank_account_details = function(payment_mode) {
		get_bank_account_details($scope, $http);
		$scope.sales_return.payment_mode = payment_mode;
		hide_sales_popup_divs();
		$('#bank_account_details').css('display', 'block');
		$scope.other_bank_account = false;
		$scope.bank_account_error = '';
		$scope.bank_account = '';
		$scope.bank_account_name = '';
		if ($scope.sales_return.payment_mode == 'cheque') {
			$scope.is_cheque = true;
		} else {
			$scope.is_cheque = false;
		}
		create_popup();
	}
	$scope.add_bank_account_details = function() {
		if($scope.bank_account != ''){
			$scope.sales_return.bank_account_ledger = $scope.bank_account;
			$scope.payment_mode_details($scope.sales_return.payment_mode);
		}
	}
	$scope.create_new_bank_acount = function() {
		if ($scope.bank_account_name == '' || $scope.bank_account_name == undefined) {
			$scope.bank_account_error = 'Please enter the Bank account name';
		} else {
			create_new_bank_acount($scope, $http, 'sales_return');
		}
	}
	$scope.hide_popup_payment_details = function() {
		$scope.sales_return.bank_name = $scope.bank_name;
		$scope.sales_return.branch = $scope.branch;
		$scope.sales_return.cheque_no = $scope.cheque_no;
		$scope.sales_return.card_no = $scope.card_no;
		$scope.sales_return.card_holder_name = $scope.card_holder_name;
		hide_popup();
	}
	$scope.calculate_balance = function(item){
		$scope.validate_sales_return_msg = "";
		if(item.returned_qty > (item.purchased_quantity - item.return_history)){
			$scope.validate_sales_return_msg = "Return Quantity exceeds Purchased Quantity"
		} else{
			if(item.returned_qty.length > 0){
				item.net_amount = parseFloat(item.price) * parseFloat(item.returned_qty);
				item.balance = (parseFloat(item.purchased_quantity) - parseFloat(item.returned_qty)) * parseFloat(item.price);
				item.tax_on_return = parseFloat(item.net_amount) - ((parseFloat(item.purchased_quantity) - parseFloat(item.returned_qty)) * parseFloat(item.mrp))
			} else if(item.returned_qty == ''){
				item.balance = 0;
				item.net_amount = parseFloat(item.purchased_quantity) * parseFloat(item.price);
			}
			$scope.calculate_total_amount();
		}
	}
	$scope.calculate_total_amount = function(){
		//$scope.sales_return.grant_total = 0;
		$scope.sales_return.return_balance = 0;
		$scope.sales_return.total_tax = 0;
		for(var i = 0; i < $scope.sales_return.items.length; i++){
			//$scope.sales_return.grant_total = parseFloat($scope.sales_return.grant_total) + parseFloat($scope.sales_return.items[i].net_amount);
			$scope.sales_return.return_balance = parseFloat($scope.sales_return.return_balance) + parseFloat($scope.sales_return.items[i].balance);
			$scope.sales_return.total_tax = parseFloat($scope.sales_return.total_tax) + parseFloat($scope.sales_return.items[i].tax_on_return);
		}
		$scope.sales_return.return_balance = parseFloat($scope.sales_return.return_balance) - (parseFloat($scope.sales_return.return_balance) * $scope.sales_return.discount_percent)
		$scope.sales_return.return_balance = Math.round($scope.sales_return.return_balance);
	/*	if($scope.sales_return.discount.length != 0 && Number($scope.sales_return.discount)){
			$scope.sales_return.grant_total = parseFloat($scope.sales_return.grant_total) - parseFloat($scope.sales_return.discount)
		}*/
	}
	$scope.validate_sales_return = function(){
		$scope.sales_return.return_invoice_date = $('#invoice_date').val();
		$scope.validate_sales_return_msg = "";
		if ($scope.sales_return.sales_invoice == '') {
			$scope.validate_sales_return_msg = 'Please enter the Sales Invoice No';
			return false;
		}else if ($scope.sales_return.return_invoice == '') {
			$scope.validate_sales_return_msg = 'Please enter the Return Invoice No';
			return false;
		} else if ($scope.sales_return.return_invoice_date == '') {
			$scope.validate_sales_return_msg = 'Please enter the Return Invoice Date';
			return false;
		}else if (($scope.sales_return.payment_mode == 'cheque' || $scope.sales_return.payment_mode == 'card') && ($scope.sales_return.bank_account_ledger == '' || $scope.sales_return.bank_account_ledger == undefined)) {
			$scope.validate_sales_return_msg = 'Please choose Bank Account Details';
			$scope.bank_account_details($scope.sales_return.payment_mode);
			return false;
		} else if (($scope.sales_return.payment_mode == 'card' || $scope.sales_return.payment_mode == 'cheque' ) && ($scope.sales_return.bank_name == '' || $scope.sales_return.bank_name == undefined)) {
			$scope.validate_sales_return_msg = 'Please enter bank name';
			$scope.payment_mode_details($scope.sales_return.payment_mode);
			return false;
		} else if (($scope.sales_return.payment_mode == 'card') && ($scope.sales_return.card_no == '' || $scope.sales_return.card_no == undefined)) {
			$scope.validate_sales_return_msg = 'Please enter Card No';
			$scope.payment_mode_details($scope.sales_return.payment_mode);
			return false;
		} else if (($scope.sales_return.payment_mode == 'card') && ($scope.sales_return.card_holder_name == '' || $scope.sales_return.card_holder_name == undefined)) {
			$scope.validate_sales_return_msg = 'Please enter Card Holder Name';
			$scope.payment_mode_details($scope.sales_return.payment_mode);
			return false;
		} else if (($scope.sales_return.payment_mode == 'cheque') && ($scope.sales_return.branch == '' || $scope.sales_return.branch == undefined)) {
			$scope.validate_sales_return_msg = 'Please enter Branch';
			$scope.payment_mode_details($scope.sales_return.payment_mode);
			return false;
		} else if (($scope.sales_return.payment_mode == 'cheque') && $scope.sales_return.cheque_date == '') {
			$scope.validate_sales_return_msg = 'Please choose Cheque Date';
			$scope.payment_mode_details($scope.sales_return.payment_mode);
			return false;
		} else if (($scope.sales_return.payment_mode == 'cheque') && ($scope.sales_return.cheque_no == '' || $scope.sales_return.cheque_no == undefined)) {
			$scope.validate_sales_return_msg = 'Please enter Cheque Number';
			$scope.payment_mode_details($scope.sales_return.payment_mode);
			return false;
		}
		for(var i = 0; i < $scope.sales_return.items.length; i++){
			if(Number($scope.sales_return.items[i].returned_qty) != 0 && !Number($scope.sales_return.items[i].returned_qty)){
				$scope.validate_sales_return_msg = 'Please enter a valid quantity in row ' + (i+1);
				return false;
			} else if($scope.sales_return.items[i].returned_qty > ($scope.sales_return.items[i].purchased_quantity - $scope.sales_return.items[i].return_history)){
				$scope.validate_sales_return_msg = "Return Quantity exceeds Purchased Quantity in row " + (i+1);
				return false;
			}
		} return true;
	}
	$scope.save_sales_return = function(){
		$scope.sales_return.return_invoice_date = $('#invoice_date').val();
		$scope.sales_return.cheque_date = $('#cheque_date').val();
		if($scope.validate_sales_return()){
			if($scope.sales_return.sales_invoice==null){
				$scope.sales_return.sales_invoice = '';
			}
			params = {
				'sales_return': angular.toJson($scope.sales_return),
				'csrfmiddlewaretoken': $scope.csrf_token,
			}
			show_loader();
			$http({
				method: 'post',
				url: '/sales/sales_return_entry/',
				data: $.param(params),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).success(function(data){
				hide_loader();
				if(data.result == 'ok'){
					hide_sales_popup_divs($scope, $http);
					$scope.transaction_reference_no = data.transaction_reference_no;
					$scope.transaction_name = ' Sales ';
					$('#transaction_reference_no_details').css('display', 'block');
					create_popup();
				} else {
					$scope.validate_sales_return_msg = data.message;
				}

			}).error(function(data, status){
				console.log('Request failed' || data);
			})
		}
	}
	$scope.hide_popup_transaction_details = function() {
		document.location.href = '/sales/sales_return_entry/';
	}
}
function SalesReturnViewController($scope, $http){
	$scope.init = function(csrf_token){
		$scope.csrf_token = csrf_token;
		$scope.ref_no = '';
		$scope.sales_view = {
			'do_no': '',
			'sales_invoice': '',
			'invoice_date': '',
			'salesman': '',
			'customer': '',
			'bill_type': '',
			'payment_mode': '',
	        'bank_name': '',
            'cheque_date': '',
            'cheque_number': '',
            'branch': '',
            'card_number': '',
            'card_holder_name': '',
			'items': {
				'name': '',
				'code': '',
				'batch': '',
				'item_quantity': '',
				'mrp': '',
				'tax': '',
				'net_amount': '',
			},
			'discount': '',
			'grant_total': '',
		}
	}
	$scope.get_sales_details = function(){
		if($scope.ref_no != ''){
			$http.get('/sales/sales_return_view/?ref_no='+$scope.ref_no).success(function(data) {
				if (data.result == 'ok') {
					$scope.sales_view = data.sales_view;
					$scope.sales_error_message = '';
					if($scope.sales_view.length == 0){
						$scope.sales_error_message = "No sales return found";
						$scope.sales_view = '';
					} 
				}		
				else{
					$scope.sales_error_message = "No sales return found";
					$scope.sales_view = '';
				}			
			}).error(function(data, status){
				console.log('Request failed' || data);
			});
		} else{
			$scope.sales_view = "";
		}
	}
	$scope.show_payment_details = function(){
		if ($scope.sales_view.payment_mode == 'cheque') {
			$scope.is_cheque = true;
		} else {
			$scope.is_cheque = false;
		}
		create_popup();
		$scope.bank_name = $scope.sales_view.bank_name;
		$scope.cheque_date = $scope.sales_view.cheque_date;
		$scope.cheque_number = $scope.sales_view.cheque_number;
		$scope.branch = $scope.sales_view.branch;
		$scope.card_number = $scope.sales_view.card_number;
		$scope.card_holder_name = $scope.sales_view.card_holder_name;
	}
	$scope.hide_popup = function() {
		hide_popup();
	}
	$scope.change_discount = function() {
		$scope.edit_discount = true;
		$scope.sales_view.new_discount = $scope.sales_view.discount;
	}
	$scope.save_sales = function() {
		balance = (parseFloat($scope.sales_view.grant_total) + parseFloat($scope.sales_view.roundoff)) - (parseFloat($scope.sales_view.discount) + parseFloat($scope.sales_view.round_off));
		if ($scope.sales_view.round_off != Number($scope.sales_view.round_off)) {
			$scope.sales_view.round_off = 0;
		}
		if (balance <= 0) {
			$scope.validate_sales_msg = 'Please check the New Discount with the Grant Total';
		} else {
			params = {
				'csrfmiddlewaretoken': $scope.csrf_token,
				'sales_id': $scope.sales_view.id,
				'round_off': $scope.sales_view.round_off,
			}
			$http({
				method: 'post',
				data: $.param(params),
				url: '/sales/change_sales_discount/',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).success(function(data){
				document.location.href = '/sales/sales_return_view/';
			}).error(function(data, status){
				console.log('Request failed' || data);
			});
		}
	}

}
function EstimateController($scope, $http){
	$scope.current_estimate_item = [];
	$scope.choosed_item = [];
	$scope.product_name = '';
	$scope.no_customer_msg = "";
	$scope.salesman_name = '';
	$scope.salesmen = '';
	$scope.customers = '';
	$scope.select_all_price_type = false;
	
	$scope.init = function(csrf_token){
		$scope.csrf_token = csrf_token;
		$scope.keyboard_control();
		$scope.estimate = {
			'estimate_no': '',
			'estimate_date': '',
			'discount': 0,
			'customer': '',
			'salesman': '',
			'grant_total': 0,
			'tax_exclusive_total': 0,
			'do_no': '',
			'items': [
				{
					'id': '',
		            'name': '',
		            'code': '',
		            'batch_name': '',
		            'batch_id': '',
		            'stock': '',
		            'stock_unit': '',
		            'selling_units':[],
		            'uom': '',
		            'quantity': '',
		            'net_amount': '',
		            'tax_exclusive_amount': '',
		            'mrp': '',
		            'current_item_price': '',
		            'selling_unit': '',
		            'purchase_unit': '',
		            'relation': '',
		            'price_type': 'Whole Sale Price',
		            'tax': '',
		        },
			],
			'quantity_choosed': '',
			'bill_type': 'NonTaxable',
		}
	}
	$scope.add_bulk_items = function (){
		for (var i=0; i<5; i++){
			$scope.estimate.items.push(
			{
				'id': '',
	            'name': '',
	            'code': '',
	            'batch_name': '',
	            'batch_id': '',
	            'stock': '',
	            'stock_unit': '',
	            'selling_units':[],
	            'uom': '',
	            'quantity': '',
	            'net_amount': '',
	            'tax_exclusive_amount': '',
	            'mrp': '',
	            'current_item_price': 0,
	            'selling_unit': '',
	            'purchase_unit': '',
	            'relation': '',
	            'price_type': 'Whole Sale Price',
	            'tax': '',
		    });
		}
	}
	$scope.keyboard_control = function(){
		$scope.focusIndex = 0;
		$scope.keys = [];
		$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});		
		$scope.keys.push({ code: 38, action: function() { 
			if($scope.focusIndex > 0){
				$scope.focusIndex--; 
			}
		}});
		$scope.keys.push({ code: 40, action: function() {
			if($scope.salesmen.length > 0){
				$scope.item_list = $scope.salesmen;
			}
			else if($scope.customers.length > 0){
				$scope.item_list = $scope.customers;
			}
			else if($scope.current_estimate_item.items.length > 0){
				$scope.item_list = $scope.current_estimate_item.items;
			}
			else if($scope.current_estimate_item.batches.length > 0){
				$scope.item_list = $scope.current_estimate_item.batches;
			}
			if($scope.focusIndex < $scope.item_list.length-1){
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
	}
	$scope.select_list_item = function(index) {
		if($scope.salesmen.length > 0){
			salesman = $scope.salesmen[index];
			$scope.select_salesman(salesman);
		} else if($scope.customers.length > 0){
			customer = $scope.customers[index];
			$scope.select_customer(customer);
		} else if($scope.current_estimate_item.items.length > 0){
			
			item = $scope.current_estimate_item.items[index];
			$scope.get_item_details(item);
		} else if($scope.current_estimate_item.batches != undefined){ 
			
			if($scope.current_estimate_item.batches.length > 0){
				
				batch = $scope.current_estimate_item.batches[index];
				$scope.select_batch(batch);
			}
		}
		
	}
	$scope.add_new_estimate_item = function(){
		$scope.estimate.items.push({
			'id': '',
			'name': '',
            'code': '',
            'batch_name': '',
            'batch_id': '',
            'stock': '',
            'stock_unit': '',
            'selling_units':[],
            'uom': '',
            'quantity': '',
            'net_amount': '',
            'tax_exclusive_amount': '',
            'mrp': '',
            'current_item_price': '',
            'selling_unit': '',
            'purchase_unit': '',
            'relation': '',
            'whole_sale_price': '',
			'retail_price': '',
			'price_type': 'Whole Sale Price',
			'tax': '',
		});
		$scope.selling_units = {
			'unit': '',
		}
	}
	$scope.search_items = function(item){
		$scope.current_estimate_item.item_search = true;
		$scope.current_estimate_item = item;
		$scope.current_estimate_item.code = "";
		$scope.current_estimate_item.id = "";
		$scope.current_estimate_item.batch = '';
		get_item_search_list($scope, $http,$scope.current_estimate_item.item_name,$scope.current_estimate_item.batch,'estimate');
	}
	$scope.get_item_details = function(item){
		$scope.current_estimate_item.item_name = item.name;
		$scope.current_estimate_item.id = item.id;
		
		$scope.current_estimate_item.code = item.code;
		$scope.current_estimate_item.items = [];
		$scope.current_estimate_item.item_search = false;
		$scope.current_estimate_item.type = item.type;
		if ($scope.current_estimate_item.type == 'Non Stockable') 
			get_conversions($scope, $http) 
	}
	$scope.search_salesman = function(){
		$scope.select_salesman_flag = true;
		if($scope.salesman_name.length == 0){
			$scope.salesmen = "";
			$scope.no_salesman_message = "";
		}
		else{
			$scope.estimate.salesman = "";
			search_salesmen($scope,$http);
		}	
	}
	$scope.select_salesman = function(salesman){
		$scope.salesman_name = salesman.name;
		$scope.estimate.salesman = salesman.id;
		$scope.salesmen = "";
		$scope.select_salesman_flag = false;
	}
	$scope.search_batch = function(item){
		if(item.id != ''){
			$scope.no_batch_msg = "";
			$scope.current_estimate_item = item;
			$scope.batch_name = item.batch_name;
			$scope.item = item.id;
			get_batch_search_details($scope, $http,'estimate');

		} else
			$scope.no_batch_msg = "Please choose an item";
	}
	$scope.select_batch = function(batch){
		$scope.no_batch_msg = '';
		$scope.current_estimate_item.batch_name = batch.name;
		$scope.current_estimate_item.batch_id = batch.id;
		$scope.batch_items_list = "";
		if ($scope.current_estimate_item.id) {
			$http.get('/inventory/batch_item_details/?batch_id='+$scope.current_estimate_item.batch_id+'&item_id='+$scope.current_estimate_item.id).success(function(data){
	        	$scope.current_estimate_item.batches = [];
	        	$scope.current_estimate_item.stock = data.batch_item.stock;
	        	$scope.current_estimate_item.stock_unit = data.batch_item.stock_unit;
	        	$scope.current_estimate_item.uoms = data.batch_item.uoms;
	        	$scope.current_estimate_item.wholesale_price = data.batch_item.whole_sale_price,
	            $scope.current_estimate_item.retail_price = data.batch_item.retail_price,
	            $scope.current_estimate_item.branch_price = data.batch_item.branch_price,
	            $scope.current_estimate_item.customer_card_price = data.batch_item.customer_card_price,
	        	$scope.current_estimate_item.price_type = 'Retail Price';
	        	$scope.current_estimate_item.mrp = data.batch_item.retail_price_sales;
	        	$scope.current_estimate_item.tax = data.batch_item.tax;
	        	console.log($scope.current_estimate_item)
		    }).error(function(data, status) {
		    	console.log('Request failed' || data);
		    });
		}
		$scope.current_estimate_item.batches = "";
	}
	$scope.new_salesman = function() {
		$scope.salesman = {
			'first_name': '',
			'last_name': '',
			'address': '',
			'contact_no': '',
			'email': '',
		}
	    hide_estimate_popup_divs();
	    $('#add_salesman_popup').css('display', 'block');
	    $('#add_customer_popup').css('display', 'none');
	    create_popup();
	}
	$scope.calculate_amount = function(item){
		if (item.quantity != Number(item.quantity) || item.quantity == '') 
			item.quantity = 0
		if (item.current_item_price != Number(item.current_item_price) || item.current_item_price  == '')
			item.current_item_price = 0
		item.net_amount = parseFloat(item.quantity) * parseFloat(item.current_item_price)
		item.tax_exclusive_amount = item.net_amount;
		$scope.calculate_total_amount();
	}
	$scope.save_salesman = function() {
		save_salesman($scope, $http, 'estimate');
	}
	$scope.hide_popup = function() {
        $scope.salesman = {
            'name': '',
            'address': '',
            'mobile': '',
            'telephone_number': '',
            'email': '',
        }
        $scope.validate_salesman_error_msg = "";
        $('#dialogue_popup_container').css('display', 'none');
        $('#popup_overlay').css('display', 'none');
    }
    $scope.search_customer = function(){
    	$scope.select_customer_flag = true;
		if($scope.customer_name.length == 0){
			$scope.customers = [];
			$scope.no_customer_msg = "";
		} else {
			$scope.estimate.customer = "";
			get_customer_search_list($scope, $http);
		}		
	}
	$scope.save_customer = function(){
		save_customer($scope, $http, 'estimate');	
		$scope.no_customer_msg = "";
	}
	$scope.select_customer = function(customer){
		$scope.select_customer_flag = false;
		$scope.customer_name = customer.name;
		$scope.estimate.customer = customer.id;
		$scope.customers = [];
		$scope.no_customer_msg = "";
		hide_sales_popup_divs();
		$scope.name = customer.name;
		// $scope.bonus_point = customer.bonus_point;
		// $('#view_bonus_amount').css('display', 'block');
		// create_popup();
	}
	$scope.new_customer = function() {
	    $scope.customer= {
	        'name': '',
	        'area': '', 
	        'address': '',
	        'mobile': '',
	        'contact_number': '',
	        'email': '',
	    }
	    hide_sales_popup_divs();
	    $('#add_salesman_popup').css('display', 'none');
	    $('#add_customer_popup').css('display', 'block');
	    create_popup();
	}
	
	$scope.change_bill_type = function(bill_type){
		for(var i = 0; i < $scope.estimate.items.length; i++){
			if($scope.estimate.items[i].uom != '' && $scope.estimate.items[i].quantity.length > 0){
				$scope.estimate.items[i].net_amount = parseFloat( $scope.estimate.items[i].quantity) * parseFloat($scope.estimate.items[i].current_item_price);
				$scope.estimate.items[i].tax_exclusive_amount = $scope.estimate.items[i].net_amount;
				if(bill_type == 'Taxable')
					$scope.estimate.items[i].net_amount = parseFloat($scope.estimate.items[i].net_amount) + (parseFloat($scope.estimate.items[i].net_amount) * parseFloat($scope.estimate.items[i].tax/100))	
			}
		}
		$scope.calculate_total_amount();
	}
	
	$scope.get_batch = function(item){
		$http.get('/inventory/batch_item_details/?batch_id='+item.batch_id+'&item_id='+item.id).success(function(data){
        	$scope.current_delivery_item = data.batch_item
        	console.log($scope.current_delivery_item);
        	item.price_type = 'Retail Price';
        	item.mrp = data.batch_item.retail_price_sales;
        	
	    }).error(function(data, status) {
	    	console.log('Request failed' || data);
	    });
	}
	$scope.calculate_quantity_from_uom = function(item){
		$scope.validate_sales_msg = "";
    	for(i=0; i<item.uoms.length; i++) {
    		if(item.uoms[i].uom == item.uom){
    			if(item.quantity > item.uoms[i].stock){
    				$scope.validate_sales_msg = "Quantity Out of Stock";
    			} else {
    				if(item.price_type == 'Whole Sale Price'){
    					console.log("Whole")
    					item.mrp = item.uoms[i].wholesale_price;
						item.net_amount = item.quantity*item.uoms[i].wholesale_price;
    				}
    					
    				if(item.price_type == 'Retail Price'){
    					item.mrp = item.uoms[i].retail_price;
    					item.net_amount = item.quantity*item.uoms[i].retail_price;
    				}
    					
    				if(item.price_type == 'Branch Price'){
    					item.mrp = item.uoms[i].branch_price;
    					item.net_amount = item.quantity*item.uoms[i].branch_price;
    				}
    					
    				if(item.price_type == 'Customer Card Price'){
    					item.mrp = item.uoms[i].customer_card_price;
    					item.net_amount = item.quantity*item.uoms[i].customer_card_price;
    				}
    			}
    		}
    	}    	
		item.tax_exclusive_amount = item.net_amount;
		if($scope.estimate.bill_type == 'Invoice')
			item.net_amount = parseFloat(item.net_amount) + (parseFloat(item.net_amount) * parseFloat(item.tax/100))

    	if($scope.estimate.bill_type == 'Invoice'){
			item.net_amount = parseFloat(item.net_amount) + (parseFloat(item.net_amount) * parseFloat(item.tax/100));
		}
    	item.current_item_price = item.mrp;
		$scope.calculate_total_amount();
	}
	$scope.calculate_total_amount = function(){
		$scope.estimate.grant_total = 0;
		$scope.estimate.tax_exclusive_total = 0;
		if ($scope.estimate.cess != Number($scope.estimate.cess)) {
			$scope.estimate.cess = 0;
		}
		for(var i = 0; i < $scope.estimate.items.length; i++){
			if(Number($scope.estimate.items[i].net_amount)){
				$scope.estimate.grant_total = parseFloat($scope.estimate.grant_total) + parseFloat($scope.estimate.items[i].net_amount);
				$scope.estimate.tax_exclusive_total = parseFloat($scope.estimate.tax_exclusive_total) + parseFloat($scope.estimate.items[i].tax_exclusive_amount);
			}
		}
		if($scope.estimate.discount.length != 0 && Number($scope.estimate.discount)){
			$scope.estimate.grant_total = parseFloat($scope.estimate.grant_total) - parseFloat($scope.estimate.discount)
			$scope.estimate.tax_exclusive_total = parseFloat($scope.estimate.tax_exclusive_total) - parseFloat($scope.estimate.discount)
		}
		if ($scope.estimate.round_off != Number($scope.estimate.round_off)) {
			$scope.estimate.round_off = 0;
		}
		if($scope.estimate.round_off.length != 0 && Number($scope.estimate.round_off)){
			$scope.estimate.grant_total = parseFloat($scope.estimate.grant_total) - parseFloat($scope.estimate.round_off)
			$scope.estimate.tax_exclusive_total = parseFloat($scope.estimate.tax_exclusive_total) - parseFloat($scope.estimate.round_off)
		}
		if($scope.estimate.cess.length != 0 && Number($scope.estimate.cess)){
			cess = parseFloat($scope.estimate.grant_total)*(parseFloat($scope.estimate.cess)/100);
			cess = cess.toFixed(2);
			$scope.estimate.grant_total = parseFloat($scope.estimate.grant_total) + parseFloat(cess);
		}
		$scope.estimate.grant_total = $scope.estimate.grant_total.toFixed(2);
	}
	$scope.validate_sales = function(){
		$scope.validate_sales_msg = "";
		if($scope.estimate.do_no == ""){
			$scope.validate_estimate_msg = "Please enter the DO No";
			return false;
		} else if($scope.no_customer_msg != ""){
			$scope.validate_estimate_msg = "Please select a valid customer or leave the field empty";
			return false;
		} else if (($scope.estimate.payment_mode == 'card' || $scope.estimate.payment_mode == 'cheque' ) && ($scope.estimate.bank_name == '' || $scope.estimate.bank_name == undefined)) {
			$scope.validate_estimate_msg = 'Please enter bank name';
			return false;
		} else if (($scope.estimate.payment_mode == 'card') && ($scope.estimate.card_no == '' || $scope.estimate.card_no == undefined)) {
			$scope.validate_estimate_msg = 'Please enter Card No';
			return false;
		} else if (($scope.estimate.payment_mode == 'card') && ($scope.estimate.card_holder_name == '' || $scope.estimate.card_holder_name == undefined)) {
			$scope.validate_estimate_msg = 'Please enter Card Holder Name';
			return false;
		} else if (($scope.estimate.payment_mode == 'cheque') && ($scope.estimate.branch == '' || $scope.estimate.branch == undefined)) {
			$scope.validate_estimate_msg = 'Please enter Branch';
			return false;
		} else if (($scope.estimate.payment_mode == 'cheque') && $scope.estimate.cheque_date == '') {
			$scope.validate_estimate_msg = 'Please choose Cheque Date';
			return false;
		} else if (($scope.estimate.payment_mode == 'cheque') && ($scope.estimate.cheque_no == '' || $scope.sales.cheque_no == undefined)) {
			$scope.validate_estimate_msg = 'Please choose Cheque Number';
			return false;
		} else if($scope.estimate.customer == '' && $scope.estimate.payment_mode == 'credit'){
			$scope.validate_estimate_msg = 'Please choose Customer';
			return false;
		} else if($scope.estimate.discount != Number($scope.estimate.discount)){
			$scope.validate_estimate_msg = 'Please choose a Number for discount';
			return false;
		}
		 for(var i = 0; i < $scope.estimate.items.length; i++){
			if ($scope.estimate.items[i].code == '') {
				$scope.validate_estimate_msg = 'Item code cannot be null in row' + (i+1);
				return false;
			} else if ($scope.estimate.items[i].item_name == '') {
				$scope.validate_estimate_msg = 'Item name cannot be null in row' + (i+1);
				return false;
			} else if ($scope.estimate.items[i].batch_id == '' && $scope.estimate.items[i].type == 'Stockable') {
				$scope.validate_estimate_msg = 'Please choose batch for the item in row '+ (i+1);
				return false;
			} else if ($scope.estimate.items[i].uom == '' && $scope.estimate.items[i].type != 'Services') {
				$scope.validate_estimate_msg = 'Please choose the unit of measurement in row '+ (i+1);
				return false;
			} else if ($scope.estimate.items[i].quantity == ''|| $scope.estimate.items[i].quantity == 0 ) {
				$scope.validate_estimate_msg = 'Please enter the quantity in row '+ (i+1);
				return false;
			} else if ($scope.estimate.items[i].stock == ''|| $scope.estimate.items[i].stock == 0 || $scope.estimate.items[i].stock == undefined) {
				$scope.validate_estimate_msg = 'There is no stock for the chooseen batch in row '+ (i+1);
				return false;
			}
			if(($scope.estimate.items[i].uom == $scope.estimate.items[i].stock_unit) && $scope.estimate.items[i].type == 'Stockable'){
				if($scope.estimate.items[i].quantity > $scope.estimate.items[i].stock){
					$scope.validate_estimate_msg = "Out of Stock quantity in row " + (i+1);
					return false;
				}
			} else if(($scope.estimate.items[i].uom == $scope.estimate.items[i].purchase_unit) && $scope.estimate.items[i].type == 'Stockable'){
				if($scope.estimate.items[i].quantity*$scope.estimate.items[i].relation > $scope.estimate.items[i].stock){
					$scope.validate_estimate_msg = "Out of Stock in row " + (i+1);
					return false;
				}
			}
		}
		 return true;
	}
	$scope.save_estimate = function(){
		if($scope.validate_sales()){
			$scope.estimate.estimate_date = $('#estimate_date').val();
			for(var i = 0; i < $scope.estimate.items.length; i++){
				if($scope.estimate.items[i].item_search == true)
					$scope.estimate.items[i].item_search = "true"
				else
					$scope.estimate.items[i].item_search = "false"
				if($scope.estimate.items[i].net_freight_charge == null)
					$scope.estimate.items[i].net_freight_charge = ''
			}	
			params = {
				'estimate_details': angular.toJson($scope.estimate),
				'csrfmiddlewaretoken': $scope.csrf_token,
			}
			show_loader();
			$http({
				method: 'post',
				url: '/sales/estimate_entry/',
				data: $.param(params),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).success(function(data){
				hide_loader();
				if(data.result == 'ok'){
					hide_estimate_popup_divs($scope, $http);
					document.location.href = '/sales/estimate_pdf/'+data.id+'/';
				} else {
					$scope.validate_estimate_msg = data.message;
				}
			}).error(function(data, status){
				console.log('Request failed' || data);
			})
		}
	}
	
	$scope.remove_item = function(item) {
		var index = $scope.estimate.items.indexOf(item);
		$scope.estimate.items.splice(index, 1);
		$scope.calculate_total_amount();
	}
	$scope.hide_popup_payment_details = function(){
		$scope.estimate.bank_name = $scope.bank_name;
		$scope.estimate.branch = $scope.branch;
		$scope.estimate.cheque_no = $scope.cheque_no;
		$scope.estimate.card_no = $scope.card_no;
		$scope.estimate.card_holder_name = $scope.card_holder_name;
		$scope.estimate.cheque_date = document.getElementById("cheque_date").value;
		hide_estimate_popup_divs();
	}
}
function DeliveryController($scope, $http){
	$scope.current_delivery_item = [];
	$scope.choosed_item = [];
	$scope.product_name = '';
	$scope.no_customer_msg = "";
	$scope.salesman_name = '';
	$scope.salesmen = '';
	$scope.customers = '';
	$scope.select_all_price_type = false;
	
	$scope.init = function(csrf_token){
		$scope.csrf_token = csrf_token;
		$scope.keyboard_control();
		$scope.delivery = {
			'deliverynote_no': '',
			'deliverynote_date': '',
			'discount': 0,
			'customer': '',
			'salesman': '',
			'grant_total': 0,
			'tax_exclusive_total': 0,
			'do_no': '',
			'items': [
				{
					'id': '',
		            'name': '',
		            'code': '',
		            'batch_name': '',
		            'batch_id': '',
		            'stock': '',
		            'stock_unit': '',
		            'selling_units':[],
		            'uom': '',
		            'quantity': '',
		            'net_amount': '',
		            'tax_exclusive_amount': '',
		            'mrp': '',
		            'current_item_price': '',
		            'selling_unit': '',
		            'purchase_unit': '',
		            'relation': '',
		            'price_type': 'Whole Sale Price',
		            'tax': '',
		        },
			],
			'quantity_choosed': '',
			'bill_type': 'NonTaxable',
		}
	}
	$scope.add_bulk_items = function (){
		for (var i=0; i<5; i++){
			$scope.delivery.items.push(
			{
				'id': '',
	            'name': '',
	            'code': '',
	            'batch_name': '',
	            'batch_id': '',
	            'stock': '',
	            'stock_unit': '',
	            'selling_units':[],
	            'uom': '',
	            'quantity': '',
	            'net_amount': '',
	            'tax_exclusive_amount': '',
	            'mrp': '',
	            'current_item_price': 0,
	            'selling_unit': '',
	            'purchase_unit': '',
	            'relation': '',
	            'price_type': 'Whole Sale Price',
	            'tax': '',
		    });
		}
	}
	$scope.keyboard_control = function(){
		$scope.focusIndex = 0;
		$scope.keys = [];
		$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});		
		$scope.keys.push({ code: 38, action: function() { 
			if($scope.focusIndex > 0){
				$scope.focusIndex--; 
			}
		}});
		$scope.keys.push({ code: 40, action: function() {
			if($scope.salesmen.length > 0){
				$scope.item_list = $scope.salesmen;
			}
			else if($scope.customers.length > 0){
				$scope.item_list = $scope.customers;
			}
			else if($scope.current_delivery_item.items.length > 0){
				$scope.item_list = $scope.current_delivery_item.items;
			}
			else if($scope.current_delivery_item.batches.length > 0){
				$scope.item_list = $scope.current_delivery_item.batches;
			}
			if($scope.focusIndex < $scope.item_list.length-1){
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
	}
	$scope.select_list_item = function(index) {
		if($scope.salesmen.length > 0){
			salesman = $scope.salesmen[index];
			$scope.select_salesman(salesman);
		} else if($scope.customers.length > 0){
			customer = $scope.customers[index];
			$scope.select_customer(customer);

		} else if($scope.current_delivery_item.items.length > 0){
			item = $scope.current_delivery_item.items[index];
			$scope.get_item_details(item);
		} else if($scope.current_delivery_item.batches != undefined){ 
			if($scope.current_delivery_item.batches.length > 0){
				batch = $scope.current_delivery_item.batches[index];
				$scope.select_batch(batch);
			}
		}
		
	}
	$scope.add_new_delivery_item = function(){
		$scope.delivery.items.push({
			'id': '',
			'name': '',
            'code': '',
            'batch_name': '',
            'batch_id': '',
            'stock': '',
            'stock_unit': '',
            'selling_units':[],
            'uom': '',
            'quantity': '',
            'net_amount': '',
            'tax_exclusive_amount': '',
            'mrp': '',
            'current_item_price': '',
            'selling_unit': '',
            'purchase_unit': '',
            'relation': '',
            'whole_sale_price': '',
			'retail_price': '',
			'price_type': 'Whole Sale Price',
			'tax': '',
		});
		$scope.selling_units = {
			'unit': '',
		}
	}
	$scope.search_items = function(item){
		$scope.current_delivery_item = item;
		$scope.current_delivery_item.code = "";
		$scope.current_delivery_item.id = "";
		$scope.current_delivery_item.batch = '';
		$scope.current_delivery_item.item_search = true;
		get_item_search_list($scope, $http,$scope.current_delivery_item.item_name,$scope.current_delivery_item.batch,'delivery');
	}
	$scope.get_item_details = function(item){

    	$scope.focusIndex = 0;
		$scope.current_delivery_item.item_name = item.name;
		$scope.current_delivery_item.id = item.id;
		$scope.current_delivery_item.code = item.code;
		$scope.current_delivery_item.items = []; //batch selection 
		$scope.current_delivery_item.item_search = false;
		$scope.current_delivery_item.type = item.type;
		if ($scope.current_delivery_item.type == 'Non Stockable') 
			get_conversions($scope, $http) 
	}
	$scope.search_salesman = function(){
		$scope.select_salesman_flag = true;
		if($scope.salesman_name.length == 0){
			$scope.salesmen = [];
			$scope.no_salesman_message = "";
		}
		else{
			$scope.delivery.salesman = "";
			search_salesmen($scope,$http);
		}	
	}
	$scope.select_salesman = function(salesman){
		$scope.focusIndex = 0
		$scope.salesman_name = salesman.name;
		$scope.delivery.salesman = salesman.id;
		$scope.salesmen = "";
		$scope.select_salesman_flag = false;
	}
	$scope.search_batch = function(item){
		if(item.id != ''){
			$scope.no_batch_msg = "";
			$scope.current_delivery_item = item;
			$scope.batch_name = item.batch_name;
			$scope.item = item.id;
			get_batch_search_details($scope, $http,'delivery');

		} else
			$scope.no_batch_msg = "Please choose an item";
		$scope.focusIndex = 0;
	}
	$scope.new_salesman = function() {
		$scope.salesman = {
			'first_name': '',
			'last_name': '',
			'address': '',
			'contact_no': '',
			'email': '',
		}
	    hide_delivery_popup_divs();
	    $('#add_salesman_popup').css('display', 'block');
	    $('#add_customer_popup').css('display', 'none');
	    create_popup();
	}
	$scope.calculate_amount = function(item){
		if (item.quantity != Number(item.quantity) || item.quantity == '') 
			item.quantity = 0
		if (item.current_item_price != Number(item.current_item_price) || item.current_item_price  == '')
			item.current_item_price = 0
		item.net_amount = parseFloat(item.quantity) * parseFloat(item.current_item_price)
		item.tax_exclusive_amount = item.net_amount;
		$scope.calculate_total_amount();
	}
	$scope.save_salesman = function() {
		save_salesman($scope, $http, 'delivery');
	}
	$scope.hide_popup = function() {
        $scope.salesman = {
            'name': '',
            'address': '',
            'mobile': '',
            'telephone_number': '',
            'email': '',
        }
        $scope.validate_salesman_error_msg = "";
        $('#dialogue_popup_container').css('display', 'none');
        $('#popup_overlay').css('display', 'none');
    }
    $scope.search_customer = function(){
    	$scope.select_customer_flag = true;
    	$scope.focusIndex = 0;
		if($scope.customer_name.length == 0){
			$scope.customers = [];
			$scope.no_customer_msg = "";

		} else {
			$scope.delivery.customer = "";
			get_customer_search_list($scope, $http);
		}		
	}
	$scope.save_customer = function(){
		save_customer($scope, $http, 'delivery');	
		$scope.no_customer_msg = "";
	}
	$scope.select_customer = function(customer){
		$scope.focusIndex = 0;
		$scope.customer_name = customer.name;
		$scope.delivery.customer = customer.id;
		$scope.customers = "";
		$scope.select_customer_flag = false;
		$scope.no_customer_msg = "";
		hide_sales_popup_divs();
		$scope.name = customer.name;


		
	}
	$scope.new_customer = function() {
	    $scope.customer= {
	        'name': '',
	        'area': '', 
	        'address': '',
	        'mobile': '',
	        'contact_number': '',
	        'email': '',
	    }
	    hide_sales_popup_divs();
	    $('#add_salesman_popup').css('display', 'none');
	    $('#add_customer_popup').css('display', 'block');
	    create_popup();
	}
	$scope.select_batch = function(batch){
		$scope.no_batch_msg = '';
		$scope.current_delivery_item.batch_name = batch.name;
		$scope.current_delivery_item.batch_id = batch.id;
		$scope.batch_items_list = "";
		if ($scope.current_delivery_item.id) {
			$http.get('/inventory/batch_item_details/?batch_id='+$scope.current_delivery_item.batch_id+'&item_id='+$scope.current_delivery_item.id).success(function(data){
	        	$scope.current_delivery_item.batches = [];
	        	$scope.current_delivery_item.stock = data.batch_item.stock;
	        	$scope.current_delivery_item.stock_unit = data.batch_item.stock_unit;
	        	$scope.current_delivery_item.uoms = data.batch_item.uoms;
	        	$scope.current_delivery_item.wholesale_price = data.batch_item.whole_sale_price,
	            $scope.current_delivery_item.retail_price = data.batch_item.retail_price,
	            $scope.current_delivery_item.branch_price = data.batch_item.branch_price,
	            $scope.current_delivery_item.customer_card_price = data.batch_item.customer_card_price,
	        	$scope.current_delivery_item.price_type = 'Retail Price';
	        	$scope.current_delivery_item.mrp = data.batch_item.retail_price_sales;
	        	$scope.current_delivery_item.tax = data.batch_item.tax;
	        	console.log($scope.current_delivery_item)
		    }).error(function(data, status) {
		    	console.log('Request failed' || data);
		    });
		}
		$scope.current_delivery_item.batches = "";
	}
	
	$scope.change_bill_type = function(bill_type){
		for(var i = 0; i < $scope.delivery.items.length; i++){
			if($scope.delivery.items[i].uom != '' && $scope.delivery.items[i].quantity.length > 0){
				$scope.delivery.items[i].net_amount = parseFloat( $scope.delivery.items[i].quantity) * parseFloat($scope.delivery.items[i].current_item_price);
				$scope.delivery.items[i].tax_exclusive_amount = $scope.delivery.items[i].net_amount;
				if(bill_type == 'Taxable')
					$scope.delivery.items[i].net_amount = parseFloat($scope.delivery.items[i].net_amount) + (parseFloat($scope.delivery.items[i].net_amount) * parseFloat($scope.delivery.items[i].tax/100))	
			}
		}
		$scope.calculate_total_amount();
	}
	
	$scope.get_batch = function(item){
		$http.get('/inventory/batch_item_details/?batch_id='+item.batch_id+'&item_id='+item.id).success(function(data){
        	$scope.current_delivery_item = data.batch_item
        	console.log($scope.current_delivery_item);
        	item.price_type = 'Retail Price';
        	item.mrp = data.batch_item.retail_price_sales;
        	
	    }).error(function(data, status) {
	    	console.log('Request failed' || data);
	    });
	}
	
	$scope.calculate_quantity_from_uom = function(item){
		$scope.validate_sales_msg = "";
    	for(i=0; i<item.uoms.length; i++) {
    		if(item.uoms[i].uom == item.uom){
    			if(item.quantity > item.uoms[i].stock){
    				$scope.validate_sales_msg = "Quantity Out of Stock";
    			} else {
    				if(item.price_type == 'Whole Sale Price'){
    					console.log("Whole")
    					item.mrp = item.uoms[i].wholesale_price;
						item.net_amount = item.quantity*item.uoms[i].wholesale_price;
    				}
    					
    				if(item.price_type == 'Retail Price'){
    					item.mrp = item.uoms[i].retail_price;
    					item.net_amount = item.quantity*item.uoms[i].retail_price;
    				}
    					
    				if(item.price_type == 'Branch Price'){
    					item.mrp = item.uoms[i].branch_price;
    					item.net_amount = item.quantity*item.uoms[i].branch_price;
    				}
    					
    				if(item.price_type == 'Customer Card Price'){
    					item.mrp = item.uoms[i].customer_card_price;
    					item.net_amount = item.quantity*item.uoms[i].customer_card_price;
    				}
    			}
    		}
    	}    	
		item.tax_exclusive_amount = item.net_amount;
		if($scope.delivery.bill_type == 'Invoice')
			item.net_amount = parseFloat(item.net_amount) + (parseFloat(item.net_amount) * parseFloat(item.tax/100))

    	if($scope.delivery.bill_type == 'Invoice'){
			item.net_amount = parseFloat(item.net_amount) + (parseFloat(item.net_amount) * parseFloat(item.tax/100));
		}
    	item.current_item_price = item.mrp;
		$scope.calculate_total_amount();
	}
	$scope.calculate_total_amount = function(){
		$scope.delivery.grant_total = 0;
		$scope.delivery.tax_exclusive_total = 0;
		if ($scope.delivery.cess != Number($scope.delivery.cess)) {
			$scope.delivery.cess = 0;
		}
		for(var i = 0; i < $scope.delivery.items.length; i++){
			if(Number($scope.delivery.items[i].net_amount)){
				$scope.delivery.grant_total = parseFloat($scope.delivery.grant_total) + parseFloat($scope.delivery.items[i].net_amount);
				$scope.delivery.tax_exclusive_total = parseFloat($scope.delivery.tax_exclusive_total) + parseFloat($scope.delivery.items[i].tax_exclusive_amount);
			}
		}
		if($scope.delivery.discount.length != 0 && Number($scope.delivery.discount)){
			$scope.delivery.grant_total = parseFloat($scope.delivery.grant_total) - parseFloat($scope.delivery.discount)
			$scope.delivery.tax_exclusive_total = parseFloat($scope.delivery.tax_exclusive_total) - parseFloat($scope.delivery.discount)
		}
		if ($scope.delivery.round_off != Number($scope.delivery.round_off)) {
			$scope.delivery.round_off = 0;
		}
		if($scope.delivery.round_off.length != 0 && Number($scope.delivery.round_off)){
			$scope.delivery.grant_total = parseFloat($scope.delivery.grant_total) - parseFloat($scope.delivery.round_off)
			$scope.delivery.tax_exclusive_total = parseFloat($scope.delivery.tax_exclusive_total) - parseFloat($scope.delivery.round_off)
		}
		if($scope.delivery.cess.length != 0 && Number($scope.delivery.cess)){
			cess = parseFloat($scope.delivery.grant_total)*(parseFloat($scope.delivery.cess)/100);
			cess = cess.toFixed(2);
			$scope.delivery.grant_total = parseFloat($scope.delivery.grant_total) + parseFloat(cess);
		}
		$scope.delivery.grant_total = $scope.delivery.grant_total.toFixed(2);
	}

	$scope.validate_sales = function(){
		$scope.validate_sales_msg = "";
		if($scope.delivery.do_no == ""){
			$scope.validate_delivery_msg = "Please enter the DO No";
			return false;
		} else if($scope.delivery.deliverynote_no == ""){
			$scope.validate_delivery_msg = "Please provide the Delivery Note No";
			return false;
		} else if($scope.no_customer_msg != ""){
			$scope.validate_delivery_msg = "Please select a valid customer or leave the field empty";
			return false;
		} else if (($scope.delivery.payment_mode == 'card' || $scope.delivery.payment_mode == 'cheque' ) && ($scope.delivery.bank_name == '' || $scope.delivery.bank_name == undefined)) {
			$scope.validate_delivery_msg = 'Please enter bank name';
			return false;
		} else if (($scope.delivery.payment_mode == 'card') && ($scope.delivery.card_no == '' || $scope.delivery.card_no == undefined)) {
			$scope.validate_delivery_msg = 'Please enter Card No';
			return false;
		} else if (($scope.delivery.payment_mode == 'card') && ($scope.delivery.card_holder_name == '' || $scope.delivery.card_holder_name == undefined)) {
			$scope.validate_delivery_msg = 'Please enter Card Holder Name';
			return false;
		} else if (($scope.delivery.payment_mode == 'cheque') && ($scope.delivery.branch == '' || $scope.delivery.branch == undefined)) {
			$scope.validate_delivery_msg = 'Please enter Branch';
			return false;
		} else if (($scope.delivery.payment_mode == 'cheque') && $scope.delivery.cheque_date == '') {
			$scope.validate_delivery_msg = 'Please choose Cheque Date';
			return false;
		} else if (($scope.delivery.payment_mode == 'cheque') && ($scope.delivery.cheque_no == '' || $scope.sales.cheque_no == undefined)) {
			$scope.validate_delivery_msg = 'Please choose Cheque Number';
			return false;
		} else if($scope.delivery.customer == '' && $scope.delivery.payment_mode == 'credit'){
			$scope.validate_estimate_msg = 'Please choose Customer';
			return false;
		} else if($scope.delivery.discount != Number($scope.delivery.discount)){

			$scope.validate_delivery_msg = 'Please choose a Number for discount';
			return false;
		} for(var i = 0; i < $scope.delivery.items.length; i++){
			if ($scope.delivery.items[i].code == '') {
				$scope.validate_delivery_msg = 'Item code cannot be null in row' + (i+1);
				return false;
			} else if ($scope.delivery.items[i].item_name == '') {
				$scope.validate_delivery_msg = 'Item name cannot be null in row' + (i+1);
				return false;
			} else if ($scope.delivery.items[i].batch_id == '' && $scope.delivery.items[i].type == 'Stockable') {
				$scope.validate_delivery_msg = 'Please choose batch for the item in row '+ (i+1);
				return false;
			} else if ($scope.delivery.items[i].uom == '' && $scope.delivery.items[i].type != 'Services') {
				$scope.validate_delivery_msg = 'Please choose the unit of measurement in row '+ (i+1);
				return false;
			} else if ($scope.delivery.items[i].quantity == '') {
				$scope.validate_delivery_msg = 'Please enter the quantity in row '+ (i+1);
				return false;
			} else if($scope.delivery.items[i].quantity <=0) {
				$scope.validate_delivery_msg = 'Please provide quantity above 0 in row'+ (i+1);
				return false;
			} else if ($scope.delivery.items[i].stock == ''|| $scope.delivery.items[i].stock == 0 || $scope.delivery.items[i].stock == undefined) {
				$scope.validate_delivery_msg = 'There is no stock for the chooseen batch in row '+ (i+1);
				return false;
			}
			if(($scope.delivery.items[i].uom == $scope.delivery.items[i].stock_unit) && $scope.delivery.items[i].type == 'Stockable'){
				
				if($scope.delivery.items[i].quantity > $scope.delivery.items[i].stock){
					$scope.validate_delivery_msg = "Out of Stock quantity in row " + (i+1);
					return false;
				}
			} else if(($scope.delivery.items[i].uom == $scope.delivery.items[i].purchase_unit) && $scope.delivery.items[i].type == 'Stockable'){
				if($scope.delivery.items[i].quantity*$scope.delivery.items[i].relation > $scope.delivery.items[i].stock){
					$scope.validate_delivery_msg = "Out of Stock in row " + (i+1);
					return false;
				}
			}
		} return true;
	}
	$scope.save_delivery = function(){
		//console.log(deliverynote_date);
		if($scope.validate_sales()){

			$scope.delivery.deliverynote_date = $('#deliverynote_date').val();
			for(var i = 0; i < $scope.delivery.items.length; i++){
				
				if($scope.delivery.items[i].item_search == true)
					$scope.delivery.items[i].item_search = "true"
				else
					$scope.delivery.items[i].item_search = "false"
				if($scope.delivery.items[i].net_freight_charge == null)
					$scope.delivery.items[i].net_freight_charge = ''
			}	
			params = {
				'delivery_details': angular.toJson($scope.delivery),
				'csrfmiddlewaretoken': $scope.csrf_token,
			}
			show_loader();
			$http({
				method: 'post',
				url: '/sales/deliverynote_entry/',
				data: $.param(params),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).success(function(data){
				hide_loader();
				//alert('hiiiiiii');
				if(data.result == 'ok'){

					hide_delivery_popup_divs($scope, $http);
					document.location.href = '/sales/deliverynote_pdf/'+data.id+'/';
				} else {
					$scope.validate_delivery_msg = data.message;
				}
			}).error(function(data, status){
				console.log('Request failed' || data);
			})
		}
	}
	
	$scope.remove_item = function(item) {
		var index = $scope.delivery.items.indexOf(item);
		$scope.delivery.items.splice(index, 1);
		$scope.calculate_total_amount();
	}
	$scope.hide_popup_payment_details = function(){
		$scope.delivery.bank_name = $scope.bank_name;
		$scope.delivery.branch = $scope.branch;
		$scope.delivery.cheque_no = $scope.cheque_no;
		$scope.delivery.card_no = $scope.card_no;
		$scope.delivery.card_holder_name = $scope.card_holder_name;
		$scope.delivery.cheque_date = document.getElementById("cheque_date").value;
		hide_delivery_popup_divs();
	}
}
function EstimateViewController($scope, $http) {
	$scope.estimate_no = '';
	$scope.estimate = {
			'estimate_id': '',
			'estimate_no': '',
			'estimate_date': '',
			'discount': 0,
			'customer': '',
			'salesman': '',
			'grant_total': 0,
			'tax_exclusive_total': 0,
			'do_no': '',
			'items': [
				{
					'id': '',
		            'name': '',
		            'code': '',
		            'batch_name': '',
		            'batch_id': '',
		            'stock': '',
		            'stock_unit': '',
		            'selling_units':[],
		            'uom': '',
		            'quantity': '',
		            'net_amount': '',
		            'tax_exclusive_amount': '',
		            'mrp': '',
		            'current_item_price': '',
		            'selling_unit': '',
		            'purchase_unit': '',
		            'relation': '',
		            'price_type': '',
		            'tax': '',
		        },
			],
			'quantity_choosed': '',
			'bill_type': 'NonTaxable',
		}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.get_estimate_details = function() {
		if(!$scope.estimate_no == ''){
			$http.get('/sales/estimate_view/?estimate_no='+$scope.estimate_no).success(function(data) {
				$scope.estimate_error_message = '';
				if (data.result == 'ok') {
					$scope.estimate = data.estimate;
					$scope.estimate_id = data.estimate.id;
					
				} else {
					$scope.estimate_error_message = data.message;
					$scope.estimate = '';
					$scope.estimate_id = '';
				}
			}).error(function(data, status){
				console.log('Request failed' || data);
			});
		}
	}
	$scope.print_estimate = function(estimate_id){
		$scope.estimate_id = estimate_id;
		$scope.estimate_error_message = '';
		if ($scope.estimate_id == '' || $scope.estimate_id == undefined) {
			$scope.estimate_error_message = 'Please enter Estimate No.';
		} else{
			document.location.href = '/sales/estimate_pdf/'+$scope.estimate_id+'/';
		}
	}
}
function DeliverynoteViewController($scope, $http) {
	$scope.deliverynote_no = '';
	$scope.delivery = {
			'delivery_id': '',
			'deliverynote_no': '',
			'deliverynote_date': '',
			'discount': 0,
			'customer': '',
			'salesman': '',
			'grant_total': 0,
			'tax_exclusive_total': 0,
			'do_no': '',
			'items': [
				{
					'id': '',
		            'name': '',
		            'code': '',
		            'batch_name': '',
		            'batch_id': '',
		            'stock': '',
		            'stock_unit': '',
		            'selling_units':[],
		            'uom': '',
		            'quantity': '',
		            'net_amount': '',
		            'tax_exclusive_amount': '',
		            'mrp': '',
		            'current_item_price': '',
		            'selling_unit': '',
		            'purchase_unit': '',
		            'relation': '',
		            'price_type': '',
		            'tax': '',
		        },
			],
			'quantity_choosed': '',
			'bill_type': 'NonTaxable',
		}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.get_deliverynote_details = function() {
		if(!$scope.deliverynote_no == ''){
			$scope.delivery = {};
			$http.get('/sales/deliverynote_view/?deliverynote_no='+$scope.deliverynote_no).success(function(data) {
				$scope.delivery_error_message = '';
				if (data.result == 'ok') {
					$scope.delivery = data.delivery;
					$scope.delivery_id = data.delivery.id;
					
				} else {
					$scope.delivery_error_message = data.message;
					$scope.delivery = {};
					$scope.delivery_id = '';
				}
			}).error(function(data, status){
				console.log('Request failed' || data);
			});
		}
	}
	$scope.print_delivery = function(delivery_id){
		$scope.delivery_id = delivery_id;
		$scope.delivery_error_message = '';
		if ($scope.delivery_id == '' || $scope.delivery_id == undefined) {
			$scope.delivery_error_message = 'Please enter DeliveryNote No.';
		} else{
			document.location.href = '/sales/deliverynote_pdf/'+$scope.delivery_id+'/';
		}
	}
}

function SalesReportController($scope, $http) {
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.generate_report = function(type) {
		var start_date = $('#start_date').val();
		var end_date = $('#end_date').val();
		if (start_date == '' || start_date == undefined) {
			$scope.report_mesg = 'Please Choose start date';
		} else if (end_date == '' || end_date == undefined) {
			$scope.report_mesg = 'Please Choose end date';
		} else {
			if (type == 'view') { 
				$http.get('/sales/sales_report/?start_date='+start_date+'&end_date='+end_date).success(function(data){
					$scope.sales_details = data.sales_details;
					paginate($scope.sales_details, $scope, 15);
					if ($scope.sales_details.length == 0)
						$scope.report_mesg = 'No sales found'					
				}).error(function(data, status){
				});
			} else
				document.location.href = '/sales/sales_report/?start_date='+start_date+'&end_date='+end_date;
		}

	}
	$scope.select_page = function(page){
        select_page(page, $scope.sales_details, $scope, 15);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
}
function CustomerWiseSalesReportController($scope,$http){
	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if ($scope.customers != undefined && $scope.customers.length > 0) {
			if($scope.focusIndex < $scope.customers.length-1){
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
		if ($scope.customers != undefined && $scope.customers.length > 0) {
			customer = $scope.customers[index];
			$scope.select_customer(customer);
		} 
	}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.search_customer = function(){
		$scope.customer = '';
		if ($scope.customer_name.length > 0)
			get_customer_search_list($scope, $http);
	}
	$scope.select_customer = function(customer){
		$scope.customer = customer.id;
		$scope.customers = [];
		$scope.customer_name = customer.name;
		$scope.focusIndex = 0;
	}
	$scope.generate_customer_report = function(type){
		$scope.report_mesg = '';
		if ($scope.customer == '' || $scope.customer == undefined) {
			$scope.report_mesg = 'Please Choose customer';
		} else {
			if (type == 'view') { 
				show_loader();
				$http.get('/sales/sales_report_customer_wise/?customer_id='+$scope.customer).success(function(data){
					$scope.sales = data.sales_details;
					if ($scope.sales.length == 0)
						$scope.report_mesg = 'No Sales';
					else{
						paginate($scope.sales, $scope, 15);
					}
					hide_loader();
				}).error(function(data, status){
					console.log(data);
				});
			} else
				document.location.href = '/sales/sales_report_customer_wise/?customer_id='+$scope.customer;
		}
	}
	$scope.select_page = function(page){
        select_page(page, $scope.sales, $scope, 15);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
}
function SalesReturnReportController($scope, $http) {
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.generate_report = function(type) {
		var start_date = $('#start_date').val();
		var end_date = $('#end_date').val();
		if (start_date == '' || start_date == undefined) {
			$scope.report_mesg = 'Please Choose start date';
		} else if (end_date == '' || end_date == undefined) {
			$scope.report_mesg = 'Please Choose end date';
		} else {
			if (type == 'view') { 
				$http.get('/sales/sales_return_report/?start_date='+start_date+'&end_date='+end_date).success(function(data){
					$scope.sales_details = data.sales_details;
					paginate($scope.sales_details, $scope, 10);
					if ($scope.sales_details.length == 0)
						$scope.report_mesg = 'No sales found'
				}).error(function(data, status){
					console.log(data);
				});
			} else
				document.location.href = '/sales/sales_return_report/?start_date='+start_date+'&end_date='+end_date;
		}
	}
	$scope.select_page = function(page){
        select_page(page, $scope.sales_details, $scope, 10);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
}
function CustomerWiseSalesReturnReportController($scope,$http){
	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if ($scope.customers != undefined && $scope.customers.length > 0) {
			if($scope.focusIndex < $scope.customers.length-1){
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
		if ($scope.customers != undefined && $scope.customers.length > 0) {
			customer = $scope.customers[index];
			$scope.select_customer(customer);
		} 
	}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.search_customer = function(){
		$scope.customer = '';
		if ($scope.customer_name.length > 0)
			get_customer_search_list($scope, $http);
	}
	$scope.select_customer = function(customer){
		$scope.customer = customer.id;
		$scope.customers = [];
		$scope.customer_name = customer.name;
		$scope.focusIndex = 0;
	}
	$scope.generate_customer_report = function(type){
		$scope.report_mesg = '';
		if ($scope.customer == '' || $scope.customer == undefined) {
			$scope.report_mesg = 'Please Choose customer';
		} else {
			if (type == 'view') { 
				show_loader();
				$http.get('/sales/sales_return_customer_wise/?customer_id='+$scope.customer).success(function(data){
					$scope.sales = data.sales_details;
					if ($scope.sales.length == 0)
						$scope.report_mesg = 'No Sales';
					else
						paginate($scope.sales, $scope, 15);
					hide_loader();
				}).error(function(data, status){
					console.log(data);
				});
			} else
				document.location.href = '/sales/sales_return_customer_wise/?customer_id='+$scope.customer;
		}
	}
	$scope.select_page = function(page){
        select_page(page, $scope.sales, $scope, 15);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
}
function BrandWiseSalesReportController($scope,$http){
	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if ($scope.brands != undefined && $scope.brands.length > 0) {
			if($scope.focusIndex < $scope.brands.length-1){
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
		if ($scope.brands != undefined && $scope.brands.length > 0) {
			brand = $scope.brands[index];
			$scope.select_brand_details(brand);
		} 
	}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.get_brands = function() {
        $scope.select_brand_flag = true;
        get_brand_search_list($scope, $http);
    }
    $scope.select_brand_details = function(brand) {
        $scope.focusIndex = 0;
        $scope.select_brand_flag = false;
        $scope.brand = brand.id;
        $scope.brand_name = brand.name;
        $scope.brands = [];
    }
	$scope.generate_brand_report = function(type){
		$scope.report_mesg = '';
		if ($scope.brand == '' || $scope.brand == undefined) {
			$scope.report_mesg = 'Please Choose brand';
		} else {
			if (type == 'view') { 
				show_loader();
				$http.get('/sales/sales_report_brand_wise/?brand_id='+$scope.brand).success(function(data){
					$scope.sales = data.sales_details;
					if ($scope.sales.length == 0)
						$scope.report_mesg = 'No Sales';
					else{
						paginate($scope.sales, $scope, 15);
					}
					hide_loader();
				}).error(function(data, status){
					console.log(data);
				});
			} else
				document.location.href = '/sales/sales_report_brand_wise/?brand_id='+$scope.brand;
		}
	}
	$scope.select_page = function(page){
        select_page(page, $scope.sales, $scope, 15);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
}
function CategoryWiseSalesReportController($scope,$http){
	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if ($scope.categories != undefined && $scope.categories.length > 0) {
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
		if ($scope.categories != undefined && $scope.categories.length > 0) {
			category = $scope.categories[index];
			$scope.select_brand_details(category);
		} 
	}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.get_category_list = function() {
        $scope.category = '';
        if ($scope.category_name.length > 0){
            search_category($scope, $http, $scope.category_name);
        }
    }
    $scope.select_category = function(category) {
        $scope.focusIndex = 0;
        $scope.category = category.id;
        $scope.category_name = category.name;
        $scope.categories = [];
    }
	$scope.generate_category_report = function(type){
		$scope.report_mesg = '';
		if ($scope.category == '' || $scope.category == undefined) {
			$scope.report_mesg = 'Please Choose category';
		} else {
			if (type == 'view') { 
				show_loader();
				$http.get('/sales/sales_report_category_wise/?category_id='+$scope.category).success(function(data){
					$scope.sales = data.sales_details;
					if ($scope.sales.length == 0)
						$scope.report_mesg = 'No Sales';
					else{
						paginate($scope.sales, $scope, 15);
					}
					hide_loader();
				}).error(function(data, status){
					console.log(data);
				});
			} else
				document.location.href = '/sales/sales_report_category_wise/?category_id='+$scope.category;
		}
	}
	$scope.select_page = function(page){
        select_page(page, $scope.sales, $scope, 15);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
}
function VendorWiseSalesReportController($scope,$http){
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
			suppliersupplier = $scope.suppliers[index];
			$scope.select_brand_details(suppliersupplier);
		} 
	}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.search_supplier = function() {
		$scope.select_supplier_flag = true;
		$scope.supplier = '';
		search_supplier($scope, $http);
	}
	$scope.select_supplier = function(supplier) {
		$scope.supplier = supplier.id;
		$scope.suppliers = [];
		$scope.supplier_name = supplier.name;
		$scope.select_supplier_flag = false;
		$scope.focusIndex = 0;
	}
	$scope.generate_supplier_report = function(type){
		$scope.report_mesg = '';
		if ($scope.supplier == '' || $scope.supplier == undefined) {
			$scope.report_mesg = 'Please Choose supplier';
		} else {
			if (type == 'view') { 
				show_loader();
				$http.get('/sales/sales_report_vendor_wise/?supplier_id='+$scope.supplier).success(function(data){
					$scope.sales = data.sales_details;
					if ($scope.sales.length == 0)
						$scope.report_mesg = 'No Sales';
					else{
						paginate($scope.sales, $scope, 15);
					}
					hide_loader();
				}).error(function(data, status){
					console.log(data);
				});
			} else
				document.location.href = '/sales/sales_report_vendor_wise/?supplier_id='+$scope.supplier;
		}
	}
	$scope.select_page = function(page){
        select_page(page, $scope.sales, $scope, 15);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
}

function ItemWiseSalesReportController($scope,$http){
	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if ($scope.items != undefined && $scope.items.length > 0) {
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
		if ($scope.items != undefined && $scope.items.length > 0) {
			item = $scope.items[index];
			$scope.select_brand_details(item);
		} 
	}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.search_sales_items = function(){
		item_search = true;
		$scope.no_item_msg = '';
		$scope.items = [];
		if($scope.search_item_name.length > 0)
			get_item_search_list($scope, $http);
	}
	$scope.get_item_details = function(item){
		$scope.item_search = false;
		$scope.search_item_name = item.name;
		$scope.item = item.id;
		
	}
	$scope.generate_item_report = function(type){
		$scope.report_mesg = '';
		if ($scope.item == '' || $scope.item == undefined) {
			$scope.report_mesg = 'Please Choose item';
		} else {
			if (type == 'view') { 
				show_loader();
				$http.get('/sales/sales_report_item_wise/?item_id='+$scope.item).success(function(data){
					$scope.sales = data.sales_details;
					if ($scope.sales.length == 0)
						$scope.report_mesg = 'No Sales';
					else{
						paginate($scope.sales, $scope, 15);
					}
					hide_loader();
				}).error(function(data, status){
					console.log(data);
				});
			} else
				document.location.href = '/sales/sales_report_item_wise/?item_id='+$scope.item;
		}
	}
	$scope.select_page = function(page){
        select_page(page, $scope.sales, $scope, 15);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
}
function TaxWiseSalesReportController($scope,$http){
	$scope.sales = [];
	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if ($scope.vat_list != undefined && $scope.vat_list.length > 0) {
			if($scope.focusIndex < $scope.vat_list.length-1){
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
		if ($scope.vat_list != undefined && $scope.vat_list.length > 0) {
			vat = $scope.vat_list[index];
			$scope.select_vat_details(vat);
		} 
	}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.get_vat_list = function() {
        $scope.selected_vat_flag = true;
        get_vat_search_details($scope, $http);
    }
    $scope.select_vat_details = function(vat) {
        $scope.focusIndex = 0;
        $scope.selected_vat_flag = false;
        $scope.vat = vat.id;
        $scope.vat_type = vat.vat_name;
        $scope.vat_list = [];
    }
	$scope.generate_tax_report = function(type){
		$scope.report_mesg = '';
		if ($scope.vat_type == '' || $scope.vat_type == undefined || $scope.vat_type == 'all'|| $scope.vat_type == 'All' ) {
			document.location.href = '/sales/sales_report_tax/?all='+'all';
		} else {
			if (type == 'view') { 
				show_loader();
				$http.get('/sales/sales_report_tax/?vat='+$scope.vat).success(function(data){
					$scope.sales = data.sales_details;

					if ($scope.sales.length == 0)
						$scope.report_mesg = 'No Sales';
					else{
						paginate($scope.sales, $scope, 15);
					}
					hide_loader();
				}).error(function(data, status){
					console.log(data);
				});
			} else
				document.location.href = '/sales/sales_report_tax/?vat='+$scope.vat;
		}
	}
	$scope.select_page = function(page){
        select_page(page, $scope.sales, $scope, 15);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
}
function AreaWiseSalesReportController($scope,$http){
	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if ($scope.areas != undefined && $scope.areas.length > 0) {
			if($scope.focusIndex < $scope.areas.length-1){
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
		if ($scope.areas != undefined && $scope.areas.length > 0) {
			area = $scope.areas[index];
			$scope.select_area(area);
		} 
	}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.search_area = function(){
		if ($scope.area.length > 0)
			get_area_search_list($scope, $http);
	}
	$scope.select_area = function(area){
		$scope.areas = [];
		$scope.area = area.area;
		$scope.focusIndex = 0;
	}
	$scope.generate_area_report = function(type){
		$scope.report_mesg = '';
		if ($scope.area == '' || $scope.area == undefined) {
			document.location.href = '/sales/sales_report_area_customer_wise/?no_area='+'no_area';
		} else {
			if (type == 'view') { 
				show_loader();
				$http.get('/sales/sales_report_area_customer_wise/?area='+$scope.area).success(function(data){
					$scope.sales = data.sales_details;
					if ($scope.sales.length == 0)
						$scope.report_mesg = 'No Sales';
					else{
						paginate($scope.sales, $scope, 15);
					}
					hide_loader();
				}).error(function(data, status){
					console.log(data);
				});
			} else
				document.location.href = '/sales/sales_report_area_customer_wise/?area='+$scope.area;
		}
	}
	$scope.select_page = function(page){
        select_page(page, $scope.sales, $scope, 15);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
}
function DeliveryNoteSalesController($scope, $http){
	$scope.current_sales_item = [];
	$scope.choosed_item = [];
	$scope.product_name = '';
	$scope.no_customer_msg = "";
	$scope.select_all_price_type = false;
	$scope.bank_account = '';
	$scope.salesman_name = '';
	$scope.salesmen = '';
	$scope.customers = '';
	$scope.delivery_note_no = '';
	$scope.init = function(csrf_token){
		$scope.csrf_token = csrf_token;
		$scope.keyboard_control();
		$scope.sales = {
			'invoice_no': '',
			'invoice_date': '',
			'discount': 0,
			'payment_mode': 'cash',
			'customer': '',
			'salesman': '',
			'customer_tin': '',
			'owner_tin': '',
			'grant_total': 0,
			'tax_exclusive_total': 0,
			'do_no': '',
			'items': [
				{
					'id': '',
		            'name': '',
		            'code': '',
		            'batch_name': '',
		            'batch_id': '',
		            'stock': '',
		            'stock_unit': '',
		            'selling_units':[],
		            'uom': '',
		            'quantity': '',
		            'net_amount': '',
		            'tax_exclusive_amount': '',
		            'mrp': '',
		            'current_item_price': 0,
		            'selling_unit': '',
		            'purchase_unit': '',
		            'relation': '',
		            'price_type': 'Whole Sale Price',
		            'tax': '',
		        },
			],
			'quantity_choosed': '',
			'bank_name': '',
			'branch': '',
			'cheque_no': '',
			'card_no': '',
			'card_holder_name': '',
			'cheque_date': '',
			'bill_type': 'Receipt',
			'bank_account_ledger': '',
			'round_off': '',
			'cess': '',
		}
		
	}
	$scope.keyboard_control = function(){
		$scope.focusIndex = 0;
		$scope.keys = [];
		$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});		
		$scope.keys.push({ code: 38, action: function() { 
			if($scope.focusIndex > 0){
				$scope.focusIndex--; 
			}
		}});
		$scope.keys.push({ code: 40, action: function() { 
			if($scope.salesmen.length > 0){
				$scope.item_list = $scope.salesmen;
			}
			else if($scope.customers.length > 0){
				$scope.item_list = $scope.customers;
			}
			else if($scope.current_sales_item.items.length > 0){
				$scope.item_list = $scope.current_sales_item.items;
			}
			else if($scope.current_sales_item.batches.length > 0){
				$scope.item_list = $scope.current_sales_item.batches;
			}
			if($scope.focusIndex < $scope.item_list.length-1){
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
	}
	$scope.select_list_item = function(index) {
		if($scope.salesmen.length > 0){
			salesman = $scope.salesmen[index];
			$scope.select_salesman(salesman);
		} else if($scope.customers.length > 0){
			customer = $scope.customers[index];
			$scope.select_customer(customer);
		} else if($scope.current_sales_item.items.length > 0){
			item = $scope.current_sales_item.items[index];
			$scope.get_item_details(item);
		} else if($scope.current_sales_item.batches != undefined){ 
			if($scope.current_sales_item.batches.length > 0){
				batch = $scope.current_sales_item.batches[index];
				$scope.select_batch(batch);
			}
		}
		
	}

	$scope.add_new_sales_item = function(){
		$scope.sales.items.push({
			'id': '',
			'name': '',
            'code': '',
            'batch_name': '',
            'batch_id': '',
            'stock': '',
            'stock_unit': '',
            'selling_units':[],
            'uom': '',
            'quantity': '',
            'net_amount': '',
            'tax_exclusive_amount': '',
            'mrp': '',
            'current_item_price': 0,
            'selling_unit': '',
            'purchase_unit': '',
            'relation': '',
            'whole_sale_price': '',
			'retail_price': '',
			'price_type': 'Whole Sale Price',
			'tax': '',
			'offer_quantity': '',
			'packets_per_box': '',
			'pieces_per_box': '',
			'pieces_per_packet': '',
			'unit_per_piece': '',
			'smallest_unit': '',
			'unit_per_packet': '',
			'item_uom': '',
			'cost_price': 0,
			'net_cp': 0,
			'current_item_cp': 0,
			'freight_charge': 0,
			'current_item_freight_charge': 0,
			'net_freight_charge': 0,
		});
		$scope.selling_units = {
			'unit': '',
		}
	}
	$scope.get_deliverynote_details = function(){
		$scope.validate_sales_msg = '';
		$scope.error_message = '';
		if($scope.delivery_note_no != ''){
			$scope.is_delivery_note = false;
			$http.get('/sales/deliverynote_sales/?delivery_note_no='+$scope.delivery_note_no).success(function(data) {
				if (data.result == 'ok') {
					get_serial_no($scope,$http,'Receipt');
					$scope.sales.deliverynote_id = data.delivery_note.deliverynote_id;
		            $scope.sales.deliverynote_invoice_date = data.delivery_note.deliverynote_invoice_date;
		            $scope.sales.customer_id = data.delivery_note.customer_id;
		            $scope.sales.salesman_id = data.delivery_note.salesman_id;
		            $scope.sales.customer = data.delivery_note.customer;
		            $scope.sales.salesman = data.delivery_note.salesman;
		            $scope.sales.do_no = data.delivery_note.do_no;
		            $scope.sales.discount = data.delivery_note.discount;
		            $scope.sales.grant_total = data.delivery_note.grant_total;
		            $scope.sales.round_off = data.delivery_note.round_off;
		            $scope.sales.cess = data.delivery_note.cess;
		            $scope.sales.items = data.delivery_note.items;
		            for (var i=0; i< $scope.sales.items.length; i++){
		            	console.log($scope.sales.items[i]);
		            }
					$scope.is_delivery_note = true;
					$scope.sales.bill_type = 'Receipt';
					$scope.sales.payment_mode = 'cash';
					$scope.sales.owner_tin = '';
					$scope.sales.customer_tin = '';
					$scope.customer_name = data.delivery_note.customer;
					$scope.salesman_name = data.delivery_note.salesman;
					$scope.sales.customer = data.delivery_note.customer_id;
					$scope.sales.salesman = data.delivery_note.salesman_id;
					
					$scope.sales_error_message = '';
				} else if (data.result == 'error'){
					$scope.error_message = data.message;
					$scope.sales.deliverynote_id = '';
		            $scope.sales.deliverynote_invoice_date = '';
		            $scope.sales.customer_id = '';
		            $scope.sales.salesman_id = '';
		            $scope.sales.customer = '';
		            $scope.sales.salesman = '';
		            $scope.sales.do_no = '';
		            $scope.sales.discount = '';
		            $scope.sales.grant_total = '';
		            $scope.sales.round_off = '';
		            $scope.sales.cess = '';
		            $scope.sales.items = '';
					$scope.is_delivery_note = '';
					$scope.sales.bill_type = '';
					$scope.sales.payment_mode = '';
					$scope.sales.owner_tin = '';
					$scope.sales.customer_tin = '';
					$scope.customer_name = '';
					$scope.salesman_name = '';
					$scope.sales.customer = '';
					$scope.sales.salesman = '';
					
					$scope.sales_error_message = '';
				}					
			}).error(function(data, status){
				console.log('Request failed' || data);
			});
		} else{
			$scope.sales = "";
		}
	}
	$scope.search_sales_items = function(item){

		item.item_search=true;
		$scope.no_item_msg = '';
		$scope.current_sales_item = item;
		// $scope.item_name = item.name;
		$scope.current_sales_item.code = "";
		$scope.current_sales_item.id = "";
		$scope.current_sales_item.batch_name = '';
		$scope.current_sales_item.batch_id = '';
		$scope.current_sales_item.stock = '';
		$scope.current_sales_item.stock_unit = '';
		$scope.current_sales_item.current_item_price = '';
		$scope.current_sales_item.mrp = '';
		$scope.current_sales_item.quantity = '';
		$scope.current_sales_item.net_amount = '';
		if($scope.current_sales_item.name.length > 0)
			get_item_search_list($scope, $http, $scope.current_sales_item.name,$scope.current_sales_item.batch_name,'sales');
	}
	$scope.get_item_details = function(item){
		$scope.current_sales_item.name = item.name;
		$scope.current_sales_item.id = item.id;
		$scope.current_sales_item.code = item.code;
		$scope.current_sales_item.type = item.type;

		$scope.current_sales_item.items = []
		$scope.items = "";
		$scope.current_sales_item.item_search = false;
	}
	$scope.search_salesman = function(){
		if($scope.salesman_name.length == 0){
			$scope.salesmen = "";
			$scope.no_salesman_message = "";
		}
		else{
			$scope.sales.salesman = "";
			search_salesmen($scope,$http);
		}	
	}
	$scope.select_salesman = function(salesman){
		$scope.salesman_name = salesman.name;
		$scope.sales.salesman = salesman.id;
		$scope.salesmen = "";
		$scope.select_salesman_flag = false;
		$scope.no_salesman_message = "";
		hide_sales_popup_divs();
		$scope.name = salesman.name;
		// $scope.bonus_point = salesman.bonus_point;
		// $('#view_bonus_amount').css('display', 'block');
		// create_popup();
	}
	$scope.search_batch = function(item){
		if(item.id != ''){
			$scope.no_batch_msg = "";
			$scope.current_sales_item = item;
			$scope.batch_name = item.batch_name;
			$scope.item = item.id;
			$scope.current_sales_item.batches = [];
			get_batch_search_details($scope, $http,'sales');
			if($scope.current_sales_item.batches.length == 0)
				$scope.no_batch_msg = "No such batch";
		} else
			$scope.no_batch_msg = "Please choose an item";
	}
	$scope.new_salesman = function(sales) {
		$scope.current_sales = sales;
		$scope.salesman = {
			'first_name': '',
			'last_name': '',
			'address': '',
			'contact_no': '',
			'email': '',
		}
	    hide_sales_popup_divs();
	    $('#add_salesman_popup').css('display', 'block');
	    $('#add_customer_popup').css('display', 'none');
	    create_popup();
	}
	$scope.save_salesman = function() {
		save_salesman($scope, $http, 'sales');
		$scope.no_salesman_message = "";
	}
	$scope.save_customer = function(){
		save_customer($scope, $http, 'sales');	
		$scope.no_customer_msg = "";
	}
	$scope.hide_popup = function() {
        $scope.salesman = {
            'name': '',
            'address': '',
            'mobile': '',
            'telephone_number': '',
            'email': '',
        }
        $scope.validate_salesman_error_msg = "";
        $('#dialogue_popup_container').css('display', 'none');
        $('#popup_overlay').css('display', 'none');
    }
	$scope.select_batch = function(batch){
		$scope.no_batch_msg = '';
		$scope.current_sales_item.batch_name = batch.name;
		$scope.current_sales_item.batch_id = batch.id;
		$scope.batch_items_list = "";
		if ($scope.current_sales_item.id) {
			$http.get('/inventory/batch_item_details/?batch_id='+$scope.current_sales_item.batch_id+'&item_id='+$scope.current_sales_item.id).success(function(data){
	        	$scope.current_sales_item.batches = [];
	        	$scope.current_sales_item.stock = data.batch_item.stock;
	        	$scope.current_sales_item.stock_unit = data.batch_item.stock_unit;
	        	$scope.current_sales_item.uoms = data.batch_item.uoms;
	        	$scope.current_sales_item.wholesale_price = data.batch_item.whole_sale_price,
	            $scope.current_sales_item.retail_price = data.batch_item.retail_price,
	            $scope.current_sales_item.branch_price = data.batch_item.branch_price,
	            $scope.current_sales_item.customer_card_price = data.batch_item.customer_card_price,
	        	$scope.current_sales_item.price_type = 'Retail Price';
	        	$scope.current_sales_item.mrp = data.batch_item.retail_price_sales;
	        	$scope.current_sales_item.tax = data.batch_item.tax;
	        	
		    }).error(function(data, status) {
		    	console.log('Request failed' || data);
		    });
		}
		$scope.current_sales_item.batches = "";
	}
	$scope.change_bill_type = function(bill_type){
		for(var i = 0; i < $scope.sales.items.length; i++){
			if($scope.sales.items[i].uom != '' && $scope.sales.items[i].quantity.length > 0){
				$scope.sales.items[i].net_amount = parseFloat( $scope.sales.items[i].quantity) * parseFloat($scope.sales.items[i].current_item_price);
				$scope.sales.items[i].tax_exclusive_amount = $scope.sales.items[i].net_amount;
				if(bill_type == 'Invoice'){
					$scope.sales.items[i].net_amount = parseFloat($scope.sales.items[i].net_amount) + (parseFloat($scope.sales.items[i].net_amount) * parseFloat($scope.sales.items[i].tax/100))	
					
				}
			}
		}
		if(bill_type == 'Invoice')
			get_serial_no($scope,$http,'Invoice');
		else
			get_serial_no($scope,$http,'Receipt');
		$scope.calculate_total_amount();
	}
	// $scope.change_price_type = function(){
	// 	 for(var i = 0; i < $scope.sales.items.length; i++){
	// 		if($scope.select_all_price_type == true){
	// 			$scope.sales.items[i].price_type = false;
	// 		}
	// 		else{
	// 			$scope.sales.items[i].price_type = true;
	// 		}
	// 	}
	// 	for(var i = 0; i < $scope.sales.items.length; i++){
	// 		$scope.calculate_quantity_from_uom($scope.sales.items[i]);			
	// 	}
	// }
	
	$scope.calculate_quantity_from_uom = function(item){
		$scope.validate_sales_msg = "";
    	for(i=0; i<item.uoms.length; i++) {
    		if(item.uoms[i].uom == item.uom){
    			if(item.quantity > item.uoms[i].stock){
    				$scope.validate_sales_msg = "Quantity Out of Stock";
    			} else {
    				if(item.price_type == 'Whole Sale Price'){
    					item.mrp = item.uoms[i].wholesale_price;
						item.net_amount = item.quantity*item.uoms[i].wholesale_price;
    				}
    					
    				if(item.price_type == 'Retail Price'){
    					item.mrp = item.uoms[i].retail_price;
    					item.net_amount = item.quantity*item.uoms[i].retail_price;
    				}
    					
    				if(item.price_type == 'Branch Price'){
    					item.mrp = item.uoms[i].branch_price;
    					item.net_amount = item.quantity*item.uoms[i].branch_price;
    				}
    					
    				if(item.price_type == 'Customer Card Price'){
    					item.mrp = item.uoms[i].customer_card_price;
    					item.net_amount = item.quantity*item.uoms[i].customer_card_price;
    				}
    			}
    		}
    	}    	
		item.tax_exclusive_amount = item.net_amount;
    	if($scope.sales.bill_type == 'Invoice'){
			item.net_amount = parseFloat(item.net_amount) + (parseFloat(item.net_amount) * parseFloat(item.tax/100));
		}
    	item.current_item_price = item.mrp;
		$scope.calculate_total_amount();
	}
	$scope.calculate_total_amount = function(){
		$scope.sales.grant_total = 0;
		$scope.sales.tax_exclusive_total = 0;
		if ($scope.sales.cess != Number($scope.sales.cess)) {
			$scope.sales.cess = 0;
		}
		for(var i = 0; i < $scope.sales.items.length; i++){
			if(Number($scope.sales.items[i].net_amount)){
				$scope.sales.grant_total = parseFloat($scope.sales.grant_total) + parseFloat($scope.sales.items[i].net_amount);
				$scope.sales.tax_exclusive_total = parseFloat($scope.sales.tax_exclusive_total) + parseFloat($scope.sales.items[i].tax_exclusive_amount);
			}
		}
		if($scope.sales.discount.length != 0 && Number($scope.sales.discount)){
			$scope.sales.grant_total = parseFloat($scope.sales.grant_total) - parseFloat($scope.sales.discount)
			$scope.sales.tax_exclusive_total = parseFloat($scope.sales.tax_exclusive_total) - parseFloat($scope.sales.discount)
		}
		if ($scope.sales.round_off != Number($scope.sales.round_off)) {
			$scope.sales.round_off = 0;
		}
		if($scope.sales.round_off.length != 0 && Number($scope.sales.round_off)){
			$scope.sales.grant_total = parseFloat($scope.sales.grant_total) - parseFloat($scope.sales.round_off)
			$scope.sales.tax_exclusive_total = parseFloat($scope.sales.tax_exclusive_total) - parseFloat($scope.sales.round_off)
		}
		if($scope.sales.payment_mode  == 'credit'){
			if($scope.sales.Paid.length != 0 && Number($scope.sales.Paid)){
				//$scope.sales.grant_total = parseFloat($scope.sales.grant_total) - parseFloat($scope.sales.Paid)
				$scope.sales.balance = parseFloat($scope.sales.grant_total) - parseFloat($scope.sale.Paid)
				$scope.sales.tax_exclusive_total = parseFloat($scope.sales.tax_exclusive_total) - parseFloat($scope.sales.Paid)
			}
		}
		if($scope.sales.cess.length != 0 && Number($scope.sales.cess)){
			cess = parseFloat($scope.sales.grant_total)*(parseFloat($scope.sales.cess)/100);
			cess = cess.toFixed(2);
			$scope.sales.grant_total = parseFloat($scope.sales.grant_total) + parseFloat(cess);
		}
		$scope.sales.grant_total = $scope.sales.grant_total.toFixed(2);
	}
	$scope.search_customer = function(){
		if($scope.customer_name.length == 0){
			$scope.customers = "";
			$scope.no_customer_msg = "";
		} else {
			$scope.sales.customer = "";
			get_customer_search_list($scope, $http);
		}		
	}
	$scope.select_customer = function(customer){
		$scope.customer_name = customer.name;
		$scope.sales.customer = customer.id;
		$scope.customers = "";
		$scope.select_customer_flag = false;
		$scope.no_customer_msg = "";
		hide_sales_popup_divs();
		$scope.name = customer.name;
		// $scope.bonus_point = customer.bonus_point;
		// $('#view_bonus_amount').css('display', 'block');
		// create_popup();
	}
	$scope.new_customer = function(sales) {
		$scope.current_sales = sales;
	    $scope.customer= {
	        'name': '',
	        'area': '', 
	        'address': '',
	        'mobile': '',
	        'contact_number': '',
	        'email': '',
	    }
	    hide_sales_popup_divs();
	    $('#add_salesman_popup').css('display', 'none');
	    $('#add_customer_popup').css('display', 'block');
	    create_popup();
	}
	$scope.payment_mode_details = function(payment_mode) {
		hide_sales_popup_divs();
		$('#payment_details').css('display', 'block');
		$('#add_customer_popup').css('display', 'none');
		$('#add_salesman_popup').css('display', 'none');
		create_popup();
		if (payment_mode == 'cheque') {
			$scope.is_cheque_payment = true;
		} else if (payment_mode == 'card') {
			$scope.is_cheque_payment = false;
		} else {
			hide_sales_popup_divs();
		}
	}
	$scope.bank_account_details = function(payment_mode) {
		get_bank_account_details($scope, $http);
		$scope.sales.payment_mode = payment_mode;
		hide_sales_popup_divs();
		$('#bank_account_details').css('display', 'block');
		$('#add_customer_popup').css('display', 'none');
		$('#add_salesman_popup').css('display', 'none');
		$scope.other_bank_account = false;
		$scope.bank_account_error = '';
		$scope.bank_account = '';
		$scope.bank_account_name = '';
		if ($scope.sales.payment_mode == 'cheque') {
			$scope.is_cheque = true;
		} else {
			$scope.is_cheque = false;
		}
		create_popup();
	}
	$scope.add_bank_account_details = function() {
		if($scope.bank_account != ''){
			$scope.sales.bank_account_ledger = $scope.bank_account;
			$scope.payment_mode_details($scope.sales.payment_mode);
		}
	}
	$scope.create_new_bank_acount = function() {
		if ($scope.bank_account_name == '' || $scope.bank_account_name == undefined) {
			$scope.bank_account_error = 'Please enter the Bank account name';
		} else {
			create_new_bank_acount($scope, $http, 'sales');
		}
	}
	$scope.validate_sales = function(){
		$scope.validate_sales_msg = "";
		if($scope.salesman_name != '' && $scope.sales.salesman == ''){
			$scope.validate_sales_msg = "Please select a salesman from the list";
			return false;
		} else if($scope.no_customer_msg != ""){
			$scope.validate_sales_msg = "Please select a valid customer or leave the field empty";
			return false;
		} else if (($scope.sales.payment_mode == 'card' || $scope.sales.payment_mode == 'cheque' ) && ($scope.sales.bank_name == '' || $scope.sales.bank_name == undefined)) {
			$scope.validate_sales_msg = 'Please enter bank name';
			return false;
		} else if (($scope.sales.payment_mode == 'card') && ($scope.sales.card_no == '' || $scope.sales.card_no == undefined)) {
			$scope.validate_sales_msg = 'Please enter Card No';
			return false;
		} else if (($scope.sales.payment_mode == 'card') && ($scope.sales.card_holder_name == '' || $scope.sales.card_holder_name == undefined)) {
			$scope.validate_sales_msg = 'Please enter Card Holder Name';
			return false;
		} else if (($scope.sales.payment_mode == 'cheque') && ($scope.sales.branch == '' || $scope.sales.branch == undefined)) {
			$scope.validate_sales_msg = 'Please enter Branch';
			return false;
		} else if (($scope.sales.payment_mode == 'cheque') && $scope.sales.cheque_date == '') {
			$scope.validate_sales_msg = 'Please choose Cheque Date';
			return false;
		} else if (($scope.sales.payment_mode == 'cheque') && ($scope.sales.cheque_no == '' || $scope.sales.cheque_no == undefined)) {
			$scope.validate_sales_msg = 'Please choose Cheque Number';
			return false;
		} else if($scope.sales.customer == '' && $scope.sales.payment_mode == 'credit'){
			$scope.validate_estimate_msg = 'Please choose Customer';
			return false;
		}
		for(var i = 0; i < $scope.sales.items.length; i++){
			if ($scope.sales.items[i].code == '') {
				$scope.validate_sales_msg = 'Item code cannot be null in row' + (i+1);
				return false;
			} else if ($scope.sales.items[i].name == '') {
				$scope.validate_sales_msg = 'Item name cannot be null in row' + (i+1);
				return false;
			} else if ($scope.sales.items[i].batch_id == '' && $scope.sales.items[i].type == 'Stockable') {
				$scope.validate_sales_msg = 'Please choose batch for the item in row '+ (i+1);
				return false;
			} else if ($scope.sales.items[i].uom == '' && $scope.sales.items[i].type != 'Services') {
				$scope.validate_sales_msg = 'Please choose the unit of measurement in row '+ (i+1);
				return false;
			} else if ($scope.sales.items[i].quantity == '') {
				$scope.validate_sales_msg = 'Please enter the quantity in row '+ (i+1);
				return false;
			} else if($scope.sales.items[i].mrp == ''){
				$scope.validate_sales_msg = 'Please enter mrp in row'+ (i+1);
			}else if ($scope.sales.items[i].stock == ''|| $scope.sales.items[i].stock == 0 || $scope.sales.items[i].stock == undefined) {
				$scope.validate_sales_msg = 'There is no stock for the chooseen batch in row '+ (i+1);
				return false;
			}
			if($scope.sales.items[i].uom == $scope.sales.items[i].stock_unit && $scope.sales.items[i].type == 'Stockable'){
				if($scope.sales.items[i].quantity > $scope.sales.items[i].stock){
					$scope.validate_sales_msg = "Out of Stock quantity in row " + (i+1);
					return false;
				}
			} else if($scope.sales.items[i].uom == $scope.sales.items[i].purchase_unit && $scope.sales.items[i].type == 'Stockable'){
				if($scope.sales.items[i].quantity*$scope.sales.items[i].relation > $scope.sales.items[i].stock){
					$scope.validate_sales_msg = "Out of Stock in row " + (i+1);
					return false;
				}
			}
		} return true;
	}
	$scope.calculate_amount = function(item){
		if (item.quantity != Number(item.quantity) || item.quantity == '') 
			item.quantity = 0
		if (item.current_item_price != Number(item.current_item_price) || item.current_item_price  == '')
			item.current_item_price = 0
		item.net_amount = parseFloat(item.quantity) * parseFloat(item.current_item_price)
		item.tax_exclusive_amount = item.net_amount;
		$scope.calculate_total_amount();
	}
	$scope.save_sales = function(){
		$scope.sales.invoice_date = $('#invoice_date').val();
		if($scope.sales.invoice_date == ''){
			$scope.validate_sales_msg = 'Please select Invoice date';

		} else if($scope.validate_sales()){
			if ($scope.sales.tax_exclusive_total == null || isNaN($scope.sales.tax_exclusive_total)) {
				console.log('hasdkjasdhkjasdhkjhdjk')
				$scope.sales.tax_exclusive_total = '';
			}
				
			for(var i = 0; i < $scope.sales.items.length; i++){
				
				if($scope.sales.items[i].item_search == true)
					$scope.sales.items[i].item_search = "true"
				else
					$scope.sales.items[i].item_search = "false"
				if($scope.sales.items[i].net_freight_charge == null)
					$scope.sales.items[i].net_freight_charge = ''
				if($scope.sales.items[i].net_cp == null)
					$scope.sales.items[i].net_cp = ''				
			}	
			params = {
				'sales_details': angular.toJson($scope.sales),
				'csrfmiddlewaretoken': $scope.csrf_token,
			}
			show_loader();
			$http({
				method: 'post',
				url: '/sales/sales_entry/',
				data: $.param(params),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).success(function(data){
				hide_loader();
				if(data.result == 'ok'){
					hide_sales_popup_divs($scope, $http);
					$scope.transaction_reference_no = data.transaction_reference_no;
					$scope.transaction_name = ' Sales ';
					hide_popup();
					$('#add_salesman_popup').css('display', 'none');
	    			$('#add_customer_popup').css('display', 'none');
					$('#transaction_reference_no_details').css('display', 'block');

					create_popup();
				} else {
					$scope.validate_sales_msg = data.message;
				}
			}).error(function(data, status){
				console.log('Request failed' || data);
			})
		}
	}
	$scope.hide_popup_transaction_details = function() {
		document.location.href = '/sales/sales_entry?transaction_ref_no='+$scope.transaction_reference_no;
	}
	$scope.remove_item = function(item) {
		var index = $scope.sales.items.indexOf(item);
		$scope.sales.items.splice(index, 1);
		$scope.calculate_total_amount();
	}
	$scope.hide_popup_payment_details = function(){
		$scope.sales.bank_name = $scope.bank_name;
		$scope.sales.branch = $scope.branch;
		$scope.sales.cheque_no = $scope.cheque_no;
		$scope.sales.card_no = $scope.card_no;
		$scope.sales.card_holder_name = $scope.card_holder_name;
		$scope.sales.cheque_date = document.getElementById("cheque_date").value;
		hide_sales_popup_divs();
	}
}
function EditSalesController($scope, $http){
	$scope.show_sales_details = false;
	$scope.salesman_name = '';
	$scope.salesmen = '';
	$scope.customers = '';
	$scope.current_sales_item = [];
	$scope.init = function(csrf_token){
		$scope.csrf_token = csrf_token;
		$scope.keyboard_control();
		$scope.ref_no = '';
	}
	$scope.keyboard_control = function(){
		$scope.focusIndex = 0;
		$scope.keys = [];
		$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});		
		$scope.keys.push({ code: 38, action: function() { 
			if($scope.focusIndex > 0){
				$scope.focusIndex--; 
			}
		}});
		$scope.keys.push({ code: 40, action: function() { 
			if($scope.salesmen.length > 0){
				$scope.item_list = $scope.salesmen;
			}
			else if($scope.customers.length > 0){
				$scope.item_list = $scope.customers;
			}
			else if($scope.current_sales_item.items.length > 0){
				$scope.item_list = $scope.current_sales_item.items;
			}
			else if($scope.current_sales_item.batches.length > 0){
				$scope.item_list = $scope.current_sales_item.batches;
			}else if ($scope.invoice_nos != undefined && $scope.invoice_nos.length > 0) {
				if($scope.focusIndex < $scope.invoice_nos.length-1){
					$scope.focusIndex++; 
				}
			} 
			if($scope.focusIndex < $scope.item_list.length-1){
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
	}
	$scope.select_list_item = function(index) {
		if($scope.salesmen.length > 0){
			salesman = $scope.salesmen[index];
			$scope.select_salesman(salesman);
		} else if($scope.customers.length > 0){
			customer = $scope.customers[index];
			$scope.select_customer(customer);
		} else if($scope.current_sales_item.items.length > 0){
			item = $scope.current_sales_item.items[index];
			$scope.get_item_details(item);
		} else if($scope.current_sales_item.batches != undefined){ 
			if($scope.current_sales_item.batches.length > 0){
				batch = $scope.current_sales_item.batches[index];
				$scope.select_batch(batch);
			}
		}else if ($scope.invoice_nos != undefined && $scope.invoice_nos.length > 0) {
			invoice_no = $scope.invoice_nos[index];
			$scope.select_invoice(invoice_no);
		} 
	}
	$scope.search_invoice = function(){
		if ($scope.sales_invoice.length > 0){
			$http.get('/sales/invoice_no_search/?sales_invoice='+$scope.sales_invoice).success(function(data){
	        $scope.invoice_nos = data.invoice_nos;
	        
		    }).error(function(data, status){
		        $scope.message = data.message;
		    })
		}
			
	}
	$scope.select_invoice = function(invoice_no){
		select_invoice_flag = false;
		$scope.ref_no = invoice_no.invoice_no;
		$scope.focusIndex = 0;
		$scope.invoice_nos = [];
		$scope.get_sales_details($scope,$http);
	}
	$scope.get_sales_details = function(){
		if($scope.ref_no != ''){
			$http.get('/sales/edit_sales/?ref_no='+$scope.ref_no).success(function(data) {
				if (data.result == 'ok') {
					$scope.show_sales_details = true;
					$scope.sales = data.sales;
					$scope.sales.d_items = [];
					$scope.customer_name = data.sales.customer;
					$scope.salesman_name = data.sales.salesman;
					$scope.sales.old_customer = data.sales.customer_id;
					$scope.sales.customer = data.sales.customer_id;
					$scope.sales.salesman = data.sales.salesman_id;
					$scope.transaction_reference_no = data.sales.transaction_reference_no;
					$scope.sales_error_message = '';
				} else{
					$scope.sales_error_message = "No sales found";
					$scope.sales = '';
				}					
			}).error(function(data, status){
				console.log('Request failed' || data);
			});
		} else{
			$scope.sales = "";
		}
	}
	
	$scope.add_new_sales_item = function(){
		$scope.sales.items.push({
			'id': '',
			'name': '',
            'code': '',
            'batch_name': '',
            'batch_id': '',
            'stock': '',
            'stock_unit': '',
            'selling_units':[],
            'uom': '',
            'quantity': '',
            'net_amount': '',
            'tax_exclusive_amount': '',
            'mrp': '',
            'current_item_price': 0,
            'selling_unit': '',
            'purchase_unit': '',
            'relation': '',
            'whole_sale_price': '',
			'retail_price': '',
			'price_type': 'Whole Sale Price',
			'tax': '',
			'offer_quantity': '',
			'packets_per_box': '',
			'pieces_per_box': '',
			'pieces_per_packet': '',
			'unit_per_piece': '',
			'smallest_unit': '',
			'unit_per_packet': '',
			'item_uom': '',
			'cost_price': 0,
			'net_cp': 0,
			'current_item_cp': 0,
			'freight_charge': 0,
			'current_item_freight_charge': 0,
			'net_freight_charge': 0,
		});
		$scope.selling_units = {
			'unit': '',
		}
	}
	$scope.search_sales_items = function(item){

		item.item_search=true;
		$scope.no_item_msg = '';
		$scope.current_sales_item.items = [];
		$scope.current_sales_item = item;
		// $scope.item_name = item.name;
		$scope.current_sales_item.code = "";
		$scope.current_sales_item.id = "";
		$scope.current_sales_item.batch_name = '';
		$scope.current_sales_item.batch_id = '';
		$scope.current_sales_item.stock = '';
		$scope.current_sales_item.stock_unit = '';
		$scope.current_sales_item.current_item_price = '';
		$scope.current_sales_item.mrp = '';
		$scope.current_sales_item.quantity = '';
		$scope.current_sales_item.net_amount = '';
		if($scope.current_sales_item.name.length > 0)
			get_item_search_list($scope, $http, $scope.current_sales_item.name,$scope.current_sales_item.batch_name,'sales');
	}
	$scope.get_item_details = function(item){
		$scope.current_sales_item.name = item.name;
		$scope.current_sales_item.item_id = item.id;
		$scope.current_sales_item.code = item.code;
		$scope.current_sales_item.type = item.type;

		$scope.current_sales_item.items = []
		$scope.items = "";
		$scope.current_sales_item.item_search = false;
	}
	$scope.search_salesman = function(){
		select_salesman_flag=true;
		if($scope.salesman_name.length == 0){
			$scope.salesmen = "";
			$scope.no_salesman_message = "";
		}
		else{
			$scope.sales.salesman = "";
			search_salesmen($scope,$http);
		}	
	}
	$scope.select_salesman = function(salesman){
		$scope.salesman_name = salesman.name;
		$scope.sales.salesman = salesman.id;
		$scope.salesmen = "";
		$scope.select_salesman_flag = false;
		$scope.no_salesman_message = "";
		hide_sales_popup_divs();
		$scope.name = salesman.name;
		// $scope.bonus_point = salesman.bonus_point;
		// $('#view_bonus_amount').css('display', 'block');
		// create_popup();
	}
	$scope.search_batch = function(item){
		if(item.item_id != ''){
			$scope.no_batch_msg = "";
			$scope.current_sales_item = item;
			$scope.batch_name = item.batch_name;
			$scope.item = item.item_id;
			$scope.current_sales_item.batches = [];
			get_batch_search_details($scope, $http,'sales');
			if($scope.current_sales_item.batches.length == 0)
				$scope.no_batch_msg = "No such batch";
		} else
			$scope.no_batch_msg = "Please choose an item";
	}
	$scope.new_salesman = function() {
		$scope.salesman = {
			'first_name': '',
			'last_name': '',
			'address': '',
			'contact_no': '',
			'email': '',
		}
	    hide_sales_popup_divs();
	    $('#new_salesman').css('display', 'block');
	    $('#add_customer_popup').css('display', 'none');
	    create_popup();
	}
	$scope.save_salesman = function() {
		save_salesman($scope, $http, 'bill_to_invoice');
		$scope.no_salesman_message = "";
	}
	$scope.save_customer = function(){
		save_customer($scope, $http, 'bill_to_invoice');	
		$scope.no_customer_msg = "";
	}
	$scope.hide_popup = function() {
        $scope.salesman = {
            'name': '',
            'address': '',
            'mobile': '',
            'telephone_number': '',
            'email': '',
        }
        $scope.validate_salesman_error_msg = "";
        $('#dialogue_popup_container').css('display', 'none');
        $('#popup_overlay').css('display', 'none');
    }
	$scope.select_batch = function(batch){
		$scope.no_batch_msg = '';
		$scope.current_sales_item.batch_name = batch.name;
		$scope.current_sales_item.batch_id = batch.id;
		$scope.batch_items_list = "";
		if ($scope.current_sales_item.id) {
			$http.get('/inventory/batch_item_details/?batch_id='+$scope.current_sales_item.batch_id+'&item_id='+$scope.current_sales_item.id).success(function(data){
	        	$scope.current_sales_item.batches = [];
	        	$scope.current_sales_item.stock = data.batch_item.stock;
	        	$scope.current_sales_item.stock_unit = data.batch_item.stock_unit;
	        	$scope.current_sales_item.uoms = data.batch_item.uoms;
	        	$scope.current_sales_item.wholesale_price = data.batch_item.whole_sale_price,
	            $scope.current_sales_item.retail_price = data.batch_item.retail_price,
	            $scope.current_sales_item.branch_price = data.batch_item.branch_price,
	            $scope.current_sales_item.customer_card_price = data.batch_item.customer_card_price,
	        	$scope.current_sales_item.price_type = 'Retail Price';
	        	$scope.current_sales_item.mrp = data.batch_item.retail_price_sales;
	        	$scope.current_sales_item.tax = data.batch_item.tax;
	        	
		    }).error(function(data, status) {
		    	console.log('Request failed' || data);
		    });
		}
		$scope.current_sales_item.batches = "";
	}
	$scope.calculate_quantity_from_uom = function(item){
		$scope.validate_sales_msg = "";
    	for(i=0; i<item.uoms.length; i++) {
    		if(item.uoms[i].uom == item.uom){
    			if(item.quantity > item.uoms[i].stock){
    				$scope.validate_sales_msg = "Quantity Out of Stock";
    			} else {
    				if(item.price_type == 'Whole Sale Price'){
    					item.mrp = item.uoms[i].wholesale_price;
						item.net_amount = item.quantity*item.uoms[i].wholesale_price;
    				}
    					
    				if(item.price_type == 'Retail Price'){
    					item.mrp = item.uoms[i].retail_price;
    					item.net_amount = item.quantity*item.uoms[i].retail_price;
    				}
    					
    				if(item.price_type == 'Branch Price'){
    					item.mrp = item.uoms[i].branch_price;
    					item.net_amount = item.quantity*item.uoms[i].branch_price;
    				}
    					
    				if(item.price_type == 'Customer Card Price'){
    					item.mrp = item.uoms[i].customer_card_price;
    					item.net_amount = item.quantity*item.uoms[i].customer_card_price;
    				}
    			}
    		}
    	}    	
		item.tax_exclusive_amount = item.net_amount;
    	if($scope.sales.bill_type == 'Invoice'){
			item.net_amount = parseFloat(item.net_amount) + (parseFloat(item.net_amount) * parseFloat(item.tax/100));
		}
    	item.current_item_price = item.mrp;
		$scope.calculate_total_amount();
	}
	$scope.calculate_total_amount = function(){
		$scope.sales.grant_total = 0;
		$scope.sales.tax_exclusive_total = 0;
		if ($scope.sales.cess != Number($scope.sales.cess)) {
			$scope.sales.cess = 0;
		}
		for(var i = 0; i < $scope.sales.items.length; i++){
			if(Number($scope.sales.items[i].net_amount)){
				$scope.sales.grant_total = parseFloat($scope.sales.grant_total) + parseFloat($scope.sales.items[i].net_amount);
				$scope.sales.tax_exclusive_total = parseFloat($scope.sales.tax_exclusive_total) + parseFloat($scope.sales.items[i].tax_exclusive_amount);
			}
		}
		if($scope.sales.discount.length != 0 && Number($scope.sales.discount)){
			$scope.sales.grant_total = parseFloat($scope.sales.grant_total) - parseFloat($scope.sales.discount)
			$scope.sales.tax_exclusive_total = parseFloat($scope.sales.tax_exclusive_total) - parseFloat($scope.sales.discount)
		}
		if ($scope.sales.round_off != Number($scope.sales.round_off)) {
			$scope.sales.round_off = 0;
		}
		if($scope.sales.round_off.length != 0 && Number($scope.sales.round_off)){
			$scope.sales.grant_total = parseFloat($scope.sales.grant_total) - parseFloat($scope.sales.round_off)
			$scope.sales.tax_exclusive_total = parseFloat($scope.sales.tax_exclusive_total) - parseFloat($scope.sales.round_off)
		}
		if($scope.sales.payment_mode  == 'credit'){
			if($scope.sales.Paid.length != 0 && Number($scope.sales.Paid)){
				$scope.sales.grant_total = parseFloat($scope.sales.grant_total) - parseFloat($scope.sales.Paid)
				$scope.sales.tax_exclusive_total = parseFloat($scope.sales.tax_exclusive_total) - parseFloat($scope.sales.Paid)
			}
		}
		if($scope.sales.cess.length != 0 && Number($scope.sales.cess)){
			cess = parseFloat($scope.sales.grant_total)*(parseFloat($scope.sales.cess)/100);
			cess = cess.toFixed(2);
			$scope.sales.grant_total = parseFloat($scope.sales.grant_total) + parseFloat(cess);
		}
		$scope.sales.grant_total = $scope.sales.grant_total.toFixed(2);
	}
	$scope.validate_stock = function(){
		if(item.stock_unit == item.uom) {
			if(item.stock < item.quantity) {
				$scope.validate_sales_msg = " Quantity out of stock";
			}
		}

		if(stock_unit == 'packet' && item.uom == 'box') {
			$scope.validate_sales_msg = " Quantity out of stock";
		}
		if(stock_unit == 'piece' && (item.uom == 'box' || item.uom == 'packet')) {
			$scope.validate_sales_msg = " Quantity out of stock";
		}
		if(stock_unit == 'piece' && (item.uom == 'box' || item.uom == 'packet')) {
			$scope.validate_sales_msg = " Quantity out of stock";
		}
	}
	
	
	$scope.print_sales = function(){
		document.location.href = '/sales/sales_entry?transaction_ref_no='+$scope.transaction_reference_no;
	}
	$scope.show_payment_details = function(){
		if ($scope.sales_view.payment_mode == 'cheque') {
			$scope.is_cheque = true;
		} else {
			$scope.is_cheque = false;
		}
		create_popup();
		$scope.bank_name = $scope.sales.bank_name;
		$scope.cheque_date = $scope.sales.cheque_date;
		$scope.cheque_number = $scope.sales.cheque_number;
		$scope.branch = $scope.sales.branch;
		$scope.card_number = $scope.sales.card_number;
		$scope.card_holder_name = $scope.sales.card_holder_name;
	}
	$scope.hide_popup = function() {
		hide_popup();
	}
	$scope.change_bill_type = function(bill_type){
		for(var i = 0; i < $scope.sales.items.length; i++){
			if($scope.sales.items[i].uom != '' && $scope.sales.items[i].quantity != ''){
				$scope.sales.items[i].net_amount = parseFloat( $scope.sales.items[i].quantity) * parseFloat($scope.sales.items[i].mrp);
				$scope.sales.items[i].tax_exclusive_amount = $scope.sales.items[i].net_amount;
				if(bill_type == 'Invoice'){
					$scope.sales.items[i].net_amount = parseFloat($scope.sales.items[i].net_amount) + (parseFloat($scope.sales.items[i].net_amount) * parseFloat($scope.sales.items[i].tax/100))	
					
				}
			}
		}
		$scope.calculate_total_amount();
	}
	$scope.change_price_type = function(){
		 for(var i = 0; i < $scope.sales.items.length; i++){
			if($scope.select_all_price_type == true){
				$scope.sales.items[i].price_type = false;
			}
			else{
				$scope.sales.items[i].price_type = true;
			}
		}
		for(var i = 0; i < $scope.sales.items.length; i++){
			$scope.calculate_quantity_from_uom($scope.sales.items[i]);			
		}
	}
	$scope.validate_sales = function(){
		$scope.validate_sales_msg = "";
		if (($scope.sales.payment_mode == 'card' || $scope.sales.payment_mode == 'cheque' ) && ($scope.sales.bank_name == '' || $scope.sales.bank_name == undefined)) {
			$scope.validate_sales_msg = 'Please enter bank name';
			return false;
		} else if (($scope.sales.payment_mode == 'card') && ($scope.sales.card_no == '' || $scope.sales.card_no == undefined)) {
			$scope.validate_sales_msg = 'Please enter Card No';
			return false;
		} else if (($scope.sales.payment_mode == 'card') && ($scope.sales.card_holder_name == '' || $scope.sales.card_holder_name == undefined)) {
			$scope.validate_sales_msg = 'Please enter Card Holder Name';
			return false;
		} else if (($scope.sales.payment_mode == 'cheque') && ($scope.sales.branch == '' || $scope.sales.branch == undefined)) {
			$scope.validate_sales_msg = 'Please enter Branch';
			return false;
		} else if (($scope.sales.payment_mode == 'cheque') && $scope.sales.cheque_date == '') {
			$scope.validate_sales_msg = 'Please choose Cheque Date';
			return false;
		} else if (($scope.sales.payment_mode == 'cheque') && ($scope.sales.cheque_no == '' || $scope.sales.cheque_no == undefined)) {
			$scope.validate_sales_msg = 'Please choose Cheque Number';
			return false;
		} else if($scope.sales.customer == '' && $scope.sales.payment_mode == 'credit'){
			$scope.validate_estimate_msg = 'Please choose Customer';
			return false;
		}
		for(var i = 0; i < $scope.sales.items.length; i++){
			if ($scope.sales.items[i].code == '') {
				$scope.validate_sales_msg = 'Item code cannot be null in row' + (i+1);
				return false;
			} else if ($scope.sales.items[i].name == '') {
				$scope.validate_sales_msg = 'Item name cannot be null in row' + (i+1);
				return false;
			} else if ($scope.sales.items[i].batch_id == '' && $scope.sales.items[i].type == 'Stockable') {
				$scope.validate_sales_msg = 'Please choose batch for the item in row '+ (i+1);
				return false;
			} else if ($scope.sales.items[i].uom == '' && $scope.sales.items[i].type != 'Services') {
				$scope.validate_sales_msg = 'Please choose the unit of measurement in row '+ (i+1);
				return false;
			} else if ($scope.sales.items[i].quantity == '') {
				$scope.validate_sales_msg = 'Please enter the quantity in row '+ (i+1);
				return false;
			} else if ($scope.sales.items[i].stock == ''|| $scope.sales.items[i].stock == 0 || $scope.sales.items[i].stock == undefined) {
				$scope.validate_sales_msg = 'There is no stock for the chooseen batch in row '+ (i+1);
				return false;
			}
			// if($scope.sales.items[i].uom == $scope.sales.items[i].stock_unit && $scope.sales.items[i].type == 'Stockable'){
			// 	if($scope.sales.items[i].quantity > $scope.sales.items[i].stock){
			// 		$scope.validate_sales_msg = "Out of Stock quantity in row " + (i+1);
			// 		return false;
			// 	}
			// } else if($scope.sales.items[i].uom == $scope.sales.items[i].purchase_unit && $scope.sales.items[i].type == 'Stockable'){
			// 	if($scope.sales.items[i].quantity*$scope.sales.items[i].relation > $scope.sales.items[i].stock){
			// 		$scope.validate_sales_msg = "Out of Stock in row " + (i+1);
			// 		return false;
			// 	}
			// }
		} return true;
	}
	$scope.calculate_amount = function(item){
		if (item.quantity != Number(item.quantity) || item.quantity == '') 
			item.quantity = 0
		if (item.mrp != Number(item.mrp) || item.mrp  == '')
			item.mrp = 0
		item.net_amount = parseFloat(item.quantity) * parseFloat(item.mrp)
		item.tax_exclusive_amount = item.net_amount;
		if($scope.sales.bill_type == 'Invoice')
			item.net_amount = parseFloat(item.net_amount) + (parseFloat(item.net_amount) * parseFloat(item.tax/100))
		$scope.calculate_total_amount();
	}
	$scope.remove_item = function(item) {
		var index = $scope.sales.items.indexOf(item);
		$scope.sales.d_items.push(item);
		$scope.sales.items.splice(index, 1);
		$scope.calculate_total_amount();
	}
	$scope.save_sales = function(){
		if($scope.validate_sales()){
			$scope.sales.invoice_date = $('#invoice_date').val();
			for(var i = 0; i < $scope.sales.items.length; i++){
				if($scope.sales.items[i].item_search == true)
					$scope.sales.items[i].item_search = "true";
				else
					$scope.sales.items[i].item_search = "false"
				if($scope.sales.items[i].net_freight_charge == null){
					$scope.sales.items[i].net_freight_charge = '';
					
				}
				if($scope.sales.items[i].net_cp == null){
					$scope.sales.items[i].net_cp = '';
				}
			if($scope.sales.customer_tin == null)
				$scope.sales.customer_tin = '';
			if($scope.sales.owner_tin == null)
				$scope.sales.owner_tin = '';
			if($scope.sales.do_no == null)
				$scope.sales.do_no = '';	
			}	
			params = {
				'sales_details': angular.toJson($scope.sales),
				'csrfmiddlewaretoken': $scope.csrf_token,
			}
			show_loader();
			$http({
				method: 'post',
				url: '/sales/edit_sales/',
				data: $.param(params),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).success(function(data){
				hide_loader();
				if(data.result == 'ok'){
					hide_sales_popup_divs($scope, $http);
					$scope.transaction_reference_no = data.transaction_reference_no;
					$scope.transaction_name = ' Sales ';
					hide_popup();
					$('#add_salesman_popup').css('display', 'none');
	    			$('#add_customer_popup').css('display', 'none');
					$('#transaction_reference_no_details').css('display', 'block');
					create_popup();
				} else {
					$scope.validate_sales_msg = data.message;
				}
			}).error(function(data, status){
				console.log('Request failed' || data);
			})
		}
	}
	$scope.search_customer = function(){
		if($scope.customer_name.length == 0){
			$scope.customers = "";
			$scope.no_customer_msg = "";
		} else {
			$scope.sales.customer = "";
			get_customer_search_list($scope, $http);
		}		
	}
	$scope.select_customer = function(customer){
		$scope.customer_name = customer.name;
		$scope.sales.customer = customer.id;
		$scope.customers = "";
		$scope.select_customer_flag = false;
		$scope.no_customer_msg = "";
		hide_sales_popup_divs();
		$scope.name = customer.name;
		// $scope.bonus_point = customer.bonus_point;
		// $('#view_bonus_amount').css('display', 'block');
		// create_popup();
	}
	$scope.new_customer = function(sales) {
		$scope.current_sales = sales;
	    $scope.customer= {
	        'name': '',
	        'area': '', 
	        'address': '',
	        'mobile': '',
	        'contact_number': '',
	        'email': '',
	    }
	    hide_sales_popup_divs();
	    $('#add_salesman_popup').css('display', 'none');
	    $('#add_customer_popup').css('display', 'block');
	    create_popup();
	}
	$scope.payment_mode_details = function(payment_mode) {
		hide_sales_popup_divs();
		$('#payment_details').css('display', 'block');
		$('#add_customer_popup').css('display', 'none');
		$('#add_salesman_popup').css('display', 'none');
		create_popup();
		if (payment_mode == 'cheque') {
			$scope.is_cheque_payment = true;
		} else if (payment_mode == 'card') {
			$scope.is_cheque_payment = false;
		} else {
			hide_sales_popup_divs();
		}
	}
	$scope.bank_account_details = function(payment_mode) {
		get_bank_account_details($scope, $http);
		$scope.sales.payment_mode = payment_mode;
		hide_sales_popup_divs();
		$('#bank_account_details').css('display', 'block');
		$('#add_customer_popup').css('display', 'none');
		$('#add_salesman_popup').css('display', 'none');
		$scope.other_bank_account = false;
		$scope.bank_account_error = '';
		$scope.bank_account = '';
		$scope.bank_account_name = '';
		if ($scope.sales.payment_mode == 'cheque') {
			$scope.is_cheque = true;
		} else {
			$scope.is_cheque = false;
		}
		create_popup();
	}
	$scope.hide_popup_payment_details = function() {
		$scope.sales.bank_name = $scope.bank_name;
		$scope.sales.branch = $scope.branch;
		$scope.sales.cheque_no = $scope.cheque_no;
		$scope.sales.card_no = $scope.card_no;
		$scope.sales.card_holder_name = $scope.card_holder_name;
		hide_popup();
	}
	$scope.add_bank_account_details = function() {
		if($scope.bank_account != ''){
			$scope.sales.bank_account_ledger = $scope.bank_account;
			$scope.payment_mode_details($scope.sales.payment_mode);
		}
	}
	$scope.hide_popup_transaction_details = function() {
		document.location.href = '/sales/sales_entry/?transaction_ref_no='+$scope.transaction_reference_no;
	}
	$scope.create_new_bank_acount = function() {
		if ($scope.bank_account_name == '' || $scope.bank_account_name == undefined) {
			$scope.bank_account_error = 'Please enter the Bank account name';
		} else {
			create_new_bank_acount($scope, $http, 'sales');
		}
	}
}