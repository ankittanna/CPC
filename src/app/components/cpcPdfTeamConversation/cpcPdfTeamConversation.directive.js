(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcPdfTeamConversation', cpcPdfTeamConversation);

  /* @ngInject */

  function cpcPdfTeamConversation() {
    // Usage:
    //
    // Creates:
    //

    var directive = {
      templateUrl: '/client/app/components/cpcPdfTeamConversation/cpcPdfTeamConversation.html',
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
  function Controller($log, $translate, $scope,$stateParams,dataservice,employeeDetails,$state,objectStore,dateTimeService,$window,localStorageService) {
    var vm = this;
    
    vm.status = ['DRAFT','OPEN','CLOSE'];
    vm.type = ['Conversation','Talent Sync Up'];
    vm.context = 'TEAM';
    vm.sort = {"sort":{"topicTitle":"ASC"},"filter":{}};
    
    if($stateParams.username){
    	vm.selectedTeamMember = 'Individual Team Member';
    	vm.drilledDown = 'Y';
    }
    else{
    	vm.selectedTeamMember = $stateParams.username;
    	vm.drilledDown = 'N';
    }
    vm.showContent = false;
 //   vm.response = false;
    
    vm.currentFy = localStorageService.get("currentFyQuarter").data.fy;
    vm.currentQuarter = localStorageService.get("currentFyQuarter").data.quarter;
    
    vm.isYouEnabled = true;

    //if(typeof $stateParams.username === 'undefined'){
	  var userObj = localStorageService.get("loggedInUser");
	  
	  if($stateParams.username){
		  vm.empObj = $stateParams;
	  }
	  else{
		  vm.empObj =userObj;
	  }
	  employeeDetails.getUserFullName(vm.empObj.username).then(function(fullName){
	        vm.convAboutByFullName = fullName;
	        //console.log("****** vm.currentConversation.targetFullName ***** "+vm.currentConversation.targetFullName);
	      });
	  vm.myManager = '';
	    employeeDetails.findMyManager(vm.empObj.username).then(function(fullName) {
	      vm.myManager = fullName;
	  });
	  
	  console.log("CASE 1 *********")
	  console.log(userObj);
	  vm.isPeopleManager = employeeDetails.isPeopleManager(vm.empObj);
	  vm.isAltMgr = employeeDetails.isAltMgr(vm.empObj);
	  if(vm.isPeopleManager){
		  vm.loaderTeam = true;
		  dataservice.getTeamMembers().then(function(data)
	      {
	          vm.teamHierarchy = data;
			  vm.loaderTeam = false;
		  });
	  }
	  if(vm.isAltMgr){
		  vm.loaderTeam = true;
		  dataservice.getAlternateTeam().then(function(data)
	      {
	          vm.altTeamHierarchy = data;
			  vm.loaderTeam = false;
		  });
	  }


    dataservice.getAllFiscalYear().then(function(response){
      	if(response.status == 200){
      		if(typeof response.data !== 'undefined'){
      			var fyQuarters = response.data;
      			console.log("checking new logic of fy and quarter");
      			console.log(fyQuarters);
      			vm.quarters = new Array();
      			for(var fy in fyQuarters){
      				var fiscalYear = fy;
      				var outFy = {"year":fiscalYear,"quarter":"","display":fiscalYear,"id":fiscalYear};
      		//		vm.quarters.push(outFy);
      				var quartersInFy = fyQuarters[fiscalYear];
      				console.log(quartersInFy);
//      				for(var q in quartersInFy){
      				for (var q = 0; q < quartersInFy.length; q++) {
      					var outQ = {"year":fiscalYear,"quarter":quartersInFy[q],"display":fiscalYear +" "+quartersInFy[q],"id":fiscalYear +":"+quartersInFy[q]};
      					vm.quarters.push(outQ);
      				}
      			}
      			vm.quarter = vm.currentFy +":"+ vm.currentQuarter;
      		}
      	}
      });
    
  	vm.selectedTeamMember = 'Individual Team Member';
  	vm.selectedTeamMemberCecId = '';

	vm.changeTeamMember = function(teamMember) {
	  vm.empObj = teamMember;
	  vm.selectedTeamMemberCecId = teamMember.username;
	  vm.selectedTeamMember = teamMember.firstName + ' '+ teamMember.lastName;
	  vm.convAboutByFullName = vm.selectedTeamMember;
	  employeeDetails.findMyManager(teamMember).then(function(fullName) {
	      vm.myManager = fullName;
	  });
	  console.log("team member selected is "+vm.selectedTeamMember);
	  vm.isYouEnabled = false;
	};
	
	vm.changeStatus = function() {
		vm.sort.filter.convStatus = vm.statusFilterValue;
		console.log("vm.sort.filter.convStatus"+vm.sort.filter.convStatus);
		};
	vm.changeType = function() {
		if(vm.typeFilterValue == 'Conversation')
		{
			vm.sort.filter.type='CONVERSATION';
		}
		else
		{
			vm.sort.filter.type='TalentSyncUp';
		}
	};
		
		
	
	vm.configureRadioBtn = function($event){
		if($event.target.id === 'radio02'){
			vm.empObj =localStorageService.get("loggedInUser");
			vm.selectedTeamMember = 'Individual Team Member';
			vm.isYouEnabled = true;
			vm.context = 'SELF';
		} else if($event.target.id === 'radio01'){
			vm.context = 'TEAM';
			vm.isYouEnabled = false;
		}
	};
	
	vm.getConversationData = function(){
		activate();

	};
  	vm.isTeamMemberSelectEnabled = true;
    
    function activate() {
        console.log('activate');
        vm.response = false;

        vm.fy_currentYear = "FY" + new Date().getFullYear(); //Current FY
        vm.c_yr = null;
        vm.c_q = null;

        try {
          var temp = vm.quarter.split(":");
          vm.c_yr = temp[0];
          vm.c_q = temp[1];
        }
        catch (e) {
        }
        
        if(vm.c_yr == null){
      	  vm.c_yr = vm.currentFy;
        }
        if(vm.c_q == null){
      	  vm.c_q = vm.currentQuarter;
        }
        
        var conversationabout = localStorageService.get("loggedInUser").username;
        var loginuser = localStorageService.get("loggedInUser").username;
        
        conversationabout = loginuser;
        if($stateParams.username){
        	conversationabout = $stateParams.username;
        }
        
        if(vm.isPeopleManager || vm.isAltMgr)
        {
        	if(vm.isYouEnabled)
        	{
        		/*you selected*/
        	}
        	else
        	{
        		/* select from the drop down */
                conversationabout = vm.selectedTeamMemberCecId;
        	}
        }
        else
        {
        	/*you selected*/
        }

        vm.recordsPerPage = 99;
        vm.currentPage = 1;

        vm.loading = true;
        	dataservice.getConversation("SELF", vm.currentPage, vm.recordsPerPage, vm.c_yr, vm.c_q, conversationabout, loginuser, vm.sort).then(function (response) {
                if(Number(parseInt(response.headers()["x-total-count"])) == response.headers()["x-total-count"] && vm.totalRecord == null) {
                  vm.totalRecord = parseInt(response.headers()["x-total-count"]);
                }
                vm.loading = false;
                if(vm.recordsPerPage >= vm.totalRecord){
              	  vm.showLoadMore = false;
                }
                else{
              	  vm.showLoadMore = true;
                }
                
                if (response.status === 200 || response.status === 201) {
                  ////alert(JSON.stringify(response));
                  if (typeof response.data !== 'undefined') {
                    vm.response = response.data[0].serverdata;
                    if(vm.response.length>0){
                    	vm.showContent = true;
                    }
                    var metaData = response.data[0].metadata;
                    vm.status = metaData.statusFilter;
                    vm.tags =  metaData.tagFilter;

                  }
                }
                else {
                  vm.response = false;
                  vm.showContent = false;
                  vm.status = null,vm.tags = null;
                  if(typeof vm.sort.filter !== 'undefined') {
                    vm.sort.filter = {};
                  }
                }
        });

      }
    
    vm.changedQuarterValue = function () {
        console.log(vm.quarter);
      };
    
    vm.setQarterValue = function(quarter) {
        vm.quarter = quarter;
      };
  
    
    /*
    
    
    vm.currentConversation = objectStore.conversation.sharedConversation.get();
   // console.log (">>>>>>>>>>>>>>>>>>>>>>>>>>>> jaga "+JSON.stringify(vm.currentConversation.conversation));
    vm.myManager = '';
    employeeDetails.findMyManager( vm.currentConversation.conversationAbout).then(function(fullName) {
      vm.myManager = fullName;
    });

    vm.getUserFullName = function(index){
      var username = vm.currentConversation.conversation[index].createdBy;
      console.log("username for created by "+username);
      employeeDetails.getUserFullName(username).then(function(fullName){
        vm.currentConversation.conversation[index].createdByFullName = fullName;
        console.log("****** vm.currentConversation.createdByFullName ***** "+index+" : "+vm.currentConversation.conversation[index].createdByFullName);
      });
    }

    if(typeof objectStore.conversation.sharedConversation.get() !== 'undefined'){
      vm.currentConversation = objectStore.conversation.sharedConversation.get();
      console.log(vm.currentConversation);
      employeeDetails.getUserFullName(vm.currentConversation.targetUsername).then(function(fullName){
        vm.currentConversation.targetFullName = fullName;
        console.log("****** vm.currentConversation.targetFullName ***** "+vm.currentConversation.targetFullName);
      });

      for(var i=0; i<vm.currentConversation.conversation.length;i++)
      {
        vm.getUserFullName(i);
      }

      employeeDetails.getUserFullName(vm.currentConversation.conversationAbout).then(function(fullName){
        vm.currentConversation.convAboutFullName = fullName;
        console.log("****** vm.currentConversation.convAboutFullName ***** "+vm.currentConversation.convAboutFullName);
      });


      //    vm.attachmentsAvailable =[];
      for(var i=0; i<vm.currentConversation.conversation.length;i++){
        var attachmentObject = vm.currentConversation.conversation[i].attachmentId;
        vm.currentConversation.conversation[i].attachmentsAvailable = false;
        for (var k in attachmentObject){
          if (attachmentObject.hasOwnProperty(k)) {
            console.log("Key is " + k + ", value is" + attachmentObject[k]);
            vm.currentConversation.conversation[i].attachmentsAvailable = true;
          }
        }

      }

    }


*/
    
    vm.translateDateAndTime = function(dateString)
    {
       var generatedDateString = dateTimeService.getCurrentDate(dateString);
       return generatedDateString;
    };
    vm.printWindow = function() {
      angular.element(".hide-not-screen").hide();
      window.print();
      angular.element(".hide-not-screen").show();
    }

    vm.exportPDF = function(notification) {
      angular.element(".hide-not-screen").hide();
     // angular.element("header").hide();
      var d = document.getElementById("exprotPDF");

      var pdf = new jsPDF('0', 'pt', 'a4');
      var options = {
        pagesplit: true
      };

      pdf.addHTML($('body'), 0, 0, options, function(){
        pdf.save(vm.currentConversation.conversationAbout+".pdf");
        angular.element(".hide-not-screen").show();
       // angular.element("#sideNavbar").show();
        //angular.element("header").show();
      });

/*
      $window.html2canvas(d, {

        onrendered: function (canvas) {
          alert("1");
          document.getElementById("exprotPDFCanvas").appendChild(canvas);
          var myImage = canvas.toDataURL("image/png");
         // window.open(myImage);

            var pdf = new jsPDF('p', 'pt', 'letter');
            pdf.addHTML($('#exprotPDFCanvas')[0], function () {
            pdf.save('Test.pdf');
          });

          var doc = new jsPDF('p', 'mm');
          doc.addImage(myImage, 'PNG', 1, 1);
          doc.save('sample-file.pdf');
        }
      });*/
    }
      /*  dataservice.getUserNotification().then(function(data)
        {
          $scope.loaderPopup = true;
          //     console.log("Test Header>>>>>>>"+JSON.stringify(data));
          if(data.status === 200 || data.status === 201) {
            vm.notifications =data.data;
            //alert( JSON.stringify( vm.notifications) );
            $scope.loaderPopup = false;
          }
        });
        */

  }
})();





