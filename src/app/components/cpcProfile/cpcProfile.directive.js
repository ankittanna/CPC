(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcProfile', cpcProfile);

  /* @ngInject */
  function cpcProfile() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcProfile/cpcProfile.html',
      bindToController: true,
      controller: Controller,
      controllerAs: 'vm',
      link: link,
      restrict: 'E',
      scope: {}
    };
    return directive;

    function link(scope, element, attrs) {}
  }

  /* @ngInject */
  function Controller($log, $translate,localStorageService,$stateParams,dataservice,employeeDetails,$window, objectStore) {

    var vm = this;

    /* fetching currrent fiscal year and quarter and storing in local storage*/
    var currentYear = new Date().getFullYear();
    dataservice.getCurrentQuarter().then(function(curr_year_response){
          if(curr_year_response.status === 200)
            {
              var fy_currentYear = "FY"+currentYear;
              var quarter_data = curr_year_response.data;
              var currentQuarter = quarter_data[fy_currentYear];

              console.log("in profile page setting year and quarter "+fy_currentYear+" : "+currentQuarter);
              employeeDetails.setCurrentFiscalYear(fy_currentYear);
              employeeDetails.setCurrentQuarter(currentQuarter);
            }
          });

    /* using new services to get quarter and fiscal year */
    dataservice.getCurrentFyQuarter().then(function(response){
    	if(response.status == 200){
    		var currentFY = response.data.fy;
    		var currentQuarter = response.data.quarter;
    		console.log(response);
    		console.log("FY "+currentFY+" & quarter "+currentQuarter);
    	}
    });


    /* fetch alternate manager for logged in user */
    var loggedInUser = localStorageService.get("loggedInUser").username;
    dataservice.getAlternateManagerList(loggedInUser).then(function(response){
        if(response.status === 200)
          {
        	console.log("getting alternate manager list");
        	console.log(response.data);
            employeeDetails.setAlternateManagerList(response.data);
          }
      });

    // SERVICE TO GET THE USER PROFILE/CONTEXT USER DETAILS
    dataservice.getProfileDetails(loggedInUser).then(function(response){
      objectStore.contextUser.contextUserProfile.set(response.data);
    });

    if(typeof $stateParams.username === 'undefined')
    {
    	$window.userProfile = localStorageService.get("loggedInUser");
        vm.userprofile = $window.userProfile;
     //   var directoryImgURLtmp = typeof directoryImgURL !== 'undefined'?directoryImgURL:"http://wwwin.cisco.com/dir/photo";
        vm.userprofile["profileImageSmall"]="http://wwwin.cisco.com/dir/photo/std/"+vm.userprofile.username+".jpg";
        vm.userprofile["profileImageLarge"]="http://wwwin.cisco.com/dir/photo/zoom/"+vm.userprofile.username+".jpg";
    }
    else{
    	dataservice.getUserProfile($stateParams.username).then(function(response){
    		console.log("*********************************"+$window.userProfile);
    		$window.userProfile = localStorageService.get([$stateParams.username]);

    		vm.userprofile = $window.userProfile;
    		vm.userprofile["profileImageSmall"]="http://wwwin.cisco.com/dir/photo/std/"+vm.userprofile.username+".jpg";
    		vm.userprofile["profileImageLarge"]="http://wwwin.cisco.com/dir/photo/zoom/"+vm.userprofile.username+".jpg";
      });
    }


	vm.toggleTeamList = function(profileDetails)
  	{

		if($('#cpcTeamComponent').css('display') == 'none')
		{
			$('#cpcTeamComponent').removeClass('hidden-xs').removeClass('hidden-sm').removeClass('visible-md').removeClass('visible-lg');
			$('#cpcQuickLinksComponent').addClass('hidden-xs').addClass('hidden-sm');
			$('#cpcMetricsComponent').addClass('hidden-xs').addClass('hidden-sm');
			//$('#teamNavigation').addClass('visible-xs').addClass('visible-sm').removeClass('hidden-xs').removeClass('hidden-sm');
			$('#teamCarret').css('display', 'none');

		} else
		{
			 $('#cpcTeamComponent').addClass('hidden-xs').addClass('hidden-sm').addClass('visible-md').addClass('visible-lg');
			 $('#cpcQuickLinksComponent').removeClass('hidden-xs').removeClass('hidden-sm');
			 $('#cpcMetricsComponent').removeClass('hidden-xs').removeClass('hidden-sm');
			// $('#teamNavigation').removeClass('visible-xs').removeClass('visible-sm').addClass('hidden-xs').addClass('hidden-sm');
			 $('#teamCarret').css('display', 'block');

		}

	};

  }
})();

