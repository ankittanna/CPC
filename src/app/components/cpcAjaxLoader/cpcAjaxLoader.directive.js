(function() {
    'use strict';

    angular
        .module('cpccore')
        .directive('ajaxLoader',ajaxLoader);

    /* @ngInject */
    function ajaxLoader(){
        var directive = {
            templateUrl: '/client/app/components/cpcAjaxLoader/cpcAjaxLoader.html',
            restrict: 'E',
            transclude: true,
            scope: {
                type:'@type',
            },
            link: function(scope, element, attrs) {
                if (!scope.type) {
                    scope.type='large';
                }
            }
        };
        return directive;
    }

})();
