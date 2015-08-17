'use strict';

/**
 * @ngdoc function
 * @name accentsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the accentsApp
 */
angular.module('accentsApp').controller('loginCtrl', function ($scope,$location,$timeout,myConfig) {

  $scope.awesomeThings = [
    'HTML5 Boilerplate',
    'AngularJS',
    'Karma'
  ];

  $scope.login = function() {
    var remoteDbUrl = localStorage.getItem('remoteDbUrl');
    var protocol = 'http://'; // default
    var username = localStorage['username'];
    var userpass = localStorage['userpass'];
    if (!remoteDbUrl || !username || !userpass) {
      alert('Warning, we need all fields');
      return console.log('Could not replicate, missing some information: ');
    }
    // if remoteDBUrl has a protocol then cut it off
    var pos = remoteDbUrl.indexOf('://');
    if (pos>-1) {
      protocol = remoteDbUrl.substr(0, pos+3);
      remoteDbUrl = remoteDbUrl.substr(pos+3);
    }
    var urlConnection = protocol + username +':'+ userpass +'@'+ remoteDbUrl;

    //var username=$scope.username;
    //var password=$scope.password;
    //console.log(username , password);
    //var domainRemoteDb=myConfig.remoteDbDomain;
    //var remoteDb=myConfig.database;
    //var urlConnection = "http://" + username + ":" + password + "@" + domainRemoteDb + "/" + remoteDb;
    //console.log(urlConnection);
    //
    //
    var db = new PouchDB(urlConnection, function(error)  {
      if(error) {
        console.log(error);
        $location.path("/");
        $timeout(function(){$scope.errormessage =error.message},100);
      }
      else {
        $scope.todoText ={username: username, loggedIn: true, startDate: new Date()};
        localStorage.setItem('session-user', JSON.stringify($scope.todoText))
        var session=localStorage.getItem('session-user');
        //  $location.path("/getdata");
        window.location.href="/#/getdata"; //??
      }
    });
  }
});
