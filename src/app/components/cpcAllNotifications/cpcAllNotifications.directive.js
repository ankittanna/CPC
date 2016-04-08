(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcAllNotifications', cpcAllNotifications);

  /* @ngInject */

  function cpcAllNotifications() {
    // Usage:
    //
    // Creates:
    //

    var directive = {
      templateUrl: '/client/app/components/cpcAllNotifications/cpcAllNotifications.html',
      bindToController: true,
      controller: Controller,
      controllerAs: 'vm',
      link: link,
      restrict: 'E',
      scope: {}
    };
    return directive;

    function link(scope, element, attrs) {}
  }

  /* @ngInject */
  function Controller($log, $translate, $scope,dataservice,employeeDetails,$state) {
    var vm = this;
    vm.recordsPerPage = 10;
    vm.showLoadMore = false;
    vm.totalRecord = null;
    activate();
    
    vm.goToDeleteNotification = function(notification){
     dataservice.deleteNotification(notification).then(function(data){
        $scope.loaderPopup = true;
        if(data.status === 200 || data.status === 201) {
          vm.notifications =data.data;
          $scope.loaderPopup = false;
        }
      });
    };
    
    function activate(){
	    dataservice.getUserNotification().then(function(data){
	      $scope.loaderPopup = true;
	      if(data.status === 200 || data.status === 201) {
	        vm.notificationsData =data.data;
	        vm.totalRecord = vm.notificationsData.length;
	        console.log("*********** vm.notificationLength "+vm.totalRecord);
	        vm.notifications = new Array();
	        for(var i=0; i<vm.recordsPerPage; i++){
	        	vm.notifications.push(vm.notificationsData[i]);
	        }
	         
	        if(vm.recordsPerPage >= vm.totalRecord){
	      	  vm.showLoadMore = false;
	        }
	        else{
	      	  vm.showLoadMore = true;
	        }
	        
	        $scope.loaderPopup = false;
	      }
	    });
    }
    
    vm.getMoreNotifications = function(){
    	if(vm.recordsPerPage < vm.totalRecord){
    		vm.recordsPerPage = vm.recordsPerPage + 5;
    	}
    	activate();
    }
  }
})();





