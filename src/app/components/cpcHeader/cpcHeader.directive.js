(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcHeader', cpcHeader);

  /* @ngInject */
  function cpcHeader() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcHeader/cpcHeader.html',
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

  function Controller($log, $translate, $scope,dataservice,employeeDetails,$state) {
    $scope.selectedLanguage = 'English';
    $scope.selectedFlag     = 'gb';
    var vm = this;

    $scope.getLocation = function(){
      return $q(function(resolve){
        resolve($location.path());
      });
    }

    $scope.gotoHome = function(){
      vm.getLocation().then(function(location){
        if(typeof objectStore.home.currentSelectedTeamMember.get() !== 'undefined' && location.indexOf("teammember")>=0)
        {
          $state.go('teammemberhome');
        }
        else{
          $state.go('home');
        }
      });
    }

    vm.viewNotification = function() {

      vm.onNotification()
      $state.go('notifications.all');
    }
    vm.goToDeleteNotification = function(notification){

      dataservice.deleteNotification(notification).then(function(data)
      {
        $scope.loaderPopup = true;
        //     console.log("Test Header>>>>>>>"+JSON.stringify(data));
        if(data.status === 200 || data.status === 201) {
          vm.notifications =data.data;
          //alert( JSON.stringify( vm.notifications) );
          $scope.loaderPopup = false;
        }
      });
    }

    dataservice.getUserNotification().then(function(data)
    {
      $scope.loaderPopup = true;
      //     console.log("Test Header>>>>>>>"+JSON.stringify(data));
      if(data.status === 200 || data.status === 201) {
        vm.notifications =data.data;
        //alert( JSON.stringify( vm.notifications) );
        $scope.loaderPopup = false;
      }
    });
    /*$scope.notifications = [{
     'image':'/client/assets/images/Ana.png',
     'name':'Ana Blue Green',
     'desc':'gave a feedback.',
     'time':'1m',
     },
     {
     'image':'/client/assets/images/Ana.png',
     'name':'Ana Blue Green',
     'desc':'gave a feedback.',
     'time':'1m',
     },
     {
     'image':'/client/assets/images/Ana.png',
     'name':'Ana Blue Green',
     'desc':'gave a feedback.',
     'time':'1m',
     },
     {
     'image':'/client/assets/images/Ana.png',
     'name':'Ana Blue Green',
     'desc':'gave a feedback.',
     'time':'1m',
     },
     {
     'image':'/client/assets/images/Ana.png',
     'name':'Ana Blue Green',
     'desc':'gave a feedback.',
     'time':'1m',
     },
     {
     'image':'/client/assets/images/Ana.png',
     'name':'Ana Blue Green',
     'desc':'gave a feedback.',
     'time':'1m',
     },
     {
     'image':'/client/assets/images/Ana.png',
     'name':'Ana Blue Green',
     'desc':'gave a feedback.',
     'time':'1m',
     },
     {
     'image':'/client/assets/images/Ana.png',
     'name':'Ana Blue Green',
     'desc':'gave a feedback.',
     'time':'1m',
     }]*/

    vm.items = [
      {value: 'English', id: 'gb'},
      {value: 'French', id: 'fr'}
    ];

    vm.toggleDropdown = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      vm.status.isopen = !vm.status.isopen;
    };

    vm.changeLanguage = function(id) {
      $translate.use(id);

      if(id == 'fr')
      {
        $scope.selectedLanguage = 'French';
        $scope.selectedFlag = 'fr';
      } else if(id == 'gb')
      {
        $scope.selectedLanguage = 'English';
        $scope.selectedFlag = 'gb';
      }

    };


    vm.mobileMenu = function(){

      if($('#sideNavbar').css('display') == 'none')

      {

        $('#sideNavbar').css('width', '220px');

        $('#sideNavbar').removeClass('hidden-xs').removeClass('hidden-sm');

      }
      else if($('#sideNavbar').css('display') == 'block')
      {

        $('#sideNavbar').css('width', '30px');

        $('#sideNavbar').addClass('hidden-xs').addClass('hidden-sm');

      }
    }


    vm.onNotification = function(){

      $("#notificationContainer").fadeToggle(300);

    }



    /* $(document).click(function()
     {
     $("#notificationContainer").hide();
     });*/
  }
})();


/*$(document).ready(function()
 {
 $("#notificationLink").on('click', function(e)
 {

 $("#notificationContainer").fadeToggle(300);

 return false;
 });

 //Document Click hiding the popup
 $(document).click(function()
 {
 $("#notificationContainer").hide();
 });

 //Popup on click
 $("#notificationContainer").click(function()
 {
 return false;
 });

 });*/


$(window).resize(function(e) {

  if($(window).innerWidth() <= 767)
  {

// XS



  } else if($(window).innerWidth() >= 768 && $(window).innerWidth() <= 991)

  {

// SM



  } else if($(window).innerWidth() >= 992 && $(window).innerWidth() <= 1199)

  {

// MD





  } else if($(window).innerWidth() >= 1200)

  {

// LG



  }

});




$(window).load(function(e) {

  if($(window).innerWidth() <= 767)

  {

// XS



  } else if($(window).innerWidth() >= 768 && $(window).innerWidth() <= 991)

  {

// SM



  } else if($(window).innerWidth() >= 992 && $(window).innerWidth() <= 1199)

  {

// MD



  } else if($(window).innerWidth() >= 1200)

  {

// LG



  }

});

