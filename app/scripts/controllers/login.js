'use strict';

/**
 * @ngdoc function
 * @name accentsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the accentsApp
 */
angular.module('accentsApp')
  .controller('loginCtrl', function ($scope,$location) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
     $scope.login = function() {
		 var username=$scope.username;
		 var password=$scope.password;
var domainRemoteDb='diacritics.iriscouch.com';
var remoteDb='accents';
var urlConnection = "http://" + username + ":" + password + "@" + domainRemoteDb + "/" + remoteDb;


var db = new PouchDB(urlConnection, function(error){
        if(error){
			$location.path("/");
			
            
          }else{
			 
			
			 
           $scope.todoText ={username: username, loggedIn: true, startDate: new Date()};
           
             localStorage.setItem('session-user', JSON.stringify($scope.todoText))
             var session=localStorage.getItem('session-user');
              $location.path("/getdata");
          
            }
           
        });
  

	 
	 }
    
    
    
    
  });
