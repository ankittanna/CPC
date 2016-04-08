// JavaScript Document
(function () {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcTeamConversationDraftTable', cpcTeamConversationDraftTable);

  /* @ngInject */
  function cpcTeamConversationDraftTable() {
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
    }
  }

  /* @ngInject */
  function Controller($log, $translate, $scope, dataservice, _, $http, localStorageService,$window,$location,objectStore,$state,$stateParams,employeeDetails) {

    var vm = this;
    
    vm.currentFy = localStorageService.get("currentFyQuarter").data.fy;
    vm.currentQuarter = localStorageService.get("currentFyQuarter").data.quarter;
    vm.showLoadMore = false;
    vm.showPreviousQuarter = false;
    console.log("in cpcTeamConversationDraftTable");
    console.log("conversation about "+$stateParams.username);
    vm.selectedTag = $stateParams.tag;
    console.log("selectedTag "+vm.selectedTag);
    
    /* condition to decide if create conversation should appear
  	 * only direct hierarchy and alternate team member case create should come */
  	var loggedInUser = localStorageService.get("loggedInUser").username;
  	$scope.user = $stateParams.username;
  	dataservice.findMyManager($scope.user).then(function(response){
        if(response.status === 200) {
        	if (typeof response.data !== 'undefined'){
        		if(loggedInUser == response.data.username){
        			vm.showAddConvBtn = true;
        		}
        		else{
        			vm.showAddConvBtn = false;
        			dataservice.getAlternateManagerList($scope.user).then(function(response){
        		        if(response.status === 200) {
        		        	if (typeof response.data !== 'undefined'){
        		        		var altManagerList = response.data;
        		        		for (var k in altManagerList){
        						    if (altManagerList.hasOwnProperty(k)) {
        						         console.log("Key is " + k + ", value is" + altManagerList[k]);
        						         if(k == loggedInUser){
        						        	 vm.showAddConvBtn = true;
        						         }
        						    }
        						}
        		        	}
        		          }
        		    });
        		}
        	}
          }
    });
  	
    console.log("%%%%%%%%%%%%%%isAlternateTeamMember  "+$stateParams.isAlternateTeamMember);
    if($stateParams.isAlternateTeamMember == "true"){
  		vm.context = "ALTERNATE";
  	}
  	else if($stateParams.isAlternateTeamMember == "false"){
  		vm.context = "TEAM";
  	}
    
    vm.quarter = $stateParams.fyQuarter;
//    vm.showAddConvBtn = true;
    
    vm.response = false;
    vm.totalRecord = null;
    vm.recordsPerPage = 10;

    vm.currentPage = 1;
    vm.maxSize = 3;
    vm.sort = {"sort":{"topicTitle":"ASC"},"filter":{"tags":vm.selectedTag}};
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
    		//	vm.quarter = vm.currentFy +":"+ vm.currentQuarter;
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


      vm.conversationabout = $stateParams.username;
      var loginuser = localStorageService.get("loggedInUser").username;

      vm.loading = true;
      
      vm.c_yr = vm.c_yr == null ? vm.currentFy : vm.c_yr;
      vm.c_q = vm.c_q == null ? vm.currentQuarter : vm.c_q;

            dataservice.getConversation(vm.context, vm.currentPage, vm.recordsPerPage, vm.c_yr, vm.c_q, vm.conversationabout, loginuser, vm.sort).then(function (response) {
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
                  vm.tagsFilterValue = vm.sort.filter.tags;
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
      activate();
      vm.tagsFilterValue = vm.tagsFilterValue;
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
    	$state.go("conversationdetails.viewConversation");
    };

    vm.respondConv = function(conversationObject) {
    	objectStore.conversation.sharedConversation.set(conversationObject);
    	$state.go("conversationdetails.sharedConversation");
    };

    vm.shareConv = function (conversationObject) {
    	objectStore.conversation.draftConversation.set(conversationObject);
    	objectStore.conversation.createConversationSource.set("ModalPopUp");
    	$state.go("conversationdetails.newConversation");
    };

    vm.deleteConv = function (conversationObject) {
    	objectStore.conversation.draftConversation.set(conversationObject);
        objectStore.conversation.createConversationSource.set("ModalPopUp");
      	$state.go("conversationdetails.newConversation");
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
     
  /*  vm.actionDisplayer = function(linkName,conversationObj)
    {
      var loggedInUsername = localStorageService.get("loggedInUser").username;
      var managerUsername = localStorageService.get("loggedInUser").managerUsername;
      if(conversationObj.conversation[0].status === "DRAFT" && conversationObj.conversation[0].createdBy === loggedInUsername)
      {
        if(linkName === "delete" || linkName === "share")
        {
          return true;
        }
      }
      else if(conversationObj.conversation[0].status === "EMP_SUBMIT" && conversationObj.conversation[0].createdBy === loggedInUsername)
      {
        if(linkName === "view")
        {
          return true;
        }
      }
      else if(conversationObj.conversation[0].status === "MGR_SUBMIT" && conversationObj.conversation[0].createdBy === managerUsername)
      {
        if(linkName === "view" || linkName === "respond")
        {
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
        if (conversation.conversation[0].status === 'DRAFT') {
          conversationDraftStatus = true;
        } else if (conversation.conversation[0].status === 'EMP_SUBMIT' || conversation.conversation[0].status === 'MGR_SUBMIT') {
          conversationDraftStatus = false;
        }
      }
      return conversationDraftStatus;
    };

    vm.getLocation = function () {
    	console.log("called getTitles");
        var conversationabout = vm.conversationabout;
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
    
    vm.createNewSyncUpConversation = function(){
    	console.log("setting up conversation for "+vm.conversationabout);
    	employeeDetails.setCurrentSelectedTeamMember(vm.conversationabout);
    	objectStore.conversation.draftConversation.remove();
    	objectStore.conversation.createConversationSource.set("TeamConversationDetail");
    	$state.go("conversationdetails.newConversation");
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
