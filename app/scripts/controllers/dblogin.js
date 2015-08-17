'use strict';

/**
 * @ngdoc function
 * @name accentsApp.controller:dblogin
 * @description
 * # dblogin
 * Controller with popup db login form
 */
var app = angular.module('accentsApp', ['ngDialog']);

app.controller('MainCtrl', function ($scope, ngDialog) {
  $scope.openLoginForm = function() {
    ngDialog.openConfirm({template: 'views/login.html',
      scope: $scope //Pass the scope object if you need to access in the template
    }).then(
      function(value) {
        //save the contact form
      },
      function(value) {
        //Cancel or do nothing
      }
    );
  };
});