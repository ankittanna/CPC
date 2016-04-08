'use strict';

angular.module('cpccore')
  .controller('TimelineCtrl', function($scope, dataservice) {

    dataservice.getTimeline().then(function(responseData){
      $scope.data = responseData; 
    });
  });
