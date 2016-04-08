'use strict';

angular.module('cpccore')
  .controller('ConvCtrl', function($scope, $window, $state, $location,$stateParams,objectStore) {

	$scope.go = function ( path ) {
		  	$location.path( path );
	};

  if(typeof $stateParams.username !== 'undefined')
  {
    $scope.username = $stateParams.username;
    $window.teamMemberUserName = $stateParams.username;
  }

/*	$scope.createNewConversation = function(conversationType, conversationCategory, creatingUser)
	{
		console.log("********** ************* in create new conversation of conversation.js ************ ***********");
		$window.conversationType = conversationType;
		$window.conversationOwner = creatingUser;

		//$window.currentConversation = {};
    objectStore.conversation.currentConversation.remove();

		$window.conversationIndex = 0;
		$window.totalConversations = 0;

		$scope.go('/conversationdetails/teamNewConversation');
	};
*/
	/*$scope.oneAtATime = true;

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
    };*/

	// By default load the Self State
	//$state.go('conversations.selfState');
  });
