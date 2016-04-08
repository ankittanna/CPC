(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcTeamMemberConversationCurrent', cpcTeamMemberConversationCurrent);

  cpcTeamMemberConversationCurrent.$inject = [];

  /* @ngInject */
  function cpcTeamMemberConversationCurrent() {
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

    function link(scope, element, attrs) {
      attrs.$observe('username', function(value) {
        if (value) {
        	scope.tUser = value;
        }
      });
    }
  }

  /* @ngInject */
  function Controller($scope, $rootScope, $location, $window, $state,localStorageService, dataservice,$timeout,objectStore,$stateParams,employeeDetails) {
    var vm = this;
      $scope.go = function ( path ) {
      $location.path( path );
	};
	vm.context = "TEAM";
	$scope.user = typeof $stateParams.tmusername === 'undefined'?$scope.tUser:$stateParams.tmusername;
  	console.log("%%%%%%%%%%%%%%  "+$scope.user);
  	console.log("%%%%%%%%%%%%%%  "+$stateParams.drillDownUser);
  	console.log("%%%%%%%%%%%%%%isAlternateTeamMember  "+$stateParams.isAlternateTeamMember);

  	/* condition to decide if create conversation should appear
  	 * only direct hierarchy and alternate team member case create should come */
  	var loggedInUser = localStorageService.get("loggedInUser").username;
  	dataservice.findMyManager($scope.user).then(function(response){
        if(response.status === 200) {
        	if (typeof response.data !== 'undefined'){
        		if(loggedInUser == response.data.username){
        			vm.directHierarchy = true;
        		}
        		else{
        			vm.directHierarchy = false;
        			dataservice.getAlternateManagerList($scope.user).then(function(response){
        		        if(response.status === 200) {
        		        	if (typeof response.data !== 'undefined'){
        		        		var altManagerList = response.data;
        		        		for (var k in altManagerList){
        						    if (altManagerList.hasOwnProperty(k)) {
        						         console.log("Key is " + k + ", value is" + altManagerList[k]);
        						         if(k == loggedInUser){
        						        	 vm.directHierarchy = true;
        						         }
        						    }
        						}
        		        	}
        		          }
        		    });
        		}
        	}
          }
    });

  	/* condition to decide context value */
  	if($stateParams.isAlternateTeamMember == "true"){
  		vm.context = "ALTERNATE";
  	}
  	else if($stateParams.isAlternateTeamMember == "false"){
  		vm.context = "TEAM";
  	}


    vm.totalRecord = null;
	$scope.monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	$window.conversationType = '';
	$window.conversationOwner = {};

	$scope.createNewConversation = function(conversationType, conversationCategory)
	{
	//	$window.conversationType = conversationType;
	//	$window.conversationOwner = creatingUser;
	//	$window.currentConversation = null;
		  //$window.draftConversationObject = null;
      objectStore.conversation.draftConversation.remove();
      objectStore.conversation.createConversationSource.set("ModalPopUp");
      employeeDetails.setCurrentSelectedTeamMember($scope.user);
	//	$window.conversationIndex = 0;
	//	$window.totalConversations = 0;
      $state.go('conversationdetails.newTeamMemberConversation');
	};

	$scope.translateDate = function(dateString)
	{
		var generatedDateString = '';

		var date = new Date(dateString);
		generatedDateString = date.getDate() + ' ' + $scope.monthArray[date.getMonth() + 1] + ' ' + date.getFullYear();

		return generatedDateString;
	};

	//go('/conversationdetails')

	// To be retrieved from Services

    var sort ={"title":"DESC"};
    vm.currentFy = localStorageService.get("currentFyQuarter").data.fy;
    vm.currentQuarter = localStorageService.get("currentFyQuarter").data.quarter;
    var page=1;
    var per_page=99;
    var conversationabout= $scope.user;
    var loginuser=localStorageService.get("loggedInUser").username;
    $scope.loadedConversations = false;
    $scope.loading = true;
    dataservice.getCurrentConversation(vm.context,page,per_page,vm.currentFy,vm.currentQuarter,conversationabout,loginuser,sort).then(function(response){
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
          $state.go('conversationdetails.sharedTeamMemberConversation');
        }
        else if(status === 'DRAFT')
        {
          //$window.currentConversation = conversationObject;
          //$window.draftConversationObject = conversationObject;
          objectStore.conversation.draftConversation.set(conversationObject);
          //$window.createConversationSource = "conversationSelf";
          objectStore.conversation.createConversationSource.set("ModalPopUp");
          $state.go('conversationdetails.newTeamMemberConversation');
        }
      } else if(conversationCategory === 'team')
      {

      }
    };


	// Check Conversation Tile Status
	//conversation.conversation[1].status=='DRAFT'?'save':'check-circle'

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

    if(typeof conversationArray[0] === 'undefined')
    {
      return false;
    }

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
		if(convTitle!= null && convTitle.length > 30)
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
				if(typeof conversationObject.conversation[0] !== 'undefined' && conversationObject.conversation[0].status === 'DRAFT')
				{
					conversationPageType = 'conversationdetails.newConversation';
				} else if(typeof conversationObject.conversation[0] !== 'undefined' && (conversationObject.conversation[0].status === 'EMP_SUBMIT' || conversationObject.conversation[0].status === 'MGR_SUBMIT'))
				{
					conversationPageType = 'conversationdetails.sharedConversation';
				}
			} else if(conversationObject.conversation.length > 1)
			{
				if(typeof conversationObject.conversation[0] !== 'undefined' && ((conversationObject.conversation[0].status === 'EMP_SUBMIT' || conversationObject.conversation[0].status === 'MGR_SUBMIT') && (conversationObject.conversation[0].status === 'MGR_SUBMIT' || conversationObject.conversation[0].status === 'EMP_SUBMIT')))
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
