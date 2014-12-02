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
		get_serial_no($scope,$http,'Receipt');
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
			$scope.get_batch($scope.current_sales_item);
			get_item_uoms($scope, $http);
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
			console.log($scope.sales.items[i]);
			$scope.calculate_quantity_from_uom($scope.sales.items[i]);			
		}
	}
	$scope.get_batch = function(item){
		$http.get('/inventory/batch_item_details/?batch_id='+item.batch_id+'&item_id='+item.id).success(function(data){
        	item.stock = data.batch_item.quantity;
        	item.stock_unit = data.batch_item.stock_unit;
        	item.selling_units = [];
        	item.selling_units.push({
        		'unit': data.batch_item.selling_unit,
        	})
        	if(data.batch_item.selling_unit != data.batch_item.purchase_unit)
	        	item.selling_units.push({
	        		'unit': data.batch_item.purchase_unit,
	        	})
        	item.selling_unit = data.batch_item.selling_unit;
        	item.purchase_unit = data.batch_item.purchase_unit;
        	item.relation = data.batch_item.relation;
        	item.whole_sale_price = data.batch_item.whole_sale_price_sales;
        	item.retail_price = data.batch_item.retail_price_sales;
        	item.branch_price = data.batch_item.branch_price;
        	item.customer_card_price = data.batch_item.customer_card_price;
        	item.tax = data.batch_item.tax;
        	item.offer_quantity = data.batch_item.offer_quantity;
        	item.packets_per_box = data.batch_item.packets_per_box;
        	item.pieces_per_box = data.batch_item.pieces_per_box;
        	item.pieces_per_packet = data.batch_item.pieces_per_packet;
        	item.unit_per_piece = data.batch_item.unit_per_piece;
        	item.smallest_unit = data.batch_item.smallest_unit;
        	item.unit_per_packet = data.batch_item.unit_per_packet;
        	item.item_uom = data.batch_item.item_uom;
        	item.cost_price = data.batch_item.cost_price;
        	item.freight_charge = data.batch_item.freight_charge;
        	if(item.price_type == 'Retail Price')
        		item.mrp = data.batch_item.retail_price_sales;
        	if(item.price_type == 'Whole Sale Price')
        		item.mrp = data.batch_item.whole_sale_price_sales;
        	if(item.price_type == 'Branch Price')
        		item.mrp = data.batch_item.branch_price;
        	if(item.price_type == 'Customer Card Price')
        		item.mrp = data.batch_item.customer_card_price;
	    }).error(function(data, status) {
	    	console.log('Request failed' || data);
	    });
	}
	$scope.calculate_quantity_from_uom = function(item){
		console.log(item)
		$scope.validate_sales_msg = "";
	    if(item.price_type == 'Retail Price')
    		item.mrp = item.retail_price;
    	if(item.price_type == 'Whole Sale Price')
    		item.mrp = item.whole_sale_price;
    	if(item.price_type == 'Branch Price')
    		item.mrp = item.branch_price;
    	if(item.price_type == 'Customer Card Price')
    		item.mrp = item.customer_card_price;
    	item.current_item_price = item.mrp;
    	console.log(item.mrp)
		if(item.uom.uom == item.purchase_unit){
			if((item.quantity >= (item.offer_quantity)) && item.offer_quantity > 0)
				item.mrp = item.whole_sale_price
			item.current_item_price = item.mrp
			item.quantity_in_purchase_unit = item.quantity;
			item.current_item_cp = item.cost_price;
			item.current_item_freight_charge = item.freight_charge;
			if(item.quantity > item.stock){
				$scope.validate_sales_msg = "Out of Stock";
			}
		}else{
				if(item.uom.uom == 'box'){
					if(item.packets_per_box != '' && item.purchase_unit == 'packet'){
						item.current_item_price = parseFloat(item.mrp) * parseFloat(item.packets_per_box)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.packets_per_box)
						item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.packets_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.packets_per_box)
					} 
					else if(item.packets_per_box != '' && item.purchase_unit != 'packet'){
						if(item.unit_per_packet != '' && item.smallest_unit == item.purchase_unit){
							$scope.cost_per_packet = parseFloat(item.mrp) * parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_packet)
							if(item.packets_per_box != ''){
								console.log($scope.cost_per_packet);
								item.current_item_price = parseFloat($scope.cost_per_packet) * parseFloat(item.packets_per_box)
								item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) * parseFloat(item.packets_per_box)
								item.current_item_cp = parseFloat(item.current_item_cp) * parseFloat(item.packets_per_box)
								item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) * parseFloat(item.packets_per_box)
							}
						}
						if(item.pieces_per_packet != '' && item.purchase_unit == 'piece'){
							$scope.cost_per_packet = parseFloat(item.mrp) * parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.pieces_per_packet)
						} else if(item.pieces_per_packet != '' && item.purchase_unit != 'piece'){
							if(item.unit_per_piece != '' && item.smallest_unit == item.purchase_unit){
								$scope.cost_per_piece = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)	
								item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
								item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
								item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
							}
							$scope.cost_per_packet = parseFloat($scope.cost_per_piece) * parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) * parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.current_item_cp) * parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) * parseFloat(item.pieces_per_packet)
						}
						item.current_item_price = parseFloat(item.packets_per_box) * parseFloat($scope.cost_per_packet);
						item.quantity_in_purchase_unit = parseFloat(item.packets_per_box) * parseFloat(item.quantity_in_purchase_unit)
						item.current_item_cp = parseFloat(item.packets_per_box) * parseFloat(item.current_item_cp)
						item.current_item_freight_charge = parseFloat(item.packets_per_box) * parseFloat(item.current_item_freight_charge)
					}
					else if(item.pieces_per_box != '' && item.purchase_unit == 'piece'){
						item.current_item_price = parseFloat(item.mrp) * parseFloat(item.pieces_per_box)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.pieces_per_box)
						item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.pieces_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.pieces_per_box)
					}
					else if(item.pieces_per_box != '' && item.purchase_unit != 'piece'){
						if(item.unit_per_piece != '' && item.purchase_unit == item.smallest_unit){
							$scope.cost_per_piece = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
						}
						item.current_item_price = parseFloat(item.pieces_per_box) * parseFloat($scope.cost_per_piece);
						item.quantity_in_purchase_unit = parseFloat(item.pieces_per_box) * parseFloat(item.quantity_in_purchase_unit)
						item.current_item_cp = parseFloat(item.pieces_per_box) * parseFloat(item.current_item_cp)
						item.current_item_freight_charge = parseFloat(item.pieces_per_box) * parseFloat(item.current_item_freight_charge)
					}
				}
				else if(item.uom.uom == 'packet'){
					if(item.packets_per_box != '' && item.purchase_unit == 'box'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.packets_per_box)	
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.packets_per_box)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.packets_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.packets_per_box)
					}
					if(item.packets_per_box != '' && item.purchase_unit != 'box'){
						if(item.pieces_per_packet != '' && item.purchase_unit == 'piece'){
							item.current_item_price = parseFloat(item.pieces_per_packet) * parseFloat(item.mrp)
							item.quantity_in_purchase_unit = parseFloat(item.pieces_per_packet) * parseFloat(item.quantity)
							item.current_item_cp = parseFloat(item.pieces_per_packet) * parseFloat(item.cost_price)
							item.current_item_freight_charge = parseFloat(item.pieces_per_packet) * parseFloat(item.freight_charge)
						}
						if(item.pieces_per_packet != '' && item.purchase_unit != 'piece'){
							if(item.unit_per_piece != '' && item.purchase_unit == item.smallest_unit){
								$scope.cost_per_unit = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
								item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
								item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
								item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
							}
							item.current_item_price = parseFloat($scope.cost_per_unit) * parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) * parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.pieces_per_packet)
						}
						if(item.unit_per_packet != '' && item.purchase_unit == item.smallest_unit){
							item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_packet)
						}
					}
					if(item.pieces_per_packet != '' && item.purchase_unit == 'piece'){
						item.current_item_price = parseFloat(item.pieces_per_packet) * parseFloat(item.mrp)
						item.quantity_in_purchase_unit = parseFloat(item.pieces_per_packet) * parseFloat(item.quantity)
						item.current_item_cp = parseFloat(item.pieces_per_packet) * parseFloat(item.cost_price)
						item.current_item_freight_charge = parseFloat(item.pieces_per_packet) * parseFloat(item.freight_charge)
					}
					if(item.pieces_per_packet != '' && item.purchase_unit != 'piece'){
						if(item.unit_per_piece != '' && item.purchase_unit == item.smallest_unit){
							$scope.cost_per_unit = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
							item.current_item_price = parseFloat($scope.cost_per_unit) * parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) * parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.current_item_cp) * parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) * parseFloat(item.pieces_per_packet)
						}						
					}
					if(item.packets_per_box == '' && item.pieces_per_box == '' && item.pieces_per_packet == ''){
						if(item.unit_per_packet != '' && item.purchase_unit == item.smallest_unit){
							item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_packet)
						}
					}					
				}
				else if(item.uom.uom == 'piece'){
					if(item.packets_per_box != '' && item.purchase_unit == 'box'){
						$scope.cost_per_packet = parseFloat(item.mrp) / parseFloat(item.packets_per_box)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.packets_per_box)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.packets_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.packets_per_box)
						item.current_item_price = parseFloat($scope.cost_per_packet) / parseFloat(item.pieces_per_packet)
						item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.pieces_per_packet)
						item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.pieces_per_packet)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_packet)
					}
					if(item.packets_per_box != '' && item.purchase_unit != 'box'){
						if(item.packets_per_box != '' && item.purchase_unit == 'packet'){
							item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_packet)
						}
					}
					if(item.pieces_per_box != '' && item.purchase_unit == 'box'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_box)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_box)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_box)
					}
					if(item.pieces_per_packet != '' && item.purchase_unit == item.smallest_unit){
						item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
						item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
						item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
					}
					if(item.pieces_per_packet != '' && item.purchase_unit == 'packet'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_packet)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_packet)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_packet)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_packet)
					}
					if(item.pieces_per_box != '' && item.purchase_unit == item.smallest_unit){
						item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
						item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
						item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
					}
					if(item.packets_per_box == '' && item.pieces_per_box == '' && item.pieces_per_packet == ''){
						if(item.unit_per_piece != '' && item.purchase_unit == item.smallest_unit){
							item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
						}
					}					
				}
				else if(item.uom.uom == item.smallest_unit){
					if(item.purchase_unit == 'box'){
						if(item.packets_per_box != ''){
							$scope.cost_per_packet = parseFloat(item.mrp) / parseFloat(item.packets_per_box)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.packets_per_box)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.packets_per_box)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.packets_per_box)
							if(item.pieces_per_packet != ''){
								item.current_item_price = parseFloat($scope.cost_per_packet) / parseFloat(item.pieces_per_packet)
								item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.pieces_per_packet)
								item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.pieces_per_packet)
								item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.pieces_per_packet)
								if(item.unit_per_piece != ''){
									item.current_item_price = parseFloat(item.current_item_price) / parseFloat(item.unit_per_piece)
									item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.unit_per_piece)
									item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.unit_per_piece)
									item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.unit_per_piece)
								}
							}
							if(item.unit_per_packet != ''){
								item.current_item_price = parseFloat($scope.cost_per_packet) / parseFloat(item.unit_per_packet)
								item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.unit_per_packet)
								item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.unit_per_packet)
								item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.unit_per_packet)
							}
						}
						if(item.pieces_per_box != ''){
							item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_box)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_box)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_box)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_box)
							if(item.unit_per_piece != ''){
								item.current_item_price = parseFloat(item.current_item_price) / parseFloat(item.unit_per_piece)
								item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.unit_per_piece)
								item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.unit_per_piece)
								item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.unit_per_piece)
							}
						}
					}
					if(item.packets_per_box != '' && item.purchase_unit == 'packet'){
						if(item.unit_per_packet != ''){
							item.current_item_price = parseFloat(item.mrp) / parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.unit_per_packet)
						}
					}

					if((item.pieces_per_packet != '' || item.unit_per_piece != '') && item.purchase_unit == 'piece'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.unit_per_piece)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.unit_per_piece)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.unit_per_piece)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.unit_per_piece)
					}

					if(item.pieces_per_packet != '' && item.purchase_unit == 'packet'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_packet)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_packet)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_packet)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_packet)
						if(item.unit_per_piece != ''){
							item.current_item_price = parseFloat(item.current_item_price) / parseFloat(item.unit_per_piece)
							item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.unit_per_piece)
							item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.unit_per_piece)
							item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.unit_per_piece)
						}
					}
					if(item.packets_per_box == '' && item.pieces_per_box == '' && item.pieces_per_packet == ''){
						if(item.unit_per_packet != ''){
							item.current_item_price = parseFloat(item.mrp) / parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.unit_per_packet)
						}
					}
				}
			}
		if(item.quantity_in_purchase_unit > item.stock){
			$scope.validate_sales_msg = "Out of Stock";
		}

		if(item.quantity != '' && Number(item.quantity) && item.uom != ""){
			item.net_amount = parseFloat(item.quantity) * parseFloat(item.current_item_price);
			item.net_cp = parseFloat(item.quantity) * parseFloat(item.current_item_cp);
			item.tax_exclusive_amount = item.net_amount;
			item.net_freight_charge = parseFloat(item.current_item_freight_charge) * parseFloat(item.quantity);
			console.log(item.net_freight_charge,item.net_cp)
			if($scope.sales.bill_type == 'Invoice'){
				item.net_amount = parseFloat(item.net_amount) + (parseFloat(item.net_amount) * parseFloat(item.tax/100));
			}
		}
		else if(item.quantity.length == 0)
			item.net_amount = "";
		if (item.current_item_price)
			item.current_item_price = item.current_item_price.toFixed(2);
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
		} for(var i = 0; i < $scope.sales.items.length; i++){
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
		if (item.mrp != Number(item.mrp) || item.mrp  == '')
			item.mrp = 0
		item.net_amount = parseFloat(item.quantity) * parseFloat(item.mrp)
		item.tax_exclusive_amount = item.net_amount;
		if($scope.sales.bill_type == 'Invoice')
			item.net_amount = parseFloat(item.net_amount) + (parseFloat(item.net_amount) * parseFloat(item.tax/100))
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
		console.log($scope.cheque_no)
		$scope.sales.cheque_no = $scope.cheque_no;
		console.log($scope.sales.cheque_no)
		$scope.sales.card_no = $scope.card_no;
		$scope.sales.card_holder_name = $scope.card_holder_name;
		$scope.sales.cheque_date = document.getElementById("cheque_date").value;
		hide_sales_popup_divs();
	}
}
function SalesViewController($scope, $http){
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
		console.log($scope.sales_view.cheque_no)
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
		$http.get('/inventory/batch_item_details/?batch_id='+item.batch_id+'&item_id='+item.item_id).success(function(data){
        	item.stock = data.batch_item.quantity;
        	item.stock_unit = data.batch_item.stock_unit;
        	item.selling_units = [];
        	item.selling_units.push({
        		'unit': data.batch_item.selling_unit,
        	})
        	if(data.batch_item.selling_unit != data.batch_item.purchase_unit)
	        	item.selling_units.push({
	        		'unit': data.batch_item.purchase_unit,
	        	})
	        item.quantity_in_purchase_unit = data.batch_item.quantity;
        	item.selling_unit = data.batch_item.selling_unit;
        	item.purchase_unit = data.batch_item.purchase_unit;
        	item.whole_sale_price = data.batch_item.whole_sale_price_sales;
        	item.retail_price = data.batch_item.retail_price_sales;
        	item.branch_price = data.batch_item.branch_price;
        	item.customer_card_price = data.batch_item.customer_card_price;
        	item.tax = data.batch_item.tax;
        	item.packets_per_box = data.batch_item.packets_per_box;
        	item.pieces_per_box = data.batch_item.pieces_per_box;
        	item.pieces_per_packet = data.batch_item.pieces_per_packet;
        	item.unit_per_piece = data.batch_item.unit_per_piece;
        	item.smallest_unit = data.batch_item.smallest_unit;
        	item.unit_per_packet = data.batch_item.unit_per_packet;
        	item.uom = data.batch_item.uom;
        	item.cost_price = data.batch_item.cost_price;
        	item.freight_charge = data.batch_item.freight_charge;
        	if(item.price_type == 'Retail Price')
        		item.mrp = data.batch_item.retail_price_sales;
        	if(item.price_type == 'Whole Sale Price')
        		item.mrp = data.batch_item.whole_sale_price_sales;
        	if(item.price_type == 'Branch Price')
        		item.mrp = data.batch_item.branch_price;
        	if(item.price_type == 'Customer Card Price')
        		item.mrp = data.batch_item.customer_card_price;
        	$scope.current_sales_item.id = item.item_id;
        	
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
		if ($scope.current_sales_item.item_id) {
			$scope.get_batch($scope.current_sales_item);
			$scope.current_sales_item.id = $scope.current_sales_item.item_id;
			get_item_uoms($scope, $http);
		}
		$scope.current_sales_item.batches = [];
	}
	$scope.calculate_quantity_from_uom = function(item){
		$scope.validate_sales_msg = "";
	    if(item.price_type == 'Retail Price')
    		item.mrp = item.retail_price;
    	if(item.price_type == 'Whole Sale Price')
    		item.mrp = item.whole_sale_price;
    	if(item.price_type == 'Branch Price')
    		item.mrp = item.branch_price;
    	if(item.price_type == 'Customer Card Price')
    		item.mrp = item.customer_card_price;
    	item.current_item_price = item.mrp;
		if(item.uoms.uom == item.purchase_unit){
			if((item.quantity >= (item.offer_quantity)) && item.offer_quantity > 0)
				item.mrp = item.whole_sale_price
			item.current_item_price = item.mrp
			item.quantity_in_purchase_unit = item.quantity;
			item.current_item_cp = item.cost_price;
			item.current_item_freight_charge = item.freight_charge;
			if(item.quantity > item.stock){
				$scope.validate_sales_msg = "Out of Stock";
			}
		} else {
				if(item.uoms.uom == 'box'){
					if(item.packets_per_box != '' && item.purchase_unit == 'packet'){
						item.current_item_price = parseFloat(item.mrp) * parseFloat(item.packets_per_box)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.packets_per_box)
						item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.packets_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.packets_per_box)
					} 
					else if(item.packets_per_box != '' && item.purchase_unit != 'packet'){
						if(item.unit_per_packet != '' && item.smallest_unit == item.purchase_unit){
							$scope.cost_per_packet = parseFloat(item.mrp) * parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_packet)
							if(item.packets_per_box != ''){
								console.log($scope.cost_per_packet);
								item.current_item_price = parseFloat($scope.cost_per_packet) * parseFloat(item.packets_per_box)
								item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) * parseFloat(item.packets_per_box)
								item.current_item_cp = parseFloat(item.current_item_cp) * parseFloat(item.packets_per_box)
								item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) * parseFloat(item.packets_per_box)
							}
						}
						if(item.pieces_per_packet != '' && item.purchase_unit == 'piece'){
							$scope.cost_per_packet = parseFloat(item.mrp) * parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.pieces_per_packet)
						} else if(item.pieces_per_packet != '' && item.purchase_unit != 'piece'){
							if(item.unit_per_piece != '' && item.smallest_unit == item.purchase_unit){
								$scope.cost_per_piece = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)	
								item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
								item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
								item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
							}
							$scope.cost_per_packet = parseFloat($scope.cost_per_piece) * parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) * parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.current_item_cp) * parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) * parseFloat(item.pieces_per_packet)
						}
						item.current_item_price = parseFloat(item.packets_per_box) * parseFloat($scope.cost_per_packet);
						item.quantity_in_purchase_unit = parseFloat(item.packets_per_box) * parseFloat(item.quantity_in_purchase_unit)
						item.current_item_cp = parseFloat(item.packets_per_box) * parseFloat(item.current_item_cp)
						item.current_item_freight_charge = parseFloat(item.packets_per_box) * parseFloat(item.current_item_freight_charge)
					}
					else if(item.pieces_per_box != '' && item.purchase_unit == 'piece'){
						item.current_item_price = parseFloat(item.mrp) * parseFloat(item.pieces_per_box)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.pieces_per_box)
						item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.pieces_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.pieces_per_box)
					}
					else if(item.pieces_per_box != '' && item.purchase_unit != 'piece'){
						if(item.unit_per_piece != '' && item.purchase_unit == item.smallest_unit){
							$scope.cost_per_piece = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
						}
						item.current_item_price = parseFloat(item.pieces_per_box) * parseFloat($scope.cost_per_piece);
						item.quantity_in_purchase_unit = parseFloat(item.pieces_per_box) * parseFloat(item.quantity_in_purchase_unit)
						item.current_item_cp = parseFloat(item.pieces_per_box) * parseFloat(item.current_item_cp)
						item.current_item_freight_charge = parseFloat(item.pieces_per_box) * parseFloat(item.current_item_freight_charge)
					}
				}
				else if(item.uoms.uom == 'packet'){
					if(item.packets_per_box != '' && item.purchase_unit == 'box'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.packets_per_box)	
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.packets_per_box)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.packets_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.packets_per_box)
					}
					if(item.packets_per_box != '' && item.purchase_unit != 'box'){
						if(item.pieces_per_packet != '' && item.purchase_unit == 'piece'){
							item.current_item_price = parseFloat(item.pieces_per_packet) * parseFloat(item.mrp)
							item.quantity_in_purchase_unit = parseFloat(item.pieces_per_packet) * parseFloat(item.quantity)
							item.current_item_cp = parseFloat(item.pieces_per_packet) * parseFloat(item.cost_price)
							item.current_item_freight_charge = parseFloat(item.pieces_per_packet) * parseFloat(item.freight_charge)
						}
						if(item.pieces_per_packet != '' && item.purchase_unit != 'piece'){
							if(item.unit_per_piece != '' && item.purchase_unit == item.smallest_unit){
								$scope.cost_per_unit = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
								item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
								item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
								item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
							}
							item.current_item_price = parseFloat($scope.cost_per_unit) * parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) * parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.pieces_per_packet)
						}
						if(item.unit_per_packet != '' && item.purchase_unit == item.smallest_unit){
							item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_packet)
						}
					}
					if(item.pieces_per_packet != '' && item.purchase_unit == 'piece'){
						item.current_item_price = parseFloat(item.pieces_per_packet) * parseFloat(item.mrp)
						item.quantity_in_purchase_unit = parseFloat(item.pieces_per_packet) * parseFloat(item.quantity)
						item.current_item_cp = parseFloat(item.pieces_per_packet) * parseFloat(item.cost_price)
						item.current_item_freight_charge = parseFloat(item.pieces_per_packet) * parseFloat(item.freight_charge)
					}
					if(item.pieces_per_packet != '' && item.purchase_unit != 'piece'){
						if(item.unit_per_piece != '' && item.purchase_unit == item.smallest_unit){
							$scope.cost_per_unit = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
							item.current_item_price = parseFloat($scope.cost_per_unit) * parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) * parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.current_item_cp) * parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) * parseFloat(item.pieces_per_packet)
						}						
					}
					if(item.packets_per_box == '' && item.pieces_per_box == '' && item.pieces_per_packet == ''){
						if(item.unit_per_packet != '' && item.purchase_unit == item.smallest_unit){
							item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_packet)
						}
					}					
				}
				else if(item.uoms.uom == 'piece'){
					if(item.packets_per_box != '' && item.purchase_unit == 'box'){
						$scope.cost_per_packet = parseFloat(item.mrp) / parseFloat(item.packets_per_box)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.packets_per_box)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.packets_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.packets_per_box)
						item.current_item_price = parseFloat($scope.cost_per_packet) / parseFloat(item.pieces_per_packet)
						item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.pieces_per_packet)
						item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.pieces_per_packet)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_packet)
					}
					if(item.packets_per_box != '' && item.purchase_unit != 'box'){
						if(item.packets_per_box != '' && item.purchase_unit == 'packet'){
							item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_packet)
						}
					}
					if(item.pieces_per_box != '' && item.purchase_unit == 'box'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_box)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_box)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_box)
					}
					if(item.pieces_per_packet != '' && item.purchase_unit == item.smallest_unit){
						item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
						item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
						item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
					}
					if(item.pieces_per_packet != '' && item.purchase_unit == 'packet'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_packet)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_packet)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_packet)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_packet)
					}
					if(item.pieces_per_box != '' && item.purchase_unit == item.smallest_unit){
						item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
						item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
						item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
					}
					if(item.packets_per_box == '' && item.pieces_per_box == '' && item.pieces_per_packet == ''){
						if(item.unit_per_piece != '' && item.purchase_unit == item.smallest_unit){
							item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
						}
					}					
				}
				else if(item.uoms.uom == item.smallest_unit){
					if(item.purchase_unit == 'box'){
						if(item.packets_per_box != ''){
							$scope.cost_per_packet = parseFloat(item.mrp) / parseFloat(item.packets_per_box)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.packets_per_box)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.packets_per_box)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.packets_per_box)
							if(item.pieces_per_packet != ''){
								item.current_item_price = parseFloat($scope.cost_per_packet) / parseFloat(item.pieces_per_packet)
								item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.pieces_per_packet)
								item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.pieces_per_packet)
								item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.pieces_per_packet)
								if(item.unit_per_piece != ''){
									item.current_item_price = parseFloat(item.current_item_price) / parseFloat(item.unit_per_piece)
									item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.unit_per_piece)
									item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.unit_per_piece)
									item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.unit_per_piece)
								}
							}
							if(item.unit_per_packet != ''){
								item.current_item_price = parseFloat($scope.cost_per_packet) / parseFloat(item.unit_per_packet)
								item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.unit_per_packet)
								item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.unit_per_packet)
								item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.unit_per_packet)
							}
						}
						if(item.pieces_per_box != ''){
							item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_box)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_box)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_box)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_box)
							if(item.unit_per_piece != ''){
								item.current_item_price = parseFloat(item.current_item_price) / parseFloat(item.unit_per_piece)
								item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.unit_per_piece)
								item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.unit_per_piece)
								item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.unit_per_piece)
							}
						}
					}
					if(item.packets_per_box != '' && item.purchase_unit == 'packet'){
						if(item.unit_per_packet != ''){
							item.current_item_price = parseFloat(item.mrp) / parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.unit_per_packet)
						}
					}

					if((item.pieces_per_packet != '' || item.unit_per_piece != '') && item.purchase_unit == 'piece'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.unit_per_piece)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.unit_per_piece)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.unit_per_piece)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.unit_per_piece)
					}

					if(item.pieces_per_packet != '' && item.purchase_unit == 'packet'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_packet)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_packet)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_packet)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_packet)
						if(item.unit_per_piece != ''){
							item.current_item_price = parseFloat(item.current_item_price) / parseFloat(item.unit_per_piece)
							item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.unit_per_piece)
							item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.unit_per_piece)
							item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.unit_per_piece)
						}
					}
					if(item.packets_per_box == '' && item.pieces_per_box == '' && item.pieces_per_packet == ''){
						if(item.unit_per_packet != ''){
							item.current_item_price = parseFloat(item.mrp) / parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.unit_per_packet)
						}
					}
				}
			}
		if(item.quantity_in_purchase_unit > item.stock){
			$scope.validate_sales_msg = "Out of Stock";
		}

		if(item.quantity != '' && Number(item.quantity) && item.uom != ""){
			item.net_amount = parseFloat(item.quantity) * parseFloat(item.mrp);
			// item.net_cp = parseFloat(item.quantity) * parseFloat(item.current_item_cp);
			item.tax_exclusive_amount = item.net_amount;
			// item.net_freight_charge = parseFloat(item.current_item_freight_charge) * parseFloat(item.quantity);
			// console.log(item.net_cp,item.net_freight_charge)
			if($scope.sales.bill_type == 'Invoice'){
				item.net_amount = parseFloat(item.net_amount) + (parseFloat(item.net_amount) * parseFloat(item.tax/100));
			}
		}
		else if(item.quantity.length == 0)
			item.net_amount = "";
		if (item.current_item_price)
			item.current_item_price = item.current_item_price.toFixed(2);
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
		} for(var i = 0; i < $scope.sales.items.length; i++){
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
					console.log($scope.sales.items[i].net_freight_charge)}
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
		document.location.href = '/sales/edited_sales_entry?transaction_ref_no='+$scope.transaction_reference_no;
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
			$scope.get_batch($scope.current_estimate_item);
			get_item_uoms($scope, $http);
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
	$scope.select_batch = function(batch){
		$scope.current_estimate_item.batch_name = batch.name;
		$scope.current_estimate_item.batch_id = batch.id;
		$scope.batch_items_list = "";
		if ($scope.current_estimate_item.id) {
			$scope.get_batch($scope.current_estimate_item);
			get_item_uoms($scope, $http);
		}
		$scope.current_estimate_item.batches = "";
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
	$scope.change_price_type = function(){
		for(var i = 0; i < $scope.estimate.items.length; i++){
			if($scope.select_all_price_type == true){
				$scope.estimate.items[i].price_type = false;
				$scope.estimate.items[i].mrp = $scope.estimate.items[i].retail_price;
			}
			else{
				$scope.estimate.items[i].price_type = true;
				$scope.estimate.items[i].mrp = $scope.estimate.items[i].whole_sale_price;
			}
			if($scope.estimate.items[i].uom == $scope.estimate.items[i].stock_unit){
				$scope.estimate.items[i].current_item_price = $scope.estimate.items[i].mrp
			} else if($scope.estimate.items[i].uom == $scope.estimate.items[i].purchase_unit){
				$scope.estimate.items[i].current_item_price = parseFloat($scope.estimate.items[i].mrp) * parseFloat($scope.estimate.items[i].relation);
			}
			if($scope.estimate.items[i].quantity != '' && Number($scope.estimate.items[i].quantity) && $scope.estimate.items[i].uom != ""){
				$scope.estimate.items[i].net_amount = parseFloat( $scope.estimate.items[i].quantity) * parseFloat($scope.estimate.items[i].current_item_price);
				$scope.estimate.items[i].tax_exclusive_amount = $scope.estimate.items[i].net_amount
				if($scope.estimate.bill_type == 'Invoice')
					$scope.estimate.items[i].net_amount = parseFloat($scope.estimate.items[i].net_amount) + (parseFloat($scope.estimate.items[i].net_amount) * parseFloat($scope.estimate.items[i].tax/100))
			}
			else if($scope.estimate.items[i].quantity.length == 0){
				$scope.estimate.items[i].net_amount = "";
				$scope.estimate.items[i].tax_exclusive_amount = "";
			}
		}
		$scope.calculate_total_amount();
	}
	$scope.get_batch = function(item){
		$http.get('/inventory/batch_item_details/?batch_id='+item.batch_id+'&item_id='+item.id).success(function(data){
        	item.stock = data.batch_item.quantity;
        	if (item.stock == ''|| item.stock==undefined){
        		$scope.validate_estimate_msg = "There is no stock for the choosen batch";
        	}
        	console.log(data.quantity)
        	item.stock_unit = data.batch_item.stock_unit;
        	item.selling_units = [];
        	item.selling_units.push({
        		'unit': data.batch_item.selling_unit,
        	})
        	item.selling_units.push({
        		'unit': data.batch_item.purchase_unit,
        	})
        	item.selling_unit = data.batch_item.selling_unit;
        	item.purchase_unit = data.batch_item.purchase_unit;
        	item.relation = data.batch_item.relation;
        	item.cost_price = data.batch_item.cost_price;
        	item.freight_charge = data.batch_item.freight_charge;
        	item.whole_sale_price = data.batch_item.whole_sale_price_sales;
        	item.retail_price = data.batch_item.retail_price_sales;
        	item.branch_price = data.batch_item.branch_price;
        	item.customer_card_price = data.batch_item.customer_card_price;
        	item.tax = data.batch_item.tax;
        	item.offer_quantity = data.batch_item.offer_quantity;
        	if(item.price_type == 'Retail Price')
        		item.mrp = data.batch_item.retail_price_sales;
        	if(item.price_type == 'Whole Sale Price')
        		item.mrp = data.batch_item.whole_sale_price_sales;
        	if(item.price_type == 'Branch Price')
        		item.mrp = data.batch_item.branch_price;
        	if(item.price_type == 'Customer Card Price')
        		item.mrp = data.batch_item.customer_card_price;
        	console.log(item.mrp)
        	// if(item.price_type == false)
        	// 	item.mrp = data.retail_price_sales;
        	// if(item.price_type == true)
        	// 	item.mrp = data.whole_sale_price_sales;
	    }).error(function(data, status) {
	    	console.log('Request failed' || data);
	    });
	}
	$scope.calculate_quantity_from_uom = function(item){
		console.log(item)
		$scope.validate_sales_msg = "";
	    if(item.price_type == 'Retail Price')
    		item.mrp = item.retail_price;
    	if(item.price_type == 'Whole Sale Price')
    		item.mrp = item.whole_sale_price;
    	if(item.price_type == 'Branch Price')
    		item.mrp = item.branch_price;
    	if(item.price_type == 'Customer Card Price')
    		item.mrp = item.customer_card_price;
    	item.current_item_price = item.mrp;
		if(item.uom.uom == item.purchase_unit){
			if((item.quantity >= (item.offer_quantity)) && item.offer_quantity > 0)
				item.mrp = item.whole_sale_price
			item.current_item_price = item.mrp
			item.quantity_in_purchase_unit = item.quantity;
			console.log(item.cost_price,item.freight_charge)
			item.current_item_cp = item.cost_price;
			item.current_item_freight_charge = item.freight_charge;
			if(item.quantity > item.stock){
				$scope.validate_sales_msg = "Out of Stock";
			}
		}else{
				if(item.uom.uom == 'box'){
					if(item.packets_per_box != '' && item.purchase_unit == 'packet'){
						item.current_item_price = parseFloat(item.mrp) * parseFloat(item.packets_per_box)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.packets_per_box)
						item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.packets_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.packets_per_box)
					} 
					else if(item.packets_per_box != '' && item.purchase_unit != 'packet'){
						if(item.unit_per_packet != '' && item.smallest_unit == item.purchase_unit){
							$scope.cost_per_packet = parseFloat(item.mrp) * parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_packet)
							if(item.packets_per_box != ''){
								console.log($scope.cost_per_packet);
								item.current_item_price = parseFloat($scope.cost_per_packet) * parseFloat(item.packets_per_box)
								item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) * parseFloat(item.packets_per_box)
								item.current_item_cp = parseFloat(item.current_item_cp) * parseFloat(item.packets_per_box)
								item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) * parseFloat(item.packets_per_box)
							}
						}
						if(item.pieces_per_packet != '' && item.purchase_unit == 'piece'){
							$scope.cost_per_packet = parseFloat(item.mrp) * parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.pieces_per_packet)
						} else if(item.pieces_per_packet != '' && item.purchase_unit != 'piece'){
							if(item.unit_per_piece != '' && item.smallest_unit == item.purchase_unit){
								$scope.cost_per_piece = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)	
								item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
								item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
								item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
							}
							$scope.cost_per_packet = parseFloat($scope.cost_per_piece) * parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) * parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.current_item_cp) * parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) * parseFloat(item.pieces_per_packet)
						}
						item.current_item_price = parseFloat(item.packets_per_box) * parseFloat($scope.cost_per_packet);
						item.quantity_in_purchase_unit = parseFloat(item.packets_per_box) * parseFloat(item.quantity_in_purchase_unit)
						item.current_item_cp = parseFloat(item.packets_per_box) * parseFloat(item.current_item_cp)
						item.current_item_freight_charge = parseFloat(item.packets_per_box) * parseFloat(item.current_item_freight_charge)
					}
					else if(item.pieces_per_box != '' && item.purchase_unit == 'piece'){
						item.current_item_price = parseFloat(item.mrp) * parseFloat(item.pieces_per_box)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.pieces_per_box)
						item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.pieces_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.pieces_per_box)
					}
					else if(item.pieces_per_box != '' && item.purchase_unit != 'piece'){
						if(item.unit_per_piece != '' && item.purchase_unit == item.smallest_unit){
							$scope.cost_per_piece = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
						}
						item.current_item_price = parseFloat(item.pieces_per_box) * parseFloat($scope.cost_per_piece);
						item.quantity_in_purchase_unit = parseFloat(item.pieces_per_box) * parseFloat(item.quantity_in_purchase_unit)
						item.current_item_cp = parseFloat(item.pieces_per_box) * parseFloat(item.current_item_cp)
						item.current_item_freight_charge = parseFloat(item.pieces_per_box) * parseFloat(item.current_item_freight_charge)
					}
				}
				else if(item.uom.uom == 'packet'){
					if(item.packets_per_box != '' && item.purchase_unit == 'box'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.packets_per_box)	
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.packets_per_box)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.packets_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.packets_per_box)
					}
					if(item.packets_per_box != '' && item.purchase_unit != 'box'){
						if(item.pieces_per_packet != '' && item.purchase_unit == 'piece'){
							item.current_item_price = parseFloat(item.pieces_per_packet) * parseFloat(item.mrp)
							item.quantity_in_purchase_unit = parseFloat(item.pieces_per_packet) * parseFloat(item.quantity)
							item.current_item_cp = parseFloat(item.pieces_per_packet) * parseFloat(item.cost_price)
							item.current_item_freight_charge = parseFloat(item.pieces_per_packet) * parseFloat(item.freight_charge)
						}
						if(item.pieces_per_packet != '' && item.purchase_unit != 'piece'){
							if(item.unit_per_piece != '' && item.purchase_unit == item.smallest_unit){
								$scope.cost_per_unit = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
								item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
								item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
								item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
							}
							item.current_item_price = parseFloat($scope.cost_per_unit) * parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) * parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.pieces_per_packet)
						}
						if(item.unit_per_packet != '' && item.purchase_unit == item.smallest_unit){
							item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_packet)
						}
					}
					if(item.pieces_per_packet != '' && item.purchase_unit == 'piece'){
						item.current_item_price = parseFloat(item.pieces_per_packet) * parseFloat(item.mrp)
						item.quantity_in_purchase_unit = parseFloat(item.pieces_per_packet) * parseFloat(item.quantity)
						item.current_item_cp = parseFloat(item.pieces_per_packet) * parseFloat(item.cost_price)
						item.current_item_freight_charge = parseFloat(item.pieces_per_packet) * parseFloat(item.freight_charge)
					}
					if(item.pieces_per_packet != '' && item.purchase_unit != 'piece'){
						if(item.unit_per_piece != '' && item.purchase_unit == item.smallest_unit){
							$scope.cost_per_unit = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
							item.current_item_price = parseFloat($scope.cost_per_unit) * parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) * parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.current_item_cp) * parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) * parseFloat(item.pieces_per_packet)
						}						
					}
					if(item.packets_per_box == '' && item.pieces_per_box == '' && item.pieces_per_packet == ''){
						if(item.unit_per_packet != '' && item.purchase_unit == item.smallest_unit){
							item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_packet)
						}
					}					
				}
				else if(item.uom.uom == 'piece'){
					if(item.packets_per_box != '' && item.purchase_unit == 'box'){
						$scope.cost_per_packet = parseFloat(item.mrp) / parseFloat(item.packets_per_box)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.packets_per_box)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.packets_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.packets_per_box)
						item.current_item_price = parseFloat($scope.cost_per_packet) / parseFloat(item.pieces_per_packet)
						item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.pieces_per_packet)
						item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.pieces_per_packet)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_packet)
					}
					if(item.packets_per_box != '' && item.purchase_unit != 'box'){
						if(item.packets_per_box != '' && item.purchase_unit == 'packet'){
							item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_packet)
						}
					}
					if(item.pieces_per_box != '' && item.purchase_unit == 'box'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_box)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_box)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_box)
					}
					if(item.pieces_per_packet != '' && item.purchase_unit == item.smallest_unit){
						item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
						item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
						item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
					}
					if(item.pieces_per_packet != '' && item.purchase_unit == 'packet'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_packet)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_packet)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_packet)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_packet)
					}
					if(item.pieces_per_box != '' && item.purchase_unit == item.smallest_unit){
						item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
						item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
						item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
					}
					if(item.packets_per_box == '' && item.pieces_per_box == '' && item.pieces_per_packet == ''){
						if(item.unit_per_piece != '' && item.purchase_unit == item.smallest_unit){
							item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
						}
					}					
				}
				else if(item.uom.uom == item.smallest_unit){
					if(item.purchase_unit == 'box'){
						if(item.packets_per_box != ''){
							$scope.cost_per_packet = parseFloat(item.mrp) / parseFloat(item.packets_per_box)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.packets_per_box)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.packets_per_box)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.packets_per_box)
							if(item.pieces_per_packet != ''){
								item.current_item_price = parseFloat($scope.cost_per_packet) / parseFloat(item.pieces_per_packet)
								item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.pieces_per_packet)
								item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.pieces_per_packet)
								item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.pieces_per_packet)
								if(item.unit_per_piece != ''){
									item.current_item_price = parseFloat(item.current_item_price) / parseFloat(item.unit_per_piece)
									item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.unit_per_piece)
									item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.unit_per_piece)
									item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.unit_per_piece)
								}
							}
							if(item.unit_per_packet != ''){
								item.current_item_price = parseFloat($scope.cost_per_packet) / parseFloat(item.unit_per_packet)
								item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.unit_per_packet)
								item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.unit_per_packet)
								item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.unit_per_packet)
							}
						}
						if(item.pieces_per_box != ''){
							item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_box)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_box)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_box)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_box)
							if(item.unit_per_piece != ''){
								item.current_item_price = parseFloat(item.current_item_price) / parseFloat(item.unit_per_piece)
								item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.unit_per_piece)
								item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.unit_per_piece)
								item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.unit_per_piece)
							}
						}
					}
					if(item.packets_per_box != '' && item.purchase_unit == 'packet'){
						if(item.unit_per_packet != ''){
							item.current_item_price = parseFloat(item.mrp) / parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.unit_per_packet)
						}
					}

					if((item.pieces_per_packet != '' || item.unit_per_piece != '') && item.purchase_unit == 'piece'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.unit_per_piece)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.unit_per_piece)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.unit_per_piece)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.unit_per_piece)
					}

					if(item.pieces_per_packet != '' && item.purchase_unit == 'packet'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_packet)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_packet)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_packet)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_packet)
						if(item.unit_per_piece != ''){
							item.current_item_price = parseFloat(item.current_item_price) / parseFloat(item.unit_per_piece)
							item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.unit_per_piece)
							item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.unit_per_piece)
							item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.unit_per_piece)
						}
					}
					if(item.packets_per_box == '' && item.pieces_per_box == '' && item.pieces_per_packet == ''){
						if(item.unit_per_packet != ''){
							item.current_item_price = parseFloat(item.mrp) / parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.unit_per_packet)
						}
					}
				}
			}
		if(item.quantity_in_purchase_unit > item.stock){
			$scope.validate_estimate_msg = "Out of Stock";
		}
		
		if(item.stock){
			if(item.quantity != '' && Number(item.quantity) && item.uom != ""){
				console.log(item.current_item_cp,item.current_item_freight_charge)
				item.net_amount = parseFloat(item.quantity) * parseFloat(item.current_item_price);
				item.net_cp = parseFloat(item.quantity) * parseFloat(item.current_item_cp);
				item.tax_exclusive_amount = item.net_amount;
				item.net_freight_charge = parseFloat(item.current_item_freight_charge) * parseFloat(item.quantity);
				if($scope.estimate.bill_type == 'Taxable'){
					item.net_amount = parseFloat(item.net_amount) + (parseFloat(item.net_amount) * parseFloat(item.tax/100));
				}
			}
			else if(item.quantity.length == 0)
				item.net_amount = "";
		}else{
			$scope.validate_estimate_msg = "There is no stock for the choosen batch";
			
		}
		if (item.current_item_price)
			item.current_item_price = item.current_item_price.toFixed(2);
		$scope.calculate_total_amount();
	}
	$scope.calculate_total_amount = function(){
		$scope.estimate.grant_total = 0;
		$scope.estimate.tax_exclusive_total = 0;
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
		}else if($scope.estimate.discount != Number($scope.estimate.discount)){

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
				if($scope.estimate.items[i].price_type == true)
					$scope.estimate.items[i].price_type = "true"
				else
					$scope.estimate.items[i].price_type = "false"
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
			console.log($scope.current_delivery_item.items)
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

		console.log(item);
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
	$scope.select_batch = function(batch){
		$scope.no_batch_msg = '';
		$scope.current_delivery_item.batch_name = batch.name;
		$scope.current_delivery_item.batch_id = batch.id;
		$scope.batch_items_list = "";
		if ($scope.current_delivery_item.id) {
			$scope.get_batch($scope.current_delivery_item);
			get_item_uoms($scope, $http);
		}
		$scope.current_delivery_item.batches = "";
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
		$scope.focusIndex = 0;
		$scope.current_delivery_item.batch_name = batch.name;
		$scope.current_delivery_item.batch_id = batch.id;
		$scope.batch_items_list = "";
		if ($scope.current_delivery_item.id) {
			$scope.get_batch($scope.current_delivery_item);
			get_item_uoms($scope, $http);
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
	$scope.change_price_type = function(){
		console.log("ssss")
		for(var i = 0; i < $scope.delivery.items.length; i++){
			if($scope.select_all_price_type == true){
				$scope.delivery.items[i].price_type = false;
				$scope.delivery.items[i].mrp = $scope.delivery.items[i].retail_price;
			}
			else{
				$scope.delivery.items[i].price_type = true;
				$scope.delivery.items[i].mrp = $scope.delivery.items[i].whole_sale_price;
			}
			if($scope.delivery.items[i].uom == $scope.delivery.items[i].stock_unit){
				$scope.delivery.items[i].current_item_price = $scope.delivery.items[i].mrp
			} else if($scope.delivery.items[i].uom == $scope.delivery.items[i].purchase_unit){
				$scope.delivery.items[i].current_item_price = parseFloat($scope.delivery.items[i].mrp) * parseFloat($scope.delivery.items[i].relation);
			}
			if($scope.delivery.items[i].quantity != '' && Number($scope.delivery.items[i].quantity) && $scope.delivery.items[i].uom != ""){
				$scope.delivery.items[i].net_amount = parseFloat( $scope.delivery.items[i].quantity) * parseFloat($scope.delivery.items[i].current_item_price);
				$scope.delivery.items[i].tax_exclusive_amount = $scope.delivery.items[i].net_amount
				if($scope.delivery.bill_type == 'Invoice')
					$scope.delivery.items[i].net_amount = parseFloat($scope.delivery.items[i].net_amount) + (parseFloat($scope.delivery.items[i].net_amount) * parseFloat($scope.delivery.items[i].tax/100))
			}
			else if($scope.delivery.items[i].quantity.length == 0){
				$scope.delivery.items[i].net_amount = "";
				$scope.delivery.items[i].tax_exclusive_amount = "";
			}
		}
		$scope.calculate_total_amount();
	}
	$scope.get_batch = function(item){
		$http.get('/inventory/batch_item_details/?batch_id='+item.batch_id+'&item_id='+item.id).success(function(data){
        	if (data.batch_item){
        		item.stock = data.batch_item.quantity;
	        	item.stock_unit = data.batch_item.stock_unit;
	        	item.selling_units = [];
	        	item.selling_units.push({
	        		'unit': data.batch_item.selling_unit,
	        	})
	        	item.selling_units.push({
	        		'unit': data.batch_item.purchase_unit,
	        	})
	        	item.selling_unit = data.batch_item.selling_unit;
	        	item.purchase_unit = data.batch_item.purchase_unit;
	        	item.relation = data.batch_item.relation;
	        	item.cost_price = data.batch_item.cost_price;
	        	item.freight_charge = data.batch_item.freight_charge;
	        	item.whole_sale_price = data.batch_item.whole_sale_price_sales;
	        	item.retail_price = data.batch_item.retail_price_sales;
	        	item.branch_price = data.batch_item.branch_price;
	        	item.customer_card_price = data.batch_item.customer_card_price;
	        	item.tax = data.batch_item.tax;
	        	item.offer_quantity = data.batch_item.offer_quantity;
	        	if(item.price_type == 'Retail Price')
	        		item.mrp = data.batch_item.retail_price_sales;
	        	if(item.price_type == 'Whole Sale Price')
	        		item.mrp = data.batch_item.whole_sale_price_sales;
	        	if(item.price_type == 'Branch Price')
	        		item.mrp = data.batch_item.branch_price;
	        	if(item.price_type == 'Customer Card Price')
	        		item.mrp = data.batch_item.customer_card_price;
	        } 

	    }).error(function(data, status) {
	    	console.log('Request failed' || data);
	    });
	}
	$scope.calculate_quantity_from_uom = function(item){
		console.log(item)
		$scope.validate_sales_msg = "";
	    if(item.price_type == 'Retail Price')
    		item.mrp = item.retail_price;
    	if(item.price_type == 'Whole Sale Price')
    		item.mrp = item.whole_sale_price;
    	if(item.price_type == 'Branch Price')
    		item.mrp = item.branch_price;
    	if(item.price_type == 'Customer Card Price')
    		item.mrp = item.customer_card_price;
    	item.current_item_price = item.mrp;
		if(item.uom.uom == item.purchase_unit){
			if((item.quantity >= (item.offer_quantity)) && item.offer_quantity > 0)
				item.mrp = item.whole_sale_price
			item.current_item_price = item.mrp
			item.quantity_in_purchase_unit = item.quantity;
			console.log(item.cost_price,item.freight_charge)
			item.current_item_cp = item.cost_price;
			item.current_item_freight_charge = item.freight_charge;
			if(item.quantity > item.stock){
				$scope.validate_delivery_msg = "Out of Stock";
			}
		}else{
				if(item.uom.uom == 'box'){
					if(item.packets_per_box != '' && item.purchase_unit == 'packet'){
						item.current_item_price = parseFloat(item.mrp) * parseFloat(item.packets_per_box)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.packets_per_box)
						item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.packets_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.packets_per_box)
					} 
					else if(item.packets_per_box != '' && item.purchase_unit != 'packet'){
						if(item.unit_per_packet != '' && item.smallest_unit == item.purchase_unit){
							$scope.cost_per_packet = parseFloat(item.mrp) * parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_packet)
							if(item.packets_per_box != ''){
								console.log($scope.cost_per_packet);
								item.current_item_price = parseFloat($scope.cost_per_packet) * parseFloat(item.packets_per_box)
								item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) * parseFloat(item.packets_per_box)
								item.current_item_cp = parseFloat(item.current_item_cp) * parseFloat(item.packets_per_box)
								item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) * parseFloat(item.packets_per_box)
							}
						}
						if(item.pieces_per_packet != '' && item.purchase_unit == 'piece'){
							$scope.cost_per_packet = parseFloat(item.mrp) * parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.pieces_per_packet)
						} else if(item.pieces_per_packet != '' && item.purchase_unit != 'piece'){
							if(item.unit_per_piece != '' && item.smallest_unit == item.purchase_unit){
								$scope.cost_per_piece = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)	
								item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
								item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
								item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
							}
							$scope.cost_per_packet = parseFloat($scope.cost_per_piece) * parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) * parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.current_item_cp) * parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) * parseFloat(item.pieces_per_packet)
						}
						item.current_item_price = parseFloat(item.packets_per_box) * parseFloat($scope.cost_per_packet);
						item.quantity_in_purchase_unit = parseFloat(item.packets_per_box) * parseFloat(item.quantity_in_purchase_unit)
						item.current_item_cp = parseFloat(item.packets_per_box) * parseFloat(item.current_item_cp)
						item.current_item_freight_charge = parseFloat(item.packets_per_box) * parseFloat(item.current_item_freight_charge)
					}
					else if(item.pieces_per_box != '' && item.purchase_unit == 'piece'){
						item.current_item_price = parseFloat(item.mrp) * parseFloat(item.pieces_per_box)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.pieces_per_box)
						item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.pieces_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.pieces_per_box)
					}
					else if(item.pieces_per_box != '' && item.purchase_unit != 'piece'){
						if(item.unit_per_piece != '' && item.purchase_unit == item.smallest_unit){
							$scope.cost_per_piece = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
						}
						item.current_item_price = parseFloat(item.pieces_per_box) * parseFloat($scope.cost_per_piece);
						item.quantity_in_purchase_unit = parseFloat(item.pieces_per_box) * parseFloat(item.quantity_in_purchase_unit)
						item.current_item_cp = parseFloat(item.pieces_per_box) * parseFloat(item.current_item_cp)
						item.current_item_freight_charge = parseFloat(item.pieces_per_box) * parseFloat(item.current_item_freight_charge)
					}
				}
				else if(item.uom.uom == 'packet'){
					if(item.packets_per_box != '' && item.purchase_unit == 'box'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.packets_per_box)	
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.packets_per_box)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.packets_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.packets_per_box)
					}
					if(item.packets_per_box != '' && item.purchase_unit != 'box'){
						if(item.pieces_per_packet != '' && item.purchase_unit == 'piece'){
							item.current_item_price = parseFloat(item.pieces_per_packet) * parseFloat(item.mrp)
							item.quantity_in_purchase_unit = parseFloat(item.pieces_per_packet) * parseFloat(item.quantity)
							item.current_item_cp = parseFloat(item.pieces_per_packet) * parseFloat(item.cost_price)
							item.current_item_freight_charge = parseFloat(item.pieces_per_packet) * parseFloat(item.freight_charge)
						}
						if(item.pieces_per_packet != '' && item.purchase_unit != 'piece'){
							if(item.unit_per_piece != '' && item.purchase_unit == item.smallest_unit){
								$scope.cost_per_unit = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
								item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
								item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
								item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
							}
							item.current_item_price = parseFloat($scope.cost_per_unit) * parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) * parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.pieces_per_packet)
						}
						if(item.unit_per_packet != '' && item.purchase_unit == item.smallest_unit){
							item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_packet)
						}
					}
					if(item.pieces_per_packet != '' && item.purchase_unit == 'piece'){
						item.current_item_price = parseFloat(item.pieces_per_packet) * parseFloat(item.mrp)
						item.quantity_in_purchase_unit = parseFloat(item.pieces_per_packet) * parseFloat(item.quantity)
						item.current_item_cp = parseFloat(item.pieces_per_packet) * parseFloat(item.cost_price)
						item.current_item_freight_charge = parseFloat(item.pieces_per_packet) * parseFloat(item.freight_charge)
					}
					if(item.pieces_per_packet != '' && item.purchase_unit != 'piece'){
						if(item.unit_per_piece != '' && item.purchase_unit == item.smallest_unit){
							$scope.cost_per_unit = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
							item.current_item_price = parseFloat($scope.cost_per_unit) * parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) * parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.current_item_cp) * parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) * parseFloat(item.pieces_per_packet)
						}						
					}
					if(item.packets_per_box == '' && item.pieces_per_box == '' && item.pieces_per_packet == ''){
						if(item.unit_per_packet != '' && item.purchase_unit == item.smallest_unit){
							item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_packet)
						}
					}					
				}
				else if(item.uom.uom == 'piece'){
					if(item.packets_per_box != '' && item.purchase_unit == 'box'){
						$scope.cost_per_packet = parseFloat(item.mrp) / parseFloat(item.packets_per_box)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.packets_per_box)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.packets_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.packets_per_box)
						item.current_item_price = parseFloat($scope.cost_per_packet) / parseFloat(item.pieces_per_packet)
						item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.pieces_per_packet)
						item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.pieces_per_packet)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_packet)
					}
					if(item.packets_per_box != '' && item.purchase_unit != 'box'){
						if(item.packets_per_box != '' && item.purchase_unit == 'packet'){
							item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_packet)
						}
					}
					if(item.pieces_per_box != '' && item.purchase_unit == 'box'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_box)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_box)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_box)
					}
					if(item.pieces_per_packet != '' && item.purchase_unit == item.smallest_unit){
						item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
						item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
						item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
					}
					if(item.pieces_per_packet != '' && item.purchase_unit == 'packet'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_packet)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_packet)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_packet)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_packet)
					}
					if(item.pieces_per_box != '' && item.purchase_unit == item.smallest_unit){
						item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
						item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
						item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
					}
					if(item.packets_per_box == '' && item.pieces_per_box == '' && item.pieces_per_packet == ''){
						if(item.unit_per_piece != '' && item.purchase_unit == item.smallest_unit){
							item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
						}
					}					
				}
				else if(item.uom.uom == item.smallest_unit){
					if(item.purchase_unit == 'box'){
						if(item.packets_per_box != ''){
							$scope.cost_per_packet = parseFloat(item.mrp) / parseFloat(item.packets_per_box)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.packets_per_box)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.packets_per_box)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.packets_per_box)
							if(item.pieces_per_packet != ''){
								item.current_item_price = parseFloat($scope.cost_per_packet) / parseFloat(item.pieces_per_packet)
								item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.pieces_per_packet)
								item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.pieces_per_packet)
								item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.pieces_per_packet)
								if(item.unit_per_piece != ''){
									item.current_item_price = parseFloat(item.current_item_price) / parseFloat(item.unit_per_piece)
									item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.unit_per_piece)
									item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.unit_per_piece)
									item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.unit_per_piece)
								}
							}
							if(item.unit_per_packet != ''){
								item.current_item_price = parseFloat($scope.cost_per_packet) / parseFloat(item.unit_per_packet)
								item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.unit_per_packet)
								item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.unit_per_packet)
								item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.unit_per_packet)
							}
						}
						if(item.pieces_per_box != ''){
							item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_box)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_box)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_box)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_box)
							if(item.unit_per_piece != ''){
								item.current_item_price = parseFloat(item.current_item_price) / parseFloat(item.unit_per_piece)
								item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.unit_per_piece)
								item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.unit_per_piece)
								item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.unit_per_piece)
							}
						}
					}
					if(item.packets_per_box != '' && item.purchase_unit == 'packet'){
						if(item.unit_per_packet != ''){
							item.current_item_price = parseFloat(item.mrp) / parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.unit_per_packet)
						}
					}

					if((item.pieces_per_packet != '' || item.unit_per_piece != '') && item.purchase_unit == 'piece'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.unit_per_piece)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.unit_per_piece)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.unit_per_piece)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.unit_per_piece)
					}

					if(item.pieces_per_packet != '' && item.purchase_unit == 'packet'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_packet)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_packet)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_packet)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_packet)
						if(item.unit_per_piece != ''){
							item.current_item_price = parseFloat(item.current_item_price) / parseFloat(item.unit_per_piece)
							item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.unit_per_piece)
							item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.unit_per_piece)
							item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.unit_per_piece)
						}
					}
					if(item.packets_per_box == '' && item.pieces_per_box == '' && item.pieces_per_packet == ''){
						if(item.unit_per_packet != ''){
							item.current_item_price = parseFloat(item.mrp) / parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.unit_per_packet)
						}
					}
				}
			}
		if(item.quantity_in_purchase_unit > item.stock){
			$scope.validate_delivery_msg = "Out of Stock";
		}

		if(item.quantity != '' && Number(item.quantity) && item.uom != ""){
			console.log(item.current_item_cp,item.current_item_freight_charge)
			item.net_amount = parseFloat(item.quantity) * parseFloat(item.current_item_price);
			item.net_cp = parseFloat(item.quantity) * parseFloat(item.current_item_cp);
			item.tax_exclusive_amount = item.net_amount;
			item.net_freight_charge = parseFloat(item.current_item_freight_charge) * parseFloat(item.quantity);
			if($scope.delivery.bill_type == 'Taxable'){
				item.net_amount = parseFloat(item.net_amount) + (parseFloat(item.net_amount) * parseFloat(item.tax/100));
			}
		}
		else if(item.quantity.length == 0)
			item.net_amount = "";
		if (item.current_item_price)
			item.current_item_price = item.current_item_price.toFixed(2);
		$scope.calculate_total_amount();
	}
	$scope.calculate_total_amount = function(){
		$scope.delivery.grant_total = 0;
		$scope.delivery.tax_exclusive_total = 0;
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
	}
	// $scope.search_customer = function(){
	// 	if($scope.customer_name.length == 0){
	// 		$scope.customers = "";
	// 		$scope.no_customer_msg = "";
	// 	}
	// 	else{
	// 		$scope.delivery.customer = "";
	// 		get_customer_search_list($scope, $http);
	// 	}		
	// }
	// $scope.select_customer = function(customer){
	// 	$scope.customer_name = customer.name;
	// 	$scope.delivery.customer = customer.id;
	// 	$scope.customers = "";
	// }
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
				console.log(stock_unit);
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
			$http.get('/sales/deliverynote_view/?deliverynote_no='+$scope.deliverynote_no).success(function(data) {
				$scope.delivery_error_message = '';
				if (data.result == 'ok') {
					$scope.delivery = data.delivery;
					$scope.delivery_id = data.delivery.id;
					
				} else {
					$scope.delivery_error_message = data.message;
					$scope.delivery = '';
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
		if($scope.delivery_note_no != ''){
			$scope.error_message = '';
			$scope.is_delivery_note = false;
			$http.get('/sales/deliverynote_sales/?delivery_note_no='+$scope.delivery_note_no).success(function(data) {
				if (data.result == 'ok') {
					get_serial_no($scope,$http,'Receipt');
					$scope.is_delivery_note = true;
					$scope.sales.deliverynote_id = data.delivery_note.deliverynote_id;
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
			$scope.get_batch($scope.current_sales_item);
			get_item_uoms($scope, $http);
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
			console.log($scope.sales.items[i]);
			$scope.calculate_quantity_from_uom($scope.sales.items[i]);			
		}
	}
	$scope.get_batch = function(item){
		$http.get('/inventory/batch_item_details/?batch_id='+item.batch_id+'&item_id='+item.id).success(function(data){
        	item.stock = data.batch_item.quantity;
        	item.stock_unit = data.batch_item.stock_unit;
        	item.selling_units = [];
        	item.selling_units.push({
        		'unit': data.batch_item.selling_unit,
        	})
        	if(data.batch_item.selling_unit != data.batch_item.purchase_unit)
	        	item.selling_units.push({
	        		'unit': data.batch_item.purchase_unit,
	        	})
        	item.selling_unit = data.batch_item.selling_unit;
        	item.purchase_unit = data.batch_item.purchase_unit;
        	item.relation = data.batch_item.relation;
        	item.whole_sale_price = data.batch_item.whole_sale_price_sales;
        	item.retail_price = data.batch_item.retail_price_sales;
        	item.branch_price = data.batch_item.branch_price;
        	item.customer_card_price = data.batch_item.customer_card_price;
        	item.tax = data.batch_item.tax;
        	item.offer_quantity = data.batch_item.offer_quantity;
        	item.packets_per_box = data.batch_item.packets_per_box;
        	item.pieces_per_box = data.batch_item.pieces_per_box;
        	item.pieces_per_packet = data.batch_item.pieces_per_packet;
        	item.unit_per_piece = data.batch_item.unit_per_piece;
        	item.smallest_unit = data.batch_item.smallest_unit;
        	item.unit_per_packet = data.batch_item.unit_per_packet;
        	item.item_uom = data.batch_item.item_uom;
        	item.cost_price = data.batch_item.cost_price;
        	item.freight_charge = data.batch_item.freight_charge;
        	if(item.price_type == 'Retail Price')
        		item.mrp = data.batch_item.retail_price_sales;
        	if(item.price_type == 'Whole Sale Price')
        		item.mrp = data.batch_item.whole_sale_price_sales;
        	if(item.price_type == 'Branch Price')
        		item.mrp = data.batch_item.branch_price;
        	if(item.price_type == 'Customer Card Price')
        		item.mrp = data.batch_item.customer_card_price;
	    }).error(function(data, status) {
	    	console.log('Request failed' || data);
	    });
	}
	$scope.calculate_quantity_from_uom = function(item){
		$scope.validate_sales_msg = "";
	    if(item.price_type == 'Retail Price')
    		item.mrp = item.retail_price;
    	if(item.price_type == 'Whole Sale Price')
    		item.mrp = item.whole_sale_price;
    	if(item.price_type == 'Branch Price')
    		item.mrp = item.branch_price;
    	if(item.price_type == 'Customer Card Price')
    		item.mrp = item.customer_card_price;
    	item.current_item_price = item.mrp;
		if(item.uom.uom == item.purchase_unit){
			if((item.quantity >= (item.offer_quantity)) && item.offer_quantity > 0)
				item.mrp = item.whole_sale_price
			item.current_item_price = item.mrp
			item.quantity_in_purchase_unit = item.quantity;
			item.current_item_cp = item.cost_price;
			item.current_item_freight_charge = item.freight_charge;
			if(item.quantity > item.stock){
				$scope.validate_sales_msg = "Out of Stock";
			}
		}else{
				if(item.uom.uom == 'box'){
					if(item.packets_per_box != '' && item.purchase_unit == 'packet'){
						item.current_item_price = parseFloat(item.mrp) * parseFloat(item.packets_per_box)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.packets_per_box)
						item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.packets_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.packets_per_box)
					} 
					else if(item.packets_per_box != '' && item.purchase_unit != 'packet'){
						if(item.unit_per_packet != '' && item.smallest_unit == item.purchase_unit){
							$scope.cost_per_packet = parseFloat(item.mrp) * parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_packet)
							if(item.packets_per_box != ''){
								console.log($scope.cost_per_packet);
								item.current_item_price = parseFloat($scope.cost_per_packet) * parseFloat(item.packets_per_box)
								item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) * parseFloat(item.packets_per_box)
								item.current_item_cp = parseFloat(item.current_item_cp) * parseFloat(item.packets_per_box)
								item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) * parseFloat(item.packets_per_box)
							}
						}
						if(item.pieces_per_packet != '' && item.purchase_unit == 'piece'){
							$scope.cost_per_packet = parseFloat(item.mrp) * parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.pieces_per_packet)
						} else if(item.pieces_per_packet != '' && item.purchase_unit != 'piece'){
							if(item.unit_per_piece != '' && item.smallest_unit == item.purchase_unit){
								$scope.cost_per_piece = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)	
								item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
								item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
								item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
							}
							$scope.cost_per_packet = parseFloat($scope.cost_per_piece) * parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) * parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.current_item_cp) * parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) * parseFloat(item.pieces_per_packet)
						}
						item.current_item_price = parseFloat(item.packets_per_box) * parseFloat($scope.cost_per_packet);
						item.quantity_in_purchase_unit = parseFloat(item.packets_per_box) * parseFloat(item.quantity_in_purchase_unit)
						item.current_item_cp = parseFloat(item.packets_per_box) * parseFloat(item.current_item_cp)
						item.current_item_freight_charge = parseFloat(item.packets_per_box) * parseFloat(item.current_item_freight_charge)
					}
					else if(item.pieces_per_box != '' && item.purchase_unit == 'piece'){
						item.current_item_price = parseFloat(item.mrp) * parseFloat(item.pieces_per_box)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.pieces_per_box)
						item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.pieces_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.pieces_per_box)
					}
					else if(item.pieces_per_box != '' && item.purchase_unit != 'piece'){
						if(item.unit_per_piece != '' && item.purchase_unit == item.smallest_unit){
							$scope.cost_per_piece = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
						}
						item.current_item_price = parseFloat(item.pieces_per_box) * parseFloat($scope.cost_per_piece);
						item.quantity_in_purchase_unit = parseFloat(item.pieces_per_box) * parseFloat(item.quantity_in_purchase_unit)
						item.current_item_cp = parseFloat(item.pieces_per_box) * parseFloat(item.current_item_cp)
						item.current_item_freight_charge = parseFloat(item.pieces_per_box) * parseFloat(item.current_item_freight_charge)
					}
				}
				else if(item.uom.uom == 'packet'){
					if(item.packets_per_box != '' && item.purchase_unit == 'box'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.packets_per_box)	
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.packets_per_box)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.packets_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.packets_per_box)
					}
					if(item.packets_per_box != '' && item.purchase_unit != 'box'){
						if(item.pieces_per_packet != '' && item.purchase_unit == 'piece'){
							item.current_item_price = parseFloat(item.pieces_per_packet) * parseFloat(item.mrp)
							item.quantity_in_purchase_unit = parseFloat(item.pieces_per_packet) * parseFloat(item.quantity)
							item.current_item_cp = parseFloat(item.pieces_per_packet) * parseFloat(item.cost_price)
							item.current_item_freight_charge = parseFloat(item.pieces_per_packet) * parseFloat(item.freight_charge)
						}
						if(item.pieces_per_packet != '' && item.purchase_unit != 'piece'){
							if(item.unit_per_piece != '' && item.purchase_unit == item.smallest_unit){
								$scope.cost_per_unit = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
								item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
								item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
								item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
							}
							item.current_item_price = parseFloat($scope.cost_per_unit) * parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) * parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.pieces_per_packet)
						}
						if(item.unit_per_packet != '' && item.purchase_unit == item.smallest_unit){
							item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_packet)
						}
					}
					if(item.pieces_per_packet != '' && item.purchase_unit == 'piece'){
						item.current_item_price = parseFloat(item.pieces_per_packet) * parseFloat(item.mrp)
						item.quantity_in_purchase_unit = parseFloat(item.pieces_per_packet) * parseFloat(item.quantity)
						item.current_item_cp = parseFloat(item.pieces_per_packet) * parseFloat(item.cost_price)
						item.current_item_freight_charge = parseFloat(item.pieces_per_packet) * parseFloat(item.freight_charge)
					}
					if(item.pieces_per_packet != '' && item.purchase_unit != 'piece'){
						if(item.unit_per_piece != '' && item.purchase_unit == item.smallest_unit){
							$scope.cost_per_unit = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
							item.current_item_price = parseFloat($scope.cost_per_unit) * parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) * parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.current_item_cp) * parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) * parseFloat(item.pieces_per_packet)
						}						
					}
					if(item.packets_per_box == '' && item.pieces_per_box == '' && item.pieces_per_packet == ''){
						if(item.unit_per_packet != '' && item.purchase_unit == item.smallest_unit){
							item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_packet)
						}
					}					
				}
				else if(item.uom.uom == 'piece'){
					if(item.packets_per_box != '' && item.purchase_unit == 'box'){
						$scope.cost_per_packet = parseFloat(item.mrp) / parseFloat(item.packets_per_box)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.packets_per_box)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.packets_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.packets_per_box)
						item.current_item_price = parseFloat($scope.cost_per_packet) / parseFloat(item.pieces_per_packet)
						item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.pieces_per_packet)
						item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.pieces_per_packet)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_packet)
					}
					if(item.packets_per_box != '' && item.purchase_unit != 'box'){
						if(item.packets_per_box != '' && item.purchase_unit == 'packet'){
							item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_packet)
						}
					}
					if(item.pieces_per_box != '' && item.purchase_unit == 'box'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_box)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_box)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_box)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_box)
					}
					if(item.pieces_per_packet != '' && item.purchase_unit == item.smallest_unit){
						item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
						item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
						item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
					}
					if(item.pieces_per_packet != '' && item.purchase_unit == 'packet'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_packet)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_packet)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_packet)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_packet)
					}
					if(item.pieces_per_box != '' && item.purchase_unit == item.smallest_unit){
						item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
						item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
						item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
					}
					if(item.packets_per_box == '' && item.pieces_per_box == '' && item.pieces_per_packet == ''){
						if(item.unit_per_piece != '' && item.purchase_unit == item.smallest_unit){
							item.current_item_price = parseFloat(item.mrp) * parseFloat(item.unit_per_piece)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) * parseFloat(item.unit_per_piece)
							item.current_item_cp = parseFloat(item.cost_price) * parseFloat(item.unit_per_piece)
							item.current_item_freight_charge = parseFloat(item.freight_charge) * parseFloat(item.unit_per_piece)
						}
					}					
				}
				else if(item.uom.uom == item.smallest_unit){
					if(item.purchase_unit == 'box'){
						if(item.packets_per_box != ''){
							$scope.cost_per_packet = parseFloat(item.mrp) / parseFloat(item.packets_per_box)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.packets_per_box)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.packets_per_box)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.packets_per_box)
							if(item.pieces_per_packet != ''){
								item.current_item_price = parseFloat($scope.cost_per_packet) / parseFloat(item.pieces_per_packet)
								item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.pieces_per_packet)
								item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.pieces_per_packet)
								item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.pieces_per_packet)
								if(item.unit_per_piece != ''){
									item.current_item_price = parseFloat(item.current_item_price) / parseFloat(item.unit_per_piece)
									item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.unit_per_piece)
									item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.unit_per_piece)
									item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.unit_per_piece)
								}
							}
							if(item.unit_per_packet != ''){
								item.current_item_price = parseFloat($scope.cost_per_packet) / parseFloat(item.unit_per_packet)
								item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.unit_per_packet)
								item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.unit_per_packet)
								item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.unit_per_packet)
							}
						}
						if(item.pieces_per_box != ''){
							item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_box)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_box)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_box)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_box)
							if(item.unit_per_piece != ''){
								item.current_item_price = parseFloat(item.current_item_price) / parseFloat(item.unit_per_piece)
								item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.unit_per_piece)
								item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.unit_per_piece)
								item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.unit_per_piece)
							}
						}
					}
					if(item.packets_per_box != '' && item.purchase_unit == 'packet'){
						if(item.unit_per_packet != ''){
							item.current_item_price = parseFloat(item.mrp) / parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.unit_per_packet)
						}
					}

					if((item.pieces_per_packet != '' || item.unit_per_piece != '') && item.purchase_unit == 'piece'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.unit_per_piece)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.unit_per_piece)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.unit_per_piece)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.unit_per_piece)
					}

					if(item.pieces_per_packet != '' && item.purchase_unit == 'packet'){
						item.current_item_price = parseFloat(item.mrp) / parseFloat(item.pieces_per_packet)
						item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.pieces_per_packet)
						item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.pieces_per_packet)
						item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.pieces_per_packet)
						if(item.unit_per_piece != ''){
							item.current_item_price = parseFloat(item.current_item_price) / parseFloat(item.unit_per_piece)
							item.quantity_in_purchase_unit = parseFloat(item.quantity_in_purchase_unit) / parseFloat(item.unit_per_piece)
							item.current_item_cp = parseFloat(item.current_item_cp) / parseFloat(item.unit_per_piece)
							item.current_item_freight_charge = parseFloat(item.current_item_freight_charge) / parseFloat(item.unit_per_piece)
						}
					}
					if(item.packets_per_box == '' && item.pieces_per_box == '' && item.pieces_per_packet == ''){
						if(item.unit_per_packet != ''){
							item.current_item_price = parseFloat(item.mrp) / parseFloat(item.unit_per_packet)
							item.quantity_in_purchase_unit = parseFloat(item.quantity) / parseFloat(item.unit_per_packet)
							item.current_item_cp = parseFloat(item.cost_price) / parseFloat(item.unit_per_packet)
							item.current_item_freight_charge = parseFloat(item.freight_charge) / parseFloat(item.unit_per_packet)
						}
					}
				}
			}
		if(item.quantity_in_purchase_unit > item.stock){
			$scope.validate_sales_msg = "Out of Stock";
		}

		if(item.quantity != '' && Number(item.quantity) && item.uom != ""){
			item.net_amount = parseFloat(item.quantity) * parseFloat(item.current_item_price);
			if(item.current_item_cp != null)
				item.net_cp = parseFloat(item.quantity) * parseFloat(item.current_item_cp);
		
			item.tax_exclusive_amount = item.net_amount;
			if(item.current_item_freight_charge != null)
				item.net_freight_charge = parseFloat(item.current_item_freight_charge) * parseFloat(item.quantity);
			console.log(item.net_freight_charge,item.net_cp)
			if($scope.sales.bill_type == 'Invoice'){
				item.net_amount = parseFloat(item.net_amount) + (parseFloat(item.net_amount) * parseFloat(item.tax/100));
			}
		}
		else if(item.quantity.length == 0)
			item.net_amount = "";
		if (item.current_item_price)
			item.current_item_price = item.current_item_price.toFixed(2);
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
		console.log("in validate");
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
		} 
		for(var i = 0; i < $scope.sales.items.length; i++){		
			console.log($scope.sales.items[i].uom)	;
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
		} 
		return true;
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
	$scope.save_sales = function(){
		$scope.sales.invoice_date = $('#invoice_date').val();
		if($scope.sales.invoice_date == ''){
			$scope.validate_sales_msg = "Please select invoice date";
		} else if($scope.validate_sales()){
			for(var i = 0; i < $scope.sales.items.length; i++){
				if($scope.sales.items[i].item_search == true)
					$scope.sales.items[i].item_search = "true"
				else
					$scope.sales.items[i].item_search = "false"
				if($scope.sales.items[i].net_freight_charge == null)
					$scope.sales.items[i].net_freight_charge = ''				
			}
			console.log($scope.sales)	;
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
		console.log($scope.cheque_no)
		$scope.sales.cheque_no = $scope.cheque_no;
		console.log($scope.sales.cheque_no)
		$scope.sales.card_no = $scope.card_no;
		$scope.sales.card_holder_name = $scope.card_holder_name;
		$scope.sales.cheque_date = document.getElementById("cheque_date").value;
		hide_sales_popup_divs();
	}
}