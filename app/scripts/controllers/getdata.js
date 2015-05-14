'use strict';

/**
 * @ngdoc function
 * @name accentsApp.controller:getdataCtrl
 * @description
 * # getdataCtrl
 * Controller of the accentsApp
 */
angular.module('accentsApp')
  .controller('getdataCtrl', function ($scope,getRecords) {
  $scope.docs={};
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
	
	// $scope.getAllData = function() {
      getRecords.getAllData()
        .success(function(data) {
			
		if(data.rows)
		{
		console.log(data.rows);
		
	$scope.docs=data.rows;
	$scope.count=data.total_rows;
		}
		
		
		
				
          
        })
        .error(function(error) {
        console.log(error);
        });
        
        $scope.deletedoc = function(id) {
			
        alert(id)
        
        
        
        
    };
  });
