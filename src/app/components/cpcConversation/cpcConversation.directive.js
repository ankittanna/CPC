(function () {
  'use strict';

  angular
      .module('cpccore')
      .directive('cpcConversation', cpcConversation);

  /* @ngInject */
  function cpcConversation() {
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
  function Controller($log, $translate, $scope, $modal, $window, $state, localStorageService, dataservice,objectStore, FileUploader,employeeDetails,growl,$stateParams) {
    var vm = this;
    vm.convID="";
    vm.responseMsg = "";
    vm.showAddConvBtn = false;
    vm.fromRespond = false;
    vm.saveDraftClicked = false;
    vm.selectedTags = [false,false,false,false];
    vm.deletePossible = 'false';

    vm.altManagerList = employeeDetails.getAlternateManagerList();
    vm.selectedAltManager = 'Select Alternate Manager';
    vm.selectedAltManagerCecId = '';

    vm.isAltManagerSelectEnabled = false;
    vm.showAltManagerSection = false;
    vm.radioBtn1Disable = 'false';
	vm.radioBtn2Disable = 'false';
	vm.radioBtn1Checked = true;

	function setActionBtnsProperty(btnState){
		vm.cancelPossible = btnState;
		vm.saveDraftPossible = btnState;
		vm.shareTeamMemberPossible = btnState;
		vm.shareManagerPossible = btnState;
		vm.shareManagerPossible = btnState;
		vm.sharePossible = btnState;
		vm.btnEnable = !vm.btnEnable;
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
    		   vm.attachmentId = response[0].serverdata.conversation[0].attachmentId;
    		   vm.convSequenceId = response[0].serverdata.conversation[0].convId;
    		   vm.conversationId = response[0].serverdata.id;
    	   }
    	   else{
    		   console.log("draftclick false");
    		   objectStore.conversation.sharedConversation.set(response[0].serverdata);
           if($state.is("conversationdetails.newTeamMemberConversation")){
             $state.go('conversationdetails.sharedTeamMemberConversation');
           }
           else {
             $state.go('conversationdetails.sharedConversation');
           }
    	   }
    	}
    }

    vm.uploader.onErrorItem = function(item, response, status, headers){
       console.log("############### error item function ###########");
       console.log(response);
       growl.error("Error occured while attaching files");
       setActionBtnsProperty('true');
    }

    vm.selectedTagsStatus = function()
    {
      var isSelected = false;
      console.log(vm.selectedTags);
      for(var i in vm.selectedTags)
      {
        if(vm.selectedTags[i] === true)
        {
          isSelected = true;
        }
      }

   /*   if(isSelected == false)
      {
    	  console.log("testing testing "+vm.isPerformanceChecked+" : "+vm.isDevelopmentChecked+" : "+vm.isAlignmentChecked+" : "+vm.isYouChecked);
        if(vm.isYouChecked == true || vm.isPerformanceChecked == true || vm.isDevelopmentChecked == true || vm.isAlignmentChecked == true)
        {
          isSelected = true;
        }
      }*/
      console.log("******** "+isSelected);
      return isSelected;
    }

    vm.draftFlag = false;


    //vm.draftConversationObject = $window.draftConversationObject;
    vm.draftConversationObject = objectStore.conversation.draftConversation.get();
    console.log("create conversation source "+objectStore.conversation.createConversationSource.get());

    if (objectStore.conversation.createConversationSource.get() == "ModalPopUp") {
      //	This loop will be called if we click on add conversation in modal window OR open a saved draft conversation
      vm.context = "TEAM";
      if (typeof vm.draftConversationObject != 'undefined' && vm.draftConversationObject != null) {
    	vm.showAttachments = true;
    	console.log("vm.draftConversationObject ");
        console.log(vm.draftConversationObject);
        vm.conversationTitle = vm.draftConversationObject.topicTitle;
        vm.conversationOwner = vm.draftConversationObject.ownerUsername;
        employeeDetails.getUserFullName(vm.conversationOwner).then(function(fullName){
          vm.convOwnerFullName = fullName;
        });

        console.log("going to set conversation for ");
        if(vm.draftConversationObject.type == "Conversation"){
        	vm.conversationFor = vm.draftConversationObject.conversationAbout;
            employeeDetails.getUserFullName(vm.conversationFor).then(function(fullName){
              vm.convForFullName = fullName;
            });
        }
        else if(vm.draftConversationObject.type == "TalentSyncUp"){
        	vm.conversationFor = vm.draftConversationObject.targetUsername;
            employeeDetails.getUserFullName(vm.conversationFor).then(function(fullName){
              vm.convForFullName = fullName;
            });
        }

        vm.conversationTags = vm.draftConversationObject.tags;
        console.log("tags " + vm.conversationTags);
        angular.forEach(vm.conversationTags, function (value, key) {
          if (value === 'Performance'){
        	  vm.isPerformanceChecked = true;
        	  vm.selectedTags[0] = true;
          }
          if (value === 'Development'){
        	  vm.isDevelopmentChecked = true;
        	  vm.selectedTags[1] = true;
          }
          if (value === 'Alignment'){
            vm.isAlignmentChecked = true;
            vm.selectedTags[2] = true;
          }
          if (value === 'You'){
            vm.isYouChecked = true;
            vm.selectedTags[3] = true;
          }
        });

        vm.attachmentId = vm.draftConversationObject.conversation[0].attachmentId;
        vm.convSequenceId = vm.draftConversationObject.conversation[0].convId;
        vm.conversationId = vm.draftConversationObject.id;
        vm.deletePossible = 'true';
        vm.deleteEnable = true;
      }
      else {
    	  vm.showAttachments = false;
        console.log("vm.draftConversationObject is undefined");
        vm.conversationTitle = '';
        vm.conversationOwner = localStorageService.get("loggedInUser").username;
        employeeDetails.getUserFullName(vm.conversationOwner).then(function(fullName){
          vm.convOwnerFullName = fullName;
        });
    //    vm.conversationFor = localStorageService.get($window.selectedTeamMember).username;
        vm.conversationFor = employeeDetails.getCurrentSelectedTeamMember();
        employeeDetails.getUserFullName(vm.conversationFor).then(function(fullName){
          vm.convForFullName = fullName;
        });
   //     vm.targetUsername = localStorageService.get($window.selectedTeamMember).username;
        vm.targetUsername = employeeDetails.getCurrentSelectedTeamMember();
        vm.isPerformanceChecked = false;
        vm.isDevelopmentChecked = false;
        vm.isAlignmentChecked = false;
        vm.isYouChecked = false;
        vm.deletePossible = 'false';
      }
    }
    else if (objectStore.conversation.createConversationSource.get() == "conversationSelf") {
      // this loop is for scenario when we come from left navigation bar
      vm.context = "SELF";

      /* Enabling alternate manager section if logged in user has alternate manager */
      for (var k in vm.altManagerList){
  	    if (vm.altManagerList.hasOwnProperty(k)) {
  	         console.log("Key is " + k + ", value is" + vm.altManagerList[k]);
  	         vm.showAltManagerSection = true;
  	    }
  	  }
      if (typeof vm.draftConversationObject != 'undefined' && vm.draftConversationObject != null) {
    	  vm.showAttachments = true;
        console.log("vm.draftConversationObject ");
        console.log(vm.draftConversationObject);
        vm.conversationTitle = vm.draftConversationObject.topicTitle;
        vm.conversationOwner = vm.draftConversationObject.ownerUsername;
        employeeDetails.getUserFullName(vm.conversationOwner).then(function(fullName){
          vm.convOwnerFullName = fullName;
        });
        if(vm.draftConversationObject.type == "Conversation"){
        	console.log("2");
        	vm.conversationFor = vm.draftConversationObject.conversationAbout;
            employeeDetails.getUserFullName(vm.conversationFor).then(function(fullName){
              vm.convForFullName = fullName;
            });
        }
        else if(vm.draftConversationObject.type == "TalentSyncUp"){
        	vm.conversationFor = vm.draftConversationObject.targetUsername;
            employeeDetails.getUserFullName(vm.conversationFor).then(function(fullName){
              vm.convForFullName = fullName;
            });
        }

        vm.targetUsername = vm.draftConversationObject.targetUsername;
        console.log("******** vm.targetUsername *********** "+vm.targetUsername);
        vm.loginUserManager = localStorageService.get("loggedInUser").managerUsername;
        console.log("******** vm.loginUserManager *********** "+vm.loginUserManager);

        employeeDetails.getUserFullName(vm.targetUsername).then(function(fullName){
            vm.targetFullName = fullName;
        });
        console.log("******** vm.targetFullName *********** "+vm.targetFullName);
        employeeDetails.getUserFullName(vm.loginUserManager).then(function(fullName){
            vm.loginUserManagerName = fullName;
        });
        if(vm.showAltManagerSection == true){
        	if(vm.targetUsername == localStorageService.get("loggedInUser").managerUsername){
        		vm.selectedAltManager = 'Select Alternate Manager';
        		vm.isAltManagerSelectEnabled = false;
        		vm.radioBtn1Disable = 'true';
        		vm.radioBtn2Disable = 'true';
        		vm.radioBtn1Checked = true;
        	}
        	else{
        		employeeDetails.getUserFullName(vm.targetUsername).then(function(fullName){
        			vm.selectedAltManager = fullName;
                });
        		vm.isAltManagerSelectEnabled = false;
        		vm.radioBtn1Disable = 'true';
        		vm.radioBtn2Disable = 'true';
        		vm.radioBtn1Checked = false;
        	}
        }


        vm.conversationTags = vm.draftConversationObject.tags;
        console.log("tags " + vm.conversationTags);
        angular.forEach(vm.conversationTags, function (value, key) {
        	if (value === 'Performance'){
          	  vm.isPerformanceChecked = true;
          	  vm.selectedTags[0] = true;
            }
            if (value === 'Development'){
          	  vm.isDevelopmentChecked = true;
          	  vm.selectedTags[1] = true;
            }
            if (value === 'Alignment'){
              vm.isAlignmentChecked = true;
              vm.selectedTags[2] = true;
            }
            if (value === 'You'){
              vm.isYouChecked = true;
              vm.selectedTags[3] = true;
            }
        });
        vm.attachmentId = vm.draftConversationObject.conversation[0].attachmentId;
        vm.convSequenceId = vm.draftConversationObject.conversation[0].convId;
        vm.conversationId = vm.draftConversationObject.id;
        vm.deletePossible = 'true';
        vm.deleteEnable = true;
      }
      else {
    	  	vm.showAttachments = false;
	        console.log("create conversation from side navigation bar");
	        vm.conversationTitle = '';
	        vm.conversationOwner = localStorageService.get("loggedInUser").username;
	        employeeDetails.getUserFullName(vm.conversationOwner).then(function(fullName){
	          vm.convOwnerFullName = fullName;
	        });

	        vm.conversationFor = localStorageService.get("loggedInUser").username;
	        employeeDetails.getUserFullName(vm.conversationFor).then(function(fullName){
	          vm.convForFullName = fullName;
	        });

	        vm.targetUsername = localStorageService.get("loggedInUser").managerUsername;
	        vm.loginUserManager = localStorageService.get("loggedInUser").managerUsername;
	        employeeDetails.getUserFullName(vm.targetUsername).then(function(fullName){
	            vm.targetFullName = fullName;
	            vm.loginUserManagerName = fullName;
	        });

	        vm.isPerformanceChecked = false;
	        vm.isDevelopmentChecked = false;
	        vm.isAlignmentChecked = false;
	        vm.isYouChecked = false;
	        vm.deletePossible = 'false';
      	}
    }
    else if(objectStore.conversation.createConversationSource.get() == "TeamConversationDetail"){
	    	console.log("******** create source TeamConversationDetail");
	    	vm.context = "TEAM";
	    	vm.conversationTitle = '';
	        vm.conversationOwner = localStorageService.get("loggedInUser").username;
	        employeeDetails.getUserFullName(vm.conversationOwner).then(function(fullName){
	          vm.convOwnerFullName = fullName;
	        });
	        vm.conversationFor = employeeDetails.getCurrentSelectedTeamMember();
	        console.log("creating from TeamConversationDetail "+vm.conversationFor);
	        employeeDetails.getUserFullName(vm.conversationFor).then(function(fullName){
	        	vm.convForFullName = fullName;
	        });
	        vm.targetUsername = employeeDetails.getCurrentSelectedTeamMember();

	        vm.isPerformanceChecked = false;
	        vm.isDevelopmentChecked = false;
	        vm.isAlignmentChecked = false;
	        vm.isYouChecked = false;
	        vm.deletePossible = 'false';
    }

    var validateFields = function(){
      if((typeof vm.conversationTitle !== 'undefined' && vm.conversationTitle.length <= 0)){
        growl.error("Please enter a title");
        return false;
      }
      else if(tinymce.activeEditor.getContent({format: 'text'}).trim().indexOf("Enter Sync Up Details") == 0 || tinymce.activeEditor.getContent({format: 'text'}).trim().length <= 0){
        growl.error("Please enter details");
        return false;
      }
      else if(vm.selectedTagsStatus() === false){
        growl.error("Please select a tag");
        return false;
      }
      else if(vm.isAltManagerSelectEnabled == true && vm.selectedAltManager == 'Select Alternate Manager'){
      	growl.error("Please select an Alternate Manager");
	          return false;
      }
      else{
        return true;
      }
    }

    vm.saveConversationAsDraftService = function () {
      if(!validateFields())
      {
        return false;
      }
      setActionBtnsProperty('false');
      vm.draftConversationObject = objectStore.conversation.draftConversation.get();
      if (typeof vm.draftConversationObject != 'undefined' && vm.draftConversationObject != null &&  vm.draftConversationObject.convStatus === 'DRAFT') {
        vm.currentConversationObject = vm.generateConversationObject("DRAFT", "DRAFT",vm.draftConversationObject.id);
        dataservice.updateConversation(vm.context, vm.currentConversationObject).then(function (response) {
          if (response.status === 200 || response.status === 201) {
            if (typeof response.data !== 'undefined') {
              vm.response = response.data;
              console.log("vm response of update " + vm.response.conversation[0].createdOn);
              vm.draftFlag = true;
              vm.deletePossible = 'true';
              vm.deleteEnable = true;
              if(vm.showAltManagerSection == true){
            	  vm.radioBtn1Disable = 'true';
          	   	  vm.radioBtn2Disable = 'true';
          	   	  vm.isAltManagerSelectEnabled = false;
              }
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
      }
      else {
        vm.currentConversationObject = vm.generateConversationObject("DRAFT", "DRAFT");
        dataservice.createConversation(vm.context, vm.currentConversationObject).then(function (response) {
          if (response.status === 200 || response.status === 201) {
            if (typeof response.data !== 'undefined') {
              vm.response = response.data;
              console.log("vm response of create " + vm.response.conversation[0].createdOn);
              vm.draftFlag = true;
              vm.deletePossible = 'true';
              vm.deleteEnable = true;
              if(vm.showAltManagerSection == true){
            	  vm.radioBtn1Disable = 'true';
          	   	  vm.radioBtn2Disable = 'true';
          	   	  vm.isAltManagerSelectEnabled = false;
              }
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
      }
    };

    vm.shareConversationWithTeamMemberService = function () {

      if(!validateFields())
      {
        return false;
      }
      setActionBtnsProperty('false');
      vm.draftConversationObject = objectStore.conversation.draftConversation.get();
      if (typeof vm.draftConversationObject != 'undefined' && vm.draftConversationObject != null &&  vm.draftConversationObject.convStatus === 'DRAFT') {
        vm.currentConversationObject = vm.generateConversationObject("OPEN", "MGR_SUBMIT",vm.draftConversationObject.id);
        console.log(vm.currentConversationObject);
        dataservice.updateConversation(vm.context, vm.currentConversationObject).then(function (response) {
          if (response.status === 200 || response.status === 201) {
            if (typeof response.data !== 'undefined') {
              vm.response = response.data;
              console.log("vm response of create " + vm.response.conversation[0].createdOn);
              console.log("before upload    " +response.data.id);
              vm.responseMsg = "Conversation has been shared";
              //growl.success("Sync Up has been updated");
              vm.convID=response.data.id;
              console.log("share with team member and printing queue");
              console.log(vm.uploader.queue);
              if(vm.uploader.queue == ""){
            	  objectStore.conversation.sharedConversation.set(vm.response);
            	  growl.success(vm.responseMsg);
            	  setActionBtnsProperty('true');
                if($state.is("conversationdetails.newTeamMemberConversation")){
                  $state.go('conversationdetails.sharedTeamMemberConversation');
                }
                else {
                  $state.go('conversationdetails.sharedConversation');
                }
	          }
	          else{
	        	  vm.uploader.uploadAll();
    	          console.log("after upload");
	          }
            }
          }
          else {
            vm.response = false;
          }
        });
      }
      else{
        vm.currentConversationObject = vm.generateConversationObject("OPEN", "MGR_SUBMIT");
        console.log(vm.currentConversationObject);
        dataservice.createConversation(vm.context, vm.currentConversationObject).then(function (response) {
          if (response.status === 200 || response.status === 201) {
            if (typeof response.data !== 'undefined') {
              vm.response = response.data;
              console.log("vm response of update " + vm.response.conversation[0].createdOn);
              console.log("before upload    " +response.data.id);
              vm.responseMsg = "Conversation has been shared";
              //growl.success("Sync Up has been created");
              vm.convID=response.data.id;
              if(vm.uploader.queue == ""){
            	  objectStore.conversation.sharedConversation.set(vm.response);
            	  growl.success(vm.responseMsg);
            	  setActionBtnsProperty('true');
                if($state.is("conversationdetails.newTeamMemberConversation")){
                  $state.go('conversationdetails.sharedTeamMemberConversation');
                }
                else {
                  $state.go('conversationdetails.sharedConversation');
                }
	          }
	          else{
	        	  vm.uploader.uploadAll();
    	          console.log("after upload");
	          }
            }
          }
          else {
            vm.response = false;
          }
        });
      }

    };

    vm.shareConversationWithManagerService = function () {
    	vm.draftConversationObject = objectStore.conversation.draftConversation.get();
    	if(!validateFields())
        {
          return false;
        }
      setActionBtnsProperty('false');
      if (typeof vm.draftConversationObject != 'undefined' && vm.draftConversationObject != null &&  vm.draftConversationObject.convStatus === 'DRAFT') {
        vm.currentConversationObject = vm.generateConversationObject("OPEN", "EMP_SUBMIT",vm.draftConversationObject.id);
        dataservice.updateConversation(vm.context, vm.currentConversationObject).then(function (response) {
          if (response.status === 200 || response.status === 201) {
            if (typeof response.data !== 'undefined') {
              vm.response = response.data;
              vm.convID=response.data.id;
              console.log("vm response of create " + vm.response.conversation[0].createdOn);
              vm.responseMsg = "Conversation has been shared";
              //growl.success("Sync Up has been updated");
              if(vm.uploader.queue == ""){
            	  objectStore.conversation.sharedConversation.set(vm.response);
            	  growl.success(vm.responseMsg);
            	  setActionBtnsProperty('true');
                if($state.is("conversationdetails.newTeamMemberConversation")){
                  $state.go('conversationdetails.sharedTeamMemberConversation');
                }
                else {
                  $state.go('conversationdetails.sharedConversation');
                }
	          }
	          else{
	        	  vm.uploader.uploadAll();
    	          console.log("after upload");
	          }
            }
          }
          else {
            vm.response = false;
          }
        });
      }
      else{
        vm.currentConversationObject = vm.generateConversationObject("OPEN", "EMP_SUBMIT");
        console.log(vm.currentConversationObject);
        dataservice.createConversation(vm.context, vm.currentConversationObject).then(function (response) {
          if (response.status === 200 || response.status === 201) {
            if (typeof response.data !== 'undefined') {
              vm.response = response.data;
              vm.convID=response.data.id;
              console.log("vm response of create " + vm.response.conversation[0].createdOn);
              vm.responseMsg = "Conversation has been shared";
          //    growl.success("Sync Up has been created");
              if(vm.uploader.queue == ""){
            	  objectStore.conversation.sharedConversation.set(vm.response);
            	  growl.success(vm.responseMsg);
            	  setActionBtnsProperty('true');
                if($state.is("conversationdetails.newTeamMemberConversation")){
                  $state.go('conversationdetails.sharedTeamMemberConversation');
                }
                else {
                  $state.go('conversationdetails.sharedConversation');
                }
	          }
	          else{
	        	  vm.uploader.uploadAll();
    	          console.log("after upload");
	          }
            }
          }
          else {
            vm.response = false;
          }
        });
      }
    };

    vm.shareConversation = function(){
    	if(!validateFields())
        {
          return false;
        }
    	setActionBtnsProperty('false');
    	if (typeof vm.draftConversationObject != 'undefined' && vm.draftConversationObject != null &&  vm.draftConversationObject.convStatus === 'DRAFT') {
            vm.currentConversationObject = vm.generateConversationObject("OPEN", "EMP_SUBMIT",vm.draftConversationObject.id);
            dataservice.updateConversation(vm.context, vm.currentConversationObject).then(function (response) {
              if (response.status === 200 || response.status === 201) {
                if (typeof response.data !== 'undefined') {
                  vm.response = response.data;
                  vm.convID=response.data.id;
                  console.log("vm response of create " + vm.response.conversation[0].createdOn);
                  vm.responseMsg = "Conversation has been shared";
                  //growl.success("Sync Up has been updated");
                  if(vm.uploader.queue == ""){
                	  objectStore.conversation.sharedConversation.set(vm.response);
                	  growl.success(vm.responseMsg);
                	  setActionBtnsProperty('true');
                    if($state.is("conversationdetails.newTeamMemberConversation")){
                      $state.go('conversationdetails.sharedTeamMemberConversation');
                    }
                    else {
                      $state.go('conversationdetails.sharedConversation');
                    }
    	          }
    	          else{
    	        	  vm.uploader.uploadAll();
        	          console.log("after upload");
    	          }
                }
              }
              else {
                vm.response = false;
              }
            });
          }
          else{
            vm.currentConversationObject = vm.generateConversationObject("OPEN", "EMP_SUBMIT");
            console.log(vm.currentConversationObject);
            dataservice.createConversation(vm.context, vm.currentConversationObject).then(function (response) {
              if (response.status === 200 || response.status === 201) {
                if (typeof response.data !== 'undefined') {
                  vm.response = response.data;
                  vm.convID=response.data.id;
                  console.log("vm response of create " + vm.response.conversation[0].createdOn);
                  vm.responseMsg = "Conversation has been shared";
                  //growl.success("Sync Up has been created");
                  if(vm.uploader.queue == ""){
                	  objectStore.conversation.sharedConversation.set(vm.response);
                	  growl.success(vm.responseMsg);
                	  setActionBtnsProperty('true');
                    if($state.is("conversationdetails.newTeamMemberConversation")){
                      $state.go('conversationdetails.sharedTeamMemberConversation');
                    }
                    else {
                      $state.go('conversationdetails.sharedConversation');
                    }
    	          }
    	          else{
    	        	  vm.uploader.uploadAll();
        	          console.log("after upload");
    	          }
                }
              }
              else {
                vm.response = false;
              }
            });
          }
    }

    vm.generateConversationObject = function (convStatus, status, id) {
      var conversationTagsObject = [];
      var attachmentObject={};

      var commentVal = tinymce.activeEditor.getContent({format: 'raw'});
      console.log("Tiny MCE Text>>>>> "+ commentVal);
      angular.forEach(angular.element('.convTagCheckbox'), function (value, key) {
        if (value.checked === true) {
          conversationTagsObject.push(value.name);
        }
      });
      console.log("conversationTagsObject " + conversationTagsObject);

      if(vm.showAltManagerSection == true){
    	  if(vm.isAltManagerSelectEnabled == true)
    		 vm.targetUsername = vm.selectedAltManagerCecId;
      }

      var conversationObject = null;

      if(id!= null && typeof id !== 'undefined')
      {
        conversationObject = vm.draftConversationObject;
        conversationObject["topicTitle"] = vm.conversationTitle;
        conversationObject["tags"] = conversationTagsObject;
        conversationObject["convStatus"] = convStatus;
        conversationObject.conversation[0].status = status;
        if(typeof conversationObject.conversation !== 'undefined' && conversationObject.conversation.length > 0)
        {
          conversationObject.conversation[0].comments = commentVal;
        }
      }
      else {
    	conversationObject = {
          "ownerUsername": vm.conversationOwner,
          "targetUsername": vm.targetUsername,
          "conversationAbout": vm.conversationFor,
          "type": "Conversation",
          "empId": "null",
          "topicTitle": vm.conversationTitle,
          "tags": conversationTagsObject,
          "convStatus": convStatus,
          "conversation": [
            {
              "convId": "1",
              "createdBy": vm.conversationOwner,
              "comments": commentVal,
              "status": status,
              "attachmentId":attachmentObject
            }
          ]
        };
      }
      return conversationObject;
    };

    vm.showShareWithManager = function(){
    	if(vm.showAltManagerSection == false){
    		if(vm.conversationOwner===vm.conversationFor)
    	        return true;
    	      else
    	        return false;
    	}
    	else
    		return false;
    }

    vm.showShareWithTeamMember = function(){
    	if(vm.showAltManagerSection == false){
    		if(vm.conversationOwner!==vm.conversationFor)
    	        return true;
    	      else
    	        return false;
    	}
    	else
    		return false;
    }

    vm.cancelAction = function(){
    	window.history.back();
    /*	if(objectStore.conversation.createConversationSource.get() == "ModalPopUp"){
    		if(typeof $stateParams.username !== 'undefined' && $stateParams.username.length > 0)
    	      {
    	        $state.go("conversationsTeamMember.self",{"username":$stateParams.username});
    	      }
    		else
    			$state.go("home");
    	}
    	else {
        $state.go("conversations.selfState");
    	} */
    }

    vm.showTags = function(){
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
                vm.attachmentId = response.data[0].serverdata.conversation[0].attachmentId;
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
              window.history.back();
           /*   if(objectStore.conversation.createConversationSource.get() == "ModalPopUp"){
            	  $state.go("home");
              }
              else if(objectStore.conversation.createConversationSource.get() == "conversationSelf"){
            	  $state.go("conversations.selfState");
              }
              else if(objectStore.conversation.createConversationSource.get() == "TeamConversationDetail"){
            	  $state.go("conversations.teamState");
              } */
            }
            else {
              vm.response = false;
            } 
          });
    }

    vm.changeAltManager = function(altManagerId, alternateManagerName){
    	vm.selectedAltManagerCecId = altManagerId;
    	vm.selectedAltManager = alternateManagerName;
    	console.log("Selected alternate manager is "+vm.selectedAltManagerCecId);
    }

    vm.configureSelfConversation = function($event){
		if($event.target.id === 'radio01'){
			vm.isAltManagerSelectEnabled = false;
			vm.radioBtn1Checked = true;
		} else if($event.target.id === 'radio02'){
			vm.isAltManagerSelectEnabled = true;
			vm.radioBtn1Checked = false;
		}
	};

    $scope.browseForAttachment = function (elementId) {
      var elem = document.getElementById(elementId);
      if (elem && document.createEvent) {
        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, false);
        elem.dispatchEvent(evt);
      }
    };
  }

})();
