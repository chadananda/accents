'use strict';

/**
 * @ngdoc function
 * @name accentsApp.controller:getdataCtrl
 * @description
 * # getdataCtrl
 * Controller of the accentsApp
 */
angular.module('accentsApp')
  .controller('getdataCtrl', function ($scope,$http,getRecords) {
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
		//console.log(data.rows.doc);
		
	$scope.docs=data.rows;
	$scope.count=data.total_rows;
		}
		
		
		
				
          
        })
        .error(function(error) {
      //  console.log(error);
        });
        
        $scope.deletedoc = function(id) {
			
        alert(id)
        
        
        
        
    };
    
    
    
    $scope.adddata=function(){
    alert('hi');
   /* $http.post({
        url: 'http://diacritics.iriscouch.com/accents_swarandeep/',
        
        data: JSON.stringify({"_rev": "4-0795f5da8974dc19e1178a0fd11d890b","id":"4cf643637","source": "marciel",   "original": "شرح الفوائد", "definition": "by Shaykh Aḥmad-i-Aḥsá’í", "type": "term", "user": "chad",   "term": "_Sharḥu’l-Far"}),
        headers: {'Content-Type': 'application/json'}
      }).success(function (data, status, headers, config) {
           alert(data);
        }).error(function (data, status, headers, config) {
            $scope.status = status + ' ' + headers;
        });*/
};  
    
    
    
    $scope.getnames=function(searchval){
		$http.get('http://diacritics.iriscouch.com/accents_swarandeep/_design/lists/_view/full_term?startkey="'+searchval+'"&endkey="'+searchval+'\\ufff0"&include_docs=true')
		.success(function(data) {
			console.log(data);
		if(data.rows)
		{
	
	$scope.docs=data.rows;
	$scope.count=data.total_rows;
		}
           })
        .error(function(error) {
        
        });
        
	}
    
    
  });
