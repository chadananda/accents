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
    'ngTouch',
    'ui.bootstrap'
  ])
  //======DEFINE ALL CONSTANTS HERE=========/
   .constant("myConfig", {
        "url": "http://127.0.0.1:5987/accents/",
        "remoteDbDomain":"127.0.0.1:5987",
        "database":"accents"
    })
    //======ALL ROUTES AND CORRESSPONDING CONTROLLERS ARE DEFINED HERE=======/
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
       .when('/settings', {
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl'
      })


      .otherwise({
        redirectTo: '/'
      });
  });
