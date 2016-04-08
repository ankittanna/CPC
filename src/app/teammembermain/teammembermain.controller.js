'use strict';

angular.module('cpccore')
  .controller('TeamMemberMainCtrl', function($scope,$window,$stateParams,$location,$q,$state) {

    if(typeof $stateParams.username !== 'undefined')
    {
      $scope.username = $stateParams.username;
      $window.userProfile.username = $stateParams.username;
    }

    $scope.getLocation = function(){
      return $q(function(resolve){
        resolve($location.path());
      });
    }

    $scope.showTeamView = true;

    $scope.hideTeamMemberView = function(){
      if($state.is("teammemberhome"))
      {
        $scope.showTeamView = true;
      }
      else{
        $scope.showTeamView = false;
      }
    }

    $scope.oneAtATime = true;

    $scope.groups = [{
      title: 'Dynamic Group Header - 1',
      content: 'Dynamic Group Body - 1'
    }, {
      title: 'Dynamic Group Header - 2',
      content: 'Dynamic Group Body - 2'
    }];

    $scope.items = ['Item 1', 'Item 2', 'Item 3'];

    $scope.addItem = function() {
      var newItemNo = $scope.items.length + 1;
      $scope.items.push('Item ' + newItemNo);
    };

    $scope.status = {
      isFirstOpen: true,
      isFirstDisabled: false
    };
  });
