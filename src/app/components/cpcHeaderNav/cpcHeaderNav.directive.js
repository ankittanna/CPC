(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcHeaderNav', cpcHeaderNav);

  /* @ngInject */

  function cpcHeaderNav() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcHeaderNav/cpcHeaderNav.html',
      bindToController: true,
      controller: Controller,
      controllerAs: 'vm',
      link: link,
      restrict: 'E',
      attrs: {},
      scope: {
        heading: '@',
        linkHeading: '@',
        backToText: '@',
        link: '@'
      }
    };
    return directive;

    function link(scope, element, attrs) {}
  }

  /* @ngInject */
  function Controller($log, $translate, $scope, $attrs, $state,$stateParams, $location, $window, dataservice, objectStore, employeeDetails) {



    $scope.location = $location.path();

    if($state.is('alternateManager.teamState')){
      $('.self').removeClass('active');
      $('.team').addClass('active');
    }
    if($state.is('alternateManager.teamSecondState')){
      $('.self').removeClass('active');
      $('.team').addClass('active');
    }
    if($state.is('alternateManager.selfState')){
      $('.team').removeClass('active');
      $('.self').addClass('active');
    }

    if($state.is('alternateManager.proxySelf')){
      $('.team').removeClass('active');
      $('.self').addClass('active');
    }
    if($state.is('alternateManager.proxyTeam')){
      $('.self').removeClass('active');
      $('.team').addClass('active');
    }

    if($state.is('teamMemberAlternateManager.teamState')){
      $('.self').removeClass('active');
      $('.team').addClass('active');
    }
    if($state.is('teamMemberAlternateManager.teamSecondState')){
      $('.self').removeClass('active');
      $('.team').addClass('active');
    }
    if($state.is('teamMemberAlternateManager.selfState')){
      $('.team').removeClass('active');
      $('.self').addClass('active');
    }

    if($state.is('teamMemberAlternateManager.proxySelf')){
      $('.team').removeClass('active');
      $('.self').addClass('active');
    }
    if($state.is('teamMemberAlternateManager.proxyTeam')){
      $('.self').removeClass('active');
      $('.team').addClass('active');
    }




    if($scope.location === "/conversations/team"){
      $('.team').addClass('active');
      $('.self').removeClass('active');
    }

    if($state.is('feedback.recieveTeam')){
      $('.team').addClass('active');
      $('.self').removeClass('active');
    }

    if($state.is('feedback.provideTeam')){
      $('.team').addClass('active');
      $('.self').removeClass('active');
    }

    if($state.is('feedback.recieve')){
      $('.team').removeClass('active');
      $('.self').addClass('active');
    }

    if($state.is('feedback.provide')){
      $('.team').removeClass('active');
      $('.self').addClass('active');
    }

    if($state.is('teamMemberFeedback.recieveTeam')){
      $('.team').addClass('active');
      $('.self').removeClass('active');
    }

    if($state.is('teamMemberFeedback.provideTeam')){
      $('.team').addClass('active');
      $('.self').removeClass('active');
    }

    if($state.is('teamMemberFeedback.recieve')){
      $('.team').removeClass('active');
      $('.self').addClass('active');
    }

    if($state.is('teamMemberFeedback.provide')){
      $('.team').removeClass('active');
      $('.self').addClass('active');
    }

    if($scope.location === "/timeline/secondTeam"){
      $('.self').removeClass('active');
      $('.team').addClass('active');
    }

    if($scope.location === "/timeline/team"){
      $('.self').removeClass('active');
      $('.team').addClass('active');
    }

    if($scope.location === "/timeline/self"){
      $('.team').removeClass('active');
      $('.self').addClass('active');
    }

    $window.tabMode = 'self';

    var vm = this;
    vm.data = {
      heading: vm.heading,
      link: vm.link,
      linkHeading: vm.linkHeading,
      backToText: vm.backToText
    };

    vm.breadcrumb = true;
    if($state.is("home"))
    {
      vm.breadcrumb = false;
    }


    vm.page = $attrs.page;
    vm.pdf = $attrs.pdf;


    if($attrs.display == "true"){
      var userObj = $window.userProfile;
      console.log(employeeDetails.isAltMgr(userObj)+" : "+employeeDetails.isPeopleManager(userObj));
      if(!employeeDetails.isAltMgr(userObj) && !employeeDetails.isPeopleManager(userObj)){
        $scope.display = false;
      }
      else{
        $scope.display = true;
      }
    } else if($attrs.display == "false"){
      $scope.display = false;
    }

    vm.backtToPrevious = function(){
      $window.history.back();
    }

    $scope.printWindow = function()
    {
      //window.print();
      //alert( vm.pdf);
      //console.log (">>>>>>>>>>>> "+JSON.stringify(objectStore.feedback.currentFeedbackObject.get()));
      if (vm.page == "feedback") {
    	  if(objectStore.feedback.feedbackPrintSource.get() == "feedbackViewPage"){
    		  var feedbackData=objectStore.feedback.currentFeedbackObject.get();
    	        if (feedbackData.id != null)
    	          $state.go('feedbackpdf.all');
    	  }
    	  else if(objectStore.feedback.feedbackPrintSource.get() == "feedbackProvidePage"){
    		  	  $state.go('feedbackpdfTeam.all');
    	  }
    	  else if(objectStore.feedback.feedbackPrintSource.get() == "feedbackReceivePage"){
    		      $state.go('feedbackpdfTeam.all',{"username":$stateParams.username});
    	  }

      }

      if (vm.page == "conversations")
      {
    	  if (vm.pdf == "single"){
    		  vm.currentConversation = objectStore.conversation.sharedConversation.get();
    	        if ( vm.currentConversation .id != null)
    	          $state.go('conversationpdf.all');
    	  }

	      else{
	    	  if($stateParams.username){
	    		  $state.go('conversationpdfteam.all',{"username":$stateParams.username});
	    	  }
	    	  else
	    		  $state.go('conversationpdfteam.all');
	       }
	    }
 };

    vm.toggleSelfTeam = function(type)
    {
      $window.tabMode = type;
      if(vm.page === 'conversations')
      {
        if(type == 'self')
        {
          angular.element('.self').addClass('active');
          angular.element('.team').removeClass('active');
          if($stateParams.username){
        	  $state.go('conversationsTeamMember.self',{"tmusername":$stateParams.username});
          }
          else{
        	  $state.go('conversations.selfState');
          }

        } else if(type == 'team')
        {
          angular.element('.team').addClass('active');
          angular.element('.self').removeClass('active');
          if($stateParams.username){
        	  $state.go('conversationsTeamMember.team');
          }
          else{
        	  $state.go('conversations.teamState');
          }

        }
      } else if(vm.page === 'feedback')
      {
        $('#provideFeedbackTab').addClass('active');
        $('#requestRecieveTab').removeClass('active');

        if(type == 'self')
        {
          angular.element('.self').addClass('active');
          angular.element('.team').removeClass('active');

          if($stateParams.username){
            $state.go('teamMemberFeedback.provide',{"tmusername":$stateParams.username});
          }
          else{
            $state.go('feedback.provide');
          }

         // $state.go('feedback.provide');

        } else if(type == 'team')
        {
          angular.element('.team').addClass('active');
          angular.element('.self').removeClass('active');

          if($stateParams.username){
            $state.go('teamMemberFeedback.recieveTeam',{"tmusername":$stateParams.username});
          }
          else{
            $state.go('feedback.recieveTeam');
          }

          // $state.go('feedback.recieveTeam');
        }
      }
      else if(vm.page === 'timeline')
      {
        if($stateParams.username)
        {
          if (type == 'self') {
            angular.element('.self').addClass('active');
            angular.element('.team').removeClass('active');
            $state.go('teamMemberTimeline.selfState');
          } else if (type == 'team') {
            angular.element('.team').addClass('active');
            angular.element('.self').removeClass('active');
            $state.go('teamMemberTimeline.teamState');
          }
        }
        else {
          if (type == 'self') {
            angular.element('.self').addClass('active');
            angular.element('.team').removeClass('active');
            $state.go('timeline.selfState');
          } else if (type == 'team') {
            angular.element('.team').addClass('active');
            angular.element('.self').removeClass('active');
            $state.go('timeline.teamState');
          }
        }
      }
      else if(vm.page === 'alternate')
      {
        console.log(type);
        if(type == 'self')
        {
          angular.element('.self').addClass('active');
          angular.element('.team').removeClass('active');
          if($stateParams.username){
            $state.go('teamMemberAlternateManager.selfState',{"tmusername":$stateParams.username});
          }
          else{
            $state.go('alternateManager.selfState');
          }

        } else if(type == 'team')
        {
          angular.element('.team').addClass('active');
          angular.element('.self').removeClass('active');
          if($stateParams.username){
            $state.go('teamMemberAlternateManager.teamState');
          }
          else{
            $state.go('alternateManager.teamState');
          }

        }
      }
    };

    // FIX: Is People Manager then display Self Team Tab
    vm.displaySelfTeamNavTabs = false;
    if(employeeDetails.isPeopleManager())
    {
      vm.displaySelfTeamNavTabs = true;
    } else
    {
      vm.displaySelfTeamNavTabs = false;
    }
    vm.openWindow = function(data) {
      var newwindow=window.open(data.linkurl,'name','height=400,width=550');
      //window.open(data.linkurl);
    }
    vm.onQuickLink = function(){

      dataservice.getQuickLinks().then(function(data)
      {
        $scope.loaderPopup = true;

        if(data.status === 200 || data.status === 201) {
          vm.quick =data.data;

          //alert( JSON.stringify( vm.notifications) );
          $scope.loaderPopup = false;
        }
      });


      $("#quicklinkContainer").fadeToggle(300);


    }

  }
})();
