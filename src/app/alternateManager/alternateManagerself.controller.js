(function() {
  'use strict';

  angular
    .module('cpccore')
    .controller('AlternateManagerSelfCtrl', AlternateManagerSelfCtrl);

  /* @ngInject */
  function AlternateManagerSelfCtrl(localStorageService, dataservice, $http, $filter, objectStore, $state, $stateParams, moment) {
    var vm = this;
    vm.sortColumn = sortColumn;
    vm.showLoadMore = false;
    vm.title = 'AlternateManagerSelfCtrl';
    vm.isProvideFeedbacksLoading = true;
    vm.getDateOnly = getDateOnly;
    vm.viewAlternate = viewAlternate;
    vm.loadingAlternate = true;
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

    activate();

    ////////////////

    function viewAlternate(data, view){

      data.actionType = "VIEWSELF";
      objectStore.alternate.alternateManagerId.set(JSON.stringify(data));
      /*$state.go('alternateManager.proxySelf');*/
      if($stateParams.username){
        $state.go('teamMemberAlternateManager.proxySelf',{"tmusername":$stateParams.username});
      }
      else{
        $state.go('alternateManager.proxySelf');
      }
    };

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
      if($stateParams.username){
        var loggedInuser = localStorageService.get("loggedInUser").username;
        var username = $stateParams.username;
      }else{
        var loggedInuser = localStorageService.get("loggedInUser").username;
        var username = localStorageService.get("loggedInUser").username;
      }

      dataservice.getMyAllAlternateMgrList(vm.currentPage, vm.recordsPerPage, username, loggedInuser, vm.sort).then(function (response) {
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
            //vm.response = response.data;
            if(response.data.metadata.totalcount == 0){
              vm.AlternateTeamDetails = false;
              vm.loadingAlternate = false;
            }else{
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
