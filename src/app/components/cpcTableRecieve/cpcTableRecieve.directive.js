(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcTableRecieve', cpcTableRecieve);

  /* @ngInject */
  function cpcTableRecieve() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcTableRecieve/cpcTableRecieve.html',
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

  // $log, $translate, $modal, $window, localStorageService, objectStore, FileUploader, employeeDetails, growl, $stateParams
  /* @ngInject */
  function Controller(dataservice, _, $http, $state, localStorageService, $attrs, $rootScope, objectStore, $stateParams) {
    var vm = this;
    objectStore.feedback.feedbackPrintSource.set("feedbackReceivePage");
    vm.currentFy = localStorageService.get("currentFyQuarter").data.fy;
    vm.currentQuarter = localStorageService.get("currentFyQuarter").data.quarter;
    
    vm.sort = {};
    vm.searchTitle = '';
    vm.showLoadMore = false;
    vm.totalRecord = null;
    
    vm.recordsPerPage = 20;

    vm.currentPage = 1;
    vm.maxSize = 3;

    vm.tableReceiveMode = $attrs.mode;

    vm.isReceiveFeedbacksLoading = true;
    vm.isNoRecordsFound = false;

    vm.loggedInUser = localStorageService.get("loggedInUser").username;
    // This gets the context of the username with the fall back to logged in user
        vm.feedbackContextUserName = objectStore.feedback.feedbackContextUsername.get();
        if(vm.feedbackContextUserName === null || vm.feedbackContextUserName === undefined || vm.feedbackContextUserName === '')
        {
          vm.feedbackContextUserName = localStorageService.get("loggedInUser").username;
        }

    // Action Availability
    // View Action -----> View
    // Provcess Action -----> Request | Send Reminder
    // if the logged in user is same as context user then both the flags are to be set to true
    // if the logged in user is not same as context user then set the View Action Availability flag to true and Process action False
    // Only logged in user must have direct access to the Process Actions
    // Drilled Down level users must only have View Only Access
    vm.isViewActionAvailable = true;
    vm.isProcessActionAvailable = true;
    
    vm.isRequestNewFeedbackButtonVisible = true;

    vm.teamMembersList = [];
    vm.alternateTeamMemberList = [];

    vm.teamMembersList = objectStore.feedback.directTeamStore.get();
    vm.alternateTeamMemberList = objectStore.feedback.alternateTeamStore.get();

    if(vm.teamMembersList === null)
    {
      vm.teamMembersList = [];
    }

    if(vm.alternateTeamMemberList === null)
    {
      vm.alternateTeamMemberList = [];
    }

    if($stateParams.username){
              if(vm.teamMembersList.length > 0 || vm.alternateTeamMemberList.length > 0)
                {
                  // Request New Feedback Button Availability
                  if(vm.teamMembersList.indexOf($stateParams.username) === -1 && vm.alternateTeamMemberList.indexOf($stateParams.username) === -1)
                  {
                    vm.isRequestNewFeedbackButtonVisible = false;
                  } else 
                  {
                    vm.isRequestNewFeedbackButtonVisible = true;
                    objectStore.feedback.feedbackContextUsername.set($stateParams.username);
                  }
                } else 
                {
                  vm.isRequestNewFeedbackButtonVisible = false;
                }
            }
            else{
              vm.isRequestNewFeedbackButtonVisible = true;
              objectStore.feedback.feedbackContextUsername.set(vm.loggedInUser);
            }

    activate();
    
    vm.numPages = function() {
      return angular.noop;
    }

    vm.changePage = function() {
      console.log(vm.currentPage);
      vm.response = false;
      vm.loading = true;
      //call service here with the current page to be shown.
      activate();
    };


    vm.tableSource = objectStore.feedback.viewAllFeedbackSource.get();

    if (vm.tableSource === 'receiveTeamTable') {
      var filterDetails = objectStore.feedback.receiveFeedbackTableFilter.get();
    }

    dataservice.getAllFiscalYear().then(function(response){
      	if(response.status == 200){
      		if(typeof response.data !== 'undefined'){
      			var fyQuarters = response.data;
      			console.log("checking new logic of fy and quarter");
      			console.log(fyQuarters);
      			vm.quarters = new Array();
      			for(var fy in fyQuarters){
      				var fiscalYear = fy;
      				var outFy = {"year":fiscalYear,"quarter":"","display":fiscalYear,"id":fiscalYear};
      		//		vm.quarters.push(outFy);
      				var quartersInFy = fyQuarters[fiscalYear];
      				console.log(quartersInFy);
//      				for(var q in quartersInFy){
      				for (var q = 0; q < quartersInFy.length; q++) {
      					console.log("******** "+q);
      					var outQ = {"year":fiscalYear,"quarter":quartersInFy[q],"display":fiscalYear +" "+quartersInFy[q],"id":fiscalYear +":"+quartersInFy[q]};
      					vm.quarters.push(outQ);
      				}
      			}
      			vm.quarter = vm.currentFy +":"+ vm.currentQuarter;
      		}
      	}
      });

    vm.sort = {
      "sort": {
        "updated_on": "DESC"
      },
      "filter": {}
    };

    var reset = function() {
      vm.currentPage = 1;
      vm.totalRecord = null;
      //call service here
      vm.response = false;
    }

    if (vm.tableReceiveMode === 'viewAll') {
      var filterDetails = new Object();
      filterDetails = objectStore.feedback.receiveFeedbackTableFilter.get();
      var username = filterDetails.username;
      var feedbackType = filterDetails.feedbackStatus;
      // vm.sort.filter.requested_by = username;
      vm.sort.filter.feedbackStatus = feedbackType;

      activate();

    } else {
      activate();
    }


    function activate() {

      vm.isReceiveFeedbacksLoading = true;
      vm.isNoRecordsFound = false;
      console.log('activate');

      vm.fy_currentYear = "FY" + new Date().getFullYear(); //Current FY


      vm.c_yr = null;
      vm.c_q = null;

      vm.tableSource = objectStore.feedback.viewAllFeedbackSource.get();

      // GET LOGGED IN USER AND GET CONTEXT USER
      vm.loggedInUser = localStorageService.get("loggedInUser").username;
    // This gets the context of the username with the fall back to logged in user
        vm.feedbackContextUserName = objectStore.feedback.feedbackContextUsername.get();
        if(vm.feedbackContextUserName === null || typeof vm.feedbackContextUserName === 'undefined' || vm.feedbackContextUserName === '')
        {
          vm.feedbackContextUserName = vm.loggedInUser;
        }

      if (vm.tableSource === 'receiveTeamTable') {
        try {
          var filterDetails = new Object();
          filterDetails = objectStore.feedback.receiveFeedbackTableFilter.get();
          vm.c_yr = filterDetails.selectedYear;
          vm.c_q = filterDetails.selectedQtr;

          var filterValue = vm.c_yr + ':' + vm.c_q;
        } catch (e) {}
      } else {
        try {
          var temp = vm.quarter.split(":");
          vm.c_yr = temp[0];
          vm.c_q = temp[1];
        } catch (e) {}
      }

      var loginuser = localStorageService.get("loggedInUser").username;
      var context = 'SELF';

      vm.loading = true;

      if (vm.tableProvideMode === 'viewAll') {
        loginuser = objectStore.feedback.receiveTableViewAllUsername.get();
      }

      
            vm.c_yr = vm.c_yr == null ? vm.currentFy : vm.c_yr;
            vm.c_q = vm.c_q == null ? vm.currentQuarter : vm.c_q;

            // Get Source of the Feedback Request
            var feedbackRequestSource = objectStore.feedback.viewAllFeedbackSource.get();
            vm.tableReceiveMode = $attrs.mode;
            if (feedbackRequestSource === 'modal') {
              // If it is coming from Modal Popup
              var specificUserFeedback = objectStore.feedback.viewAllFeedbackUsername.get();
              if (specificUserFeedback !== '' && specificUserFeedback != null) {
                console.log("Yes");
                loginuser = specificUserFeedback;
              } else {
                console.log("No");
                loginuser = loginuser;
              }
            } else if (feedbackRequestSource === 'receiveTeamTable' && vm.tableReceiveMode === 'viewAll') {
              loginuser = objectStore.feedback.receiveTableViewAllUsername.get();
            }

            
            
            vm.loggedInUser = localStorageService.get("loggedInUser").username;
            vm.feedbackContextUserName = objectStore.feedback.feedbackContextUsername.get();

            //alert(vm.feedbackContextUsername + ' ' + vm.loggedInUser);
            if(vm.feedbackContextUserName === vm.loggedInUser)
            {
              //alert('comes here 1');
              loginuser = vm.feedbackContextUserName;
              context = 'SELF';
            } else if(vm.feedbackContextUserName !== vm.loggedInUser)
            {
              console.log('comes here 2 ' + JSON.stringify(vm.sort));
              loginuser = vm.feedbackContextUserName;
              context = 'TEAM';
            }
            // console.log("&&&&&&&&  SORT CRITERIA " + loginuser + ' ' + vm.c_yr + ' ' + vm.c_q);

            if($stateParams.username){
              vm.loggedInuser = localStorageService.get("loggedInUser").username;
              loginuser = $stateParams.username;
              context = 'TEAM';
            }else{
              vm.loggedInuser = localStorageService.get("loggedInUser").username;
              loginuser = localStorageService.get("loggedInUser").username;
              context = 'SELF';
            }

            dataservice.getRequestFeedbackSelf(vm.currentPage, vm.recordsPerPage, loginuser, vm.c_yr, vm.c_q, context, vm.sort).then(function(response) {
              objectStore.feedback.viewAllFeedbackSource.remove();
              if (Number(parseInt(response.headers()["x-total-count"])) == response.headers()["x-total-count"] && vm.totalRecord == null) {
                vm.totalRecord = parseInt(response.headers()["x-total-count"]);
              }

              vm.loading = false;
              if(vm.recordsPerPage >= vm.totalRecord){
              	  vm.showLoadMore = false;
                }
                else{
              	  vm.showLoadMore = true;
                }
              vm.isReceiveFeedbacksLoading = false;
              vm.quarter = vm.c_yr+':'+vm.c_q;

              objectStore.feedback.viewAllFeedbackUsername.remove();
              if (response.status === 200 || response.status === 201) {
                // alert(JSON.stringify(response));
                // alert(JSON.stringify(response.data.content[0].FeedbackData));
                vm.isReceiveFeedbacksLoading = false;
                if (typeof response.data !== 'undefined') {
                  vm.reqrecFeedbackList = response.data.content[0].FeedbackData;
                  vm.byFilter = _.uniq(_.pluck(vm.reqrecFeedbackList, 'requested_by'));
                  vm.status = _.uniq(_.pluck(vm.reqrecFeedbackList, 'feedbackStatus'));

                  // Map the Statuses values to the textual representations
                  // COMPLETE - Received
                  // PENDING - Requested
                  // DRAFT - Draft
                  // NOTSHARE and DECLINE should ideally not be a part of this table

                  // This status array is overridden by the below code block
                  vm.status = vm.status.map(function(status, index, array) {
                    if (status === 'COMPLETE') {
                      return 'Feedback Received';
                    } else if (status === 'PENDING') {
                      return 'Request Pending';
                    } else if (status === 'DRAFT') {
                      return 'Request Pending';
                    } else if(status === 'NOTSHARE')
                    {
                      return 'Feedback Received';
                    } else if(status === 'DECLINE')
                    {
                      return 'Request Declined';
                    }
                  });

                  // OVERRIDING Requirement: #14559
                  // Manual entries of possible statuses required.
                  // for provide table possible statuses are mentioned below
                  // Add new statuses if they are introduced.
                  vm.status = ['Feedback Received', 'Request Pending', 'Request Declined'];
                  vm.status = _.uniq(vm.status);

                  if($stateParams.username){
                    //alert(JSON.stringify(vm.sort));
                    if(vm.sort.filter.feedbackStatus === 'COMPLETE')
                    {
                      vm.statusFilterValue = 'Feedback Received';
                    } else if(vm.sort.filter.feedbackStatus === 'PENDING')
                    {
                      vm.statusFilterValue = 'Request Pending';
                    } else if(vm.sort.filter.feedbackStatus === 'DRAFT')
                    {
                      vm.statusFilterValue = 'Request Pending';
                    } else if(vm.sort.filter.feedbackStatus === 'NOTSHARE')
                    {
                      vm.statusFilterValue = 'Feedback Received';
                    } else if(vm.sort.filter.feedbackStatus === 'DECLINE')
                    {
                      vm.statusFilterValue = 'Request Declined';
                    } 
                  }

                  console.log('will broadcast this message', response.data.content[0].RequestStatusCount);
                  $rootScope.$broadcast('feedbackOverviewCount', response.data.content[0].RequestStatusCount);
                }
              } else {
                objectStore.feedback.viewAllFeedbackUsername.remove();
                // alert(JSON.stringify(response));
                vm.isReceiveFeedbacksLoading = false;
                vm.response = false;
                vm.status = null;
                vm.reqrecFeedbackList = [];
                vm.isNoRecordsFound = true;
                if (typeof vm.sort.filter !== 'undefined') {
                  vm.sort.filter = {};
                  //   console.log('will broadcast this message', response.data.content[0].RequestStatusCount);
                  $rootScope.$broadcast('feedbackOverviewCount', {
                    'PENDING': 0,
                    'COMPLETE': 0
                  });
                }
              }
            }).catch(function(error){
              vm.reqrecFeedbackList = [];
              objectStore.feedback.viewAllFeedbackSource.remove();
            });


      /*// Service Call to getProvideFeedbackTeam gives back the JSON object of all feedbacks open/pending/closed for that logged in user
       // Additional parameter can be passed to the function: username
       vm.reqrecFeedbackList = dataservice.getReqrecFeedback();

       vm.byFilter = _.uniq(_.pluck(vm.reqrecFeedbackList.Data, 'requested_by'));
       vm.status = vm.reqrecFeedbackList.Data.map(function(currentValue, index, array){
       if(currentValue.feedbackStatus === 'DRAFT')
       {
       return 'Draft';
       } else if(currentValue.feedbackStatus === 'PENDING')
       {
       return 'Requested';
       }else if(currentValue.feedbackStatus === 'COMPLETE')
       {
       return 'Received';
       } else if(currentValue.feedbackStatus === 'DECLINED')
       {
       return 'Declined';
       }
       });

       // Get All the Unique Values.
       vm.status = _.uniq(vm.status);*/
    }
    
    vm.getMoreFeedbacks = function(){
      	if(vm.recordsPerPage < vm.totalRecord){
      		vm.recordsPerPage = vm.recordsPerPage + 5;
      	}
      	activate();
     }
    
    vm.changedQuarterValue = function() {
      console.log(vm.quarter);
      reset();
      activate();
    };

    vm.changedBy = function() {
      console.log(vm.usernameFilter);
      vm.sort.filter.requested_by = vm.usernameFilter != null ? vm.usernameFilter : "";
      //vm.sort.filter.statusFilterValue = vm.statusFilterValue!=null?vm.statusFilterValue:"";
      console.log(vm.sort);
      reset();
      //call service here
      activate();
    };
    vm.changedStatus = function() {
      console.log(vm.statusFilterValue);

      vm.sort.filter = {};
      
      // Reverse mapping of the Textual statuses to the actual JSON status values
      // All - null
      // Received - COMPLETE
      // Requested - PENDING
      // Draft - DRAFT
      if(vm.statusFilterValue === null || vm.statusFilterValue === undefined)
      {
        vm.sort.filter.feedbackStatus = '';
      } else if(vm.statusFilterValue === 'Feedback Received')
      {
        vm.actualStatusFilterValue = 'COMPLETE';
        vm.sort.filter.feedbackStatus = vm.actualStatusFilterValue != null ? vm.actualStatusFilterValue : "";
      } else if(vm.statusFilterValue === 'Request Pending')
      {
        vm.actualStatusFilterValue = 'PENDING';
        vm.sort.filter.feedbackStatus = vm.actualStatusFilterValue != null ? vm.actualStatusFilterValue : "";
      } else if(vm.statusFilterValue === 'Draft')
      {
        vm.actualStatusFilterValue = 'DRAFT';
        vm.sort.filter.feedbackStatus = vm.actualStatusFilterValue != null ? vm.actualStatusFilterValue : "";
      } else if(vm.statusFilterValue = 'Request Declined')
      {
        vm.actualStatusFilterValue = 'DECLINE';
        vm.sort.filter.feedbackStatus = vm.actualStatusFilterValue != null ? vm.actualStatusFilterValue : "";
      }

      //vm.sort.filter.statusFilterValue = vm.statusFilterValue!=null?vm.statusFilterValue:"";
      console.log(vm.sort);
      reset();
      //call service here
      activate();
    };
    vm.searchChanged = function() {
      console.log(vm.searchTitle);
      //call service here
      activate();
    };
    vm.sortColumn = function(columnName, sortType) {
      vm.sort.sort = {};
      if (sortType === true) {

        vm.sort.sort[columnName] = "DESC";
        console.log(vm.sort);
        //call service here
        activate();
      } else if (sortType === false) {

        vm.sort.sort[columnName] = "ASC";
        console.log(vm.sort);
        //call service
        activate();
      }
    };


    vm.giveUnrequestedFeedback = function() {
      // Reset Drafted Object
      objectStore.feedback.draftFeedbackObject.remove();

      if($stateParams.username){
        $state.go('teamMemberFeedback.unrequestedNew',{"tmusername":$stateParams.username});
      }
      else{
        $state.go('feedback.unrequestedNew');
      }

      // $state.go('feedback.unrequestedNew');
    };

    // Method: VIEW FEEDBACK
    // This method gets 2 parameters:
    // 1. Entire Feedback Object to be shown
    // 2. mode - view, provide
    // This method is for manager to either see the feedback that is: already provided, to be provided/declined, view already declined feedback
    vm.viewFeedback = function(feedbackObject, mode) {
      var loginuser = localStorageService.get("loggedInUser").username;
      // Details of this function
      // Button Pressed - View. Possible Status - 5 [DRAFT, PENDING, COMPLETE, NOTSHARE, DECLINE]
      // View + DRAFT = Shared + Editable feedback window[Provide(green button)]
      // View + PENDING = Shared + Provide(green button) at the bottom
      // View + COMPLETE = Shared (view only mode && no option)
      // View + NOTSHARE = Shared (view only mode && no option)
      // View + DECLINE = Shared (view only mode && no option)

      // Reset Drafted Object
      // objectStore.feedback.draftFeedbackObject.remove();

      objectStore.feedback.currentFeedbackObject.set(feedbackObject);

      // console.log(JSON.stringify(feedbackObject));
      if (feedbackObject.feedbackStatus === 'DRAFT') {
        // Set the draft object
        objectStore.feedback.draftFeedbackObject.set(feedbackObject);

        if($stateParams.username){
          $state.go('teamMemberFeedback.requestedNew',{"tmusername":$stateParams.username});
        }
        else{
          $state.go('feedback.requestedNew');
        }

       // $state.go('feedback.requestedNew');
      } else if (feedbackObject.feedbackStatus === 'PENDING') {
        // loginuser == feedback owner then viewFeedback else pendingFeedback
        if (loginuser === feedbackObject.requester) {
          if($stateParams.username){
            $state.go('teamMemberFeedback.viewFeedback',{"tmusername":$stateParams.username});
          }
          else{
            $state.go('feedback.viewFeedback');
          }
         // $state.go('feedback.viewFeedback');
        } else if (loginuser !== feedbackObject.requester) {
          if($stateParams.username){
            $state.go('teamMemberFeedback.pendingFeedback',{"tmusername":$stateParams.username});
          }
          else{
            $state.go('feedback.pendingFeedback');
          }
          //$state.go('feedback.pendingFeedback');
        }
      } else if (feedbackObject.feedbackStatus === 'COMPLETE') {
        if($stateParams.username){
            $state.go('teamMemberFeedback.viewFeedback',{"tmusername":$stateParams.username});
          }
          else{
            $state.go('feedback.viewFeedback');
          }
        //$state.go('feedback.viewFeedback');
      } else if (feedbackObject.feedbackStatus === 'NOTSHARE') {
        if($stateParams.username){
            $state.go('teamMemberFeedback.viewFeedback',{"tmusername":$stateParams.username});
          }
          else{
            $state.go('feedback.viewFeedback');
          }
        // $state.go('feedback.viewFeedback');
      } else if (feedbackObject.feedbackStatus === 'DECLINE') {
        if($stateParams.username){
            $state.go('teamMemberFeedback.viewFeedback',{"tmusername":$stateParams.username});
          }
          else{
            $state.go('feedback.viewFeedback');
          }
       // $state.go('feedback.viewFeedback');
      } else if(feedbackObject.feedbackStatus === 'FORWARD') {
        if($stateParams.username){
            $state.go('teamMemberFeedback.viewFeedback',{"tmusername":$stateParams.username});
          }
          else{
            $state.go('feedback.viewFeedback');
          }
       // $state.go('feedback.viewFeedback');
      }

    };

    // Method: PROVIDE FEEDBACK
    vm.sendReminder = function(feedbackObject, mode) {
      // Set the object to make it available Globally
      objectStore.feedback.currentFeedbackObject.set(feedbackObject);
      // Reset Drafted Object
      objectStore.feedback.draftFeedbackObject.remove();

      console.log("THESE ARE THE OBJECT " + JSON.stringify(feedbackObject));

      if($stateParams.username){
            $state.go('teamMemberFeedback.sendFeedbackReminder',{"tmusername":$stateParams.username});
          }
          else{
            $state.go('feedback.sendFeedbackReminder');
          }

      // $state.go('feedback.sendFeedbackReminder');
    };

    // Method: DECLINE FEEDBACK
    vm.declineFeedback = function(feedbackObject, mode) {
      // Reset Drafted Object
      objectStore.feedback.draftFeedbackObject.remove();

      if($stateParams.username){
            $state.go('teamMemberFeedback.declineFeedback',{"tmusername":$stateParams.username});
          }
          else{
            $state.go('feedback.declineFeedback');
          }

     // $state.go('feedback.declineFeedback');
    };

    vm.deleteFeedback = function(feedbackObject, mode)
          {
            // Reset Drafted Object
            objectStore.feedback.draftFeedbackObject.remove();
            // Set the current feedback object
            objectStore.feedback.currentFeedbackObject.set(feedbackObject);

            if($stateParams.username){
              $state.go('teamMemberFeedback.deleteFeedback',{"tmusername":$stateParams.username});
            }
            else{
              $state.go('feedback.deleteFeedback');
            }

           // $state.go('feedback.deleteFeedback');
          };

    vm.requestFeedback = function(feedbackObject, mode) {
      // Reset Drafted Object
      objectStore.feedback.draftFeedbackObject.remove();

      if($stateParams.username){
        $state.go('teamMemberFeedback.requestedNew',{"tmusername":$stateParams.username});
      }
      else{
        $state.go('feedback.requestedNew');
      }

     // $state.go('feedback.requestedNew');
    };


    // Req Rec Feedback Table Classification
    // There are 3 Parent statuses in this table: YET TO PROVIDE [1], PROVIDED [2], DECLINED [3]     [*] - actionCode
    // These 3 statuses have sub-statuses based on kind of object [total 5 sub-statuses]
    // YET TO PROVIDE - DRAFT [1], PENDING [2]            [*] - statusCode
    // PROVIDED - COMPLETE [3], NOTSHARE [4]
    // DECLINED - DECLINED [5]

    // actionCode is responsible for getting available actions against that feedback object
    // statusCode and status are useful for determining the next view and its configuration

    // function vm.fetchProvideFeedbackStatus is used to return this entire object which helps determining next set of actions.

    // actionCode = 1    [View Provide Decline]  statusCode = 1    status = DRAFT      parentStatus/statusString = REQUESTED
    // actionCode = 1    [View Provide Decline]  statusCode = 2    status = PENDING    parentStatus/statusString = REQUESTED
    // actionCode = 2    [View]                  statusCode = 3    status = COMPLETE   parentStatus/statusString = RECEIVED
    // actionCode = 2    [View]                  statusCode = 4    status = NOTSHARE   parentStatus/statusString = PROVIDED [NOT USED]
    // actionCode = 3    [View Provide]          statusCode = 5    status = DECLINED   parentStatus/statusString = DECLINED
    vm.fetchReqrecFeedbackStatus = function(feedbackStatus) {
      var feedbackStatusObject = {};
      
      if (feedbackStatus === 'COMPLETE' || feedbackStatus === 'NOTSHARE') {
        feedbackStatusObject.iconClass = 'feedbackProvided';
        feedbackStatusObject.statusString = 'Feedback Received';
        feedbackStatusObject.actionCode = 2;
        feedbackStatusObject.statusCode = 3;
        feedbackStatusObject.status = 'COMPLETE';
      } else if (feedbackStatus === 'PENDING') {
        feedbackStatusObject.iconClass = 'feedbackYetToProvide';
        feedbackStatusObject.statusString = 'Request Pending';
        feedbackStatusObject.actionCode = 3;
        feedbackStatusObject.statusCode = 2;
        feedbackStatusObject.status = 'PENDING';

      } else if (feedbackStatus === 'DRAFT') {
        feedbackStatusObject.iconClass = 'feedbackYetToProvide';
        feedbackStatusObject.statusString = 'Draft';
        feedbackStatusObject.actionCode = 1;
        feedbackStatusObject.statusCode = 1;
        feedbackStatusObject.status = 'DRAFT';

      } else if (feedbackStatus === 'DECLINE') {
        feedbackStatusObject.iconClass = 'feedbackDeclined';
        feedbackStatusObject.statusString = 'Request Declined';
        feedbackStatusObject.actionCode = 2;
        feedbackStatusObject.statusCode = 5;
        feedbackStatusObject.status = 'DECLINED';
      } else if(feedbackStatus === 'FORWARD')
      {
        feedbackStatusObject.iconClass = 'feedbackProvided';
        feedbackStatusObject.statusString = 'Feedback Received';
        feedbackStatusObject.actionCode = 2;
        feedbackStatusObject.statusCode = 3;
        feedbackStatusObject.status = 'COMPLETE';
      }

      // This Condition checks if the context user is different from the logged in user.
      // If So - It sets the actionCode to 4 which has only View Action Visibility
      // Also, this View Action is viewOnly Mode which does not show any provide or decline buttons.
      // If Feedback Status is DRAFT and Context user is different from the logged in user then both flags are false
      
      if(vm.loggedInUser !== vm.feedbackContextUserName)
      {
        if(feedbackStatus === 'DRAFT')
        {
          vm.isViewActionAvailable = false;
          vm.isProcessActionAvailable = false;
        } else if(feedbackStatus === 'COMPLETE' || feedbackStatus === 'PENDING' || feedbackStatus === 'DECLINE')
        {
          vm.isViewActionAvailable = true;
          vm.isProcessActionAvailable = false;
        }
        
      }

      if($stateParams.username){
              if(feedbackStatus === 'DRAFT')
                {
                  vm.isViewActionAvailable = false;
                  vm.isProcessActionAvailable = false;
                } else if(feedbackStatus === 'COMPLETE' || feedbackStatus === 'PENDING' || feedbackStatus === 'DECLINE' || feedbackStatus === 'NOTSHARE')
                {
                  vm.isViewActionAvailable = true;
                  vm.isProcessActionAvailable = false;
                }
            }
            else{
              vm.isViewActionAvailable = true;
              vm.isProcessActionAvailable = true;
            }

      return feedbackStatusObject;
    };


    vm.monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    vm.translateDate = function(dateString) {
      ////alert(dateString);
      var generatedDateString = '';

      var date = new Date(dateString);
      generatedDateString = date.getDate() + ' ' + vm.monthArray[date.getMonth() + 1] + ' ' + date.getFullYear();

      return generatedDateString;
    };

    vm.getLocation = function(val) {
      return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: val,
          sensor: false
        }
      }).then(function(response) {
        return response.data.results.map(function(item) {
          return item.formatted_address;
        });
      });
    };



    vm.requestNewFeedback = function() {
      var loginuser = localStorageService.get("loggedInUser").username;
      var contextUser = objectStore.feedback.feedbackContextUsername.get();
      
      // Reset Drafted Object
      objectStore.feedback.draftFeedbackObject.remove();

      // Reset Drafted Object
      objectStore.feedback.draftFeedbackObject.remove();

      if(loginuser === contextUser)
      {
        objectStore.feedback.feedbackContextUsername.set(loginuser);
      } else 
      {
        objectStore.feedback.feedbackContextUsername.set(contextUser);
      }

      objectStore.feedback.currentFeedbackObject.remove();

      if($stateParams.username){
        $state.go('teamMemberFeedback.requestedNew',{"tmusername":$stateParams.username});
      }
      else{
        $state.go('feedback.requestedNew');
      }

      //$state.go('feedback.requestedNew');
    };

    // clearFilter - Function clears all the filter and resets components and fiters values to what they were originally
    // This function might call to the service to reload the expected data
    vm.clearFilter = function() {
      console.log('Clear Filter on Team provide feedback table');
      vm.sort = {};
      vm.searchTitle = '';
      vm.byFilterValue = 'All';
      vm.statusFilterValue = 'All';
      vm.quarter = vm.quarters[0];

      vm.quarter = vm.currentFy +":"+ vm.currentQuarter;

      vm.reverse1 = '';
      vm.reverse2 = '';
      vm.reverse3 = '';
      vm.reverse4 = '';
      vm.reverse5 = '';
      vm.searchTitle = '';
      vm.usernameFilter = 'All';

      vm.sort.updated_on = 'DESC'
      vm.sort.filter = {};

      reset();
      activate();
    };

    vm.isAttachmentVisible = function(feedbackObject) {
            var requestHasAttachment = false;
        var responseHasAttachment = false;

        if(feedbackObject.attachment_id !== null)
        {
          if(feedbackObject.attachment_id.hasOwnProperty('empty'))
          {
            requestHasAttachment = false;
          }
        }

        if($.isEmptyObject(feedbackObject.attachment_id))
        {
          requestHasAttachment = false;
        } else if(feedbackObject.attachment_id === null || feedbackObject.attachment_id === undefined)
        {
          requestHasAttachment = false;
        } else if(feedbackObject.attachment_id !== null && feedbackObject.attachment_id.hasOwnProperty('empty'))
        {
          requestHasAttachment = false;
        } else 
        {
          requestHasAttachment = true;
        }  

     
        if(feedbackObject.response_attachment_id !== null)
        {
          if(feedbackObject.response_attachment_id.hasOwnProperty('empty'))
          {
            responseHasAttachment = false;
          }
        }

        if($.isEmptyObject(feedbackObject.response_attachment_id))
        {
          responseHasAttachment = false;
        } else if(feedbackObject.response_attachment_id === null || feedbackObject.response_attachment_id === undefined)
        {
          responseHasAttachment = false;
        } else if(feedbackObject.response_attachment_id !== null && feedbackObject.response_attachment_id.hasOwnProperty('empty'))
        {
          responseHasAttachment = false;
        } else 
        {
          responseHasAttachment = true;
        }
      
        return (requestHasAttachment || responseHasAttachment);
          };

    vm.activateAfterSearch = function() {
      vm.sort.filter.title = vm.searchTitle != null ? vm.searchTitle : "";
      activate();
    }

    vm.getLocation = function(val) {

      vm.fy_currentYear = "FY" + new Date().getFullYear(); //Current FY


      vm.c_yr = null;
      vm.c_q = null;

      try {
        var temp = vm.quarter.split(":");
        vm.c_yr = temp[0];
        vm.c_q = temp[1];
      } catch (e) {}

      var loginuser = localStorageService.get("loggedInUser").username;
      vm.loading = true;
      var context = '';
      vm.sort.filter.title = val != null ? val : "";

      if($stateParams.username){
                  vm.loggedInuser = localStorageService.get("loggedInUser").username;
                  loginuser = $stateParams.username;
                  context = 'TEAM';
                }else{
                  vm.loggedInuser = localStorageService.get("loggedInUser").username;
                  loginuser = localStorageService.get("loggedInUser").username;
                  context = 'SELF';
                }

      return dataservice.getRequestFeedbackSelf(vm.currentPage, vm.recordsPerPage, loginuser, vm.c_yr, vm.c_q, context, vm.sort).then(function(response) {
        objectStore.feedback.viewAllFeedbackSource.remove();
        if (Number(parseInt(response.headers()["x-total-count"])) === response.headers()["x-total-count"] && vm.totalRecord == null) {
          vm.totalRecord = parseInt(response.headers()["x-total-count"]);
        }

        vm.loading = false;

        if (response.status === 200 || response.status === 201) {
          ////alert(JSON.stringify(response));
          vm.isProvideFeedbacksLoading = false;
          if (typeof response.data !== 'undefined') {
            vm.isProvideFeedbacksLoading = false;
            var searchData = _.uniq(_.pluck(response.data.content[0].FeedbackData, 'title'));
            return searchData;
          }
        } else {
          vm.isProvideFeedbacksLoading = false;
          vm.response = false;
          vm.status = null;
          vm.reqrecFeedbackList = [];
          vm.isNoRecordsFound = true;
          if (typeof vm.sort.filter !== 'undefined') {
            vm.sort.filter = {};
            vm.isProvideFeedbacksLoading = false;
            return ['No Search Results Found...'];
          }
        }
      });
    };

    vm.truncateFeedbackTitle = function(title)
    {
      var feedbackTitle = title;
      if(feedbackTitle !== null && feedbackTitle.length > 30)
      {
        feedbackTitle = feedbackTitle.substring(0,30)+"...";
      }
      return feedbackTitle;
    };

  }
})();