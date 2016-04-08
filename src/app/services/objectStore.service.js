(function() {
    'use strict';

    angular
        .module('cpccore')
        .factory('objectStore', objectStore);

    objectStore.$inject = ['$window','localStorageService'];

    function objectStore($window,localStorageService) {

      this.appCommonDataImpl = {
    	fileTypeAttchmentSupported: {
    		get: function(fileType){
    			var filesTypesAllowed = ['jpg','jpeg','png','tiff','tif','gif','bmp','ai','eps','svg','psd','3gp','doc',
                                   'docx','ppt','pptx','rtf','txt','xls','xlsx','pdf','.htm','.html','key','numbers','pages',
                                   'mp3','aiff','m4a','wav','mov','mp4','m4v','avi','3gpp','3gpp2','wmv','mpg','mkv','mpeg',
                                   'vob','flv','mts','m2t','ts','dv'];
    			if($.inArray(fileType, filesTypesAllowed) !== -1){
    				return true;
    			}
    			else{
    				return false;
    			}
    		}
    	}
      };
      this.homeImpl = {
        currentSelectedTeamMember: {
          set: function(username){
            localStorageService.set("home_currentSelectedTeamMember", username);
          },
          get: function(){
            return localStorageService.get("home_currentSelectedTeamMember");
          },
          remove: function () {
            localStorageService.remove("home_currentSelectedTeamMember");
          }
        }
      };
      this.conversationImpl = {
        createConversationSource: {
            set: function (obj) {
                localStorageService.set('createConversationSource', obj);
              },
            get: function () {
                return localStorageService.get('createConversationSource');
              },
            remove: function () {
                localStorageService.remove('createConversationSource');
              }
        },
        currentConversation: {
          set: function (obj) {
            localStorageService.set('conversation_currentConversationObject', obj);
          },
          get: function () {
            return localStorageService.get('conversation_currentConversationObject');
          },
          remove: function () {
            localStorageService.remove('conversation_currentConversationObject');
          }
        },
        sharedConversation: {
          set: function (obj) {
            localStorageService.set('conversation_sharedConversationObject', obj);
          },
          get: function () {
            return localStorageService.get('conversation_sharedConversationObject');
          },
          remove: function () {
            localStorageService.remove('conversation_sharedConversationObject');
          }
        },
        sharedTeamConversation: {
            set: function (obj) {
              localStorageService.set('conversation_sharedTeamConversationObject', obj);
            },
            get: function () {
              return localStorageService.get('conversation_sharedTeamConversationObject');
            },
            remove: function () {
              localStorageService.remove('conversation_sharedTeamConversationObject');
            }
        },
        sharedResponseConversation: {
          set: function (obj) {
            localStorageService.set('conversation_sharedResponseConversationObject', obj);
          },
          get: function () {
            return localStorageService.get('conversation_sharedResponseConversationObject');
          },
          remove: function () {
            localStorageService.remove('conversation_sharedResponseConversationObject');
          }
        },
        draftConversation: {
          set: function (obj) {
            localStorageService.set('conversation_draftConversationObject', obj);
          },
          get: function () {
            return localStorageService.get('conversation_draftConversationObject');
          },
          remove: function () {
            localStorageService.remove('conversation_draftConversationObject');
          }
        },
        draftTeamConversation: {
            set: function (obj) {
              localStorageService.set('conversation_draftTeamConversationObject', obj);
            },
            get: function () {
              return localStorageService.get('conversation_draftTeamConversationObject');
            },
            remove: function () {
              localStorageService.remove('conversation_draftTeamConversationObject');
            }
          },
        currentFeedbackObject: {
            set: function (obj) {
              localStorageService.set('feedback_requestFeedback', obj);
            },
            get: function () {
              return localStorageService.get('feedback_requestFeedback');
            },
            remove: function () {
              localStorageService.remove('feedback_requestFeedback');
            }
          }
      };

      this.feedbackImpl = {
        currentFeedbackObject: {
            set: function (obj) {
              localStorageService.set('feedback_requestFeedbackObject', obj);
            },
            get: function () {
              return localStorageService.get('feedback_requestFeedbackObject');
            },
            remove: function () {
              localStorageService.remove('feedback_requestFeedbackObject');
            }
          },
          draftFeedbackObject: {
          set: function (obj) {
            localStorageService.set('feedback_draftFeedbackObject', obj);
          },
          get: function () {
            return localStorageService.get('feedback_draftFeedbackObject');
          },
          remove: function () {
            localStorageService.remove('feedback_draftFeedbackObject');
          }
        },
        viewAllFeedbackUsername: {
            set: function (username) {
              localStorageService.set('feedback_viewAllUsername', username);
            },
            get: function () {
              return localStorageService.get('feedback_viewAllUsername');
            },
            remove: function () {
              localStorageService.remove('feedback_viewAllUsername');
            }
          },
          provideTableViewAllUsername: {
            set: function (username) {
              localStorageService.set('feedback_provideTableUsername', username);
            },
            get: function () {
              return localStorageService.get('feedback_provideTableUsername');
            },
            remove: function () {
              localStorageService.remove('feedback_provideTableUsername');
            }
          },
          receiveTableViewAllUsername: {
            set: function (username) {
              localStorageService.set('feedback_receiveTableUsername', username);
            },
            get: function () {
              return localStorageService.get('feedback_receiveTableUsername');
            },
            remove: function () {
              localStorageService.remove('feedback_receiveTableUsername');
            }
          },
          viewAllReceivedFeedbackSource: {
            set: function (source) {
              localStorageService.set('feedback_receivedFeedbackSource', source);
            },
            get: function () {
              return localStorageService.get('feedback_receivedFeedbackSource');
            },
            remove: function () {
              localStorageService.remove('feedback_receivedFeedbackSource');
            }
          },
          viewAllFeedbackSource: {
            set: function (source) {
              localStorageService.set('feedback_feedbackSource', source);
            },
            get: function () {
              return localStorageService.get('feedback_feedbackSource');
            },
            remove: function () {
              localStorageService.remove('feedback_feedbackSource');
            }
          },
          provideFeedbackTableFilter: {
            set: function (filter) {
              localStorageService.set('feedback_provideFeedbackTableFilter', filter);
            },
            get: function () {
              return localStorageService.get('feedback_provideFeedbackTableFilter');
            },
            remove: function () {
              localStorageService.remove('feedback_provideFeedbackTableFilter');
            }
          },
          receiveFeedbackTableFilter: {
            set: function (filter) {
              localStorageService.set('feedback_receiveFeedbackTableFilter', filter);
            },
            get: function () {
              return localStorageService.get('feedback_receiveFeedbackTableFilter');
            },
            remove: function () {
              localStorageService.remove('feedback_receiveFeedbackTableFilter');
            }
          },
          feedbackContextUsername: {
            set: function (username) {
              console.log('~~~ CONTEXT USER ~~~ ' + username);
              localStorageService.set('feedback_feedbackContextUsername', username);
            },
            get: function () {
              return localStorageService.get('feedback_feedbackContextUsername');
            },
            remove: function () {
              localStorageService.remove('feedback_feedbackContextUsername');
            }
          },
          directTeamStore: {
            set: function (team) {
              localStorageService.set('feedback_feedbackDirectTeam', team);
            },
            get: function () {
              return localStorageService.get('feedback_feedbackDirectTeam');
            },
            remove: function () {
              localStorageService.remove('feedback_feedbackDirectTeam');
            }
          },
          alternateTeamStore: {
            set: function (team) {
              localStorageService.set('feedback_feedbackAlternateTeam', team);
            },
            get: function () {
              return localStorageService.get('feedback_feedbackAlternateTeam');
            },
            remove: function () {
              localStorageService.remove('feedback_feedbackAlternateTeam');
            }
          },
          feedbackDirectTeamStore: {
            set: function (team) {
              localStorageService.set('feedback_feedbackMyDirectTeam', team);
            },
            get: function () {
              return localStorageService.get('feedback_feedbackMyDirectTeam');
            },
            remove: function () {
              localStorageService.remove('feedback_feedbackMyDirectTeam');
            }
          },
          feedbackAlternateTeamStore: {
            set: function (team) {
              localStorageService.set('feedback_feedbackMyAlternateTeam', team);
            },
            get: function () {
              return localStorageService.get('feedback_feedbackMyAlternateTeam');
            },
            remove: function () {
              localStorageService.remove('feedback_feedbackMyAlternateTeam');
            }
          },
          feedbackPrintSource: {
              set: function (feedbackPrintSource) {
                console.log('~~~ feedbackPrintSource ~~~ ' + feedbackPrintSource);
                localStorageService.set('feedback_feedbackPrintSource', feedbackPrintSource);
              },
              get: function () {
                return localStorageService.get('feedback_feedbackPrintSource');
              },
              remove: function () {
                localStorageService.remove('feedback_feedbackPrintSource');
              }
          }
      };

      this.contextUserImpl = {
        contextUserProfile: {
            set: function (contextUserProfile) {
              localStorageService.set('contextUser_contextUserProfile', contextUserProfile);
            },
            get: function () {
              return localStorageService.get('contextUser_contextUserProfile');
            },
            remove: function () {
              localStorageService.remove('contextUser_contextUserProfile');
            }
          }
      };

      this.alternateImpl = {
        alternateManagerId: {
          set: function (alternateManagerId) {
            localStorageService.set('contextAlternate_alternateManagerId', alternateManagerId);
          },
          get: function () {
            return localStorageService.get('contextAlternate_alternateManagerId');
          },
          remove: function () {
            localStorageService.remove('contextAlternate_alternateManagerId');
          }
        }
      };

      this.timelineImpl = {
        timelineId: {
          set: function (timelineId) {
            localStorageService.set('context_timelineId', timelineId);
          },
          get: function () {
            return localStorageService.get('context_timelineId');
          },
          remove: function () {
            localStorageService.remove('context_timelineId');
          }
        }
      };

      return {
    	  appCommonData : this.appCommonDataImpl,
        conversation : this.conversationImpl,
        feedback: this.feedbackImpl,
        contextUser: this.contextUserImpl,
        alternate: this.alternateImpl,
        timeline: this.timelineImpl,
        home: this.homeImpl
      };
    }
})();
