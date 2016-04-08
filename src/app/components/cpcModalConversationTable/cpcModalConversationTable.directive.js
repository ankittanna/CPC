(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcModalConversationTable', cpcModalConversationTable);

  /* @ngInject */
  function cpcModalConversationTable() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcModalConversationTable/cpcModalConversationTable.html',
      bindToController: true,
      controller: Controller,
      controllerAs: 'vm',
      link: link,
      restrict: 'E',
      attrs:{},
      scope: {
      }
    };
    return directive;

    function link(scope, element, attrs) {}
  }

  /* @ngInject */
  function Controller(dataservice, _, $http, $location,$state,localStorageService,objectStore) {
    var vm = this;
    vm.currentFy = localStorageService.get("currentFyQuarter").data.fy;
    vm.currentQuarter = localStorageService.get("currentFyQuarter").data.quarter;
    vm.response = false;
    vm.showAlternateKey = true;
    vm.altTeamAvailable = false;
    vm.totalRecord = '';
    vm.recordsPerPage = 5;
    
    vm.currentPage = 1;
    vm.maxSize = 3;
    vm.showCreateBtn = true;
    activate();
    vm.go = function ( path ) {
	  	$location.path( path );
    };

    vm.createNewConversationTeam = function(){
    	objectStore.conversation.draftTeamConversation.remove();
    	$state.go('conversationdetails.teamNewConversation');
    }

    vm.changePage = function() {
      console.log(vm.currentPage);
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
    			vm.quarter = vm.currentFy +":"+ vm.currentQuarter;
    		}
    	}
    });

    function activate() {
      console.log('activate');
      var c_yr = null;
      var c_q = null;

      try {
        var temp = vm.quarter.split(":");
        c_yr = temp[0];
        c_q = temp[1];
      }
      catch (e) {
      }

      var loginuser = localStorageService.get("loggedInUser").username;
      vm.loading = true;
      vm.response = false;
              c_yr = c_yr == null ? vm.currentFy : c_yr;
              c_q = c_q == null ? vm.currentQuarter : c_q;

              dataservice.getConversationTeam("TEAM", vm.currentPage, vm.recordsPerPage,loginuser,c_yr, c_q).then(function (response) {
                vm.loading = false;
                if (response.status === 200 || response.status === 201) {
                  console.log("response of team conversation ");
                  vm.response = response.data;
                  console.log(response);
                  console.log(vm.response[0].AlternateTeam);
                  if(vm.response[0].AlternateTeam){
                	  console.log("YYYYYYY");
                	  vm.altTeamAvailable = true;
                  }
                  else{
                	  console.log("NNNNNNN");
                	  vm.altTeamAvailable = false;
                  }
                }
                else {
                  vm.response = false;
                }
              });
    };

    vm.changedQuarterValue = function() {
      console.log(vm.quarter);
      //call service here
      activate();
    };
    vm.changedBy = function() {
      console.log(vm.statusFilterValue + '' + vm.byFilterValue);
      //call service here
      activate();
    };
    vm.changedStatus = function() {
      console.log(vm.statusFilterValue + '' + vm.byFilterValue);
      //call service here
      activate();
    };
    vm.clearFilters = function() {
      vm.byFilterValue = 'Select';
      vm.statusFilterValue = 'Select';
      vm.quarter = vm.quarters[0];
      vm.reverse1 = '';
      vm.reverse2 = '';
      vm.reverse3 = '';
      vm.reverse4 = '';
      vm.reverse5 = '';
      vm.searchTitle = '';
    };
    vm.searchChanged = function() {
      console.log(vm.searchTitle);
      //call service here
      activate();
    };
    vm.sort = function(column, sortType) {
      if (sortType === true) {
        console.log(column + 'descending');
        //call service here
        activate();
      } else if (sortType === false) {
        console.log(column + 'ascending');
        //call service here
        activate();
      }
    };

    vm.showHideAlternateTeam = function(){
    	if(vm.showAlternateKey)
    		vm.showAlternateKey = false;
    	else
    		vm.showAlternateKey = true;
    };

    vm.calculateConvTag = function(convCount){
    	if(typeof convCount == 'undefined'){
    		convCount = '0';
    	}
    	return convCount;
    }

    vm.getFullname = function(key){
    	var fullName = key.split("#")[1];
    	return fullName;
    }

    vm.showConversationsByTag = function(key,count,tag,isAlternateTeamMember){
    	console.log("count "+count);
    	var username = key.split("#")[0];
    	console.log("show conversation for "+username);
    	console.log("show conversation for tag "+tag);
    	console.log("show conversation for aletrnate member "+isAlternateTeamMember);
    	console.log("fyQuarter "+vm.quarter);
    	if(count != ""){
    		$state.go("conversationdetails.teamMemberDraftConversation",{"username":username,"tag":tag,"isAlternateTeamMember":isAlternateTeamMember,"fyQuarter":vm.quarter});
    	}
    }

    vm.viewAllSyncUpConversations = function(key,isAlternateTeamMember){
    	var username = key.split("#")[0];
    	console.log("show drafted conversation for "+username);
//        $state.go('conversationsTeamMember.self',{"tmusername":username,"isAlternateTeamMember":isAlternateTeamMember});
    	$state.go("conversationdetails.teamMemberDraftConversation",{"username":username,"isAlternateTeamMember":isAlternateTeamMember,"fyQuarter":vm.quarter});
      };

    vm.getLocation = function(val) {
      return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: val,
          sensor: false
        }
      }).then(function(response) {
        return response.data.results.map(function(item) {
          return item.formatted_address;
        });
      });
    };
  }
})();
