'use strict';

/**
 * @ngdoc function
 * @name accentsApp.controller:getdataCtrl
 * @description
 * # getdataCtrl
 * Controller of the accentsApp
 */
angular.module('accentsApp')
  .controller('getdataCtrl', function ($scope,$http,getRecords,$window) {
  $scope.docs={};
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

	 //////////////////////////Fetch  data/////////////////////////////////////
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
        
         //////////////////////////Delete data/////////////////////////////////////
        
        $scope.deletedoc = function(id,rev) {
		if($window.confirm('Are you SURE you want to delete?')){	
       	$http.delete('http://diacritics.iriscouch.com/accents_swarandeep/'+id+'?rev='+rev).
		success(function(data, status, headers, config) {
	//  console.log(Status);
   console.log(status);
  }).
  error(function(data, status, headers, config) {
	  //console.log(Status);
   alert(status);
  });   
      }  
        
    };
    
    
     //////////////////////////Delete data in the form/////////////////////////////////////
        
        $scope.deletedata = function() {
			var id=document.getElementById("keyid").value;
			var rev=document.getElementById("keyrev").value; 
		if($window.confirm('Are you SURE you want to delete?')){	
       	$http.delete('http://diacritics.iriscouch.com/accents_swarandeep/'+id+'?rev='+rev).
		success(function(data, status, headers, config) {
	//  console.log(Status);
   console.log(status);
  }).
  error(function(data, status, headers, config) {
	  //console.log(Status);
   alert(status);
  });   
      }  
        
    };
    
      //////////////////////////single record data/////////////////////////////////////
        
        $scope.editdoc = function(id,rev) {
			
       	$http.get('http://diacritics.iriscouch.com/accents_swarandeep/'+id+'?rev='+rev+'&include_docs=true').
		success(function(data, status, headers, config) {
	//  console.log(Status);
	$scope.editdata=data;
	document.getElementById("term").value=data.term;
	document.getElementById("keyid").value=data._id;
	document.getElementById("keyrev").value=data._rev;
	$('#addword').css({ "display":"none" });
	$('#Button2').css({ "display":"block" });
	$('#updateword').css({ "display":"block" });

   console.log(data);
  }).
  error(function(data, status, headers, config) {
	  //console.log(Status);
   alert(status);
  });   
     
        
    };
    
    //////////////////////////Add data/////////////////////////////////////
    
    $scope.adddata=function(){
    var term=$scope.search.doc.term;
    var  original=$scope.editdata.original;
    var refrence=$scope.editdata.reference;
    var definition=$scope.editdata.definition;
    //console.log(newterm);
   // var newtrans=$scope.newtrans;
var data= JSON.stringify({"source": "Swarandeep",   "original":original , "definition":definition, "type": "term", "user": "Swarandeep","term": term,"ref":refrence});
    
    $http.post('http://diacritics.iriscouch.com/accents_swarandeep/', data).
  success(function(data, status, headers, config) {
	  console.log(status);
    //alert('Success');
  }).
  error(function(data, status, headers, config) {
	  console.log(status);
   //alert('eroro');
  });

};  
  
   //////////////////////////Update data/////////////////////////////////////

    $scope.updatedata=function(){
	var id=document.getElementById("keyid").value;
	var rev=document.getElementById("keyrev").value;
	var term=$scope.search.doc.term;
    var  original=$scope.editdata.original;
    var refrence=$scope.editdata.reference;
    var definition=$scope.editdata.definition;
    //console.log(newterm);
   // var newtrans=$scope.newtrans;
    var data= JSON.stringify({"source": "Swarandeep",   "original":original , "definition":definition, "type": "term", "user": "Swarandeep","term": term,"ref":refrence});
   
    $http.put('http://diacritics.iriscouch.com/accents_swarandeep/'+id+'?rev='+rev, data).
  success(function(data, status, headers, config) {
	  console.log(status);
    //alert('Success');
  }).
  error(function(data, status, headers, config) {
	  console.log(status);
   //alert('eroro');
  });

};    
    
     //////////////////////////Search data/////////////////////////////////////
    
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
