(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcTeam',cpcTeam);

  /* @ngInject */
  function cpcTeam() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcTeam/cpcTeam.html',
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
  function Controller($log, $translate, $scope,$state, $modal,$stateParams,dataservice,employeeDetails,localStorageService,$rootScope, objectStore) {
	  var vm = this;

	  if( $(window).innerWidth() <= 767 || ($(window).innerWidth() >= 768 && $(window).innerWidth() <= 991)){
		  vm.isMobileTablet = true;
	  }
	  else{
		  vm.isMobileTablet = false;
	  }

	  vm.teamMembers = [];

	  vm.feedbackTeamMembers = [];

	  if(typeof $stateParams.username === 'undefined'){
		  var userObj = localStorageService.get("loggedInUser");
		  console.log("CASE 1 *********")
		  console.log(userObj);
		  vm.isPeopleManager = employeeDetails.isPeopleManager(userObj);
		  vm.isAltMgr = employeeDetails.isAltMgr(userObj);
		  if(vm.isPeopleManager){
			  vm.loaderTeam = true;
			  dataservice.getTeamMembers().then(function(data)
		      {
		          vm.reportees = data;
				  vm.loaderTeam = false;

				  var sampleArray = data.map(function(item, index, team){
				  	if(item !== null)
			  		{
			  			var userDetails = {};
			  			
			  			userDetails.username = item.username;
			  			userDetails.firstName = item.firstName;
			  			userDetails.lastName = item.lastName;

			  			vm.feedbackTeamMembers.push(userDetails);

				  		vm.teamMembers.push(item.username);
				  		return item.username;
				  	}
				  });

				  objectStore.feedback.feedbackDirectTeamStore.set(vm.feedbackTeamMembers);
				  objectStore.feedback.directTeamStore.set(vm.teamMembers);
			  });
		  }
	  }
	  else{
		  dataservice.getUserProfile($stateParams.username).then(function(response){
			  var userObj = localStorageService.get([$stateParams.username]);
			  console.log("CASE 2 *********");
			  console.log(userObj);
			  vm.isPeopleManager = employeeDetails.isPeopleManager(userObj);
			  vm.isAltMgr = employeeDetails.isAltMgr(userObj);
			  if(vm.isPeopleManager){
				  vm.loaderTeam = true;
				  dataservice.getTeamMembers().then(function(data)
			      {
			          vm.reportees = data;
					  vm.loaderTeam = false;
				  });
			  }
		  });
	}
	  
	  

	  vm.isEnabled = true;

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
	        	  return 'N';
	          }
	        }
	      });
	  }

	  vm.goToEmployeeHome = function(username){
		  $state.go("teammemberhome",{"username":username});
	  }


	  vm.toggleAltTeam = function(){
		if(angular.element('#altTeam').css('display') == 'none'){
			angular.element('#alternateTeamState').attr("src", '/client/assets/images/alternate-team-hover-active.png');
			angular.element('#altTeam').css('display','block');
	    }
	    else{
	    	angular.element('#alternateTeamState').attr("src", '/client/assets/images/alternate-team.png');
	    	angular.element('#altTeam').css('display','none');
	    }
	  }

	vm.getTruncatedName = function(firstName, lastName){
		var fullName = firstName+" "+lastName;
		if(fullName.length>13){
			fullName = fullName.substring(0,13)+"...";
		}
		return fullName;
	}

	 $scope.requestedProfileDetails = {

		};

    vm.isPopoverEnabled = true;
    vm.openedPopups = null;

    $scope.$on('closeTeamProfilePopover', function() {
      for(var popover in vm.openedPopups){
          angular.element(vm.openedPopups[popover]).trigger("hideonclick");
          angular.element(vm.openedPopups[popover]).remove();
      }
    });




    vm.selectedMember = null;
	  $scope.items = ['item1', 'item2', 'item3'];

	  $scope.animationsEnabled = true;

	  /*vm.setSelectedUsername = function(username)
    	{
      		employeeDetails.setCurrentSelectedTeamMember(username);
    	}*/

	  // PARAMETERS: Holding the current Team Profile to be opened.
	  // Currently the Id and the Username is used as identifier
	  // Your Services should be based on either of these two parameter. Similar to Pop over Service you are using.
	  vm.currentTeamProfileId = '';
	  vm.currentTeamUserName = ''

		  // Condition for View/Modal Popover to come - It comes all the time irrespective that the team member is a people manager or not.

		  $scope.animationsEnabled = true;

	  vm.open = function (empId, username, reportee) {
	  console.log("@@@@@@@@@@@@@@@  open function @@@@@@@@@@@@@@");
	  console.log("setting employee selected");
	  employeeDetails.setCurrentSelectedTeamMember(undefined);

	  $rootScope.$broadcast('empDetail', reportee);
		  vm.loaderPopup = true;
      for(var popover in vm.openedPopups){
        if(vm.openedPopups[popover] != ".team_popover_"+empId) {
          angular.element(vm.openedPopups[popover]).trigger("hideonclick");
          angular.element(vm.openedPopups[popover]).remove();
        }
        else
        {
          angular.element(".team_popover_"+empId).trigger("showonclick");
        }
      }

      vm.openedPopups = new Array();
      vm.openedPopups.push(".team_popover_"+empId);
      console.log("******** check "+username);
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


		vm.currentTeamProfileId = reportee.id;
		vm.currentTeamUserName = reportee.username;

		    // SERVICE CALL: Call your service here. This service would be similar/same to the data service you are calling for filling the data in Pop over
		    // This service will return same data as what it returned for you in the Popover.
		    // Parameters to the service: definitely username, probably the employee id
		    // The username is available on tap too. Use your existing service or a new service in the below mentioned comment.
		    // dataservice.getTeamProfile(reporteeObject);


    		// Once the response is available - you need to make this object accessible to the cpcMobileTeamProfile

		    if($(window).innerWidth() <= 767){
		      angular.element('.popover').css('display', 'none');
		    }
		    else if($(window).innerWidth() >= 768 && $(window).innerWidth() <= 991){
		      angular.element('.popover').css('display', 'none');
		    }
		    else if($(window).innerWidth() >= 992 && $(window).innerWidth() <= 1199){
		      $('.popover').css('display', 'block');
		    }
		    else if($(window).innerWidth() >= 1200){
		      $('.popover').css('display', 'block');
		    }

	  	};

	  	vm.openMobileView = function(empId, username, reportee){
	  		console.log("%%%%%%%%%%%%%%%% open mobile view %%%%%%%%%%%%%%%%%");
	  		console.log("in open mobile "+username);
	  		console.log("#profile"+empId);
	  		if(angular.element('#profile'+empId).css('display') == 'block')
	  			angular.element('#profile'+empId).css('display','none');
	  		else{
	  			angular.element('.mobilePopupContent').css('display','none');
		  		angular.element('#profile'+empId).css('display','block');
		  		employeeDetails.setCurrentSelectedTeamMember(reportee);
		  		$rootScope.$broadcast('empDetail', reportee);
		  		$rootScope.$broadcast('alternateTeamMember', 'N');
	  		}
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
