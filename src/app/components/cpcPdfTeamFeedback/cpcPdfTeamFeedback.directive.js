(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcPdfTeamFeedback', cpcPdfTeamFeedback);

  /* @ngInject */

  function cpcPdfTeamFeedback() {
    // Usage:
    //
    // Creates:
    //

    var directive = {
      templateUrl: '/client/app/components/cpcPdfTeamFeedback/cpcPdfTeamFeedback.html',
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
  function Controller($log, $translate,$stateParams, $scope,dataservice,employeeDetails,$state,objectStore,dateTimeService,$window,localStorageService) {
	  var vm = this;
	  
	  vm.currentFy = localStorageService.get("currentFyQuarter").data.fy;
	  vm.currentQuarter = localStorageService.get("currentFyQuarter").data.quarter;
	  vm.context = "SELF";
	  vm.sort = {"sort": { "updated_on": "DESC"},"filter": {}};
	  vm.totalRecord = null;
      vm.recordsPerPage = 20;
      vm.currentPage = 1;
      vm.maxSize = 3;
      vm.selectedTeamMember = 'Individual Team Member';
      vm.selectedTeamMemberCecId = '';
      
      var userObj = localStorageService.get("loggedInUser");
	  if($stateParams.username){
		  vm.selectedTeamMember = $stateParams.username;
		  vm.selectedTeamMemberCecId = $stateParams.username;
		  vm.isYouEnabled = false;
		  vm.isProvidedEnabled = false;
	  }
	  else{
		  vm.selectedTeamMember = 'Individual Team Member';
		  vm.isYouEnabled = true;
		  vm.isProvidedEnabled = true;
	  }
	  
	  vm.isPeopleManager = employeeDetails.isPeopleManager(userObj);
	  vm.isAltMgr = employeeDetails.isAltMgr(userObj);
	  if(vm.isPeopleManager){
		  dataservice.getTeamMembers().then(function(data){
	          vm.teamHierarchy = data;
		  });
	  }
	  if(vm.isAltMgr){
		  dataservice.getAlternateTeam().then(function(data){
	          vm.altTeamHierarchy = data;
		  });
	  }
	  
  	  /* code to get quarter value */
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
      				var quartersInFy = fyQuarters[fiscalYear];
      				console.log(quartersInFy);
      				for (var q = 0; q < quartersInFy.length; q++) {
      					var outQ = {"year":fiscalYear,"quarter":quartersInFy[q],"display":fiscalYear +" "+quartersInFy[q],"id":fiscalYear +":"+quartersInFy[q]};
      					vm.quarters.push(outQ);
      				}
      			}
      			vm.quarter = vm.currentFy +":"+ vm.currentQuarter;
      		}
      	  }
        });
	  
	  	/* setting default status filter with values of Provided feedback */
  	  	if(vm.isProvidedEnabled == true){
  	  		vm.status = ['Pending Your Reply', 'Given', 'Declined'];
  	  	}
  	  	else{
  	  		vm.status = ['Feedback Received', 'Request Pending', 'Request Declined'];
  	  	}
	  	
	  
	  	vm.fbTypeRadioBtn = function($event){
			if($event.target.id === 'fbradio01'){
				vm.status = ['Pending Your Reply', 'Given', 'Declined'];
				console.log('activate in fbradio01');
			} else if($event.target.id === 'fbradio02'){
				vm.status = ['Feedback Received', 'Request Pending', 'Request Declined'];
				console.log('activate in fbradio02');
			}
		};
	  
		vm.changedStatus = function() {
		      console.log(vm.statusFilterValue);
		      vm.sort.filter.feedbackStatus = "";
		      if(vm.isProvidedEnabled == true){
		    	  if(vm.statusFilterValue === null || vm.statusFilterValue === undefined){
		              vm.sort.filter.feedbackStatus = '';
		            } else if(vm.statusFilterValue === 'Given'){
		              vm.actualStatusFilterValue = 'COMPLETE';
		            } else if(vm.statusFilterValue === 'Pending Your Reply'){
		              vm.actualStatusFilterValue = 'PENDING';
		            } else if(vm.statusFilterValue === 'Declined'){
		              vm.actualStatusFilterValue = 'DECLINE';
		            }
		  	  }
		  	  else{
			  	  	  if(vm.statusFilterValue === null || vm.statusFilterValue === undefined){
				      } else if(vm.statusFilterValue === 'Feedback Received'){
				        vm.actualStatusFilterValue = 'COMPLETE';
				      } else if(vm.statusFilterValue === 'Request Pending'){
				        vm.actualStatusFilterValue = 'PENDING';
				      } else if(vm.statusFilterValue === 'Draft'){
				        vm.actualStatusFilterValue = 'DRAFT';
				      } else if(vm.statusFilterValue = 'Request Declined'){
				        vm.actualStatusFilterValue = 'DECLINE';
				      }
		  	  	}
		      
		      vm.sort.filter.feedbackStatus = vm.actualStatusFilterValue != null ? vm.actualStatusFilterValue : "";
		      console.log(vm.sort);
		};
	  
		vm.getFeedbackData = function(){
			if(vm.isProvidedEnabled == true){
				vm.showProvideData = true;
				activate("provideData");
			}
			else{
				vm.showProvideData = false;
				activate("receiveData");
			}
		}
	  
	  
	  
//	  employeeDetails.getUserFullName(vm.userObj.username).then(function(fullName){
//	        vm.feedbackAboutByFullName = fullName;
//	        //console.log("****** vm.currentConversation.targetFullName ***** "+vm.currentConversation.targetFullName);
//	      });
//	  vm.myManager = '';
//	    employeeDetails.findMyManager(vm.empObj.username).then(function(fullName) {
//	      vm.myManager = fullName;
//	  });
	  
		  
		  
		
		vm.changeTeamMember = function(teamMember) {
		  vm.empObj = teamMember;
		  vm.selectedTeamMemberCecId = teamMember.username;
		  vm.selectedTeamMember = teamMember.firstName + ' '+ teamMember.lastName;
		  console.log("team member selected is "+vm.selectedTeamMember);
		  vm.isYouEnabled = false;
		
		};
		
		vm.configureRadioBtn = function($event){
			if($event.target.id === 'radio02'){
				vm.selectedTeamMember = 'Individual Team Member';
				vm.isYouEnabled = true;
				console.log('activate in radio02');
				vm.context = "SELF";
			} else if($event.target.id === 'radio01'){
				console.log('No activate in radio01');
				vm.isYouEnabled = false;
				vm.context = "TEAM";
			}
		};
		
		vm.translateDate = function(dateString) {
		  	vm.monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var generatedDateString = '';

            var date = new Date(dateString);
            generatedDateString = date.getDate() + ' ' + vm.monthArray[date.getMonth()] + ' ' + date.getFullYear();

            return generatedDateString;
		}; 
		
		
		function activate(dataType) {
			console.log('activate');
			vm.provideFeedbackList = false;
	        vm.isProvideFeedbacksLoading = true;
	        
	        vm.c_yr = null;
	        vm.c_q = null;
	        try {
	            var temp = vm.quarter.split(":");
	            vm.c_yr = temp[0];
	            vm.c_q = temp[1];
	          } catch (e) {}

	        var feedbackuser;

	        vm.c_yr = vm.c_yr == null ? vm.currentFy : vm.c_yr;
	        vm.c_q = vm.c_q == null ? vm.currentQuarter : vm.c_q;
	        
	        if(vm.isPeopleManager || vm.isAltMgr){
	        	if(vm.isYouEnabled){
	        		feedbackuser = localStorageService.get("loggedInUser").username;
	        	}
	        	else{
	        		feedbackuser = vm.selectedTeamMemberCecId;
	        	}
	        }
	        else{
	        	feedbackuser = localStorageService.get("loggedInUser").username;
	        }
	        
	        if(dataType ==  "provideData"){
	        	dataservice.getProvideFeedbackSelf(vm.currentPage, vm.recordsPerPage, feedbackuser, vm.c_yr, vm.c_q, vm.context, vm.sort).then(function(response) {
		
		            if (Number(parseInt(response.headers()["x-total-count"])) == response.headers()["x-total-count"] && vm.totalRecord == null) {
		              vm.totalRecord = parseInt(response.headers()["x-total-count"]);
		            }
		            vm.isProvideFeedbacksLoading = false;
		            if (response.status === 200 || response.status === 201) {
		              vm.isProvideFeedbacksLoading = false;
		              if (typeof response.data !== 'undefined')
		                vm.provideFeedbackList = response.data.content[0].FeedbackData;
		            } else {
		                  vm.isProvideFeedbacksLoading = false;
		                  vm.response = false;
		                  vm.status = null;
		                  vm.provideFeedbackList = false;
		                  if (typeof vm.sort.filter !== 'undefined') {
		                    vm.sort.filter = {};
		                  }
		                }
		              }).catch(function(error){
		                vm.provideFeedbackList = false;
		                objectStore.feedback.viewAllFeedbackSource.remove();
		         });
	        }
	        else{
	        	dataservice.getRequestFeedbackSelf(vm.currentPage, vm.recordsPerPage, feedbackuser, vm.c_yr, vm.c_q, vm.context, vm.sort).then(function(response) {
		            /* copy code from cpcTableReceive file from activate function */
		
		            
		         });
	        }
	     }
	}
})();





