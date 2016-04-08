(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcPdfConversation', cpcPdfConversation);

  /* @ngInject */

  function cpcPdfConversation() {
    // Usage:
    //
    // Creates:
    //

    var directive = {
      templateUrl: '/client/app/components/cpcPdfConversation/cpcPdfConversation.html',
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





