(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcFeedbackOverviewCount', cpcFeedbackOverviewCount);

  cpcFeedbackOverviewCount.$inject = [];

  /* @ngInject */
  function cpcFeedbackOverviewCount() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcFeedbackOverviewCount/cpcFeedbackOverviewCount.html',
      bindToController: true,
      controller: Controller,
      controllerAs: 'vm',
      link: link,
      restrict: 'E',
      attrs: {},
      scope: { overviewCount: '=' }
    };
    return directive;

    function link(scope, element, attrs) {}
  }

  /* @ngInject */
  function Controller($scope, $rootScope, $attrs, dataservice) {
    var vm = this;

    $rootScope.$on('feedbackOverviewCount', function(event, args){
      console.log('broadcast message', args);
      var pendingCount = 0;
      var completeCount = 0;
      var notSharedCount = 0;
      var declinedCount = 0;

      if(isNaN(args.PENDING) || args.PENDING === undefined)
      {
        pendingCount = 0;
      } else 
      {
        pendingCount = args.PENDING;
      }

      if(isNaN(args.COMPLETE) || args.COMPLETE === undefined)
      {
        completeCount = 0;
      } else 
      {
        completeCount = args.COMPLETE;
      }

      if(isNaN(args.NOTSHARE) || args.NOTSHARE === undefined)
      {
        notSharedCount = 0;
      } else 
      {
        notSharedCount = args.NOTSHARE;
      }

      if(isNaN(args.DECLINE) || args.DECLINE === undefined)
      {
        declinedCount = 0;
      } else 
      {
        declinedCount = args.DECLINE;
      }

      $scope.overviewCount = {
        'yetToBeGiven' : pendingCount,
        'given' : completeCount + notSharedCount,
        'declined': declinedCount
      }
    });

    vm.pendingTileHeader = '';
    vm.givenTileHeader = '';
    vm.declinedTileHeader = '';

    if($attrs.overviewcounttype === 'provide')
    {
      vm.pendingTileHeader = 'FEEDBACK.COUNT_YET_TO_GIVE';
      vm.givenTileHeader = 'FEEDBACK.COUNT_GIVEN';
      vm.declinedTileHeader = 'FEEDBACK.COUNT_PROVIDED_DECLINED';
    } else if($attrs.overviewcounttype === 'reqrec') 
    {
      vm.pendingTileHeader = 'FEEDBACK.COUNT_REQUESTED';
      vm.givenTileHeader = 'FEEDBACK.COUNT_RECEIVED';
      vm.declinedTileHeader = 'FEEDBACK.COUNT_REQREC_DECLINED';
    }
    // Fetch the counts first using service
    // Service is listed in data.service.js
    /*$scope.provideFeedbackOverviewCount = dataservice.getProvideFeedbackOverviewCount();
    $scope.reqrecFeedbackOverviewCoun = dataservice.getReqrecFeedbackOverviewCount();

    // overviewCount - Object Place Holder for the values used in cpcFeedbackOverviewCount component.
    // Initialized all 3 properties to 0, 0, 0
    $scope.overviewCount = {yetToBeGiven: 0, given: 0, declined: 0};

    // provideFeedbackOverviewCount and reqrecFeedbackOverviewCount to be retrieved from the services before the component gets loaded
    // This would be switched contextually based on the type of parameter coming in from the component.
    $scope.provideFeedbackOverviewCount = {yetToBeGiven: 10, given: 20, declined: 30};
    $scope.reqrecFeedbackOverviewCount = {yetToBeGiven: 11, given: 22, declined: 33};

    // If the overview count type is provide switch to provide object else if it is reqrec switch to that object.
    // CHECK: does this component have same value under both the tabs?
    if($attrs.overviewcounttype === 'provide')
    {
      $scope.overviewCount = $scope.provideFeedbackOverviewCount;
    } else if($attrs.overviewcounttype === 'reqrec')
    {
      $scope.overviewCount = $scope.reqrecFeedbackOverviewCount;
    }*/

  }
})();
