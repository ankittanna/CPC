(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcAlternateTeam', cpcAlternateTeam);

  /* @ngInject */
  function cpcAlternateTeam() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcAlternateTeam/cpcAlternateTeam.html',
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
  function Controller($log, $translate, $scope,dataservice,employeeDetails,$rootScope,$stateParams,localStorageService,$modal,objectStore) {
	var vm = this;

	if( $(window).innerWidth() <= 767 || ($(window).innerWidth() >= 768 && $(window).innerWidth() <= 991)){
		  vm.isMobileTablet = true;
	  }
	  else{
		  vm.isMobileTablet = false;
	  }
	
	vm.alternateTeamMembers = [];
	vm.feedbackAlternateTeamMembers = [];

	 if(typeof $stateParams.username === 'undefined'){
		  var userObj = localStorageService.get("loggedInUser");
		  console.log("CASE 1 *********")
		  console.log(userObj);
		  vm.isAltMgr = employeeDetails.isAltMgr(userObj);
		  if(vm.isAltMgr){
			dataservice.getAlternateTeam().then(function(data){
			  vm.reportees = data;

			  var sampleArray = data.map(function(item, index, team){
			  		if(item !== null)
			  		{
			  			var userDetails = {};
			  			userDetails.username = item.username;
			  			userDetails.firstName = item.firstName;
			  			userDetails.lastName = item.lastName;
			  			
			  			vm.feedbackAlternateTeamMembers.push(userDetails);
			  			vm.alternateTeamMembers.push(item.username);
				  		return item.username;
			  		}
				  });

			  objectStore.feedback.feedbackAlternateTeamStore.set(vm.feedbackAlternateTeamMembers);
			  objectStore.feedback.alternateTeamStore.set(vm.alternateTeamMembers);

			  		//alert(vm.alternateTeamMembers);
		  	});
		}
	  }
	  else{
		  dataservice.getUserProfile($stateParams.username).then(function(response){
			  var userObj = localStorageService.get([$stateParams.username]);
			  console.log("CASE 2 *********");
			  console.log(userObj);
			  vm.isAltMgr = employeeDetails.isAltMgr(userObj);
			  if(vm.isAltMgr){
				  dataservice.getAlternateTeam().then(function(data){
					  vm.reportees = data;
				  });
			  }
		  });
	}
	
	
/*	vm.isAltMgr = employeeDetails.isAltMgr();
	if(vm.isAltMgr){
		dataservice.getAlternateTeam().then(function(data){
			  vm.reportees = data;
		  });
	}
*/
	vm.getTruncatedName = function(firstName, lastName){
		var fullName = firstName+" "+lastName;
		if(fullName.length>13){
			fullName = fullName.substring(0,13)+"...";
		}
		return fullName;
	}

//  vm.setSelectedUsername = function(username)
//  {
//    employeeDetails.setCurrentSelectedTeamMember(username);
//  }

	// Expected from services
	vm.dynamicPopover = {
	    content: 'Hello, World!',
	    templateUrl: 'myPopoverTemplate.html',
	    title: 'Title'
	  };

	$scope.requestedProfileDetails = {

		};


	  $scope.items = ['item1', 'item2', 'item3'];

	  $scope.animationsEnabled = true;

    vm.openModal = function(empId, username, reportee){

      $scope.reportee = reportee;
      console.log('values',empId, username, reportee)
      $rootScope.$emit('empDetail', reportee);
      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'myPopoverTemplate.html',
        controller: 'HomeTabCtrl',
        controllerAs: 'vm',
        backdrop : 'static',
        keyboard :false,
        size: 'lg',
        resolve: {
          reportee: function () {
            employeeDetails.setCurrentSelectedTeamMember(reportee);
            return $scope.reportee;
          },
          alternateTeamMember: function(){
        	  return 'Y';
          }
        }
      });
    }

	  vm.altOpen = function (empId, username,reportee) {

	   /* var modalInstance = $modal.open({
	      animation: $scope.animationsEnabled,
		  backdrop: false,
	      templateUrl: 'myModalContent.html',
	      controller: 'ModalInstanceCtrl',
	      size: 'lg',
	      resolve: {
	        items: function () {
	          return $scope.items;
	        }
	      }
	    });*/

	  console.log("setting employee selected");
	  employeeDetails.setCurrentSelectedTeamMember(username);

      $rootScope.$broadcast('empDetail', reportee);

      dataservice.getUserProfile(username).then(function(data)
      {
        if(data.status === 200 || data.status === 201) {
          vm.selectedMember = data;
          vm.selectedUsername = data.username;
          vm.selectedFirstName = data.firstName;
          vm.selectedLastName = data.lastName;
          vm.deptName = data.departmentName;
          vm.selectedEmpId = data.id;
          vm.loaderPopup = false;
        }
      });

/*		$('body').css('overflow', 'visible');

      if(typeof modalInstance !== 'undefined') {
        modalInstance.result.then(function (selectedItem) {
          $scope.selected = selectedItem;
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
      }
		var modalPositionOffset = 0;
		var modalTopPosition = 0;

		var position = $('#reportee'+empId).offset();

		$(document).ready(function(e) {
			 modalPositionOffset = $(window).scrollTop();
			 modalTopPosition = 0;

			$(window).scroll(function() { //when window is scrolled
				modalPositionOffset = $(window).scrollTop();
				//console.log(modalPositionOffset);
				var currentOpenModal = $('.modal');
				currentOpenModal.css('top',position - modalPositionOffset + 'px');
			});
		});

		var currentOpenModal = $('.modal');
		currentOpenModal.css('top',position - modalPositionOffset + 'px');
		////alert(position.left + " " + position.top + " " + modalPositionOffset);
		////alert(position.top - modalPositionOffset);
*/

	  };

	  vm.goToEmployeeHomeAlt = function(username){
		  $state.go("teammemberhome",{"username":username});
	  }

	  vm.altOpenMobileView = function(empId, username, reportee){
	  		console.log("in open mobile alternate "+username);
	  		console.log("#profile"+empId);
	  		angular.element('.mobilePopupContent').css('display','none');
	  		angular.element('#profile'+empId).css('display','block');
	  		employeeDetails.setCurrentSelectedTeamMember(reportee);
	  		$rootScope.$broadcast('empDetail', reportee);
	  		$rootScope.$broadcast('alternateTeamMember', 'Y');
	  }

	  $scope.toggleAnimation = function () {
	    $scope.animationsEnabled = !$scope.animationsEnabled;
	  };

	  }


})();


/*angular.module('cpccore').controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});*/


// Initialize Scroll Tracking of the Page
$(document).ready(function(e) {

		 modalPositionOffset = $(window).scrollTop();
		 modalTopPosition = 0;

		$(window).scroll(function() { //when window is scrolled
			modalPositionOffset = $(window).scrollTop();
		});

	});


