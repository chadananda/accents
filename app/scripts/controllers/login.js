'use strict';

/**
 * @ngdoc function
 * @name accentsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the accentsApp
 */
angular.module('accentsApp')
  .controller('loginCtrl', function ($scope,$location,$timeout) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
     $scope.login = function() {
		
		 var username=$scope.username;
		 var password=$scope.password;
		 console.log(username , password);
var domainRemoteDb='127.0.0.1:5986';
var remoteDb='testdb';
var urlConnection = "http://" + username + ":" + password + "@" + domainRemoteDb + "/" + remoteDb;

console.log(urlConnection);
var db = new PouchDB(urlConnection, function(error){

console.log(error);
        if(error){
			//console.log(error.message);
			$location.path("/");
			 $timeout(function(){$scope.errormessage =error.message},100);
			          // $scope.errormessage ="Invalid Username and Password";
			
			
			                }else{
			 
			 
           $scope.todoText ={username: username, loggedIn: true, startDate: new Date()};
           
             localStorage.setItem('session-user', JSON.stringify($scope.todoText))
             var session=localStorage.getItem('session-user');
            //  $location.path("/getdata");
            window.location.href="/#/getdata";
          
            }
           
        });
  

	 
	 }
    
    
    
    
  });
