(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcPdfFeedback', cpcPdfFeedback);

  /* @ngInject */

  function cpcPdfFeedback() {
    // Usage:
    //
    // Creates:
    //

    var directive = {
      templateUrl: '/client/app/components/cpcPdfFeedback/cpcPdfFeedback.html',
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
  function Controller($log, $translate, $scope,dataservice,employeeDetails,$state,objectStore,dateTimeService,$window) {
    var vm = this;


    vm.feedbackData=objectStore.feedback.currentFeedbackObject.get();
    // Full name of the requester
    vm.feedbackAboutByFullName = '';
    employeeDetails.getUserFullName( vm.feedbackData.feedbackAbout).then(function(fullName) {
      vm.feedbackAboutByFullName = fullName;
    });
    vm.myManager = '';
    employeeDetails.findMyManager( vm.feedbackData.feedbackAbout).then(function(fullName) {
      vm.myManager = fullName;
    });
    vm.feedbackRequesterFullName = '';
    employeeDetails.getUserFullName( vm.feedbackData.requester).then(function(fullName) {
      vm.feedbackRequesterFullName = fullName;
    });
    vm.feedbackProviderFullName = '';
    employeeDetails.getUserFullName( vm.feedbackData.provider).then(function(fullName) {
      vm.feedbackProviderFullName = fullName;
    });

    vm.isRequestFeedback = true;
    if (vm.feedbackData.type ==="Request")
      vm.isRequestFeedback = false;
    vm.isRespond = true;
    if (vm.feedbackData.feedbackResponse != "")
      vm.isRespond = false;

    if(vm.feedbackData.requested_on !== '')
    {
      // Requested On - Formatted Date
      vm.feedbackRequestedOnDate = dateTimeService.getCurrentDate(vm.feedbackData.requested_on);


    }

    if(vm.feedbackData.response_on !== '')
    {
      // Received On - Formatted Date
      vm.feedbackReceivedOnDate = dateTimeService.getCurrentDate(vm.feedbackData.response_on);

    }
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
        pdf.save(vm.feedbackData.feedbackAbout+".pdf");
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





