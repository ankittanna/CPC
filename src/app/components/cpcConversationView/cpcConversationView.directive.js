(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcConversationView', cpcConversationObject);

  /* @ngInject */
  function cpcConversationObject() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcConversationView/cpcConversationView.html',
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
  function Controller($log, $translate, $scope, $modal, $window, $state, $stateParams,$location,localStorageService,objectStore,employeeDetails,dateTimeService) {
	var vm = this;
	console.log("in view conversation file");
	  //console.log($window.sharedConversationObject);

    vm.getUserFullName = function(index){
      var username = vm.currentConversation.conversation[index].createdBy;
      console.log("username for created by "+username);
      employeeDetails.getUserFullName(username).then(function(fullName){
        vm.currentConversation.conversation[index].createdByFullName = fullName;
        console.log("****** vm.currentConversation.createdByFullName ***** "+index+" : "+vm.currentConversation.conversation[index].createdByFullName);
      });
    }

	 if(typeof objectStore.conversation.sharedConversation.get() !== 'undefined'){
		  vm.currentConversation = objectStore.conversation.sharedConversation.get();
		  console.log(vm.currentConversation);
		  employeeDetails.getUserFullName(vm.currentConversation.targetUsername).then(function(fullName){
			  vm.currentConversation.targetFullName = fullName;
			  console.log("****** vm.currentConversation.targetFullName ***** "+vm.currentConversation.targetFullName);
		  });

	      for(var i=0; i<vm.currentConversation.conversation.length;i++)
	      {
	    	 vm.getUserFullName(i);
	      }

	      employeeDetails.getUserFullName(vm.currentConversation.conversationAbout).then(function(fullName){
	    	  vm.currentConversation.convAboutFullName = fullName;
	    	  console.log("****** vm.currentConversation.convAboutFullName ***** "+vm.currentConversation.convAboutFullName);
		  });
       vm.myManager = '';
       employeeDetails.findMyManager( vm.currentConversation.conversationAbout).then(function(fullName) {
         vm.myManager = fullName;
       });

	  //    vm.attachmentsAvailable =[];
	      for(var i=0; i<vm.currentConversation.conversation.length;i++){
	    	  var attachmentObject = vm.currentConversation.conversation[i].attachmentId;
	    	  vm.currentConversation.conversation[i].attachmentsAvailable = false;
			  for (var k in attachmentObject){
				    if (attachmentObject.hasOwnProperty(k)) {
				         console.log("Key is " + k + ", value is" + attachmentObject[k]);
				         vm.currentConversation.conversation[i].attachmentsAvailable = true;
				    }
				}

	      }

	  }

	vm.go = function (path) {
	      $location.path(path);
	};

	vm.translateDateAndTime = function(dateString)
	{
		var dateVal = dateTimeService.getCurrentDate(dateString);
		var timeVal = dateTimeService.getCurrentTime(dateString);
		return dateVal+", "+timeVal;
	};

	vm.checkConversationType = function()
	{
		colsole.log("####");
	};
  }

})();
