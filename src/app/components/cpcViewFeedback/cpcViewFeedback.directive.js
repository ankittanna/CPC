(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcViewFeedback', cpcViewFeedback);

  /* @ngInject */
  function cpcViewFeedback() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcViewFeedback/cpcViewFeedback.html',
      bindToController: true,
      controller: Controller,
      controllerAs: 'vm',
      link: link,
      restrict: 'E',
      scope: {},
      attrs: {}
    };
    return directive;

    function link(scope, element, attrs) {}
  }

  /* @ngInject */
  function Controller($log, $translate, $scope, $modal, $window, $state, $attrs, objectStore, growl, employeeDetails, dateTimeService, dataservice, localStorageService, $stateParams) {
    var vm = this;
    
    objectStore.feedback.feedbackPrintSource.set("feedbackViewPage");
    // can be "view" or "declined" or "pending" or "reminder"
    vm.feedbackViewMode = $attrs.mode;

    vm.isActivityRunning = false;
    vm.activityMessage = '';

    // Current Active Feedback Object
    vm.currentFeedbackObject = null;
    vm.currentFeedbackObject = objectStore.feedback.currentFeedbackObject.get();

    // TODO: Display Control of various sections of view only mode of feedback
    // Feedback View is divided into three sections
    // Requestor Section: Person who initialized the feedback
    // Reminder Section: Person who initialized send reminder/s to the provider
    // Provider Section: Provider of the feedback has written something for the initializer
    // Hence below 3 flags will be responsible for visiblility/inclusions of the sections
    // These three flags will be set based on data available in the currentFeedbackObject
    vm.isRequestorSectionVisible = false;
    vm.isReminderSectionVisible = false;
    vm.isProviderSectionVisible = false;

    // TODO: Fix and generalize it || Auto detect the server response
    vm.isFeedbackTypeMultipleRequest = false;
    vm.feedbackMultipleUserCount = 0;
    
    vm.loggedInUser = localStorageService.get("loggedInUser").username;
    // This gets the context of the username with the fall back to logged in user
        vm.feedbackContextUserName = objectStore.feedback.feedbackContextUsername.get();
        if(vm.feedbackContextUserName === null || typeof vm.feedbackContextUserName === 'undefined' || vm.feedbackContextUserName === '')
        {
          vm.feedbackContextUserName = vm.loggedInUser;
        }

    // Responsible for showing the action button under the feedback - Provide, Decline, Send Reminder
    // Triggers to true only if both logged in user is same as the context user, else it is false
    // Now after addition of $state params this switch happenson the availability of the param in the URL
    // If the 'drilldown user' - replacement term of 'context user', is a parameter in the URL - identified by '$stateParams.username'
    vm.isActionButtonVisible = true;

    /*if(vm.loggedInUser === vm.feedbackContextUserName)
    {
      vm.isActionButtonVisible = true;
    } else if(vm.loggedInUser !== vm.feedbackContextUserName)
    {
      vm.isActionButtonVisible = false;
    } */

    if($stateParams.username){
      vm.isActionButtonVisible = false;
    }
    else{
      vm.isActionButtonVisible = true;
    }


    if(vm.currentFeedbackObject.hasOwnProperty('serverData'))
    {
      // Get the count
      vm.feedbackMultipleUserCount = vm.currentFeedbackObject.FeedbackIdList.length;

      // Grab the first object of the response and set it to the global currentFeedbackObject
      // Useful for the template used for View Mode
      vm.currentFeedbackObject = vm.currentFeedbackObject.serverData[0];
      vm.isFeedbackTypeMultipleRequest = true;
    }

    // Check Data Availability in the object
    if (typeof vm.currentFeedbackObject !== undefined || vm.currentFeedbackObject !== null) {
      if (vm.currentFeedbackObject.description !== '' && vm.currentFeedbackObject.title !== '') {
        vm.isRequestorSectionVisible = true;
      } else {
        vm.isRequestorSectionVisible = false;
      }

if(vm.currentFeedbackObject.sendReminderLists !== null)
{
  if(typeof vm.currentFeedbackObject.sendReminderLists !== 'undefined')
  {
      if (vm.currentFeedbackObject.sendReminderLists.length > 0) {
        if(vm.currentFeedbackObject.sendReminderLists.length === 1 && vm.currentFeedbackObject.sendReminderLists[0].sendReminderFlag === '' && vm.currentFeedbackObject.sendReminderLists[0].reminderSendBy === '' && (vm.currentFeedbackObject.sendReminderLists[0].reminderSendOn === '' || vm.currentFeedbackObject.sendReminderLists[0].reminderSendOn === null))
        {
          vm.isReminderSectionVisible = false;
        } else if(vm.currentFeedbackObject.sendReminderLists === null)
        {
          vm.isReminderSectionVisible = false;
        } else if(vm.currentFeedbackObject.sendReminderLists.length === 1 && vm.currentFeedbackObject.sendReminderLists[0].sendReminderFlag !== '' && vm.currentFeedbackObject.sendReminderLists[0].reminderSendBy !== '' && vm.currentFeedbackObject.sendReminderLists[0].reminderSendOn !== '')
        {
          vm.isReminderSectionVisible = true;
        } else if(vm.currentFeedbackObject.sendReminderLists.length > 1)
        {
          vm.isReminderSectionVisible = true;
        }
        
      } else if (vm.currentFeedbackObject.sendReminderLists.length === 0 || vm.currentFeedbackObject.sendReminderList === null) {
        vm.isReminderSectionVisible = false;
      }
  }
  
} else if(vm.currentFeedbackObject.sendReminderLists === null)
{
  vm.isReminderSectionVisible = false;
}

      console.log('vm.currentFeedbackObject', vm.currentFeedbackObject);

      if (vm.currentFeedbackObject.feedbackResponse !== '') {
        vm.isProviderSectionVisible = true;
      } else {
        vm.isProviderSectionVisible = false;
      }
    }

    //alert(JSON.stringify(vm.currentFeedbackObject));

    // TODO: Fill the elements of Feedback Page
    // This fills the entire feedback details into local controller variables
    vm.feedbackId = vm.currentFeedbackObject.id;
    vm.feedbackTitle = vm.currentFeedbackObject.title;
    vm.feedbackType = vm.currentFeedbackObject.type;
    vm.feedbackProvider = vm.currentFeedbackObject.provider;
    vm.feedbackRequester = vm.currentFeedbackObject.requester;
    vm.feedbackDescription = vm.currentFeedbackObject.description;
    vm.feedbackFy = vm.currentFeedbackObject.fy;
    vm.feedbackQuarter = vm.currentFeedbackObject.quarter;
    vm.feedbackRequestedOn = vm.currentFeedbackObject.requested_on;
    vm.feedbackRequestedBy = vm.currentFeedbackObject.requested_by;
    vm.feedbackUpdateOn = vm.currentFeedbackObject.updated_on;
    vm.feedbackUpdatedBy = vm.currentFeedbackObject.updated_by;
    vm.feedbackResponseOn = vm.currentFeedbackObject.response_on;
    vm.feedbackAttachmentId = vm.currentFeedbackObject.attachment_id;
    vm.feedbackTag = vm.currentFeedbackObject.tag;
    vm.feedbackStatus = vm.currentFeedbackObject.feedbackStatus;
    vm.feedbackSaveStatus = vm.currentFeedbackObject.saveSatus;
    vm.feedbackShareWithEmployee = vm.currentFeedbackObject.sharewithemp;
    vm.feedbackResponseType = vm.currentFeedbackObject.response_type;
    vm.feedbackQuestionnareId = vm.currentFeedbackObject.questionnare_id;
    vm.feedbackResponse = vm.currentFeedbackObject.feedbackResponse;
    vm.feedbackManagerComments = vm.currentFeedbackObject.mgrComments;
    vm.feedbackManagerSharedOn = vm.currentFeedbackObject.mgrShared_on;
    vm.feedbackReminderList = vm.currentFeedbackObject.sendReminderLists;
    vm.feedbackProviderList = vm.currentFeedbackObject.providerList;


    // TODO: Fix the Descending order of reminder time.
    if(vm.feedbackReminderList !== null)
    {
      if(typeof vm.feedbackReminderList !== 'undefined')
      {
        vm.feedbackReminderListUpdated = vm.feedbackReminderList.map(function(reminder, index, array){
        if(reminder.sendReminderFlag !== '' && reminder.reminderSendBy !== '' && reminder.reminderSendOn !== null)
        {
          var reminderObj = new Object();
          reminderObj.sendReminderFlag = reminder.sendReminderFlag;
          reminderObj.reminderSendBy = reminder.reminderSendBy;
          reminderObj.sendReminderedOn = reminder.sendReminderedOn;
          reminderObj.sendReminderDate = dateTimeService.getCurrentDate(reminder.sendReminderedOn);
          reminderObj.sendReminderTime = dateTimeService.getCurrentTime(reminder.sendReminderedOn);

          return reminderObj;
        }
      });
      }
    } else if(vm.feedbackReminderList === null)
    {
      vm.feedbackReminderListUpdated = [];
    }

    if(vm.feedbackReminderList !== null)
    {
      if(typeof vm.feedbackReminderList !== 'undefined')
      {
         // Remove null values
        vm.feedbackReminderListUpdated = vm.feedbackReminderListUpdated.filter(function(e){ return e === 0 || e });
        vm.feedbackReminderListUpdated.reverse();
        console.log("DDDDDDDDd "+JSON.stringify(vm.feedbackReminderListUpdated));
        //vm.feedbackReminderListUpdated = vm.feedbackReminderListUpdated.push(vm.feedbackReminderListUpdated.shift());
      }
    }
   

    // Full name of the requester
    vm.feedbackRequestedByFullName = '';
    employeeDetails.getUserFullName(vm.feedbackRequester).then(function(fullName) {
      vm.feedbackRequestedByFullName = fullName;
    });

    // Full name of the provider
    vm.feedbackProviderFullName = '';
    employeeDetails.getUserFullName(vm.feedbackProvider).then(function(fullName) {
      vm.feedbackProviderFullName = fullName;
    });

    if(vm.feedbackRequestedOn !== '')
    {
        // Requested On - Formatted Date
        vm.feedhackRequestedOnDate = dateTimeService.getCurrentDate(vm.feedbackRequestedOn);

        // Requested On - Formatted Time
        vm.feedhackRequestedOnTime = dateTimeService.getCurrentTime(vm.feedbackRequestedOn);
    }

    if(vm.feedbackResponseOn !== '')
    {
        // Received On - Formatted Date
        vm.feedhackReceivedOnDate = dateTimeService.getCurrentDate(vm.feedbackResponseOn);

        // Received On - Formatted Time
        vm.feedhackReceivedOnTime = dateTimeService.getCurrentTime(vm.feedbackResponseOn);
    }

    // Get respond mode details in the header
    
    if(vm.isRequestorSectionVisible)
    {
      
    }

    // Should Feedback Attachment be Visible
    vm.isFeedbackRequestAttachmentVisible = function(feedbackObject, type)
    {
     if(type === 'request')
      {
        if(feedbackObject.attachment_id !== null)
        {
          if(feedbackObject.attachment_id.hasOwnProperty('empty'))
          {
            return false;
          }
        }

        if($.isEmptyObject(feedbackObject.attachment_id) || feedbackObject.attachment_id === null || feedbackObject.attachment_id === undefined)
        {
          return false;
        } else 
        {
          return true;
        }

      }

    };

    vm.isFeedbackResponseAttachmentVisible = function(feedbackObject, type)
    {
      console.log("ATTACHMENT -------> " + JSON.stringify(feedbackObject.attachment_id) + ' -----------> ' + JSON.stringify(feedbackObject.response_attachment_id));
      if(type === 'response')
      {
        if(feedbackObject.response_attachment_id !== null)
        {
          if(feedbackObject.response_attachment_id.hasOwnProperty('empty'))
          {
            return false;
          }
        }

        if($.isEmptyObject(feedbackObject.response_attachment_id))
        {
          return false;
        } else 
        {
          return true;
        }
      }
    }

    // Declines and Updates the Feedback object from here itself.
    vm.declineFeedback = function(feedbackObject) {
      vm.isActivityRunning = true;
      vm.activityMessage = 'Declining Feedback...';
      // Call the service for declining this feedback.
      // UPDATE Service to be called.
      feedbackObject.feedbackStatus = 'DECLINE'; 
      // alert(JSON.stringify(feedbackObject));
      dataservice.declineFeedback(feedbackObject)
      .then(declineFeedbackComplete)
      .catch(declineFeedbackFailed);

      function declineFeedbackComplete(response)
      {
          if (response.status === 200 || response.status === 201) {
          if (typeof response.data !== undefined) {
            growl.success('Feedback request has been declined.');
            vm.feedbackObjectResponse = response.data;
            // alert(JSON.stringify(response.data));
            objectStore.feedback.currentFeedbackObject.set(vm.feedbackObjectResponse);

            if($stateParams.username){
                $state.go('teamMemberFeedback.viewFeedback',{"tmusername":$stateParams.username});
              }
              else{
                $state.go('feedback.viewFeedback');
              }

           // $state.go('feedback.viewFeedback');
          }
          vm.isActivityRunning = false;
          vm.activityMessage = '';
        }
        return response;
      }

      function declineFeedbackFailed(error)
      {
        vm.isActivityRunning = false;
        vm.activityMessage = '';

        console.log('XHR Request Failed ' + error.data);
      }
    };

    vm.feedbackAboutFullName = 'Loading...';
    vm.getFeedbackAboutFullName = function(username)
    {
      employeeDetails.getUserFullName(username).then(function(fullName) {
        vm.feedbackAboutFullName = fullName;
      }); 
    };

    vm.feedbackProviderFullName = 'Loading...';
    vm.getFeedbackProviderFullName = function(username)
    {
      employeeDetails.getUserFullName(username).then(function(fullName) {
        vm.feedbackProviderFullName = fullName;
      }); 
    };

    vm.sendFeedbackReminder = function(feedbackId) {
      vm.isActivityRunning = true;
      vm.activityMessage = 'Sending Reminder...';

      dataservice.sendFeedbackReminder(feedbackId)
        .then(sendFeedbackReminderComplete)
        .catch(sendFeedbackReminderFailed);

      function sendFeedbackReminderComplete(response) {
        if (response.status === 200 || response.status === 201) {
          if (typeof response.data !== undefined) {
            growl.success('Reminder has been sent.');
            vm.feedbackObjectResponse = response.data;
            objectStore.feedback.currentFeedbackObject.set(vm.feedbackObjectResponse);
            if($stateParams.username){
                $state.go('teamMemberFeedback.viewFeedback',{"tmusername":$stateParams.username});
              }
              else{
                $state.go('feedback.viewFeedback');
              }
            // $state.go('feedback.viewFeedback');
          }
          vm.isActivityRunning = false;
          vm.activityMessage = '';
        }
        return response;
      }

      function sendFeedbackReminderFailed(error) {
        vm.isActivityRunning = false;
        vm.activityMessage = '';

        console.log('XHR Request Failed ' + error.data);
      }
    };


    vm.deleteFeedback = function(feedbackId)
    {
      vm.isActivityRunning = true;
      vm.activityMessage = 'Deleting Feedback...';

      dataservice.deleteFeedback(feedbackId)
        .then(deleteFeedbackComplete)
        .catch(deleteFeedbackFailed);

      function deleteFeedbackComplete(response)
      {
        vm.isActivityRunning = false;
        vm.activityMessage = '';

         if (response.status === 200 || response.status === 201) {
          if (typeof response.data !== undefined) {
            growl.success('Feedback has been deleted.');
            if($stateParams.username){
                $state.go('teamMemberFeedback.provide',{"tmusername":$stateParams.username});
              }
              else{
                $state.go('feedback.provide');
              }
           // $state.go('feedback.provide');
          }
        }
      }

      function deleteFeedbackFailed(error)
      {
        vm.isActivityRunning = false;
        vm.activityMessage = '';

        console.log('XHR Request Failed ' + error.data);
      }
    };

    vm.forwardFeedback = function(feedbackObject)
    {
      vm.isActivityRunning = true;
      vm.activityMessage = 'Forwarding Feedback...';

      objectStore.feedback.currentFeedbackObject.set(feedbackObject);

      feedbackObject.feedbackStatus = 'COMPLETE';
      feedbackObject.saveSatus = 'SUBMIT';

      // Keeping mode as provide as we have to use PUT operation on RESPONSE feedback service
      // This is the default mode as the operation is also provide.
      dataservice.requestNewFeedback(feedbackObject, 'provide')
                .then(requestNewFeedbackComplete)
                .catch(requestNewFeedbackFailed);

      function requestNewFeedbackComplete(response) {

            if (response.status === 200 || response.status === 201) {
                if(typeof response.data !== undefined) {

                  // Success message customisation based on the type.
                    if(vm.feedbackMode === 'request')
                    {
                      growl.success('Feedback has been Requested.');
                    } else if(vm.feedbackMode === 'provide')
                    {
                      growl.success('Feedback has been Provided.');
                    } else if(vm.feedbackMode === 'requestUser')
                    {
                      growl.success('Feedback has been Requested for the user.');
                    } else if(vm.feedbackMode === 'unrequested')
                    {
                      growl.success('Feedback has been Provided.');
                    } else if(vm.feedbackMode === 'requestTeam')
                    {
                      if(vm.teamFeedbackType === 'team')
                      {
                        growl.success('Feedback for team has been requested.');
                      } else if(vm.teamFeedbackType === 'individual')
                      {
                        growl.success('Feedback for individual has been requested.');
                      }
                    } else if(vm.feedbackMode === 'forward')
                    {
                      growl.success('Feedback has been Forwarded.');
                    }else
                    {
                      growl.success('Your response is registered.');
                    }


                    vm.convID = response.data.id;
                    vm.feedbackObjectResponse = response.data;

                    objectStore.feedback.currentFeedbackObject.set(vm.feedbackObjectResponse);
                    if($stateParams.username){
                      $state.go('teamMemberFeedback.viewFeedback',{"tmusername":$stateParams.username});
                    }
                    else{
                      $state.go('feedback.viewFeedback');
                    }
                   // $state.go('feedback.viewFeedback');
                }
                vm.isActivityRunning = false;
                vm.activityMessage = '';
            }
            return response;
        }


        function requestNewFeedbackFailed(error) {
          console.log("XHR Request failed " + error.data);
          vm.isActivityRunning = false;
          vm.activityMessage = '';
          growl.error("Error requesting the feedback.");
        }
    };

    vm.provideFeedback = function(feedbackObject)
    {
      // Doubly Check - set the current feedback object to the incoming feeback object from the button
      //alert(JSON.stringify(feedbackObject));
      objectStore.feedback.currentFeedbackObject.set(feedbackObject);

      // Take the user to provide feedback page
      if($stateParams.username){
        $state.go('teamMemberFeedback.provideFeedback',{"tmusername":$stateParams.username});
      }
      else{
        $state.go('feedback.provideFeedback');
      }
      // $state.go('feedback.provideFeedback');
    };
    
    if(vm.currentFeedbackObject.feedbackAbout !== '')
    {
      vm.getFeedbackAboutFullName(vm.currentFeedbackObject.feedbackAbout);
    }
    
    if(vm.currentFeedbackObject.provider !== '')
    {
      vm.getFeedbackProviderFullName(vm.currentFeedbackObject.provider);
    }
  }

})();