(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcMobileTeamProfile', cpcMobileTeamProfile);

  /* @ngInject */
  function cpcMobileTeamProfile() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcMobileTeamProfile/cpcMobileTeamProfile.html',
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
  function Controller($scope, $log,$translate,$rootScope,$attrs,$state,$stateParams,$filter,localStorageService,dataservice,employeeDetails,objectStore) {
    var vm = this;
    vm.currentFy = localStorageService.get("currentFyQuarter").data.fy;
    vm.currentQuarter = localStorageService.get("currentFyQuarter").data.quarter;
    vm.isFromDrillDown = false;
    vm.showLoadMore = false;
    vm.showLoadMoreFeedback = false;
    vm.showAlternateTab = true;

    vm.getDateOnly = function(res){
      var date = new Date(res)
      var res = $filter('date')(date, "yyyy-MM-dd");
      return res;
    }

    vm.viewAlternate = function(data, view){
      data.actionType = "VIEW";
      console.log('data', data);
      objectStore.alternate.alternateManagerId.set(JSON.stringify(data));
      $state.go('alternateManager.proxySelf');
    };

    vm.deallocateAlternate = function(data){
      data.actionType = "DEALLOCATE";
      console.log('data',data);
      objectStore.alternate.alternateManagerId.set(JSON.stringify(data));
      $state.go('alternateManager.proxySelf');
    };

    vm.addAlternate = function(){
    	var reportee = vm.reportee;
        console.log('reportee ******** '+ reportee.username);
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

    $rootScope.$on('empDetail', function (event, arg) {
        vm.reportee = arg;
        console.log("username from attribute "+arg.username);
        employeeDetails.setCurrentSelectedTeamMember(arg.username);
        vm.selectedUser = arg.username;
        vm.response = false;
        vm.activateTab(1);
    });

    $rootScope.$on('alternateTeamMember', function (event, arg) {
        console.log("^^^^^^^^^^^^  "+arg);
        var alternateTeamMember = arg;
        if(alternateTeamMember == 'Y')
        	vm.showAlternateTab = false;
        else
        	vm.showAlternateTab = true;
    });

  //  vm.response = false;
    vm.currentTab = '';
    vm.totalRecord = null;


    vm.recordsPerPageConv = 5;
    vm.recordsPerPageAlternate = 5;
    vm.recordsPerPageFeedback = 5;

    vm.totalConvCount = null;
    vm.totalFeedbackCount = null;
    vm.currentPageConv = 1;
    vm.currentPageAlternate = 1;
    vm.currentPageFeedback = 1;
    vm.currentPage = 1;
    vm.maxSize = 3;

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
      			vm.quarterConv = vm.currentFy +":"+ vm.currentQuarter;
                vm.quarterAlternate = vm.currentFy +":"+ vm.currentQuarter;
                vm.quarter = vm.currentFy +":"+ vm.currentQuarter;
      		}
      	}
      });

    vm.sort = {"sort":{"updated_on":"DESC"}};
    vm.sort_conv = {"sort":{"last_updated_on":"DESC"}};
    vm.sort_alt = {"sort":{}};

    vm.activateTab = function(data) {
        console.log("activateTab in mobile profile");
        vm.currentTab = data;
        vm.recordsPerPageConv = 5;
        vm.recordsPerPageAlternate = 5;
        vm.recordsPerPageFeedback = 5;
        activate();
      };

    function activate() {
          if(vm.currentTab == "1"){
            var loggedInuser = localStorageService.get("loggedInUser").username;
            console.log("in mobile profile "+vm.selectedUser);

            var c_yr = null;
            var c_q = null;
            try {
              var temp = vm.quarterConv.split(":");
              c_yr = temp[0];
              c_q = temp[1];
            }
            catch(e){}
            console.log("c_yr "+c_yr);
            console.log("c_q "+c_q);

          //  vm.response = false;
            vm.loading = true;

            if(c_yr == null)
            	c_yr = vm.currentFy;
            if(c_q == null)
            	c_q = vm.currentQuarter;

            dataservice.getConversationTeamMgr(vm.currentPageConv,vm.recordsPerPageConv,vm.selectedUser,loggedInuser,vm.sort_conv,"TEAM",c_yr,c_q).then(function(response){
              if(Number(parseInt(response.headers()["x-total-count"])) == response.headers()["x-total-count"] && vm.totalConvCount == null) {
                vm.totalConvCount = parseInt(response.headers()["x-total-count"]);
              }
              vm.loading = false;
              if(response.status === 200 || response.status === 201) {
                if (typeof response.data !== 'undefined') {
                  vm.response = response.data[0].serverdata;
                  console.log("total "+vm.totalConvCount+" : "+vm.recordsPerPageConv);
                  if(vm.recordsPerPageConv >= vm.totalConvCount){
                	  vm.showLoadMore = false;
                  }
                  else{
                	  vm.showLoadMore = true;
                  }
                }
              }
              else{
                vm.response = false;
              }
            });
          }
          else if(vm.currentTab == "2"){
            console.log("tab 2 selected");
            vm.isLoadActivityRunning = true;
            vm.loading = true;
            var loggedInuser = localStorageService.get("loggedInUser").username;
            vm.selectedUser = employeeDetails.getCurrentSelectedTeamMember();

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


            if(c_yr == null)
              c_yr = vm.currentFy;
            if(c_q == null)
              c_q = vm.currentQuarter;


//            vm.sort = {"sort":{"updated_on":"DESC"}};

            dataservice.getRequestFeedbackSelf(vm.currentPageFeedback,vm.recordsPerPageFeedback, vm.selectedUser, c_yr, c_q, "TEAM", vm.sort)
              .then(function(response){
            	if(Number(parseInt(response.headers()["x-total-count"])) == response.headers()["x-total-count"] && vm.totalFeedbackCount == null) {
            		vm.totalFeedbackCount = parseInt(response.headers()["x-total-count"]);
            		console.log("******* "+vm.totalFeedbackCount);
                }
            	vm.loading = false;
            	vm.reqrecFeedbackList = false;
                console.info('called getRequestFeedbackSelf')
                if(response.status == 200 || response.status === 201){
                	if(vm.recordsPerPageFeedback >= vm.totalFeedbackCount){
                  	  vm.showLoadMoreFeedback = false;
                    }
                    else{
                  	  vm.showLoadMoreFeedback = true;
                    }
                	vm.isLoadActivityRunning = false;
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
          else if(vm.currentTab == "3"){
        	vm.AlternateTeamDetails = false;
        	vm.loading = true;
            console.log("tab 3 selected");
            var loggedInuser = localStorageService.get("loggedInUser").username;
            vm.selectedUser = employeeDetails.getCurrentSelectedTeamMember();

            vm.loading = true;

            if (c_yr == null)
              c_yr = vm.currentFy;
            if (c_q == null)
              c_q = vm.currentQuarter;

            dataservice.getMyAllAlternateMgrList(vm.currentPageAlternate, vm.recordsPerPageAlternate, vm.selectedUser, loggedInuser, vm.sort_alt).then(function (response) {
              vm.loading = false;
              if (response.status === 200 || response.status === 201) {
                if (typeof response.data !== 'undefined') {
                  //vm.response = response.data;
                  vm.totalRecord = response.data.metadata.totalcount;
                  if(vm.totalRecord == 0)
                	  vm.AlternateTeamDetails = false;
                  else
                	  vm.AlternateTeamDetails = response.data.serverdata;
                  console.log('vm.response', vm.response);
                }
              }
              else {
            	  vm.AlternateTeamDetails = false;
              }
            });
          }

        };



    vm.changedQuarterValueConv = function() {
            console.log(vm.quarterConv);
            vm.currentPageConv = 1;
            vm.totalConvCount = null;
            vm.recordsPerPageConv = 5;
            activate();
          };

    vm.getAllConversations = function(){
    	if(vm.recordsPerPageConv < vm.totalConvCount){
    		vm.recordsPerPageConv = vm.recordsPerPageConv + 5;
    	}
    	activate();
    }

    vm.getMoreFeedbacks = function(){
    	if(vm.recordsPerPageFeedback < vm.totalFeedbackCount){
    		vm.recordsPerPageFeedback = vm.recordsPerPageFeedback + 5;
    	}
    	activate();
    }

	vm.getConversationTags = function(tagsArray){
		var tagsString = '';
		angular.forEach(tagsArray, function(value, key){
	        if(key < tagsArray.length - 1)
	        {
	          tagsString += value+', ';
	        } else if(key === tagsArray.length - 1)
	        {
	          tagsString += value;
	        }
	    });
	return tagsString;
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

      vm.createNewConversation = function(){
    	objectStore.conversation.draftConversation.remove();
      	objectStore.conversation.createConversationSource.set("ModalPopUp");
      	$state.go("conversationdetails.newConversation");
      }

      vm.viewAllConversations = function(){
    	  if(!vm.isFromDrillDown)
          {
        	$state.go('conversationsTeamMember.self', {"tmusername": vm.selectedUser,"drillDownUser":"false"});
          }
          else {
            $state.go('conversationsTeamMember.self', {"tmusername": vm.selectedUser,"drillDownUser":"true"});
          }
    	}

      vm.shareWithTeamMember = function(conversationObject){
      	objectStore.conversation.draftConversation.set(conversationObject);
      	objectStore.conversation.createConversationSource.set("ModalPopUp");
      	$state.go("conversationdetails.newConversation");
      }

      vm.respondToTeamMember = function(conversationObject){
      	objectStore.conversation.sharedConversation.set(conversationObject);
      	$state.go("conversationdetails.sharedConversation");
      }

      vm.viewConverstaion = function(conversationObject){
      	objectStore.conversation.sharedConversation.set(conversationObject);
      	$state.go("conversationdetails.viewConversation");
      }

      vm.goToDeleteConversation = function(conversationObject){
      	objectStore.conversation.draftConversation.set(conversationObject);
          objectStore.conversation.createConversationSource.set("ModalPopUp");
        	$state.go("conversationdetails.newConversation");
      }

      vm.isConversationDraft = function(conversation){
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

      vm.conversationSubmittedBy = function(conversationObject){
        if(typeof conversationObject !== 'undefined'){
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

      vm.truncateConversationTitle = function(title){
        var convTitle = title;
        if(convTitle!=null && convTitle.length > 20){
          convTitle = convTitle.substring(0,20)+"...";
        }
        return convTitle;
      };

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
        }

//        console.log("----------> " + JSON.stringify(feedbackStatusObject));

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
            $state.go('feedback.pendingFeedback');
          }
        } else if (feedbackObject.feedbackStatus === 'COMPLETE') {
          $state.go('feedback.viewFeedback');
        } else if (feedbackObject.feedbackStatus === 'NOTSHARE') {
          $state.go('feedback.viewFeedback');
        } else if (feedbackObject.feedbackStatus === 'DECLINE') {
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
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$ "+username);
        objectStore.feedback.viewAllFeedbackUsername.set(username);
        objectStore.feedback.feedbackContextUsername.set(username);
        $state.go('feedback.recieve');
      };

      vm.requestNewFeedback = function(username)
      {
        //objectStore.feedback.viewAllFeedbackUsername.set(username);
        objectStore.feedback.feedbackContextUsername.set(username);
        $state.go('feedback.requestedNew');
      };

      vm.changedQuarterValue = function() {
          console.log(vm.quarter);
          vm.recordsPerPageFeedback = 5;
          vm.currentPageFeedback = 1;
          vm.totalFeedbackCount = null;
          activate();
        };

      vm.changedQuarterValueAlternate = function() {
            console.log(vm.quarterAlternate);
            vm.currentPageAlternate = 1;
            vm.recordsPerPageAlternate = 5;
            vm.totalRecord = null;
            activate();
      };

      vm.numPages = function(){
        return angular.noop;
      }
  }
})();
