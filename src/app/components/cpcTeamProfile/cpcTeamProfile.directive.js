(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcTeamProfile', cpcTeamProfile);

  /* @ngInject */
  function cpcTeamProfile() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcTeamProfile/cpcTeamProfile.html',
      bindToController: true,
      controller: 'HomeTabCtrl',
      controllerAs: 'vm',
      link: link,
      restrict: 'E',
      scope: {
    	  username:'@username'
      }
    };
    return directive;

    function link(scope, element, attrs) {}
  }

  /* @ngInject */
  /*function Controller($log, $translate, $scope, $state, $location, $window) {
    $scope.createNewConversation = function() {
      $state.go('conversations.selfState');

      $scope.quarters = [
        'FY 2015 Q1',
        'FY 2015 Q2',
        'FY 2015 Q3',
        'FY 2015 Q4'
      ];
      $scope.quarter = $scope.quarters[0];
    };

  }*/
})();
