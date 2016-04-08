(function() {
  'use strict';

  angular
    .module('cpccore')
    .controller('AlternateManagerSelfProxyCtrl', AlternateManagerSelfProxyCtrl);

  /* @ngInject */
  function AlternateManagerSelfProxyCtrl($scope, objectStore, dataservice, localStorageService, $state, growl, $filter, employeeDetails, $stateParams) {
    var vm = this;
    vm.title = 'AlternateManagerSelfProxyCtrl';
    vm.isDisabled = false;
    vm.isStartDateDisabled = true;
    vm.isEndDateDisabled = true;
    vm.isAddProxyManagerIsDisabled = true;
    vm.update = update;
    vm.deallocate = deallocate;
    vm.cancelAction = cancelAction;
    vm.getDateOnly = getDateOnly;
    vm.assignManager = assignManager;
    vm.createRequestBody = createRequestBody;
    vm.objectStoreData = JSON.parse(objectStore.alternate.alternateManagerId.get());

    activate();

    ////////////////

    vm.loading = 'Loading...';
    function getTeamMemberFullName(){
      employeeDetails.getUserFullName(vm.selectedTeamMember).then(function(fullName) {
        vm.selectedTeamMemberFullName = fullName;
      });
    }
    function getFeedbackAboutFullName()
    {
      employeeDetails.getUserFullName(vm.searchTitle).then(function(fullName) {
        vm.feedbackAboutFullName = fullName;
      });
    };

    vm.loadTags = function($query) {
      return dataservice.getSearchedUsers($query)
        .then(getSearchedUsersComplete)
        .catch(getSearchedUsersFailed);

      function getSearchedUsersComplete(respondedData) {

        vm.contextUser = localStorageService.get("loggedInUser").username;
        if(respondedData !== null)
        {
          var tempdata = [];
          angular.forEach(respondedData, function(value, key) {
            if(value.username == vm.contextUser){

            }else{
              tempdata.push(value)
            }
          });

          return tempdata.filter(function(data) {
            return data;
          });
        }
      }

      function getSearchedUsersFailed(error) {
        console.log('XHR Failed for getSearchedUsersFailed' + error.data);
      }
    };

    function createRequestBody(){
      var str = vm.selectedTeamMember;
      var bodyArray = [];
      bodyArray.push(str);
      return bodyArray
    };

    function assignManager(){
      if(vm.isDisabled){
        return;
      }
      vm.isDisabled = true;
      var start = new Date($scope.dtStart).getTime();
      var end = new Date($scope.dtEnd).getTime();
      var data = vm.searchTitle[0].username;

      console.log(start, end , !angular.isDate($scope.dtStart), !angular.isDate($scope.dtEnd), data, vm.createRequestBody(), $scope.form.$valid)
      if( start > end ){
        growl.error('start date should be less than end date');
        return false;
      }
      else if(data == undefined || data == ""){
        growl.error('Manager name field should not be empty');
        return false;
      }
      else if(vm.createRequestBody()[0]== undefined){
        growl.error('Employee name should not be empty');
        return false;
      }else if($scope.form.$valid == false){
        growl.error('Maximum one manager name  is allowed');
        return false;
      }
      else{
        dataservice.assignAlternateTeam(data, vm.getDateOnly($scope.dtStart), vm.getDateOnly($scope.dtEnd), vm.createRequestBody())
          .then(function(response){

            if(response.data.code == 401){
              growl.error(response.data.severity)
            }
            else{
              growl.success('successfully allocated proxy manager');
              if($stateParams.username){
                $state.go('teamMemberAlternateManager.teamState',{"tmusername":$stateParams.username});
              }
              else{
                $state.go('alternateManager.teamState');
              }
            }
            vm.isDisabled = false;
          })
          .catch(function(error){
            vm.isDisabled = false;
            growl.error(error.data.severity);
          });
      }
    }

    function update(){
      //call service to update here;
      if(vm.isDisabled){
        return;
      }
      vm.isDisabled = true;
      if($stateParams.username){
        var loggedInUser = $stateParams.username;
      }else{
        var loggedInUser = localStorageService.get("loggedInUser").username;
      }
      dataservice.updateAlternateTeam(vm.objectStoreData.id,loggedInUser, vm.getDateOnly($scope.dtStart), vm.getDateOnly($scope.dtEnd))
        .then(function(response){
          growl.success('successfully allocated proxy manager');
          if($stateParams.username){
            $state.go('teamMemberAlternateManager.teamState',{"tmusername":$stateParams.username});
          }
          else{
            $state.go('alternateManager.teamState');
          }
          vm.isDisabled = false;
        })
        .catch(function(error){
          vm.isDisabled = false;
          growl.error(error.data.severity);
        });
    }

    function deallocate(){
      if(vm.isDisabled){
        return;
      }
      vm.isDisabled = true;
      dataservice.deallocateAlternateTeam(vm.objectStoreData.id)
        .then(function(response){
          growl.success('successfully deallocated proxy manager');
          /*$state.go('alternateManager.teamState');*/
          if($stateParams.username){
            $state.go('teamMemberAlternateManager.teamState',{"tmusername":$stateParams.username});
          }
          else{
            $state.go('alternateManager.teamState');
          }
          vm.isDisabled = false;
        })
        .catch(function(error){
          vm.isDisabled = false;
          growl.error(error.data.severity);
        });
    }

    function cancelAction(){
      /*$state.go('alternateManager.teamState');*/
      if(vm.objectStoreData.actionType == "VIEWSELF"){
        if($stateParams.username){
          $state.go('teamMemberAlternateManager.selfState',{"tmusername":$stateParams.username});
        }
        else{
          $state.go('alternateManager.selfState');
        }
      }else{
        if($stateParams.username){
          $state.go('teamMemberAlternateManager.teamState',{"tmusername":$stateParams.username});
        }
        else{
          $state.go('alternateManager.teamState');
        }
      }
    }
    function getDateOnly(date){
      var res = $filter('dateInPST')(date, "yyyy-MM-dd");
      return res;
    }

    function activate() {

      var data = objectStore.alternate.alternateManagerId.get();
      data = JSON.parse(data);

      $scope.dtStart = $filter('dateInPST')(data.start_date, "yyyy-MM-dd");
      $scope.dtEnd = $filter('dateInPST')(data.end_date, "yyyy-MM-dd");

      var current = new Date().getTime();

      if(data.start_date <= current){
        vm.isStartDateDisabled = true;
      }else{
        vm.isStartDateDisabled = false;
      }

      /**
       * conditions for different view modes below
       */

      if(vm.objectStoreData.actionType == "VIEW" || vm.objectStoreData.actionType == "VIEWSELF"){
        vm.isStartDateDisabled = true;
        vm.isEndDateDisabled = true;
        vm.isAddProxyManagerIsDisabled = true;

        vm.selectedTeamMember = data.user_username;
        vm.searchTitle = data.proxy_username;
      }else if(vm.objectStoreData.actionType == "EDIT"){
        //no specific action needed here;
        vm.isEndDateDisabled = false;
        vm.isAddProxyManagerIsDisabled = true;

        vm.selectedTeamMember = data.user_username;
        vm.searchTitle = data.proxy_username;
      }else if(vm.objectStoreData.actionType == "DEALLOCATE"){
        //call service to deallocate;
        vm.isAddProxyManagerIsDisabled = true;

        vm.selectedTeamMember = data.user_username;
        vm.searchTitle = data.proxy_username;
      }else if(vm.objectStoreData.actionType == "VIEWMODAL"){
        vm.isStartDateDisabled = false;
        vm.isEndDateDisabled = false;
        vm.isAddProxyManagerIsDisabled = false;

        vm.selectedTeamMember = data.user_username;
        vm.searchTitle = data.proxy_username;
      }



      $scope.clear = function () {
        $scope.dt = null;
      };

      $scope.minDate = new Date();


      $scope.openStart = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.openedStart = true;
      };

      $scope.openEnd = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.openedEnd = true;
      };

      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };

      $scope.format = 'yyyy-MM-dd';

      getFeedbackAboutFullName();
      getTeamMemberFullName();
    }
  }
})();
