(function() {
  'use strict';

  angular
    .module('cpccore')
    .controller('TimelineViewCtrl', TimelineViewCtrl);

  /* @ngInject */
  function TimelineViewCtrl(objectStore, $filter, $state) {
    var vm = this;
    var data = JSON.parse(objectStore.timeline.timelineId.get());
    console.log('view', data);
    vm.feedbackProvider = data.from;
    vm.feedhackReceivedOnDate = getDateOnly(data.date);
    vm.feedhackReceivedOnTime = getTimeOnly(data.date);
    vm.feedbackTitle = data.title;
    vm.feedbackResponse = data.description;
    vm.attachment_id = data.attachments;
    vm.tags = data.tags;

    vm.goBack = function(){
      $state.go(data.backUrl);
    }

    function getDateOnly(date){
      var res = $filter('dateInPST')(date);
      return res;
    }

    function getTimeOnly(date){
      var res = $filter('timeInPST')(date);
      return res;
    }
  }
})();
