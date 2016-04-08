(function() {
  'use strict';

  angular
    .module('cpccore')
    .controller('HomeTabCtrl', HomeTabCtrl);

  HomeTabCtrl.$inject = ['$modalInstance', 'reportee','alternateTeamMember','$filter','dataservice','localStorageService','employeeDetails','$timeout','$rootScope', '_','$scope','$location','$window','$state','objectStore','$stateParams'];

  /* @ngInject */
  function HomeTabCtrl($modalInstance,reportee,alternateTeamMember,$filter,dataservice,localStorageService,employeeDetails,$timeout,$rootScope, _,$scope,$location,$window,$state,objectStore,$stateParams) {
    var vm = this;

    // Request New Feedback Button Availability
    vm.isRequestNewFeedbackButtonAvailable = true;

    // Get Team Members and Alternate Team members
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

    $rootScope.$on('$stateChangeStart',function(event, toState, toParams, fromState, fromParams){
      $modalInstance.close();
    });

    $scope.reportee = reportee;
    console.log("^^^^^^^^^^^^^    "+alternateTeamMember);
    if(alternateTeamMember == 'Y')
    	vm.showAlternateTab = false;
    else
    	vm.showAlternateTab = true;

    vm.getDateOnly = function(res){
      var date = new Date(res)
      var res = $filter('date')(date, "yyyy-MM-dd", "UTC");
      return res;
    }

    vm.viewAlternate = function(data, view){
      data.actionType = "VIEW";
      objectStore.alternate.alternateManagerId.set(JSON.stringify(data));
      /*$state.go('alternateManager.proxySelf');*/
      if($stateParams.username){
        $state.go('teamMemberAlternateManager.proxySelf',{"tmusername":$stateParams.username});
      }
      else{
        $state.go('alternateManager.proxySelf');
      }
    };

    vm.deallocateAlternate = function(data){
      data.actionType = "DEALLOCATE";
      console.log('data',data);
      objectStore.alternate.alternateManagerId.set(JSON.stringify(data));
      /*$state.go('alternateManager.proxySelf');*/
      if($stateParams.username){
        $state.go('teamMemberAlternateManager.proxySelf',{"tmusername":$stateParams.username});
      }
      else{
        $state.go('alternateManager.proxySelf');
      }
    };

    vm.addAlternate = function(){
      var reportee = $scope.reportee;
      console.log('reportee', $scope.reportee);
      var data = {
        "id": reportee.id,
        "user_id": reportee.id,
        "user_username": reportee.username,
        "proxy_user_id": "",
        "proxy_username": "",
        "status": "",
        "type": null,
        "proxy_type": "",
        "start_date":new Date().getTime() ,
        "end_date": new Date().setMonth(new Date().getMonth() + 1),
        "created_by": "",
        "created_on": "",
        "updated_by": null,
        "updated_on": null,
        "start_date_String": "",
        "end_date_String": ""
      };
      data.actionType = "VIEWMODAL";
      objectStore.alternate.alternateManagerId.set(JSON.stringify(data));
      /*$state.go('alternateManager.proxySelf');*/
      if($stateParams.username){
        $state.go('teamMemberAlternateManager.proxySelf',{"tmusername":$stateParams.username});
      }
      else{
        $state.go('alternateManager.proxySelf');
      }
    };

    $scope.$on('empDetail', function (event, arg) {
        vm.reportee = arg;
        console.log("username from attribute "+arg.username);
        employeeDetails.setCurrentSelectedTeamMember(arg.username);
        vm.selectedUser = arg.username;
        vm.response = false;
        vm.activateTab(1);
      console.log('event broadcast', arg)
    });

    vm.isFromDrillDown = false;
    if(typeof $stateParams.username !== 'undefined')
    {
      //From drilldown
      vm.isFromDrillDown = true;
    }


    vm.response = false;
    vm.currentTab = '';
    vm.totalRecord = null;
    // enter the value here to modify number of items shown in one page
    vm.recordsPerPage = 5;

    vm.currentPageConv = 1;
    vm.currentPageAlternate = 1;
    vm.currentPageFeedback = 1;
    vm.maxSize = 3;

    //Quarter dropdown start
    vm.currentFy = localStorageService.get("currentFyQuarter").data.fy;
    vm.currentQuarter = localStorageService.get("currentFyQuarter").data.quarter;
 //   alert("modal page "+vm.currentFy+" : "+vm.currentQuarter);

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
//    				for(var q in quartersInFy){
    				for (var q = 0; q < quartersInFy.length; q++) {
    					console.log("******** "+q);
    					var outQ = {"year":fiscalYear,"quarter":quartersInFy[q],"display":fiscalYear +" "+quartersInFy[q],"id":fiscalYear +":"+quartersInFy[q]};
    					vm.quarters.push(outQ);
    				}
    			}
    			vm.quarterConv = vm.currentFy +":"+ vm.currentQuarter;
                vm.quarterAlternate = vm.currentFy +":"+ vm.currentQuarter;
                vm.quarter = vm.currentFy +":"+ vm.currentQuarter;
    		}
    	}
    });


    /*var currentYear = new Date().getFullYear();
    dataservice.getCurrentQuartersInFiscalYear(currentYear).then(function(year_response){
      if(year_response.status === 200) {
        dataservice.getCurrentQuarter().then(function(curr_year_response){
          if(curr_year_response.status === 200)
          {
            vm.fy_currentYear = "FY"+currentYear;
            var year_data = year_response.data;
            var quarter_data = curr_year_response.data;
            vm.currentQuarter = quarter_data[vm.fy_currentYear];
            var current_yr_q = year_data[vm.fy_currentYear];
            vm.quarters = new Array();
            for(var q in current_yr_q){
              var out = {"year":currentYear,"quarter":current_yr_q[q],"display":"FY "+currentYear+" "+current_yr_q[q],"id":"FY"+currentYear+":"+current_yr_q[q]}
              vm.quarters.push(out);
            }
            vm.quarterConv = "FY"+currentYear+":"+current_yr_q[current_yr_q.length - 1];
            vm.quarterAlternate = "FY"+currentYear+":"+current_yr_q[current_yr_q.length - 1];
            vm.quarter = "FY"+currentYear+":"+current_yr_q[current_yr_q.length - 1];
          }
        });
      }
    });*/
    //Quarter dropdown end

    vm.sort = {"sort":{"updated_on":"DESC"}};
    vm.sort_conv = {"sort":{"last_updated_on":"DESC"}};
    vm.sort_alt = {"sort":{}};

    vm.go = function (path) {
      $location.path(path);
    };

    function activate() {
      employeeDetails.setCurrentSelectedTeamMember(reportee.username);
      vm.selectedUser = reportee.username;

      if(vm.currentTab == "1"){
        var loggedInuser = localStorageService.get("loggedInUser").username;
        vm.selectedUser = employeeDetails.getCurrentSelectedTeamMember();

        var c_yr = null;
        var c_q = null;

        console.log("before "+vm.quarterConv);
        try {
          var temp = vm.quarterConv.split(":");
          c_yr = temp[0];
          c_q = temp[1];
        }
        catch(e){}

        vm.response = false;
        vm.loading = true;


        if(c_yr == null)
          c_yr = vm.currentFy;
        if(c_q == null)
          c_q = vm.currentQuarter;

        dataservice.getConversationTeamMgr(vm.currentPageConv,vm.recordsPerPage,vm.selectedUser,loggedInuser,vm.sort_conv,"TEAM",c_yr,c_q).then(function(response){
          console.info('called getConversationTeamMgr');
           if(Number(parseInt(response.headers()["x-total-count"])) == response.headers()["x-total-count"] && vm.totalRecord == null) {
                vm.totalRecord = parseInt(response.headers()["x-total-count"]);
              }
          vm.loading = false;
          if(response.status === 200 || response.status === 201) {
            if (typeof response.data !== 'undefined') {
              //vm.response = response.data;
              vm.response = response.data[0].serverdata;
            }
          }
          else{
            vm.response = false;
          }
        });
      }
      else if(vm.currentTab == "2"){
        vm.isLoadActivityRunning = true;
        console.log("tab 2 selected");
        var loggedInuser = localStorageService.get("loggedInUser").username;
        vm.selectedUser = employeeDetails.getCurrentSelectedTeamMember();

        if(vm.teamMembersList.length > 0 || vm.alternateTeamMemberList.length > 0)
        {
          // Request New Feedback Button Availability
          if(vm.teamMembersList.indexOf(vm.selectedUser) === -1 && vm.alternateTeamMemberList.indexOf(vm.selectedUser) === -1)
          {
            vm.isRequestNewFeedbackButtonAvailable = false;
          } else 
          {
            vm.isRequestNewFeedbackButtonAvailable = true;
          }
        } else 
        {
          vm.isRequestNewFeedbackButtonAvailable = false;
        }

        $window.selectedTeamMember = vm.selectedUser;

        vm.currentPage = 1;
        //   vm.recordsPerPage = 5;
        //   vm.c_yr = 'FY2015';
        //   vm.c_q = 'Q4';

        var c_yr = null;
        var c_q = null;

        console.log("before ", vm.quarter, vm.currentPageFeedback);
        try {
          var temp = vm.quarter.split(":");
          c_yr = temp[0];
          c_q = temp[1];
        }
        catch(e){}
        console.log("after "+c_yr+" : "+c_q);

        /*
         TODO : This service is not working properly with paginaton. Remember to fix service.
         */
        if(c_yr == null)
          c_yr = vm.currentFy;
        if(c_q == null)
          c_q = vm.currentQuarter;


//        vm.sort = {"sort":{"updated_on":"DESC"}};

        dataservice.getRequestFeedbackSelf(vm.currentPageFeedback,vm.recordsPerPage, vm.selectedUser, c_yr, c_q, "TEAM", vm.sort)
          .then(function(response){
            if(Number(parseInt(response.headers()["x-total-count"])) == response.headers()["x-total-count"] && vm.totalRecord == null) {
                vm.totalRecord = parseInt(response.headers()["x-total-count"]);
              }
            console.info('called getRequestFeedbackSelf')
            if(response.status == 200 || response.status === 201){
              vm.isLoadActivityRunning = false;
              //console.log(JSON.stringify(response));
              vm.reqrecFeedbackList = response.data.content[0].FeedbackData;
              vm.byFilter = _.uniq(_.pluck(vm.reqrecFeedbackList, 'requested_by'));
              vm.status = _.uniq(_.pluck(vm.reqrecFeedbackList, 'feedbackStatus'));
            }
            else{
              vm.isLoadActivityRunning = false;
              vm.reqrecFeedbackList = false;
              console.log("This is the error ", response.data);
            }

          });
      }
      else if(vm.currentTab == "3") {
        vm.loadingAlternate = true;
        if($stateParams.username){
          vm.isDrilldown = false;
        }else{
          vm.isDrilldown = true;
        }
        var loggedInuser = localStorageService.get("loggedInUser").username;
        //console.log("******* loggedInuser "+loggedInuser);
        vm.selectedUser = employeeDetails.getCurrentSelectedTeamMember();
        $window.selectedTeamMember = vm.selectedUser;
        //console.log("******* selectedUser "+vm.selectedUser);

        /*
         TODO : This service is not working properly with paginaton. Remember to fix service.
         */
        if (c_yr == null)
          c_yr = vm.currentFy;
        if (c_q == null)
          c_q = vm.currentQuarter;

        dataservice.getMyAllAlternateMgrList(vm.currentPageAlternate, vm.recordsPerPage, vm.selectedUser, loggedInuser, vm.sort_alt).then(function (response) {
          vm.loading = false;
          if (response.status === 200 || response.status === 201) {
            if (typeof response.data !== 'undefined') {
              //vm.response = response.data;

              if(response.data.metadata.totalcount == 0){
                vm.AlternateTeamDetails = false;
                vm.loadingAlternate = false;
              }else{
                vm.totalRecordAlternate = response.data.metadata.totalcount;
                vm.AlternateTeamDetails = response.data.serverdata;
                vm.loadingAlternate = false;
              }
            }
          }
          else {
            vm.AlternateTeamDetails = false;
          }
        });
      }
    }

    vm.fetchReqrecFeedbackStatus = function(feedbackStatus)
    {
      var feedbackStatusObject = {};
      if(feedbackStatus === 'COMPLETE' || feedbackStatus === 'NOTSHARE')
      {
        feedbackStatusObject.iconClass = 'feedbackProvided';
        feedbackStatusObject.statusString = 'Received';
        feedbackStatusObject.actionCode = 2;
        feedbackStatusObject.statusCode = 3;
        feedbackStatusObject.status = 'COMPLETE';

        console.log("----*********FB STATUS*******------> " + JSON.stringify(feedbackStatusObject));
      } else if(feedbackStatus === 'PENDING')
      {
        feedbackStatusObject.iconClass = 'feedbackYetToProvide';
        feedbackStatusObject.statusString = 'Requested';
        feedbackStatusObject.actionCode = 3;
        feedbackStatusObject.statusCode = 2;
        feedbackStatusObject.status = 'PENDING';

      } else if(feedbackStatus === 'DRAFT')
      {
        feedbackStatusObject.iconClass = 'feedbackYetToProvide';
        feedbackStatusObject.statusString = 'Draft';
        feedbackStatusObject.actionCode = 1;
        feedbackStatusObject.statusCode = 1;
        feedbackStatusObject.status = 'DRAFT';

      } else if(feedbackStatus === 'DECLINE')
      {
        feedbackStatusObject.iconClass = 'feedbackDeclined';
        feedbackStatusObject.statusString = 'Declined';
        feedbackStatusObject.actionCode = 2;
        feedbackStatusObject.statusCode = 5;
        feedbackStatusObject.status = 'DECLINED';
      } else if(feedbackStatus === 'FORWARD')
      {
        feedbackStatusObject.iconClass = 'feedbackProvided';
        feedbackStatusObject.statusString = 'Received';
        feedbackStatusObject.actionCode = 2;
        feedbackStatusObject.statusCode = 3;
        feedbackStatusObject.status = 'COMPLETE';
      }

      console.log("----FB STATUS------> " + JSON.stringify(feedbackStatusObject));

      return feedbackStatusObject;
    };

    vm.viewFeedback = function(feedbackObject, mode, username)
    {
      console.log("This si sView feedback of " + JSON.stringify(feedbackObject) + ' ' + mode);

      var loginuser = localStorageService.get("loggedInUser").username;
      // Details of this function
      // Button Pressed - View. Possible Status - 5 [DRAFT, PENDING, COMPLETE, NOTSHARE, DECLINE]
      // View + DRAFT = Shared + Editable feedback window[Provide(green button)]
      // View + PENDING = Shared + Provide(green button) at the bottom
      // View + COMPLETE = Shared (view only mode && no option)
      // View + NOTSHARE = Shared (view only mode && no option)
      // View + DECLINE = Shared (view only mode && no option)

      // Set context User name
      objectStore.feedback.feedbackContextUsername.set(username);

      objectStore.feedback.currentFeedbackObject.set(feedbackObject);

      // console.log(JSON.stringify(feedbackObject));
      if (feedbackObject.feedbackStatus === 'DRAFT') {
        $state.go('feedback.requestedNew');
      } else if (feedbackObject.feedbackStatus === 'PENDING') {
        // loginuser == feedback owner then viewFeedback else pendingFeedback
        if (loginuser === feedbackObject.requester) {
          $state.go('feedback.viewFeedback');
        } else if (loginuser !== feedbackObject.requester) {
          //$state.go('feedback.pendingFeedback');
          $state.go('feedback.viewFeedback');
        }
      } else if (feedbackObject.feedbackStatus === 'COMPLETE') {
        $state.go('feedback.viewFeedback');
      } else if (feedbackObject.feedbackStatus === 'NOTSHARE') {
        $state.go('feedback.viewFeedback');
      } else if (feedbackObject.feedbackStatus === 'DECLINE') {
        $state.go('feedback.viewFeedback');
      } else if(feedbackObject.feedbackStatus === 'FORWARD') {
        $state.go('feedback.viewFeedback');
      }
    };

    // Method: PROVIDE FEEDBACK
    vm.sendReminder = function(feedbackObject, mode) {
      // Set the object to make it available Globally
      objectStore.feedback.currentFeedbackObject.set(feedbackObject);

      console.log("THESE ARE THE OBJECT "+JSON.stringify(feedbackObject));
      $state.go('feedback.sendFeedbackReminder');
    };

    //feedback.recieve
    vm.viewAllUserFeedback = function(username)
    {
      objectStore.feedback.viewAllFeedbackUsername.set(username);
      objectStore.feedback.feedbackContextUsername.set(username);

      $state.go('teamMemberFeedback.recieve',{"username":username});

     // $state.go('feedback.recieve');
    };

    vm.requestNewFeedback = function(username)
    {
      //objectStore.feedback.viewAllFeedbackUsername.set(username);
      objectStore.feedback.feedbackContextUsername.set(username);
      $state.go('feedback.requestedNew');
    };

    vm.getStatusOptionsConverstaion = function(convStatus,ownerUsername, targetUsername){
      var loggedinUser = localStorageService.get("loggedInUser").username;
      var status ;
      if([ownerUsername,targetUsername].indexOf(loggedinUser) > -1){
        if(convStatus == "CLOSE")
          status = "1";
        else if(convStatus == "DRAFT")
          status = "2";
        else if(convStatus == "OPEN"){
          if(ownerUsername == loggedinUser)
            status = "1";
          else
            status = "3";
        }
      }
      else{
        status = "1";
      }
      return status;
    };

    vm.activateTab = function(data) {
    	vm.currentTab = data;
        vm.recordsPerPage = 5;
        activate();
    };

    vm.numPages = function()
    {
      return angular.noop;
    }

    vm.changePageConv = function() {
      console.log(vm.currentPageConv);
      vm.response = false;
      vm.loading = true;
      //call service here with the current page to be shown.
      activate();
    };

    vm.changePageFeedback = function(){
      console.log(vm.currentPageFeedback);
      vm.isLoadActivityRunning = true;
      vm.reqrecFeedbackList = false;
      vm.loading = true;
      //call service here with the current page to be shown.
      activate();
    };

    vm.changePageAlternate = function(){
      console.log(vm.currentPageAlternate);
      vm.isLoadActivityRunning = true;
      vm.alternateList = false;
      vm.loading = true;
      //call service here with the current page to be shown.
      activate();
    };

    vm.changePage = function() {
      console.log(vm.currentPage);
      vm.response = false;
      vm.loading = true;
      //call service here with the current page to be shown.
      activate();
    };

    vm.changedQuarterValueAlternate = function() {
      console.log(vm.quarterAlternate);
      vm.currentPageAlternate = 1;
      vm.totalRecord = null;
      //call service here
      activate();
    };

    vm.changedQuarterValueConv = function() {
      console.log(vm.quarterConv);
      vm.currentPageConv = 1;
      vm.totalRecord = null;
      //call service here
      activate();
    };

    vm.changedQuarterValue = function() {
      console.log(vm.quarter);
      vm.currentPage = 1;
      vm.totalRecord = null;
      //call service here
      activate();
    };
//    vm.sort = {"sort":{"topicTitle":"ASC"},"filter":{}};

    vm.sortColumn = function (column, sortType) {
      vm.sort.sort = {};
      if (sortType === true) {
        vm.sort.sort[column] = "DESC";
        //console.log(column + 'descending')
        //call service here
        activate();
      } else if (sortType === false) {
        vm.sort.sort[column] = "ASC";
        //console.log(column + 'ascending');
        //call service here
        activate();
      }
    };

    vm.sortColumn_conv = function (column, sortType) {
      vm.sort_conv.sort = {};
      if (sortType === true) {
        vm.sort_conv.sort[column] = "DESC";
        //console.log(column + 'descending')
        //call service here
        activate();
      } else if (sortType === false) {
        vm.sort_conv.sort[column] = "ASC";
        //console.log(column + 'ascending');
        //call service here
        activate();
      }
    };

    vm.sortColumn_alt = function (column, sortType) {
      vm.sort_alt.sort = {};
      if (sortType === true) {
        vm.sort_alt.sort[column] = "DESC";
        //console.log(column + 'descending')
        //call service here
        activate();
      } else if (sortType === false) {
        vm.sort_alt.sort[column] = "ASC";
        //console.log(column + 'ascending');
        //call service here
        activate();
      }
    };

    vm.createNewSyncUpConversation = function(path){
      objectStore.conversation.draftConversation.remove();
      objectStore.conversation.createConversationSource.set("ModalPopUp");
      //$modalInstance.close();
      $state.go("conversationdetails.newConversation");
    };

    vm.shareWithTeamMember = function(conversationObject){
      objectStore.conversation.draftConversation.set(conversationObject);
      objectStore.conversation.createConversationSource.set("ModalPopUp");
      //$modalInstance.close();
      $state.go("conversationdetails.newConversation");
    }

    vm.respondToTeamMember = function(conversationObject){
      objectStore.conversation.sharedConversation.set(conversationObject);
      //$modalInstance.close();
      $state.go("conversationdetails.sharedConversation");
    }

    vm.viewConverstaion = function(conversationObject){
      objectStore.conversation.sharedConversation.set(conversationObject);
      //$modalInstance.close();
      $state.go("conversationdetails.viewConversation");
    }

    vm.goToDeleteConversation = function(conversationObject){
      objectStore.conversation.draftConversation.set(conversationObject);
      objectStore.conversation.createConversationSource.set("ModalPopUp");
      //$modalInstance.close();
      $state.go("conversationdetails.newConversation");
    }

    vm.viewAllSyncUpConversations = function(path){
      //Take the common part of the URL and attach the path coming in
      // Set Source of origin of feedback request
      objectStore.feedback.viewAllReceivedFeedbackSource.set('modal');
      if(!vm.isFromDrillDown)
      {
        $state.go('conversationsTeamMember.viewAllSelf', {"username":vm.selectedUser,"tmusername": vm.selectedUser,"drillDownUser":"false"});
        //$state.go('conversations.selfState');
      }
      else {
        $state.go('conversationsTeamMember.self', {"tmusername": vm.selectedUser,"drillDownUser":"true"});
      }
    };

    vm.isConversationDraft = function(conversation)
    {
      var conversationDraftStatus = false;
      if(conversation!=null && typeof conversation !== 'undefined') {
        if (conversation.conversation[0].status === 'DRAFT') {
          conversationDraftStatus = true;
        } else if (conversation.conversation[0].status === 'EMP_SUBMIT' || conversation.conversation[0].status === 'MGR_SUBMIT') {
          conversationDraftStatus = false;
        }
      }
      return conversationDraftStatus;
    };

    vm.conversationSubmittedBy = function(conversationObject)
    {
      if(typeof conversationObject !== 'undefined')
      {
        var submittedBy = conversationObject.status==='EMP_SUBMIT'?'E':'M';

        return submittedBy;
      }
    };

    vm.hasAttachment = function(data)
    {
      var returnval = false;
      angular.forEach(data.conversation, function(item){
        angular.forEach(item.attachmentId, function(value,key){
          //console.log(key +"  "+key.length);
          if(key.length > 0){
            returnval= true;

          }
        })
      })
      return returnval;
    }

    vm.closePopover = function() {
      $modalInstance.close();
    };

    // Truncate Feedback Title
    vm.truncateConversationTitle = function(title)
    {
      var convTitle = title;
      if(convTitle!=null && convTitle.length > 20)
      {
        convTitle = convTitle.substring(0,20)+"...";
      }
      return convTitle;
    };

  }
})();
