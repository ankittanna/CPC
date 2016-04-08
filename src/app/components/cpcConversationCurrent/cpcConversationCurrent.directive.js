(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcConversationCurrent', cpcConversationCurrent);

  cpcConversationCurrent.$inject = [];

  /* @ngInject */
  function cpcConversationCurrent() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcConversationCurrent/cpcConversationCurrent.html',
      bindToController: true,
      controller: Controller,
      controllerAs: 'vm',
      link: link,
      restrict: 'E',
      scope: {

      }
    };
    return directive;

    function link(scope, element, attrs) {}
  }

  /* @ngInject */
  function Controller($scope, $rootScope, $location, $window, $state,localStorageService, dataservice,objectStore) {
    var vm = this;
      $scope.go = function ( path ) {
      $location.path( path );
	};

    vm.totalRecord = null;
	//$scope.userProfile = $window.userProfile;

	$scope.monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	$window.conversationType = '';
	$window.conversationOwner = {};
	
	vm.directHierarchy = true;
	
	$scope.createNewConversation = function(conversationType, conversationCategory)
	{
	//	$window.conversationType = conversationType;
	//	$window.conversationOwner = creatingUser;
	//	$window.currentConversation = null;
		  //$window.draftConversationObject = null;
      objectStore.conversation.draftConversation.remove();
      objectStore.conversation.createConversationSource.set("conversationSelf");
	//	$window.conversationIndex = 0;
	//	$window.totalConversations = 0;

    	$state.go('conversationdetails.newConversation');
	};

	$scope.translateDate = function(dateString)
	{
		var generatedDateString = '';

		var date = new Date(dateString);
		generatedDateString = date.getDate() + ' ' + $scope.monthArray[date.getMonth()] + ' ' + date.getFullYear();

		return generatedDateString;
	};

	//go('/conversationdetails')

	// To be retrieved from Services

    var sort ={"title":"DESC"};
    vm.currentFy = localStorageService.get("currentFyQuarter").data.fy;
    vm.currentQuarter = localStorageService.get("currentFyQuarter").data.quarter;
    var page=1;
    var per_page=99;
    var conversationabout=localStorageService.get("loggedInUser").username;
    var loginuser=localStorageService.get("loggedInUser").username;
    $scope.loadedConversations = false;
    $scope.loading = true;
    	
    dataservice.getCurrentConversation("SELF",page,per_page,vm.currentFy,vm.currentQuarter,conversationabout,loginuser,sort).then(function(response){
            if(Number(parseInt(response.headers()["x-total-count"])) == response.headers()["x-total-count"] && vm.totalRecord == null) {
              vm.totalRecord = parseInt(response.headers()["x-total-count"]);
            }
            $scope.loading = false;
            if(response.status === 200 || response.status === 201) {
              ////alert(JSON.stringify(response));
              if (typeof response.data !== 'undefined') {
                //console.log(response.data["serverdata"]);
                $scope.loadedConversations =  response.data[0].serverdata;
              }
            }
            else{
            	$scope.loadedConversations = false;
            }
     });
      
    vm.go = function (path) {
      $location.path(path);
    };

	$scope.loadConversationDetailPage = function(conversationCategory, conversationObject, status,conversationIndex,totalConversations)
	{
		//$window.conversationIndex = conversationIndex;
		$window.totalConversations = totalConversations;

		 if(conversationCategory === 'self')
		 {
			 if(status === 'CLOSE' || status === 'OPEN')
			 {
				 //$window.sharedConversationObject = conversationObject;
         objectStore.conversation.sharedConversation.set(conversationObject);
         $state.go('conversationdetails.sharedConversation');
			 }
       else if(status === 'DRAFT')
			 {
				 if(conversationObject.type == "TalentSyncUp"){
					 objectStore.conversation.draftTeamConversation.set(conversationObject);
				     $state.go('conversationdetails.teamNewConversation');
			     }
				 else{
					 objectStore.conversation.createConversationSource.set("conversationSelf");
			    	 objectStore.conversation.draftConversation.set(conversationObject);
			    	 $state.go('conversationdetails.newConversation');
				 }
    	   
			 }
		 } else if(conversationCategory === 'team')
		 {

		 }
	};


	// Check Conversation Tile Status
	//conversation.conversation[0].status=='DRAFT'?'save':'check-circle'

	// Conversation Submitted By
	$scope.conversationSubmittedBy = function(conversationObject)
	{
		if(typeof conversationObject !== 'undefined')
		{
			var submittedBy = conversationObject.status==='EMP_SUBMIT'?'E':'M';

			return submittedBy;
		}
	};
	// Is Conversation Draft or Submit state
	$scope.isConversationDraft = function(conversationArray)
	{
		var conversationDraftStatus = false;

		if(conversationArray[0].status === 'DRAFT')
		{
			conversationDraftStatus = true;
		} else if(conversationArray[0].status === 'EMP_SUBMIT' || conversationArray[0].status === 'MGR_SUBMIT')
		{
			conversationDraftStatus = false;
		}
		return conversationDraftStatus;
	};
	// Truncate Conversation Title
	$scope.truncateConversationTitle = function(title)
	{
		var convTitle = title;
		if(convTitle!=null && convTitle.length > 30)
		{
			convTitle = convTitle.substring(0,30)+"...";
		}
		return convTitle;
	};
	// Check Which Page to Load
	//conversationdetails{{conversation.convStatus=='OPEN'?'.newConversation':'.sharedConversation'}}
	$scope.conversationPageType = function(conversationObject)
	{
		var conversationPageType = 'conversationdetails.newConversation';

		if(conversationObject.convStatus === 'OPEN')
		{
			if(conversationObject.conversation.length === 1)
			{
				if(conversationObject.conversation[0].status === 'DRAFT')
				{
					conversationPageType = 'conversationdetails.newConversation';
				} else if(conversationObject.conversation[0].status === 'EMP_SUBMIT' || conversationObject.conversation[0].status === 'MGR_SUBMIT')
				{
					conversationPageType = 'conversationdetails.sharedConversation';
				}
			} else if(conversationObject.conversation.length > 1)
			{
				if((conversationObject.conversation[0].status === 'EMP_SUBMIT' || conversationObject.conversation[0].status === 'MGR_SUBMIT') && (conversationObject.conversation[1].status === 'MGR_SUBMIT' || conversationObject.conversation[1].status === 'EMP_SUBMIT'))
				{
					conversationPageType = 'conversationdetails.sharedConversation';
				} else
				{
					conversationPageType = 'conversationdetails.draftedConversation';
				}
			}
		} else if(conversationObject.convStatus === 'CLOSE')
		{
			// When Both the conversations are available and submitted
			// This is a generic one so it even works with single conversation also but it's status should be 'EMP_SUBMIT' or 'MGR_SUBMIT'
			conversationPageType = 'conversationdetails.sharedConversation';
		}

		return conversationPageType;
	};

  }
})();
