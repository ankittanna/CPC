(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcTeamConversation', cpcTeamConversation);

  /* @ngInject */
  function cpcTeamConversation() {

    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcTeamConversation/cpcTeamConversation.html',
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
  function Controller($log,$translate,$modal,$scope,$window,$state,employeeDetails,objectStore,localStorageService,dataservice,FileUploader,growl) {
	  	var vm = this;
	  //	vm.context = "TEAM";

	  	vm.saveDraftClicked = false;
	  	vm.deletePossible = 'false';
	  	vm.convID = "";
	  	vm.radioBtn1Disable = 'true';
	  	vm.responseMsg = "";
	  	vm.selectedTags = [false,false,false,false];
	  	
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

	  	if(typeof objectStore.conversation.draftTeamConversation.get()!= undefined && objectStore.conversation.draftTeamConversation.get()!= null){
	  		vm.draftTeamConversation = objectStore.conversation.draftTeamConversation.get();

	  		/* setting this object because for tiny mce it is hard coded to use comments from draftConversation
	  		 * we should ideally replace it with a global variable to which we should set the value of comments
	  		 *  of conversation object we are dealing with */
	  		objectStore.conversation.draftConversation.set(vm.draftTeamConversation);

	  		vm.conversationTitle = vm.draftTeamConversation.topicTitle;
	  		vm.conversationOwner = localStorageService.get("loggedInUser").username;
	  		vm.targetUsername = localStorageService.get("loggedInUser").managerUsername;
	  		employeeDetails.getUserFullName(vm.conversationOwner).then(function(fullName){
	  			vm.convOwnerFullName = fullName;
		    });
			  	vm.isPerformanceChecked = false;
	            vm.isDevelopmentChecked = false;
	            vm.isAlignmentChecked = false;
	            vm.isYouChecked = false;
	            vm.isTalentSynchUpChecked = true;

		  	vm.isTeamMemberSelectEnabled = false;
		  	vm.radioBtn1Checked = false;
		  	vm.radioBtn2Checked = true;
		  	vm.radioBtn1Disable = 'true';
		  	vm.showAttachments = true;
		  	vm.attachmentId = vm.draftTeamConversation.conversation[0].attachmentId;
		  	vm.convSequenceId = vm.draftTeamConversation.conversation[0].convId;
	        vm.conversationId = vm.draftTeamConversation.id;
	        vm.deletePossible = 'true';
	        vm.deleteEnable = !vm.deleteEnable;
	  	}
	  	else{

	  		/* clearly draftConversation so that tiny mce doesnot populate old data in editor*/
	  		objectStore.conversation.draftConversation.remove();
	  		vm.conversationTitle = '';
	  		vm.conversationOwner = localStorageService.get("loggedInUser").username;
	  		vm.targetUsername = localStorageService.get("loggedInUser").managerUsername;
	  		employeeDetails.getUserFullName(vm.conversationOwner).then(function(fullName){
	  			vm.convOwnerFullName = fullName;
	  		});
		            vm.isPerformanceChecked = false;
		            vm.isDevelopmentChecked = false;
		            vm.isAlignmentChecked = false;
		            vm.isYouChecked = false;
		            vm.isTalentSynchUpChecked = true;

		            vm.showAttachments = false;

		  	dataservice.getTeamMembers().then(function(data){
		  		vm.teamHierarchy = data;
		  	});
		  	dataservice.getAlternateTeam().then(function(data){
		  		vm.altTeamHierarchy = data;
		  	});

		  	vm.isTeamMemberSelectEnabled = true;
		  	vm.radioBtn1Checked = true;
		  	vm.radioBtn2Checked = false;
		  	vm.radioBtn1Disable = 'false';
	  	}


	  	vm.selectedTeamMember = 'Individual Team Member';
	  	vm.selectedTeamMemberCecId = '';

		vm.changeTeamMember = function(teamMember) {
		  vm.selectedTeamMemberCecId = teamMember.username;
		  vm.selectedTeamMember = teamMember.firstName + ' '+ teamMember.lastName;
		  console.log("team member selected is "+vm.selectedTeamMember);
		};

		vm.configureTeamConversation = function($event){
			if($event.target.id === 'radio01'){
				vm.isTeamMemberSelectEnabled = true;
			} else if($event.target.id === 'radio02'){
				vm.isTeamMemberSelectEnabled = false;
			}
		};

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
	    	   console.log("saveDraftClicked "+vm.saveDraftClicked);
	    	   growl.success(vm.responseMsg);
	    	   setActionBtnsProperty('true');
	    	   if(vm.saveDraftClicked == true){
	    		   console.log("******* 1 ********");
	    		   objectStore.conversation.draftTeamConversation.set(response[0].serverdata);
	    		   vm.saveDraftClicked = false;
	    		   vm.showAttachments = true;
	    		   vm.attachmentId = response[0].serverdata.conversation[0].attachmentId;
	    		   vm.convSequenceId = response[0].serverdata.conversation[0].convId;
	    		   vm.conversationId = response[0].serverdata.id;
	    	   }
	    	   else{
	    		   console.log("******* 2 ********");
	    		   objectStore.conversation.sharedTeamConversation.set(response[0].serverdata);
	               $state.go('conversationdetails.sharedTeamConversation');
	    	   }
	    	}
	    }

	    vm.uploader.onErrorItem = function(item, response, status, headers){
	       console.log("############### error item function ###########");
	       console.log(response);
	    }

	    vm.talentTagSelected = true;
	    vm.selectedTags = [false,false,false,false];
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

	     /* if(isSelected == false)
	      {
	        if(vm.isYouChecked == true || vm.isPerformanceChecked == true || vm.isDevelopmentChecked == true || vm.isAlignmentChecked == true)
	        {
	          isSelected = true;
	        }
	      } */

	      return isSelected;
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
	        else if(vm.selectedTagsStatus() === false && vm.isTeamMemberSelectEnabled == true){
	          growl.error("Please select a tag");
	          return false;
	        }
	        else if(vm.isTeamMemberSelectEnabled == true && vm.selectedTeamMember == 'Individual Team Member'){
	        	growl.error("Please select a team member");
		          return false;
	        }
	        else{
	          return true;
	        }
	      }

		vm.saveConversationAsDraftService = function()
		{
			vm.draftTeamConversation = objectStore.conversation.draftTeamConversation.get();
			console.log("in save draft for team");
			console.log(vm.draftTeamConversation);
			if(!validateFields())
		      {
		        return false;
		      }
			setActionBtnsProperty('false');
			 var targetUser,convFor,convType ;
			 if(!vm.isTeamMemberSelectEnabled){
				 targetUser = vm.targetUsername;
			     convFor = vm.conversationOwner;
			     convType = "TalentSyncUp";
			     vm.context = "SELF";
		      }
		     else{
		    	 targetUser = vm.selectedTeamMemberCecId;
		    	 convFor = vm.selectedTeamMemberCecId;
				 convType = "Conversation";
				 vm.context = "TEAM";
		      }

			      if (typeof vm.draftTeamConversation != 'undefined' && vm.draftTeamConversation != null &&  vm.draftTeamConversation.convStatus === 'DRAFT') {
			    	  console.log("Case 1");
			        vm.currentConversationObject = vm.generateConversationObject("DRAFT", "DRAFT",targetUser,convFor,convType,vm.draftTeamConversation.id);
			        dataservice.updateConversation(vm.context, vm.currentConversationObject).then(function (response) {
			          if (response.status === 200 || response.status === 201) {
			            if (typeof response.data !== 'undefined') {
			              vm.response = response.data;
			              console.log("vm response of update " + vm.response.conversation[0].createdOn);
			              vm.draftFlag = true;
			              vm.deletePossible = 'true';
			              vm.deleteEnable = !vm.deleteEnable;
			              vm.responseMsg = "Conversation has been saved";
			             // growl.success("Draft has been saved");
			              vm.convID=response.data.id;
			              if(vm.uploader.queue == ""){
			            	  objectStore.conversation.draftTeamConversation.set(vm.response);
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
			    	  console.log("Case 2");
			        vm.currentConversationObject = vm.generateConversationObject("DRAFT", "DRAFT",targetUser,convFor,convType);
			        dataservice.createConversation(vm.context, vm.currentConversationObject).then(function (response) {
			          if (response.status === 200 || response.status === 201) {
			            if (typeof response.data !== 'undefined') {
			              vm.response = response.data;
			              console.log("vm response of create " + vm.response.conversation[0].createdOn);
			              vm.draftFlag = true;
			              vm.deletePossible = 'true';
			              vm.deleteEnable = !vm.deleteEnable;
			              vm.responseMsg = "Conversation has been saved";
				       // growl.success("Draft has been saved");
			              vm.convID=response.data.id;
			              if(vm.uploader.queue == ""){
			            	  objectStore.conversation.draftTeamConversation.set(vm.response);
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
		      console.log("in shareWithTeamMember function");
		      if(!validateFields())
		      {
		        return false;
		      }
		      setActionBtnsProperty('false');
		      vm.context = "TEAM";
		      vm.draftTeamConversation = objectStore.conversation.draftTeamConversation.get();
		    	if (typeof vm.draftTeamConversation != 'undefined' && vm.draftTeamConversation != null &&  vm.draftTeamConversation.convStatus === 'DRAFT') {
		    		vm.currentConversationObject = vm.generateConversationObject("OPEN", "MGR_SUBMIT",vm.selectedTeamMemberCecId,vm.selectedTeamMemberCecId,"Conversation",vm.draftTeamConversation.id);
		    		console.log(vm.currentConversationObject);
		    		dataservice.updateConversation(vm.context, vm.currentConversationObject).then(function (response) {
		    	    	if (response.status === 200 || response.status === 201) {
		    	    		if (typeof response.data !== 'undefined') {
					            vm.response = response.data;
					            console.log("vm response of create " + vm.response.conversation[0].createdOn);
					            console.log("before upload    " +response.data.id);
					            vm.responseMsg = "Conversation has been shared";
					            vm.convID=response.data.id;
					            console.log("printing queue");
					            console.log(vm.uploader.queue);
					            if(vm.uploader.queue == ""){
					            	objectStore.conversation.sharedTeamConversation.set(vm.response);
					            	growl.success(vm.responseMsg);
					            	setActionBtnsProperty('true');
					            	$state.go('conversationdetails.sharedTeamConversation');
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
			    		vm.currentConversationObject = vm.generateConversationObject("OPEN", "MGR_SUBMIT",vm.selectedTeamMemberCecId,vm.selectedTeamMemberCecId,"Conversation");
			    	      console.log(vm.currentConversationObject);
			    	      dataservice.createConversation(vm.context, vm.currentConversationObject).then(function (response) {
			    	        if (response.status === 200 || response.status === 201) {
			    	          if (typeof response.data !== 'undefined') {
			    	            vm.response = response.data;
			    	            console.log("before upload    " +response.data.id);
			    	            vm.responseMsg = "Conversation has been shared";
			    	            vm.convID=response.data.id;
			    	            console.log("printing queue");
					            console.log(vm.uploader.queue);
					            if(vm.uploader.queue == ""){
					            	 objectStore.conversation.sharedTeamConversation.set(vm.response);
					            	 growl.success(vm.responseMsg);
						             setActionBtnsProperty('true');
					            	 $state.go('conversationdetails.sharedTeamConversation');
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

		vm.shareConversationWithManagerService = function()
		{
			if(!validateFields())
		      {
		        return false;
		      }
			setActionBtnsProperty('false');
			vm.context = "SELF";
			vm.draftTeamConversation = objectStore.conversation.draftTeamConversation.get();
			if (typeof vm.draftTeamConversation != 'undefined' && vm.draftTeamConversation != null &&  vm.draftTeamConversation.convStatus === 'DRAFT') {
	    		vm.currentConversationObject = vm.generateConversationObject("OPEN", "EMP_SUBMIT",vm.targetUsername,vm.conversationOwner,"TalentSyncUp",vm.draftTeamConversation.id);
	    		console.log(vm.currentConversationObject);
	    		dataservice.updateConversation(vm.context, vm.currentConversationObject).then(function (response) {
	    	    	if (response.status === 200 || response.status === 201) {
	    	    		if (typeof response.data !== 'undefined') {
				            vm.response = response.data;
				            console.log("vm response of create " + vm.response.conversation[0].createdOn);
				            vm.responseMsg = "Conversation has been shared";
				            console.log("before upload    " +response.data.id);
				            vm.convID=response.data.id;
				            if(vm.uploader.queue == ""){
				            	 objectStore.conversation.sharedTeamConversation.set(vm.response);
				            	 growl.success(vm.responseMsg);
				            	 setActionBtnsProperty('true');
				            	 $state.go('conversationdetails.sharedTeamConversation');
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
		    		vm.currentConversationObject = vm.generateConversationObject("OPEN", "EMP_SUBMIT",vm.targetUsername,vm.conversationOwner,"TalentSyncUp");
		    	      console.log(vm.currentConversationObject);
		    	      dataservice.createConversation(vm.context, vm.currentConversationObject).then(function (response) {
		    	        if (response.status === 200 || response.status === 201) {
		    	          if (typeof response.data !== 'undefined') {
		    	            vm.response = response.data;
		    	            vm.responseMsg = "Conversation has been shared";
		    	            objectStore.conversation.sharedTeamConversation.set(vm.response);
		    	            console.log("before upload    " +response.data.id);
		    	            vm.convID=response.data.id;
		    	            if(vm.uploader.queue == ""){
				            	 objectStore.conversation.sharedTeamConversation.set(vm.response);
				            	 growl.success(vm.responseMsg);
				            	 setActionBtnsProperty('true');
				            	 $state.go('conversationdetails.sharedTeamConversation');
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


		vm.generateConversationObject = function(convStatus, status, targetUser,convFor,convType,id){
		  var conversationTagsObject = [];
		  var attachmentObject={};

	      var commentVal = tinymce.activeEditor.getContent({format: 'raw'});
	      console.log("Tiny MCE Text>>>>> "+ commentVal);

	      if(!vm.isTeamMemberSelectEnabled){
	    	  conversationTagsObject.push("Talent Sync Up");
	      }
	      else{
	    	  angular.forEach(angular.element('.convTagCheckbox'), function (value, key) {
	    	      if (value.checked === true) {
	    	          //$scope.conversationObject.conversationTags.push(value.name);
	    	          conversationTagsObject.push(value.name);
	    	        }
	    	      });
	      }


	      console.log("conversationTagsObject " + conversationTagsObject);
	      var conversationObject = null;

	      if(id!= null && typeof id !== 'undefined')
	      {
	        conversationObject = vm.draftTeamConversation;
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
	          "targetUsername": targetUser,
	          "conversationAbout": convFor,
	          "type": convType,
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

	    vm.cancelClicked = function(){
	    	window.history.back();
	    /*	if(typeof objectStore.conversation.draftTeamConversation.get()!= undefined && objectStore.conversation.draftTeamConversation.get()!= null){
	    		$state.go('conversations.selfState');
	    	}
	    	else{
	    		$state.go('conversations.teamState');
	    	} */
	    }

	    vm.deleteAttachment = function(attachemntId){
	    	console.log("attachment ID "+attachemntId);
	    	console.log("conv id "+vm.conversationId);
	    	console.log("sequence id "+vm.convSequenceId);
	    	dataservice.deleteAttachment(attachemntId,vm.conversationId,vm.convSequenceId).then(function (response) {
	            if (response.status === 200 || response.status === 201) {
	              if (typeof response.data !== 'undefined') {
	                vm.response = response.data[0].serverdata;
	                objectStore.conversation.draftTeamConversation.set(response.data[0].serverdata);
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
	    	vm.conversationId = objectStore.conversation.draftTeamConversation.get().id;
	    	console.log("delete clicked "+vm.conversationId);
	    	dataservice.deleteConversation(vm.conversationId).then(function (response) {
	    		console.log("delete call completed");
	    		console.log(response);
	            if(response.status === 200 || response.status === 201) {
	              vm.respose = true;
	              console.log("delete successful");
	              growl.success("Conversation has been deleted");
	              window.history.back();
//	              $state.go("conversationdetails.teamState");
	            }
	            else {
	              vm.response = false;
	            }
	          });
	    }

		$scope.browseForAttachment = function(elementId){
				var elem = document.getElementById(elementId);
			   	if(elem && document.createEvent) {
				  var evt = document.createEvent("MouseEvents");
				  evt.initEvent("click", true, false);
				  elem.dispatchEvent(evt);
			   	}
			};


		// Check Current Conversation Tags
		$scope.checkCurrentConversationTags = function(conversation)
		{
			////alert(conversation.tags);
			//conversation.tags.indexOf('You')!=-1
		};
  }
})();





