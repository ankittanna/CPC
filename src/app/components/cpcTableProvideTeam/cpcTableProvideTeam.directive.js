(function() {
  'use strict';

  angular
      .module('cpccore')
      .directive('cpcTableProvideTeam', cpcTableProvideTeam);

  /* @ngInject */
  function cpcTableProvideTeam() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcTableProvideTeam/cpcTableProvideTeam.html',
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
  function Controller($state, dataservice, _, $scope, $http, localStorageService, objectStore, $stateParams) {
    var vm = this;
    
    vm.currentFy = localStorageService.get("currentFyQuarter").data.fy;
    vm.currentQuarter = localStorageService.get("currentFyQuarter").data.quarter;
    vm.searchTeamMember = '';

    vm.sort = {};
    // this will automatically get populated using service
    vm.totalRecord = null;
    // enter the value here to modify number of items shown in one page
    vm.recordsPerPage = 20;

    vm.currentPage = 1;
    vm.maxSize = 3;

    vm.numPages = function()
    {
      return angular.noop;
    }

    activate();

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
    
    //Quarter dropdown start
 /*   vm.fy_currentYear = "FY" + new Date().getFullYear();
    vm.currentQuarter = null;
    var currentYear = new Date().getFullYear();
    dataservice.getCurrentQuartersInFiscalYear(currentYear).then(function (year_response) {
      if (year_response.status === 200) {
        dataservice.getCurrentQuarter().then(function (curr_year_response) {
          if (curr_year_response.status === 200) {
            vm.fy_currentYear = "FY" + currentYear;
            var year_data = year_response.data;
            var quarter_data = curr_year_response.data;
            vm.currentQuarter = quarter_data[vm.fy_currentYear];
            var current_yr_q = year_data[vm.fy_currentYear];
            vm.quarters = new Array();
            for (var q = 0; q < current_yr_q.length; q++) {
              var out = {
                "year": currentYear,
                "quarter": current_yr_q[q],
                "display": "FY " + currentYear + " " + current_yr_q[q],
                "id": "FY" + currentYear + ":" + current_yr_q[q]
              }
              vm.quarters.push(out);
              console.log('out', out);
            }
            vm.quarter = "FY" + currentYear + ":" + current_yr_q[current_yr_q.length-1]; // -2 will leave current quarter
          }
        });
      }
    }); */
    //Quarter dropdown end

    // LOGGED IN USER: Get Logged in user
    //var loggedInuser = localStorageService.get("loggedInUser").username;

    vm.response = {};
    vm.sort = {"sort":{},"filter":{}};
    vm.isProvideFeedbacksLoading = true;

    function activate() {

      console.log('activate');

   //   vm.fy_currentYear = "FY" + new Date().getFullYear(); //Current FY


      vm.c_yr = null;
      vm.c_q = null;

      try {
        var temp = vm.quarter.split(":");
        vm.c_yr = temp[0];
        vm.c_q = temp[1];
      }
      catch (e) {
      }

      var loginuser = localStorageService.get("loggedInUser").username;
      vm.loading = true;

      
      vm.c_yr = vm.c_yr == null ? vm.currentFy : vm.c_yr;
      vm.c_q = vm.c_q == null ? vm.currentQuarter : vm.c_q;

      if($stateParams.username){
        vm.loggedInuser = localStorageService.get("loggedInUser").username;
        loginuser = $stateParams.username;
        //context = 'TEAM';
      }else{
        vm.loggedInuser = localStorageService.get("loggedInUser").username;
        loginuser = localStorageService.get("loggedInUser").username;
        //context = 'SELF';
      }

            dataservice.getProvideFeedbackTeam(vm.currentPage, vm.recordsPerPage, loginuser, vm.c_yr, vm.c_q, "TEAM", vm.sort).then(function(response){
              if(Number(parseInt(response.headers()["x-total-count"])) == response.headers()["x-total-count"] && vm.totalRecord == null) {
                vm.totalRecord = parseInt(response.headers()["x-total-count"]);
              }

              vm.loading = false;

              if (response.status === 200 || response.status === 201) {
                ////alert(JSON.stringify(response));
                vm.isProvideFeedbacksLoading = false;
                if (typeof response.data !== 'undefined') {
                  vm.provideFeedbackTeamList = response.data;
                  vm.isProvideFeedbacksLoading = false;
                }
              }
              else {
                vm.isProvideFeedbacksLoading = false;
                vm.response = false;
                vm.status = null;
                if(typeof vm.sort.filter !== 'undefined') {
                  vm.sort.filter = {};
                  vm.isProvideFeedbacksLoading = false;
                }
              }
            });

      // Service Call to getProvideFeedbackTeam gives back the JSON object of all feedbacks open/pending/closed for that logged in user
      // Additional parameter can be passed to the function: username
      // http://localhost:80/performance/api/feedback/getTeamFeedbackMatrics?managerUsername=maflynn&fy=FY2015&context=team

    }

    // Function which is tagged to the FY Select box.
    // Everytime this changes this function is called.
    vm.changedBy = function() {
      console.log(vm.statusFilterValue + '' + vm.byFilterValue);
      //call service here
      activate();
    };

    vm.sortColumn = function (columnName, sortType) {
      console.log('sort', columnName, sortType);
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

    /* vm.changedStatus = function() {
     console.log(vm.statusFilterValue + '' + vm.byFilterValue);
     //call service here
     activate();
     }; */
    /*vm.clearFilters = function() {
     vm.byFilterValue = 'Select';
     vm.statusFilterValue = 'Select';
     };*/
    vm.searchChanged = function() {
      console.log(vm.searchTeamMember);
    };
    /*vm.sort = function(data){
      console.log(data);
    };*/

    vm.quarters = [
      'FY 2015 Q1',
      'FY 2015 Q2',
      'FY 2015 Q3',
      'FY 2015 Q4'
    ];
    vm.quarter = vm.quarters[0];

    vm.monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    vm.translateDate = function(dateString)
    {
      ////alert(dateString);
      var generatedDateString = '';

      var date = new Date(dateString);
      generatedDateString = date.getDate() + ' ' + vm.monthArray[date.getMonth() + 1] + ' ' + date.getFullYear();

      return generatedDateString;
    };

    vm.changedQuarterValue = function () {
      console.log(vm.quarter);
      reset();
      activate();
    };

    var reset = function() {
      vm.currentPage = 1;
      vm.totalRecord = null;
      //call service here
      vm.response = false;
    }

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
// actionCode = 3    [View Provide]          statusCode = 5    status = DECLINED   parentStatus/statusString = DECLINED
    vm.fetchProvideFeedbackStatus = function(feedbackStatus)
    {
      var feedbackStatusObject = {};
      if(feedbackStatus === 'COMPLETE' || feedbackStatus === 'NOTSHARE')
      {
        feedbackStatusObject.iconClass = 'feedbackProvided';
        feedbackStatusObject.statusString = 'Provided';
        feedbackStatusObject.actionCode = 2;

        if(feedbackStatus === 'COMPLETE')
        {
          feedbackStatusObject.statusCode = 3;
          feedbackStatusObject.status = 'COMPLETE';
        } else if(feedbackStatus === 'NOTSHARE')
        {
          feedbackStatusObject.statusCode = 4;
          feedbackStatusObject.status = 'NOTSHARE';
        }

      } else if(feedbackStatus === 'DRAFT' || feedbackStatus === 'PENDING')
      {
        feedbackStatusObject.iconClass = 'feedbackYetToProvide';
        feedbackStatusObject.statusString = 'Yet to Provide';
        feedbackStatusObject.actionCode = 1;

        if(feedbackStatus === 'DRAFT')
        {
          feedbackStatusObject.statusCode = 1;
          feedbackStatusObject.status = 'DRAFT';
        } else if(feedbackStatus === 'PENDING')
        {
          feedbackStatusObject.statusCode = 2;
          feedbackStatusObject.status = 'PENDING';
        }

      } else if(feedbackStatus === 'DECLINED')
      {
        feedbackStatusObject.iconClass = 'feedbackDeclined';
        feedbackStatusObject.statusString = 'Declined';
        feedbackStatusObject.actionCode = 3;

        if(feedbackStatus === 'DECLINED')
        {
          feedbackStatusObject.statusCode = 5;
          feedbackStatusObject.status = 'DECLINED';
        }
      }

      return feedbackStatusObject;
    };

    // Yet to Provide column
    vm.getYetToProvideCount = function(dataObject)
    {
      var dataObject = dataObject;
      var pendingCount = 0;

      if(dataObject.hasOwnProperty('PENDING'))
      {
        pendingCount = dataObject.PENDING
        return pendingCount;
      } else
      {
        return 0;
      }
    };

    // Provided Column
    vm.getProvidedCount = function(dataObject)
    {
      var dataObject = dataObject;
      var completeCount = 0;
      var notShareCount = 0;
      if(dataObject.hasOwnProperty('COMPLETE') || dataObject.hasOwnProperty('NOTSHARE'))
      {
        if(dataObject.hasOwnProperty('COMPLETE'))
        {
          completeCount = dataObject.COMPLETE;
        }

        if(dataObject.hasOwnProperty('NOTSHARE'))
        {
          notShareCount = dataObject.NOTSHARE;
        }
        
        return (completeCount + notShareCount);
      } else
      {
        return 0;
      }
    };


    // Declined Column
    vm.getDeclinedCount = function(dataObject)
    {
      var dataObject = dataObject;
      var declinedCount = 0;

      if(dataObject.hasOwnProperty('DECLINE'))
      {
        declinedCount = dataObject.DECLINE;
        return declinedCount;
      } else
      {
        return 0;
      }
    };


    // View All feedback for individual
    vm.viewAllFeedback = function(loggedinUser)
    {

    };

    vm.showAlternateTeamFlag = false;
    vm.showAlternateTeam = function()
    {
      vm.showAlternateTeamFlag = true;
    };

    vm.hideAlternateTeam = function()
    {
      vm.showAlternateTeamFlag = false;
    };


    // loadProvidedFeedbackForTeamMember - Function loads the feedback objects based on the
    // Username clicked on, type of feedback, number of avaialble feedback [just for reference]
    vm.loadProvidedFeedbackForTeamMember = function(userDetails, feedbackType, count)
    {
      if(count !== 0)
      {
          var username = userDetails.Username;
          var feedbackType = feedbackType;
          var count = count;

          objectStore.feedback.feedbackContextUsername.set(username);
          
          console.log('loadProvidedFeedbackForTeamMember ' + username + ' ' + feedbackType + ' ' + count);

          var filterDetails = new Object();
          filterDetails.username = username;
          if(feedbackType === 'viewAll')
          {
            feedbackType = null;
          }

          if(feedbackType === 'yetToProvide')
          {
            filterDetails.feedbackStatus = 'PENDING';
          } else if(feedbackType === 'provided')
          {
            filterDetails.feedbackStatus = 'COMPLETE';
          } else if(feedbackType === 'declined')
          {
            filterDetails.feedbackStatus = 'DECLINED';
          }

          filterDetails.selectedYear = vm.quarter.split(':')[0];
          filterDetails.selectedQtr = vm.quarter.split(':')[1];
          // SET SOURCE ORIGIN
          objectStore.feedback.viewAllFeedbackSource.set('provideTeamTable');

          // SET USERNAME OF THE SOURCE
          objectStore.feedback.provideTableViewAllUsername.set(username);

          // SET FILTER CRITERIA
          objectStore.feedback.provideFeedbackTableFilter.set(filterDetails);

          //alert(JSON.stringify(filterDetails));

          $state.go('teamMemberFeedback.provideViewAll',{"username":username});

          //$state.go('feedback.provideViewAll');
      }
      
    };


    // clearFilter - Function clears all the filter and resets components and fiters values to what they were originally
    // This function might call to the service to reload the expected data
    vm.clearFilter = function()
    {
      console.log('Clear Filter on Team provide feedback table');
      vm.searchTeamMember = '';
      //vm.byFilterValue = 'Select';
      //vm.statusFilterValue = 'Select';
      vm.quarter = vm.quarters[vm.quarters.length-1];
      vm.reverse1 = '';
      vm.reverse2 = '';
      vm.reverse3 = '';
      vm.reverse4 = '';
    };


    vm.activateAfterSearch = function(){
      vm.sort.filter.Username = vm.searchTeamMember!=null?vm.searchTeamMember:"";
      activate();
    }

    vm.viewAllUserFeedback = function(username)
    {
      $state.go('teamMemberFeedback.provide',{'username':username});
    };

    vm.getLocation = function(val) {
      console.log('search provide team');

  //    vm.fy_currentYear = "FY" + new Date().getFullYear(); //Current FY


      vm.c_yr = null;
      vm.c_q = null;

      try {
        var temp = vm.quarter.split(":");
        vm.c_yr = temp[0];
        vm.c_q = temp[1];
      }
      catch (e) {
      }

      var loginuser = localStorageService.get("loggedInUser").username;
      vm.loading = true;

      vm.sort.filter.Username = val!=null?val:"";

      if($stateParams.username){
        vm.loggedInuser = localStorageService.get("loggedInUser").username;
        loginuser = $stateParams.username;
        //context = 'TEAM';
      }else{
        vm.loggedInuser = localStorageService.get("loggedInUser").username;
        loginuser = localStorageService.get("loggedInUser").username;
        //context = 'SELF';
      }

      return dataservice.getProvideFeedbackTeam(vm.currentPage, vm.recordsPerPage, loginuser, vm.c_yr, vm.c_q, "TEAM", vm.sort).then(function(response){
        if(Number(parseInt(response.headers()["x-total-count"])) == response.headers()["x-total-count"] && vm.totalRecord == null) {
          vm.totalRecord = parseInt(response.headers()["x-total-count"]);
        }

        vm.loading = false;

        if (response.status === 200 || response.status === 201) {
          ////alert(JSON.stringify(response));
          vm.isProvideFeedbacksLoading = false;
          if (typeof response.data !== 'undefined') {
            console.log("res", response.data.content[0].AlternateTeam);
            vm.isProvideFeedbacksLoading = false;
            var searchData = (_.uniq(_.pluck(response.data.content[0].DirectTeam, 'Username'))).concat(_.uniq(_.pluck(response.data.content[0].AlternateTeam, 'Username')))
            console.log("hey",searchData);
            return searchData;
          }
        }
        else {
          vm.isProvideFeedbacksLoading = false;
          vm.response = false;
          vm.status = null;
          if(typeof vm.sort.filter !== 'undefined') {
            vm.sort.filter = {};
            vm.isProvideFeedbacksLoading = false;
            return "";
          }
        }
      });
    };

  }
})();