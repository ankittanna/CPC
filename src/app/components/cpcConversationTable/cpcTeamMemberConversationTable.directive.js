// JavaScript Document
(function () {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcTeamMemberConversationTable', cpcTeamMemberConversationTable);

  /* @ngInject */
  function cpcTeamMemberConversationTable() {
    // Usage:
    //
    // Creates:
    //

    var directive = {
      templateUrl: '/client/app/components/cpcConversationTable/cpcConversationTable.html',
      bindToController: true,
      controller: Controller,
      controllerAs: 'vm',
      link: link,
      restrict: 'E',
      scope: {}
    };
    return directive;

    function link(scope, element, attrs) {
      attrs.$observe('username', function(value) {
        if (value) {
          scope.tUser = value;
        }
      });
    }
  }

  /* @ngInject */
  function Controller($log, $translate, $scope, dataservice, _, $http, localStorageService,$window,$location,objectStore,$state,$stateParams) {

    var vm = this;
    vm.showLoadMore = false;
    vm.currentFy = localStorageService.get("currentFyQuarter").data.fy;
    vm.currentQuarter = localStorageService.get("currentFyQuarter").data.quarter;

    vm.previousFy = localStorageService.get("currentFyQuarter").data.previousFY;
    vm.previousQuarter = localStorageService.get("currentFyQuarter").data.previousQuarter;

    vm.showPreviousQuarter = true;
    vm.context = "TEAM";
    //$scope.user = typeof $window.teamMemberUserName === 'undefined'?$scope.tUser:$window.teamMemberUserName;
    $scope.user = typeof $stateParams.tmusername === 'undefined'?$scope.tUser:$stateParams.tmusername;

    console.log("%%%%%%%%%%%%%%isAlternateTeamMember  "+$stateParams.isAlternateTeamMember);
    /* condition to decide context value */
  	if($stateParams.isAlternateTeamMember == "true"){
  		vm.context = "ALTERNATE";
  	}
  	else if($stateParams.isAlternateTeamMember == "false"){
  		vm.context = "TEAM";
  	}

    vm.showAddSyncUpBtn = false;
    vm.response = false;
    vm.totalRecord = null;
    vm.recordsPerPage = 10;

    vm.currentPage = 1;
    vm.maxSize = 3;
    vm.sort = {"sort":{"topicTitle":"ASC"},"filter":{}};
    activate();
    vm.numPages = function()
    {
      return angular.noop;
    }

    vm.changePage = function () {
      console.log(vm.currentPage);
      vm.response = false;
      vm.loading = true;
      //call service here with the current page to be shown.
      activate();
    };


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
    			//	vm.quarters.push(outFy);
    				var quartersInFy = fyQuarters[fiscalYear];
    				console.log(quartersInFy);
//    				for(var q in quartersInFy){
    				for (var q = 0; q < quartersInFy.length; q++) {
    					console.log("******** "+q);
    					if(fiscalYear!=vm.currentFy){
    						var outQ = {"year":fiscalYear,"quarter":quartersInFy[q],"display":fiscalYear +" "+quartersInFy[q],"id":fiscalYear +":"+quartersInFy[q]};
        					vm.quarters.push(outQ);
    					}
    					else{
    						if(quartersInFy[q]!=vm.currentQuarter){
        						var outQ = {"year":fiscalYear,"quarter":quartersInFy[q],"display":fiscalYear +" "+quartersInFy[q],"id":fiscalYear +":"+quartersInFy[q]};
            					vm.quarters.push(outQ);
        					}
    					}
    				}
    			}
    				vm.quarter = vm.previousFy + ":" + vm.previousQuarter;
    		}
    	}
    });




    function activate() {
      console.log('activate');

      vm.c_yr = null;
      vm.c_q = null;

      try {
        var temp = vm.quarter.split(":");
        vm.c_yr = temp[0];
        vm.c_q = temp[1];
      }
      catch (e) {
      }


      var conversationabout = $scope.user;
      var loginuser = localStorageService.get("loggedInUser").username;

      vm.loading = true;

            vm.c_yr = vm.c_yr == null ? vm.previousFy : vm.c_yr;
            vm.c_q = vm.c_q == null ? vm.previousQuarter : vm.c_q;

            dataservice.getConversation(vm.context, vm.currentPage, vm.recordsPerPage, vm.c_yr, vm.c_q, conversationabout, loginuser, vm.sort).then(function (response) {
			        if(Number(parseInt(response.headers()["x-total-count"])) == response.headers()["x-total-count"] && vm.totalRecord == null) {
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
                if (typeof response.data !== 'undefined') {
                  vm.response = response.data[0].serverdata;

                  var metaData = response.data[0].metadata;
                  vm.status = metaData.statusFilter;
                  vm.tags =  metaData.tagFilter;

                }
              }
              else {
                vm.response = false;
                vm.status = null,vm.tags = null;
                if(typeof vm.sort.filter !== 'undefined') {
                  vm.sort.filter = {};
               }
              }
            });
    }
    
    vm.getMoreConversations = function(){
    	if(vm.recordsPerPage < vm.totalRecord){
    		vm.recordsPerPage = vm.recordsPerPage + 5;
    	}
    	activate();
    }
    
    var reset = function()
    {
      vm.currentPage = 1;
      vm.totalRecord = null;
      //call service here
      vm.response = false;
    }

    vm.go = function (path) {
      $location.path(path);
    };

    vm.changedQuarterValue = function () {
      console.log(vm.quarter);
      reset();
      activate();
    };
    vm.changedBy = function () {

    };
    vm.changedStatus = function () {
      console.log(vm.statusFilterValue);
      vm.sort.filter.convStatus = vm.statusFilterValue!=null?vm.statusFilterValue:"";

      reset();
      //call service here
      activate();
    };
    vm.changedTags = function () {
      console.log(vm.tagsFilterValue);
      vm.sort.filter.tags = vm.tagsFilterValue!=null?vm.tagsFilterValue:"";

      reset();
      //call service here
      activate();
    };
    vm.clearFilters = function () {
      vm.byFilterValue = 'Select';
      vm.statusFilterValue = 'Select';
      vm.tagsFilterValue = 'Select';
//      vm.quarter = vm.quarters[vm.quarters.length-1];
      vm.reverse1 = '';
      vm.reverse2 = '';
      vm.reverse3 = '';
      vm.reverse4 = '';
      vm.reverse5 = '';
      vm.searchTitle = '';
      vm.sort.filter = {};
      reset();
      activate();
    };
    vm.searchChanged = function () {
      console.log(vm.searchTitle);
      //call service here
      activate();
    };
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

    //table actions
    vm.viewConv = function (conversationObject) {
    	objectStore.conversation.sharedConversation.set(conversationObject);
    	$state.go("conversationdetails.viewTeammemberConversation");
    };

    vm.respondConv = function(conversationObject) {
    	objectStore.conversation.sharedConversation.set(conversationObject);
    	$state.go("conversationdetails.sharedTeamMemberConversation");
    };

    vm.shareConv = function (conversationObject) {
    	objectStore.conversation.draftConversation.set(conversationObject);
    	objectStore.conversation.createConversationSource.set("ModalPopUp");
    	$state.go("conversationdetails.newTeamMemberConversation");
    };

    vm.deleteConv = function (conversationObject) {
    	objectStore.conversation.draftConversation.set(conversationObject);
        objectStore.conversation.createConversationSource.set("ModalPopUp");
      	$state.go("conversationdetails.newTeamMemberConversation");
    };

    vm.actionDisplayer = function(convStatus,ownerUsername, targetUsername){
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

 /*   vm.actionDisplayer = function(linkName,conversationObj)
    {
      var loggedinUser = $scope.user;
      var status = conversationObj.convStatus;
      if([conversationObj.ownerUsername,conversationObj.targetUsername].indexOf(loggedinUser) > -1){
        if(status === "CLOSE") {
          if (linkName === "view") {
            return true;
          }
        }
        else if(status === "DRAFT") {
          if (linkName === "delete" || linkName === "share" || linkName === "view") {
            return true;
          }
        }
        else if(status === "OPEN") {
          if(conversationObj.ownerUsername !== loggedinUser)
          {
            if (linkName === "view") {
              return true;
            }
          }
          else
          {
            if (linkName === "respond" || linkName === "view") {
              return true;
            }
          }
        }
      }
      else
      {
        if (linkName === "view") {
          return true;
        }
      }
      return false;
    }
*/
     vm.hasAttachment = function(data){
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

    vm.conversationSubmittedBy = function(conversationObject)
    {
      if(typeof conversationObject !== 'undefined')
      {
        var submittedBy = conversationObject.status==='EMP_SUBMIT'?'E':'M';

        return submittedBy;
      }
    };

    vm.isConversationDraft = function(conversation)
    {
      var conversationDraftStatus = false;

     if(conversation!=null && typeof conversation !== 'undefined') {
        if (conversation.status === 'DRAFT') {
          conversationDraftStatus = true;
        }
        else
        {
          conversationDraftStatus = false;
        }
      }
      return conversationDraftStatus;
    };

    vm.getLocation = function () {
    	console.log("called getTitles");
    	var conversationabout = $scope.user;
        var loginuser = localStorageService.get("loggedInUser").username;
        var titleCriteria = vm.searchTitle!=null?vm.searchTitle:"";
        return dataservice.getTitleAutoCompleteConversation("TEAM", vm.c_yr, vm.c_q, conversationabout, loginuser,titleCriteria,vm.sort).then(function (response) {
              if (response.status === 200 || response.status === 201) {
                if (typeof response.data !== 'undefined') {
                  console.log(response.data[0].serverdata);
                  var searchData = _.uniq(response.data[0].serverdata);
                  console.log("hey", searchData);
                  return searchData;
                }
              }
              else {
                vm.response = false;
                vm.status = null,vm.tags = null;
                if(typeof vm.sort.filter !== 'undefined') {
                  vm.sort.filter = {};
                }
                return "";
              }
        });
      };

      vm.getConverstaionsForTitle = function(){
    	  console.log("******* getConverstaionsForTitle ********");
          vm.sort.filter.topicTitle = vm.searchTitle != null ? vm.searchTitle : "";
          activate();
      }

      vm.truncateConversationTitle = function(title){
          var convTitle = title;
          if(convTitle!=null && convTitle.length > 35){
            convTitle = convTitle.substring(0,35)+"...";
          }
          return convTitle;
        };
  }
})();
