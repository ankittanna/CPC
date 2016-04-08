(function() {
  'use strict';

  angular
    .module('cpccore')
    .factory('dataservice', dataservice);

  dataservice.$inject = ['$http','localStorageService','$q','objectStore', 'growl'];

  function dataservice($http,localStorageService,$q,objectStore, growl) {
    return {
      getTeamMembers : getTeamMembers,
      getAlternateTeam : getAlternateTeam,
      getUserProfile : getUserProfile,
      getAlternateManagerList : getAlternateManagerList,
      findMyManager : findMyManager,
      getConversationTeamMgr : getConversationTeamMgr,
      createConversation : createConversation,
      getCurrentQuartersInFiscalYear: getCurrentQuartersInFiscalYear,
      getCurrentQuarter: getCurrentQuarter,
      getCurrentFyQuarter : getCurrentFyQuarter,
      getAllFiscalYear : getAllFiscalYear,
      getCurrentConversation:getCurrentConversation,
      getConversation:getCurrentConversation,
      getConversationTeam:getConversationTeam,
      updateConversation : updateConversation,
      getTitleAutoCompleteConversation : getTitleAutoCompleteConversation,
      deleteAttachment : deleteAttachment,
      deleteConversation : deleteConversation,
      getPreviousQuarter: getPreviousQuarter,
      getTimeline: getTimeline,
      getProvideFeedbackTeam: getProvideFeedbackTeam,
      getProvideFeedbackSelf : getProvideFeedbackSelf,
      getRequestFeedbackSelf : getRequestFeedbackSelf,
      getSearchedUsers: getSearchedUsers,
      requestNewFeedback: requestNewFeedback,
      requestNewFeedbackMultiple: requestNewFeedbackMultiple,
      requestNewFeedbackMultipleTeam: requestNewFeedbackMultipleTeam,
      sendFeedbackReminder: sendFeedbackReminder,
      deleteFeedback: deleteFeedback,
      declineFeedback: declineFeedback,
      getTeamFeedbackMatrics: getTeamFeedbackMatrics,
      getContextUserTeamMembers: getContextUserTeamMembers,
      getUserNotification:getUserNotification,
      getProfileDetails: getProfileDetails,
      assignAlternateTeam: assignAlternateTeam,
      getMyAllAlternateMgrList: getMyAllAlternateMgrList,
      getTeamAlternateMgrList: getTeamAlternateMgrList,
      updateAlternateTeam: updateAlternateTeam,
      deallocateAlternateTeam: deallocateAlternateTeam,
      getQuickLinks: getQuickLinks,
      updateFeedback: updateFeedback,
      deleteNotification : deleteNotification
    };

    function getQuickLinks(){
      return $http({
        method: 'GET',
        url: syncapp.context + '/api/quicklinkss?page=1&per_page=20'
      })
        .then(success)
        .catch(failure);

      function success(response) {
        return response;
      }

      function failure(error) {
        console.log('XHR Failed for deallocateAlternateTeam' + error.data);
        return error;
      }
    }

    function deallocateAlternateTeam(id){
      return $http({
        method: 'POST',
        url: syncapp.context + '/api/team/deallocateAlternateTeam?ID=' + id
      })
        .then(success);

      function success(response) {
        return response;
      }
    }

    function updateAlternateTeam(id,loginuser, startDate, endDate){
      return $http({
        method: 'POST',
        url: syncapp.context + '/api/team/updateAlternateTeam?ID=' + id + '&loginUsr=' + loginuser + '&newstartdt=' + startDate+ '&newenddt=' + endDate
      })
        .then(success);

      function success(response) {
        return response;
      }
    }

    function getTeamAlternateMgrList(page, perPage, username, loginuser, bodyData){
      console.log('bodyData', bodyData);
      return $http({
        method: 'POST',
        url: syncapp.context + '/api/team/getTeamAlternateMgrList?page=' + page + '&per_page=' + perPage + '&managername=' + username + '&loginuser=' + loginuser,
        data: bodyData.sort
      })
        .then(success)
        .catch(failure);

      function success(response) {
        return response;
      }

      function failure(error) {
        console.log('XHR Failed for getTeamAlternateMgrList' + error.data);
        return error;
      }
    }

    function getMyAllAlternateMgrList(page, perPage, username, loginuser, bodyData){
      console.log('bodyData', bodyData);
      return $http({
        method: 'POST',
        url: syncapp.context + '/api/team/getMyAllAlternateMgrList?page=' + page + '&per_page=' + perPage + '&username=' + username + '&loginuser=' + loginuser,
        data: bodyData.sort
      })
        .then(success)
        .catch(failure);

      function success(response) {
        return response;
      }

      function failure(error) {
        console.log('XHR Failed for getMyAllAlternateMgrList' + error.data);
        return error;
      }
    }

    function assignAlternateTeam(loginuser, startDate, endDate, bodyData){
      console.log('bodyData', bodyData);
      return $http({
        method: 'POST',
        url: syncapp.context + '/api/team/assignAlternateTeam?alternatemanager=' + loginuser + '&startdt=' + startDate+ '&enddt=' + endDate,
        data: bodyData
      })
        .then(success);

      function success(response) {
        return response;
      }
    }
    function deleteNotification(notification)
    {

      return $http({
        method: 'GET',
        url: syncapp.context + '/api/users/deleteNotification?username=' + userProfile.username+ '&id='+notification.id
      })
        .then(success)
        .catch(failure);

      function success(response) {
        return response;
      }

      function failure(error) {
        console.log('XHR Failed for getUserNotification' + error.data);
        return error;
      }


    }
    function getUserNotification()
    {

      return $http({
        method: 'GET',
        url: syncapp.context + '/api/users/findNotification?username=' + userProfile.username
      })
        .then(success)
        .catch(failure);

      function success(response) {
        return response;
      }

      function failure(error) {
        console.log('XHR Failed for getUserNotification' + error.data);
        return error;
      }


    }

    function getTeamFeedbackMatrics(page,perPage,loginuser,fiscalYear,quarter,context,sortCriteria)
    {
      var body = {'title':sortCriteria};
      console.log('sortCriteria', sortCriteria);
      {
        return $http({
          method: 'POST',
          url: syncapp.context + '/api/feedback/getTeamFeedbackMatrics?page=' + page + '&per_page=' + perPage + '&managerUsername=' + loginuser + '&fy=' + fiscalYear + '&quarter=' + quarter + '&context=' + context,
          data: sortCriteria,
          cache: true
        })
          .then(success)
          .catch(failure);
      }

      function success(response) {
        return response;
      }

      function failure(error) {
        console.log('XHR Failed for getTeamFeedbackMatrics' + error.data);
        return error;
      }
    }

    function getProvideFeedbackTeam(page,perPage,loginuser,fiscalYear,quarter,context,sortCriteria)
    {
      console.log('sortCriteria', sortCriteria);
      var body = {'title':sortCriteria};
      {
        return $http({
          method: 'POST',
          url: syncapp.context + '/api/feedback/getTeamProvideFeedbackMatrics?page=' + page + '&per_page=' + perPage + '&managerUsername=' + loginuser + '&fy=' + fiscalYear + '&quarter=' + quarter + '&context=' + context,
          data: sortCriteria,
          cache: true
        })
          .then(success)
          .catch(failure);
      }

      function success(response) {
        return response;
      }

      function failure(error) {
        console.log('XHR Failed for getProvideFeedbackTeam' + error.data);
        return error;
      }
    }

    function getRequestFeedbackSelf(page,perPage,loginuser,fiscalYear,quarter,context,sortCriteria){
      var body = {'title':sortCriteria};
      {
        return $http({
          method: 'POST',
          url: syncapp.context + '/api/feedback/getRequestFeedbackWithSort?page=' + page + '&per_page=' + perPage + '&username=' + loginuser + '&fy=' + fiscalYear + '&quarter='+quarter+'&context=' + context,
          data: sortCriteria,
          cache: true
        })
          .then(success)
          .catch(failure);
      }

      function success(response) {
        return response;
      }

      function failure(error) {
        console.log('XHR Failed for getRequestFeedbackSelf' + error.data);
        return error;
      }
    }

    function getProvideFeedbackSelf(page,perPage,loginuser,fiscalYear,quarter,context,sortCriteria){
      var body = {'title':sortCriteria};
      //var body = {};
      var url = syncapp.context + '/api/feedback/getRequestFeedbackWithSort?page=' + page + '&per_page=' + perPage + '&username=' + loginuser + '&fy=' + fiscalYear + '&quarter='+quarter+'&context=' + context;
      console.log('PROVIDE FEEDBACK URL ' + url);
      {
        return $http({
          method: 'POST',
          url: syncapp.context + '/api/feedback/getProvidedFeedbackWithSort?page=' + page + '&per_page=' + perPage + '&username=' + loginuser + '&fy=' + fiscalYear + '&quarter='+quarter+'&context=' + context,
          data: sortCriteria,
          cache: true
        })
          .then(success)
          .catch(failure);
      }

      function success(response) {
        return response;
      }

      function failure(error) {
        console.log('XHR Failed for getProvideFeedbackSelf' + error.data);
        return error;
      }
    }

    function getTimeline(page,perPage,loginuser,fiscalYear,quarter, context, tags){
      console.log('called',page,perPage,loginuser,fiscalYear,quarter, context, tags);
      var body = tags;
      {
        return $http({
          method: 'POST',
          url: syncapp.context + '/api/apptrack/getTimeLine?page=' + page + '&per_page=' + perPage + '&username=' + userProfile.username + '&fy=' + fiscalYear + '&quarter=' + quarter + '&context=' + context,
          data: body,
          cache: true
        })
          .then(success)
          .catch(failure);
      }

      function success(response) {
        console.log('response', response);
        return response;
      }

      function failure(error) {
        console.log('XHR Failed for getTimeline' + error.data);
        return error;
      }
    }

    function getTeamMembers() {
      return $http({
        method: 'GET',
        url: syncapp.context + '/api/team/directTeam?username=' + userProfile.username
      })
        .then(getTeamMembersComplete)
        .catch(getTeamMembersFailed);

      function getTeamMembersComplete(response) {
        return response.data.TeamDetails;
      }

      function getTeamMembersFailed(error) {
        console.log('XHR Failed for getTeamMembers' + error.data);
      }
    }

    function getContextUserTeamMembers(username)
    {
      return $http({
        method: 'GET',
        url: syncapp.context + '/api/team/directTeam?username=' + username
      })
        .then(getContextUserTeamMembersComplete)
        .catch(getContextUserTeamMembersFailed);

      function getContextUserTeamMembersComplete(response) {
        return response.data.TeamDetails;
      }

      function getContextUserTeamMembersFailed(error) {
        console.log('XHR Failed for getTeamMembers' + error.data);
      }
    }

    function getAlternateTeam(){
      return $http({method: 'GET', url: syncapp.context+'/api/team/alternateTeam?username='+userProfile.username})
        .then(getAlternateTeamComplete)
        .catch(getAlternateTeamFailed);

      function getAlternateTeamComplete(response) {
        return response.data.AlternateTeamDetails;
      }

      function getAlternateTeamFailed(error) {
        console.log('XHR Failed for getAlternateTeam' + error.data);
      }
    }
    function getUserProfile(username){
      var userDetails = localStorageService.get(username);
      if(userDetails!=null)
      {
        var lobj = {'data':userDetails,'status':200};

        objectStore.contextUser.contextUserProfile.set(userDetails);

        return $q(function(resolve){
          resolve(lobj);
        });
      }
      else {
        return $http({method: 'GET', url: syncapp.context + '/api/users/userProfile?username=' + username})
          .then(getUserProfileComplete)
          .catch(getUserProfileFailed);
      }
      function getUserProfileComplete(response) {
        var data = response.data;

        objectStore.contextUser.contextUserProfile.set(data);

        if(data.username!=null && typeof data.username !== 'undefined') {
          localStorageService.set(data.username,data);
        }
        return response;
      }

      function getUserProfileFailed(error) {
        console.log('XHR Failed for getTeamMemberProfile' + error.data);
        return error;
      }
    }

    function getProfileDetails(username)
    {
      return $http({method: 'GET', url: syncapp.context + '/api/users/userProfile?username=' + username})
        .then(getProfileDetailsComplete)
        .catch(getProfileDetailsFailed);
    }

    function getProfileDetailsComplete(response)
    {
      console.log('Got Person Details ----> '+JSON.stringify(response));
      return response;
    }

    function getProfileDetailsFailed(error)
    {
      console.log('XHR Failed for getTeamMemberProfile' + error.data);
    }

    function findMyManager(username){
      return $http({method: 'GET', url: syncapp.context+'/api/users/findMyManager?username='+username})
        .then(findMyManagerComplete)
        .catch(findMyManagerFailed);

      function findMyManagerComplete(response) {
        return response;
      }

      function findMyManagerFailed(error) {
        console.log('XHR Failed for findMyManager' + error.data);
      }
    }

    function getAlternateManagerList(username){
      console.log('********** calling getAlternateManagerList function ***********');
      return $http({method: 'GET', url: syncapp.context+'/api/team/getMyAlternateMgrList?loginuser='+username})
        .then(getAlternateManagerListComplete)
        .catch(getAlternateManagerListFailed);

      function getAlternateManagerListComplete(response) {
        return response;
      }

      function getAlternateManagerListFailed(error) {
        console.log('XHR Failed for getAlternateManagerList' + error.data);
      }
    }

    function getSearchedUsers(searchString)
    {
      //var searchString = searchString;
      //console.log("search this user -----> " + searchString);
      return $http({
        method: 'GET',
        url: syncapp.context+'/api/users/searchUsers?searchString='+searchString
      })
        .then(getSearchedUsersComplete)
        .catch(getSearchedUsersFailed);

      function getSearchedUsersComplete(response) {
        //console.log(JSON.stringify(response.data));
        return response.data;
      }

      function getSearchedUsersFailed(error) {
        console.log('XHR Failed for getTeamMembers' + error.data);
      }

    }

    function getConversationTeamMgr(page,perPage,conversationabout,loginuser,sortCriteria,context,fiscalYear,quarter){
//      var body = {"title":sortCriteria};

//      if(fiscalYear !== null && quarter !== null && context !== null && typeof fiscalYear !== 'undefined' && typeof quarter !== 'undefined' && typeof context !== 'undefined')
//       {
      return $http({
        method: 'POST',
        url: syncapp.context + '/api/conversation/getConversationAboutUsersFYWithSort?page=' + page + '&per_page=' + perPage + '&conversationabout=' + conversationabout + '&loginuser=' + loginuser + '&fy=' + fiscalYear + '&quarter=' + quarter + '&context=' + context,
        data: sortCriteria
      })
        .then(success)
        .catch(failure);
//       }
//      else
//      {
//        return $http({
//          method: 'POST',
//          url: syncapp.context + '/api/conversation/getConversationTeamMgr?page=' + page + '&per_page=' + perPage + '&conversationabout=' + conversationabout + '&loginuser=' + loginuser,
//          data: body
//        })
//            .then(success)
//            .catch(failure);
//      }

      function success(response) {
        return response;
      }

      function failure(error) {
        console.log('XHR Failed for getConversationAboutUsersFYSort' + error.data);
        return error;
      }
    }

    function deleteAttachment(attachemntId,conversationId,convSequenceId){
      return $http({method: 'GET', url: syncapp.context+'/api/conversation/deleteAttachment?attachId='+attachemntId+'&convSeqId='+convSequenceId+'&conversationId='+conversationId})
        .then(success)
        .catch(failure);
      function success(response) {
        return response;
      }
      function failure(response) {
        console.log('XHR Failed for deleteAttachment' + response.data);
        return response;
      }
    }

    function deleteConversation(conversationId){
      return $http({method: 'PUT', url: syncapp.context+'/api/conversation/deleteConversation?id='+conversationId})
        .then(success)
        .catch(failure);
      function success(response) {
        return response;
      }
      function failure(response) {
        console.log('XHR Failed for deleteConversation' + response.data);
        return response;
      }
    }

    function getCurrentQuartersInFiscalYear(year){
      return $http({method: 'GET', url: syncapp.context+'/api/general/getFiscalYear?year='+year})
        .then(success)
        .catch(failure);
      function success(response) {
        return response;
      }
      function failure(response) {
        console.log('XHR Failed for getConversationAboutUsersFYSort' + response.data);
        return response;
      }
    }

    function getCurrentQuarter(){
      if(localStorageService.get('currentQuarter') !== null && typeof localStorageService.get('currentQuarter') !== 'undefined')
      {
        return $q(function(resolve){
          resolve(localStorageService.get('currentQuarter'));
        });
      }
      return $http({method: 'GET', url: syncapp.context+'/api/general/getCurrentFiscalYear'})
        .then(success)
        .catch(failure);
      function success(response) {
        var lobj = {'data':response.data,'status':response.status};
        localStorageService.set('currentQuarter',lobj);
        return response;
      }
      function failure(response) {
        console.log('XHR Failed for getConversationAboutUsersFYSort' + response.data);
        return response;
      }
    }

    function getCurrentFyQuarter(){
    	if(localStorageService.get('currentFyQuarter') !== null && typeof localStorageService.get('currentFyQuarter') !== 'undefined')
        {
          return $q(function(resolve){
            resolve(localStorageService.get('currentFyQuarter'));
          });
        }
    	return $http({method: 'GET', url: syncapp.context+'/api/general/getCurrentFY'})
        .then(success)
        .catch(failure);
    	function success(response) {
	        var lobj = {'data':response.data,'status':response.status};
	        localStorageService.set('currentFyQuarter',lobj);
	        return response;
	    }
	    function failure(response) {
	        console.log('XHR Failed for getCurrentFyQuarter' + response.data);
	        return response;
	    }
    }

    function getAllFiscalYear(){
    	return $http({method: 'GET', url: syncapp.context+'/api/general/geAllFiscalYear'})
        .then(success)
        .catch(failure);
	      function success(response) {
	        return response;
	      }
	      function failure(response) {
	        console.log('XHR Failed for getAllFiscalYear' + response.data);
	        return response;
	      }
    }

    function getPreviousQuarter(currentQuarter){
      var previousQuarters = {'Q1':'','Q2':'Q1','Q3':'Q2','Q4':'Q3'};
      return previousQuarters[currentQuarter];
    }

    function getCurrentConversation(context,page,perPage,fy,quarter,conversationabout,loginuser,sortObj)
    {
      var sort=sortObj;
      return $http({method: 'POST', url: syncapp.context+'/api/conversation/getConversationAboutUsersFYWithSort?context='+context+'&page='+page+'&per_page='+perPage+'&fy='+fy+'&quarter='+quarter+'&conversationabout='+conversationabout+'&loginuser='+loginuser,data:sort})

        .then(getCurrentConversationComplete)
        .catch(getCurrentConversationCompleteFailed);

      function getCurrentConversationComplete(response) {
        return response;
      }

      function getCurrentConversationCompleteFailed(error) {
        console.log('XHR Failed for getCurrentConversationCompleteFailed' + error.data);
        return error;
      }
    }

    function getTitleAutoCompleteConversation(context,fy,quarter,conversationabout,loginuser,titleCriteria,sortCriteria)
    {
      return $http({method: 'POST', url: syncapp.context+'/api/conversation/getConversationAboutUsersTitleFilter?context='+context+'&fy='+fy+'&quarter='+quarter+'&conversationabout='+conversationabout+'&loginuser='+loginuser+'&titleCriteria='+titleCriteria,data:sortCriteria})

        .then(success)
        .catch(error);

      function success(response) {
        return response;
      }

      function error(err) {
        console.log('XHR Failed for getCurrentConversationCompleteFailed' + err.data);
        return error;
      }
    }

    function getConversationTeam(context,page,perPage,loginuser,fy,quarter){
      return $http({method: 'POST', url: syncapp.context+'/api/conversation/getTeamConversationMatricsByTag?page='+page+'&per_page='+perPage+'&managerUsername='+loginuser+'&fy='+fy+'&quarter='+quarter+'&context='+context})

        .then(getConversationTeamComplete)
        .catch(getConversationTeamFailed);

      function getConversationTeamComplete(response) {
        return response;
      }

      function getConversationTeamFailed(error) {
        console.log('XHR Failed for getConversationTeamFailed' + error.data);
        return error;
      }


    }

    function createConversation(context,conversationObj){
      var body = conversationObj;
      return $http({method: 'POST', url: syncapp.context+'/api/conversation/createConversations?context='+context,data:body})

        .then(createConversationComplete)
        .catch(createConversationFailed);

      function createConversationComplete(response) {
        return response;
      }

      function createConversationFailed(error) {
        console.log('XHR Failed for createConversation' + error.data);
        return error;
      }
    }

    function updateConversation(context,conversationObj)
    {
      var body = conversationObj;
      return $http({method: 'PUT', url: syncapp.context+'/api/conversation/updateConversations?context='+context,data:body})

        .then(createConversationComplete)
        .catch(createConversationFailed);

      function createConversationComplete(response) {
        return response;
      }

      function createConversationFailed(error) {
        console.log('XHR Failed for updateConversation' + error.data);
        return error;
      }
    }

    function updateFeedback(feedbackObj)
    {
      var body = feedbackObj;

      return $http({method: 'PUT', url: syncapp.context+'/api/feedback/responseFeedback', data:body})
      .then(createFeedbackComplete)
      .catch(createFeedbackFailed);

      function createFeedbackComplete(response)
      {
        return response;
      }

      function createFeedbackFailed(error)
      {
        console.log('XHR failed for create feedback '+error.data);
      }
    }

    function requestNewFeedback(feedbackObj, feedbackMode)
    {

      var body = feedbackObj;
      // URL: api/feedback/requestFeedback
      var method = '';
      var url = '';
      if(feedbackMode === 'request' || feedbackMode === 'unrequested' || feedbackMode === 'requestUser' || feedbackMode === 'requestTeam')
      {
        method = 'POST';
        url = '/api/feedback/requestFeedback';
      } else if(feedbackMode === 'provide')
      {
        method = 'PUT';
        url = '/api/feedback/responseFeedback';
      }

      // alert(method + ' ' + feedbackMode + ' ' + url);
      // console.log("THIS OBJ "+JSON.stringify(feedbackObj));
      return $http({method: method, url: syncapp.context+url, data:body})
        .then(requestNewFeedbackComplete)
        .catch(requestNewFeedbackFailed);

      function requestNewFeedbackComplete(response) {
        console.log('$$$$$$$$ WHAT I GET '+JSON.stringify(feedbackObj));
        return response;
      }

      function requestNewFeedbackFailed(error) {
        console.log('XHR Failed for requestNewFeedback' + error.data);
        return error;
      }
    }

    function requestNewFeedbackMultiple(feedbackObj)
    {
      var body = feedbackObj;

      // URL: api/feedback/requestFeedback
      return $http({method: 'POST', url: syncapp.context+'/api/feedback/multipleRequestFeedback', data:body})
        .then(requestNewFeedbackMultipleComplete)
        .catch(requestNewFeedbackMultipleFailed);

      function requestNewFeedbackMultipleComplete(response) {
        return response;
      }

      function requestNewFeedbackMultipleFailed(error) {
        console.log('XHR Failed for requestNewFeedbackMultiple' + error.data);
      }
    }

    function requestNewFeedbackMultipleTeam(feedbackObj, feedbackMode)
    {
      var body = feedbackObj;

      var directTeamFlag = false;

      if(feedbackMode === 'requestTeam')
      {
        directTeamFlag = true;
      } else
      {
        directTeamFlag = false;
      }

      // URL: api/feedback/requestFeedback
      return $http({method: 'POST', url: syncapp.context+'/api/feedback/multipleRequestTeamFeedback?directTeam='+directTeamFlag, data:body})
        .then(requestNewFeedbackMultipleTeamComplete)
        .catch(requestNewFeedbackMultipleTeamFailed);

      function requestNewFeedbackMultipleTeamComplete(response) {

        return response;
      }

      function requestNewFeedbackMultipleTeamFailed(error) {
        console.log('XHR Failed for requestNewFeedbackMultipleTeam' + error.data);
      }
    }

    function sendFeedbackReminder(feedbackId)
    {
      // URL: api/feedback/requestFeedback
      return $http({method: 'POST', url: syncapp.context+'/api/feedback/sendReminder?id='+feedbackId})
        .then(sendFeedbackReminderComplete)
        .catch(sendFeedbackReminderFailed);

      function sendFeedbackReminderComplete(response) {
        return response;
      }

      function sendFeedbackReminderFailed(error) {
        console.log('XHR Failed for sendFeedbackReminder' + error.data);
      }

    }

    function deleteFeedback(feedbackId)
    {
      // URL: /api/feedback/deleteFeedbackWithId/{id}
      return $http({method: 'DELETE', url: syncapp.context+'/api/feedback/deleteFeedbackWithId/'+feedbackId})
        .then(deleteFeedbackComplete)
        .catch(deleteFeedbackFailed);

      function deleteFeedbackComplete(response) {
        return response;
      }

      function deleteFeedbackFailed(error) {
        console.log('XHR Failed for deleteFeedback' + error.data);
      }
    }

    function declineFeedback(feedbackObj)
    {
      // URL: api/feedback/requestFeedback
      var body = feedbackObj;
      // console.log("DECLINED OBJECT ##### "+JSON.stringify(feedbackObj));
      // URL: api/feedback/requestFeedback
      return $http({method: 'PUT', url: syncapp.context+'/api/feedback/responseFeedback', data:body})
        .then(declineFeedbackComplete)
        .catch(declineFeedbackFailed);


      function declineFeedbackComplete(response) {
        // console.log("DECLINED ##### "+JSON.stringify(response));
        return response;
      }

      function declineFeedbackFailed(error) {
        console.log('XHR Failed for sendFeedbackReminder' + error.data);
      }
    }
  }
})();
