(function() {
    'use strict';

    angular
      .module('cpccore')
      .directive('cpcTableProvide', cpcTableProvide);

    /* @ngInject */
    function cpcTableProvide() {
      // Usage:
      //
      // Creates:
      //
      var directive = {
        templateUrl: '/client/app/components/cpcTableProvide/cpcTableProvide.html',
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
    function Controller(dataservice, _, $http, $state, localStorageService, $rootScope, objectStore, $attrs, $stateParams) {
      var vm = this;
      objectStore.feedback.feedbackPrintSource.set("feedbackProvidePage");
      vm.currentFy = localStorageService.get("currentFyQuarter").data.fy;
      vm.currentQuarter = localStorageService.get("currentFyQuarter").data.quarter;
      
      vm.isProvideFeedbacksLoading = true;
      vm.isNoRecordsFound = false;
      vm.showLoadMore = false;
      vm.sort = {};
      vm.searchTitle = '';

      // this will automatically get populated using service
      vm.totalRecord = null;
      // enter the value here to modify number of items shown in one page
      vm.recordsPerPage = 20;

      vm.currentPage = 1;
      vm.maxSize = 3;

      vm.tableProvideMode = $attrs.mode;


      vm.loggedInUser = localStorageService.get("loggedInUser").username;
    // This gets the context of the username with the fall back to logged in user
        vm.feedbackContextUserName = objectStore.feedback.feedbackContextUsername.get();
        if(vm.feedbackContextUserName === null || typeof vm.feedbackContextUserName === 'undefined' || vm.feedbackContextUserName === '')
        {
          vm.feedbackContextUserName = vm.loggedInUser;
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

    vm.isGiveUnrequestedFeedbackButtonVisible = true;

    if($stateParams.username){
                  vm.isGiveUnrequestedFeedbackButtonVisible = false;
            }
            else{
              vm.isGiveUnrequestedFeedbackButtonVisible = true;
            }

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

      if (vm.tableSource === 'provideTeamTable') {
        var filterDetails = objectStore.feedback.provideFeedbackTableFilter.get();
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

      if (vm.tableProvideMode === 'viewAll') {
        var filterDetails = new Object();
        filterDetails = objectStore.feedback.provideFeedbackTableFilter.get();
        var username = filterDetails.username;
        var feedbackType = filterDetails.feedbackStatus;
        //vm.sort.filter.requested_by = username;
        vm.sort.filter.feedbackStatus = feedbackType;

        activate();

      } else {
        activate();
      }

      function activate() {

        console.log('activate');

        vm.isProvideFeedbacksLoading = true;
        vm.isNoRecordsFound = false;
     //   vm.fy_currentYear = "FY" + new Date().getFullYear(); //Current FY

        vm.c_yr = null;
        vm.c_q = null;

        vm.tableSource = objectStore.feedback.viewAllFeedbackSource.get();

        if (vm.tableSource === 'provideTeamTable') {
          try {
            var filterDetails = new Object();
            filterDetails = objectStore.feedback.provideFeedbackTableFilter.get();
            vm.c_yr = filterDetails.selectedYear;
            vm.c_q = filterDetails.selectedQtr;

            var filterValue = vm.c_yr + ':' + vm.c_q;
            angular.element('#provideQtrOptions').val(filterValue);
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

        vm.tableProvideMode = $attrs.mode;

        if (vm.tableProvideMode === 'viewAll') {
          loginuser = objectStore.feedback.provideTableViewAllUsername.get();
        }

        
               
        vm.c_yr = vm.c_yr == null ? vm.currentFy : vm.c_yr;
        vm.c_q = vm.c_q == null ? vm.currentQuarter : vm.c_q;

        vm.loggedInUser = localStorageService.get("loggedInUser").username;
        vm.feedbackContextUserName = objectStore.feedback.feedbackContextUsername.get();

            if(vm.feedbackContextUserName === vm.loggedInUser)
            {
              loginuser = vm.feedbackContextUserName;
              context = 'SELF';
            } else if(vm.feedbackContextUserName !== vm.loggedInUser)
            {
              loginuser = vm.feedbackContextUserName;
              context = 'TEAM';
            }

            console.log('THIS IS THE SORT------> ' + JSON.stringify(vm.sort));

                if($stateParams.username){
                  vm.loggedInuser = localStorageService.get("loggedInUser").username;
                  loginuser = $stateParams.username;
                  context = 'TEAM';
                }else{
                  vm.loggedInuser = localStorageService.get("loggedInUser").username;
                  loginuser = localStorageService.get("loggedInUser").username;
                  context = 'SELF';
                }

                dataservice.getProvideFeedbackSelf(vm.currentPage, vm.recordsPerPage, loginuser, vm.c_yr, vm.c_q, context, vm.sort).then(function(response) {
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
                    vm.isProvideFeedbacksLoading = false;
                    if (response.status === 200 || response.status === 201) {
                      ////alert(JSON.stringify(response));
                      vm.isProvideFeedbacksLoading = false;
                      if (typeof response.data !== 'undefined') {
                        vm.provideFeedbackList = response.data.content[0].FeedbackData;
                        vm.byFilter = _.uniq(_.pluck(vm.provideFeedbackList, 'requested_by'));
                        vm.status = _.uniq(_.pluck(vm.provideFeedbackList, 'feedbackStatus'));

                        // Map the Statuses values to the textual representations
                        // PENDING - Yet to Provide
                        // COMPLETE - Provided
                        // DECLINE - Declined
                        // NOTSHARE should ideally not be a part of this table but belongs under All

                        // This code block of Map is to be overridden. 
                        // This gets overridden by the below code block.
                        vm.status = vm.status.map(function(status, index, array) {
                            if (status === 'PENDING') {
                              return 'Pending Your Reply';
                            } else if (status === 'COMPLETE') {
                              return 'Given';
                            } else if (status === 'DECLINE') {
                              return 'Declined';
                            } else if(status === 'NOTSHARE')
                            {
                              return 'Given';
                            } else if(status === 'DRAFT')
                            {
                              return 'Pending Your Reply';
                            } else if(status === 'FORWARD')
                            {
                              return 'Given';
                            }
                          });

                            // OVERRIDING Requirement: #14559
                            // Manual entries of possible statuses required.
                            // for provide table possible statuses are mentioned below
                            // Add new statuses if they are introduced.
                            vm.status = ['Pending Your Reply', 'Given', 'Declined'];

                            vm.status = _.uniq(vm.status);

                            console.log('will broadcast this message', response.data.content[0].ProvideStatusCount);
                            $rootScope.$emit('feedbackOverviewCount', response.data.content[0].ProvideStatusCount);
                          }
                        } else {
                          vm.isProvideFeedbacksLoading = false;
                          vm.response = false;
                          vm.status = null;
                          vm.provideFeedbackList = [];
                          vm.isNoRecordsFound = true;
                          if (typeof vm.sort.filter !== 'undefined') {
                            vm.sort.filter = {};
                            console.log('will broadcast this message', response.data);
                            $rootScope.$broadcast('feedbackOverviewCount', {
                              'PENDING': 0,
                              'COMPLETE': 0
                            });
                          }
                        }
                      }).catch(function(error){
                        vm.provideFeedbackList = [];
                        objectStore.feedback.viewAllFeedbackSource.remove();
                      });
               



            /*// Service Call to getProvideFeedback gives back the JSON object of all feedbacks open/pending/closed for that logged in user
            // Additional parameter can be passed to the function: username
            vm.provideFeedbackList = dataservice.getProvideFeedback();
            vm.byFilter = _.uniq(_.pluck(vm.provideFeedbackList.Data, 'requested_by'));
            //vm.status = _.uniq(_.pluck(vm.provideFeedbackList.Data, 'feedbackStatus'));

            // TODO: to figure a way out to make these statuses dynamic as this comes as a part of JSON with different names
            // As of now what we get in JSON is only DRAFT, PENDING, COMPLETE, NOTSHARE, DECLINED
            vm.status = vm.provideFeedbackList.Data.map(function(currentValue, index, array){
              if(currentValue.feedbackStatus === 'DRAFT' || currentValue.feedbackStatus === 'PENDING')
              {
                return 'Yet to Provide';
              } else if(currentValue.feedbackStatus === 'COMPLETE' || currentValue.feedbackStatus === 'NOTSHARE')
              {
                return 'Provided';
              } else if(currentValue.feedbackStatus === 'DECLINED')
              {
                return 'Declined';
              }
            });

            // Get All the Unique Values.
            vm.status = _.uniq(vm.status);


            // State Change or Ajax Loader*/
          }
      
      vm.getMoreFeedbacks = function(){
      	if(vm.recordsPerPage < vm.totalRecord){
      		vm.recordsPerPage = vm.recordsPerPage + 5;
      	}
      	activate();
      }

          var reset = function() {
            vm.currentPage = 1;
            vm.totalRecord = null;
            //call service here
            vm.response = false;
          }

          vm.go = function(path) {
            $location.path(path);
          };

          vm.changedQuarterValue = function() {
            reset();
            activate();
          };

          vm.setQarterValue = function(quarter) {
            vm.quarter = quarter;
          };

          vm.changedBy = function() {
            console.log(vm.usernameFilter);
            vm.sort.filter.requested_by = vm.usernameFilter != null ? vm.usernameFilter : "";
            reset();
            //call service here
            activate();
          }; vm.changedStatus = function() {
            

            // Reverse mapping of the Textual statuses to the actual JSON status values
            // All - null
            // Provided - COMPLETE
            // Yet to Provide - PENDING
            // Declined - DECLINE
            vm.sort.filter = {};

            if(vm.statusFilterValue === null || vm.statusFilterValue === undefined)
            {
              vm.sort.filter.feedbackStatus = '';
            } else if(vm.statusFilterValue === 'Given')
            {
              vm.actualStatusFilterValue = 'COMPLETE';
              vm.sort.filter.feedbackStatus = vm.actualStatusFilterValue != null ? vm.actualStatusFilterValue : "";
            } else if(vm.statusFilterValue === 'Pending Your Reply')
            {
              vm.actualStatusFilterValue = 'PENDING';
              vm.sort.filter.feedbackStatus = vm.actualStatusFilterValue != null ? vm.actualStatusFilterValue : "";
            } else if(vm.statusFilterValue === 'Declined')
            {
              vm.actualStatusFilterValue = 'DECLINE';
              vm.sort.filter.feedbackStatus = vm.actualStatusFilterValue != null ? vm.actualStatusFilterValue : "";
            }
            
            reset();
            //call service here
            activate();
          };

          vm.changedStatusByParam = function(statusValue) {
            vm.sort.filter.feedbackStatus = statusValue;
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
          }; vm.sortColumn = function(columnName, sortType) {
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

          vm.monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; 

          vm.translateDate = function(dateString) {
            ////alert(dateString);
            var generatedDateString = '';

            var date = new Date(dateString);
            generatedDateString = date.getDate() + ' ' + vm.monthArray[date.getMonth()] + ' ' + date.getFullYear();

            return generatedDateString;
          };

          // Provide Feedback Table Classification
          // There are 3 Parent statuses in this table: YET TO PROVIDE [1], PROVIDED [2], DECLINED [3]     [*] - actionCode
          // These 3 statuses have sub-statuses based on kind of object [total 5 sub-statuses]
          // YET TO PROVIDE - DRAFT [1], PENDING [2]            [*] - statusCode
          // PROVIDED - COMPLETE [3], NOTSHARE [4]
          // DECLINED - DECLINED [5]

          // actionCode is responsible for getting available actions against that feedback object
          // statusCode and status are useful for determining the next view and its configuration

          // function vm.fetchProvideFeedbackStatus is used to return this entire object which helps determining next set of actions.

          // actionCode = 1    [View Provide Decline]  statusCode = 1    status = DRAFT      parentStatus/statusString = YET TO PROVIDE
          // actionCode = 1    [View Provide Decline]  statusCode = 2    status = PENDING    parentStatus/statusString = YET TO PROVIDE
          // actionCode = 2    [View]                  statusCode = 3    status = COMPLETE   parentStatus/statusString = PROVIDED
          // actionCode = 2    [View]                  statusCode = 4    status = NOTSHARE   parentStatus/statusString = PROVIDED
          // actionCode = 3    [View Provide]          statusCode = 5    status = DECLINE   parentStatus/statusString = DECLINED
          vm.fetchProvideFeedbackStatus = function(feedbackStatus) {
            //console.log('feedbackstatus',feedbackStatus)
            var feedbackStatusObject = {};
            if (feedbackStatus === 'COMPLETE' || feedbackStatus === 'NOTSHARE') {
              feedbackStatusObject.iconClass = 'feedbackProvided';
              feedbackStatusObject.statusString = 'Given';
              feedbackStatusObject.actionCode = 2;

              if (feedbackStatus === 'COMPLETE') {
                feedbackStatusObject.statusCode = 3;
                feedbackStatusObject.status = 'COMPLETE';
              } else if (feedbackStatus === 'NOTSHARE') {
                feedbackStatusObject.statusCode = 4;
                feedbackStatusObject.status = 'NOTSHARE';
              }

            } else if (feedbackStatus === 'DRAFT' || feedbackStatus === 'PENDING') {
              feedbackStatusObject.iconClass = 'feedbackYetToProvide';
              feedbackStatusObject.statusString = 'Pending Your Reply';
              
              if (feedbackStatus === 'DRAFT') {
                feedbackStatusObject.actionCode = 5;
                feedbackStatusObject.statusCode = 1;
                feedbackStatusObject.status = 'DRAFT';
              } else if (feedbackStatus === 'PENDING') {
                feedbackStatusObject.actionCode = 1;
                feedbackStatusObject.statusCode = 2;
                feedbackStatusObject.status = 'PENDING';
              }

            } else if (feedbackStatus === 'DECLINE') {
              feedbackStatusObject.iconClass = 'feedbackDeclined';
              feedbackStatusObject.statusString = 'Declined';
              feedbackStatusObject.actionCode = 3;
              feedbackStatusObject.statusCode = 5;
              feedbackStatusObject.status = 'DECLINED';
              
            } else if(feedbackStatus === 'FORWARD')
            {
              feedbackStatusObject.iconClass = 'feedbackProvided';
              feedbackStatusObject.statusString = 'Given';
              feedbackStatusObject.actionCode = 4;
              feedbackStatusObject.statusCode = 6;
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
          vm.isGiveUnrequestedFeedbackButtonVisible = false;
        } else if(feedbackStatus === 'COMPLETE' || feedbackStatus === 'PENDING' || feedbackStatus === 'DECLINE' || feedbackStatus === 'NOTSHARE')
        {
          vm.isViewActionAvailable = true;
          vm.isProcessActionAvailable = false;
          vm.isGiveUnrequestedFeedbackButtonVisible = false;
        }
      }

            if($stateParams.username){
              if(feedbackStatus === 'DRAFT')
                {
                  vm.isViewActionAvailable = false;
                  vm.isProcessActionAvailable = false;
                  vm.isGiveUnrequestedFeedbackButtonVisible = false;
                } else if(feedbackStatus === 'COMPLETE' || feedbackStatus === 'PENDING' || feedbackStatus === 'DECLINE' || feedbackStatus === 'NOTSHARE')
                {
                  vm.isViewActionAvailable = true;
                  vm.isProcessActionAvailable = false;
                  vm.isGiveUnrequestedFeedbackButtonVisible = false;
                }
            }
            else{
              vm.isViewActionAvailable = true;
              vm.isProcessActionAvailable = true;
              vm.isGiveUnrequestedFeedbackButtonVisible = true;
            }

            return feedbackStatusObject;
          };

          vm.giveUnrequestedFeedback = function() {
            var loginuser = localStorageService.get("loggedInUser").username;

            objectStore.feedback.feedbackContextUsername.set(loginuser);
            objectStore.feedback.currentFeedbackObject.remove();
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
            // console.log("-------> "+JSON.stringify(feedbackObject));

            // Set the current feedback object
            objectStore.feedback.currentFeedbackObject.set(feedbackObject);
            // objectStore.feedback.currentFeedbackObject.set(feedbackObject);
            // //console.log('feedbackobject' ,feedbackObject, mode);

            // Reset Drafted Object
            objectStore.feedback.draftFeedbackObject.remove();

             //alert(JSON.stringify(feedbackObject));
             //console.log('$$$$$$$$$$$$$$$$$$ - > ' + JSON.stringify(feedbackObject));

            // Details of this function
            // Button Pressed - View. Possible Status - 5 [DRAFT, PENDING, COMPLETE, NOTSHARE, DECLINE]
            // View + DRAFT = Shared + Editable feedback window[Provide(green button)]
            // View + PENDING = Shared + Provide(green button) at the bottom
            // View + COMPLETE = Shared (view only mode && no option)
            // View + NOTSHARE = Shared (view only mode && no option)
            // View + DECLINE = Shared (view only mode && no option)
            if (feedbackObject.feedbackStatus === 'DRAFT') {
              // Set the draft object
              objectStore.feedback.draftFeedbackObject.set(feedbackObject);
              if($stateParams.username){
                $state.go('teamMemberFeedback.provideFeedback',{"tmusername":$stateParams.username});
              }
              else{
                $state.go('feedback.provideFeedback');
              }
              //$state.go('feedback.provideFeedback');
            } else if (feedbackObject.feedbackStatus === 'PENDING') {
              if($stateParams.username){
                $state.go('teamMemberFeedback.pendingFeedback',{"tmusername":$stateParams.username});
              }
              else{
                $state.go('feedback.pendingFeedback');
              }
              // $state.go('feedback.pendingFeedback');
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
            } else if(feedbackObject.feedbackStatus === 'FORWARD')
            {
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
          vm.provideFeedback = function(feedbackObject, mode) {
            // Reset Drafted Object
            objectStore.feedback.draftFeedbackObject.remove();
            // Set the current feedback object
            objectStore.feedback.currentFeedbackObject.set(feedbackObject);
            if($stateParams.username){
                $state.go('teamMemberFeedback.provideFeedback',{"tmusername":$stateParams.username});
              }
              else{
                $state.go('feedback.provideFeedback');
              }
           // $state.go('feedback.provideFeedback');
          };

          // Method: DECLINE FEEDBACK
          vm.declineFeedback = function(feedbackObject, mode) {
            // Reset Drafted Object
            objectStore.feedback.draftFeedbackObject.remove();
            // Set the current feedback object
            objectStore.feedback.currentFeedbackObject.set(feedbackObject);

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

            //$state.go('feedback.deleteFeedback');
          };

          vm.forwardFeedback = function(feedbackObject, mode)
          {
            // Reset Draft Obkect
            objectStore.feedback.draftFeedbackObject.remove();

            // Set the current feedback object
            objectStore.feedback.currentFeedbackObject.set(feedbackObject);

            if($stateParams.username){
                $state.go('teamMemberFeedback.forwardFeedback',{"tmusername":$stateParams.username});
              }
              else{
                $state.go('feedback.forwardFeedback');
              }

            //$state.go('feedback.forwardFeedback');
          };

          vm.unrequestedNewFeedback = function() {
            var loginuser = localStorageService.get("loggedInUser").username;
            var contextUser = objectStore.feedback.feedbackContextUsername.get();

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
                $state.go('teamMemberFeedback.unrequestedNew',{"tmusername":$stateParams.username});
              }
              else{
                $state.go('feedback.unrequestedNew');
              }

           // $state.go('feedback.unrequestedNew');
          };


          // clearFilter - Function clears all the filter and resets components and fiters values to what they were originally
          // This function might call to the service to reload the expected data
          vm.clearFilter = function() {
            console.log('Clear Filter on Team provide feedback table');
            vm.sort = {};
            vm.byFilterValue = 'Select';
            vm.statusFilterValue = 'Select';
            vm.tagsFilterValue = 'Select';
            vm.quarter = vm.quarters[vm.quarters.length - 1];

            vm.quarter = vm.currentFy +":"+ vm.currentQuarter;
            
            vm.reverse1 = '';
            vm.reverse2 = '';
            vm.reverse3 = '';
            vm.reverse4 = '';
            vm.searchTitle = '';
            vm.searchTitle = '';
            vm.usernameFilter = 'All'

            vm.sort.updated_on = 'DESC'
            vm.sort.filter = {};

            reset();
            activate();
          };


          vm.activateAfterSearch = function() {
            vm.sort.filter.title = vm.searchTitle != null ? vm.searchTitle : "";
            activate();
          }

          vm.getLocation = function(val) {
        
            vm.c_yr = null;
            vm.c_q = null;

            try {
              var temp = vm.quarter.split(":");
              vm.c_yr = temp[0];
              vm.c_q = temp[1];
            } catch (e) {}

            var loginuser = localStorageService.get("loggedInUser").username;
            vm.loading = true;
            var context='';
            vm.sort.filter.title = vm.searchTitle != null ? vm.searchTitle : "";

            if($stateParams.username){
                  vm.loggedInuser = localStorageService.get("loggedInUser").username;
                  loginuser = $stateParams.username;
                  context = 'TEAM';
                }else{
                  vm.loggedInuser = localStorageService.get("loggedInUser").username;
                  loginuser = localStorageService.get("loggedInUser").username;
                  context = 'SELF';
                }

            return dataservice.getProvideFeedbackSelf(vm.currentPage, vm.recordsPerPage, loginuser, vm.c_yr, vm.c_q, context, vm.sort).then(function(response) {
              objectStore.feedback.viewAllFeedbackSource.remove();
              if (Number(parseInt(response.headers()["x-total-count"])) === response.headers()["x-total-count"] && vm.totalRecord == null) {
                vm.totalRecord = parseInt(response.headers()["x-total-count"]);
              }
             
              vm.loading = false;
              if(vm.recordsPerPage >= vm.totalRecord){
            	  vm.showLoadMore = false;
              }
              else{
            	  vm.showLoadMore = true;
              }
              

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
                vm.provideFeedbackList = [];
                vm.isNoRecordsFound = true;
                if (typeof vm.sort.filter !== 'undefined') {
                  vm.sort.filter = {};
                  vm.isProvideFeedbacksLoading = false;
                  return ['No Search Results Found...'];
                }
              }
            });
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