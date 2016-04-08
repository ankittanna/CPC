'use strict';
var tokenRefresher = false;
angular.module('cpccore')
  .controller('MainCtrl', function($scope, $rootScope,$http,$window) {

    $scope.HidePopup = function(){
      $rootScope.$emit('topic', 'message');
    };

    $scope.oneAtATime = true;

    $rootScope.$on('loading:finish', function(event,response){
      var timeout = 1800; //token Timeout in seconds
      var refreshTokenAt = 600; //Refresh token secs before timeout
      if(typeof response.headers()["server-timestamp"] !== 'undefined') {
        var ms = parseInt(response.headers()["server-timestamp"]) - ((parseInt(JSON.parse($window.localStorage.getItem('ls.token'))['expires'])-1000)/1800);
        var diffInSecs = (ms/1000) % 60;
        if((timeout - diffInSecs) <= refreshTokenAt && tokenRefresher === false)
        {
          tokenRefresher = true;
            $http({
              method: 'GET',
              url: syncapp.context + '/api/renewToken'
            })
            .then(function(response){
                console.log("Refreshing token>>>>>>>>>>>>>>>>>>");
                var key = "ls.token";
                var store = new Object();
                store.token = response.data.token;
                store.expires = response.data.expires;
                var value = $window.JSON.stringify(store);
                $window.localStorage.setItem(key, value);
                tokenRefresher = false;
            })
            .catch(function(response){
              $window.location.href = "auth/logout";
              tokenRefresher = false;
            });
        }
      }
    });

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
