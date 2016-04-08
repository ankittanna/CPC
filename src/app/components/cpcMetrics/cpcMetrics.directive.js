(function() {
  'use strict';

  angular
    .module('cpccore')
    .directive('cpcMetrics', cpcMetrics);

  /* @ngInject */
  function cpcMetrics() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      templateUrl: '/client/app/components/cpcMetrics/cpcMetrics.html',
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
  function Controller($log, $translate,employeeDetails)
{
    var vm = this;
 //   vm.isPeopleManager = employeeDetails.isPeopleManager();
    vm.colors = [{
      name: 'FY 2015 Q1',
      quarter: '1'
    }, {
      name: 'FY 2015 Q2',
      quarter: '2'
    }, {
      name: 'FY 2015 Q3',
      quarter: '3'
    }, {
      name: 'FY 2015 Q4',
      quarter: '4'
    }];
    vm.myColor = vm.colors[0]; // red
    vm.changedValue = function(data) {
      console.log(data);

      vm.chartConfigTeam = {
        title: {
          text: '',
          x: -20 //center
        },
        subtitle: {
          text: '',
          x: -20
        },
        xAxis: {
          categories: ['Dev', 'Per', 'Ali', 'You']
        },
        yAxis: {
          title: {
            text: ''
          },
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }]
        },
        tooltip: {
          valueSuffix: ''
        },
        legend: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        plotOptions: {
          series: {
            marker: {
              enabled: false
            }
          }
        },
        credits: {
          enabled: false
        },
        series: [{
          name: 'Team Metrics',
          data: [2, 20, 2, 20]
        }]
      };

      vm.chartConfig = {
        title: {
          text: '',
          x: -20 //center
        },
        subtitle: {
          text: '',
          x: -20
        },
        xAxis: {
          categories: ['Dev', 'Per', 'Ali', 'You']
        },
        yAxis: {
          title: {
            text: ''
          },
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }]
        },
        tooltip: {
          valueSuffix: ''
        },
        legend: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        plotOptions: {
          series: {
            marker: {
              enabled: false
            }
          }
        },
        credits: {
          enabled: false
        },
        series: [{
          name: 'Self Metrics',
          data: [5, 10, 15, 20]
        }]
      };
    };

    vm.chartConfigTeam = {
      title: {
        text: '',
        x: -20 //center
      },
      subtitle: {
        text: '',
        x: -20
      },
      xAxis: {
        categories: ['Dev', 'Per', 'Ali', 'You']
      },
      yAxis: {
        title: {
          text: ''
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },
      tooltip: {
        valueSuffix: ''
      },
      legend: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      plotOptions: {
        series: {
          marker: {
            enabled: false
          }
        }
      },
      credits: {
        enabled: false
      },
      series: [{
        name: 'Team Metrics',
        data: [7, 17, 13, 23]
      }]
    };

    vm.chartConfig = {
      title: {
        text: '',
        x: -20 //center
      },
      subtitle: {
        text: '',
        x: -20
      },
      xAxis: {
        categories: ['Dev', 'Per', 'Ali', 'You']
      },
      yAxis: {
        title: {
          text: ''
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },
      tooltip: {
        valueSuffix: ''
      },
      legend: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      plotOptions: {
        series: {
          marker: {
            enabled: false
          }
        }
      },
      credits: {
        enabled: false
      },
      series: [{
        name: 'Self Metrics',
        data: [7, 17, 13, 23]
      }]
    };
  }
})();
