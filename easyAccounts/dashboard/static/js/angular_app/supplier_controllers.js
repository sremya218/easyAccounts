function get_suppliers($scope, $http) {
	$http.get('/suppliers/?ajax=true').success(function(data){
		$scope.suppliers = data.suppliers;
		
		paginate($scope.suppliers, $scope, 10);
	}).error(function(data, status){
		console.log('Request failed');
	});
}
function search_supplier($scope, $http){
	$scope.no_supplier_msg = '';
	$scope.suppliers = [];
	$http.get('/suppliers/?supplier_name='+$scope.supplier_name+'&ajax=true').success(function(data){
		$scope.suppliers = data.suppliers;
		if ($scope.suppliers.length == 0) {
			$scope.no_supplier_msg = 'No supplier with this name';
		}
		paginate($scope.suppliers, $scope, 10);
	}).error(function(data, status){
		console.log('Request failed');
	});
}
function validate_supplier($scope) {
	if ($scope.supplier.name == '' || $scope.supplier.name == undefined){
		$scope.error_supplier = 'Please enter the supplier name ';
		return false;
	} else if (($scope.supplier.contact != undefined && $scope.supplier.contact.length > 0) && ($scope.supplier.contact.length < 9 || $scope.supplier.contact.length > 15)){
		$scope.error_supplier = 'Please enter valid Contact no ';
		return false;
	} else if (($scope.supplier.email != undefined && $scope.supplier.email.length > 0) && (!validateEmail($scope.supplier.email))){
		$scope.error_supplier = 'Please enter valid email ';
		return false;
	} else if ($scope.supplier.credit_period == '' || $scope.supplier.credit_period == undefined) {
		$scope.error_supplier = 'Please enter credit period ';
		return false;
	} else if ($scope.supplier.credit_period_parameter == '' || $scope.supplier.credit_period_parameter == undefined) {
		$scope.error_supplier = 'Please choose credit period ';
		return false;
	} return true;
}
function save_supplier($scope, $http, from){
	if (validate_supplier($scope)){
		params = {
			'supplier': angular.toJson($scope.supplier),
			'csrfmiddlewaretoken': $scope.csrf_token,
		}
		$http({
			method: 'post',
			url: '/suppliers/add/',
			data: $.param(params),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}).success(function(data){
			if (data.result == 'ok') {
				if (from == 'purchase'){
					$scope.no_supplier_msg = '';
					$scope.current_purchase.supplier = data.supplier.id;
                    $scope.supplier_name = data.supplier.name;
                    hide_popup();
				} else 
					document.location.href = '/suppliers/';
			} else {
				$scope.error_supplier = data.message;
			}
		}).error(function(data){
			console.log('Request failed');
		})
	}
}
function SupplierController($scope, $http){
	$scope.supplier = {
		'name': '',
		'address': '',
		'contact': '',
		'email': '',
		'credit_period': '',
		'credit_period_parameter': '',
	}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
		get_suppliers($scope, $http);
	}
	$scope.edit_supplier = function(supplier){
		document.location.href = '/suppliers/add/?supplier='+supplier.id;
	}
	$scope.search_supplier = function(){
		$scope.suppliers = [];
		paginate($scope.suppliers, $scope, 15);
		if ($scope.supplier_name.length > 0){
			search_supplier($scope, $http);
		}
	}
	$scope.select_page = function(page){
        select_page(page, $scope.suppliers, $scope, 10);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
    $scope.delete_supplier = function(supplier) {
    	document.location.href = '/suppliers/delete/?supplier_id='+supplier.id;
    }
    $scope.create_new_supplier = function(){
		document.location.href = '/suppliers/add/';
	}
	$scope.view_supplier = function(supplier){
		$scope.supplier = supplier;
		create_popup();
	}
	$scope.hide_popup = function(){
		hide_popup();
	}
}
function AddSupplierController($scope, $http){
	$scope.supplier = {
		'name': '',
		'address': '',
		'contact': '',
		'email': '',
		'credit_period': '',
		'credit_period_parameter': '',
	}
	$scope.init = function(csrf_token, supplier_id) {
		$scope.csrf_token = csrf_token;
		if (supplier_id){
			$http.get('/suppliers/edit/?supplier_id='+supplier_id+'&ajax=true').success(function(data){
				$scope.supplier = data.supplier;
			}).error(function(data, status){
				console.log('Request failed');
			})
		}
	}
	$scope.save_supplier = function() {
		save_supplier($scope, $http);
	}
}
function AsscountsPayableController($scope, $http) {
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
		$http.get('/suppliers/accounts_payable/?ajax=true').success(function(data){
            $scope.supplier_details = data.supplier_details;
            paginate($scope.supplier_details, $scope, 15);
        }).error(function(data, status){
            console.log('Request failed' || data);
        });
	}
	$scope.generate_report = function() {
        document.location.href = '/suppliers/accounts_payable/?pdf=true';
    }
    $scope.select_page = function(page){
        select_page(page, $scope.suppliers, $scope, 15);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
}
function VendorWisePaymentReportController($scope, $http){
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
	$scope.init = function(csrf_token){
		$scope.csrf_token = csrf_token;
	}
	$scope.get_supplier_details = function(){
		$scope.supplier_id = '';
		search_supplier($scope, $http);
		$scope.vendor_payments = [];
		paginate($scope.vendor_payments, $scope, 10)
	}
	$scope.select_supplier = function(supplier){
		$scope.supplier_id = supplier.id;
		$scope.supplier_name = supplier.name;
		$scope.suppliers = [];
	}
	$scope.select_page = function(page){
        select_page(page, $scope.vendor_payments, $scope, 10);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
	$scope.generate_supplier_item_report = function(view_type){
		$scope.start_date = $('#start_date').val();
		$scope.end_date = $('#end_date').val();
		$scope.report_mesg = '';
		if ($scope.supplier_id == '' || $scope.supplier_id == undefined){
			$scope.report_mesg = 'Please choose Vendor';
		} else if ($scope.start_date == '' || $scope.start_date == undefined) {
			$scope.report_mesg = 'Please choose Start Date';
		} else if ($scope.end_date == '' || $scope.end_date == undefined) {
			$scope.report_mesg = 'Please choose End Date';
		} else {
			if (view_type == 'view'){
				$http.get('/suppliers/vendor_wise_payment_report/?supplier='+$scope.supplier_id+'&start_date='+$scope.start_date+'&end_date='+$scope.end_date).success(function(data){
					$scope.vendor_payments = data.supplier_transactions;
					paginate($scope.vendor_payments, $scope, 10);
				})
			} else {
				document.location.href = '/suppliers/vendor_wise_payment_report/?supplier='+$scope.supplier_id+'&start_date='+$scope.start_date+'&end_date='+$scope.end_date;
			}
		}
	}
}