(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcTimelineFilter', cpcTimelineFilter);

  /* @ngInject */
  function cpcTimelineFilter() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcTimelineFilter/cpcTimelineFilter.html',
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
  function Controller(_, $rootScope, $scope) {
    var vm = this;

    vm.hidedropdown = false;
    vm.secondaryFilter = [];
    vm.lastFilter = [];
    vm.labels = [];
    vm.sort = {
      "tags": [],
      "filter": {}
    };

    vm.formats = [
      'All Activities',
      'Sync Up Conversations',
      'Performance',
      'Development',
      'Alignment',
      'You',
      'Feedback',
      'Provided Feedback',
      'Recieved Feedback'
    ];
    vm.timelineFilterDropdownValue = vm.formats[0];

    vm.timelineFilterChange = function(){
      //vm.timelineFilterDropdownValue
      vm.sort.tags = [];
      if(vm.timelineFilterDropdownValue == 'All Activities'){
        vm.sort.tags = ['Performance', 'Development', 'Alignment', 'You', 'Provided Feedback', 'Recieved Feedback'];
      }else if(vm.timelineFilterDropdownValue == 'Sync Up Conversations'){
        vm.sort.tags = ['Performance', 'Development', 'Alignment', 'You'];
      }else if(vm.timelineFilterDropdownValue == 'Feedback'){
        vm.sort.tags = ['Provided Feedback', 'Recieved Feedback'];
      }else{
        vm.labels.push(vm.timelineFilterDropdownValue);
        vm.sort.tags = vm.labels;
      }
      vm.sort.filter.searchString = vm.timelineFilterText != null ? vm.timelineFilterText : "";
      $rootScope.$broadcast('timelineLabels', vm.sort);
    };
    vm.timelineFilterSubmit = function(){
      //vm.timelineFilterText
      vm.sort.tags = [];
      if(vm.timelineFilterDropdownValue == 'All Activities'){
        vm.sort.tags = ['Performance', 'Development', 'Alignment', 'You', 'Provided Feedback', 'Recieved Feedback'];
      }else if(vm.timelineFilterDropdownValue == 'Sync Up Conversations'){
        vm.sort.tags = ['Performance', 'Development', 'Alignment', 'You'];
      }else if(vm.timelineFilterDropdownValue == 'Feedback'){
        vm.sort.tags = ['Provided Feedback', 'Recieved Feedback'];
      }else{
        vm.labels.push(vm.timelineFilterDropdownValue);
        vm.sort.tags = vm.labels;
      }
      vm.sort.filter.searchString = vm.timelineFilterText != null ? vm.timelineFilterText : "";
      $rootScope.$broadcast('timelineLabels', vm.sort);

    }

    vm.onEnterClick = function(event){
      if(event.keyCode == 13){
        vm.sort.tags = [];
        if(vm.timelineFilterDropdownValue == 'All Activities'){
          vm.sort.tags = ['Performance', 'Development', 'Alignment', 'You', 'Provided Feedback', 'Recieved Feedback'];
        }else if(vm.timelineFilterDropdownValue == 'Sync Up Conversations'){
          vm.sort.tags = ['Performance', 'Development', 'Alignment', 'You'];
        }else if(vm.timelineFilterDropdownValue == 'Feedback'){
          vm.sort.tags = ['Provided Feedback', 'Recieved Feedback'];
        }else{
          vm.labels.push(vm.timelineFilterDropdownValue);
          vm.sort.tags = vm.labels;
        }
        vm.sort.filter.searchString = vm.timelineFilterText != null ? vm.timelineFilterText : "";
        $rootScope.$broadcast('timelineLabels', vm.sort);
      }
    }
  }
})();
