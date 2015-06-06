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
  //======DEFINE ALL CONSTANTS HERE=========/
   .constant("myConfig", {
        "url": "http://diacritics.iriscouch.com/accents_backup_01-05-15/",
        "remoteDbDomain":"diacritics.iriscouch.com",
        "database":"accents_backup_01-05-15"
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
