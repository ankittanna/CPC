(function() {
  'use strict';

  angular
    .module('cpccore')
    .factory('dateTimeService', dateTimeService);

  dateTimeService.$inject = ['$http','localStorageService','$q','objectStore'];

  function dateTimeService($http,localStorageService,$q,objectStore) {
    return {
      getCurrentDateTime: getCurrentDateTime,
      getCurrentRawDate : getCurrentRawDate,
      getCurrentRawTime : getCurrentRawTime,
      getCurrentDate : getCurrentDate,
      getCurrentTime : getCurrentTime,
      getCurrentYear: getCurrentYear,
      getCurrentQtr: getCurrentQtr
    };

    function getCurrentDateTime()
    {
      var dateTime = new Date();
      return dateTime;
    }

    function getCurrentRawDate()
    {
      var dateTime = new Date();
      var date = dateTime.getDate();

      return date;
    }

    function getCurrentRawTime()
    {
      var dateTime = new Date();
      var hours = dateTime.getHours();
      var minutes = dateTime.getMinutes();

      return (hours + ':' + minutes);
    }

    function getCurrentDate(dateTimeString)
    {
      var monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      var generatedDateString = '';
      var dateTime;
      if(dateTimeString === null || dateTimeString === '' || dateTimeString === undefined)
      {
        dateTime = new Date();
        generatedDateString = dateTime.getDate() + ' ' + monthArray[dateTime.getMonth()] + ', ' + dateTime.getFullYear();
      } else
      {
        dateTime = new Date(dateTimeString);
        generatedDateString = dateTime.getDate() + ' ' + monthArray[dateTime.getMonth()] + ', ' + dateTime.getFullYear();
      }
      
      return generatedDateString;
    }

    function getCurrentTime(dateTimeString)
    {
      var dateTime;
      var hours;
      var minutes;
      if(dateTimeString === null || dateTimeString === '' || dateTimeString === undefined)
      {
        dateTime = new Date();
        hours = dateTime.getHours();
        minutes = dateTime.getMinutes();
      } else
      {
        dateTime = new Date(dateTimeString);
        hours = dateTime.getHours();
        minutes = dateTime.getMinutes();
      }

      if(hours < 10)
      {
        hours = '0'+hours;
      }

      if(minutes < 10)
      {
        minutes = '0'+minutes;
      }

      return (hours + ':' + minutes);
    }

    function getCurrentYear(dateObj)
    {
      var date = new Date(dateObj);
      var currentYear = date.getFullYear();

      return 'FY'+currentYear;
    }

    function getCurrentQtr(dateObj)
    {
       var date = new Date(dateObj);
       var currentMonth = date.getMonth()+1;
       var qtr = '';
       if(currentMonth <= 3)
       {
        qtr = 'Q1';
       } else if(currentMonth <= 6 && currentMonth > 3)
       {
          qtr = 'Q2';
       } if(currentMonth <= 9 && currentMonth > 6)
       {
        qtr = 'Q3';
       } if(currentMonth <=12 && currentMonth > 9)
       {
        qtr = 'Q4';
       }

       return qtr;
    }

  }
})();