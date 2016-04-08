(function() {
  'use strict';

  angular
    .module('cpccore')
    .controller('AlternateManagerCtrl', AlternateManagerCtrl);

  /* @ngInject */
  function AlternateManagerCtrl() {
    var vm = this;
    vm.title = 'AlternateManagerCtrl';

    activate();

    ////////////////

    function activate() {
    }
  }
})();
