(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcQuickLinks', cpcQuickLinks);

  /* @ngInject */
  function cpcQuickLinks() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcQuickLinks/cpcQuickLinks.html',
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
  function Controller($log, $translate, $scope, $state,$stateParams,employeeDetails,dataservice,localStorageService,objectStore, $location, $window) {
  		$scope.go = function ( path ) {
		  	$location.path( path );
		};
	var vm = this;
	vm.teamMemberHome = false;

	console.log("checking is username is there "+$stateParams.username);
	if(typeof $stateParams.username != 'undefined'){
		vm.teamMemberHome = true;
		vm.teamMemberUsername = $stateParams.username;
		
		dataservice.getUserProfile(vm.teamMemberUsername).then(function(response){
			  vm.teamMemberuserObj = localStorageService.get([vm.teamMemberUsername]);
			  console.log(vm.teamMemberuserObj);
			  vm.teamMemberFullName = vm.teamMemberuserObj.firstName;
		});
		
//		employeeDetails.getUserFullName(vm.teamMemberUsername).then(function(fullName){
//	          vm.teamMemberFullName = fullName;
//	        });
	}
	else{
		$scope.userProfile = $window.userProfile;
	}


    vm.navigateFeedback = function(section){
      /*if(section === 'self'){
    	  vm.feedbackContextUserName = localStorageService.get("loggedInUser").username;
          objectStore.feedback.feedbackContextUsername.set(vm.feedbackContextUserName);
          $state.go('feedback.provide');
      } else if(section === 'team'){
    	  $state.go('feedback.recieveTeam');
      }*/
      vm.feedbackContextUserName = localStorageService.get("loggedInUser").username;
      objectStore.feedback.feedbackContextUsername.set(vm.feedbackContextUserName);

      if(section === 'self'){
      	if($stateParams.username)
	      {
	      	 $state.go('teamMemberFeedback.provide');
	      } else
	      {
	      	 $state.go('feedback.provide');
	      }
      } else if(section === 'team')
      {
      	if($stateParams.username)
	      {
	      	 $state.go('teamMemberFeedback.recieveTeam');
	      } else
	      {
	      	 $state.go('feedback.recieveTeam');
	      }
      }

    };

	$scope.modeLoaded = "Active";

	$scope.loadNewConvesration = function(state)
	{
		if(state == 'self')
		{
			$state.go('conversations.selfState');
		} else if(state == 'team')
		{
			$state.go('conversations.teamState');
		}
	};

	vm.viewAllFeedback = function(state){
		if(state == 'teamMember'){
			objectStore.feedback.viewAllFeedbackUsername.set(vm.teamMemberUsername);
		    if($stateParams.username)
		      {
		      	 $state.go('teamMemberFeedback.recieve');
		      } else
		      {
		      	 $state.go('feedback.recieve');
		      }
		}
		else if(state == 'teamMemberTeam'){
			if($stateParams.username)
		      {
		      	 $state.go('teamMemberFeedback.recieveTeam');
		      } else
		      {
		      	 $state.go('feedback.recieveTeam');
		      }
		}
		
	}

	vm.viewAllConvesration = function(state){
		if(state == 'teamMember'){
			$state.go('conversationsTeamMember.self', {"tmusername": vm.teamMemberUsername});
		}
		else if(state == 'teamMemberTeam'){
			$state.go('conversationsTeamMember.team');
		}
	}
  }
})();
