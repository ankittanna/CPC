(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcTeamConversationView', cpcTeamConversationView);

  /* @ngInject */
  function cpcTeamConversationView() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcTeamConversationView/cpcTeamConversationView.html',
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
	console.log("in cpcTeamConversationView file");
	  //console.log($window.sharedConversationObject);

    vm.getUserFullName = function(index){
      var username = vm.currentConversation.conversation[index].createdBy;
      employeeDetails.getUserFullName(username).then(function(fullName){
        vm.currentConversation.conversation[index].conversationAboutFullName = fullName;
      });
    }

	console.log(objectStore.conversation.sharedTeamConversation.get());
	  if(typeof objectStore.conversation.sharedTeamConversation.get() !== 'undefined'){
		  vm.currentConversation = objectStore.conversation.sharedTeamConversation.get();
		  
		  var attachmentObject = vm.currentConversation.conversation[0].attachmentId;
		  for (var k in attachmentObject){
			    if (attachmentObject.hasOwnProperty(k)) {
			         console.log("Key is " + k + ", value is" + attachmentObject[k]);
			         vm.attachmentsAvailable = true;
			    }
			    else{
			    	console.log("no key");
			    	vm.attachmentsAvailable = false;
			    }
			}
		  
		  employeeDetails.getUserFullName(vm.currentConversation.targetUsername).then(function(fullName){
			  vm.currentConversation.targetFullName = fullName;
		  });
		  
		  employeeDetails.getUserFullName(vm.currentConversation.conversationAbout).then(function(fullName){
			  vm.currentConversation.conversationAboutFullName = fullName;
		  });
	      for(var i in vm.currentConversation)
	      {
	        for(var j in vm.currentConversation.conversation) {
	          vm.getUserFullName(j);
	        }
	      }
	  }

	vm.go = function (path) {
	      $location.path(path);
	};

	vm.loadPreviousConversation = function(index, total)
	{
		// Your Service here
		// Attach the conversation object to $window.currentConversation and $scope.currentConversation
	};

	vm.loadNextConversation = function(index, total)
	{
		// Your Service here
		// Attach the conversation object to $window.currentConversation and $scope.currentConversation
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

	vm.canRespond = function()
	{
			var loggedInUser = localStorageService.get("loggedInUser").username;
			if(vm.currentConversation.convStatus === 'OPEN' && loggedInUser === vm.currentConversation.targetUsername)
			{
				if(vm.currentConversation.conversation.length === 1)
				{
					return true;
				} else
				{
					return false;
				}
			}
	};
/*
	vm.loadRespondModule = function()
	{
		var attachmentObject={};
		var newConversationObject = {
					  "convId": "2",
				//	  "createdOn": "2014-01-22T14:56:59.000Z",
				//	  "updatedOn": "2014-01-22T14:56:59.000Z",
				//	  "submittedOn": "2014-01-22T14:56:59.000Z",
					  "createdBy": vm.currentConversation.targetUsername,
					  "comments": "",
					  "status": "DRAFT",
					  "attachmentId": attachmentObject
					};

		//$window.sharedConversationObject.conversation.push(newConversationObject);
	    var tempS = objectStore.conversation.sharedConversation.get();
	    tempS.conversation.push(newConversationObject);
	    console.log("*************  Testing respond *************");
	    console.log(tempS);
	    objectStore.conversation.sharedConversation.set(tempS);

	    if(tempS.conversation[0].status === "EMP_SUBMIT")
	    	$window.respondSource = "ModalPopUp";
	    else if(tempS.conversation[0].status === "MGR_SUBMIT")
	    	$window.respondSource = "conversationSelf";

		vm.go('/conversationdetails/draftedConversation');
	}; */
  }

})();
