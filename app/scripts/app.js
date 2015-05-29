'use strict';

/**
 * @ngdoc overview
 * @name accentsApp
 * @description
 * # accentsApp
 *
 * Main module of the application.
 */
angular
  .module('accentsApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/login.html',
        controller: 'loginCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
	    .when('/getdata', {
        templateUrl: 'views/data.html',
        controller: 'getdataCtrl'
      })
      .when('/allterms', {
        templateUrl: 'views/allrecords.html',
        controller: 'AlltermsCtrl'
      })
      
      
       
      .otherwise({
        redirectTo: '/'
      });
  });
