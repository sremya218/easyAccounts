

function validateEmail(email) { 
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function paginate(list, $scope, page_interval) {
    if(!page_interval)
        $scope.page_interval = 20;
    else 
        $scope.page_interval = page_interval;
    $scope.current_page = 1;
    $scope.pages = list.length / $scope.page_interval;
    if($scope.pages > parseInt($scope.pages))
        $scope.pages = parseInt($scope.pages) + 1;
    $scope.visible_list = list.slice(0, $scope.page_interval);
}
    
function select_page(page, list, $scope, page_interval) {
    if(!page_interval)
        $scope.page_interval = 20;
    var last_page = page - 1;
    var start = (last_page * $scope.page_interval);
    var end = $scope.page_interval * page;
    $scope.visible_list = list.slice(start, end);
    $scope.current_page = page;
}

function show_loader(){
    $('#overlay').css('display', 'block');
    $('.spinner').css('display', 'block');
}
function hide_loader(){
    $('#overlay').css('display', 'none');
    $('.spinner').css('display', 'none');
}
app.directive('keyTrap', function() {
  return function( scope, elem ) {
    elem.bind('keydown', function( event ) {
      scope.$broadcast('keydown', event.keyCode );
    });
  };
});

function create_popup() {
    $('#popup_overlay').css('display', 'block');
    $('#dialogue_popup_container').css('height', '100%');
    $('#dialogue_popup_container').css('display', 'block');
    $('#dialogue_popup').css('display', 'block');
    $('#stock_search_popup').css('display', 'none');
}
function hide_popup() {
    $('#dialogue_popup_container').css('display', 'none');
    $('#popup_overlay').css('display', 'none');
}

function MenuController($scope, $http) {
    
    $scope.init = function(csrf_token) {
        $scope.left_index = -1;
        $scope.currentIndex = 0;
    }  
    $scope.left_slide = function(event, direction) {
        var target = $(event.currentTarget);
        var element = target.parent().find('ul');
        var lis = $(element).children();
        var lis_length = 0;
        for (var i=0; i<lis.length; i++){
            if (lis[i].tagName.toLowerCase() == 'li') {
                lis_length = lis_length+1;
                $(lis[i]).removeClass('horizontal_menu_active');
            }
        }
        $scope.currentIndex = $scope.currentIndex+1;
        if ($scope.currentIndex > lis_length-1){
            $scope.currentIndex = lis_length-1;
        }
        // console.log($scope.currentIndex, lis.length, lis)
        $(lis[$scope.currentIndex]).addClass('horizontal_menu_active');
        if ($scope.currentIndex >= 4) {
            if ($scope.currentIndex != lis_length-1){
            // if ($scope.currentIndex != lis.length-2){
                var index = $scope.left_index+1;
                // console.log($scope.currentIndex, index);
                $(lis[index]).css('display', 'none');
                $scope.left_index = index;
            } else if ($scope.currentIndex == lis_length-1){
                var index = $scope.left_index+1;
                $(lis[index]).css('display', 'none');
                $scope.left_index = index;
            }
        }     
    } 
    $scope.right_slide = function(event, direction) {
        var target = $(event.currentTarget);
        var element = target.parent().find('ul');
        var lis = $(element).children();
        for (var i=0; i<lis.length; i++){
            $(lis[i]).removeClass('horizontal_menu_active');
        }
        $(lis[$scope.currentIndex]).removeClass('horizontal_menu_active');
        $scope.currentIndex = $scope.currentIndex-1;
        if ($scope.currentIndex < 0)
            $scope.currentIndex = 0;
        $(lis[$scope.currentIndex]).addClass('horizontal_menu_active');
        var index = (lis.length-7)+$scope.left_index;
        if (index >=-1) {
            $(lis[$scope.left_index]).css('display', 'block');
            console.log($scope.currentIndex-6)
            if ($scope.left_index -1 > 0)
                $(lis[$scope.currentIndex-6]).css('display', 'none')
            $scope.left_index = $scope.left_index - 1;
            if ($scope.left_index < -1) {
                $scope.left_index = -1;
            }
        } 
    } 
    $scope.hide_popup = function() {
        $('#stock_search_popup').css('display', 'none');
        hide_popup();
    }
}

function ResetPasswordController($scope, $http) {
    
    $scope.init = function(csrf_token) {
        $scope.new_password = '';
        $scope.confirm_password = '';
        $scope.csrf_token = csrf_token;
    } 
    $scope.save_new_password = function(){
        params = {
            'new_password': $scope.new_password,
            'confirm_password': $scope.confirm_password,
            "csrfmiddlewaretoken": $scope.csrf_token,
        }
        if($scope.new_password == $scope.confirm_password && $scope.new_password != ''){
            $http({
                method: 'post',
                url: '/reset_password/',
                data: $.param(params),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function(data){
                $scope.error_message = data.message;
                $scope.new_password = '';
                $scope.confirm_password = '';
            }).error(function(data){

            })
        } else {
            if($scope.new_password == '')
                $scope.error_message = "Please enter Password";
            else
                $scope.error_message = "Password miss match"
        }
    } 
}

function ForgotPasswordController($scope, $http) {
    
    $scope.init = function(csrf_token) {
        $scope.username = '';
        $scope.new_password = '';
        $scope.confirm_password = '';
        $scope.csrf_token = csrf_token;
    } 
    $scope.save_new_password = function(){
        params = {
            'new_password': $scope.new_password,
            'confirm_password': $scope.confirm_password,
            'username': $scope.username,
            "csrfmiddlewaretoken": $scope.csrf_token,
        }
        if($scope.new_password == $scope.confirm_password && $scope.new_password != '' && $scope.username !=''){
            $http({
                method: 'post',
                url: '/forgot_password/',
                data: $.param(params),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function(data){
                $scope.error_message = data.message;
                $scope.new_password = '';
                $scope.confirm_password = '';
                $scope.username = '';
                document.location.href = '/login/';
            }).error(function(data){

            })
        } else {
            if($scope.new_password != $scope.confirm_password)
                $scope.error_message = "Password miss match";
            else if($scope.username =='')
                $scope.error_message = "Please enter username";
            else if($scope.new_password == '')
                $scope.error_message = "Please enter password"
        }
    } 
}

function MenuStaffPermissions($scope, $http) {
    
    $scope.init = function(csrf_token) {
        $scope.new_password = '';
        $scope.confirm_password = '';
        $scope.csrf_token = csrf_token;
        $scope.get_staff_permissions();
    } 
    $scope.get_staff_permissions = function(){
        params = {
            'new_password': $scope.new_password,
            'confirm_password': $scope.confirm_password,
            "csrfmiddlewaretoken": $scope.csrf_token,
        }
        $http.get('/administration/get_staff_permissions/').success(function(data){
            $scope.is_staff = data.is_staff;
            $scope.staff = data.staff;
        }).error(function(data){

        })
    } 
}