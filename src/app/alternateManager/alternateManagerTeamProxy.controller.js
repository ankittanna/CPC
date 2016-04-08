(function() {
  'use strict';

  angular
    .module('cpccore')
    .controller('AlternateManagerTeamProxyCtrl', AlternateManagerTeamProxyCtrl);

  /* @ngInject */
  function AlternateManagerTeamProxyCtrl(dataservice, $scope, localStorageService, $http, $filter, growl, $state, $stateParams) {

    var vm = this;

    vm.title = 'AlternateManagerTeamProxyCtrl';
    vm.changeTeamMember = changeTeamMember;
    vm.assignManager = assignManager;
    vm.isDisabled = false;
    vm.loginuser = localStorageService.get("loggedInUser").username;
    vm.getDateOnly = getDateOnly;
    vm.createRequestBody = createRequestBody;
    vm.cancelAction = cancelAction;

    function cancelAction(){
      /*$state.go('alternateManager.teamState');*/
      if($stateParams.username){
        $state.go('teamMemberAlternateManager.teamState',{"tmusername":$stateParams.username});
      }
      else{
        $state.go('alternateManager.teamState');
      }
    };

    function createRequestBody(){
      var str = vm.selectedTeammemberUserId;
      var bodyArray = [];
      bodyArray.push(str);
      return bodyArray
    };

    function getDateOnly(date){
      var res = $filter('date')(date, "yyyy-MM-dd");
      return res;
    }

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
            console.log(data);
            return data;
          });
        }
      }

      function getSearchedUsersFailed(error) {
        console.log('XHR Failed for getSearchedUsersFailed' + error.data);
      }
    };

    function assignManager(){
      if(vm.isDisabled){
        return;
      }
      vm.isDisabled = true;
      var start = new Date($scope.dtStart).getTime();
      var end = new Date($scope.dtEnd).getTime();
      var data = vm.searchTitle[0].username;
      console.log(start, end , !angular.isDate($scope.dtStart), !angular.isDate($scope.dtEnd), data, vm.createRequestBody())
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
      }
      else if($scope.form.$valid == false){
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

    $scope.today = function() {
      $scope.dtStart = $filter('date')(new Date(), "yyyy-MM-dd");
      $scope.dtEnd = $filter('date')(new Date().setMonth(new Date().getMonth() + 1), "yyyy-MM-dd");
    };
    $scope.today();

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
      formatYear: 'yyyy',
      formatMonth: 'MM',
      formatDay: 'dd',
      startingDay: 1
    };

    $scope.format = 'yyyy-MM-dd';

    activate();

    ////////////////

    function activate() {
      vm.isTeamDetailsLoaded = false;
      /*vm.contextUser = localStorageService.get("loggedInUser").username;*/
      if($stateParams.username){
        vm.contextUser = $stateParams.username;
      }else{
        vm.contextUser = localStorageService.get("loggedInUser").username;
      }

      dataservice.getContextUserTeamMembers(vm.contextUser)
        .then(getContextUserTeamMembersComplete)
        .catch(getContextUserTeamMembersFailed);

      function getContextUserTeamMembersComplete(response)
      {
        console.log('response', response);
        vm.isTeamDetailsLoaded = true;
        vm.contextUserTeamMembers = response;
      }

      function getContextUserTeamMembersFailed(error)
      {
        vm.isTeamDetailsLoaded = false;
        console.log("Service Error " + error.data);
      }
    }

    function changeTeamMember(teamMember){
      vm.selectedTeammemberUserId = teamMember.username;
      vm.teamFeedbackAbout = vm.selectedTeamMemberCecId = teamMember.username;
      vm.selectedTeamMember = teamMember.firstName + ' '+ teamMember.lastName;
      console.log("team member selected is "+vm.selectedTeamMember);
    }
  }
})();
