(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcTableAlternate', cpcTableAlternate);

  /* @ngInject */
  function cpcTableAlternate() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcTableAlternate/cpcTableAlternate.html',
      bindToController: true,
      controller: Controller,
      controllerAs: 'vm',
      link: link,
      restrict: 'E',
      scope: {},
      attrs: {}
    };
    return directive;

    function link(scope, element, attrs) {}
  }

  /* @ngInject */
  function Controller() {
    var vm = this;

  }
})();
