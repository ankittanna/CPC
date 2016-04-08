(function() {
  'use strict';

  angular
      .module('cpccore')
      .controller('TimelineSecondTeamCtrl', TimelineSecondTeamCtrl);

  TimelineSecondTeamCtrl.$inject = ['dataservice', 'localStorageService', '$http', '$rootScope','objectStore', '$state', '$stateParams'];

  /* @ngInject */
  function TimelineSecondTeamCtrl(dataservice, localStorageService, $http, $rootScope, objectStore, $state, $stateParams) {

    var vm = this;
    vm.loading = true;
    vm.showLoadMore = false;
    vm.timelineTeamSecondNavigate = timelineTeamSecondNavigate;
    vm.getMoreConversations = function(){
      if(vm.recordsPerPage < vm.totalRecord){
        vm.recordsPerPage = vm.recordsPerPage + 5;
      }
      activate();
    }

    function timelineTeamSecondNavigate(){
        $state.go('timeline.teamState');
    }

    vm.viewDetail = function(data, viewType){
      data.type = viewType;
      data.backUrl = $state.current.name;
      objectStore.timeline.timelineId.set(JSON.stringify(data));
      $state.go('timeline.view');
    };

    vm.sort = {};
    // this will automatically get populated using service
    vm.totalRecord = null;
    // enter the value here to modify number of items shown in one page
    vm.recordsPerPage = 20;

    vm.currentPage = 1;
    vm.maxSize = 3;

    vm.changePage = function () {
      console.log(vm.currentPage);
      vm.response = false;
      vm.loading = true;
      //call service here with the current page to be shown.
      activate();
    };

    //Quarter dropdown start
    vm.currentFy = localStorageService.get("currentFyQuarter").data.fy;
    vm.currentQuarter = localStorageService.get("currentFyQuarter").data.quarter;

    dataservice.getAllFiscalYear().then(function(response){
      if(response.status == 200){
        if(typeof response.data !== 'undefined'){
          var fyQuarters = response.data;
          console.log("checking new logic of fy and quarter");
          console.log(fyQuarters);
          vm.quarters = new Array();
          /*for (var fy = 0; fy < fyQuarters.length; fy++) {*/
          for(var fy in fyQuarters){
            console.log('fyQuarters.length', fyQuarters);
            var fiscalYear = fy;
            var outFy = {"year":fiscalYear,"quarter":"","display":fiscalYear,"id":fiscalYear};
            var quartersInFy = fyQuarters[fiscalYear];
            console.log(quartersInFy);
            /*for(var q in quartersInFy){*/
            for (var q = 0; q < quartersInFy.length; q++) {
              console.log("******** "+q);
              var outQ = {"year":fiscalYear,"quarter":quartersInFy[q],"display":fiscalYear +" "+quartersInFy[q],"id":fiscalYear +":"+quartersInFy[q]};
              vm.quarters.push(outQ);
            }
          }
          vm.quarter = vm.currentFy +":"+ vm.currentQuarter;
          activate();
        }
      }
    });
    //Quarter dropdown end


    function activate(){

      vm.loading = true;
      vm.response = false;

      vm.fy_currentYear = "FY" + new Date().getFullYear(); //Current FY


      vm.c_yr = null;
      vm.c_q = null;

      try {
        var temp = vm.quarter.split(":");
        vm.c_yr = temp[0];
        vm.c_q = temp[1];
      }
      catch (e) {
      }


      var conversationabout = localStorageService.get("loggedInUser").username;
      var loginuser = localStorageService.get("loggedInUser").username;

      vm.loading = true;
      dataservice.getTimeline(vm.currentPage, vm.recordsPerPage, loginuser, vm.c_yr, vm.c_q, "AltTeam", vm.sort).then(function (response) {
        vm.totalRecord = parseInt(response.headers()["x-total-count"]);
        if(vm.recordsPerPage >= vm.totalRecord){
          vm.showLoadMore = false;
        }
        else{
          vm.showLoadMore = true;
        }
        if (response.status === 200 || response.status === 201) {
          if (typeof response.data !== 'undefined') {

            if(response.data.content.length == 0){
              vm.response = false;
              vm.loading = false;
            }else{
              var modifiedData = modifyTimelineData(response.data.content);
              console.log(modifiedData);
              vm.response = modifiedData;
              vm.loading = false;
            }
          }
        }
        else {
          console.log('response', response);
          vm.response = false;
          vm.loading = false;
        }
      });
    }

    function modifyTimelineData(initialData){
      var finalData = [];
      var tempData = {
        "date"  : "",
        "image" : "",
        "from" :"",
        "to" :"",
        "title" :"",
        "description" :"",
        "attachments" :"",
        "tags" :""
      };

      for (var i = 0; i < initialData.length; i++) {
        var value = initialData[i];
        // For Conversation
        if(value.component == "Conversation"){
          tempData = {
            "status": value.transaction_type,
            "date"  : value.conversation.created_on,
            "image" : "../../client/assets/images/sync-round-64px.png",
            "from" :value.conversation.ownerUsername,
            "to" :value.conversation.targetUsername,
            "title" :value.conversation.topicTitle,
            "description" :value.conversation.conversation[0].comments,
            "attachments" :value.conversation.conversation[0].attachmentId,
            "tags" :value.conversation.tags
          };
          finalData.push(tempData);
        }else{
          if(status == "CreateUnRequestFeedback-COMPLETE"){
            tempData = {
              "status": value.transaction_type,
              "date"  : value.feedback.requested_on,
              "image" : "../../client/assets/images/feedback-round-64px.png",
              "from" :value.feedback.provider,
              "to" :value.feedback.feedbackAbout,
              "title" :value.feedback.title,
              "description" :value.feedback.feedbackResponse,
              "attachments" :value.feedback.attachment_id,
              "tags" :value.feedback.tag
            };
          }else{
            tempData = {
              "status": value.transaction_type,
              "date"  : value.feedback.requested_on,
              "image" : "../../client/assets/images/feedback-round-64px.png",
              "from" :value.feedback.provider,
              "to" :getValues(value.feedback.requester, value.feedback.feedbackAbout),
              "title" :value.feedback.title,
              "description" :getValues(value.feedback.description, value.feedback.feedbackResponse),
              "attachments" :value.feedback.attachment_id,
              "tags" :value.feedback.tag
            };
          }
          finalData.push(tempData);
        }
      };
      return finalData;
    };

    function getValues(first, second){
      if(first == null || first == undefined || first == ""){
        return second;
      }else{
        return first;
      }
    };

    vm.changedQuarterValue = function () {
      console.log(vm.quarter);
      activate();
    };

    $rootScope.$on('timelineLabels', function(event, args){
      vm.sort = args;
      console.log('vm.sort', JSON.stringify(vm.sort));
      activate();
    });
  }
})();
