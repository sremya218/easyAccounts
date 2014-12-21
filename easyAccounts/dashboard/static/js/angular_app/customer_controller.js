/************************************ Customer - common js methods ****************************************/
function get_accounting_customers($scope, $http) {
    $http.get('/customers/?ajax=true').success(function(data){
       
        if (data.result == 'ok') {
            if (data.customers.length > 0) {
                $scope.customers = data.customers;
                
            }
        } else{
            $scope.message = data.message;
        }
    }).error(function(data, status){
        $scope.message = data.message;
    })
}
function get_customer_search_list($scope, $http) {
    $scope.no_customer_msg = '';
    if ($scope.customer_name != '' && $scope.customer_name != undefined && $scope.customer_name.length > 0) {
        var customer_name = $scope.customer_name;
       
        $http.get('/customers/?name='+customer_name+'&ajax=true').success(function(data){
            
            $scope.no_customer_msg = '';
            if (data.customers.length == 0) {
                $scope.no_customer_msg = 'No such customer';
                $scope.customers = [];
            } else {
                $scope.customers = data.customers;
               
            }
        }).error(function(data, status){
            console.log('Request failed'|| data);
        });
    }
} 
function get_area_search_list($scope, $http) {
    $scope.no_area_msg = '';
    if ($scope.area != '' && $scope.area != undefined && $scope.area.length > 0) {
        var area = $scope.area;
       
        $http.get('/customers/area_search/?area='+area+'&ajax=true').success(function(data){
            
            $scope.no_customer_msg = '';
            if (data.areas.length == 0) {
                $scope.no_area_msg = 'No such area';
                $scope.areas = [];
            } else {
                $scope.areas = data.areas;
               
            }
        }).error(function(data, status){
            console.log('Request failed'|| data);
        });
    }
} 
function validate_customer($scope) {
        if ($scope.customer.name == '' || $scope.customer.name == undefined) {
            $scope.validate_customer_error_msg = 'Please enter the name';
            return false;
        } else if ($scope.customer.contact_number && (!Number($scope.customer.contact_number) || $scope.customer.contact_number.length < 10)) {
            $scope.validate_customer_error_msg = 'Please enter a valid Contact Number';
            return false;
        } else if ($scope.customer.email && !validateEmail($scope.customer.email)) {
            $scope.validate_customer_error_msg = 'Please enter a valid email';
            return false;
        } 
        return true;
    }
function save_customer($scope, $http, from){
    params = {
        'customer': angular.toJson($scope.customer),
        "csrfmiddlewaretoken": $scope.csrf_token,
    }
    if (validate_customer($scope)) {
        
        $http({
            method: 'post',
            url: '/customers/add_customer/',
            data : $.param(params),
            headers : {
                'Content-Type' : 'application/x-www-form-urlencoded'
            }
        }).success(function(data){
            $scope.validate_customer_error_msg = '';
            if (data.result == 'error') {
                $scope.validate_customer_error_msg = data.message;
            } else {
                if (from == 'sales') {
                    $scope.current_sales.customer = data.customer.id;
                    $scope.customer_name = data.customer.name;
                    hide_popup();
                } else if (from == 'estimate') {
                    $scope.estimate.customer = data.customer.id;
                    $scope.customer_name = data.customer.name;
                    hide_popup();
                } else if (from == 'delivery') {
                    $scope.delivery.customer = data.customer.id;
                    $scope.customer_name = data.customer.name;
                    hide_popup();
                } else if (from == 'bill_to_invoice') {
                    $scope.sales.customer = data.customer.id;
                    $scope.customer_name = data.customer.name;
                    hide_popup();
                }else if (from == 'sales_return') {
                    $scope.sales_return.customer = data.customer.id;
                    $scope.customer_name = data.customer.name;
                    hide_popup();
                }else
                    document.location.href = '/customers/';
            }
        }).error(function(data, status) {   
            console.log('Request failed' || data);
        });
    }
}
/************************************ Customer - common js methods - end ************************************/
function CustomerController($scope, $http){
    $scope.customer= {
        'name': '',
        'address': '',
        'contact_number': '',
        'email': '',
        'area': '',
    }
    $scope.init = function(csrf_token, customer_id){
        $scope.csrf_token = csrf_token;
        get_accounting_customers($scope, $http);
    }
    
    $scope.create_customer = function(){
        document.location.href = '/customers/add_customer/';
    }
    $scope.get_customer_list = function(){
        if($scope.customer_name.length == 0)
            get_accounting_customers($scope, $http);
        else
            get_customer_search_list($scope, $http);
    }
    $scope.save_customer = function() {
        save_customer($scope, $http);
    }
    $scope.edit_customer_details = function(customer){
        document.location.href = '/customers/edit_customer/?customer_id='+customer.id;
    }
    $scope.delete_customer = function(customer) {
        document.location.href = '/customers/delete_customer/?customer_id='+customer.id;
    }
    $scope.view_customer = function(customer) {
        $scope.customer = customer;
        create_popup();
    }
    $scope.hide_popup = function(){
        hide_popup();
    }
}
function AddCustomerController($scope, $http){
    $scope.customer= {
        'name': '',
        'address': '',
        'contact_number': '',
        'email': '',
        'area': '',
    }
    $scope.init = function(csrf_token, customer_id) {
        $scope.csrf_token = csrf_token;
        if (customer_id){
            $http.get('/customers/edit_customer/?customer_id='+customer_id+'&ajax=true').success(function(data){
                $scope.customer = data.customer;
            }).error(function(data, status){
                console.log('Request failed');
            })
        }
    }
    $scope.save_customer = function() {
        save_customer($scope, $http);
    }
}

function AccountsReceivableController($scope, $http){
    
    $scope.init = function(csrf_token) {
        $scope.csrf_token = csrf_token;
        $http.get('/customers/accounts_receivable/?ajax=true').success(function(data)
        {
            $scope.account_receivables = data.account_receivables;
            
        }).error(function(data, status)
        {
            console.log(data || "Request failed");
        });
    }
    
   
    $scope.get_account_receivable_report = function(){
        
        document.location.href = '/customers/accounts_receivable?report_type=pdf';
    }
}
function ReceivedReportController($scope, $http){
    $scope.start_date = '';
    $scope.end_date = '';
    $scope.report_flag = 'date_flag';
    $scope.show_date = true;
    $scope.report_details = {
            'start_date': '',
            'end_date': '',
            'customer_name':'',
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
    $scope.select_report_type = function(type){
        if (type == 'date_flag'){
            $scope.show_date = true;
            $scope.show_customer = false;
        }
        else{
            $scope.show_customer = true;
            $scope.show_date = false;
        }
    }
    $scope.validate = function(){
        $scope.start_date = $('#start_date').val();
        $scope.end_date = $('#end_date').val();
        if($scope.report_flag == 'date_flag'){
            if($scope.start_date == '' ||$scope.start_date == undefined || $scope.start_date.length == 0){
                $scope.validate_error_msg = 'Please select start date';
                return false;
            } else if($scope.end_date == ''||$scope.end_date == undefined || $scope.end_date.length == 0){
                $scope.validate_error_msg = 'Please select end date';
                return false;
            } 
        }else if($scope.customer_name == ''|| $scope.customer_name == undefined){
            $scope.validate_error_msg = 'Please select  customer';
            return false;
        }return true;
    }
    $scope.view_ledger = function(){
        if($scope.validate()){
            $scope.validate_error_msg = ""
            $scope.report_details.start_date = $scope.start_date;
            $scope.report_details.end_date = $scope.end_date;
            if ($scope.customer_name)
                var url = '/customers/received_report?customer_name='+$scope.customer_name;
            else
                var url ='/customers/received_report?start_date='+$scope.report_details.start_date+'&end_date='+$scope.report_details.end_date;
            $http.get(url).success(function(data){
            
            $scope.sales_details = data.sales_details;
            
            if($scope.sales_details.length == 0)
                $scope.validate_error_msg = "No received details found";
            }).error(function(data, status){
                $scope.message = data.message;
            })
            
        }
    }   
    
    $scope.get_received_report = function(){
        if($scope.validate()){
        
            if ($scope.customer_name)
                document.location.href = '/customers/received_report?customer_name='+$scope.customer_name+'&report_type=pdf';
            else
                document.location.href = '/customers/received_report?start_date='+$scope.start_date+'&end_date='+$scope.end_date+'&report_type=pdf';
        }
    }
}

function CustomerBonusPointController($scope, $http){

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
    $scope.init = function(csrf_token){
        $scope.csrf_token = csrf_token;
    }
    $scope.view_bonus_points = function(){
        $scope.start_date = $('#start_date').val();
        $scope.end_date = $('#end_date').val();
        if ($scope.start_date == '' || $scope.start_date == undefined){
            $scope.validate_error_msg = 'Please choose the Start Date';
        } else if ($scope.end_date == '' || $scope.end_date == undefined){
            $scope.validate_error_msg = 'Please choose the End Date';
        } else if ($scope.customer_id == '' || $scope.customer_id == undefined){
            $scope.validate_error_msg = 'Please choose the Customer';
        } else {
            $http.get('/customers/customer_bonus_points/?customer='+$scope.customer_id+'&start_date='+$scope.start_date+'&end_date='+$scope.end_date).success(function(data){
                $scope.customer_bonus_point_details = data.bonus_point_details;
            })
        }
    }
    $scope.select_customer = function(customer){
        $scope.customer_name = customer.name;
        $scope.customer_id = customer.id;
        $scope.customers = [];
    }
    $scope.get_customer_details = function(){
        get_customer_search_list($scope, $http);
    }
    $scope.generate_pdf = function(){
        $scope.validate_error_msg = '';
        $scope.start_date = $('#start_date').val();
        $scope.end_date = $('#end_date').val();
        if ($scope.start_date == '' || $scope.start_date == undefined){
            $scope.validate_error_msg = 'Please choose the Start Date';
        } else if ($scope.end_date == '' || $scope.end_date == undefined){
            $scope.validate_error_msg = 'Please choose the End Date';
        } else if ($scope.customer_id == '' || $scope.customer_id == undefined){
            $scope.validate_error_msg = 'Please choose the Customer';
        } else {
            document.location.href = '/customers/customer_bonus_points/?customer='+$scope.customer_id+'&start_date='+$scope.start_date+'&end_date='+$scope.end_date
        }
    }
}