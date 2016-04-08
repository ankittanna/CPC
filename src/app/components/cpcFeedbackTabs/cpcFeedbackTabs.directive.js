(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcFeedbackTabs', cpcFeedbackTabs);

  /* @ngInject */

  function cpcFeedbackTabs() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcFeedbackTabs/cpcFeedbackTabs.html',
      bindToController: true,
      controller: Controller,
      controllerAs: 'vm',
      link: link,
      restrict: 'E',
	    attrs: {},
      scope: {
        heading: '@',
        linkHeading: '@',
        link: '@'
      }
    };
    return directive;

    function link(scope, element, attrs) {}
  }

  /* @ngInject */
  function Controller($log, $translate, $scope, $attrs, $state, $location, $window, $stateParams, $rootScope) {

	$scope.location = $location.path();

  $scope.feedbackStateObject = new Object();

  var vm = this;
  vm.shouldTabsContentBeShown = true;
  console.log("This is my location "+$location.path());

  vm.shouldProvideFeedbackTabBeShown = true;

/* THIS CODE BLOCK EXECUTES ON THE LOAD OF THE COMPONENT - i.e. freshly load the page or refresh the page */
  if($state.is('feedback.provide') || $state.is('teamMemberFeedback.provide'))
     {
      vm.shouldTabsContentBeShown = true;

      angular.element('.provide').addClass('active');
      angular.element('.reqrec').removeClass('active');
     } else if($state.is('feedback.recieve') || $state.is('teamMemberFeedback.recieve'))
     {
      vm.shouldTabsContentBeShown = true;

       angular.element('.reqrec').addClass('active');
       angular.element('.provide').removeClass('active');
     }

  if($state.is('feedback.requestedNew') || $state.is('feedback.unrequestedNew') || $state.is('feedback.viewFeedback') || $state.is('feedback.declineFeedback') || $state.is('feedback.deleteFeedback') || $state.is('teamMemberFeedback.deleteFeedback') || $state.is('feedback.sendFeedbackReminder') || $state.is('feedback.pendingFeedback') || $state.is('feedback.provideFeedback') || $state.is('teamMemberFeedback.requestedNew') || $state.is('teamMemberFeedback.unrequestedNew') || $state.is('teamMemberFeedback.viewFeedback') || $state.is('teamMemberFeedback.declineFeedback') || $state.is('teamMemberFeedback.sendFeedbackReminder') || $state.is('teamMemberFeedback.pendingFeedback') || $state.is('teamMemberFeedback.provideFeedback'))
     {
        vm.shouldTabsContentBeShown = false;
       // selfTeamNavTab
       angular.element('#selfTeamNavTab').addClass('displayNone');
     }

  if($state.is('feedback.recieveTeam') || $state.is('teamMemberFeedback.recieveTeam'))
  {
    vm.shouldProvideFeedbackTabBeShown = false;
    angular.element('#provideFeedbackTab').removeClass('active');
    angular.element('#requestRecieveTab').addClass('active');
  } else if($state.is('feedback.provide') || $state.is('teamMemberFeedback.provide'))
  {
    vm.shouldProvideFeedbackTabBeShown = true;
    angular.element('#provideFeedbackTab').addClass('active');
    angular.element('#requestRecieveTab').removeClass('active');
  }

  // REQUIREMENT: Give Feedback - termed as - 'provide feedback' should not be visible under drill down
  // Toggling the flag to tru will make it appear.
  // Associated changes also to be done on cpcSidebar for navigating to Get Feedback - termed as 'request/receive feedback' when in drill down mode
  if($state.is('teamMemberFeedback.recieve'))
  {
    vm.shouldProvideFeedbackTabBeShown = false;
    angular.element('#provideFeedbackTab').removeClass('active');
    angular.element('#requestRecieveTab').addClass('active');
  }

/* THIS CODE BLOCK EXECUTES ON THE Change of location - i.e. freshly load the page or refresh the page */
	$scope.$on('$locationChangeStart', function(event) {
     console.log("--------NEW------------> " + $location.path());

    if($state.is('feedback.recieveTeam') || $state.is('teamMemberFeedback.recieveTeam'))
    {
      vm.shouldProvideFeedbackTabBeShown = false;
      angular.element('#provideFeedbackTab').removeClass('active');
      angular.element('#requestRecieveTab').addClass('active');
    } else if($state.is('feedback.provide') || $state.is('teamMemberFeedback.provide'))
    {
      vm.shouldProvideFeedbackTabBeShown = true;
      angular.element('#provideFeedbackTab').addClass('active');
      angular.element('#requestRecieveTab').removeClass('active');
    }

     if($state.is('feedback.provide') || $state.is('teamMemberFeedback.provide'))
     {
      console.log("######--PROVIDE--############");
      vm.shouldTabsContentBeShown = true;
      angular.element('#selfTeamNavTab').addClass('displayBlock');

      $('.provide').addClass('active');
      $('.reqrec').removeClass('active');
     } else if($state.is('feedback.recieve') || $state.is('teamMemberFeedback.recieve'))
     {
      console.log("######--RECEIVE--############");
      vm.shouldTabsContentBeShown = true;
      angular.element('#selfTeamNavTab').addClass('displayBlock');

       $('.reqrec').addClass('active');
       $('.provide').removeClass('active');
     } 

     if($state.is('feedback.requestedNew') || $state.is('feedback.unrequestedNew') || $state.is('feedback.viewFeedback') || $state.is('feedback.declineFeedback') || $state.is('feedback.deleteFeedback') || $state.is('teamMemberFeedback.deleteFeedback') || $state.is('feedback.sendFeedbackReminder') || $state.is('feedback.pendingFeedback') || $state.is('feedback.provideFeedback') || $state.is('teamMemberFeedback.requestedNew') || $state.is('teamMemberFeedback.unrequestedNew') || $state.is('teamMemberFeedback.viewFeedback') || $state.is('teamMemberFeedback.declineFeedback') || $state.is('teamMemberFeedback.sendFeedbackReminder') || $state.is('teamMemberFeedback.pendingFeedback') || $state.is('teamMemberFeedback.provideFeedback'))
     {
        console.log("######--NEW REQUESTED UNREQUESTED--############");
        vm.shouldTabsContentBeShown = false;
       // selfTeamNavTab
       angular.element('#selfTeamNavTab').addClass('displayNone');
     }
	});

$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        if($state.is('feedback.recieveTeam') || $state.is('teamMemberFeedback.recieveTeam'))
        {
          vm.shouldProvideFeedbackTabBeShown = false;
          angular.element('#provideFeedbackTab').removeClass('active');
          angular.element('#requestRecieveTab').addClass('active');
        } else if($state.is('feedback.provide') || $state.is('teamMemberFeedback.provide'))
        {
          vm.shouldProvideFeedbackTabBeShown = true;
          angular.element('#provideFeedbackTab').addClass('active');
          angular.element('#requestRecieveTab').removeClass('active');
        }

         if($state.is('feedback.provide') || $state.is('teamMemberFeedback.provide'))
         {
          console.log("######--PROVIDE--############");
          vm.shouldTabsContentBeShown = true;
          angular.element('#selfTeamNavTab').addClass('displayBlock');

          $('.provide').addClass('active');
          $('.reqrec').removeClass('active');
         } else if($state.is('feedback.recieve') || $state.is('teamMemberFeedback.recieve'))
         {
          console.log("######--RECEIVE--############");
          vm.shouldTabsContentBeShown = true;
          angular.element('#selfTeamNavTab').addClass('displayBlock');

           $('.reqrec').addClass('active');
           $('.provide').removeClass('active');
         } 

         if($state.is('feedback.requestedNew') || $state.is('feedback.unrequestedNew') || $state.is('feedback.viewFeedback') || $state.is('feedback.declineFeedback') || $state.is('feedback.deleteFeedback') || $state.is('teamMemberFeedback.deleteFeedback') || $state.is('feedback.sendFeedbackReminder') || $state.is('feedback.pendingFeedback') || $state.is('feedback.provideFeedback') || $state.is('teamMemberFeedback.requestedNew') || $state.is('teamMemberFeedback.unrequestedNew') || $state.is('teamMemberFeedback.viewFeedback') || $state.is('teamMemberFeedback.declineFeedback') || $state.is('teamMemberFeedback.sendFeedbackReminder') || $state.is('teamMemberFeedback.pendingFeedback') || $state.is('teamMemberFeedback.provideFeedback'))
         {
            console.log("######--NEW REQUESTED UNREQUESTED--############");
            vm.shouldTabsContentBeShown = false;
           // selfTeamNavTab
           angular.element('#selfTeamNavTab').addClass('displayNone');
         }
    });

    vm.data = {
      heading: vm.heading,
      link: vm.link,
      linkHeading: vm.linkHeading,
    };
	
	vm.toggleFeedbackTabs = function(type)
	{
    if($window.tabMode === 'self')
    {
        if(type == 'provide')
        {
          $('.provide').addClass('active');
          $('.reqrec').removeClass('active');

          if($stateParams.username){
            $state.go('teamMemberFeedback.provide',{"tmusername":$stateParams.username});
          }
          else{
            $state.go('feedback.provide');
          }

          // $state.go('feedback.provide');
        } else if(type == 'reqrec')
        {
          $('.reqrec').addClass('active');
          $('.provide').removeClass('active');

          if($stateParams.username){
            $state.go('teamMemberFeedback.recieve',{"tmusername":$stateParams.username});
          }
          else{
            $state.go('feedback.recieve');
          }

         // $state.go('feedback.recieve');
        }
    } else if($window.tabMode === 'team')
    {
         if(type == 'provide')
        {
          $('.provide').addClass('active');
          $('.reqrec').removeClass('active');

          if($stateParams.username){
            $state.go('teamMemberFeedback.provideTeam',{"tmusername":$stateParams.username});
          }
          else{
            $state.go('feedback.provideTeam');
          }

         // $state.go('feedback.provideTeam');
        } else if(type == 'reqrec')
        {
          $('.reqrec').addClass('active');
          $('.provide').removeClass('active');

          if($stateParams.username){
            $state.go('teamMemberFeedback.recieveTeam',{"tmusername":$stateParams.username});
          }
          else{
            $state.go('feedback.recieveTeam');
          }

          // $state.go('feedback.recieveTeam');
        }
    }
		
	};
  }
})();
