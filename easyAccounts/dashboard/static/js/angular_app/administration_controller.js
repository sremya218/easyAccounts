function get_staff_list($scope, $http) {
	$http.get('/administration/staffs/?ajax=true').success(function(data){
		$scope.staffs = [];
		$scope.staffs = data.staffs;
		paginate($scope.staffs, $scope, 10);
	}).error(function(data, status){
		console.log('Request failed' || data)
	});
}
function get_serial_no($scope,$http,type){
	$http.get('/administration/get_serial_no/?ajax=true'+'&type='+type).success(function(data){
		$scope.sales.invoice_no = data.serial_no;
	}).error(function(data, status){
		console.log('Request failed' || data)
	});
}
function get_salesmen_list($scope, $http) {
	$http.get('/administration/salesmen_list/?ajax=true').success(function(data){
		$scope.salesmen = [];
		$scope.salesmen = data.salesmen;
		paginate($scope.salesmen, $scope, 10);
	}).error(function(data, status){
		console.log('Request failed' || data)
	});
}
function search_staff($scope, $http) {
	$http.get('/administration/search_staff/?staff_name='+$scope.staff_name+'&ajax=true').success(function(data){
		$scope.no_staff_message = '';
		$scope.staffs = []
		if (data.staffs.length == 0) {
			$scope.no_staff_message = 'No such staff';
			$scope.no_staff_error = true;
		} else {
			$scope.staffs = data.staffs;
			$scope.no_staff_error = false;
		}
		paginate($scope.staffs, $scope, 10);
	}).error(function(data, status){
		console.log('Request failed' || data)
	});
}
function search_salesmen($scope, $http) {
	$http.get('/administration/salesmen_list/?salesman_name='+$scope.salesman_name+'&ajax=true').success(function(data){
		$scope.no_salesman_message = '';
		$scope.salesmen = []
		if (data.salesmen.length == 0) {
			$scope.no_salesman_message = 'No such salesman';
		} else {
			$scope.salesmen = data.salesmen;
			$scope.no_salesman_message = "";
		}
	}).error(function(data, status){
		console.log('Request failed' || data)
	});
}
function reset_staff_details($scope) {
	$scope.address = '';
	$scope.staff_details = {
		'first_name': '',
		'last_name': '',
		'username': '',
		'password': '',
		'confirm_password': '',
		'email': '',
		'designation': '',
		'contact_no': '',
	}
	$scope.user_exists = false;
}
function validate_staff($scope) {
	$scope.validation_staff_message = '';
	if ($scope.staff_details.first_name == '' || $scope.staff_details.first_name == undefined) {
		$scope.validation_staff_message = 'Please enter first name';
		return false;
	} else if ($scope.staff_details.last_name == '' || $scope.staff_details.last_name == undefined) {
		$scope.validation_staff_message = 'Please enter last name';
		return false;
	} else if ($scope.staff_details.username == '' || $scope.staff_details.username == undefined) {
		$scope.validation_staff_message = 'Please enter username';
		return false;
	} else if ($scope.user_exists) { 
		$scope.validation_staff_message = 'Username already exists';
		return false;
	} else if (!$scope.is_edit && ($scope.staff_details.password == '' || $scope.staff_details.password == undefined)) {
		$scope.validation_staff_message = 'Please enter password';
		return false;
	} else if (!$scope.is_edit && ($scope.staff_details.confirm_password == '' || $scope.staff_details.confirm_password == undefined)) {
		$scope.validation_staff_message = 'Please enter confirm password';
		return false;
	} else if (!$scope.is_edit && ($scope.staff_details.password != $scope.staff_details.confirm_password)) {
		$scope.validation_staff_message = 'Password and Confirm password is not matching';
		return false;
	} else if ($scope.staff_details.email != '' && !validateEmail($scope.staff_details.email)) {
		$scope.validation_staff_message = 'Please enter a valid email';
		return false;
	} else if ($scope.staff_details.contact_no != '' && ($scope.staff_details.contact_no.length > 15 || $scope.staff_details.contact_no.length < 9)) {
		$scope.validation_staff_message = 'Please enter a valid contact no';
		return false;
	} return true;
}
function validate_salesman($scope, $http){
	$scope.validate_salesman_error_msg = "";
	if ($scope.salesman.first_name == '') {
		$scope.validate_salesman_error_msg = 'Please enter first name';
		return false;
	} else if ($scope.salesman.last_name == '') {
		$scope.validate_salesman_error_msg = 'Please enter last name';
		return false;
	}  else if ($scope.salesman.contact_no ){
		if ($scope.salesman.contact_no.length > 15 || $scope.salesman.contact_no.length < 9|| !Number($scope.salesman.contact_no)) {
			$scope.validate_salesman_error_msg = 'Please enter contact number';
			return false;
		}
	} else if ($scope.salesman.email != '' && !validateEmail($scope.salesman.email)) {
		$scope.validate_salesman_error_msg = 'Please enter a valid email';
		return false;
	} return true;
}
function validate_edit_staff($scope) {
	$scope.validation_staff_message = '';
	if ($scope.staff_details.first_name == '' || $scope.staff_details.first_name == undefined) {
		$scope.validation_staff_message = 'Please enter first name';
		return false;
	} else if ($scope.staff_details.last_name == '' || $scope.staff_details.last_name == undefined) {
		$scope.validation_staff_message = 'Please enter last name';
		return false;
	} else if ($scope.staff_details.email != '' && !validateEmail($scope.staff_details.email)) {
		$scope.validation_staff_message = 'Please enter a valid email';
		return false;
	} else if ($scope.staff_details.contact_no != '' && ($scope.staff_details.contact_no.length > 15 || $scope.staff_details.contact_no.length < 9)) {
		$scope.validation_staff_message = 'Please enter a valid contact no';
		return false;
	} return true;
}
function save_salesman($scope, $http, from) {
	if(validate_salesman($scope)) {
		params = {
			'salesman_details': angular.toJson($scope.salesman),
			'csrfmiddlewaretoken': $scope.csrf_token,
		}
		$http({
			method: 'post',
			url: '/administration/salesman/',
			data: $.param(params),
			headers: {
				'Content-Type' : 'application/x-www-form-urlencoded'
			}
		}).success(function(data){
			if (data.result == 'ok') {
				if (from == 'sales') {
                    $scope.current_sales.salesman = data.salesman.id;
                    $scope.salesman_name = data.salesman.name;
                    hide_popup();
                } else if (from == 'estimate') {
                    $scope.estimate.salesman = data.salesman.id;
                    $scope.salesman_name = data.salesman.name;
                    hide_popup();
                } else if (from == 'bill_to_invoice') {
                    $scope.sales.salesman = data.salesman.id;
                    $scope.salesman_name = data.salesman.name;
                    hide_popup();
                } else if (from == 'delivery') {
                    $scope.delivery.salesman = data.salesman.id;
                    $scope.salesman_name = data.salesman.name;
                    hide_popup();
                }else if (from == 'sales_return') {
                    $scope.sales_return.salesman = data.salesman.id;
                    $scope.salesman_name = data.salesman.name;
                    hide_popup();
                }else
					document.location.href = '/administration/salesmen_list/';
			} else {
				$scope.validate_salesman_error_msg = data.message;
			}
		}).error(function(data, status){
			console.log('Request failed' || data);
		});
	}
}
function save_staff($scope, $http, from) {	
		params = {
			'staff_details': angular.toJson($scope.staff_details),
			'address': $scope.address,
			'csrfmiddlewaretoken': $scope.csrf_token,
		}
		$http({
			method: 'post',
			url: '/administration/add_staff/',
			data: $.param(params),
			headers: {
				'Content-Type' : 'application/x-www-form-urlencoded'
			}
		}).success(function(data){
			if (data.result == 'ok') {
				if (from == 'staff')
					document.location.href = '/administration/staffs/';
				else {
					hide_popup();
					$scope.staff_name = data.name;
					$scope.permission.staff = data.id;
				}
			} else {
				$scope.validation_staff_message = data.message;
			}
		}).error(function(data, status){
			console.log('Request failed' || data);
		});
}
function check_username_exists($scope, $http) {
	$scope.username_exists_msg = '';
	if ($scope.staff_details.username!= undefined && $scope.staff_details.username.length > 0) {
		$http.get('/administration/check_staff_user_exists/?username='+$scope.staff_details.username).success(function(data) {
			if (data.result == 'error') {
				$scope.username_exists_msg = data.message;
				$scope.user_exists = true;
		} else {
			$scope.user_exists = false;
		}
		}).error(function(data, status) {
			console.log('Request failed' || data)
		});
	}
}
function get_bonus_points($scope, $http) {
	$http.get('/administration/bonus_points/?ajax=true').success(function(data){
		$scope.bonus_points = data.bonus_points;
		paginate($scope.bonus_points, $scope, 10);
	}).error(function(data, status){
		console.log('Request failed');
	})
}
function validate_bonus_point_create($scope) {
	if ($scope.bonus_point.type == '' || $scope.bonus_point.type == undefined) {
		$scope.bonus_point_error_msg = 'Please choose type';
		return false;
	} else if ($scope.bonus_point.point == '' || $scope.bonus_point.point == undefined) {
		$scope.bonus_point_error_msg = 'Please enter Bonus Point';
		return false;
	} else if ($scope.bonus_point.amount == '' || $scope.bonus_point.amount == undefined) {
		$scope.bonus_point_error_msg = 'Please enter Amount';
		return false;
	} else if ($scope.bonus_point.amount != Number($scope.bonus_point.amount)) {
		$scope.bonus_point_error_msg = 'Please enter valid Amount';
		return false;
	} return true;
}
function create_bonus_point($scope, $http) {
	if (validate_bonus_point_create($scope)) {
		params = {
			'bonus_point': angular.toJson($scope.bonus_point),
			'csrfmiddlewaretoken': $scope.csrf_token,
		}
		$http({
			method: 'post',
			data:$.param(params),
			url: '/administration/create_bonus_point/',
			headers: {
				'Content-Type' : 'application/x-www-form-urlencoded'
			}
		}).success(function(data){
			if (data.result == 'ok')
				document.location.href = '/administration/bonus_points/';
			else {
				$scope.bonus_point_error_msg = data.message;
			}
		}).error(function(data, status){
			console.log('Request failed' || data);
		})
	}
}

function StaffController($scope, $http) {
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
		get_staff_list($scope, $http);
		reset_staff_details($scope);
	}
	$scope.create_staff = function(){
		document.location.href = '/administration/add_staff/'
	}
	$scope.save_staff = function() {
		if(validate_staff($scope)) {
			save_staff($scope, $http, 'staff');
		}
	}
	$scope.edit_staff = function(staff) {
		document.location.href = '/administration/edit_staff/?staff_id='+staff.id;
	}
	$scope.hide_popup = function(){
		hide_popup();
	}
	$scope.view_staff_details = function(staff) {
		$scope.staff_details = staff;
		$('#view_staff').css('display', 'block');
		$('#add_staff').css('display', 'none');
		create_popup();
	}
	$scope.delete_staff = function(staff) {
		document.location.href = '/administration/delete_staff/?staff_id='+staff.id;
	}
	$scope.check_username_exists = function() {
		check_username_exists($scope, $http);
	}
	$scope.select_page = function(page) {
		select_page(page, $scope.staffs, $scope, 10)
	}
	$scope.range = function(n) {
        return new Array(n);
    }
    $scope.get_staffs_list = function() {
    	search_staff($scope, $http);
    }
}
function EditStaffController($scope, $http) {
	$scope.init = function(csrf_token, staff_id) {
		$scope.csrf_token = csrf_token;
		$scope.staff_id = staff_id;
		$scope.get_staff_details(staff_id);
	}
	$scope.get_staff_details  = function(staff_id){
        $scope.url = '/administration/edit_staff/?staff_id=' + staff_id+'&ajax=true';
        $http.get($scope.url).success(function(data)
        {
            $scope.staff_details = data.staff[0];
            $scope.address = data.staff[0].address; 
            
        }).error(function(data, status)
        {
            console.log(data || "Request failed");
        });
    }
    $scope.save_staff = function() {
    	if(validate_edit_staff($scope)) {
			save_staff($scope, $http, 'staff');
		}
	}
}
function PermissionController($scope, $http) {
	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if($scope.focusIndex < $scope.staffs.length-1){
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
	$scope.no_staff_error = false;
	$scope.permission = {
		'staff': '',
		'accounts_permission': false,
		'inventory_permission': false,
		'purchase_permission': false,
		'sales_permission': false,
		'suppliers_permission': false,
		'customers_permission': false,
		'reports_permission': false,
	}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
		reset_staff_details($scope);
	}
	$scope.search_staff = function() {
		$scope.select_staff_flag = true;
		search_staff($scope, $http);
	}
	$scope.save_staff = function() {
		save_staff($scope, $http, 'permission');
	}
	$scope.select_list_item = function(index) {
		staff = $scope.staffs[index];
		$scope.get_staff_details(staff);
	}
	$scope.get_staff_details = function(staff) {
		$scope.select_staff_flag = false;
		$scope.staff_name = staff.name;
		$scope.permission.staff = staff.id;
		$scope.staffs = [];
		if (staff.accounts_permission == 'true') {
			$scope.permission.accounts_permission = true;
		} else {
			$scope.permission.accounts_permission = false;
		}
		if (staff.inventory_permission == 'true') {
			$scope.permission.inventory_permission = true;
		} else {
			$scope.permission.inventory_permission = false;
		}
		if (staff.purchase_permission == 'true') {
			$scope.permission.purchase_permission = true;
		} else {
			$scope.permission.purchase_permission = false;
		}
		if (staff.sales_permission == 'true') {
			$scope.permission.sales_permission = true;
		} else {
			$scope.permission.sales_permission = false;
		}
		if (staff.customers_permission == 'true') {
			$scope.permission.customers_permission = true;
		} else {
			$scope.permission.customers_permission = false;
		}
		if (staff.suppliers_permission == 'true') {
			$scope.permission.suppliers_permission = true;
		} else {
			$scope.permission.suppliers_permission = false;
		}
		if (staff.reports_permission == 'true') {
			$scope.permission.reports_permission = true;
		} else {
			$scope.permission.reports_permission = false;
		}
	}
	$scope.save_permissions = function() {

		$scope.validate_staff_permission = '';
		if ($scope.permission.staff == '' || $scope.permission.staff == undefined) {
			$scope.validate_staff_permission = 'Please choose the Staff';
		} else if ($scope.no_staff_error) {
			$scope.validate_staff_permission = 'No such staff';
		} else {
			if ($scope.permission.accounts_permission == true) {
				$scope.permission.accounts_permission = 'true';
			} else {
				$scope.permission.accounts_permission = 'false';
			}
			if ($scope.permission.inventory_permission == true) {
				$scope.permission.inventory_permission = 'true';
			} else {
				$scope.permission.inventory_permission = 'false';
			}
			if ($scope.permission.purchase_permission == true) {
				$scope.permission.purchase_permission = 'true';
			} else {
				$scope.permission.purchase_permission = 'false';
			}
			if ($scope.permission.sales_permission == true) {
				$scope.permission.sales_permission = 'true';
			} else {
				$scope.permission.sales_permission = 'false';
			}
			if ($scope.permission.customers_permission == true) {
				$scope.permission.customers_permission = 'true';
			} else {
				$scope.permission.customers_permission = 'false';
			}
			if ($scope.permission.suppliers_permission == true) {
				$scope.permission.suppliers_permission = 'true';
			} else {
				$scope.permission.suppliers_permission = 'false';
			}
			if ($scope.permission.reports_permission == true) {
				$scope.permission.reports_permission = 'true';
			} else {
				$scope.permission.reports_permission = 'false';
			}
			params = {
				'staff_permission': angular.toJson($scope.permission),
				'csrfmiddlewaretoken': $scope.csrf_token,
			}
			$http({
				method:'post',
				url: '/administration/permissions/',
				data: $.param(params),
				headers: {
					'Content-Type' : 'application/x-www-form-urlencoded'
				}
			}).success(function(data){
				document.location.href = '/administration/permissions/';
			}).error(function(data, status) {
				console.log('Request failed' || data);
			})
		}
	}
	$scope.new_staff = function() {
		$scope.select_staff_flag = false;
		reset_staff_details($scope);
		create_popup();
	}
	$scope.check_username_exists = function() {
		check_username_exists($scope, $http);
	}
	$scope.hide_popup = function() {
		hide_popup();
	}
}
function SalesmenController($scope, $http){

	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
		$scope.salesman = {
			'first_name': '',
			'last_name': '',
			'address': '',
			'contact_no': '',
			'email': '',
		}
		get_salesmen_list($scope, $http);
	}
    $scope.create_salesman = function(){
       document.location.href = '/administration/salesman/';
    }
    $scope.save_salesman = function() {
		save_salesman($scope, $http);
	}
	$scope.edit_salesman_details = function(salesman){
        $scope.salesman = salesman;
        document.location.href = '/administration/salesman/?salesman_id='+salesman.id;
	}
	$scope.delete_salesman = function(salesman) {
		document.location.href = '/delete_salesman/?id='+salesman.id;
	}
	$scope.get_salesmen_list = function(){
		search_salesmen($scope, $http);
	}
	$scope.select_page = function(page){
		select_page(page, $scope.salesmen, $scope, 10);
	}
	$scope.range = function(n) {
        return new Array(n);
    }
    $scope.view_details = function(salesman){
    	$scope.salesman = salesman;
    	create_popup();
    }
    $scope.hide_popup = function(){
    	hide_popup();
    }

}
function AddSalesmanController($scope, $http){
   $scope.salesman = {
			'first_name': '',
			'last_name': '',
			'address': '',
			'contact_no': '',
			'email': '',
		}
    $scope.init = function(csrf_token, salesman_id) {
        $scope.csrf_token = csrf_token;
        if (salesman_id){
            $http.get('/administration/salesman/?salesman_id='+salesman_id+'&ajax=true').success(function(data){
                $scope.salesman = data.salesman;
            }).error(function(data, status){
                console.log('Request failed');
            })
        }
    }
    $scope.save_salesman = function() {
		save_salesman($scope, $http);
	}
}

function BonusPointsController($scope, $http) {
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
		get_bonus_points($scope, $http);
	}
	$scope.select_page = function(page){
		select_page(page, $scope.bonus_points, $scope, 10);
	}
	$scope.range = function(n) {
        return new Array(n);
    }
    $scope.edit_bonus_point = function(bonus_point){
    	document.location.href = '/administration/create_bonus_point/?bonus_point_id='+bonus_point.id;
    }
    $scope.delete_bonus_point = function(bonus_point) {
    	document.location.href = '/administration/delete_bonus_point/?bonus_point_id='+bonus_point.id;
    }
}
function IncentivesController($scope, $http){
	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if($scope.focusIndex < $scope.salesmen.length-1){
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
		$scope.salesman_name = '';
		$scope.start_date = '';
		$scope.end_date = '';
		$scope.no_of_sales = '';
		$scope.incentive_per_sale = '';
		$scope.total_incentive = ''
		$scope.incentives = {
			'incentive_per_sale':'',
			'salesman_id':'',
		}
	}
	
    $scope.search_salesman = function(){
		if($scope.salesman_name.length == 0){
			$scope.salesmen = "";
			$scope.no_salesman_message = "";
		}
		else{
			search_salesmen($scope,$http);
		}	
	}
	$scope.select_list_item = function(index) {
  		salesman = $scope.salesmen[index];
  		$scope.select_salesman(salesman);
  	}
  	$scope.select_salesman = function(salesman){
		$scope.salesman_name = salesman.name;
		$scope.salesman = salesman.id;
		$scope.salesmen = [];
	}
	$scope.get_sales = function () {
		$scope.error_msg = '';
		$scope.start_date = $('#start_date').val();
		$scope.end_date = $('#end_date').val();
		if($scope.start_date !='' && $scope.end_date !='' && $scope.salesman != ''){
			$http.get('/administration/salesman/sales/?salesman_id='+$scope.salesman+'&start_date='+$scope.start_date+'&end_date='+$scope.end_date).success(function(data){
				$scope.no_of_sales = parseInt(data.no_of_sales);	
				if(data.no_of_sales<=0)		{
					$scope.error_msg = 'No sales';
				}
			}).error(function(data, status){
				console.log('Request failed' || data);
			});
		} else {
			$scope.error_msg = "Please fill all fields";
		}	
	}
	$scope.calculate_total_incentive = function(){
		$scope.total_incentive = $scope.no_of_sales * $scope.incentive_per_sale;

	}
	$scope.save_incentives = function(){
		$scope.incentives.incentive_per_sale = $scope.incentive_per_sale;
		$scope.incentives.salesman_id = $scope.salesman;
		params = {
				'incentives_details': angular.toJson($scope.incentives),
				'csrfmiddlewaretoken': $scope.csrf_token,
			}
		$http({
			method:'post',
			url: '/administration/salesman/sales/',
			data: $.param(params),
			headers: {
				'Content-Type' : 'application/x-www-form-urlencoded'
			}
		}).success(function(data){
			document.location.href = '/administration/incentives/';
		}).error(function(data, status) {
			console.log('Request failed' || data);
		})
	}
}
function IncentivesReportController($scope, $http) {
	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if($scope.focusIndex < $scope.salesmen.length-1){
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
  	$scope.search_salesman = function(){
		if($scope.salesman_name.length == 0){
			$scope.salesmen = "";
			$scope.no_salesman_message = "";
		}
		else{
			search_salesmen($scope,$http);
		}	
	}
	$scope.select_list_item = function(index) {
  		salesman = $scope.salesmen[index];
  		$scope.select_salesman(salesman);
  	}
  	$scope.select_salesman = function(salesman){
		$scope.salesman_name = salesman.name;
		$scope.salesman = salesman.id;
		$scope.salesmen = [];
	}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.generate_report = function(type) {
		var start_date = $('#start_date').val();
		var end_date = $('#end_date').val();
		if (start_date == '' || start_date == undefined) {
			$scope.error_msg = 'Please Choose start date';
		} else if (end_date == '' || end_date == undefined) {
			$scope.error_msg = 'Please Choose end date';
		} else if($scope.salesman == ''|| $scope.salesman == undefined){
			$scope.error_msg = 'Please select salesman';
		}else
			{ 
			document.location.href = '/administration/salesman_incentive_report/?start_date='+start_date+'&end_date='+end_date+'&salesman_id='+$scope.salesman;
		}

	}
	
}
function CreateBonusPointController($scope, $http) {
	$scope.bonus_point = {
		'type': '',
		'point': '',
		'amount': '',
	}
	$scope.init = function(csrf_token, bonus_point_id) {
		$scope.csrf_token = csrf_token;
		if (bonus_point_id) {
			$http.get('/administration/create_bonus_point/?bonus_point_id='+bonus_point_id+'&ajax=true').success(function(data){
				$scope.bonus_point = data.bonus_point;
			}).error(function(data, status){
				console.log('Request failed');
			});
		}
	}
	$scope.create_bonus_point = function(){
		create_bonus_point($scope, $http);
	}
}

function SetBonusPointController($scope, $http) {
	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if ($scope.batch_list.length > 0) {
			if($scope.focusIndex < $scope.batch_list.length-1){
				$scope.focusIndex++; 
			}
		} else {
			if($scope.focusIndex < $scope.batch_items.length-1){
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
	$scope.batch_bonus_point = {
		'batch': '',
		'batch_item': '',
		'bonus_point': '',
		'bonus_quantity': '',
		'bonus_type': '',
	}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	$scope.select_list_item = function(index) {
		if ($scope.batch_list.length > 0) {
			batch = $scope.batch_list[index];
			$scope.select_batch(batch);
		} else {
			batch_item = $scope.batch_items[index];
			$scope.select_batch_item(batch_item);
		}
	}
	$scope.select_batch = function(batch) {
		$scope.batch_name = batch.name;
		$scope.batch = batch;
		$scope.batch_bonus_point.batch = batch.id;
		$scope.batch_list = [];
	}
	$scope.get_batch_item_details = function() {
		$scope.set_bonus_point_error_msg = '';
		$scope.batch_bonus_point.batch_item = '';
		if ($scope.batch_bonus_point.batch == '' || $scope.batch_bonus_point.batch == undefined) {
			$scope.set_bonus_point_error_msg = 'Please choose the batch';
		} else {
			$http.get('/inventory/search_batch_item/?batch_id='+$scope.batch_bonus_point.batch+'&item_name='+$scope.batch_item_name+'&type_name='+$scope.bonus_type).success(function(data){
				$scope.batch_items = data.batch_items;
				if (data.batch_items.length == 0) {
					$scope.set_bonus_point_error_msg = 'No such batch item';
				}
			})
		}
	}
	$scope.get_batch_details = function() {
		$scope.batch_bonus_point.batch = '';
		$scope.set_bonus_point_error_msg = '';
		$scope.batch_list = [];
		$scope.batch_bonus_point.batch_item = '';
		$scope.batch_item_name = '';
		$scope.batch_item_uom = '';
		$scope.batch_bonus_point.bonus_point = '';
		$scope.batch_bonus_point.bonus_quantity = '';
		if($scope.batch_name != undefined && $scope.batch_name.length > 0)
			$http.get('/inventory/search_batch/?batch_name='+$scope.batch_name).success(function(data){
				$scope.batch_list = data.batches;
				if (data.batches.length == 0) {
					$scope.set_bonus_point_error_msg = 'No such batch';
				}
			}).error(function(data, status){
				console.log('Request failed' || data);
			})
	}
	$scope.select_batch_item = function(batch_item) {
		$scope.batch_bonus_point.batch_item = batch_item.item_id;
		$scope.batch_item_name = batch_item.name;
		$scope.batch_item_uom = batch_item.uom;
		$scope.batch_bonus_point.bonus_point = batch_item.bonus_point;
		$scope.batch_bonus_point.bonus_quantity = batch_item.bonus_quantity;
		$scope.batch_items = [];
	}
	$scope.get_bonus_point_list = function() {
		$scope.batch_bonus_point.bonus_type = $scope.bonus_type;
		$scope.batch_bonus_point.batch_item = '';
		$scope.batch_item_name = '';
		$scope.batch_item_uom = '';
		$scope.batch_name = '';
		$scope.batch_bonus_point.bonus_point = '';
		$scope.batch_bonus_point.bonus_quantity = '';
		$http.get('/administration/bonus_points/?type_name='+$scope.bonus_type).success(function(data){
			$scope.bonus_points = data.bonus_points;
		}).error(function(data, status){
			console.log('Request failed' || data);
		})
	}
	$scope.validate_batch_bonus_point = function() {
		if ($scope.batch_bonus_point.bonus_type == '' || $scope.batch_bonus_point.bonus_type == undefined) {
			$scope.set_bonus_point_error_msg = 'Please choose bonus type';
			return false;
		} else if ($scope.batch_bonus_point.batch == '' || $scope.batch_bonus_point.batch == undefined) {
			$scope.set_bonus_point_error_msg = 'Please choose batch';
			return false;
		} else if ($scope.batch_bonus_point.batch_item == '' || $scope.batch_bonus_point.batch_item == undefined) {
			$scope.set_bonus_point_error_msg = 'Please choose batch item';
			return false;
		} else if ($scope.batch_bonus_point.bonus_quantity == '' || $scope.batch_bonus_point.bonus_quantity == undefined) {
			$scope.set_bonus_point_error_msg = 'Please enter bonus quantity';
			return false;
		} else if ($scope.batch_bonus_point.bonus_quantity != Number($scope.batch_bonus_point.bonus_quantity)) {
			$scope.set_bonus_point_error_msg = 'Please enter a valid bonus quantity';
			return false;
		} else if ($scope.batch_bonus_point.bonus_point == '' || $scope.batch_bonus_point.bonus_point == undefined) {
			$scope.set_bonus_point_error_msg = 'Please choose bonus point';
			return false;
		} return true;
	}
	$scope.create_bonus_point = function() {
		params = {
			'bonus_point_details': angular.toJson($scope.batch_bonus_point),
			'csrfmiddlewaretoken': $scope.csrf_token
		}
		if ($scope.validate_batch_bonus_point()) {
			$http({
				method: 'post',
				data: $.param(params),
				url: '/administration/set_bonus_point/',
				headers: {
					'Content-Type' : 'application/x-www-form-urlencoded'
				}
			}).success(function(data) {
				document.location.href = '/administration/set_bonus_point/';
			}).error(function(data, status) {
				console.log('Request failed' || data);
			});
		}
	}
}

function ViewBonusPointController($scope, $http) {
	$scope.focusIndex = 0;
	$scope.keys = [];
	$scope.keys.push({ code: 13, action: function() { $scope.select_list_item( $scope.focusIndex ); }});
	$scope.keys.push({ code: 38, action: function() { 
		if($scope.focusIndex > 0){
			$scope.focusIndex--; 
		}
	}});
	$scope.keys.push({ code: 40, action: function() { 
		if ($scope.customers.length > 0) {
			if($scope.focusIndex < $scope.customers.length-1){
				$scope.focusIndex++; 
			}
		} else {
			if($scope.focusIndex < $scope.salesmen.length-1){
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
  		if ($scope.customers.length > 0) {
			$scope.person = $scope.customers[index];
		} else {
			$scope.person = $scope.salesmen[index];
		}
		$scope.select_person($scope.person);
  	}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
		$scope.bonus_type = 'Customer';
	}
	$scope.search_person_list = function(){
		$scope.bonus_point =  '';
		$scope.salesmen = [];
		$scope.customers = [];
		$scope.person_id = '';
		if ($scope.name != undefined && $scope.name.length >0) {
			if ($scope.bonus_type == 'Customer') {
				$scope.customer_name = $scope.name;
				get_customer_search_list($scope, $http);
			} else {
				$scope.salesman_name = $scope.name;
				search_salesmen($scope, $http);
			}
		}
	}
	$scope.select_person = function(person){
		$scope.bonus_point = person.bonus_point;
		$scope.person_id = person.id;
		$scope.name = person.name;
		if ($scope.customers.length > 0) {
			$scope.customers = [];
		} else {
			$scope.salesmen = [];
		}
	}
	$scope.clear_bonus_point_details = function() {
		$scope.bonus_point = '';
		$scope.name = '';
	}
	$scope.clear_bonus_point = function() {
		if ($scope.bonus_type == '' || $scope.bonus_type == undefined) {
			$scope.clear_bonus_point_validation = 'Please choose bonus type';
		} else if ($scope.person_id == '' || $scope.person_id == undefined) {
			$scope.clear_bonus_point_validation = 'Please choose '+$scope.bonus_type;
		} else if ($scope.clearing_amount == '' || $scope.clearing_amount == undefined) {
			$scope.clear_bonus_point_validation = 'Please enter clearing amount';
		} else if ($scope.clearing_amount != Number($scope.clearing_amount)) {
			$scope.clear_bonus_point_validation = 'Please enter valid clearing amount';
		} else if ($scope.clearing_amount > $scope.bonus_point) {
			$scope.clear_bonus_point_validation = 'Please enter valid clearing amount';
		} else {
			params = {
				'type': $scope.bonus_type,
				'person_id': $scope.person_id,
				'clearing_amount': $scope.clearing_amount,
				'csrfmiddlewaretoken': $scope.csrf_token,
			}
			$http({
				method: 'post',
				url: '/administration/clear_bonus_point/',
				data: $.param(params),
				headers: {
					'Content-Type' : 'application/x-www-form-urlencoded'
				}
			}).success(function(data){
				document.location.href = '/administration/view_bonus_point/';
			}).error(function(data, status){
				console.log('Request failed' || data);
			})
		}
	}
}
function SerialNoController($scope, $http) {
	$scope.serial_no = {
		'serial_no_type': '',
		'settings_type': 'Set Serial No',
		'prefix': '',
		'starting_no': 0,
	}
	$scope.init = function(csrf_token) {
		$scope.csrf_token = csrf_token;
	}
	// $scope.set_settings = function(settings_type){
	// 	if (settings_type == 'Auto Generated No'){
	// 		$scope.serial_no.settings_type = 'Auto Generated No';
	// 		$scope.show_serial_no_type = false;
	// 	}else if(settings_type == 'Set Serial No'){
	// 		$scope.serial_no.settings_type = 'Set Serial No';
	// 		$scope.show_serial_no_type = true;
	// 	}
	// }
	$scope.validate_serial_no_settings = function(){
		if($scope.serial_no.serial_no_type ==''){
			$scope.error_msg = 'Please select Receipt Or Invoice';
			return false;
		}else if($scope.serial_no.prefix == '' && $scope.serial_no.starting_no == ''){
			$scope.error_msg = 'Please enter either a prefix or a starting no';
			return false;
		}else if(!Number($scope.serial_no.starting_no)){
			$scope.error_msg = 'Please enter a number in starting no';
			return false;
		}
		return true;
	}
	$scope.save_settings = function(){
		params = {
				'serial_no': angular.toJson($scope.serial_no),
				'csrfmiddlewaretoken': $scope.csrf_token,
			}
		if ($scope.validate_serial_no_settings()){
			$http({
				method: 'post',
				url: '/administration/set_serial_no/',
				data: $.param(params),
				headers: {
					'Content-Type' : 'application/x-www-form-urlencoded'
				}
			}).success(function(data){
				document.location.href = '/administration/view_serial_no_settings/';
			}).error(function(data, status){
				console.log('Request failed' || data);
			})
		}
	}
}