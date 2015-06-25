'use strict';

/**
 * @ngdoc function
 * @name accentsApp.controller:getdataCtrl
 * @description
 * # getdataCtrl
 * Controller of the accentsApp
 */
angular.module('accentsApp')
  .controller('getdataCtrl', function ($rootScope,$scope,$http,getRecords,$window,$filter,myConfig,Utils,$sce,docData) {
	  
  $scope.docs={};
  $scope.filterresult={};
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
 $scope.dotUnderRevert=function(text)
 {
	 return Utils.dotUndersRevert(text);
 }
 //============On key up of the term textbox change the term=========//
 $( "#term" ).keyup(function() {
	 var term = $('#term').val();	 
	 if(term!="")
		{
			var changedTerm=$scope.customi2html(term);
			$("#term").val(changedTerm);
			$("#heading-term").html(Utils.ilm2HTML(changedTerm));
		}
});
//Every checkboxes in the page
$('.checkbox input:checkbox').click(function() {
    $('.checkbox input:checkbox').not(this).prop('checked', false);
});  


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
       // alert(sessionStorage.list);
   if(sessionStorage.length!=0)
     {
		 var arrayDoc=JSON.parse(docData.getFormData());
		 var id=JSON.stringify(arrayDoc[0]['id']);
		 id=id.replace(/"/g,'');
		 var rev=JSON.stringify(arrayDoc[1]['rev']);
		 rev=rev.replace(/"/g,'');
		 setTimeout(function(){$scope.editdoc(id,rev)},1000);   
	 } 
	 $scope.testFunction=function()
	 {
		var term = $('#term').val();
		if(term!="")
		{
			var changedTerm=$scope.customi2html(term);
			$("#term").val(changedTerm);
			$("#heading-term").html(Utils.ilm2HTML(changedTerm));
		}
		setTimeout(function(){
			$("#term").trigger("change");
		},100);
	 }; 
	 //===============All docs function======================//
	 $scope.allDocsFunc=function()
	 {
		 $http.get('http://'+domainRemoteDb+'/'+remoteDb+'/_all_docs?include_docs=true')
		.success(function(data) 
		{
			if(data.rows)
			{		
				$scope.docs=data.rows;
				$scope.count=data.total_rows;
			}	
		})
		.error(function(error) 
		{
			console.log(error);
		});
	 };
         //////////////////////////Delete data/////////////////////////////////////        
        $scope.deletedoc = function(id,rev)
        {
			if($window.confirm('Are you SURE you want to delete?'))
			{		
				$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev).
				success(function(data, status, headers, config) 
				{
					$("#spinner").show();
					$scope.message='Record Deleted Successfully';
					$http.get('http://'+domainRemoteDb+'/'+remoteDb+'/_all_docs?include_docs=true')
					.success(function(data) 
					{
						if(data.rows)
						{		
							$scope.docs=data.rows;
							$scope.count=data.total_rows;
							$('div[id^="showDiv-"]').hide();
						}	
					})
					.error(function(error) 
					{
						console.log(error);
					});
				}).
				error(function(data, status, headers, config) 
				{
					$scope.message='Error Deleting Record';
				});   
			}  
		};   
    
		//////////////////////////Delete data in the form/////////////////////////////////////        
        $scope.deletedata = function() 
        {
			var id=document.getElementById("keyid").value;
			var rev=document.getElementById("keyrev").value; 
			if($window.confirm('Are you SURE you want to delete?'))
			{	
				$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev).
				success(function(data, status, headers, config)
				{
					document.getElementById("addform").reset();
					$scope.message='Record Deleted Successfully';
					$http.get('http://'+domainRemoteDb+'/'+remoteDb+'/_all_docs?include_docs=true')
					.success(function(data) 
					{
						if(data.rows)
						{
							$scope.docs=data.rows;
							$scope.count=data.total_rows;
							$('div[id^="showDiv-"]').hide();
						}	
					})
					.error(function(error) 
					{
						console.log(error);
					});
				}).
				error(function(data, status, headers, config) 
				{			
					alert(status);
				});   
			}        
		};
    
     //////////////////////////Cancel update data in the form/////////////////////////////////////
        
        $scope.cancelUpdate = function() {
			$scope.search.doc.term="";
			document.getElementById("keyid").value="";
			document.getElementById("keyrev").value="";
			document.getElementById("addform").reset();
		$scope.addState();
		$scope.docs=[];
		$http.get('http://'+domainRemoteDb+'/'+remoteDb+'/_all_docs?include_docs=true')
				.success(function(data) 
				{			
					if(data.rows)
					{
						console.log(data.rows.doc);
						$scope.docs=data.rows;
						$scope.count=data.total_rows;
					}	
											
				})
				.error(function(error) 
				{
					console.log(error);
				});
        
    };
    
     $scope.addState = function() {
		 document.getElementById("toptext").innerHTML="Term Add";
		  document.getElementById("heading-term").innerHTML="";
		
			$('#Button2').css({ "display":"none" });
			$('#Button3').css({ "display":"none" });	
			$('#updateword').css({ "display":"none" });
			$('#addword').css({ "display":"block" });
	 };
      //////////////////////////single record data/////////////////////////////////////
        
		$scope.editdoc = function(id,rev) 
		{			
			$http.get('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev+'&include_docs=true').
			success(function(data, status, headers, config) 
			{
				$scope.editdata=data;
				document.getElementById("term").value=data.term;
				document.getElementById("keyid").value=data._id;
				document.getElementById("keyrev").value=data._rev;
				$('#addword').css({ "display":"none" });
				$('#Button2').css({ "display":"block" });
				//$( "#Button2" ).attr( "ng-click", "deletedata('"+id+"','"+rev+"');" );
				$('#Button3').css({ "display":"block" });
				$('#updateword').css({ "display":"block" });
				document.getElementById("toptext").innerHTML="Term Edit";	
				if(sessionStorage.length!=0)
				{
					sessionStorage.clear();						
					$scope.testFunction();
				}	
			}).
			error(function(data, status, headers, config) {
			});   
			
		};
    
    //=====================================Add a new term===================================//
   $scope.adddata=function(items)
   {
		var term=$scope.search.doc.term;
		var original=$scope.editdata.original;
		var refrence=$scope.editdata.ref;
		var definition=$scope.editdata.definition;
		var verified=$scope.verified;
		var ambiguous=$scope.ambiguous;
		//FILTER FOR WHOLE WORD MATCHES
		$scope.wholeWordMatches = $filter('wholeWordFilter')(items,term);
		var sessionArray= JSON.parse( localStorage.getItem("session-user"));
		var userName=sessionArray.username;		
		if(verified)
		{
			var additemverify="1";
			var allRef=[];
			var matchTerms=[];
			allRef.push(refrence);
			angular.forEach($scope.wholeWordMatches ,function(match)
			{
				var z = ({"id":match.doc._id,"rev":match.doc._rev});
				allRef.push(match.doc.ref);
				matchTerms.push(z);
			});	
			var allReferences=allRef.join();
			var data= JSON.stringify
			({
				"source": userName,   
				"original":original , 
				"definition":definition, 
				"type": "term", 
				"user": userName,
				"term": term,
				"ref":allReferences,
				"verify":additemverify
			});
			
			if(confirm("Please Confirm the following Addition:"+data))
			{	
				$http.post('http://'+domainRemoteDb+'/'+remoteDb+'/', data).
				success(function(data, status, headers, config) 
				{
					console.log(status);
					$scope.message='Record Added Successfully';
					angular.forEach(matchTerms ,function(match)
					{
						$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+match.id+'?rev='+match.rev).
						success(function(data, status, headers, config) 
						{
							console.log(status);
						}).
						error(function(data, status, headers, config) 
						{
							console.log(status);
						});
					});					
				}).
				error(function(data, status, headers, config) 
				{
					console.log(status);
					$scope.message='Error Adding record';
				});
			}	
		}
		else if(ambiguous)
		{
			var additemverify="0";
			var otheritemverify="0";
			var data= JSON.stringify
			({
				"source": userName,   
				"original":original , 
				"definition":definition, 
				"type": "term", 
				"user": userName,
				"term": term,
				"ref":refrence,
				"verify":additemverify
			});
			
			if(confirm("Please Confirm the following Addition:"+data))
			{	
				$http.post('http://'+domainRemoteDb+'/'+remoteDb+'/', data).
				success(function(data, status, headers, config) 
				{
					console.log(status);
					$scope.message='Record Added Successfully';
					//update all other items 
				    for(var i = 0; i< $scope.wholeWordMatches.length; i++)
					{	
						console.log($scope.wholeWordMatches[i].doc.original);
						var id=$scope.wholeWordMatches[i].id;
						var rev=$scope.wholeWordMatches[i].doc._rev;
						var data= JSON.stringify
						({
						   "source": userName,   
						   "original":$scope.wholeWordMatches[i].doc.original , 
						   "definition":$scope.wholeWordMatches[i].doc.definition, 
						   "type": "term", 
						   "user": userName,
						   "term": $scope.wholeWordMatches[i].doc.term,
						   "ref":  $scope.wholeWordMatches[i].doc.ref,
						   "verify":otheritemverify
						});
						$http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev, data).
						success(function(data, status, headers, config) 
						{
							console.log(status);
							$scope.message='Record Added Successfully';
						}).
						error(function(data, status, headers, config) 
						{
							console.log(status);
							$scope.message='Error adding record';
						});
						
					}		
				}).
				error(function(data, status, headers, config) 
				{
					console.log(status);
					$scope.message='Error Adding record';
				});
			}
		}
		else
		{
			var additemverify="0";
			var otheritemverify="0";
			var data= JSON.stringify
			({
				"source": userName,   
				"original":original , 
				"definition":definition, 
				"type": "term", 
				"user": userName,
				"term": term,
				"ref":refrence,
				"verify":additemverify
			});
			
			if(confirm("Please Confirm the following Addition:"+data))
			{	
				$http.post('http://'+domainRemoteDb+'/'+remoteDb+'/', data).
				success(function(data, status, headers, config) 
				{
					console.log(status);
					$scope.message='Record Added Successfully';							
				}).
				error(function(data, status, headers, config) 
				{
					console.log(status);
					$scope.message='Error Adding record';
				});
			}
			
		}
   };
   //////////////////////////Update data/////////////////////////////////////

    $scope.updatedata=function(items){
	var id=document.getElementById("keyid").value;
	var rev=document.getElementById("keyrev").value;
	var searchTerm=$scope.search.doc.term;
	var term=document.getElementById("term").value;
    var  original=$scope.editdata.original;
    var refrence=$scope.editdata.ref;
    var definition=$scope.editdata.definition;
    var verified=$scope.verified;
    var ambiguous=$scope.ambiguous;
    var additemverify="0";
	var otheritemverify="0";
    if(verified)
    {
		var additemverify="1";
		var otheritemverify="0";
	}
	if(ambiguous)
    {
		var additemverify="1";
		var otheritemverify="1";
	}
	var sessionArray= JSON.parse( localStorage.getItem("session-user"));
	var userName=sessionArray.username;
    var data= JSON.stringify(
								{
									"source": userName,   
									"original":original , 
									"definition":definition, 
									"type": "term", 
									"user": userName,
									"term": term,
									"ref":refrence,
									"verify":additemverify
								}
							);   
	//FILTER FOR PARTIAL RECORDS
    $scope.partialitems = $filter('myfilterData')(items,searchTerm);
    //FILTER FOR EXACT RECORDS
    $scope.exactitems = $filter('filter',true)(items,{doc: {term: searchTerm}});
    $scope.filteredItems =  $scope.partialitems.concat($scope.exactitems);
    var uniqueid=[];
    $scope.finalItems=[];
    for(var i = 0; i< $scope.filteredItems.length; i++)
    {  
		if($scope.filteredItems[i].id!=id)
		{
			if((uniqueid.indexOf($scope.filteredItems[i].id) === -1))
			{
				uniqueid.push($scope.filteredItems[i].id); 
				$scope.finalItems.push($scope.filteredItems[i]);       
			}        
		}
	}
    //console.log(JSON.stringify($scope.finalItems));  
     if(confirm("Please Confirm the following updation:"+data))
     {
		$http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev, data).
		success(function(data, status, headers, config) 
		{
			 for(var i = 0; i< $scope.finalItems.length; i++)
			{
			  var id=$scope.finalItems[i].id;
			  var rev=$scope.finalItems[i].doc._rev;
			  var data= JSON.stringify
			   ({
						   "source": userName,   
						   "original":$scope.finalItems[i].doc.original , 
						   "definition":$scope.finalItems[i].doc.definition, 
						   "type": "term", 
						   "user": userName,
						   "term": $scope.finalItems[i].doc.term,
						   "ref":  $scope.finalItems[i].doc.ref,
						   "verify":otheritemverify
						});
						
						$http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev, data).
						success(function(data, status, headers, config) 
						{
							$scope.message='Record Updated Successfully';
							//document.getElementById("addform").reset();
				//$scope.addState();
				//$scope.docs=[];
				$http.get('http://'+domainRemoteDb+'/'+remoteDb+'/_all_docs?include_docs=true')
					.success(function(data) 
					{		
						console.log('called');	
						if(data.rows)
						{
							$scope.docs=data.rows;
							$scope.count=data.total_rows;
						}	
												
					})
					.error(function(error) 
					{
						console.log(error);
					});							
						}).
						error(function(data, status, headers, config) 
						{
							console.log(status);
							$scope.message='Error updating record';
						});
				
				}

				
		}).
		error(function(data, status, headers, config) 
		{
			console.log(status);
		});
	}
	else
	{
		return false;
	}
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
    $scope.getAllRecords=function(key,docs){
		var filtered=new Array();
		angular.forEach(docs, function(item) 
		{
			var string=item.doc.term;
			if(string)
			{
				string= string.replace("_","");
				//string=string.toLowerCase();	
				string=Utils.dotUndersRevert(string);		
				if( ((string.indexOf(key)) !=-1) && (string.length== key.length)) 
				{    	
					filtered.push(item.doc);
				}				
			}
			
		});
		$scope.filterresult = filtered;
		$scope.viewkey=key;
		 document.getElementById("sideIcon").className = "glyphicon glyphicon-chevron-down mr5 openPanel";
		 document.getElementById("showDiv-"+key).style.display='block';
		 
	}
  })
.filter('singlegroupFilter',['Utils',function(Utils){
	return function(items,search)
	{
		var subArray=[];
		var filtered = [];
		var mainArray={};
		var count=1;
		var wordFamily=[];
		
		angular.forEach(items, function(item) 
		{
			var string=item.doc.term;
			if(string)
			{
				string= string.replace("_","");
				//string=string.toLowerCase();	
				string=Utils.dotUndersRevert(string);		
				//search=search.toLowerCase();
				search= search.replace("_","");
				search=Utils.dotUndersRevert(search);	
				if( ((string.indexOf(search)) !=-1) && (string.length!= search.length)) 
				{    	
					if(string in mainArray)
					{
						var countnew=mainArray[string];	
						countnew++;
						mainArray[string]=countnew;	
					}
					else
					{
						count=1;
						mainArray[string]=count;
						
					}	
				}				
			}
		});
		angular.forEach(mainArray,function(value,key)
		{
			if(value==1)
			{
				angular.forEach(items, function(item) 
				{
					var string=item.doc.wordfamily;
					if(string)
					{
							
						if( ((string.indexOf(key)) !=-1) && (string.length== key.length)) 
						{   
								filtered.push(item); 
								return false;
						}				
					}
					else
					{
						var string=item.doc.term;
						string= string.replace("_","");
						string=Utils.dotUndersRevert(string);
						if( ((string.indexOf(key)) !=-1) && (string.length== key.length)) 
						{    
								filtered.push(item); 
								return false;
						}
					}
				});
			}
			
		});
		return filtered;
	};
	}])
.filter('offset', function() {
  return function(input, start) {	 
   if (!input || !input.length) { return; }
        start = +start; //parse to int
        return input.slice(start);
  };
})

.filter('myfilterData',['Utils',function(Utils){
	return function(items,search)
	{
		var subArray={};
		var filtered = [];
		var mainArray={};
		var count=1;
		
		angular.forEach(items, function(item) 
		{
			var string=item.doc.term;
			if(string)
			{
				string= string.replace("_","");
				//string=string.toLowerCase();	
				string=Utils.dotUndersRevert(string);	
				if(search)
				{
				//	search=search.toLowerCase();
					search= search.replace("_","");
					search=Utils.dotUndersRevert(search);	
					if( ((string.indexOf(search)) !=-1) && (string.length!= search.length)) 
					{ 
						filtered.push(item);
					}				
				}	

			}
		});
		
		return filtered;
	};
	
}])
.filter('wholeWordFilter',['Utils',function(Utils){
	return function(items,search)
	{
		var filtered = [];
		angular.forEach(items, function(item) 
		{
			var string=item.doc.term;
			if(string)
			{
				string= string.replace("_","");
				//string=string.toLowerCase();	
				string=Utils.dotUndersRevert(string);		
				//search=search.toLowerCase();
				search= search.replace("_","");
				search=Utils.dotUndersRevert(search);	
				if( ((string.indexOf(search)) !=-1) && (string.length== search.length)) 
				{  
					filtered.push(item);
				}				
			}
		});
		return filtered;
	}
}])
.filter('groupfilter',['Utils',function(Utils){
	return function(items,search)
	{
		var subArray={};
		var filtered = [];
		var mainArray={};
		var count=1;
		
		angular.forEach(items, function(item) 
		{
			var string=item.doc.term;
			if(string)
			{
				string= string.replace("_","");
				//string=string.toLowerCase();	
				string=Utils.dotUndersRevert(string);		
				//search=search.toLowerCase();
				search= search.replace("_","");
				search=Utils.dotUndersRevert(search);	
				if( ((string.indexOf(search)) !=-1) && (string.length!= search.length)) 
				{    	
					if(string in mainArray)
					{
						var countnew=mainArray[string];	
						countnew++;
						mainArray[string]=countnew;	
					}
					else
					{
						count=1;
						mainArray[string]=count;
					}	
				}				
			}
		});
		//console.log(mainArray);
		return mainArray;
	};
	
}])
.filter('groupfiltercount',['Utils',function(Utils){
	return function(items,search)
	{
		var subArray={};
		var filtered = [];
		var mainArray={};
		var count=1;
		
		angular.forEach(items, function(item) 
		{
			var string=item.doc.term;
			if(string)
			{
				string= string.replace("_","");
				//string=string.toLowerCase();	
				string=Utils.dotUndersRevert(string);		
				//search=search.toLowerCase();
				search= search.replace("_","");
				search=Utils.dotUndersRevert(search);	
				if( ((string.indexOf(search)) !=-1) && (string.length!= search.length)) 
				{    	
					if(string in mainArray)
					{
						var countnew=mainArray[string];	
						countnew++;
						mainArray[string]=countnew;	
					}
					else
					{
						count=1;
						mainArray[string]=count;
					}	
				}				
			}
		});
		var sum=0;
		angular.forEach(mainArray,function(it)
		{
			sum=sum+it;
		});
		return sum;
	};
	
}])
.filter('newfilter',function(){
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
					if( ((string.toLowerCase().indexOf(search.toLowerCase())) !=-1) && item.doc.verify==1) 
					{          
						filtered.push(item);
					}
				}
			});
			return filtered;
		}
		else
		{
			return items;
		}
	}
})
.controller("PaginationCtrl", function($scope) {

  $scope.itemsPerPage = 10;
  $scope.currentPage = 0;
  $scope.items = [];
  $scope.totalRows=5334;
  
  for (var i=0; i<$scope.totalRows; i++) {
	
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
