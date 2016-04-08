(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcFooter', cpcFooter);

  /* @ngInject */
  function cpcFooter() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcFooter/cpcFooter.html',
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
  function Controller( ) {
      
  }
})();





