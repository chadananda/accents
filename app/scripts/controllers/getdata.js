'use strict';

/**
 * @ngdoc function
 * @name accentsApp.controller:getdataCtrl
 * @description
 * # getdataCtrl
 * Controller of the accentsApp
 */
angular.module('accentsApp')
  .controller('getdataCtrl', function ($scope,$http,getRecords,$window,$filter) {
  $scope.docs={};
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

	 //////////////////////////Fetch  data/////////////////////////////////////
	// $scope.getAllData = function() {
	$("#spinner").show();
      getRecords.getAllData()
        .success(function(data) {
			
		if(data.rows)
		{
		//console.log(data.rows.doc);
		
	$scope.docs=data.rows;
	$scope.count=data.total_rows;
	$("#spinner").hide();
	$(".pagination").css("display","block");
		}	
          
        })
        .error(function(error) {
      //  console.log(error);
        });
        $scope.$watch("search.doc.term",function()
        {
			$scope.count=$filter('filter')($scope.docs,{doc:{term : $scope.search.doc.term}}).length;
			});
         //////////////////////////Delete data/////////////////////////////////////
        
        $scope.deletedoc = function(id,rev) {
		if($window.confirm('Are you SURE you want to delete?')){	
       	$http.delete('http://diacritics.iriscouch.com/accents_swarandeep/'+id+'?rev='+rev).
		success(function(data, status, headers, config) {
	//  console.log(Status);
	$("#spinner").show();
   console.log(status);
   $scope.message='Record Deleted Successfully';
       $http.get('http://diacritics.iriscouch.com/accents_swarandeep/_all_docs?include_docs=true')
        .success(function(data) {
			
		if(data.rows)
		{
		console.log(data.rows.doc);
		
	$scope.docs=data.rows;
	$scope.count=data.total_rows;
	$("#spinner").hide();
		}	
          
        })
        .error(function(error) {
       console.log(error);
        });
  }).
  error(function(data, status, headers, config) {
	  //console.log(Status);
	  $scope.message='Error Deleting Record';
   //alert(status);
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
    var refrence=$scope.editdata.ref;
    var definition=$scope.editdata.definition;
    //console.log(newterm);
   // var newtrans=$scope.newtrans;
var data= JSON.stringify({"source": "Swarandeep",   "original":original , "definition":definition, "type": "term", "user": "Swarandeep","term": term,"ref":refrence});
    
    $http.post('http://diacritics.iriscouch.com/accents_swarandeep/', data).
  success(function(data, status, headers, config) {
	  console.log(status);
	  $scope.message='Record Added Successfully';
   $http.get('http://diacritics.iriscouch.com/accents_swarandeep/_all_docs?include_docs=true')
        .success(function(data) {
			
		if(data.rows)
		{
		console.log(data.rows.doc);
		
	$scope.docs=data.rows;
	$scope.count=data.total_rows;
		}	
          
        })
        .error(function(error) {
       console.log(error);
        });
  
  }).
  error(function(data, status, headers, config) {
	  console.log(status);
$scope.message='Error adding record';
   //alert('eroro');
  });

};  
  
   //////////////////////////Update data/////////////////////////////////////

    $scope.updatedata=function(){
	var id=document.getElementById("keyid").value;
	var rev=document.getElementById("keyrev").value;
	var term=$scope.search.doc.term;
    var  original=$scope.editdata.original;
    var refrence=$scope.editdata.ref;
    var definition=$scope.editdata.definition;
    console.log(id,rev,term,original,refrence,definition);
    
    //console.log(newterm);
   // var newtrans=$scope.newtrans;
    var data= JSON.stringify({"source": "Swarandeep",   "original":original , "definition":definition, "type": "term", "user": "Swarandeep","term": term,"ref":refrence});
     $scope.message='Record Updated Successfully';
    $http.put('http://diacritics.iriscouch.com/accents_swarandeep/'+id+'?rev='+rev, data).
  success(function(data, status, headers, config) {
	 $http.get('http://diacritics.iriscouch.com/accents_swarandeep/_all_docs?include_docs=true')
        .success(function(data) {
			
		if(data.rows)
		{
		console.log(data.rows.doc);
		
	$scope.docs=data.rows;
	$scope.count=data.total_rows;
		}	
          
        })
        .error(function(error) {
       console.log(error);
        });
  
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
    
    
  })
.filter('offset', function() {
  return function(input, start) {	 
   if (!input || !input.length) { return; }
        start = +start; //parse to int
        return input.slice(start);
  };
})
.controller("PaginationCtrl", function($scope) {

  $scope.itemsPerPage = 10;
  $scope.currentPage = 0;
  $scope.items = [];
  
 
  for (var i=0; i<5337; i++) {
	
    $scope.items.push({ id: i, name: "name "+ i, description: "description " + i });
  }

  $scope.range = function() {
    var rangeSize = 5;
    var ret = [];
    var start;

    start = $scope.currentPage;
    if ( start > $scope.pageCount()-rangeSize ) {
      start = $scope.pageCount()-rangeSize+1;
    }

    for (var i=start; i<start+rangeSize; i++) {
      ret.push(i);
    }
    return ret;
  };

  $scope.prevPage = function() {
    if ($scope.currentPage > 0) {
      $scope.currentPage--;
    }
  };

  $scope.prevPageDisabled = function() {
    return $scope.currentPage === 0 ? "disabled" : "";
  };

  $scope.pageCount = function() {
    return Math.ceil($scope.items.length/$scope.itemsPerPage)-1;
  };

  $scope.nextPage = function() {
    if ($scope.currentPage < $scope.pageCount()) {
      $scope.currentPage++;
    }
  };

  $scope.nextPageDisabled = function() {
    return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
  };

  $scope.setPage = function(n) {
    $scope.currentPage = n;
  };

});

