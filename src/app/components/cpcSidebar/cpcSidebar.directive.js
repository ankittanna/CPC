(function () {
  'use strict';

  angular
      .module('cpccore')
      .directive('cpcSidebar', cpcSidebar);

  cpcSidebar.$inject = ['$location','localStorageService','$window'];

  /* @ngInject */
  function cpcSidebar() {

    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcSidebar/cpcSidebar.html',
      bindToController: true,
      controller: Controller,
      controllerAs: 'vm',
      link: link,
      restrict: 'E',
      scope: {}
    };
    return directive;

    function link(scope, element, attrs) {
    }
  }

  /* @ngInject */
  function Controller($scope, $rootScope, $location, $state,localStorageService,$stateParams, objectStore, $timeout, $q,$window) {

    var vm = this;

 //   vm.username = null;



    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
      if(toState.name === 'teammemberhome'){
        vm.username = toParams.username;
        objectStore.home.currentSelectedTeamMember.set(toParams.username);
      }
      else{
        vm.username = null;
      }

      vm.setSideBarState(toState.name);

    });

    $scope.go = function (path) {
      $location.path(path);
    };

    vm.getLocation = function(){
      return $q(function(resolve){
        resolve($location.path());
      });
    }

    vm.goToFeedback = function()
    {
      vm.feedbackContextUserName = localStorageService.get("loggedInUser").username;
      objectStore.feedback.feedbackContextUsername.set(vm.feedbackContextUserName);
      objectStore.feedback.viewAllFeedbackSource.remove();

      vm.getLocation().then(function(location){
        if(typeof objectStore.home.currentSelectedTeamMember.get() !== 'undefined' && location.indexOf("teammember")>=0)
        {
          $state.go('teamMemberFeedback.recieve', {"tmusername":$stateParams.username});
        }
        else{
          $state.go('feedback.provide');
        }
      });

      // $state.go('feedback.provide');
    };

    $scope.isAdmin = $window.isAdmin;

    $scope.gotoAdmin = function(){
      $window.location.href = $window.syncapp.context+"/admin";
    }

    $scope.gotoHome = function(){
      vm.getLocation().then(function(location){
        if(typeof objectStore.home.currentSelectedTeamMember.get() !== 'undefined' && location.indexOf("teammember")>=0)
        {
          $state.go('teammemberhome');
        }
        else{
          $state.go('home');
        }
      });
    }

    $scope.gotoTimeline = function(){
      //go('/timeline/self')
      vm.getLocation().then(function(location){
        if(typeof objectStore.home.currentSelectedTeamMember.get() !== 'undefined' && location.indexOf("teammember")>=0)
        {
          $state.go('teamMemberTimeline.selfState');
        }
        else{
          $state.go('timeline.selfState');
        }
      });
    }

    $scope.gotoAlternate = function(){
      //go('/timeline/self')
      vm.getLocation().then(function(location){
        if(typeof objectStore.home.currentSelectedTeamMember.get() !== 'undefined' && location.indexOf("teammember")>=0)
        {
          $state.go('teamMemberAlternateManager.selfState');
        }
        else{
          $state.go('alternateManager.selfState');
        }
      });
    }

    $scope.gotoConversations = function(){
      vm.getLocation().then(function(location){
        if(typeof objectStore.home.currentSelectedTeamMember.get() !== 'undefined' && location.indexOf("teammember")>=0)
        {
          $state.go('conversationsTeamMember.self',{"tmusername":$stateParams.username});
        }
        else{
          $state.go('conversations.selfState');
        }
      });

    }

    vm.closeSideNavbarMenu = function () {

      if ($(window).innerWidth() <= 767) {

// XS

        $('#sideNavbar').addClass('hidden-xs').addClass('hidden-sm');


      } else if ($(window).innerWidth() >= 768 && $(window).innerWidth() <= 991) {

// SM

        $('#sideNavbar').addClass('hidden-xs').addClass('hidden-sm');


      } else if ($(window).innerWidth() >= 992 && $(window).innerWidth() <= 1199) {

// MD


      } else if ($(window).innerWidth() >= 1200) {

// LG


      }

    };


    vm.setSideBarState = function(currentState)
    {
      angular.element('.sideBar').removeClass('activeSideBar');

      if(currentState === 'home')
      {
        angular.element('.homeSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'error'){
        angular.element('.homeSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'timeline'){
        angular.element('.timelineSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'timeline.teamState'){
        angular.element('.timelineSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'timeline.selfState'){
        angular.element('.timelineSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'timeline.view'){
        angular.element('.timelineSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'notifications'){
        angular.element('.sideBar').removeClass('activeSideBar');
      }
      else if(currentState === 'notifications.all'){
        angular.element('.sideBar').removeClass('activeSideBar');
      }
      else if(currentState === 'feedbackpdf'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'feedbackpdf.all'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversationpdf'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversationpdf.all'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversationpdfteam'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversationpdfteam.all'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberAlternateManager'){
        angular.element('.alternateSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberAlternateManager.selfState'){
        angular.element('.alternateSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberAlternateManager.teamState'){
        angular.element('.alternateSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberAlternateManager.teamSecondState'){
        angular.element('.alternateSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberAlternateManager.proxySelf'){
        angular.element('.alternateSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberAlternateManager.proxyTeam'){
        angular.element('.alternateSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'alternateManager'){
        angular.element('.alternateSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'alternateManager.selfState'){
        angular.element('.alternateSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'alternateManager.teamState'){
        angular.element('.alternateSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'alternateManager.teamSecondState'){
        angular.element('.alternateSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'alternateManager.proxySelf'){
        angular.element('.alternateSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'alternateManager.proxyTeam'){
        angular.element('.alternateSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teammemberhome'){
        angular.element('.homeSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberTimeline'){
        angular.element('.timelineSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberTimeline.teamState'){
        angular.element('.timelineSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberTimeline.selfState'){
        angular.element('.timelineSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversationsTeamMember'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversationsTeamMember.viewAllSelf'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversationsTeamMember.self'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversationsTeamMember.team'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversations'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversations.selfState'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversations.teamState'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversationdetails'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversationdetails.newConversation'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversationdetails.newTeamMemberConversation'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversationdetails.sharedConversation'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversationdetails.sharedTeamMemberConversation'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversationdetails.viewConversation'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversationdetails.viewTeammemberConversation'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversationdetails.draftedConversation'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversationdetails.teamNewConversation'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversationdetails.sharedTeamConversation'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'conversationdetails.teamMemberDraftConversation'){
        angular.element('.conversationSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberFeedback'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberFeedback.unrequestedNew'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberFeedback.requestedNew'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberFeedback.requestedNewTeam'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberFeedback.requestedUserNew'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberFeedback.provide'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberFeedback.provideViewAll'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberFeedback.receiveViewAll'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberFeedback.recieve'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberFeedback.provideTeam'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberFeedback.recieveTeam'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberFeedback.viewFeedback'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberFeedback.provideFeedback'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberFeedback.declineFeedback'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberFeedback.deleteFeedback'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberFeedback.forwardFeedback'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberFeedback.sendFeedbackReminder'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'teamMemberFeedback.pendingFeedback'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'feedback'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'feedback.unrequestedNew'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'feedback.requestedNew'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'feedback.requestedNewTeam'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'feedback.requestedUserNew'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'feedback.provide'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'feedback.provideViewAll'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'feedback.receiveViewAll'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'feedback.recieve'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'feedback.provideTeam'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'feedback.recieveTeam'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'feedback.viewFeedback'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'feedback.provideFeedback'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'feedback.declineFeedback'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'feedback.deleteFeedback'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'feedback.forwardFeedback'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'feedback.sendFeedbackReminder'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
      else if(currentState === 'feedback.pendingFeedback'){
        angular.element('.feedbackSideBar').addClass('activeSideBar');
      }
    };

  }
})();
