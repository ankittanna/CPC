(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcFeedback', cpcFeedback)
    .directive('ngDelay', ['$timeout', ngDelay]);

  /* @ngInject */
  function cpcFeedback() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcFeedback/cpcFeedback.html',
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


  function ngDelay($timeout) {
    return {
      restrict: 'A',
      scope: true,
      compile: function(element, attributes) {
        var expression = attributes['ngChange'];
        if (!expression)
          return;

        var ngModel = attributes['ngModel'];
        if (ngModel) attributes['ngModel'] = '$parent.' + ngModel;
        attributes['ngChange'] = '$$delay.execute()';

        return {
          post: function(scope, element, attributes) {
            scope.$$delay = {
              expression: expression,
              delay: scope.$eval(attributes['ngDelay']),
              execute: function() {
                var state = scope.$$delay;
                state.then = Date.now();
                $timeout(function() {
                  if (Date.now() - state.then >= state.delay)
                    scope.$parent.$eval(expression);
                }, state.delay);
              }
            };
          }
        }
      }
    };
  }
  /* @ngInject */
  function Controller(_,$log, $translate, $scope, $modal, $window, $state, $attrs, localStorageService, objectStore, FileUploader, employeeDetails, growl, $stateParams, dataservice, dateTimeService) {

    var vm = this;

        vm.convID="";
        vm.feedbackUsernamesArray = [];
        vm.context = "SELF";
        vm.uploader = new FileUploader();
        vm.uploader.removeAfterUpload = true;

        // Enable Disable Button Flags during Ajax Requests
        vm.isDraftButtonDisabled = 'false';
        vm.isProvideButtonDisabled = 'false';
        vm.isRequestButtonDisabled = 'false';

        // Enable Disable Button Flags
        vm.cancelPossible = 'false';
        vm.saveDraftPossible = 'false';
        vm.requestPossible = 'false';
        vm.providePossible = 'false';


        // Is Draft Button Visible
        vm.isDraftButtonVisible = false;
        vm.isDraftButtonVisible = $state.is('feedback.provideFeedback') || $state.is('teamMemberFeedback.provideFeedback');

        // This gets the context of the username with the fall back to logged in user
        vm.feedbackContextUserName = objectStore.feedback.feedbackContextUsername.get();
        if(vm.feedbackContextUserName === null || typeof vm.feedbackContextUserName === 'undefined' || vm.feedbackContextUserName === '')
        {
          vm.feedbackContextUserName = localStorageService.get("loggedInUser").username;
        }

        vm.setActionBtnsProperty = function(btnState){
          vm.cancelPossible = btnState;
          vm.saveDraftPossible = btnState;
          vm.requestPossible = btnState;
          vm.providePossible = btnState;

         // alert(btnState);

          vm.btnEnable = !vm.btnEnable;
        };

        // Enable Disable Switches
        vm.enable = 'true';
        vm.disable = 'false'
        vm.setActionBtnsProperty(vm.enable);

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
          if(objectStore.appCommonData.fileTypeAttchmentSupported.get(fileType) === true){
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
            if(vm.requestTypeMultiple === true)
            {
              item.url = syncapp.context + "/api/feedback/multipeFeedbackAttachment?ids="+vm.convID+"&context="+vm.context;
            } else
            {
              item.url = syncapp.context + "/api/feedback/feedbackAttachment?id="+vm.convID+"&context="+vm.context;
            }
        };

        vm.uploader.onSuccessItem = function(item, response, status, headers){
            if(vm.uploader.getNotUploadedItems()== ""){
                console.log("vm.saveDraftClicked "+vm.saveDraftClicked);
                vm.setActionBtnsProperty(vm.enable);
                if(vm.saveDraftClicked == true){
                    console.log("draftclick true");
                    objectStore.feedback.currentFeedbackObject.set(response[0].serverdata);
                    vm.saveDraftClicked = false;
                    vm.showAttachments = true;
                    vm.attachmentId = response[0].serverdata.attachment_id;
                    consoe.log("vm.attachmentId", vm.attachmentId);
                }
                else{
                    objectStore.feedback.currentFeedbackObject.set(response[0].serverdata);
                    if($stateParams.username){
                      $state.go('teamMemberFeedback.viewFeedback',{"tmusername":$stateParams.username});
                    }
                    else{
                      $state.go('feedback.viewFeedback');
                    }
                    // $state.go('feedback.viewFeedback');
                }
            }
        }

        vm.uploader.onErrorItem = function(item, response, status, headers){
            vm.setActionBtnsProperty(vm.enable);
            console.log("############### error item function ###########");
            console.log(response);
        }

        // Activity Loader
        vm.isActivityRunning = false;
        vm.activityMessage = '';

    // Feedback Server Response
    vm.feedbackObjectResponse = null;

    vm.searchedUsers = [];
    /*Mode: request provide unrequested new*/
    vm.feedbackMode = $attrs.mode;

    vm.isToFieldVisible = function()
    {
      if(vm.feedbackMode === 'provide' || vm.feedbackMode === 'requestUser')
      {
        return false;
      } else
      {
        return true;
      }
    };

    // Trigger this only when in respond time
    vm.respondTimeFeedbackAboutUsername = '';
    vm.respondTimeFeedbackAboutFullname = '';
    vm.respondTimeFeedbackTitle = '';
    if(vm.feedbackMode === 'provide')
    {
      var currentFeedbackObject = objectStore.feedback.currentFeedbackObject.get();
      vm.respondTimeFeedbackAboutUsername = currentFeedbackObject.feedbackAbout;

      employeeDetails.getUserFullName(vm.respondTimeFeedbackAboutUsername).then(function(fullName) {
        vm.respondTimeFeedbackAboutFullname = fullName;
      });

      vm.respondTimeFeedbackTitle = currentFeedbackObject.title;
    } else if(vm.feedbackMode === 'requestUser')
    {
      vm.respondTimeFeedbackAboutUsername = objectStore.feedback.viewAllFeedbackUsername.get();
       employeeDetails.getUserFullName(vm.respondTimeFeedbackAboutUsername).then(function(fullName) {
        vm.respondTimeFeedbackAboutFullname = fullName;
      });

    }

    // showing the visible title
    vm.isTitleInputVisible = vm.isToFieldVisible() || (vm.feedbackMode === 'requestUser');

    // alert(vm.isTitleInputVisible);
    // Feedback Object Construction:

    // Mode: Provide.PENDING/Request/Unrequested
    // Use a Blank Template object and fill in with the logged in user details

    // Mode Provide.DRAFT then get the object from local storage
    // vm.feedbackObject;

    // PROPERTY: requester, feedbackAbout - Feedback Owner
    vm.feedbackRequestedBy = localStorageService.get("loggedInUser").username;
    employeeDetails.getUserFullName(vm.feedbackRequestedBy).then(function(fullName) {
      vm.feedbackRequestedByFullName = fullName;
    });

    vm.feedbackRequester = vm.feedbackRequestedBy;

    vm.currentDate = dateTimeService.getCurrentDate();
    vm.currentTime = dateTimeService.getCurrentTime();

    vm.feedbackType = '';

    // PROPERTY: type Set feedback type
    if (vm.feedbackMode === 'request') {
      vm.feedbackType = 'Request';
      vm.feedbackShareWithEmployee = true;
    } else if (vm.feedbackMode === 'unrequested') {
      vm.feedbackType = 'UnRequest';
      //alert(vm.feedbackType + ' ' + vm.feedbackShareWithEmployee);
      // To be changed based on checkbox value
      // vm.feedbackShareWithEmployee = true;
    } else if(vm.feedbackMode === 'requestTeam')
    {
      vm.feedbackType = 'Request';
      vm.feedbackShareWithEmployee = true;
    }

    vm.feedbackAbout = vm.feedbackContextUserName;

    employeeDetails.getUserFullName(vm.feedbackContextUserName).then(function(fullName) {
      vm.feedbackAboutFullName = fullName;
    });

    // PROPERTY: title, fill from vm.feedbackTitle
    vm.feedbackTitle = '';

    // PROPERTY: provider, fill from vm.feedbackProvider List
    vm.searchString = vm.feedbackProvider = '';

    vm.feedbackProviderList = [];
    vm.feedbackProviderListFulName = [];
    vm.feedbackFY = dateTimeService.getCurrentYear(vm.currentDate);
    vm.feedbackQtr = dateTimeService.getCurrentQtr(vm.currentDate);


    // SERVICE: search user name
    vm.tags = [];

    // DRAFT OBJECT FEEDBACK SCENARIO
    if(vm.feedbackMode === 'request')
    {
      var currentFeedbackObject = objectStore.feedback.currentFeedbackObject.get();
      if(currentFeedbackObject !== null)
      {
          if(currentFeedbackObject.feedbackStatus === 'DRAFT' && currentFeedbackObject.saveSatus === 'DRAFT')
            {
              //alert("LOAD THIS JSON "+JSON.stringify(currentFeedbackObject));
              //console.log("LOAD THIS JSON "+JSON.stringify(currentFeedbackObject));
              vm.feedbackTitle = currentFeedbackObject.title;
              //tinyMCE.activeEditor.setContent(currentFeedbackObject.description);

              if(currentFeedbackObject.provider !== '')
              {
                vm.feedbackProvider = currentFeedbackObject.provider;
              } else if(currentFeedbackObject.provider === '' && currentFeedbackObject.providerList.length > 0)
              {
                vm.feedbackProvider = '';
                for(var i = 0; i < currentFeedbackObject.providerList.length; i++)
                {
                  vm.feedbackProvider += currentFeedbackObject.providerList[i] + '; '
                }
              } else if(currentFeedbackObject.provider === '' &&  currentFeedbackObject.providerList.length === 0)
              {
                vm.feedbackProvider = '';
              }

              if(currentFeedbackObject.type === 'Request')
              {
                if(currentFeedbackObject.hasOwnProperty('FeedbackIdList'))
                {
                  //alert('yeah 11');
                } else 
                {
                  //alert('yeah 22');
                }

                if(currentFeedbackObject.provider !== '')
                {
                  vm.tags = [{'username': currentFeedbackObject.provider}];
                } else if(currentFeedbackObject.provider === '')
                {
                  if(currentFeedbackObject.providerList.length > 0)
                  {
                    vm.tags = currentFeedbackObject.providerList.map(function(person, index, array){
                      return {'username': currentFeedbackObject.providerList[index]};
                    });
                  } else if(currentFeedbackObject.feedbackProviderList.length === 0)
                  {
                    vm.tags = [];
                  }
                }
              } else if(currentFeedbackObject.type === 'UnRequest')
              {
                  if(currentFeedbackObject.feedbackAbout !== '')
                  {
                    vm.tags = [{'username': currentFeedbackObject.feedbackAbout}];
                  } else if(currentFeedbackObject.feedbackAbout === '')
                  {
                    if(currentFeedbackObject.feedbackAboutList.length > 0)
                    {
                      vm.tags = currentFeedbackObject.feedbackAboutList.map(function(person, index, array){
                      return {'username': currentFeedbackObject.feedbackAboutList[index]};
                    });
                    } else if(currentFeedbackObject.feedbackAboutList.length === 0)
                    {
                      vm.tags = [];
                    }
                  }
              } 
            }
      }
    }

    vm.loadTags = function($query) {
      return dataservice.getSearchedUsers($query)
        .then(getSearchedUsersComplete)
        .catch(getSearchedUsersFailed);

      function getSearchedUsersComplete(respondedData) {
        return respondedData;
      }

      function getSearchedUsersFailed(error) {
        console.log('XHR Failed for getSearchedUsersFailed' + error.data);
      }
    };

    vm.tagsRemoved = function(){
      console.log(_.uniq(_.pluck(vm.tags, 'username')));
    };

    vm.requestFeedback = function(feedbackMode) {
      vm.isActivityRunning = true;
      vm.activityMessage = 'Requesting...';

      // Disable Button
      vm.isProvideButtonDisabled = 'true';

      // Disable Button
      vm.isRequestButtonDisabled = 'true';

      // Switch Button State to Disable till the HTTP req is succes/failure
      vm.setActionBtnsProperty(vm.disable);

      // Setting Req Type Multiple Flag as false
      vm.requestTypeMultiple = false;

      var feedbackProviderArray = vm.feedbackProvider.split(';');
      feedbackProviderArray = feedbackProviderArray.map(function(item, index, array) {
        return item.trim();
      });


      if(vm.feedbackMode === 'request')
      {
      if ((_.uniq(_.pluck(vm.tags, 'username'))).length == 1) {
        vm.feedbackProviderUsername = (_.uniq(_.pluck(vm.tags, 'username')))[0];
        vm.requestFeedbackObject = {
          "title": vm.feedbackTitle,
          "type": vm.feedbackType,
          "feedbackAbout": vm.feedbackAbout,
          "provider": vm.feedbackProviderUsername,
          "requester": vm.feedbackRequestedBy,
          "description": tinymce.activeEditor.getContent({
            format: 'raw'
          }),
          "fy": vm.feedbackFY,
          "quarter": vm.feedbackQtr,
          "requested_by": vm.feedbackRequestedBy,
          "tag": [],
          "feedbackStatus": "PENDING",
          "saveSatus": "SUBMIT",
          "sharewithemp": vm.feedbackShareWithEmployee,
          "response_type": "",
          "questionnare_id": "",
          "feedbackResponse": "",
          "mgrComments": "",
          "sendReminderLists": [{
            "sendReminderFlag": "",
            "reminderSendBy": ""
          }],
          "providerList": [],
          "feedbackAboutList": []
        };
      } else if ((_.uniq(_.pluck(vm.tags, 'username'))).length > 1) {
        vm.requestFeedbackObject = {
          "title": vm.feedbackTitle,
          "type": vm.feedbackType,
          "feedbackAbout": vm.feedbackAbout,
          "provider": "",
          "requester": vm.feedbackRequestedBy,
          "description": tinymce.activeEditor.getContent({
            format: 'raw'
          }),
          "fy": vm.feedbackFY,
          "quarter": vm.feedbackQtr,
          "requested_by": vm.feedbackRequestedBy,
          "tag": [],
          "feedbackStatus": "PENDING",
          "saveSatus": "SUBMIT",
          "sharewithemp": vm.feedbackShareWithEmployee,
          "response_type": "",
          "questionnare_id": "",
          "feedbackResponse": "",
          "mgrComments": "",
          "sendReminderLists": [{
            "sendReminderFlag": "",
            "reminderSendBy": ""
          }],
          "providerList": (_.uniq(_.pluck(vm.tags, 'username'))),
          "feedbackAboutList": []
        };
      }
    } else if(vm.feedbackMode === 'requestUser')
    {
      vm.requestFeedbackObject = {
          "title": vm.feedbackTitle,
          "type": vm.feedbackType,
          "feedbackAbout": vm.feedbackAbout,
          "provider": vm.respondTimeFeedbackAboutUsername,
          "requester": vm.feedbackRequestedBy,
          "description": tinymce.activeEditor.getContent({
            format: 'raw'
          }),
          "fy": vm.feedbackFY,
          "quarter": vm.feedbackQtr,
          "requested_by": vm.feedbackRequestedBy,
          "tag": [],
          "feedbackStatus": "PENDING",
          "saveSatus": "SUBMIT",
          "sharewithemp": vm.feedbackShareWithEmployee,
          "response_type": "",
          "questionnare_id": "",
          "feedbackResponse": "",
          "mgrComments": "",
          "sendReminderLists": [{
            "sendReminderFlag": "",
            "reminderSendBy": ""
          }],
          "providerList": [],
          "feedbackAboutList": []
        };
    } else if(vm.feedbackMode === 'requestTeam')
    {
      if(vm.teamFeedbackType === 'team')
      {
          if((_.uniq(_.pluck(vm.tags, 'username'))).length === 1)
          {
            vm.feedbackProviderUsername = (_.uniq(_.pluck(vm.tags, 'username')))[0];
            vm.requestFeedbackObject = {
            "title": vm.feedbackTitle,
            "type": vm.feedbackType,
            "feedbackAbout": "",
            "provider": vm.feedbackProviderUsername,
            "requester": vm.feedbackRequestedBy,
            "description": tinymce.activeEditor.getContent({
              format: 'raw'
            }),
            "fy": vm.feedbackFY,
            "quarter": vm.feedbackQtr,
            "requested_by": vm.feedbackRequestedBy,
            "tag": [],
            "feedbackStatus": "PENDING",
            "saveSatus": "SUBMIT",
            "sharewithemp": vm.feedbackShareWithEmployee,
            "response_type": "",
            "questionnare_id": "",
            "feedbackResponse": "",
            "mgrComments": "",
            "sendReminderLists": [{
              "sendReminderFlag": "",
              "reminderSendBy": ""
            }],
            "providerList": [],
            "feedbackAboutList": vm.teamFeedbackAboutList
          };
        } else if((_.uniq(_.pluck(vm.tags, 'username'))).length > 1)
        {
          vm.requestFeedbackObject = {
            "title": vm.feedbackTitle,
            "type": vm.feedbackType,
            "feedbackAbout": "",
            "provider": "",
            "requester": vm.feedbackRequestedBy,
            "description": tinymce.activeEditor.getContent({
              format: 'raw'
            }),
            "fy": vm.feedbackFY,
            "quarter": vm.feedbackQtr,
            "requested_by": vm.feedbackRequestedBy,
            "tag": [],
            "feedbackStatus": "PENDING",
            "saveSatus": "SUBMIT",
            "sharewithemp": vm.feedbackShareWithEmployee,
            "response_type": "",
            "questionnare_id": "",
            "feedbackResponse": "",
            "mgrComments": "",
            "sendReminderLists": [{
              "sendReminderFlag": "",
              "reminderSendBy": ""
            }],
            "providerList": (_.uniq(_.pluck(vm.tags, 'username'))),
            "feedbackAboutList": vm.teamFeedbackAboutList
          };
        }
      } else if(vm.teamFeedbackType === 'individual')
      {
        if((_.uniq(_.pluck(vm.tags, 'username'))).length === 1)
        {
            vm.feedbackProviderUsername = (_.uniq(_.pluck(vm.tags, 'username')))[0];
            vm.requestFeedbackObject = {
            "title": vm.feedbackTitle,
            "type": vm.feedbackType,
            "feedbackAbout": vm.teamFeedbackAbout,
            "provider": vm.feedbackProviderUsername,
            "requester": vm.feedbackRequestedBy,
            "description": tinymce.activeEditor.getContent({
              format: 'raw'
            }),
            "fy": vm.feedbackFY,
            "quarter": vm.feedbackQtr,
            "requested_by": vm.feedbackRequestedBy,
            "tag": [],
            "feedbackStatus": "PENDING",
            "saveSatus": "SUBMIT",
            "sharewithemp": vm.feedbackShareWithEmployee,
            "response_type": "",
            "questionnare_id": "",
            "feedbackResponse": "",
            "mgrComments": "",
            "sendReminderLists": [{
              "sendReminderFlag": "",
              "reminderSendBy": ""
            }],
            "providerList": [],
            "feedbackAboutList": []
          };
        } else if((_.uniq(_.pluck(vm.tags, 'username'))).length > 1)
        {
          vm.requestFeedbackObject = {
            "title": vm.feedbackTitle,
            "type": vm.feedbackType,
            "feedbackAbout": '',
            "provider": vm.feedbackProviderUsername,
            "requester": vm.feedbackRequestedBy,
            "description": tinymce.activeEditor.getContent({
              format: 'raw'
            }),
            "fy": vm.feedbackFY,
            "quarter": vm.feedbackQtr,
            "requested_by": vm.feedbackRequestedBy,
            "tag": [],
            "feedbackStatus": "PENDING",
            "saveSatus": "SUBMIT",
            "sharewithemp": vm.feedbackShareWithEmployee,
            "response_type": "",
            "questionnare_id": "",
            "feedbackResponse": "",
            "mgrComments": "",
            "sendReminderLists": [{
              "sendReminderFlag": "",
              "reminderSendBy": ""
            }],
            "providerList": (_.uniq(_.pluck(vm.tags, 'username'))),
            "feedbackAboutList": [vm.teamFeedbackAbout]
          };
        }
      }
    }

      if (vm.validateFields()) {
        console.log('service Request', (_.uniq(_.pluck(vm.tags, 'username'))));

        if(vm.feedbackMode === 'requestTeam')
        {
            if ((_.uniq(_.pluck(vm.tags, 'username'))).length === 1) {
              if(vm.teamFeedbackType === 'individual')
              {
                //alert("individual");
                dataservice.requestNewFeedback(vm.requestFeedbackObject, feedbackMode)
                .then(requestNewFeedbackComplete)
                .catch(requestNewFeedbackFailed);
              } else if(vm.teamFeedbackType === 'team')
              {
                //alert("team");
                dataservice.requestNewFeedbackMultipleTeam(vm.requestFeedbackObject, feedbackMode)
                .then(requestNewFeedbackMultipleTeamComplete)
                .catch(requestNewFeedbackMultipleTeamFailed);
              }

            } else if ((_.uniq(_.pluck(vm.tags, 'username'))).length > 1) {
              /*if(vm.teamFeedbackType === 'individual')
              {
                feedbackMode = 'requestTeam';
              } else if(vm.teamFeedbackType === 'team')
              {
                feedbackMode = 'requestTeam';
              }*/
              dataservice.requestNewFeedbackMultipleTeam(vm.requestFeedbackObject, feedbackMode)
                .then(requestNewFeedbackMultipleTeamComplete)
                .catch(requestNewFeedbackMultipleTeamFailed);
            } else if ((_.uniq(_.pluck(vm.tags, 'username'))).length === 0) {
              //alert("******** 4");
              if (vm.feedbackMode !== 'provide') {
                vm.setActionBtnsProperty(vm.enable);
                growl.error("Enter atleast one Feedback Provider.");
                vm.isActivityRunning = false;
                vm.activityMessage = '';
              }
            }
        } else
        {
            vm.draftFeedbackObject = objectStore.feedback.draftFeedbackObject.get();
            vm.currentFeedbackObject = objectStore.feedback.currentFeedbackObject.get();

            if(vm.draftFeedbackObject !== null && vm.draftFeedbackObject !== undefined && vm.draftFeedbackObject.feedbackStatus === 'DRAFT')
            {
              feedbackMode = 'provide';
              
              vm.currentFeedbackObject.feedbackStatus = 'PENDING';
              vm.currentFeedbackObject.saveSatus = 'SUBMIT';

              vm.currentFeedbackObject.title = vm.requestFeedbackObject.title;
              vm.currentFeedbackObject.description = vm.requestFeedbackObject.description;
              vm.currentFeedbackObject.sharewithemp = vm.requestFeedbackObject.sharewithemp;

              vm.requestFeedbackObject = vm.currentFeedbackObject;

            } else 
            {
              feedbackMode = feedbackMode;
            }

            if ((_.uniq(_.pluck(vm.tags, 'username'))).length === 1) {
              dataservice.requestNewFeedback(vm.requestFeedbackObject, feedbackMode)
                .then(requestNewFeedbackComplete)
                .catch(requestNewFeedbackFailed);
            } else if ((_.uniq(_.pluck(vm.tags, 'username'))).length > 1) {
              dataservice.requestNewFeedbackMultipleTeam(vm.requestFeedbackObject, feedbackMode)
                .then(requestNewFeedbackMultipleTeamComplete)
                .catch(requestNewFeedbackMultipleTeamFailed);
            } else if ((_.uniq(_.pluck(vm.tags, 'username'))).length === 0) {
              //alert("******** 1");
              if (vm.feedbackMode !== 'provide') {
                vm.setActionBtnsProperty(vm.enable);
                growl.error("Enter atleast one Feedback Provider.");
                vm.isActivityRunning = false;
                vm.activityMessage = '';
              }
            }
        }

      } else {
        vm.setActionBtnsProperty(vm.enable);
        growl.error('Please enter missing details.');
        vm.isActivityRunning = false;
        vm.activityMessage = '';
      }

    };

    function requestNewFeedbackMultipleTeamComplete(response)
    {
      // Enable Button
      vm.isProvideButtonDisabled = 'false';

      // Enable Button
      vm.isRequestButtonDisabled = 'false';

      // Switch button state to enable back again
      vm.setActionBtnsProperty(vm.enable);

            if (response.status === 200 || response.status === 201 && response !== undefined) {
                if(typeof response.data !== undefined) {
                    //growl.success('Feedback has been Requested.');
                    vm.convID = (response.data.FeedbackIdList).join();
                    vm.feedbackObjectResponse = response.data;

                    vm.requestTypeMultiple = true;
                  
                    if(vm.uploader.queue === '' || vm.uploader.queue === undefined || vm.uploader.queue.length === 0){
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
                      } else
                      {
                        growl.success('Feedback is registered.');
                      }

                        vm.setActionBtnsProperty(vm.enable);
                        objectStore.feedback.currentFeedbackObject.set(vm.feedbackObjectResponse);
                        if($stateParams.username){
                          $state.go('teamMemberFeedback.viewFeedback',{"tmusername":$stateParams.username});
                        }
                        else{
                          $state.go('feedback.viewFeedback');
                        }
                       // $state.go('feedback.viewFeedback');
                      } else{
                        vm.uploader.uploadAll();

                        vm.uploader.onCompleteAll = function() {
                            console.info('onCompleteAll');

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
                            } else
                            {
                              growl.success('Feedback is registered.');
                            }

                            vm.setActionBtnsProperty(vm.enable);
                            objectStore.feedback.currentFeedbackObject.set(vm.feedbackObjectResponse);
                            if($stateParams.username){
                              $state.go('teamMemberFeedback.viewFeedback',{"tmusername":$stateParams.username});
                            }
                            else{
                              $state.go('feedback.viewFeedback');
                            }
                        };
                    }
                }
                vm.isActivityRunning = false;
                vm.activityMessage = '';
            } else if(response.status === 203) 
            {
              vm.isActivityRunning = false;
              vm.activityMessage = '';
              growl.error('Error in creating/providing Feedback request.');
            } else
            {
              vm.isActivityRunning = false;
              vm.activityMessage = '';
              growl.error('Error processing your request. Please check the information provided.');
            }
            return response;
    }

    function requestNewFeedbackMultipleTeamFailed(error)
    {
      // Enable Button
      vm.isProvideButtonDisabled = 'false';

      // Enable Button
      vm.isRequestButtonDisabled = 'false';

      // Switch button state to enable back again
      vm.setActionBtnsProperty(vm.enable);
      console.log("XHR Request failed " + error.data);
      vm.isActivityRunning = false;
      vm.activityMessage = '';
      growl.error("Error requesting the feedback.");
    }

        function requestNewFeedbackComplete(response) {
          // console.log(JSON.stringify(response));
          // Enable Button
      vm.isProvideButtonDisabled = 'false';

      // Enable Button
      vm.isRequestButtonDisabled = 'false';

      // Switch button state to enable back again
      vm.setActionBtnsProperty(vm.enable);

            if (response.status === 200 || response.status === 201 && response !== undefined) {
                if(typeof response.data !== undefined) {
                    vm.convID = response.data.id;
                    vm.feedbackObjectResponse = response.data;
                    if(vm.uploader.queue === '' || vm.uploader.queue === undefined || vm.uploader.queue.length === 0){
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
                      } else
                      {
                        growl.success('Feedback is registered.');
                      }

                      vm.setActionBtnsProperty(vm.enable);
                        objectStore.feedback.currentFeedbackObject.set(vm.feedbackObjectResponse);
                        if($stateParams.username){
                          $state.go('teamMemberFeedback.viewFeedback',{"tmusername":$stateParams.username});
                        }
                        else{
                          $state.go('feedback.viewFeedback');
                        }
                       // $state.go('feedback.viewFeedback');
                    }
                    else{
                        vm.uploader.uploadAll();
                        console.log("after upload");

                        vm.uploader.onCompleteAll = function() {
                            console.info('onCompleteAll');

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
                            } else
                            {
                              growl.success('Feedback is registered.');
                            }

                            vm.setActionBtnsProperty(vm.enable);
                            objectStore.feedback.currentFeedbackObject.set(vm.feedbackObjectResponse);
                            if($stateParams.username){
                              $state.go('teamMemberFeedback.viewFeedback',{"tmusername":$stateParams.username});
                            }
                            else{
                              $state.go('feedback.viewFeedback');
                            }
                        };
                    }
                }
                vm.isActivityRunning = false;
                vm.activityMessage = '';
            } else if(response.status === 203) 
            {
              vm.isActivityRunning = false;
              vm.activityMessage = '';
              growl.error('Error in creating/providing Feedback request.');
            } else
            {
              growl.error('Error processing your request. Please check the information provided.');
              vm.isActivityRunning = false;
              vm.activityMessage = '';
            }
            return response;
        }

    function requestNewFeedbackFailed(error) {
      // Enable Button
      vm.isProvideButtonDisabled = 'false';

      // Enable Button
      vm.isRequestButtonDisabled = 'false';

      // Switch button state to enable back again
      vm.setActionBtnsProperty(vm.enable);
      console.log("XHR Request failed " + error.data);
      vm.isActivityRunning = false;
      vm.activityMessage = '';
      growl.error("Error requesting the feedback.");
      
    }

    vm.provideFeedback = function(feedbackMode) {
     // alert(feedbackMode);
      // console.log("Generate Provide Feedback Object");
      if(feedbackMode !== 'unrequested')
      {
        vm.isActivityRunning = true;
        vm.activityMessage = 'Sending Feedback...';
      } else
      {
        vm.isActivityRunning = true;
        vm.activityMessage = 'Sending Feedback...';
      }
      

      // Disable Button
      vm.isProvideButtonDisabled = 'true';

      // Disable Button
      vm.isRequestButtonDisabled = 'true';

      // Switch Button State to Disable till the HTTP req is succes/failure
      vm.setActionBtnsProperty(vm.disable);

      // Setting Req Type Multiple Flag as false
      vm.requestTypeMultiple = false;

      var feedbackProviderArray = vm.feedbackProvider.split(';');
      feedbackProviderArray = feedbackProviderArray.map(function(item, index, array) {
        return item.trim();
      });

      if (feedbackMode === 'provide') {
        var currentFeedbackObject = objectStore.feedback.currentFeedbackObject.get();

       currentFeedbackObject.feedbackStatus = "COMPLETE";
       currentFeedbackObject.saveSatus = "SUBMIT";
       currentFeedbackObject.response_type = "";
       currentFeedbackObject.updated_by = currentFeedbackObject.provider;
        currentFeedbackObject.provider = currentFeedbackObject.provider;
       currentFeedbackObject.tag = [""];
       currentFeedbackObject.sharewithemp = !vm.feedbackShareWithEmployee;
       //currentFeedbackObject.sendReminderLists = null;
       currentFeedbackObject.feedbackResponse = tinymce.activeEditor.getContent({
              format: 'raw'
            });



       currentFeedbackObject.feedbackStatus = "COMPLETE";
          currentFeedbackObject.saveSatus = "SUBMIT";
          currentFeedbackObject.response_type = "";
          currentFeedbackObject.tag = [""];
          currentFeedbackObject.updated_by = currentFeedbackObject.provider;
          currentFeedbackObject.sharewithemp = !vm.feedbackShareWithEmployee;
          currentFeedbackObject.feedbackResponse = tinymce.activeEditor.getContent({
              format: 'raw'
            });

          vm.requestFeedbackObject = currentFeedbackObject;


       /* if (typeof currentFeedbackObject.providerList === 'undefined') {
          alert("Fixed it...");
          currentFeedbackObject.feedbackStatus = "COMPLETE";
          currentFeedbackObject.saveSatus = "SUBMIT";
          currentFeedbackObject.response_type = "";
          currentFeedbackObject.updated_by = currentFeedbackObject.provider;
          currentFeedbackObject.tag = [""];
          currentFeedbackObject.sharewithemp = !vm.feedbackShareWithEmployee;
          currentFeedbackObject.feedbackResponse = tinymce.activeEditor.getContent({
              format: 'text'
            });
          vm.requestFeedbackObject = currentFeedbackObject;

        } else if (currentFeedbackObject.providerList.length > 1) {

          //alert("WHAT I SEND "+JSON.stringify(vm.requestFeedbackObject));
        } */
        vm.requestFeedbackObject = currentFeedbackObject;
        console.log("@@@@@@@@@@@@@@ $$$"+JSON.stringify(vm.requestFeedbackObject));


     //   console.log("@@@@@@@@@@@@@@ NEWWWWWW $$$"+JSON.stringify(vm.requestFeedbackObject));
      } else if(feedbackMode === 'unrequested')
      {
        if ((_.uniq(_.pluck(vm.tags, 'username'))).length == 1) {
          vm.feedbackProviderUsername = (_.uniq(_.pluck(vm.tags, 'username')))[0];
          vm.requestFeedbackObject = {
            "title": vm.feedbackTitle,
            "type": vm.feedbackType,
            "feedbackAbout": vm.feedbackProviderUsername,
            "provider": vm.feedbackAbout,
            "requester": "",
            "description": "",
            "fy": vm.feedbackFY,
            "quarter": vm.feedbackQtr,
            "requested_by": vm.feedbackAbout,
            "tag": [],
            "feedbackStatus": "COMPLETE",
            "saveSatus": "SUBMIT",
            "sharewithemp": !vm.feedbackShareWithEmployee,
            "response_type": "",
            "questionnare_id": "",
            "feedbackResponse": tinymce.activeEditor.getContent({
              format: 'raw'
            }),
            "mgrComments": "",
            "sendReminderLists": [{
              "sendReminderFlag": "",
              "reminderSendBy": ""
            }],
            "providerList": [],
            "feedbackAboutList": []
          };
        } else if ((_.uniq(_.pluck(vm.tags, 'username'))).length > 1) {
          vm.requestFeedbackObject = {
            "title": vm.feedbackTitle,
            "type": vm.feedbackType,
            "feedbackAbout": "",
            "provider": vm.feedbackAbout,
            "requester": "",
            "description": "",
            "fy": vm.feedbackFY,
            "quarter": vm.feedbackQtr,
            "requested_by": vm.feedbackAbout,
            "tag": [],
            "feedbackStatus": "COMPLETE",
            "saveSatus": "SUBMIT",
            "sharewithemp": !vm.feedbackShareWithEmployee,
            "response_type": "",
            "questionnare_id": "",
            "feedbackResponse": tinymce.activeEditor.getContent({
              format: 'raw'
            }),
            "mgrComments": "",
            "sendReminderLists": [{
              "sendReminderFlag": "",
              "reminderSendBy": ""
            }],
            "providerList": [],
            "feedbackAboutList": (_.uniq(_.pluck(vm.tags, 'username')))
          };
        }
      }


      // console.log("********************* UR FEEDBACK " + JSON.stringify(vm.requestFeedbackObject));
      if (vm.validateFields()) {
       
            vm.draftFeedbackObject = objectStore.feedback.draftFeedbackObject.get();
            vm.currentFeedbackObject = objectStore.feedback.currentFeedbackObject.get();

            if(vm.draftFeedbackObject !== null && vm.draftFeedbackObject !== undefined && vm.draftFeedbackObject.feedbackStatus === 'DRAFT')
            {
              feedbackMode = 'provide';
              
              vm.currentFeedbackObject.feedbackStatus = 'COMPLETE';
              vm.currentFeedbackObject.saveSatus = 'SUBMIT';

              vm.currentFeedbackObject.title = vm.requestFeedbackObject.title;
              vm.currentFeedbackObject.description = vm.requestFeedbackObject.description;
              vm.currentFeedbackObject.sharewithemp = vm.requestFeedbackObject.sharewithemp;
              
              vm.requestFeedbackObject = vm.currentFeedbackObject;

            } else 
            {
              feedbackMode = feedbackMode;
            }

       // growl.info(JSON.stringify((_.uniq(_.pluck(vm.tags, 'username')))));
        if ((_.uniq(_.pluck(vm.tags, 'username'))).length === 1) {
          dataservice.requestNewFeedback(vm.requestFeedbackObject, vm.feedbackMode)
            .then(requestNewFeedbackComplete)
            .catch(requestNewFeedbackFailed);
        } else if ((_.uniq(_.pluck(vm.tags, 'username'))).length > 1) {
          dataservice.requestNewFeedbackMultipleTeam(vm.requestFeedbackObject, vm.feedbackMode)
            .then(requestNewFeedbackMultipleTeamComplete)
            .catch(requestNewFeedbackMultipleTeamFailed);
        } else if ((_.uniq(_.pluck(vm.tags, 'username'))).length === 0) {
          //alert("******** 2");
          if (vm.feedbackMode !== 'provide') {
            vm.setActionBtnsProperty(vm.enable);
            growl.error("Enter atleast one Feedback Provider.");
            vm.isActivityRunning = false;
            vm.activityMessage = '';
          }
          if (vm.feedbackMode === 'provide')
          {
              dataservice.requestNewFeedback(vm.requestFeedbackObject, vm.feedbackMode)
              .then(requestNewFeedbackComplete)
              .catch(requestNewFeedbackFailed);
          }

        }
      } else {
        vm.setActionBtnsProperty(vm.enable);
        growl.error('Please enter missing details.');
        vm.isActivityRunning = false;
        vm.activityMessage = '';
      }
    };

    vm.saveProvidedFeedbackAsDraft = function() {
      vm.isActivityRunning = true;
      vm.activityMessage = 'Saving...';

      // Disable Button
      vm.isDraftButtonDisabled = 'true';

      // Switch Button State to Disable till the HTTP req is succes/failure
      vm.setActionBtnsProperty(vm.disable);

      // Create Drafted object from the existing current feedback object
      vm.draftFeedbackObject = objectStore.feedback.currentFeedbackObject.get();

      vm.draftFeedbackObject.sharewithemp = vm.feedbackShareWithEmployee;
      vm.draftFeedbackObject.feedbackResponse = tinymce.activeEditor.getContent({
                format: 'raw'
              });
      vm.draftFeedbackObject.feedbackStatus = 'PENDING';
      vm.draftFeedbackObject.saveSatus = 'DRAFT';

      vm.requestFeedbackObject = vm.draftFeedbackObject;

      if(tinymce.activeEditor.getContent({
          format: 'text'
        }).trim().indexOf("Enter Feedback Details") == 0 || tinymce.activeEditor.getContent({
          format: 'text'
        }).trim().length <= 0)
      {
        vm.isActivityRunning = false;
        vm.activityMessage = '';
        vm.setActionBtnsProperty(vm.enable);
        growl.error('Please enter details.');
      } else 
      {
        dataservice.updateFeedback(vm.requestFeedbackObject)
                .then(draftNewFeedbackComplete)
                .catch(draftNewFeedbackFailed);
      }
    };

    vm.saveFeedbackAsDraft = function() {
      vm.isActivityRunning = true;
      vm.activityMessage = 'Saving...';

      // Disable Button
      vm.isDraftButtonDisabled = 'true';

      // Setting Req Type Multiple Flag as false
      vm.requestTypeMultiple = 'false';

      // Switch Button State to Disable till the HTTP req is succes/failure
      vm.setActionBtnsProperty(vm.disable);

      var feedbackProviderArray = vm.feedbackProvider.split(';');
      feedbackProviderArray = feedbackProviderArray.map(function(item, index, array) {
        return item.trim();
      });

      // Get the drafted feedback object if the current feedback is already drafted
      vm.draftFeedbackObject = objectStore.feedback.draftFeedbackObject.get();

      // Switch the object structuring based on the availability of the object
      if(vm.draftFeedbackObject !== null && vm.draftFeedbackObject !== undefined && vm.draftFeedbackObject.feedbackStatus === 'DRAFT')
      {
        // Take the drafted object from the store and update it with the latest content
        // Properties to be taken - title, description, fy, qtr, description, users
        if((_.uniq(_.pluck(vm.tags, 'username'))).length === 1)
        {
          // If there is only one person in To field
          if(vm.feedbackMode === 'request' || vm.feedbackMode === 'requestUser' || vm.feedbackMode === 'requestTeam')
          {
            // Type of fb is Simple Request, specific user request, team fb request
            vm.feedbackProviderUsername = (_.uniq(_.pluck(vm.tags, 'username')))[0];

            vm.draftFeedbackObject.title = vm.feedbackTitle;
            vm.draftFeedbackObject.feedbackAbout = vm.feedbackAbout;
            vm.draftFeedbackObject.provider = vm.feedbackProviderUsername;
            vm.draftFeedbackObject.description =  tinymce.activeEditor.getContent({
                format: 'raw'
              });
            vm.draftFeedbackObject.sharewithemp = vm.feedbackShareWithEmployee;

          } else if(vm.feedbackMode === 'unrequested')
          {
            // Type of request is unrequested
            vm.feedbackProviderUsername = (_.uniq(_.pluck(vm.tags, 'username')))[0];

            vm.draftFeedbackObject.title = vm.feedbackTitle;
            vm.draftFeedbackObject.feedbackAbout = vm.feedbackProviderUsername;
            vm.draftFeedbackObject.provider = vm.feedbackRequestedBy;
            vm.draftFeedbackObject.requester = '';
            vm.draftFeedbackObject.requested_by = '';
            vm.draftFeedbackObject.description =  tinymce.activeEditor.getContent({
                format: 'raw'
              });
            vm.draftFeedbackObject.sharewithemp = vm.feedbackShareWithEmployee;
          }
        } else if((_.uniq(_.pluck(vm.tags, 'username'))).length > 1)
        {
          // If there are multiple people in the to field
          if(vm.feedbackMode === 'request' || vm.feedbackMode === 'requestUser' || vm.feedbackMode === 'requestTeam')
          {
            // Type of fb is Simple Request, specific user request, team fb request
            vm.draftFeedbackObject.title = vm.feedbackTitle;
            vm.draftFeedbackObject.feedbackAbout = vm.feedbackProviderUsername;
            vm.draftFeedbackObject.provider = '';
            vm.draftFeedbackObject.description =  tinymce.activeEditor.getContent({
                format: 'raw'
              });
            vm.draftFeedbackObject.sharewithemp = vm.feedbackShareWithEmployee;
            vm.draftFeedbackObject.providerList = (_.uniq(_.pluck(vm.tags, 'username')));
          } else if(vm.feedbackMode === 'unrequested')
          {
            // Type of request is unrequested
            vm.draftFeedbackObject.title = vm.feedbackTitle;
            vm.draftFeedbackObject.feedbackAbout = '';
            vm.draftFeedbackObject.provider = vm.feedbackRequestedBy;
            vm.draftFeedbackObject.requester = '';
            vm.draftFeedbackObject.requested_by = '';
            vm.draftFeedbackObject.description =  tinymce.activeEditor.getContent({
                format: 'raw'
              });
            vm.draftFeedbackObject.sharewithemp = vm.feedbackShareWithEmployee;
            vm.draftFeedbackObject.feedbackAboutList = (_.uniq(_.pluck(vm.tags, 'username')));
          }
        }

        vm.requestFeedbackObject = vm.draftFeedbackObject;
      } else
      {
        // Construct the drafted object freshly
        if((_.uniq(_.pluck(vm.tags, 'username'))).length === 1)
        {
          // If there is only one person in To field
          if(vm.feedbackMode === 'request' || vm.feedbackMode === 'requestUser' || vm.feedbackMode === 'requestTeam')
          {
            // Type of fb is Simple Request, specific user request, team fb request
            vm.feedbackProviderUsername = (_.uniq(_.pluck(vm.tags, 'username')))[0];
            vm.requestFeedbackObject = {
              "title": vm.feedbackTitle,
              "type": vm.feedbackType,
              "feedbackAbout": vm.feedbackAbout,
              "provider": vm.feedbackProviderUsername,
              "requester": vm.feedbackRequestedBy,
              "description": tinymce.activeEditor.getContent({
                format: 'raw'
              }),
              "fy": vm.feedbackFY,
              "quarter": vm.feedbackQtr,
              "requested_by": vm.feedbackRequestedBy,
              "tag": [],
              "feedbackStatus": "DRAFT",
              "saveSatus": "DRAFT",
              "sharewithemp": vm.feedbackShareWithEmployee,
              "response_type": "",
              "questionnare_id": "",
              "feedbackResponse": "",
              "mgrComments": "",
              "sendReminderLists": [{
                "sendReminderFlag": "",
                "reminderSendBy": ""
              }],
              "providerList": [],
              "feedbackAboutList": []
            };
          } else if(vm.feedbackMode === 'unrequested')
          {
            // Type of request is unrequested
            vm.feedbackProviderUsername = (_.uniq(_.pluck(vm.tags, 'username')))[0];
            vm.requestFeedbackObject = {
              "title": vm.feedbackTitle,
              "type": vm.feedbackType,
              "feedbackAbout": vm.feedbackProviderUsername,
              "provider": vm.feedbackRequestedBy,
              "requester": "",
              "description": "",
              "fy": vm.feedbackFY,
              "quarter": vm.feedbackQtr,
              "requested_by": "",
              "tag": [],
              "feedbackStatus": "DRAFT",
              "saveSatus": "DRAFT",
              "sharewithemp": vm.feedbackShareWithEmployee,
              "response_type": "",
              "questionnare_id": "",
              "feedbackResponse": tinymce.activeEditor.getContent({
                format: 'raw'
              }),
              "mgrComments": "",
              "sendReminderLists": [{
                "sendReminderFlag": "",
                "reminderSendBy": ""
              }],
              "providerList": [],
              "feedbackAboutList": []
            };
          }
        } else if((_.uniq(_.pluck(vm.tags, 'username'))).length > 1)
        {
          // If there are multiple people in the to field
          if(vm.feedbackMode === 'request' || vm.feedbackMode === 'requestUser' || vm.feedbackMode === 'requestTeam')
          {
            // Type of fb is Simple Request, specific user request, team fb request
            vm.requestFeedbackObject = {
              "title": vm.feedbackTitle,
              "type": vm.feedbackType,
              "feedbackAbout": vm.feedbackAbout,
              "provider": "",
              "requester": vm.feedbackRequestedBy,
              "description": tinymce.activeEditor.getContent({
                format: 'raw'
              }),
              "fy": vm.feedbackFY,
              "quarter": vm.feedbackQtr,
              "requested_by": vm.feedbackRequestedBy,
              "tag": [],
              "feedbackStatus": "DRAFT",
              "saveSatus": "DRAFT",
              "sharewithemp": vm.feedbackShareWithEmployee,
              "response_type": "",
              "questionnare_id": "",
              "feedbackResponse": "",
              "mgrComments": "",
              "sendReminderLists": [{
                "sendReminderFlag": "",
                "reminderSendBy": ""
              }],
              "providerList": (_.uniq(_.pluck(vm.tags, 'username'))),
              "feedbackAboutList": []
            };
          } else if(vm.feedbackMode === 'unrequested')
          {
            // Type of request is unrequested
              vm.requestFeedbackObject = {
              "title": vm.feedbackTitle,
              "type": vm.feedbackType,
              "feedbackAbout": "",
              "provider": vm.feedbackRequestedBy,
              "requester": "",
              "description": "",
              "fy": vm.feedbackFY,
              "quarter": vm.feedbackQtr,
              "requested_by": "",
              "tag": [],
              "feedbackStatus": "DRAFT",
              "saveSatus": "DRAFT",
              "sharewithemp": vm.feedbackShareWithEmployee,
              "response_type": "",
              "questionnare_id": "",
              "feedbackResponse": tinymce.activeEditor.getContent({
                format: 'raw'
              }),
              "mgrComments": "",
              "sendReminderLists": [{
                "sendReminderFlag": "",
                "reminderSendBy": ""
              }],
              "providerList": [],
              "feedbackAboutList": (_.uniq(_.pluck(vm.tags, 'username')))
            };
          }
        }
      }


      // Call appropriate service if its a fresh draft object or if its an existing draft object
      if(vm.draftFeedbackObject !== null && vm.draftFeedbackObject !== undefined && vm.draftFeedbackObject.feedbackStatus === 'DRAFT')
      {
        // Esisting Draft object
        if (vm.validateFields()) {
            if ((_.uniq(_.pluck(vm.tags, 'username'))).length === 1) {
              dataservice.updateFeedback(vm.requestFeedbackObject)
                .then(draftNewFeedbackComplete)
                .catch(draftNewFeedbackFailed);
            } else if ((_.uniq(_.pluck(vm.tags, 'username'))).length > 1) {
              dataservice.updateFeedback(vm.requestFeedbackObject)
                .then(draftNewFeedbackComplete)
                .catch(draftNewFeedbackFailed);
            } else if ((_.uniq(_.pluck(vm.tags, 'username'))).length === 0) {
              //alert("******** 31");
              if (vm.feedbackMode !== 'provide') {
                vm.setActionBtnsProperty(vm.enable);
                growl.error("Enter atleast one Feedback Provider.");
                vm.isActivityRunning = false;
                vm.activityMessage = '';
              }
            }
          } else {
            vm.setActionBtnsProperty(vm.enable);
            growl.error('Please enter missing details.');
            vm.isActivityRunning = false;
            vm.activityMessage = '';
          }
      } else
      {
        // Fresh Draft Object
        if (vm.validateFields()) {
            if ((_.uniq(_.pluck(vm.tags, 'username'))).length === 1) {
              dataservice.requestNewFeedback(vm.requestFeedbackObject, vm.feedbackMode)
                .then(draftNewFeedbackComplete)
                .catch(draftNewFeedbackFailed);
            } else if ((_.uniq(_.pluck(vm.tags, 'username'))).length > 1) {
              dataservice.requestNewFeedbackMultiple(vm.requestFeedbackObject, vm.feedbackMode)
                .then(draftNewFeedbackComplete)
                .catch(draftNewFeedbackFailed);
            } else if ((_.uniq(_.pluck(vm.tags, 'username'))).length === 0) {
              //alert("******** 31");
              if (vm.feedbackMode !== 'provide') {
                vm.setActionBtnsProperty(vm.enable);
                growl.error("Enter atleast one Feedback Provider.");
                vm.isActivityRunning = false;
                vm.activityMessage = '';
              }
            }
          } else {
            vm.setActionBtnsProperty(vm.enable);
            growl.error('Please enter missing details.');
            vm.isActivityRunning = false;
            vm.activityMessage = '';
          }
      }
    };


        function draftNewFeedbackComplete(response) {
      // Disable Action on Draft
      vm.setActionBtnsProperty(vm.disable);
      console.log("--------- DFT OBJ -------------------->" + JSON.stringify(response.data));
      objectStore.feedback.draftFeedbackObject.set(vm.feedbackObjectResponse);
      vm.isDraftButtonDisabled = 'false';
            if (response.status === 200 || response.status === 201 && response !== undefined) {
                if (typeof response.data !== undefined) {
                    //growl.success("Feedback has been saved as draft.");
                    vm.feedbackObjectResponse = response.data;
                    vm.convID=response.data.id;
                    if(vm.uploader.queue == ""){
                      vm.setActionBtnsProperty(vm.enable);
                        objectStore.feedback.draftFeedbackObject.set(vm.feedbackObjectResponse);
                        objectStore.feedback.currentFeedbackObject.set(vm.feedbackObjectResponse);

                        growl.success("Feedback has been saved as draft.");
                    }
                    else{
                        vm.saveDraftClicked = true;
                        vm.uploader.uploadAll();
                        console.log("after upload");

                        growl.success("Feedback has been saved as draft.");
                    }

                    vm.isActivityRunning = false;
                    vm.activityMessage = '';
                }

                if(vm.feedbackMode === 'unrequested')
                {
                  if($stateParams.username){
                          $state.go('teamMemberFeedback.provide',{"tmusername":$stateParams.username});
                        }
                        else{
                          $state.go('feedback.provide');
                        }
                //  $state.go('feedback.provide');
                } else 
                {
                  if($stateParams.username){
                          $state.go('teamMemberFeedback.recieve',{"tmusername":$stateParams.username});
                        }
                        else{
                          $state.go('feedback.provide');
                        }
                  // $state.go('feedback.recieve');
                }
            } else if(response.status === 203) 
            {
              vm.isActivityRunning = false;
              vm.activityMessage = '';
              growl.error('Error in creating/providing Feedback request.');
            } else
            {
              growl.error('Error processing your request. Please check the information provided.');
              vm.isActivityRunning = false;
              vm.activityMessage = '';
            }
            return response;
        }

    function draftNewFeedbackFailed(error) {
      // Enable Button
      vm.isDraftButtonDisabled = 'false';
      growl.success("Error saving the feedback as draft.");
      console.log("XHR Request failed " + error.data);
      vm.isActivityRunning = false;
      vm.activityMessage = '';
    }


    vm.addUser = function(user) {
      vm.shareWithEmployeesString = '';
      if (vm.feedbackProvider.indexOf(';') !== -1) {
        var feedbackProviderUpdatedArray = [];
        var feedbackProviderUpdatedArray = vm.feedbackProvider.split(';');
      } else {
        var feedbackProviderUpdatedArray = [];
        feedbackProviderUpdatedArray.push(vm.feedbackProvider);
      }

      if (vm.feedbackProvider.indexOf(user.username) !== -1) {
        var userFullName = '';
        userFullName = user.firstName + ' ' + user.lastName;
        vm.feedbackProviderListFulName.push(userFullName);
      }

      vm.shareWithEmployeesString = vm.feedbackProviderListFulName.join();
      vm.shareWithEmployeesString = vm.shareWithEmployeesString.replace(/,/g, ', ');

      vm.searchedUsers = [];

      vm.feedbackProviderList.push(user.username);
      // vm.feedbackProviderListFulName
      // vm.feedbackProvider += username+'; ';
    };

    vm.highlightUser = function(username) {
      if (vm.feedbackProvider.indexOf(';') !== -1) {
        vm.feedbackProvider = vm.feedbackProvider.substring(0, vm.feedbackProvider.lastIndexOf(';') + 1);
        vm.feedbackProvider += ' ' + username;
      } else {
        vm.feedbackProvider = username;
      }
    };


    vm.validateFields = function() {
      vm.loggedInUser = localStorageService.get("loggedInUser").username;
     // vm.setActionBtnsProperty(vm.enable);
      if ((typeof vm.feedbackTitle !== 'undefined' && vm.feedbackTitle.length <= 0 && vm.feedbackMode !== 'provide')) {
        vm.setActionBtnsProperty(vm.enable);
        growl.error("Please enter a title");
        return false;
      } else if (tinymce.activeEditor.getContent({
          format: 'text'
        }).trim().indexOf("Enter Feedback Details") == 0 || tinymce.activeEditor.getContent({
          format: 'text'
        }).trim().length <= 0) {
        vm.setActionBtnsProperty(vm.enable);
        growl.error("Please enter details");
        return false;
      } else if((_.uniq(_.pluck(vm.tags, 'username'))).indexOf(vm.loggedInUser) !== -1)
      {
        vm.setActionBtnsProperty(vm.enable);
        growl.error("You cannot enter your own name.");
        return false;
      } else if(vm.feedbackMode === 'requestTeam') 
      {
        if(vm.teamFeedbackType === 'individual')
        {
          if(vm.teamFeedbackAbout === '')
          {
            growl.error("Please select a user for whom feedback is requested.");
            return false;
          } else 
          {
            return true;
          }
        } else if(vm.teamFeedbackType === 'team')
        {
          if(vm.teamFeedbackAboutList.length === 0)
          {
            growl.error("There is no team member in the list.");
            return false;
          } else 
          {
            return true;
          }
        }
      } else {
        return true;
      }
    };


    vm.cancelRequestFeedback = function() {

      if(vm.feedbackMode === 'unrequested')
      {
        if($stateParams.username){
          $state.go('teamMemberFeedback.provide',{"tmusername":$stateParams.username});
        }
        else{
          $state.go('feedback.provide');
        }

      } else if(vm.feedbackMode === 'request')
      {
        if($stateParams.username){
          $state.go('teamMemberFeedback.recieve',{"tmusername":$stateParams.username});
        }
        else{
          $state.go('feedback.recieve');
        }
      } else if(vm.feedbackMode === 'requestTeam')
      {
        if($stateParams.username){
          $state.go('teamMemberFeedback.recieveTeam',{"tmusername":$stateParams.username});
        }
        else{
          $state.go('feedback.recieveTeam');
        }
      } else if(vm.feedbackMode === 'provide')
      {
        if($stateParams.username){
          $state.go('teamMemberFeedback.provide',{"tmusername":$stateParams.username});
        }
        else{
          $state.go('feedback.provide');
        }
      }

     // $state.go('feedback.recieve');
    };

     // Context User's Team Members
    vm.contextUser = localStorageService.get("loggedInUser").username;
    vm.contextUserTeamMembers = [];
    vm.contextUserTeamMembersLength = 0;
    vm.contextUserDirextTeamMembersLength = 0;
    vm.isTeamDetailsLoaded = true;

    vm.selectedTeamMember = 'Select Individual'
    // Service to get the team members
    if(vm.feedbackMode === 'requestTeam')
    {
      // dataservice.getContextUserTeamMembers(vm.contextUser).then(getContextUserTeamMembersComplete).catch(getContextUserTeamMembersFailed);
      var directTeam = objectStore.feedback.feedbackDirectTeamStore.get();
      var alternateTeam = objectStore.feedback.feedbackAlternateTeamStore.get();

      vm.contextUserDirextTeamMembersLength = directTeam.length;

      if(alternateTeam !== null)
      {
        if(alternateTeam.length !== 0)
        {
          vm.contextUserTeamMembers = directTeam.concat(alternateTeam);
          vm.isTeamDetailsLoaded = false;
          vm.contextUserTeamMembersLength = vm.contextUserTeamMembers.length;

        /*  vm.teamFeedbackAboutList = vm.contextUserTeamMembers.map(function(teamMember, index, array){
            return teamMember.username;
          });*/
        }
      } else 
      {
        vm.contextUserTeamMembers = directTeam;
        vm.isTeamDetailsLoaded = false;
        vm.contextUserTeamMembersLength = vm.contextUserTeamMembers.length;

        /*vm.teamFeedbackAboutList = vm.contextUserTeamMembers.map(function(teamMember, index, array){
          return teamMember.username;
        });*/
      }
    }

    function getContextUserTeamMembersComplete(response)
    {
      vm.isTeamDetailsLoaded = false;
      vm.contextUserTeamMembers = response;
      vm.contextUserTeamMembersLength = response.length;

      vm.teamFeedbackAboutList = response.map(function(teamMember, index, array){
        return teamMember.username;
      });

      //alert(vm.teamFeedbackAboutList);
      //alert(JSON.stringify(response.length));
      return response;
    }

    function getContextUserTeamMembersFailed(error)
    {
      vm.isTeamDetailsLoaded = false;
      console.log("Service Error " + error.data);
    }

    // This variable holds the individual about whom the feedback is being requested from team mode
    vm.teamFeedbackAbout = '';
    vm.teamFeedbackAboutList = [];

    vm.changeTeamMember = function(teamMember) {
      vm.teamFeedbackAbout = vm.selectedTeamMemberCecId = teamMember.username;
      vm.selectedTeamMember = teamMember.firstName + ' '+ teamMember.lastName;
      console.log("team member selected is "+vm.selectedTeamMember);
    };

    // Enable the Team selector first and disable the individual selector.
    vm.isFullTeamFeedbackSelected = true;
    vm.teamFeedbackType = 'team';
    vm.selectTeamFeedbackTarget = function(target) {
      if(target === 'team')
      {
        vm.isFullTeamFeedbackSelected = true;
        vm.teamFeedbackType = 'team';

        var myDirectTeam = objectStore.feedback.feedbackDirectTeamStore.get();
        vm.teamFeedbackAboutList = myDirectTeam.map(function(teamMember, index, array){
          return teamMember.username;
        });
      } else if(target === 'individual')
      {
        vm.isFullTeamFeedbackSelected = false;
        vm.teamFeedbackType = 'individual';
      }
     // alert(vm.teamFeedbackType);
    };
  }

})();