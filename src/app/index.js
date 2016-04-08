(function () {
  'use strict';
  angular
    .module('cpccore', [
      'LocalStorageModule',
      'ngAnimate',
      'ngCookies',
      'ngTouch',
      'ngSanitize',
      'ngResource',
      'ui.router',
      'ui.bootstrap',
      'ui.bootstrap.tooltip',
      'ui.bootstrap.popover',
      'ui.bootstrap.tpls',
      'pascalprecht.translate',
      'angularFileUpload',
      'angular-growl',
      'ngTagsInput',
      'ncy-angular-breadcrumb'
    ])
    .config(httpAuthInterceptor)
    .config(httpResponseHeaderInterceptor)
    .config(httpLoadingStatus)
    .config(translation)
    .config(['growlProvider', function (growlProvider) {
      growlProvider.onlyUniqueMessages(true);
      growlProvider.globalTimeToLive({
        success: 4000,
        error: 4000,
        warning: 4000,
        info: 4000
      });
      growlProvider.globalPosition('top-right');
    }])
    .config(function (localStorageServiceProvider) {
      localStorageServiceProvider
        .setPrefix('sync')
        .setStorageType('sessionStorage')
        .setNotify(true, true);
    })
    .config(configuration)
    .config(['$tooltipProvider', function ($tooltipProvider) {
      $tooltipProvider.setTriggers({
        'focus': 'blur',
        'customShow': 'customShow'
      });
    }])
    .constant('_', window._)
    .constant('moment', window.moment)
    .filter('sanitize', ['$sce', function ($sce) {
      return function (htmlCode) {
        return $sce.trustAsHtml(htmlCode);
      };
    }])
    .filter('capitalize', function () {
      return function (input) {
        return typeof input !== 'undefined' ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : input;
      };
    })
    .filter('usernametofirstname', function (localStorageService) {
      return function (input) {
        if (localStorageService.get(input) != null && typeof localStorageService.get(input) !== 'undefined') {
          return localStorageService.get(input).firstName;
        }
        else {
          return input;
        }
      };
    })
    .filter('tmusernametofullname', function (localStorageService) {
      return function (input) {
        if (localStorageService.get(input) != null && typeof localStorageService.get(input) !== 'undefined') {
          return "(" + localStorageService.get(input).firstName + " " + localStorageService.get(input).lastName + ")";
        }
        else {
          return "(" + input + ")";
        }
      };
    })
    .filter('dateInPST', function ($window) {
      return function (input) {
        return $window.moment(input).tz("America/Los_Angeles").format('YYYY-MM-DD');
      }
    })
    .filter('timeInPST', function ($window) {
      return function (input) {
        return $window.moment(input).tz("America/Los_Angeles").format('HH:mm');
      }
    });

  function httpLoadingStatus($httpProvider, $provide) {
    $provide.factory('httpLoadingStatus', function ($q, $rootScope) {
      var loadingCount = 0;
      return {
        request: function (config) {
          if (++loadingCount === 1) $rootScope.$broadcast('loading:progress');
          return config || $q.when(config);
        },

        response: function (response) {
          if (--loadingCount === 0) $rootScope.$broadcast('loading:finish', response);
          return response || $q.when(response);
        },

        responseError: function (response) {
          if (--loadingCount === 0) $rootScope.$broadcast('loading:finish', response);
          return $q.reject(response);
        }
      };
    });
    $httpProvider.interceptors.push('httpLoadingStatus');
  }

  function httpAuthInterceptor($httpProvider, $provide) {
    $provide.factory('httpAuthInterceptor', function ($q) {
      return {
        request: function ($config) {
          var token = '';
          try {
            token = JSON.parse(localStorage.getItem('ls.token'))['token'];
          } catch (e) {

          }
          $config.headers['x-auth-token'] = token;
          return $config;
        }
      };
    });
    $httpProvider.interceptors.push('httpAuthInterceptor');
  }

  function httpResponseHeaderInterceptor($httpProvider, $provide) {
    $provide.factory('httpResponseHeaderInterceptor', function ($q, $location) {
      return {
        response: function (response) {
          console.log('response', response);
          if (response.status === 401) {
            console.log('Response 401');
          }
          return response || $q.when(response);
        },
        responseError: function error(response) {
          // console.info('responseerror', response);
          switch (response.status) {
            case 401:
              $location.path('/auth/logout');
              break;
            /*case 404:
             $location.path('/404');
             break;
             default:
             $location.path('/404');*/
          }
          return $q.reject(response);
        }
      };
    });
    $httpProvider.interceptors.push('httpResponseHeaderInterceptor');
  }

  function configuration($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: '/client/app/main/main.html',
        controller: 'MainCtrl',
        ncyBreadcrumb: {
          label: 'Back to my Home'
        }
      })

      .state('error', {
        url: '/404',
        templateUrl: '/client/app/404.html',
        controller: 'MainCtrl'
      })

      .state('timeline', {
        url: '/timeline',
        templateUrl: '/client/app/timeline/timeline.html',
        controller: 'TimelineCtrl',
        ncyBreadcrumb: {
          skip: true
        }
      })

      .state('timeline.teamState', {
        url: '/team',
        views: {
          'stateView': {
            templateUrl: '/client/app/timeline/timeline-team.html',
            controller: 'TimelineTeamCtrl',
            controllerAs: 'vm'
          }
        },
        templateUrl: '/client/app/timeline/timeline.html',
        ncyBreadcrumb: {
          parent: 'home',
          label: 'Team Timeline',
          backLabel: 'Back to Team Timeline'
        }
      })

      .state('timeline.teamSecondState', {
        url: '/secondTeam',
        views: {
          'stateView': {
            templateUrl: '/client/app/timeline/timelineSecond-team.html',
            controller: 'TimelineSecondTeamCtrl',
            controllerAs: 'vm'
          }
        },
        templateUrl: '/client/app/timeline/timeline.html',
        ncyBreadcrumb: {
          parent: 'home',
          label: 'Team Timeline',
          backLabel: 'Back to Team Timeline'
        }
      })

      .state('timeline.selfState', {
        url: '/self',
        views: {
          'stateView': {
            templateUrl: '/client/app/timeline/timeline-self.html',
            controller: 'TimelineSelfCtrl',
            controllerAs: 'vm'
          }
        },
        templateUrl: '/client/app/timeline/timeline.html',
        ncyBreadcrumb: {
          parent: 'home',
          //backLabel: 'Back to Timeline',
          label: 'Timeline'
        }
      })
      .state('timeline.view', {
        url: '/view',
        views: {
          'stateView': {
            templateUrl: '/client/app/timeline/timeline-view.html',
            controller: 'TimelineViewCtrl',
            controllerAs: 'vm'
          }
        },
        templateUrl: '/client/app/timeline/timeline.html',
        ncyBreadcrumb: {
          label: 'View Timeline',
          parent: 'timeline.selfState',
          hide: true
        }
      })

      .state('notifications', {
        url: '/notifications',
        templateUrl: '/client/app/notifications/notifications.html',
        controller: 'NotificationsCtrl',
        ncyBreadcrumb: {
          label: 'Notifications'
        }
      })
      .state('notifications.all', {
        url: '/all/:username',
        views: {
          'stateView': {
            templateUrl: '/client/app/notifications/notifications-all.html'
          }
        },
        templateUrl: '/client/app/notifications/notifications.html',
        ncyBreadcrumb: {
          label: 'All Notifications'
        }
      })

      .state('feedbackpdf', {
        url: '/feedbackpdf',
        templateUrl: '/client/app/feedbackpdf/feedbackpdf.html',
        controller: 'FeedbackPDFCtrl',
        ncyBreadcrumb: {
          label: 'Feedback PDF'
        }
      })
      .state('feedbackpdf.all', {
        url: '/all/:username',
        views: {
          'stateView': {
            templateUrl: '/client/app/feedbackpdf/feedbackpdf-all.html'
          }
        },
        templateUrl: '/client/app/feedbackpdf/feedbackpdf.html',
        ncyBreadcrumb: {
          label: 'Feedback PDF'
        }
      })
      .state('feedbackpdfTeam', {
        url: '/feedbackpdfteam',
        templateUrl: '/client/app/feedbackpdfteam/feedbackpdfteam.html',
        controller: 'FeedbackPDFTeamCtrl',
        ncyBreadcrumb: {
          label: 'Feedback PDF'
        }
      })
      .state('feedbackpdfTeam.all', {
        url: '/all/:username',
        views: {
          'stateView': {
            templateUrl: '/client/app/feedbackpdfteam/feedbackpdfteam-all.html'
          }
        },
        templateUrl: '/client/app/feedbackpdf/feedbackpdfteam.html',
        ncyBreadcrumb: {
          label: 'Feedback PDF'
        }
      })


      .state('conversationpdf', {
        url: '/conversationpdf',
        templateUrl: '/client/app/conversationpdf/conversationpdf.html',
        controller: 'ConversationPDFCtrl',
        ncyBreadcrumb: {
          label: 'Syncup PDF'
        }
      })
      .state('conversationpdf.all', {
        url: '/all/:username',
        views: {
          'stateView': {
            templateUrl: '/client/app/conversationpdf/conversationpdf-all.html'
          }
        },
        templateUrl: '/client/app/conversationpdf/conversationpdf.html',
        ncyBreadcrumb: {
          label: 'Syncup PDF'
        }
      })

      .state('conversationpdfteam', {
        url: '/conversationpdfteam',
        templateUrl: '/client/app/conversationpdfteam/conversationpdfteam.html',
        controller: 'ConversationPDFTeamCtrl',
        ncyBreadcrumb: {
          label: 'All Syncup PDF'
        }
      })
      .state('conversationpdfteam.all', {
        url: '/all/:username',
        views: {
          'stateView': {
            templateUrl: '/client/app/conversationpdfteam/conversationpdfteam-all.html'
          }
        },
        templateUrl: '/client/app/conversationpdfteam/conversationpdfteam.html',
        ncyBreadcrumb: {
          label: 'All Syncup PDF'
        }
      })


      //start
      /*.state('teamMemberTimeline', {
       url: '/timeline',
       parent: "teammemberhome",
       templateUrl: '/client/app/timeline/timeline.html',
       controller: 'TimelineCtrl',
       ncyBreadcrumb: {
       skip: true
       }
       })
       .state('teamMemberTimeline.teamState', {
       url: '/team',
       views: {
       'stateView': {
       templateUrl: '/client/app/timeline/timeline-team.html',
       controller: 'TimelineTeamCtrl',
       controllerAs: 'vm'
       }
       },
       templateUrl: '/client/app/timeline/timeline.html',
       ncyBreadcrumb: {
       parent: 'teammemberhome',
       label: 'Team Timeline',
       backLabel: 'Back to Team Timeline'
       }
       })

       .state('teamMemberTimeline.selfState', {
       url: '/self',
       views: {
       'stateView': {
       templateUrl: '/client/app/timeline/timeline-self.html',
       controller: 'TimelineSelfCtrl',
       controllerAs: 'vm'
       }
       },
       templateUrl: '/client/app/timeline/timeline.html',
       ncyBreadcrumb: {
       parent: 'teammemberhome',
       backLabel: 'Back to Timeline',
       label: 'Timeline'
       }
       })*/
      //end

      .state('teamMemberAlternateManager', {
        url: '/alternate',
        parent: 'teammemberhome',
        templateUrl: '/client/app/alternateManager/alternateManager.html',
        controller: 'AlternateManagerCtrl',
        ncyBreadcrumb: {
          skip: true
        }
      })

      .state('teamMemberAlternateManager.selfState', {
        url: '/self',
        views: {
          'stateView': {
            templateUrl: '/client/app/alternateManager/alternateManager-self.html',
            controller: 'AlternateManagerSelfCtrl',
            controllerAs: 'vm'
          }
        },
        templateUrl: '/client/app/alternateManager/alternateManager.html',
        ncyBreadcrumb: {
          parent: 'teammemberhome',
          //backLabel: 'Back to Alternate Manager',
          label: 'Alternate Manager'
        }
      })

      .state('teamMemberAlternateManager.teamState', {
        url: '/team',
        views: {
          'stateView': {
            templateUrl: '/client/app/alternateManager/alternateManager-team.html',
            controller: 'AlternateManagerTeamCtrl',
            controllerAs: 'vm'
          }
        },
        templateUrl: '/client/app/alternateManager/alternateManager.html',
        ncyBreadcrumb: {
          parent: 'teammemberhome',
          backLabel: 'Back to Alternate Manager',
          label: 'Alternate Manager'
        }
      })

      .state('teamMemberAlternateManager.teamSecondState', {
        url: '/secondTeam',
        views: {
          'stateView': {
            templateUrl: '/client/app/alternateManager/alternateManagerSecond-team.html',
            controller: 'AlternateManagerSecondTeamCtrl',
            controllerAs: 'vm'
          }
        },
        templateUrl: '/client/app/alternateManager/alternateManager.html',
        ncyBreadcrumb: {
          parent: 'teammemberhome',
          backLabel: 'Back to Alternate Manager',
          label: 'Alternate Manager'
        }
      })

      .state('teamMemberAlternateManager.proxySelf', {
        url: '/proxySelf',
        views: {
          'stateView': {
            templateUrl: '/client/app/alternateManager/alternateManager-self-proxy.html',
            controller: 'AlternateManagerSelfProxyCtrl',
            controllerAs: 'vm'
          }
        },
        templateUrl: '/client/app/alternateManager/alternateManager.html',
        ncyBreadcrumb: {
          parent: 'teamMemberAlternateManager.selfState',
          //backLabel: 'Back to Alternate Manager',
          hide: true,
          label: 'Alternate Manager'
        }
      })

      .state('teamMemberAlternateManager.proxyTeam', {
        url: '/proxyTeam',
        views: {
          'stateView': {
            templateUrl: '/client/app/alternateManager/alternateManager-team-proxy.html',
            controller: 'AlternateManagerTeamProxyCtrl',
            controllerAs: 'vm'
          }
        },
        templateUrl: '/client/app/alternateManager/alternateManager.html',
        ncyBreadcrumb: {
          parent: 'alternateManager.teamState',
          hide: true,
          label: 'Team Proxy'
        }
      })

      .state('alternateManager', {
        url: '/alternate',
        templateUrl: '/client/app/alternateManager/alternateManager.html',
        controller: 'AlternateManagerCtrl',
        ncyBreadcrumb: {
          label: 'Alternate Manager',
          skip: true
        }
      })

      .state('alternateManager.selfState', {
        url: '/self',
        views: {
          'stateView': {
            templateUrl: '/client/app/alternateManager/alternateManager-self.html',
            controller: 'AlternateManagerSelfCtrl',
            controllerAs: 'vm'
          }
        },
        templateUrl: '/client/app/alternateManager/alternateManager.html',
        ncyBreadcrumb: {
          parent: 'home',
          backLabel: 'Back to Alternate Manager',
          label: 'Alternate Manager'
        }
      })

      .state('alternateManager.teamState', {
        url: '/team',
        views: {
          'stateView': {
            templateUrl: '/client/app/alternateManager/alternateManager-team.html',
            controller: 'AlternateManagerTeamCtrl',
            controllerAs: 'vm'
          }
        },
        templateUrl: '/client/app/alternateManager/alternateManager.html',
        ncyBreadcrumb: {
          parent: 'home',
          label: 'Alternate Team'//,
          //backLabel: 'Back to Alternate Team'
        }
      })

      .state('alternateManager.teamSecondState', {
        url: '/secondTeam',
        views: {
          'stateView': {
            templateUrl: '/client/app/alternateManager/alternateManagerSecond-team.html',
            controller: 'AlternateManagerSecondTeamCtrl',
            controllerAs: 'vm'
          }
        },
        templateUrl: '/client/app/alternateManager/alternateManager.html',
        ncyBreadcrumb: {
          parent: 'home',
          label: 'Alternate Team'//,
          //backLabel: 'Back to Alternate Team'
        }
      })

      .state('alternateManager.proxySelf', {
        url: '/proxySelf',
        views: {
          'stateView': {
            templateUrl: '/client/app/alternateManager/alternateManager-self-proxy.html',
            controller: 'AlternateManagerSelfProxyCtrl',
            controllerAs: 'vm'
          }
        },
        templateUrl: '/client/app/alternateManager/alternateManager.html',
        ncyBreadcrumb: {
          label: 'Self Proxy'
        }
      })

      .state('alternateManager.proxyTeam', {
        url: '/proxyTeam',
        views: {
          'stateView': {
            templateUrl: '/client/app/alternateManager/alternateManager-team-proxy.html',
            controller: 'AlternateManagerTeamProxyCtrl',
            controllerAs: 'vm'
          }
        },
        templateUrl: '/client/app/alternateManager/alternateManager.html',
        ncyBreadcrumb: {
          parent: 'alternateManager.teamState',
          hide: true,
          label: 'Team Proxy'
        }
      })

      .state('teammemberhome', {
        url: '/teammember/:username',
        templateUrl: '/client/app/teammembermain/teammembermain.html',
        controller: 'TeamMemberMainCtrl',
        ncyBreadcrumb: {
          parent: 'home',
          label: "{{username|usernametofirstname}}\'s Home", //Team member home breadcrumb label is a special case and is handled in /lib/angular-breadcrumb.js
          backLabel: "{{username|usernametofirstname}}\'s Home" //Team member home breadcrumb label is a special case and is handled in /lib/angular-breadcrumb.js
        }
      })

      .state('teamMemberTimeline', {
        url: '/timeline',
        parent: 'teammemberhome',
        templateUrl: '/client/app/timeline/timeline.html',
        controller: 'TimelineCtrl',
        ncyBreadcrumb: {
          skip: true
        }
      })
      .state('teamMemberTimeline.teamState', {
        url: '/team',
        views: {
          'stateView': {
            templateUrl: '/client/app/timeline/timeline-team.html',
            controller: 'TimelineTeamCtrl',
            controllerAs: 'vm'
          }
        },
        templateUrl: '/client/app/timeline/timeline.html',
        ncyBreadcrumb: {
          parent: 'teammemberhome',
          label: 'Team Timeline',
          backLabel: 'Back to Team Timeline'
        }
      })

      .state('teamMemberTimeline.selfState', {
        url: '/self',
        views: {
          'stateView': {
            templateUrl: '/client/app/timeline/timeline-self.html',
            controller: 'TimelineSelfCtrl',
            controllerAs: 'vm'
          }
        },
        templateUrl: '/client/app/timeline/timeline.html',
        ncyBreadcrumb: {
          parent: 'teammemberhome',
          //backLabel: 'Back to Timeline',
          label: 'Timeline'
        }
      })
      .state('conversationsTeamMember', {
        parent: 'teammemberhome',
        url: '/conversations',
        templateUrl: '/client/app/conversations/conversations-teammember.html',
        controller: 'ConvCtrl',
        ncyBreadcrumb: {
          skip: true
        }
      })
      .state('conversationsTeamMember.viewAllSelf', {
        url: '/self/:tmusername/:drillDownUser/:isAlternateTeamMember',
        views: {
          'stateView': {
            templateUrl: '/client/app/conversations/conversations-teammember-self.html'
          }
        },
        controller: 'ConvCtrl',
        ncyBreadcrumb: {
          parent: 'teammemberhome',
          label: 'Sync Up Conversations',
          backLabel: 'Back to Sync Up Conversations'
        }
      })
      .state('conversationsTeamMember.self', {
        url: '/self/:tmusername/:drillDownUser/:isAlternateTeamMember',
        views: {
          'stateView': {
            templateUrl: '/client/app/conversations/conversations-teammember-self.html'
          }
        },
        controller: 'ConvCtrl',
        ncyBreadcrumb: {
          parent: 'teammemberhome',
          label: 'Sync Up Conversations',
          backLabel: 'Back to Sync Up Conversations'
        }
      })
      .state('conversationsTeamMember.team', {
        url: '/team/:tmusername',
        views: {
          'stateView': {
            templateUrl: '/client/app/conversations/conversations-teammember-team.html'
          }
        },
        ncyBreadcrumb: {
          parent: 'teammemberhome',
          label: 'Sync Up Conversations',
          backLabel: 'Back to Sync Up Conversations'
        }
      })
      .state('conversations', {
        url: '/conversations',
        templateUrl: '/client/app/conversations/conversations.html',
        controller: 'ConvCtrl',
        ncyBreadcrumb: {
          skip: true
        }
      })
      .state('conversations.selfState', {
        url: '/self',
        views: {
          'stateView': {
            templateUrl: '/client/app/conversations/conversations-self.html'
          }
        },
        ncyBreadcrumb: {
          parent: 'home',
          label: 'My Conversations'//,
          //backLabel: 'Back to my Conversations'
        }
      })
      /*.state('conversations.selfTeamMemberState', {
       url: '/self/:username',
       views: {
       'stateView': {
       templateUrl: '/client/app/conversations/conversations-self.html'
       }
       },
       templateUrl: '/client/app/conversations/conversations.html'
       })*/
      .state('conversations.teamState', {
        url: '/team',
        views: {
          'stateView': {
            templateUrl: '/client/app/conversations/conversations-team.html'
          }
        },
        templateUrl: '/client/app/conversations/conversations.html',
        ncyBreadcrumb: {
          parent: 'home',
          //backLabel: 'Back to my Team Conversations',
          label: 'My Team Conversations'
        }
      })
      .state('conversationdetails', {
        url: '/conversationdetails',
        templateUrl: '/client/app/conversationdetails/conversationdetails.html',
        controller: 'ConvDetCtrl',
        ncyBreadcrumb: {
          skip: 'true'
        }
      })
      .state('conversationdetails.newConversation', {
        url: '/newConversation',
        views: {
          'conversationView': {
            templateUrl: '/client/app/conversationdetails/conversationdetails-new.html'
          }
        },
        controller: 'ConvDetCtrl',
        ncyBreadcrumb: {
          parent: 'conversations.selfState',
          hide: true,
          label: 'New Conversation'
        }
      })
      .state('conversationdetails.newTeamMemberConversation', {
        url: '/newTeamMemberConversation',
        views: {
          'conversationView': {
            templateUrl: '/client/app/conversationdetails/conversationdetails-new.html'
          }
        },
        controller: 'ConvDetCtrl',
        ncyBreadcrumb: {
          //parent: 'conversationsTeamMember.self',
          label: 'New Team Member Syncup',
          hide: true
        }
      })
      .state('conversationdetails.sharedConversation', {
        url: '/sharedConversation',
        views: {
          'conversationView': {
            templateUrl: '/client/app/conversationdetails/conversationdetails-shared.html'
          }
        },
        ncyBreadcrumb: {
          parent: 'conversations.selfState',
          hide: true,
          label: 'View Syncup'
        },
        controller: 'ConvDetCtrl'
      })
      .state('conversationdetails.sharedTeamMemberConversation', {
        url: '/sharedTeamMemberConversation',
        views: {
          'conversationView': {
            templateUrl: '/client/app/conversationdetails/conversationdetails-shared.html'
          }
        },
        ncyBreadcrumb: {
          //parent: 'conversationsTeamMember.self',
          hide: true,
          label: 'View Teammember Syncup'
        },
        controller: 'ConvDetCtrl'
      })
      .state('conversationdetails.viewConversation', {
        url: '/viewConversation',
        views: {
          'conversationView': {
            templateUrl: '/client/app/conversationdetails/conversationdetails-view.html'
          }
        },
        controller: 'ConvDetCtrl',
        ncyBreadcrumb: {
          label: 'View Syncup'
        }
      })
      .state('conversationdetails.viewTeammemberConversation', {
        url: '/viewTeammemberConversation',
        views: {
          'conversationView': {
            templateUrl: '/client/app/conversationdetails/conversationdetails-view.html'
          }
        },
        controller: 'ConvDetCtrl',
        ncyBreadcrumb: {
          label: 'View Team Syncup'
        }
      })
      .state('conversationdetails.draftedConversation', {
        url: '/draftedConversation',
        views: {
          'conversationView': {
            templateUrl: '/client/app/conversationdetails/conversationdetails-drafted.html'
          }
        },
        controller: 'ConvDetCtrl',
        ncyBreadcrumb: {
          label: 'Syncup Draft'
        }
      })
      .state('conversationdetails.teamNewConversation', {
        url: '/teamNewConversation',
        views: {
          'conversationView': {
            templateUrl: '/client/app/conversationdetails/conversationdetails-team-new.html'
          }
        },
        controller: 'ConvDetCtrl',
        ncyBreadcrumb: {
          label: 'New Team Syncup',
          hide: true,
          parent: 'conversations.teamState'
        }
      })
      .state('conversationdetails.sharedTeamConversation', {
        url: '/sharedTeamConversation',
        views: {
          'conversationView': {
            templateUrl: '/client/app/conversationdetails/conversationdetails-team-view.html'
          }
        },
        controller: 'ConvDetCtrl',
        ncyBreadcrumb: {
          label: 'Team Syncup',
          hide: true,
          parent: 'conversations.teamState'
        }
      })
      .state('conversationdetails.teamMemberDraftConversation', {
        url: '/teamMemberDraftConversation/:username/:tag/:isAlternateTeamMember/:fyQuarter',
        views: {
          'conversationView': {
            templateUrl: '/client/app/conversationdetails/conversationdetails-team-draft.html'
          }
        },
        controller: 'ConvDetCtrl',
        ncyBreadcrumb: {
          label: 'Draft Team Syncup'
        }
      })
      /* Team States of Feedback */
      .state('teamMemberFeedback', {
        url: '/feedback',
        parent: 'teammemberhome',
        templateUrl: '/client/app/feedback/feedback.html',
        controller: 'FeedbackCtrl',
        controllerAs: 'vm',
        ncyBreadcrumb: {
          skip: true
        }
      })
      .state('teamMemberFeedback.unrequestedNew', {
        url: '/new/unrequested',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-newUnrequested.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          label: 'Unrequested Feedback',
          hide: true,
          parent: 'feedback.provide'
        }
      })
      .state('teamMemberFeedback.requestedNew', {
        url: '/new/requested',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-newRequested.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          label: 'Requested Feedback',
          hide: true,
          parent: 'feedback.recieve'
        }
      })
      .state('teamMemberFeedback.requestedNewTeam', {
        url: '/new/requestedTeam',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-newRequestedTeam.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          parent: 'feedback.recieveTeam',
          hide: true,
          label: 'Request Feedback'
        }
      })
      .state('teamMemberFeedback.requestedUserNew', {
        url: '/new/requestedUser',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-newUser.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          label: 'Requested Feedback'
        }
      })
      .state('teamMemberFeedback.provide', {
        url: '/provide',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-provide.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          parent: 'teammemberhome',
          label: 'Give Feedback'//,
          //backLabel: 'Back to Give Feedback'
        }
      })
      .state('teamMemberFeedback.provideViewAll', {
        url: '/provide/viewAll',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-provideViewAll.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          label: 'View All Provided Feedback'
        }
      })
      .state('teamMemberFeedback.receiveViewAll', {
        url: '/receive/viewAll',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-receiveViewAll.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          label: 'View All Received Feedback'
        }
      })
      .state('teamMemberFeedback.recieve', {
        url: '/recieve',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-reqrec.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          parent: 'teammemberhome',
          label: 'Get Feedback',
          backLabel: 'Back to Get Feedback'
        }
      })
      .state('teamMemberFeedback.provideTeam', {
        url: '/provideTeam',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-provideTeam.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          parent: 'teammemberhome',
          label: 'Provide Team Feedback'
        }
      })
      .state('teamMemberFeedback.recieveTeam', {
        url: '/recieveTeam',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-reqrecTeam.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          parent: 'teammemberhome',
          label: 'Get Feedback',
          backLabel: 'Back to Get Feedback'
        }
      })
      .state('teamMemberFeedback.viewFeedback', {
        url: '/viewFeedback',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-view.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          parent: 'feedback.provide',
          hide: true,
          label: 'View Feedback'
        }
      })
      .state('teamMemberFeedback.provideFeedback', {
        url: '/provideFeedback',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-provideFeedback.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          parent: 'feedback.provide',
          hide: true,
          label: 'Give Feedback'
        }
      })
      .state('teamMemberFeedback.declineFeedback', {
        url: '/declineFeedback',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-declineFeedback.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          parent: 'feedback.provide',
          hide: true,
          label: 'Decline Feedback'
        }
      })
      .state('teamMemberFeedback.deleteFeedback', {
        url: '/deleteFeedback',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-deleteFeedback.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          parent: 'feedback.provide',
          hide: true,
          label: 'Delete Feedback'
        }
      })
      .state('teamMemberFeedback.forwardFeedback', {
        url: '/forwardFeedback',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-forwardFeedback.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          label: 'Forward Feedback'
        }
      })
      .state('teamMemberFeedback.sendFeedbackReminder', {
        url: '/sendFeedbackReminder',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-sendReminder.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          label: 'Feedback Reminder',
          hide: true,
          parent: 'feedback.recieve'
        }
      })
      .state('teamMemberFeedback.pendingFeedback', {
        url: '/pendingFeedback',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-pendingFeedback.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          label: 'Pending Feedback'
        }
      })
      /* Team States of Feedback */
      .state('feedback', {
        url: '/feedback',
        templateUrl: '/client/app/feedback/feedback.html',
        controller: 'FeedbackCtrl',
        controllerAs: 'vm',
        ncyBreadcrumb: {
          label: 'Feedback',
          skip: true
        }
      })
      .state('feedback.unrequestedNew', {
        url: '/new/unrequested',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-newUnrequested.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          label: 'Unrequested Feedback',
          hide: true,
          parent: 'feedback.provide'
        }
      })
      .state('feedback.requestedNew', {
        url: '/new/requested',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-newRequested.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          label: 'Requested Feedback',
          hide: true,
          parent: 'feedback.recieve'
        }
      })
      .state('feedback.requestedNewTeam', {
        url: '/new/requestedTeam',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-newRequestedTeam.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          parent: 'feedback.recieveTeam',
          hide: true,
          label: 'Request Feedback'
        }
      })
      .state('feedback.requestedUserNew', {
        url: '/new/requestedUser',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-newUser.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          label: 'Requested Feedback'
        }
      })
      .state('feedback.provide', {
        url: '/provide',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-provide.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          parent: 'home',
          label: 'Give Feedback'//,
          //backLabel: 'Back to Give Feedback'
        }
      })
      .state('feedback.provideViewAll', {
        url: '/provide/viewAll',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-provideViewAll.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          label: 'View All Provided Feedback'
        }
      })
      .state('feedback.receiveViewAll', {
        url: '/receive/viewAll',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-receiveViewAll.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          label: 'View All Received Feedback'
        }
      })
      .state('feedback.recieve', {
        url: '/recieve',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-reqrec.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          parent: 'home',
          label: 'Get Feedback'//,
          //backLabel: 'Back to Get Feedback'
        }
      })
      .state('feedback.provideTeam', {
        url: '/provideTeam',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-provideTeam.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          parent: 'home',
          label: 'Provide Team Feedback'
        }
      })
      .state('feedback.recieveTeam', {
        url: '/recieveTeam',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-reqrecTeam.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          parent: 'home',
          label: 'Get Feedback',
          backLabel: 'Back to Get Feedback'
        }
      })
      .state('feedback.viewFeedback', {
        url: '/viewFeedback',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-view.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          parent: 'feedback.provide',
          hide: true,
          label: 'View Feedback'
        }
      })
      .state('feedback.provideFeedback', {
        url: '/provideFeedback',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-provideFeedback.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          parent: 'feedback.provide',
          hide: true,
          label: 'Give Feedback'
        }
      })
      .state('feedback.declineFeedback', {
        url: '/declineFeedback',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-declineFeedback.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          parent: 'feedback.provide',
          hide: true,
          label: 'Decline Feedback'
        }
      })
      .state('feedback.deleteFeedback', {
        url: '/deleteFeedback',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-deleteFeedback.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          parent: 'feedback.provide',
          hide: true,
          label: 'Delete Feedback'
        }
      })
      .state('feedback.forwardFeedback', {
        url: '/forwardFeedback',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-forwardFeedback.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          label: 'Forward Feedback'
        }
      })
      .state('feedback.sendFeedbackReminder', {
        url: '/sendFeedbackReminder',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-sendReminder.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          label: 'Feedback Reminder',
          hide: true,
          parent: 'feedback.recieve'
        }
      })
      .state('feedback.pendingFeedback', {
        url: '/pendingFeedback',
        views: {
          'feedbackView': {
            templateUrl: '/client/app/feedback/feedback-pendingFeedback.html'
          }
        },
        controller: 'FeedbackCtrl',
        ncyBreadcrumb: {
          label: 'Pending Feedback'
        }
      });

    $urlRouterProvider.otherwise('/');
  }

  function translation($translateProvider) {
    $translateProvider.useSanitizeValueStrategy('escaped');
    $translateProvider.usePostCompiling(true);
    $translateProvider.useStaticFilesLoader({
      prefix: '/client/languages/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('gb');
  }
})();
