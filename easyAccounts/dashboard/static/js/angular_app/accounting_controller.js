

/************************************ Accounts - common js methods ****************************************/
function get_accounting_ledgers($scope, $http, view_type) {
    $http.get('/accounts/chart_of_accounts/?ajax=true').success(function(data){
        if (data.result == 'ok') {
        	if (data.ledgers.length > 0) {
        		if (view_type == 'tree') {
        			$scope.parent_ledgers = data.ledgers;
        			$scope.get_ledgers('',$scope.parent_ledgers[0]);
        		} else {
            		$scope.ledgers = data.ledgers;
            	}
            }
        } else{
            $scope.message = data.message;
        }
    }).error(function(data, status){
        $scope.message = data.message;
    })
}
function get_ledger_search_list($scope, $http, ledger, from) {
    $scope.no_ledger_msg = '';
    $scope.ledgers_list = [];
    var ledger_name;
    var request_flag = false;
    if(ledger == 'debit_ledger'){
		if(($scope.debit_ledger_name != '' && $scope.debit_ledger_name.length > 0)) {
			ledger_name = $scope.debit_ledger_name;
			request_flag = true;
		}
	} else if(ledger == 'credit_ledger'){
		if(($scope.credit_ledger_name != '' && $scope.credit_ledger_name.length > 0)) {
			ledger_name = $scope.credit_ledger_name;
			request_flag = true;
		}
	} else {
    	if(($scope.ledger_name != undefined && $scope.ledger_name != '' && $scope.ledger_name.length > 0)) {
	        	ledger_name = $scope.ledger_name;
	        	request_flag = true;
	    } else if($scope.opening_balance != undefined && ($scope.opening_balance.ledger_name != undefined && $scope.opening_balance.ledger_name != '' && $scope.opening_balance.ledger_name.length > 0)){
	    		ledger_name = $scope.opening_balance.ledger_name;
	        	request_flag = true;
	    }
    }
    if(request_flag){
    	var filter = true;
    	if($scope.ledger_filter != undefined){
    		if(!$scope.ledger_filter){
    			var filter = false;
    		}
    	} 
    	$http.get('/accounts/chart_of_accounts/?name='+ledger_name+'&filter='+filter+'&from='+from).success(function(data){
            
            if (data.ledgers.length == 0) {
            	if(ledger == 'debit_ledger'){
            		$scope.no_debit_ledger_msg = 'No such ledger';
	                $scope.debit_ledgers = [];
            	} else if(ledger == 'credit_ledger'){
					$scope.no_credit_ledger_msg = 'No such ledger';
	                $scope.credit_ledgers = [];
            	} else if(ledger == 'search_ledger'){
	                $scope.no_ledger_msg = 'No such ledger';
	                $scope.ledgers = [];
	                
            	} else{
            		$scope.no_ledger_msg = 'No such ledger';
	                $scope.ledgers_list = [];
            	}
            } else {
            	if(ledger == 'debit_ledger')
            		$scope.debit_ledgers = data.ledgers;
            	else if(ledger == 'credit_ledger')
            		$scope.credit_ledgers = data.ledgers;
            	else if(ledger == 'search_ledger') {
                	$scope.ledgers = data.ledgers;
                	
               	} else
               		$scope.ledgers_list = data.ledgers;
            }
        }).error(function(data, status){
            console.log('Request failed'|| data);
        });
    }
}
function get_ledger_subledger_list($scope, $http) {
    $http.get('/accounts/chart_of_accounts/').success(function(data){
        $scope.ledgers = data.ledgers;
        for (var i=0; i<$scope.ledgers.length; i++) {
            $scope.ledgers[i].is_closed = true;
        }
    }).error(function(data, status){
        console.log('Request failed' || data);
    })
}
function get_subledger_list($scope, $http, ledger, view_type) {
	$scope.ledger_id = ledger.id
    $http.get('/accounts/subledger_list/'+$scope.ledger_id+'/'+'?ajax=true').success(function(data){
        if (view_type == 'edit') {
            $scope.ledger_details = data.ledger_details[0];
        } else {
        	// console.log(data.subledgers)
        	// if (data.subledgers[0])
        	// 	$scope.parent_name = data.subledgers[0].parent_name;
        	// else
        	// 	$scope.parent_name = ledger.name;
            $scope.current_ledger.subledgers = data.subledgers;
         //    $scope.current_ledger.temp_subledgers = data.subledgers;
        }
    }).error(function(data, status){
        console.log('Request failed' || data);
    })
}
function validate_ledger($scope){
        if ($scope.no_ledger_msg) {
            $scope.validate_ledger_error_msg = 'Please select the parent ledger or leave as null';
            return false;
        } else if ($scope.ledger.name == '' || $scope.ledger.name == undefined) {
            $scope.validate_ledger_error_msg = 'Please enter the name';
            return false;
        } return true;
    }
function save_ledger($scope, $http, view_type) {
		if($scope.ledger.parent == null)
            $scope.ledger.parent = "";
        params = {
            'ledger': angular.toJson($scope.ledger),
            "csrfmiddlewaretoken": $scope.csrf_token,
        }
        if (validate_ledger($scope)) {
            $http({
                method: 'post',
                url: '/accounts/add_ledger/',
                data : $.param(params),
                headers : {
                    'Content-Type' : 'application/x-www-form-urlencoded'
                }
            }).success(function(data){
                $scope.validate_ledger_error_msg = '';
                if (data.result == 'error') {
                    $scope.validate_ledger_error_msg = data.message;
                } else {
					if (view_type == 'tree') {
	                    if($scope.selected_parent_ledger){
	                        if (data.new_ledger.parent != '')
	                            $scope.selected_parent_ledger.subledgers.push(data.new_ledger);
	                        else {
	                            $scope.ledgers.push(data.new_ledger);
	                            
	                        }
	                    } else {
	                        $scope.ledgers.push(data.new_ledger);
	                        
	                    }
	                } else if(view_type == 'transaction'){
	                	hide_popup();
	                	if ($scope.transaction_ledger_type == 'debit_ledger'){
	                		$scope.get_debit_ledger_details(data.new_ledger);
	                	} else {
	                		$scope.get_credit_ledger_details(data.new_ledger);
	                	}
	                } else{
	                    document.location.href = '/accounts/ledgers/';
	                }
/*					if($scope.selected_parent_ledger){
						$scope.selected_parent_ledger.subledgers.push(data.new_ledger);
					}*/
                }
            }).error(function(data, status) {   
                console.log('Request failed' || data);
            });
        }
	}

/************************************ Accounts - common js methods - end ************************************/



function LedgerTreeController($scope, $http){
	$scope.new_ledger = false;
	$scope.ledger = {
		'parent': '',
		'name': '',
	}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
		$scope.ledger_filter = false;
		get_accounting_ledgers($scope, $http, 'tree');
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
		if($scope.focusIndex < $scope.ledgers_list.length-1){
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
	$scope.get_ledger_list = function() {
		if($scope.ledger_name.length > 0)
			get_ledger_search_list($scope, $http);
		else
			$scope.ledgers_list = "";
		$scope.focusIndex = 0
	}
	$scope.show_ledger_details = function(ledger) {
		$scope.current_ledger = ledger;
		get_subledger_list($scope, $http, ledger,'subledger');			
	}
	$scope.get_ledgers = function(event, ledger){
		$scope.left_index = 0;
		if (event){
			var target = $(event.currentTarget);
	        var element = target.parent();
	        var parent = element.parent();
	        var lis = $(parent).children();
	        for (var i=0; i<lis.length-2; i++){
		        $(lis[i]).removeClass('horizontal_menu_active');
		    }
	        element.addClass('horizontal_menu_active');
	    }
		$scope.ledgers = ledger;
		$scope.current_ledger = ledger;
		if (ledger)
			get_subledger_list($scope, $http, ledger,'subledger');
	}
	$scope.toggle_ledger_view = function(event, ledger) {
        var target = $(event.currentTarget);
        var element = target.parent().find('ul').first();
        var height_property = element.css('height');
        if(height_property == '0px') {
            element.animate({'height': '100%'}, 500);
            if(ledger.subledgers.length == 0){
            	$scope.show_ledger_details(ledger);
            }
            $(target).addClass('open').removeClass('closed');
        } else {
            element.animate({'height': '0px'}, 500);
            $(target).addClass('closed').removeClass('open');
        }
    }
    $scope.edit_subledger = function(ledger) {
    	$scope.ledger_view = 'tree';
    	$scope.ledger.id = ledger.id;
		$scope.ledger.name = ledger.name;
		$scope.ledger.parent = ledger.parent_id;
		$scope.ledger_name = ledger.parent_name;
		$scope.new_ledger = true;
		$scope.selected_parent_ledger = ledger;
	} 
	  
	$scope.get_ledger_details = function(ledger) {
		$scope.show_ledger_details(ledger)
		$scope.ledger.parent = ledger.id;
		$scope.ledger_name = ledger.name;
		$scope.selected_parent_ledger = ledger;
		$scope.ledgers_list = [];
		$scope.no_ledger_msg = "";
	}
	$scope.select_list_item = function(index) {
		if ($scope.ledgers_list != undefined ){
			ledger = $scope.ledgers_list[index];
			$scope.get_ledger_details(ledger);
		}
	}
	$scope.add_subledger = function(ledger) {
		$scope.selected_parent_ledger = '';

		$scope.ledger = {
			'parent': '',
			'name': '',
		}
		$scope.ledger_name = ledger.name;
		$scope.ledger.parent = ledger.id;
		$scope.ledger_view = 'tree';
		$scope.selected_parent_ledger = ledger;
		$scope.new_ledger = true;
	}
	
	$scope.create_ledger= function() {
		$scope.selected_parent_ledger = '';
		$scope.ledger_name = '';
		$scope.ledger = {
			'parent': '',
			'name': '',
		}
		$('#stock_search_popup').css('display', 'none');
		$scope.new_ledger = true;
		// create_popup();
	}	
	$scope.hide_popup = function() {
		$scope.ledger_view = '';
		$scope.new_ledger = false;
		hide_popup();
	}
	$scope.save_ledger = function() {
		$scope.ledger_view = '';
		$scope.new_ledger = false;
		save_ledger($scope, $http, 'tree');
	}
}
function PaymentController($scope, $http){
	$scope.payment = {
		'transaction_date': '',
		'amount': '',
		'mode': 'cash',
		'cheque_number': '',
		'cheque_date': '',
		'card_no': '',
		'card_holder_name': '',
		'bank_name': '',
		'branch': '',
		'narration': '',
		'vendor': '',
		'bank_account': '',
		'purchase_invoice': '',
		'purchase_amount': '',
		'balance': '',
		'amount': '',
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
		if($scope.focusIndex < $scope.ledgers_list.length-1){
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
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
		get_bank_account_details($scope, $http);
	}
	$scope.get_ledger_list = function(ledger) {
		$scope.ledgers = [];
		get_ledger_search_list($scope, $http,ledger, 'payments');
	}
	$scope.select_list_item = function(index) {
		if ($scope.ledgers_list != undefined){
			ledger = $scope.ledgers_list[index];
			$scope.get_ledger_details(ledger);
		}
	}
	$scope.get_ledger_details = function(ledger) {
		$scope.ledger_name = ledger.name;
		$scope.payment.ledger = ledger.id;
		$scope.ledgers_list = [];
		$scope.no_ledger_msg = "";
		$scope.get_purchase_invoice_details();
	}
	$scope.validate_payment = function(){
		$scope.validate_error_msg = "";
		var remaining_amount = $scope.payment.balance-$scope.payment.amount;
		if($scope.payment.transaction_date == '' || $scope.payment.transaction_date == undefined){
			$scope.validate_error_msg = 'Please select the date of payment';
			return false;
		} else if($scope.payment.mode == '' || $scope.payment.mode == undefined){
			$scope.validate_error_msg = 'Please choose the mode of payment';
			return false;
		} else if(($scope.payment.mode == 'card' || $scope.payment.mode == 'cheque') && ($scope.payment.bank_account == '')){
			$scope.validate_error_msg = 'Please select the Bank Account';
			return false;
		} else if($scope.payment.mode == 'card' && ($scope.payment.card_no == '' || $scope.payment.card_no == undefined)){
			$scope.validate_error_msg = 'Please enter the card number';
			return false;
		} else if($scope.payment.mode == 'card' && ($scope.payment.card_no !== '0' && !Number($scope.payment.card_no))){
			$scope.validate_error_msg = 'Please enter a valid card number';
			return false;
		} else if($scope.payment.mode == 'card' && ($scope.payment.card_holder_name == '' || $scope.payment.card_holder_name == undefined)){
			$scope.validate_error_msg = 'Please enter the name of card holder';
			return false;
		}  else if(($scope.payment.mode == 'card' || $scope.payment.mode == 'cheque') && ($scope.payment.bank_name == '' || $scope.payment.bank_name == undefined)){
			$scope.validate_error_msg = 'Please enter the name of the bank';
			return false;
		} else if($scope.payment.mode == 'cheque' && ($scope.payment.cheque_number == '' || $scope.payment.cheque_number == undefined)){
			$scope.validate_error_msg = 'Please enter the cheque number';
			return false;
		} else if($scope.payment.mode == 'cheque' && ($scope.payment.cheque_date == '' || $scope.payment.cheque_date == undefined)){
			$scope.validate_error_msg = 'Please select the cheque date';
			return false;
		} else if($scope.payment.mode == 'cheque' && ($scope.payment.branch == '' || $scope.payment.branch == undefined)){
			$scope.validate_error_msg = 'Please enter the name of the branch';
			return false;
		} else if($scope.payment.narration == '' || $scope.payment.narration == undefined){
			$scope.validate_error_msg = 'Please enter narration';
			return false;
		} else if($scope.payment.ledger == '' || $scope.payment.ledger == undefined || $scope.ledger_name == '' || $scope.ledger_name == undefined){
			$scope.validate_error_msg = 'Please select an Account';
			return false;
		} else if($scope.payment.purchase_invoice == '' || $scope.payment.purchase_invoice == undefined){
			$scope.validate_error_msg = 'Please enter the purchase invoice';
			return false;
		} else if($scope.no_purchase_error == true){
			$scope.validate_error_msg = 'Please enter the correct purchase invoice';
			return false;
		} else if($scope.payment.amount == '' || $scope.payment.amount == undefined){
			$scope.validate_error_msg = 'Please enter the amount';
			return false;
		} else if($scope.payment.amount !== '0' && !Number($scope.payment.amount)){
			$scope.validate_error_msg = 'Please enter a valid amount';
			return false;
		} else if(remaining_amount < 0){
			$scope.validate_error_msg = 'Please check the amount with balance';
			return false;
		} 
		var start_date = new Date();
        var date_value = $scope.payment.transaction_date.split('/');
        var end_date = new Date(date_value[2],date_value[1]-1, date_value[0]);
        if(start_date < end_date){
          $scope.validate_error_msg = 'Please check the date of payment';
          return false;
        }
		return true;
	}
	$scope.save_payment = function(){
		if($scope.validate_payment()){
			show_loader();
			params = {
				'payment': angular.toJson($scope.payment),
				'csrfmiddlewaretoken': $scope.csrf_token,
			}
			$http({
				method: 'post',
				url: '/accounts/payments/',
				data: $.param(params),
				headers: {
					'Content-Type' : 'application/x-www-form-urlencoded'
				}
			}).success(function(data){
				hide_loader();
				$scope.validate_error_msg = "";
				if(data.result == 'error'){
					$scope.validate_error_msg = data.message;
				} else{
					$scope.transaction_reference_no = data.transaction_reference_no;
					$scope.transaction_name = ' Payment ';
					$('#bank_account_details').css('display', 'none');
					$('#transaction_reference_no_details').css('display', 'block');
					create_popup();
				}
			}).error(function(data, status){
				console.log('Request failed' || data);
			});
		}

	}
	$scope.hide_popup_transaction_details = function() {
		document.location.href = '/accounts/payments/';
	}
	$scope.hide_popup = function(){
		hide_popup();
	}
	$scope.create_new_bank_ledger = function(){
		
		$('#transaction_reference_no_details').css('display', 'none');
		$('#bank_account_details').css('display', 'block');
		$scope.other_bank_account = true;
		create_popup();
	}
	$scope.create_new_bank_acount = function() {
		if ($scope.bank_account_name == '' || $scope.bank_account_name == undefined) {
			$scope.bank_account_error = 'Please enter the Bank account name';
		} else {
			create_new_bank_acount($scope, $http, 'payments');
		}
	}
	$scope.get_purchase_invoice_details = function(){
		$scope.no_purchase_error = false;
		$scope.validate_error_msg = '';
		if ($scope.payment.ledger == '' || $scope.payment.ledger == undefined) {
			$scope.validate_error_msg = 'Please choose the Account';
		} else {
			if ($scope.payment.purchase_invoice.length > 0) { 
				$http.get('/purchase/purchase_details/?invoice='+$scope.payment.purchase_invoice+'&supplier='+$scope.payment.ledger).success(function(data){
					$scope.payment.purchase_amount = data.purchase.grant_total;
					$scope.payment.balance = data.purchase.balance;
					
					if (data.message.length > 0){
						$scope.no_purchase_error = true;
						$scope.validate_error_msg = 'No Purchase with this Purchase Invoice';
					}
				});
			}

		}
	}
}
function ReceiptController($scope, $http){
	$scope.receipt = {
		'transaction_date': '',
		'amount': '',
		'mode': 'cash',
		'cheque_number': '',
		'cheque_date': '',
		'card_no': '',
		'card_holder_name': '',
		'bank_name': '',
		'branch': '',
		'narration': '',
		'customer': '',
		'bank_ledger': '',
		'salesinvoiceno':'',
		'salesamount':'',
		'balance':'',
		'amount':'',
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
		if($scope.focusIndex < $scope.ledgers_list.length-1){
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
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
		get_bank_account_details($scope, $http);
	}
	$scope.get_ledger_list = function(ledger) {
		$scope.ledgers = [];
		get_ledger_search_list($scope, $http,ledger);
	}
	$scope.select_list_item = function(index) {
		if ($scope.ledgers_list != undefined) {
			ledger = $scope.ledgers_list[index];
			$scope.get_ledger_details(ledger);
		}
	}
	$scope.get_ledger_details = function(ledger) {
		$scope.ledger_name = ledger.name;
		$scope.receipt.ledger = ledger.id;
		$scope.ledgers_list = [];
		$scope.no_ledger_msg = "";
		$scope.get_salesinvoice_details();
	}
	$scope.validate_receipt = function(){
		$scope.validate_error_msg = "";
		var remaining_amount = $scope.receipt.balance-$scope.receipt.amount;
		if($scope.receipt.transaction_date == '' || $scope.receipt.transaction_date == undefined){
			$scope.validate_error_msg = 'Please select the date of receipt';
			return false;
		} else if($scope.receipt.mode == '' || $scope.receipt.mode == undefined){
			$scope.validate_error_msg = 'Please choose the mode of payment';
			return false;
		} else if($scope.receipt.mode == 'card' && ($scope.receipt.card_no == '' || $scope.receipt.card_no == undefined)){
			$scope.validate_error_msg = 'Please enter the card number';
			return false;
		} else if($scope.receipt.mode == 'card' && ($scope.receipt.card_no !== '0' && !Number($scope.receipt.card_no))){
			$scope.validate_error_msg = 'Please enter a valid card number';
			return false;
		} else if($scope.receipt.mode == 'card' && ($scope.receipt.card_holder_name == '' || $scope.receipt.card_holder_name == undefined)){
			$scope.validate_error_msg = 'Please enter the name of card holder';
			return false;
		} else if(($scope.receipt.mode == 'card' || $scope.receipt.mode == 'cheque') && ($scope.receipt.bank_name == '' || $scope.receipt.bank_name == undefined)){
			$scope.validate_error_msg = 'Please enter the name of the bank';
			return false;
		} else if($scope.receipt.mode == 'cheque' && ($scope.receipt.cheque_number == '' || $scope.receipt.cheque_number == undefined)){
			$scope.validate_error_msg = 'Please enter the cheque number';
			return false;
		} else if($scope.receipt.mode == 'cheque' && ($scope.receipt.cheque_date == '' || $scope.receipt.cheque_date == undefined)){
			$scope.validate_error_msg = 'Please select the cheque date';
			return false;
		} else if($scope.receipt.mode == 'cheque' && ($scope.receipt.branch == '' || $scope.receipt.branch == undefined)){
			$scope.validate_error_msg = 'Please enter the name of the branch';
			return false;
		} else if(($scope.receipt.mode == 'cheque' || $scope.receipt.mode == 'card') && ($scope.receipt.bank_account == '' || $scope.receipt.bank_account == undefined)){
			$scope.validate_error_msg = 'Please choose the bank account';
			return false;
		} else if($scope.receipt.narration == '' || $scope.receipt.narration == undefined){
			$scope.validate_error_msg = 'Please enter narration';
			return false;
		} else if($scope.receipt.ledger == '' || $scope.receipt.ledger == undefined || $scope.ledger_name == '' || $scope.ledger_name == undefined){
			$scope.validate_error_msg = 'Please select an account';
			return false;
		} else if($scope.receipt.salesinvoiceno =='' || $scope.receipt.salesinvoiceno == undefined){
			$scope.validate_error_msg = 'Please select the sales invoice number';
			return false;
		}  else if($scope.receipt.amount == '' || $scope.receipt.amount == undefined){
			$scope.validate_error_msg = 'Please enter the amount';
			return false;
		} else if($scope.receipt.amount !== '0' && !Number($scope.receipt.amount)){
			$scope.validate_error_msg = 'Please enter a valid amount';
			return false;
		} else if(remaining_amount < 0){
			$scope.validate_error_msg = 'Please check the amount with balance';
			return false;
		} 
		var start_date = new Date();
        var date_value = $scope.receipt.transaction_date.split('/');
        var end_date = new Date(date_value[2],date_value[1]-1, date_value[0]);
        if(start_date < end_date){
          $scope.validate_error_msg = 'Please check the date of receipt';
          return false;
        }
		return true;
	}
	
	$scope.save_receipt = function(){
		if($scope.validate_receipt()){
			show_loader();
			params = {
				'receipt': angular.toJson($scope.receipt),
				'csrfmiddlewaretoken': $scope.csrf_token,
			}
			$http({
				method: 'post',
				url: '/accounts/receipts/',
				data: $.param(params),
				headers: {
					'Content-Type' : 'application/x-www-form-urlencoded'
				}
			}).success(function(data){
				hide_loader();
				$scope.validate_error_msg = "";
				if(data.result == 'error'){
					$scope.validate_error_msg = data.message;
				} else{
					$scope.transaction_reference_no = data.transaction_reference_no;
					$scope.transaction_name = ' Receipt ';
					$('#bank_account_details').css('display', 'none');
					$('#transaction_reference_no_details').css('display', 'block');
					$('bank_account_details').css('display', 'none');
					create_popup();
				}
			}).error(function(data, status){
				console.log('Request failed' || data);
			});
		}
	}
	$scope.hide_popup_transaction_details = function() {
		document.location.href = '/accounts/receipts/';
	}
	$scope.hide_popup = function(){
		hide_popup();
	}
	$scope.create_new_bank_ledger = function(){
		
		$('#transaction_reference_no_details').css('display', 'none');
		$('#bank_account_details').css('display', 'block');
		$scope.other_bank_account = true;
		create_popup();
	}
	$scope.create_new_bank_acount = function() {
		if ($scope.bank_account_name == '' || $scope.bank_account_name == undefined) {
			$scope.bank_account_error = 'Please enter the Bank account name';
		} else {
			create_new_bank_acount($scope, $http, 'receipts');
		}
	}
	$scope.get_salesinvoice_details = function(){

		//console.log('iiiii')
		//alert('hhhhhhh');
		$scope.validate_error_msg = '';
		if ($scope.receipt.ledger == '' || $scope.receipt.ledger == undefined) {
			$scope.validate_error_msg = 'Please choose the Account';
		} else {
			if ($scope.receipt.salesinvoiceno.length > 0) { 
				$http.get('/sales/sales_view/?invoice='+$scope.receipt.salesinvoiceno+'&customer='+$scope.receipt.ledger).success(function(data){
					$scope.receipt.salesamount = data.sales_view.grant_total;
					$scope.receipt.balance = data.sales_view.balance;
					$scope.no_sale_error = '';
					if (data.message.length > 0){
						$scope.validate_error_msg = 'No Sale with this Sales Invoice';
					}
				});
			}

		}
	}
}



function TransactionController($scope, $http){
	$scope.transaction = {
		'transaction_date': '',
		'amount': '',
		'narration': '',
		'debit_ledger': '',
		'credit_ledger': '',
	}
	$scope.ledger = {
		'parent': '',
		'name': '',
	}
	$scope.debit_ledger_name = "";
	$scope.credit_ledger_name = "";
	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if ($scope.debit_ledgers != undefined && $scope.debit_ledgers.length > 0) {
            if($scope.focusIndex < $scope.debit_ledgers.length-1){
                $scope.focusIndex++; 
            }
        } else if ($scope.credit_ledgers != undefined && $scope.credit_ledgers.length > 0) {
            if($scope.focusIndex < $scope.credit_ledgers.length-1){
                $scope.focusIndex++; 
            }
        } else if ($scope.ledgers_list != undefined && $scope.ledgers_list.length > 0) {
            if($scope.focusIndex < $scope.ledgers_list.length-1){
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
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
		get_bank_account_details($scope, $http);
	}
	$scope.get_ledgers = function(ledger){
		if($scope.debit_ledger_name.length == 0){
			$scope.debit_ledgers = "";
			$scope.no_debit_ledger_msg = "";
		}
		if($scope.credit_ledger_name.length == 0){
			$scope.credit_ledgers = "";
			$scope.no_credit_ledger_msg = "";
		}
		if(ledger == 'debit_ledger')
			$scope.transaction.debit_ledger = "";
		if(ledger == 'credit_ledger')
			$scope.transaction.credit_ledger = "";
		get_ledger_search_list($scope, $http, ledger);
	}
	$scope.select_list_item = function(index) {
		if ($scope.debit_ledger_name!=undefined && $scope.debit_ledgers != undefined && $scope.debit_ledgers.length>0){
            debit_ledger = $scope.debit_ledgers[index];
            $scope.get_debit_ledger_details(debit_ledger);
        } else if ($scope.credit_ledger_name!=undefined && $scope.credit_ledgers != undefined && $scope.credit_ledgers.length>0){
            credit_ledger = $scope.credit_ledgers[index];
            $scope.get_credit_ledger_details(credit_ledger);
        } else if ($scope.ledgers_list != undefined && $scope.ledgers_list.length > 0){
        	ledger = $scope.ledgers_list[index];
        	$scope.get_ledger_details(ledger);
        }
        $scope.focusIndex = 0;
    }
	$scope.get_debit_ledger_details = function(ledger){
		$scope.debit_ledger_name = ledger.name;
		$scope.transaction.debit_ledger = ledger.id;
		$scope.debit_ledgers = [];
		$scope.no_debit_ledger_msg = "";
	}
	$scope.get_credit_ledger_details = function(ledger){
		$scope.credit_ledger_name = ledger.name;
		$scope.transaction.credit_ledger = ledger.id;
		$scope.credit_ledgers = [];
		$scope.no_credit_ledger_msg = "";
	}
	$scope.validate_transaction = function(){
		$scope.validate_error_msg = "";
		var start_date = new Date();
        var date_value = $scope.transaction.transaction_date.split('/');
        var end_date = new Date(date_value[2],date_value[1]-1, date_value[0]);
		if($scope.transaction.transaction_date == ''){
			$scope.validate_error_msg = 'Please select the date of transaction';
			return false;
		} else if($scope.transaction.amount == ''){
			$scope.validate_error_msg = 'Please enter the amount';
			return false;
		} else if($scope.transaction.amount !== 0 && !Number($scope.transaction.amount)){
			$scope.validate_error_msg = 'Please enter a valid amount';
			return false;
		} else if($scope.transaction.debit_ledger == '' || $scope.debit_ledger_name == ''){
			$scope.validate_error_msg = 'Please select the debit ledger from the list';
			return false;
		} else if($scope.transaction.credit_ledger == '' || $scope.credit_ledger_name == ''){
			$scope.validate_error_msg = 'Please select the credit ledger from the list';
			return false;
		} else if(($scope.transaction.credit_ledger == $scope.transaction.debit_ledger)){
			$scope.validate_error_msg = 'Credit and Debit ledgers cannot be the same';
			return false;
		} else if(start_date < end_date){
          $scope.validate_error_msg = 'Please check the date of transaction';
          return false;
        }
		return true;
	}
	$scope.create_ledger = function(ledger_type) {
		$scope.ledger.parent = '';
		$scope.ledger.name = '';
		$scope.ledger_name = '';
		$scope.ledgers_list = [];
		$scope.transaction_ledger_type = ledger_type;
		$('#new_ledger').css('display', 'block');
		$('#transaction_reference_no_details').css('display', 'none');
		$('#bank_account_details').css('display', 'none');
		create_popup();
	}
	$scope.save_ledger = function() {
		save_ledger($scope, $http, 'transaction');
	}
	$scope.get_ledger_list = function() {
		get_ledger_search_list($scope, $http);
	}
	$scope.get_ledger_details = function(ledger) {
		$scope.ledger.parent = ledger.id;
		$scope.ledger_name = ledger.name;
		$scope.ledgers_list = [];
		$scope.no_ledger_msg = "";
	}
	$scope.save_transaction = function(){
		if($scope.validate_transaction()){
			show_loader();
			params = {
				'transaction': angular.toJson($scope.transaction),
				'csrfmiddlewaretoken': $scope.csrf_token,
			}
			$http({
				method: 'post',
				url: '/accounts/other_transactions/',
				data: $.param(params),
				headers: {
					'Content-Type' : 'application/x-www-form-urlencoded'
				}
			}).success(function(data){
				hide_loader();
				$scope.validate_error_msg = "";
				if(data.result == 'error'){
					$scope.validate_error_msg = data.message;
				} else{
					$('#new_ledger').css('display', 'none');
					$scope.transaction_reference_no = data.transaction_reference_no;
					$scope.transaction_name = ' Payment ';
					$('#transaction_reference_no_details').css('display', 'block');
					create_popup();
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
		document.location.href = '/accounts/other_transactions/';
	}
}
function EditTransactionController($scope, $http) {
	$scope.transaction_no = '';
	$scope.is_transaction = false;
	$scope.is_receipt = false;
	$scope.is_payment = false;
	$scope.is_other_transaction = false;
	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if ($scope.debit_ledgers != undefined && $scope.debit_ledgers.length > 0) {
            if($scope.focusIndex < $scope.debit_ledgers.length-1){
                $scope.focusIndex++; 
            }
        } else if ($scope.credit_ledgers != undefined && $scope.credit_ledgers.length > 0) {
            if($scope.focusIndex < $scope.credit_ledgers.length-1){
                $scope.focusIndex++; 
            }
        } else if ($scope.ledgers_list != undefined && $scope.ledgers_list.length > 0) {
            if($scope.focusIndex < $scope.ledgers_list.length-1){
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
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.get_transaction_details = function() {
		if ($scope.transaction_no.length > 0) {
			$http.get('/accounts/edit_transactions/?transaction_no='+$scope.transaction_no).success(function(data) {
				$scope.message = '';
				$scope.transaction_details = data.transaction_details;
				$scope.is_receipt = false;
				$scope.is_payment = false;
				$scope.is_other_transaction = false;
				if (data.is_transaction == 'true') {
					$scope.is_transaction = true;
					if (data.is_payment == 'true') {
						$scope.is_payment = true;
						$scope.debit_ledger_name = $scope.transaction_details.debit_ledger_name;
					} else if (data.is_receipt == 'true') {
						$scope.is_receipt = true;
						$scope.credit_ledger_name = $scope.transaction_details.credit_ledger_name;
					} else if (data.is_other_transaction == 'true') {
						$scope.is_other_transaction = true;
						$scope.debit_ledger_name = $scope.transaction_details.debit_ledger_name;
						$scope.credit_ledger_name = $scope.transaction_details.credit_ledger_name;
					} 
				} else
					$scope.is_transaction = false;
				if (data.result == 'error') {
					$scope.message = data.message;
				}
			}).error(function(data, status){
				console.log('Request failed', data);
			});
		}
	}
	$scope.select_list_item = function(index) {
		if ($scope.debit_ledger_name!=undefined && $scope.debit_ledgers != undefined && $scope.debit_ledgers.length>0){
            debit_ledger = $scope.debit_ledgers[index];
            $scope.select_ledger_details(debit_ledger, 'payment');
        } else if ($scope.credit_ledger_name!=undefined && $scope.credit_ledgers != undefined && $scope.credit_ledgers.length>0){
            credit_ledger = $scope.credit_ledgers[index];
            $scope.select_ledger_details(credit_ledger, 'receipt');
        } 
        $scope.focusIndex = 0;
    }
	$scope.edit_transactions = function() {
		if ($scope.transaction_no.length == 0){
			$scope.validation_message = 'Please enter the Transaction No.';
		} else if($scope.message.length > 0) {
			$scope.validation_message = 'No such transaction with this Transaction no';
		} else if ($scope.transaction_details.amount != Number($scope.transaction_details.amount)) {
			$scope.validation_message = 'Please enter valid amount';
		} else {
			$scope.validation_message = '';
			$scope.transaction_details.cheque_date = $('#cheque_date').val();
			params = {
				'transaction_details': angular.toJson($scope.transaction_details),
				'csrfmiddlewaretoken': $scope.csrf_token,
			}
			$http({
	            method: 'post',
	            url: '/accounts/edit_transactions/',
	            data : $.param(params),
	            headers : {
	                'Content-Type' : 'application/x-www-form-urlencoded'
	            }
	        }).success(function(data){
				document.location.href = '/accounts/edit_transactions/';
			}).error(function(data, status){
				console.log('Request failed', data);
			});
		}
	}
	$scope.get_ledger_list = function(ledger, transaction_type) {
		if (transaction_type == 'payment') {
			$scope.ledger_name = $scope.debit_ledger_name;
		} else if (transaction_type == 'receipt') {
			$scope.ledger_name = $scope.credit_ledger_name;
		}
		$scope.ledgers = [];
		get_ledger_search_list($scope, $http, ledger);
	}
	$scope.select_ledger_details = function(ledger, transaction_type) {
		if (transaction_type == 'payment') {
			$scope.transaction_details.debit_ledger = ledger.id;
			$scope.debit_ledger_name = ledger.name;
		} else if (transaction_type == 'receipt') {
			$scope.transaction_details.credit_ledger = ledger.id;
			$scope.credit_ledger_name = ledger.name;
		}
		
		$scope.debit_ledgers = [];
		$scope.credit_ledgers = [];
		$scope.no_ledger_msg = "";
	}
}

function OpeningBalanceController($scope, $http) {
	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if($scope.focusIndex < $scope.ledgers_list.length-1){
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
	$scope.init = function(csrf_token){
		$scope.csrf_token = csrf_token;
		$scope.opening_balance = {
			'amount': '',
			'ledger_name': '',
			'ledger': '',
			'date': ''
		}
	}

	$scope.validate_opening_balance = function(){
		$scope.validate_error_msg = "";
		$scope.opening_balance.date = $('#opb_date').val();
		console.log($scope.opening_balance.date);
		if($scope.opening_balance.ledger == '' || $scope.opening_balance.ledger == undefined){
			$scope.validate_error_msg = 'Please choose the account';
			return false;
		} else if($scope.opening_balance.amount == '' || $scope.opening_balance.amount == undefined){
			$scope.validate_error_msg = 'Please enter the balance amount';
			return false;
		} else if($scope.opening_balance.amount !== 0 && !Number($scope.opening_balance.amount)){
			$scope.validate_error_msg = 'Please enter a valid amount';
			return false;
		} else if($scope.opening_balance.date == ''){
			$scope.validate_error_msg = 'Please enter a valid date';
			return false;
		}
		return true;
	}

	$scope.save_opening_balance = function(){
		if($scope.validate_opening_balance()){
			show_loader();
			params = {
				'opening_balance': angular.toJson($scope.opening_balance),
				'csrfmiddlewaretoken': $scope.csrf_token,
			}
			$http({
				method: 'post',
				url: '/accounts/opening_balance/',
				data: $.param(params),
				headers: {
					'Content-Type' : 'application/x-www-form-urlencoded'
				}
			}).success(function(data){
				hide_loader();
				$scope.validate_error_msg = "";
				if(data.result == 'error'){
					$scope.validate_error_msg = data.message;
				} else{
					$scope.transaction_name = ' Opening Balance ';
					$scope.transaction_reference_no = data.transaction_reference_no
					$('#transaction_reference_no_details').css('display', 'block');
					create_popup();
				}
			}).error(function(data, status){
				console.log('Request failed' || data);
			});
		}
	}
	$scope.get_ledger_list = function(ledger) {
		$scope.ledgers = [];
		$scope.opening_balance.ledger = '';
		$scope.focusIndex = 0;
		get_ledger_search_list($scope, $http,ledger);
	}
	$scope.select_list_item = function(index) {
		if ($scope.ledgers_list != undefined){
			ledger = $scope.ledgers_list[index];
			$scope.get_ledger_details(ledger);
		}
	}
	$scope.get_ledger_details = function(ledger) {
		$scope.opening_balance.ledger_name = ledger.name;
		$scope.opening_balance.ledger = ledger.id;
		$scope.ledgers_list = [];
		$scope.no_ledger_msg = "";
	}
	$scope.hide_popup_transaction_details = function(){
		document.location.href = '/accounts/opening_balance/';
	}
}

function DayBookController($scope, $http){

	$scope.init = function(csrf_token){
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
		if($scope.focusIndex < $scope.ledgers_list.length-1){
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
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
		$scope.day_book = {
			'date': '',
			'ledger': '',
		}
		$scope.ledger_name = '';
	}
	$scope.get_ledger_list = function(ledger) {
		if($scope.ledger_name.length == 0){
			$scope.ledgers_list = "";
			$scope.day_book.ledger = "";
		}
		else{
			$scope.day_book.ledger = "";	
			get_ledger_search_list($scope, $http,ledger);
		}
	}
	$scope.select_list_item = function(index) {
		ledger = $scope.ledgers_list[index];
		$scope.get_ledger_details(ledger);
		$scope.focusIndex = 0;
	}
	$scope.get_ledger_details = function(ledger) {
		$scope.ledger_name = ledger.name;
		$scope.day_book.ledger = ledger.id;
		$scope.ledgers_list = [];
		$scope.no_ledger_msg = "";
	}
	$scope.view_day_book = function(){
		if($scope.ledger_name.length > 0 && $scope.day_book.ledger == ''){
			$scope.validate_error_msg = "Please choose a valid ledger from the list or leave as blank";
			$scope.ledger_entries = "";
		}
		else
		{
			$scope.validate_error_msg = ""
			$scope.day_book.date = document.getElementById("start_date").value;
			$scope.day_book.end_date = $('#end_date').val();
			show_loader();
			$http.get('/accounts/day_book/?date='+$scope.day_book.date+'&ledger='+$scope.day_book.ledger+'&end_date='+$scope.day_book.end_date).success(function(data){
		        hide_loader();
		        $scope.ledger_entries = data.transaction_entries;
		        if($scope.ledger_entries.length == 0)
		        	$scope.validate_error_msg = "No ledger entries found";
		       	else {
		       		paginate($scope.ledger_entries, $scope, 10);
		       	}
		    }).error(function(data, status){
		        $scope.message = data.message;
		    })
		}
	}
	$scope.select_page = function(page){
        select_page(page, $scope.ledger_entries, $scope, 10);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
	$scope.generate_pdf = function(){
		if($scope.ledger_name.length > 0 && $scope.day_book.ledger == ''){
			$scope.validate_error_msg = "Please choose a valid ledger from the list or leave as blank";
			$scope.ledger_entries = "";
		}
		else{
			$scope.day_book.date = document.getElementById("start_date").value;
			document.location.href = '/accounts/day_book/?date='+$scope.day_book.date+'&ledger='+$scope.day_book.ledger+'&end_date='+$scope.day_book.end_date;
		}
	}
}
function CashBookController($scope, $http){
	$scope.init = function(csrf_token){
		$scope.csrf_token = csrf_token;
		$scope.start_date = "";
		$scope.end_date = "";
	}
	$scope.validate = function(){
		$scope.validate_error_msg = "";
		$scope.cash_entries = "";
		if($scope.start_date == ''){
			$scope.validate_error_msg = 'Please select the start date';
			return false;
		} else if($scope.end_date == ''){
			$scope.validate_error_msg = 'Please select the end date';
			return false;
		} 
		var date_value = $scope.start_date.split('/');
		var start_date = new Date(date_value[2],date_value[0]-1, date_value[1]);
		var date_value = $scope.end_date.split('/');
		var end_date = new Date(date_value[2],date_value[0]-1, date_value[1]);
		if(start_date > end_date){
          $scope.validate_error_msg = 'Please check the dates';
          return false;
        }
		return true;
	}
	$scope.view_cash_book = function(){
		if($scope.validate()){
			$scope.validate_error_msg = "";
			show_loader();
			$http.get('/accounts/cash_book/?start_date='+$scope.start_date+'&end_date='+$scope.end_date).success(function(data){
	        hide_loader();
	        $scope.cash_entries = data.cash_entries;
	        paginate($scope.cash_entries, $scope, 10);
	        if($scope.cash_entries.length == 0)
	        	$scope.validate_error_msg = "No ledger entries found";
		    }).error(function(data, status){
		        $scope.message = data.message;
		    })
		}
	}
	$scope.generate_pdf = function(ledger){
		if($scope.validate())
			document.location.href = '/accounts/cash_book/?start_date='+$scope.start_date+'&end_date=';
	}
	$scope.select_page = function(page){
        select_page(page, $scope.cash_entries, $scope, 10);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
}

function BankBookController($scope, $http) {
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.validate = function(){
		$scope.validate_error_msg = "";
		$scope.bank_entries = "";
		if($scope.start_date == '' || $scope.start_date == undefined){
			$scope.validate_error_msg = 'Please select the start date';
			return false;
		} else if($scope.end_date == '' || $scope.end_date == undefined){
			$scope.validate_error_msg = 'Please select the end date';
			return false;
		} 
		var date_value = $scope.start_date.split('/');
		var start_date = new Date(date_value[2],date_value[0]-1, date_value[1]);
		var date_value = $scope.end_date.split('/');
		var end_date = new Date(date_value[2],date_value[0]-1, date_value[1]);
		if(start_date > end_date){
          $scope.validate_error_msg = 'Please check the dates';
          return false;
        }
		return true;
	}
	$scope.view_bank_book = function(){
		if($scope.validate()){
			$scope.validate_error_msg = "";
			show_loader();
			$http.get('/accounts/bank_book/?start_date='+$scope.start_date+'&end_date='+$scope.end_date).success(function(data){
	        hide_loader();
	        $scope.bank_entries = data.bank_entries;
	        if($scope.bank_entries.length == 0)
	        	$scope.validate_error_msg = "No ledger entries found";
	       	else
	       		paginate($scope.bank_entries, $scope, 10);
		    }).error(function(data, status){
		        $scope.message = data.message;
		    })
		}
	}
	$scope.generate_pdf = function(ledger){
		if($scope.validate())
			document.location.href = '/accounts/bank_book/?start_date='+$scope.start_date+'&end_date='+$scope.end_date;
	}
	$scope.select_page = function(page){
        select_page(page, $scope.bank_entries, $scope, 10);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
}

function LedgerReportController($scope, $http){
	$scope.ledger_name = '';
	$scope.start_date = '';
	$scope.end_date = '';
	$scope.ledger_details = {
			'start_date': '',
			'end_date': '',
			'ledger_name': '',
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
		if($scope.focusIndex < $scope.ledgers_list.length-1){
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
	$scope.init = function(csrf_token){
		$scope.csrf_token = csrf_token;
	}
	$scope.get_ledger_list = function() {
		get_ledger_search_list($scope, $http);
	}
	$scope.select_list_item = function(index) {
		ledger = $scope.ledgers_list[index];
		$scope.get_ledger_details(ledger);
	}
	$scope.get_ledger_details = function(ledger) {
		$scope.ledger_id = ledger.id;
		$scope.ledger_name = ledger.name;
		$scope.ledger_details.ledger = ledger.id;
		$scope.ledgers_list = [];
		$scope.no_ledger_msg = "";
	}
	$scope.validate = function(){
		if($scope.ledger_name == '' || $scope.ledger_name == undefined){
			$scope.validate_error_msg = 'Please select the ledger';
			return false;
		} else if($scope.start_date == ''){
			$scope.validate_error_msg = 'Please select the start date';
			return false;
		} else if($scope.end_date == ''){
			$scope.validate_error_msg = 'Please select the end date';
			return false;
		} return true;
	}
	$scope.view_ledger = function(view_type){
		if($scope.validate()){
			if($scope.ledger_name.length > 0 && $scope.ledger_details.ledger == ''){
				$scope.validate_error_msg = "Please choose a valid ledger from the list or leave as blank";
				$scope.ledger_entries = "";
			} else {
				$scope.validate_error_msg = ""
				$scope.ledger_details.start_date = $scope.start_date;
				$scope.ledger_details.end_date = $scope.end_date;
				if (view_type == 'pdf'){
					document.location.href = '/accounts/ledger_report/?ledger='+$scope.ledger_details.ledger+'&start_date='+$scope.start_date+'&end_date='+$scope.end_date+'&report_type=pdf';
				} else {
					show_loader();
					$http.get('/accounts/ledger_report/?ledger='+$scope.ledger_details.ledger+'&start_date='+$scope.ledger_details.start_date+'&end_date='+$scope.ledger_details.end_date).success(function(data){
				        hide_loader();
				        $scope.ledger_entries = data.ledger_entries;
				        paginate($scope.ledger_entries, $scope, 5);
				        if($scope.ledger_entries.length == 0)
				        	$scope.validate_error_msg = "No ledger entries found";
				    }).error(function(data, status){
				        $scope.message = data.message;
				    });
				}
			}
		}
	}	
	$scope.select_page = function(page){
        select_page(page, $scope.ledger_entries, $scope, 10);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
}

function AccountStatementController($scope, $http){

	$scope.init = function(csrf_token){
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
		if($scope.focusIndex < $scope.ledgers_list.length-1){
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
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
		$scope.account_statement = {
			'start_date': '',
			'end_date': '',
			'ledger': '',
		}
		$scope.ledger_name = '';
	}
	$scope.get_ledger_list = function(ledger) {
		if($scope.ledger_name.length == 0){
			$scope.ledgers_list = "";
			$scope.account_statement.ledger = "";
		}
		else{
			$scope.account_statement.ledger = "";	
			get_ledger_search_list($scope, $http,ledger);
		}
	}
	$scope.select_list_item = function(index) {
		ledger = $scope.ledgers_list[index];
		$scope.get_ledger_details(ledger);
		$scope.focusIndex = 0;
	}
	$scope.get_ledger_details = function(ledger) {
		$scope.ledger_name = ledger.name;
		$scope.account_statement.ledger = ledger.id;
		$scope.ledgers_list = [];
		$scope.no_ledger_msg = "";
	}
	$scope.view_day_book = function(){
		$scope.account_statement.start_date = document.getElementById("start_date").value;
		$scope.account_statement.end_date = $('#end_date').val();
		if($scope.account_statement.ledger == '' || $scope.account_statement.ledger == undefined){
			$scope.validate_error_msg = "Please choose a ledger from the list";
		} else if($scope.ledger_name.length > 0 && ($scope.account_statement.ledger == '' || $scope.account_statement.ledger == undefined)){
			$scope.validate_error_msg = "Please choose a valid ledger from the list";
		} else if ($scope.account_statement.start_date == '' || $scope.account_statement.start_date == undefined){
			$scope.validate_error_msg = "Please choose start date";
		} else if ($scope.account_statement.end_date == '' || $scope.account_statement.end_date == undefined){
			$scope.validate_error_msg = "Please choose end date";
		} else {
			$scope.validate_error_msg = ""
			$scope.account_statement.start_date = document.getElementById("start_date").value;
			$scope.account_statement.end_date = $('#end_date').val();
			show_loader();
			$http.get('/accounts/account_statement/?start_date='+$scope.account_statement.start_date+'&ledger='+$scope.account_statement.ledger+'&end_date='+$scope.account_statement.end_date).success(function(data){
		        hide_loader();
		        $scope.ledger_entries = data.transaction_entries;
		        if($scope.ledger_entries.length == 0)
		        	$scope.validate_error_msg = "No ledger entries found";
		       	else {
		       		paginate($scope.ledger_entries, $scope, 10);
		       	}
		    }).error(function(data, status){
		        $scope.message = data.message;
		    })
		}
	}
	$scope.select_page = function(page){
        select_page(page, $scope.ledger_entries, $scope, 10);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
	$scope.generate_pdf = function(){
		$scope.account_statement.start_date = document.getElementById("start_date").value;
		$scope.account_statement.end_date = $('#end_date').val();
		console.log($scope.account_statement.ledger);
		if($scope.account_statement.ledger == '' || $scope.account_statement.ledger == undefined){
			$scope.validate_error_msg = "Please choose a ledger from the list";
		} else if($scope.ledger_name.length > 0 && ($scope.account_statement.ledger == '' || $scope.account_statement.ledger == undefined)){
			$scope.validate_error_msg = "Please choose a valid ledger from the list";
		} else if ($scope.account_statement.start_date == '' || $scope.account_statement.start_date == undefined){
			$scope.validate_error_msg = "Please choose start date";
		} else if ($scope.account_statement.end_date == '' || $scope.account_statement.end_date == undefined){
			$scope.validate_error_msg = "Please choose end date";
		} else{
			document.location.href = '/accounts/account_statement/?start_date='+$scope.account_statement.start_date+'&ledger='+$scope.account_statement.ledger+'&end_date='+$scope.account_statement.end_date;
		}
	}

}