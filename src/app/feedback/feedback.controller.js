(function() {
    'use strict';

    angular
        .module('cpccore')
        .controller('FeedbackCtrl', FeedbackCtrl);

    //FeedbackCtrl.$inject = ['dependencies'];

    /* @ngInject */
    function FeedbackCtrl($scope, $location) {
        var vm = this;
        vm.shouldFeedbackShown = true;
        vm.headerNavDisplay = 'true';

        $scope.$on('$locationChangeStart', function(event) {
    	if($location.path().indexOf('viewFeedback') !== -1)
		{
			vm.shouldFeedbackShown = false;
			vm.headerNavDisplay = 'false';
		} else 
		{
			vm.shouldFeedbackShown = true;
			vm.headerNavDisplay = 'true';
		}

	   });
    }
})();
