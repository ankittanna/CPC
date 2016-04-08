(function () {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcConversationRespond', cpcConversationRespond);

  /* @ngInject */
  function cpcConversationRespond() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcConversation/cpcConversation.html',
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
  function Controller($log, $translate, $scope, $modal, $window, $state, localStorageService, dataservice,FileUploader,objectStore,employeeDetails,growl) {
    var vm = this;
    vm.responseMsg = "";
    vm.showAttachments = true;
    vm.showAltManagerSection = false;
    console.log("in cpcConversationRespond page and respond source "+$window.respondSource);
    vm.draftFlag = false;
    vm.fromRespond = true;
    vm.saveDraftClicked = false;
    vm.selectedTags = [false,false,false,false];
    vm.deletePossible = 'false';
    vm.showAltManagerSection = false;
    vm.radioBtn1Checked = true;
    
    function setActionBtnsProperty(btnState){
		vm.cancelPossible = btnState;
		vm.saveDraftPossible = btnState;
		vm.shareTeamMemberPossible = btnState;
		vm.shareManagerPossible = btnState;
		vm.shareManagerPossible = btnState;
		vm.sharePossible = btnState;
		vm.btnEnable = !vm.btnEnable;
		//vm.deleteEnable = !vm.deleteEnable;
	}
	
	setActionBtnsProperty('true');
	
    vm.uploader = new FileUploader();
    vm.uploader.removeAfterUpload = true;
    
    vm.uploader.filters.push({name:'filterSize', fn:function(item) {
    	console.log(item);
    		if(item.size > 2048000){
    			growl.error("File size should be less than 2 MB");
    			return false;
    		}
    		else{
    			return true;
    		}
    	}
    });
    
    vm.uploader.filters.push({name:'filterType', fn:function(item) {
		var fileName = item.name;
		var fileTypeArray = fileName.split(".");
		console.log(fileName.split("."));
		var fileType = fileTypeArray[fileTypeArray.length-1].toLowerCase();
		console.log(fileType);
		if(objectStore.appCommonData.fileTypeAttchmentSupported.get(fileType) == true){
			return true;
		}
		else{
			growl.error("File type is not supported");
			return false;
		}
	}
    });
    
    vm.uploader.onCompleteAll = function() {
      console.info('onCompleteAll');
    };

    vm.uploader.onBeforeUploadItem = function (item) {
      item.url = syncapp.context + "/api/conversation/conversationAttachment?id="+vm.convID+"&context="+vm.context
    };

    vm.uploader.onSuccessItem = function(item, response, status, headers){
       if(vm.uploader.getNotUploadedItems()== ""){
    	   console.log("vm.saveDraftClicked "+vm.saveDraftClicked);
    	   growl.success(vm.responseMsg);
    	   setActionBtnsProperty('true');
    	   if(vm.saveDraftClicked == true){
    		   console.log("draftclick true");
    		   objectStore.conversation.draftConversation.set(response[0].serverdata);
    		   vm.saveDraftClicked = false;
    		   vm.showAttachments = true;
    		   vm.attachmentId = response[0].serverdata.conversation[1].attachmentId;
    		   vm.convSequenceId = response[0].serverdata.conversation[1].convId;
    		   vm.conversationId = response[0].serverdata.id;
    	   }
    	   else{
    		   console.log("draftclick false");
    		   objectStore.conversation.sharedConversation.set(response[0].serverdata);
               $state.go('conversationdetails.viewConversation');
    	   }
    	}
    }

    vm.uploader.onErrorItem = function(item, response, status, headers){
       console.log("############### error item function ###########");
       console.log(response);
    }
    
    vm.selectedTagsStatus = function()
    {
      var isSelected = false;
      for(var i in vm.selectedTags)
      {
        if(vm.selectedTags[i] === true)
        {
          isSelected = true;
        }
      }
      return isSelected;
    }

   
    vm.draftConversationObject = objectStore.conversation.sharedConversation.get();
    
    console.log(vm.draftConversationObject);

      if (typeof vm.draftConversationObject != 'undefined' && vm.draftConversationObject != null) {
    	  console.log(vm.draftConversationObject);
    	  
    	  /* setting this object because for tiny mce it is hard coded to use comments from draftConversation
	  		 * we should ideally replace it with a global variable to which we should set the value of comments
	  		 *  of conversation object we are dealing with */
	  		objectStore.conversation.draftConversation.set(vm.draftConversationObject);
    	  
    	  
    	  vm.conversationTitle = vm.draftConversationObject.topicTitle;
          vm.conversationOwner = vm.draftConversationObject.targetUsername;
          employeeDetails.getUserFullName(vm.conversationOwner).then(function(fullName){
            vm.convOwnerFullName = fullName;
          });
          vm.conversationFor = vm.draftConversationObject.conversationAbout;
          employeeDetails.getUserFullName(vm.conversationFor).then(function(fullName){
              vm.convForFullName = fullName;
            });
          vm.targetUsername = vm.draftConversationObject.ownerUsername;
          console.log("modalpopup attachmentId ");
          console.log(vm.draftConversationObject.conversation[1].attachmentId);
          vm.attachmentId = vm.draftConversationObject.conversation[1].attachmentId;
          vm.convSequenceId = vm.draftConversationObject.conversation[1].convId;
          vm.conversationId = vm.draftConversationObject.id;
          vm.deletePossible = 'true';
          vm.deleteEnable = true;
      }


    vm.saveConversationAsDraftService = function () {
    	if(!validateFields())
        {
          return false;
        }
    	setActionBtnsProperty('false');
    	vm.currentConversationObject = vm.draftConversationObject;
    	var respondComments = tinymce.activeEditor.getContent({format: 'raw'});
        console.log("Tiny MCE Response text>>>>> "+ respondComments);

        vm.currentConversationObject.conversation[1].comments = respondComments;
        vm.currentConversationObject.conversation[1].status = "DRAFT";
        dataservice.updateConversation(vm.context, vm.currentConversationObject).then(function (response) {
            if (response.status === 200 || response.status === 201) {
              if (typeof response.data !== 'undefined') {
                vm.response = response.data;
                console.log("vm response of update " + vm.response.conversation[0].createdOn);
                vm.draftFlag = true;
                vm.deletePossible = 'true';
                vm.deleteEnable = true;
                vm.responseMsg = "Conversation has been saved";
                //growl.success("Draft has been saved");
                vm.convID=response.data.id;
                if(vm.uploader.queue == ""){
              	  objectStore.conversation.draftConversation.set(vm.response);
              	  growl.success(vm.responseMsg);
              	  setActionBtnsProperty('true');
  	          	}
  	          	else{
  	        	  vm.saveDraftClicked = true;
  	        	  vm.uploader.uploadAll();
      	          console.log("after upload");
  	          	}
              }
            }
            else {
              vm.response = false;
            }
          });
    };

    var validateFields = function(){
        if((typeof vm.conversationTitle !== 'undefined' && vm.conversationTitle.length <= 0)){
          growl.error("Please enter a title");
          return false;
        }
        else if(tinymce.activeEditor.getContent({format: 'text'}).trim().indexOf("Enter Sync Up Details") == 0 || tinymce.activeEditor.getContent({format: 'text'}).trim().length <= 0){
          growl.error("Please enter details");
          return false;
        }
        else{
          return true;
        }
      }
    
    vm.shareConversationWithTeamMemberService = function () {
    	if(!validateFields())
        {
          return false;
        }
    	setActionBtnsProperty('false');
    	console.log("share with team member clicked in response");
    	console.log(vm.draftConversationObject);
    	vm.currentConversationObject = objectStore.conversation.draftConversation.get();
    	console.log(vm.currentConversationObject);
    	if(typeof vm.currentConversationObject == 'undefined' || vm.currentConversationObject == null){
    		console.log("yes");
    		vm.currentConversationObject = vm.draftConversationObject;
    	}
    		
    	var respondComments = tinymce.activeEditor.getContent({format: 'raw'});
        console.log("Tiny MCE Response text>>>>> "+ respondComments);

        vm.currentConversationObject.conversation[1].comments = respondComments;
        vm.currentConversationObject.conversation[1].status = "MGR_SUBMIT";
        dataservice.updateConversation(vm.context, vm.currentConversationObject).then(function (response) {
            if (response.status === 200 || response.status === 201) {
              if (typeof response.data !== 'undefined') {
                vm.response = response.data;
                console.log("vm response of update " + vm.response.conversation[0].createdOn);
                vm.responseMsg = "Conversation has been shared";
                vm.convID=response.data.id;
                if(vm.uploader.queue == ""){
                	console.log("upload queue is empty");
              	  objectStore.conversation.sharedConversation.set(vm.response);
              	  growl.success(vm.responseMsg);
              	  setActionBtnsProperty('true');
              	  $state.go('conversationdetails.viewConversation');
              }
  	          else{
  	        	  vm.uploader.uploadAll();
      	          console.log("after upload");
  	          }
//                objectStore.conversation.sharedConversation.set(vm.response);
//                $state.go('conversationdetails.sharedConversation');
              }
            }
            else {
              vm.response = false;
            }
          });

    };

    vm.shareConversationWithManagerService = function () {
    	if(!validateFields())
        {
          return false;
        }
    	setActionBtnsProperty('false');
    	console.log("share with manager clicked in response");
    	console.log(vm.draftConversationObject);
    	vm.currentConversationObject = objectStore.conversation.draftConversation.get();
    	console.log(vm.currentConversationObject);
    	if(typeof vm.currentConversationObject == 'undefined' || vm.currentConversationObject == null){
    		console.log("yes");
    		vm.currentConversationObject = vm.draftConversationObject;
    	}
    	var respondComments = tinymce.activeEditor.getContent({format: 'raw'});
        console.log("Tiny MCE Response text>>>>> "+ respondComments);

        vm.currentConversationObject.conversation[1].comments = respondComments;
        vm.currentConversationObject.conversation[1].status = "EMP_SUBMIT";
        dataservice.updateConversation(vm.context, vm.currentConversationObject).then(function (response) {
            if (response.status === 200 || response.status === 201) {
              if (typeof response.data !== 'undefined') {
                vm.response = response.data;
                console.log("vm response of update " + vm.response.conversation[0].createdOn);
                vm.responseMsg = "Conversation has been shared";
                vm.convID=response.data.id;
                if(vm.uploader.queue == ""){
                	console.log("upload queue is empty");
              	  	objectStore.conversation.sharedConversation.set(vm.response);
              	  	growl.success(vm.responseMsg);
              	  	setActionBtnsProperty('true');
              	  	$state.go('conversationdetails.viewConversation');
  	          	}
  	          	else{
  	          		vm.uploader.uploadAll();
  	          		console.log("after upload");
  	          }
//                objectStore.conversation.sharedConversation.set(vm.response);
//                $state.go('conversationdetails.sharedConversation');
              }
            }
            else {
              vm.response = false;
            }
          });

    };
    
    vm.cancelAction = function(){
    	if(vm.draftConversationObject.ownerUsername===vm.draftConversationObject.conversationAbout){
    		$state.go("home");
    	}
    	else{
    		$state.go("conversations.selfState");
    	}
    }
    
    vm.showShareWithManager = function(){
    	if(vm.draftConversationObject.ownerUsername===vm.draftConversationObject.conversationAbout)
    		return false;
    	else
    		return true;
    }

    vm.showShareWithTeamMember = function(){
    	if(vm.draftConversationObject.ownerUsername!==vm.draftConversationObject.conversationAbout)
    		return false;
    	else
    		return true;
    }
    
    vm.deleteAttachment = function(attachemntId){
    	console.log("attachment ID "+attachemntId);
    	console.log("conv id "+vm.conversationId);
    	console.log("sequence id "+vm.convSequenceId);
    	dataservice.deleteAttachment(attachemntId,vm.conversationId,vm.convSequenceId).then(function (response) {
            if (response.status === 200 || response.status === 201) {
              if (typeof response.data !== 'undefined') {
                vm.response = response.data[0].serverdata;
                objectStore.conversation.draftConversation.set(response.data[0].serverdata);
                vm.attachmentId = response.data[0].serverdata.conversation[1].attachmentId;
                console.log(vm.response);
                growl.success("Attachment has been deleted");
              }
            }
            else {
              vm.response = false;
            }
          });
    }
    
    vm.deleteConversation = function(){
    	vm.conversationId = objectStore.conversation.draftConversation.get().id;
    	console.log("delete clicked "+vm.conversationId);
    	dataservice.deleteConversation(vm.conversationId).then(function (response) {
    		console.log("delete call completed");
    		console.log(response);
            if(response.status === 200 || response.status === 201) {
              vm.respose = true;
              console.log("delete successful");
              growl.success("Conversation has been deleted");
              if(vm.draftConversationObject.ownerUsername===vm.draftConversationObject.conversationAbout){
          		$state.go("home");
          	  }
          	  else{
          		$state.go("conversations.selfState");
          	  }
            }
            else {
              vm.response = false;
            }
          });
    }
    
    if(vm.showShareWithManager == true)
    	vm.context = "SELF";
    else
    	vm.context = "TEAM";
    

    vm.showTags = function(){
    	return false;
    }

  }

})();
