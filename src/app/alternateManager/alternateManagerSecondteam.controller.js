(function() {
  'use strict';

  angular
    .module('cpccore')
    .controller('AlternateManagerSecondTeamCtrl', AlternateManagerSecondTeamCtrl);

  /* @ngInject */
  function AlternateManagerSecondTeamCtrl(localStorageService, dataservice, $http, $filter, employeeDetails, objectStore, $state, growl, $stateParams) {

    var vm = this;
    vm.showLoadMore = false;
    vm.sortColumn = sortColumn;
    vm.title = 'AlternateManagerSelfCtrl';
    vm.isProvideFeedbacksLoading = true;
    vm.viewAlternate = viewAlternate;
    vm.editAlternate = editAlternate;
    vm.deallocateAlternate = deallocateAlternate;
    vm.getDateOnly = getDateOnly;
    vm.addAlternateManager = addAlternateManager;
    vm.alternateTeamSecondNavigate = alternateTeamSecondNavigate;
    vm.sort = {"sort":{}};

    vm.totalRecord = null;
    // enter the value here to modify number of items shown in one page
    vm.recordsPerPage = 20;

    vm.currentPage = 1;
    vm.maxSize = 3;

    vm.getMoreAltMgrData = function(){
        if(vm.recordsPerPage < vm.totalRecord){
          vm.recordsPerPage = vm.recordsPerPage + 5;
        }
        activate();
      }

    if($stateParams.username){
      vm.isDrilldown = false;
    }else{
      vm.isDrilldown = true;
    }

    function alternateTeamSecondNavigate(){
      if($stateParams.username){
        $state.go('teamMemberAlternateManager.teamState',{"tmusername":$stateParams.username});
      }
      else{
        $state.go('alternateManager.teamState');
      }
    }

    function addAlternateManager(){
      /*$state.go('alternateManager.proxyTeam');*/
      if($stateParams.username){
        $state.go('teamMemberAlternateManager.proxyTeam',{"tmusername":$stateParams.username});
      }
      else{
        $state.go('alternateManager.proxyTeam');
      }
    }

    function editAlternate(data){
      data.actionType = "EDIT";
      console.log('data',data);
      objectStore.alternate.alternateManagerId.set(JSON.stringify(data));
      /*$state.go('alternateManager.proxySelf');*/
      if($stateParams.username){
        $state.go('teamMemberAlternateManager.proxySelf',{"tmusername":$stateParams.username});
      }
      else{
        $state.go('alternateManager.proxySelf');
      }
    }

    function deallocateAlternate(data){
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
    }

    function viewAlternate(data){
      data.actionType = "VIEW";
      console.log('data', data);
      objectStore.alternate.alternateManagerId.set(JSON.stringify(data));
      /*$state.go('alternateManager.proxySelf');*/
      if($stateParams.username){
        $state.go('teamMemberAlternateManager.proxySelf',{"tmusername":$stateParams.username});
      }
      else{
        $state.go('alternateManager.proxySelf');
      }
    };

    //below code to get managername
    var loggedInuser = localStorageService.get("loggedInUser").username;
    vm.selectedUser = employeeDetails.getCurrentSelectedTeamMember();
    if(vm.selectedUser == null || vm.selectedUser == undefined){
      vm.selectedUser = loggedInuser;
    }else{
      vm.selectedUser = employeeDetails.getCurrentSelectedTeamMember();
    }

    console.log('vm.selectedUser', vm.selectedUser, loggedInuser);
    //$window.selectedTeamMember = vm.selectedUser;

    activate();

    ////////////////

    function getDateOnly(res){
      var date = new Date(res)
      var res = $filter('dateInPST')(date);
      return res;
    }

    function sortColumn(columnName, sortType) {
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

    function activate() {
      vm.loadingAlternate = true;
      if($stateParams.username){
        var loggedInuser = localStorageService.get("loggedInUser").username;
        var username = $stateParams.username;
      }else{
        var loggedInuser = localStorageService.get("loggedInUser").username;
        var username = localStorageService.get("loggedInUser").username;
      }
        dataservice.getTeamAlternateMgrList(vm.currentPage, vm.recordsPerPage, username, loggedInuser, vm.sort).then(function (response) {
        console.info('called getConversationTeamMgr',vm.sort_alt);
        vm.loading = false;
        vm.totalRecord = parseInt(response.headers()["x-total-count"]);

        if(vm.recordsPerPage >= vm.totalRecord){
          vm.showLoadMore = false;
        }
        else{
          vm.showLoadMore = true;
        }
        if (response.status === 200 || response.status === 201) {
          if (typeof response.data !== 'undefined') {
            if(response.data.metadata.totalcount == 0){
              vm.AlternateTeamDetails = false;
              vm.loadingAlternate = false;
            }else{
              /*vm.totalRecord = response.data.metadata.totalcount;
              vm.AlternateTeamDetails = response.data.serverdata;
              vm.loadingAlternate = false;*/

              var fullData = response.data.serverdata;
              var fullNames = response.data.metadata.fullname;

              for (var key in fullData) {
                var username = fullData[key].user_username;
                var proxyname = fullData[key].proxy_username;

                fullData[key].user_fullname = fullNames[username];
                fullData[key].proxy_fullname = fullNames[proxyname];
              }
              //console.table(fullData);

              vm.totalRecord = response.data.metadata.totalcount;
              vm.AlternateTeamDetails = fullData;
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
})();
