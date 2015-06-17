'use strict';

/**
 * @ngdoc function
 * @name accentsApp.controller:alltermsCtrl
 * @description
 * # alltermsCtrl
 * Controller of the accentsApp
 */
angular.module('accentsApp')
  .controller('AlltermsCtrl', function ($scope,$http,getRecords,$window,$filter,myConfig,Utils,$sce,docData) {
    $scope.docs={};
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  
var domainRemoteDb=myConfig.remoteDbDomain;
var remoteDb=myConfig.database;
//===========Calling Utility Functions============//
 $scope.i2html = function(text)
 {
	return $sce.trustAsHtml(Utils.ilm2HTML(text));
 }
 $scope.customi2html=function(text)
 {
	 return Utils.renderGlyph2UTF(text);
 }
  //============On key up of the term textbox change the term=========//
 $( "#term" ).keyup(function() {
	 var term = $('#term').val();
	 
	 if(term!="")
		{
			var changedTerm=$scope.customi2html(term);
			$("#term").val(changedTerm);
			$("#heading-term").html(changedTerm);
		}
});
 //=========Pass document data to edit page=================//
 $scope.editdocPage=function(docid,rev)
 {
	 var list=[{"id":docid},{"rev":rev}];
	 docData.setFormData(list);
	 window.location.href="/#/getdata";
 };
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
         $scope.users = 
        [
          {"aa": "á"}, 
          {"'aa":'ʾā'},
          {"'áa":'ʾā'},
          {"'ā":'ʾā'},
          {"'ʼā":'ʾā'},
          {"gh":"ḡ"}
        ];
      
       $scope.$watch("search.doc.term",function(v)
        {
			$scope.searchterm=v;
			if(v!="")
			{
				
				$scope.partialitems = $filter('newfilter')($scope.docs,v);
				if($scope.partialitems.length!=null)
				{
					var count=$scope.partialitems.length;
				}
				else
				{
					var count=3031;
				}
				
				$scope.paginationFunc(count);
			}	
		});
			$scope.checkValue=function(searchterm)	{
				angular.forEach($scope.users, function(value , key){
				
					angular.forEach(value, function(val , key){
						if(searchterm)
						{
							var indexval=searchterm.indexOf(key);
							if(indexval!=-1)
							{
									var totallength=key.length;
									searchterm=searchterm.replace(key,val);
									var elem = document.getElementById('term');
									  if(typeof elem !== 'undefined' && elem !== null) {
										document.getElementById('term').value = searchterm;
									  }
							}
						}
				});
				});
			};
         //////////////////////////Delete data/////////////////////////////////////
        
        $scope.deletedoc = function(id,rev) {
		if($window.confirm('Are you SURE you want to delete?')){	
			
       	$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev).
		success(function(data, status, headers, config) {
	//  console.log(Status);
	$("#spinner").show();
   console.log(status);
   $scope.message='Record Deleted Successfully';
       $http.get('http://'+domainRemoteDb+'/'+remoteDb+'/_all_docs?include_docs=true')
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
       	$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev).
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
			
       	$http.get('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev+'&include_docs=true').
		success(function(data, status, headers, config) {
	//  console.log(Status);
	$scope.editdata=data;
	document.getElementById("term").value=data.term;
	document.getElementById("keyid").value=data._id;
	document.getElementById("keyrev").value=data._rev;
	$('#addword').css({ "display":"none" });
	$('#Button2').css({ "display":"block" });
	$('#updateword').css({ "display":"block" });
 document.getElementById("toptext").innerHTML="Term Edit";
//   console.log(data);
  }).
  error(function(data, status, headers, config) {
	  //console.log(Status);
   //alert(status);
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
    
    $http.post('http://'+domainRemoteDb+'/'+remoteDb+'/', data).
  success(function(data, status, headers, config) {
	  console.log(status);
	  $scope.message='Record Added Successfully';
   $http.get('http://'+domainRemoteDb+'/'+remoteDb+'/_all_docs?include_docs=true')
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
    $http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev, data).
  success(function(data, status, headers, config) {
	 $http.get('http://'+domainRemoteDb+'/'+remoteDb+'all_docs?include_docs=true')
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
		$http.get('http://'+domainRemoteDb+'/'+remoteDb+'/_design/lists/_view/full_term?startkey="'+searchval+'"&endkey="'+searchval+'\\ufff0"&include_docs=true')
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
	
	//=================Sorting function=======================//
	$scope.customSort=function(items){
		items.sort();
		return items;
	}
    $scope.paginationFunc=function(count){
		$scope.itemsPerPage = 100;
  $scope.currentPage = 0;
  $scope.items = [];
  $scope.totalRows=count;
  for (var i=0; i<$scope.totalRows; i++) {
	
    $scope.items.push({ id: i, name: "name "+ i, description: "description " + i });
  }
}
  $scope.range = function(total) {
	  var  rangeSize= (Math.floor(total/100))+1;
	  if(rangeSize>5)
	  {
		  rangeSize=5
	  }
	  else
	  {
		  rangeSize=rangeSize;
	  }
	
   // var rangeSize = 5;
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

    
  })
.filter('offset', function() {
  return function(input, start) {	 
   if (!input || !input.length) { return; }
        start = +start; //parse to int
        return input.slice(start);
  };
})

.filter('myfilter',function(){
	return function(items,search)
	{
		var filtered = [];
		angular.forEach(items, function(item) 
		{
			var string=item.doc.term;
			if(string)
			{
				if( ((string.toLowerCase().indexOf(search)) !=-1) && (string.length!= search.length)) 
				{          
					filtered.push(item);
				}
			}
		});
		return filtered;
	}
})

.filter('newfilter',['Utils',function(Utils){
	return function(items,search)
	{
		var filtered = [];
		if(search)
		{
			angular.forEach(items, function(item) 
			{
				var string=item.doc.term;
				if(string)
				{
					string= string.replace("_","");
					string=Utils.dotUndersRevert(string);
					search=search.toLowerCase();
					search= search.replace("_","");
					search=Utils.dotUndersRevert(search);
					//if( ((string.toLowerCase().indexOf(search.toLowerCase())) !=-1) && item.doc.verify==1) 
					if( ((string.toLowerCase().indexOf(search.toLowerCase())) !=-1))					
					{          
						filtered.push(item);
					}
				}
			});
			
		}
		else
		{
			filtered= items;
		}
		
		return filtered;
	}
}])






