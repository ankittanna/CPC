(function() {
    'use strict';

    angular
        .module('cpccore')
        .factory('employeeDetails', employeeDetails);

    employeeDetails.$inject = ['$window','localStorageService','dataservice','$q'];

    function employeeDetails($window,localStorageService,dataservice,$q) {
        return {
            isAltMgr : isAltMgr,
            isPeopleManager : isPeopleManager,
            setAlternateManagerList : setAlternateManagerList,
            getAlternateManagerList : getAlternateManagerList,
            setCurrentSelectedTeamMember : setCurrentSelectedTeamMember,
            getCurrentSelectedTeamMember: getCurrentSelectedTeamMember,
            getUserFullName: getUserFullName,
            setCurrentFiscalYear : setCurrentFiscalYear,
            setCurrentQuarter : setCurrentQuarter,
            getCurrentFiscalYear : getCurrentFiscalYear,
            getCurrentQuarter : getCurrentQuarter,
            findMyManager:findMyManager
        };

        this.currentTeamMember = null;

        function getUserFullName(username)
        {
          var deferred = $q.defer();
          dataservice.getUserProfile(username).then(function(response){
            var fullName = [];
            fullName.push(response.data.firstName);
            fullName.push(response.data.lastName);
            deferred.resolve(fullName.join(' '));
          });
          return deferred.promise;
        }
      function findMyManager(username)
      {
        var deferred = $q.defer();
        dataservice.findMyManager(username).then(function(response){
          var fullName = [];
          fullName.push(response.data.firstName);
          fullName.push(response.data.lastName);
          deferred.resolve(fullName.join(' '));
        });
        return deferred.promise;
      }

        function setCurrentSelectedTeamMember(currentTeamMember)
        {
          localStorageService.set('currentTeamMember', currentTeamMember);
        }

        function getCurrentSelectedTeamMember()
        {
          return localStorageService.get('currentTeamMember');
        }

        function isAltMgr(userObj)
        {
            if(userObj!= null && typeof userObj !== 'undefined')
            {
                return userObj.isAlternateMgr === true?true:false;
            }
            else{
                return false;
            }
        }

        function isPeopleManager(userObj)
        {
            if(userObj!= null && typeof userObj !== 'undefined')
            {

              if(userObj.isPeopleManager != null){
                return userObj.isPeopleManager.toLowerCase() === 'y'?true:false;
              }

            }
            else{
                return false;
            }
        }

        function setAlternateManagerList(alternateManagerList)
        {
          this.alternateManagerList = alternateManagerList;
        }

        function getAlternateManagerList()
        {
          return this.alternateManagerList;
        }

        function setCurrentFiscalYear(currentFiscalYear)
        {
          this.currentFiscalYear = currentFiscalYear;
        }

        function getCurrentFiscalYear()
        {
          return this.currentFiscalYear;
        }

        function setCurrentQuarter(currentQuarter)
        {
          this.currentQuarter = currentQuarter;
        }

        function getCurrentQuarter()
        {
          return this.currentQuarter;
        }
    }
})();
