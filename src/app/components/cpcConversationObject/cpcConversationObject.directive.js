(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcConversationObject', cpcConversationObject);

  /* @ngInject */
  function cpcConversationObject() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcConversationObject/cpcConversationObject.html',
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
	vm.responseEnable = 'true';
	vm.showRespondMsg = false;
	console.log("in share conversation file");
	  //console.log($window.sharedConversationObject);

    vm.getUserFullName = function(index){
      var username = vm.currentConversation.conversation[index].createdBy;
      employeeDetails.getUserFullName(username).then(function(fullName){
        vm.currentConversation.conversation[index].createdByFullName = fullName;
      });
    }

	console.log(objectStore.conversation.sharedConversation.get());
	if(typeof objectStore.conversation.sharedConversation.get() !== 'undefined' && objectStore.conversation.sharedConversation.get().conversation.length > 1){
		var tempS = objectStore.conversation.sharedConversation.get();
		
		/* setting response source in case of drafted save */
		if(tempS.conversation[0].status === "EMP_SUBMIT")
	    	$window.respondSource = "ModalPopUp";
	    else if(tempS.conversation[0].status === "MGR_SUBMIT")
	    	$window.respondSource = "conversationSelf";
		
	}
	
	 if(typeof objectStore.conversation.sharedConversation.get() !== 'undefined'){
		 
		 var tempS = objectStore.conversation.sharedConversation.get();
		 /* checking if respond button should be enabled or not */
			if(tempS.conversation[0].status === "EMP_SUBMIT"){
				var loggedInuser = localStorageService.get("loggedInUser").username;
				vm.responseDisableReason = 'This conversation was submitted by the employee for his/her previous manager. So Respond is disabled for you. Contact HR Support in case you wish to respond';
				if(tempS.targetUsername != loggedInuser){
					vm.responseEnable = 'false';
					vm.showRespondMsg = true;
				}
			}
			else if(tempS.conversation[0].status === "MGR_SUBMIT"){
				vm.responseDisableReason = 'This conversation was submitted by your previous manager. Your response will be shared with your current manager';
			//	vm.responseEnable = 'false';
				vm.showRespondMsg = true;
				var userManager = localStorageService.get("loggedInUser").managerUsername;
				var userAltManagerlist = employeeDetails.getAlternateManagerList(); 
				if(tempS.ownerUsername != userManager){
					for (var k in userAltManagerlist){
					    if (userAltManagerlist.hasOwnProperty(k)) {
					         console.log("Key is " + k + ", value is" + userAltManagerlist[k]);
					         if(k == tempS.ownerUsername){
					        	 vm.responseEnable = 'true';
					        	 vm.showRespondMsg = false;
					         }
					    }
					}
				}
				else{
					vm.responseEnable = 'true';
					vm.showRespondMsg = false;
				}
			}
	 } 
	
	 if(typeof objectStore.conversation.sharedConversation.get() !== 'undefined'){
		  vm.currentConversation = objectStore.conversation.sharedConversation.get();
		  employeeDetails.getUserFullName(vm.currentConversation.targetUsername).then(function(fullName){
			  vm.currentConversation.targetFullName = fullName;
		  });
		  
		  for(var i=0; i<vm.currentConversation.conversation.length;i++)
	      {
	    	 vm.getUserFullName(i);
	      }
	      
		  employeeDetails.getUserFullName(vm.currentConversation.conversationAbout).then(function(fullName){
	    	  vm.currentConversation.convAboutFullName = fullName;
	    	  console.log("****** vm.currentConversation.convAboutFullName ***** "+vm.currentConversation.convAboutFullName);
		  });
		  
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

	vm.canRespond = function(){
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
	};
  }

})();
