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
//===================Reload Page on route change===========================//
$rootScope.$on('$locationChangeStart', function($event, changeTo, changeFrom) {
      if (changeTo == changeFrom) {
        return;
      }
 
      window.location.assign(changeTo);
      window.location.reload(true);
    });
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
		else
		{
			$("#heading-term").html("");
		}
});
//Every checkboxes in the page
$('.checkbox input:checkbox').click(function() {
    $('.checkbox input:checkbox').not(this).prop('checked', false);
});  

$scope.checkVerifiedCheckBox=function()
{
	var field=document.getElementById('original');
	if (field.value == '') 
	{
        document.getElementById('verifiedCheckbox').checked=false;
    }
    else
    {
		document.getElementById('verifiedCheckbox').checked=true;
	}
	
}
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
		//===================Delete Record from the partial or whole word searches==========================//
        $scope.deletedoc = function(id,rev,items)
        {
			if($window.confirm('Are you SURE you want to delete?'))
			{
				$http.get('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev+'&include_docs=true').
				success(function(data, status, headers, config) 
				{
					$scope.editdata=data;
					document.getElementById("term").value=data.term;
					//==============First check the record being deleted is verified or not===============//
					if(data.verify==1)
					{
						//=============if verified record====================//
						//=============Get record's word family================//
						$scope.wholeWordMatches = $filter('wholeWordFilter')(items,data.term);
						var countVerify=0;
						angular.forEach($scope.wholeWordMatches,function(match)
						{
							if(match.doc._id!=id)
							{
								if(match.doc.verify==1)
								{
									countVerify++;
								}
							}
						});
						if(countVerify==1)
						{
							//===========if this is not alone verified record and more verified left============//
							$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev).
							success(function(data, status, headers, config) 
							{
								$("#spinner").show();
								$scope.message='Record Deleted Successfully';
								//================Unmark the family ambiguous======================//
								angular.forEach($scope.wholeWordMatches,function(match)
								{
									var updateid= match.doc._id;
									var revid= match.doc._rev;
									var updatedWordfamilyField=$scope.search.doc.term;
									updatedWordfamilyField= updatedWordfamilyField.replace("_","");	
									updatedWordfamilyField=Utils.dotUndersRevert(updatedWordfamilyField);
									if(match.doc.verify==1)
									{
										var verify=1;									
									}
									else
									{
										var verify=0;
									}
									var newdata= JSON.stringify
									({
										"source": match.doc.source,   
										"original": match.doc.original , 
										"definition": match.doc.definition, 
										"type": "term", 
										"user":  match.doc.user,
										"term":  match.doc.term,
										"ref": match.doc.ref,
										"wordfamily":updatedWordfamilyField,
										"verify":verify,
										"ambiguous":0
									});
									$http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+updateid+'?rev='+revid, newdata).
									success(function(newdata, status, headers, config) 
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
							}); 
						}
						else if(countVerify>=1)
						{
							//===========if this is not alone verified record and more verified left============//
							$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev).
							success(function(data, status, headers, config) 
							{
								$("#spinner").show();
								$scope.message='Record Deleted Successfully';
								//================mark the family ambiguous======================//
								angular.forEach($scope.wholeWordMatches,function(match)
								{
									var updateid= match.doc._id;
									var revid= match.doc._rev;
									var updatedWordfamilyField=$scope.search.doc.term;
									updatedWordfamilyField= updatedWordfamilyField.replace("_","");	
									updatedWordfamilyField=Utils.dotUndersRevert(updatedWordfamilyField);
									if(match.doc.verify==1)
									{
										var verify=1;									
									}
									else
									{
										var verify=0;
									}
									var newdata= JSON.stringify
									({
										"source": match.doc.source,   
										"original": match.doc.original , 
										"definition": match.doc.definition, 
										"type": "term", 
										"user":  match.doc.user,
										"term":  match.doc.term,
										"ref": match.doc.ref,
										"wordfamily":updatedWordfamilyField,
										"verify":verify,
										"ambiguous":1
									});
									$http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+updateid+'?rev='+revid, newdata).
									success(function(newdata, status, headers, config) 
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
							}); 							
						}
						else
						{
							//===============if this alone is verified=================//
							//===========if this is not alone verified record and more verified left============//
							$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev).
							success(function(data, status, headers, config) 
							{
								$("#spinner").show();
								$scope.message='Record Deleted Successfully';
							}).
							error(function(data, status, headers, config) 
							{
							}); 
						}
					}
					else
					{
						//=============if not a verified record====================//
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
				}).
				error(function(data, status, headers, config) {
				}); 			
			}
		}  
    
		//============================Delete data in the form=====================================//        
        $scope.deletedata = function() 
        {
			var id=document.getElementById("keyid").value;
			var rev=document.getElementById("keyrev").value; 
			if($window.confirm('Are you SURE you want to delete?'))
			{
				$http.get('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev+'&include_docs=true').
				success(function(data, status, headers, config) 
				{
					$scope.editdata=data;
					document.getElementById("term").value=data.term;
					//==============First check the record being deleted is verified or not===============//
					if(data.verify==1)
					{
						//=============if verified record====================//
						//=============Get record's word family================//
						$scope.wholeWordMatches = $filter('wholeWordFilter')(items,data.term);
						var countVerify=0;
						angular.forEach($scope.wholeWordMatches,function(match)
						{
							if(match.doc._id!=id)
							{
								if(match.doc.verify==1)
								{
									countVerify++;
								}
							}
						});
						if(countVerify==1)
						{
							//===========if this is not alone verified record and more verified left============//
							$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev).
							success(function(data, status, headers, config) 
							{
								$("#spinner").show();
								$scope.message='Record Deleted Successfully';
								//================Unmark the family ambiguous======================//
								angular.forEach($scope.wholeWordMatches,function(match)
								{
									var updateid= match.doc._id;
									var revid= match.doc._rev;
									var updatedWordfamilyField=$scope.search.doc.term;
									updatedWordfamilyField= updatedWordfamilyField.replace("_","");	
									updatedWordfamilyField=Utils.dotUndersRevert(updatedWordfamilyField);
									if(match.doc.verify==1)
									{
										var verify=1;									
									}
									else
									{
										var verify=0;
									}
									var newdata= JSON.stringify
									({
										"source": match.doc.source,   
										"original": match.doc.original , 
										"definition": match.doc.definition, 
										"type": "term", 
										"user":  match.doc.user,
										"term":  match.doc.term,
										"ref": match.doc.ref,
										"wordfamily":updatedWordfamilyField,
										"verify":verify,
										"ambiguous":0
									});
									$http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+updateid+'?rev='+revid, newdata).
									success(function(newdata, status, headers, config) 
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
							}); 
						}
						else if(countVerify>=1)
						{
							//===========if this is not alone verified record and more verified left============//
							$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev).
							success(function(data, status, headers, config) 
							{
								$("#spinner").show();
								$scope.message='Record Deleted Successfully';
								//================mark the family ambiguous======================//
								angular.forEach($scope.wholeWordMatches,function(match)
								{
									var updateid= match.doc._id;
									var revid= match.doc._rev;
									var updatedWordfamilyField=$scope.search.doc.term;
									updatedWordfamilyField= updatedWordfamilyField.replace("_","");	
									updatedWordfamilyField=Utils.dotUndersRevert(updatedWordfamilyField);
									if(match.doc.verify==1)
									{
										var verify=1;									
									}
									else
									{
										var verify=0;
									}
									var newdata= JSON.stringify
									({
										"source": match.doc.source,   
										"original": match.doc.original , 
										"definition": match.doc.definition, 
										"type": "term", 
										"user":  match.doc.user,
										"term":  match.doc.term,
										"ref": match.doc.ref,
										"wordfamily":updatedWordfamilyField,
										"verify":verify,
										"ambiguous":1
									});
									$http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+updateid+'?rev='+revid, newdata).
									success(function(newdata, status, headers, config) 
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
							}); 							
						}
						else
						{
							//===============if this alone is verified=================//
							//===========if this is not alone verified record and more verified left============//
							$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev).
							success(function(data, status, headers, config) 
							{
								$("#spinner").show();
								$scope.message='Record Deleted Successfully';
							}).
							error(function(data, status, headers, config) 
							{
							}); 
						}
					}
					else
					{
						//=============if not a verified record====================//
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
				}).
				error(function(data, status, headers, config) {
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
		 document.getElementById("toptext").innerHTML="Add:";
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
				document.getElementById("toptext").innerHTML="Edit:";	
				var refrenceArray=data.ref;
				if(sessionStorage.length!=0)
				{
					sessionStorage.clear();						
					
				}	
				$scope.testFunction();
			}).
			error(function(data, status, headers, config) {
			});   
			
		};
    
    //=====================================Add a new term===================================//
   $scope.adddata=function(items)
   {
		//===========Get all data of the record==================//
		var term=$scope.search.doc.term;
		var original=$scope.editdata.original;
		var refrence=$scope.editdata.ref;
		refrence=$scope.getUnique(refrence);
		var definition=$scope.editdata.definition;
		//var verified=$scope.verified;
		var verified=document.getElementById("verifiedCheckbox").checked;
		var ambiguous=$scope.ambiguous;
		var sessionArray= JSON.parse( localStorage.getItem("session-user"));
		var userName=sessionArray.username;	
		var wordfamilyField=$scope.search.doc.term;
		wordfamilyField= wordfamilyField.replace("_","");	
		wordfamilyField=Utils.dotUndersRevert(wordfamilyField);
		//==============Get its word family=======================//
		$scope.wholeWordMatches = $filter('wholeWordFilter')(items,term);
		if(verified)
		{
			//============If record being added is verified====================//
			var countVerify=0;
			//====Check if other records in the family are verified or not=====//
			angular.forEach($scope.wholeWordMatches,function(item)
			{
				if(item.doc.verify)
				{
					if(item.doc.verify==1)
					{
						countVerify++;
					}
				}
			});			
			//===============if other records in family are verified=================//
			if(countVerify>0)
			{
				var allRef=[];
				allRef.push(refrence);
				var termsMatch=0;
				//==============Check which other records have same term=================//
				angular.forEach($scope.wholeWordMatches,function(item)
				{
					var termCheck=item.doc.term;
					if(termCheck)
					{
						if((termCheck.indexOf(term))!=-1 && termCheck.length==term.length)
						{
							allRef.push(item.doc.ref);
							termsMatch++;
						}				
					}
				});
				if(termsMatch>0)
				{
					//============if any other verified term that matches the current term in the family===============//
					var allReferences=allRef.join();
					allReferences=$scope.getUnique(allReferences);
					var data= JSON.stringify
					({
						"source": userName,   
						"original":original , 
						"definition":definition, 
						"type": "term", 
						"user": userName,
						"term": term,
						"ref":allReferences,
						"wordfamily":wordfamilyField,
						"verify":1,
						"ambiguous":0
					});
					//================adding data record======================//
					if(confirm("Please Confirm the following Addition:"+data))
					{	
						$http.post('http://'+domainRemoteDb+'/'+remoteDb+'/', data).
						success(function(data, status, headers, config) 
						{
							console.log(status);
							$scope.message='Record Added Successfully';
							angular.forEach($scope.wholeWordMatches ,function(match)
							{
								//================deleting all other ambiguous records=================//
								$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+match.doc._id+'?rev='+match.doc._rev).
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
				else
				{
					//============if no other verified term that matches with the current term in the family===============//
					var data= JSON.stringify
					({
						"source": userName,   
						"original":original , 
						"definition":definition, 
						"type": "term", 
						"user": userName,
						"term": term,
						"ref":refrence,
						"wordfamily":wordfamilyField,
						"verify":1,
						"ambiguous":1
					});
					//================adding data record======================//
					if(confirm("Please Confirm the following Addition:"+data))
					{
						$http.post('http://'+domainRemoteDb+'/'+remoteDb+'/', data).
						success(function(data, status, headers, config) 
						{
							console.log(status);
							$scope.message='Record Added Successfully';
							//=============making all others ambiguous============//
							angular.forEach($scope.wholeWordMatches ,function(match)
							{
								var updateid= match.doc._id;
								var revid= match.doc._rev;
								var updatedWordfamilyField=$scope.search.doc.term;
								updatedWordfamilyField= updatedWordfamilyField.replace("_","");	
								updatedWordfamilyField=Utils.dotUndersRevert(updatedWordfamilyField);
								if(match.doc.verify==1)
								{
									var verify=1;									
								}
								else
								{
									var verify=0;
								}
								var newdata= JSON.stringify
								({
									"source": match.doc.source,   
									"original": match.doc.original , 
									"definition": match.doc.definition, 
									"type": "term", 
									"user":  match.doc.user,
									"term":  match.doc.term,
									"ref": match.doc.ref,
									"wordfamily":updatedWordfamilyField,
									"verify":verify,
									"ambiguous":1
								});
								$http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+updateid+'?rev='+revid, newdata).
								success(function(newdata, status, headers, config) 
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
			}
			else
			{
				//==============if other records in family are not verified===============//
				var allRef=[];
				allRef.push(refrence);
				//=====So here we will compress the family into one=======//
				angular.forEach($scope.wholeWordMatches,function(item)
				{
					if(item.doc.ref)
					{
						allRef.push(item.doc.ref);
					}
				});
				var allReferences=allRef.join();
				allReferences=$scope.getUnique(allReferences);
				var data= JSON.stringify
				({
					"source": userName,   
					"original":original , 
					"definition":definition, 
					"type": "term", 
					"user": userName,
					"term": term,
					"ref":allReferences,
					"wordfamily":wordfamilyField,
					"verify":1,
					"ambiguous":0
				});
				//================adding data record======================//
				if(confirm("Please Confirm the following Addition:"+data))
				{	
					$http.post('http://'+domainRemoteDb+'/'+remoteDb+'/', data).
					success(function(data, status, headers, config) 
					{
						console.log(status);
						$scope.message='Record Added Successfully';
						angular.forEach($scope.wholeWordMatches ,function(match)
						{
							//================deleting all other ambiguous records=================//
							$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+match.doc._id+'?rev='+match.doc._rev).
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
		}
		else
		{
			//============If record being added is not verified====================//
			var countVerify=0;
			//====Check if other records in the family are verified or not and how many verified=====//
			angular.forEach($scope.wholeWordMatches,function(item)
			{
				if(item.doc.verify)
				{
					if(item.doc.verify==1)
					{
						countVerify++;
					}
				}
			});	
			if(countVerify>=1)
			{
				//==========if exactly one record is verified================//
				var allRef=[];
				allRef.push(refrence);
				var termsMatch=0;
				//==============Check which other records have same term=================//
				angular.forEach($scope.wholeWordMatches,function(item)
				{
					var termCheck=item.doc.term;
					if(termCheck)
					{
						if((termCheck.indexOf(term))!=-1 && termCheck.length==term.length)
						{
							allRef.push(item.doc.ref);
							termsMatch++;
						}				
					}
				});
				if(termsMatch>0)
				{
					//====================if any term matches====================//
					//============if any other verified term in the family===============//
					var allReferences=allRef.join();
					allReferences=$scope.getUnique(allReferences);
					var data= JSON.stringify
					({
						"source": userName,   
						"original":original , 
						"definition":definition, 
						"type": "term", 
						"user": userName,
						"term": term,
						"ref":allReferences,
						"wordfamily":wordfamilyField,
						"verify":1,
						"ambiguous":0
					});	
					//================adding data record======================//
					if(confirm("Please Confirm the following Addition:"+data))
					{	
						$http.post('http://'+domainRemoteDb+'/'+remoteDb+'/', data).
						success(function(data, status, headers, config) 
						{
							console.log(status);
							$scope.message='Record Added Successfully';
							angular.forEach($scope.wholeWordMatches ,function(match)
							{
								//================deleting all other ambiguous records=================//
								$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+match.doc._id+'?rev='+match.doc._rev).
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
				else
				{
					//====================if no term matches====================//
					alert("The term you are trying to add does not match with any of the existing verified spellings and will not be saved unless spelling is verified.");
				}
			}
			//~ else if(countVerify>1)
			//~ {
				//~ //==========if more than one record is verified================//
			//~ }
			else
			{
				//==========if no other record is verified================//
				var data= JSON.stringify
					({
						"source": userName,   
						"original":original , 
						"definition":definition, 
						"type": "term", 
						"user": userName,
						"term": term,
						"ref":refrence,
						"wordfamily":wordfamilyField,
						"verify":0,
						"ambiguous":0
					});	
				//================adding data record======================//
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
						
		}		
   }
   //=============================Updating records======================================//
    $scope.updatedata=function(items)
    {   
		//===========Get all data of the record==================//
		var id=document.getElementById("keyid").value;
		var rev=document.getElementById("keyrev").value;
		var searchTerm=$scope.search.doc.term;
		var term=document.getElementById("term").value;
		var original=$scope.editdata.original;
		var refrence=$scope.editdata.ref;
		refrence=$scope.getUnique(refrence);
		var definition=$scope.editdata.definition;
		//var verified=$scope.verified;
		var verified=document.getElementById("verifiedCheckbox").checked;
		var ambiguous=$scope.ambiguous;
		var wordfamilyField=$scope.search.doc.term;
		wordfamilyField= wordfamilyField.replace("_","");	
		wordfamilyField=Utils.dotUndersRevert(wordfamilyField);
		var sessionArray= JSON.parse( localStorage.getItem("session-user"));
		var userName=sessionArray.username;		
		//==============Get its word family=======================//
		$scope.wholeWordMatches = $filter('wholeWordFilter')(items,term);
		if(verified)
		{
			//============If record being added is verified====================//
			var countVerify=0;
			//====Check if other records in the family are verified or not=====//
			angular.forEach($scope.wholeWordMatches,function(item)
			{
				if(item.doc._id!=id)
				{
					if(item.doc.verify)
					{
						if(item.doc.verify==1)
						{
							countVerify++;
						}
					}
				}				
			});	
			if(countVerify>0)
			{
				//===============if other records in family are verified=================//
				var allRef=[];
				allRef.push(refrence);
				var termsMatch=0;
				//==============Check which other records have same term=================//
				angular.forEach($scope.wholeWordMatches,function(item)
				{
					var termCheck=item.doc.term;
					if(item.doc._id!=id)
					{
						if(termCheck)
						{
							if((termCheck.indexOf(term))!=-1 && termCheck.length==term.length)
							{
								allRef.push(item.doc.ref);
								termsMatch++;
							}				
						}
					}
				});
				if(termsMatch>0)
				{
					//============if any other verified term in the family===============//
					var allReferences=allRef.join();
					allReferences=$scope.getUnique(allReferences);
					var data= JSON.stringify
					({
						"source": userName,   
						"original":original , 
						"definition":definition, 
						"type": "term", 
						"user": userName,
						"term": term,
						"ref":allReferences,
						"wordfamily":wordfamilyField,
						"verify":1,
						"ambiguous":0
					});
					//================Updating data record======================//
					if(confirm("Please Confirm the following Updation:"+data))
					{
						$http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev, data).
						success(function(data, status, headers, config) 
						{
							console.log(status);
							$scope.message='Record Added Successfully';
							angular.forEach($scope.wholeWordMatches ,function(match)
							{
								if(match.doc._id!=id)
								{
									//================deleting all other ambiguous records=================//
									$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+match.doc._id+'?rev='+match.doc._rev).
									success(function(data, status, headers, config) 
									{
										console.log(status);
									}).
									error(function(data, status, headers, config) 
									{
										console.log(status);
									});
								}
							});	
											
						}).
						error(function(data, status, headers, config) 
						{
							console.log(status);
							$scope.message='Error Updating record';
						});
					}
				}
				else
				{
					//============if no other verified term in the family===============//
					var data= JSON.stringify
					({
						"source": userName,   
						"original":original , 
						"definition":definition, 
						"type": "term", 
						"user": userName,
						"term": term,
						"ref":refrence,
						"wordfamily":wordfamilyField,
						"verify":1,
						"ambiguous":1
					});
					//================adding data record======================//
					if(confirm("Please Confirm the following Addition:"+data))
					{
						$http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev, data).
						success(function(data, status, headers, config) 
						{
							console.log(status);
							$scope.message='Record Added Successfully';
							//=============making all others ambiguous============//
							angular.forEach($scope.wholeWordMatches ,function(match)
							{
								var updateid= match.doc._id;
								var revid= match.doc._rev;
								var updatedWordfamilyField=$scope.search.doc.term;
								updatedWordfamilyField= updatedWordfamilyField.replace("_","");	
								updatedWordfamilyField=Utils.dotUndersRevert(updatedWordfamilyField);
								if(match.doc.verify==1)
								{
									var verify=1;									
								}
								else
								{
									var verify=0;
								}
								var newdata= JSON.stringify
								({
									"source": match.doc.source,   
									"original": match.doc.original , 
									"definition": match.doc.definition, 
									"type": "term", 
									"user":  match.doc.user,
									"term":  match.doc.term,
									"ref": match.doc.ref,
									"wordfamily":updatedWordfamilyField,
									"verify":verify,
									"ambiguous":1
								});
								$http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+updateid+'?rev='+revid, newdata).
								success(function(newdata, status, headers, config) 
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
			}
			else
			{
				
				//==============if other records in family are not verified===============//
				var allRef=[];
				allRef.push(refrence);
				//=====So here we will compress the family into one=======//
				angular.forEach($scope.wholeWordMatches,function(item)
				{
					if(item.doc._id!=id)
					{
						if(item.doc.ref)
						{
							allRef.push(item.doc.ref);
						}
					}
				});
				var allReferences=allRef.join();
				allReferences=$scope.getUnique(allReferences);
				var data= JSON.stringify
				({
					"source": userName,   
					"original":original , 
					"definition":definition, 
					"type": "term", 
					"user": userName,
					"term": term,
					"ref":allReferences,
					"wordfamily":wordfamilyField,
					"verify":1,
					"ambiguous":0
				});
				//================adding data record======================//
				if(confirm("Please Confirm the following Addition:"+data))
				{	
					$http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev, data).
					success(function(data, status, headers, config) 
					{
						console.log(status);
						$scope.message='Record Added Successfully';
						angular.forEach($scope.wholeWordMatches ,function(match)
						{
							if(match.doc._id!=id)
							{
								//================deleting all other ambiguous records=================//
								$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+match.doc._id+'?rev='+match.doc._rev).
								success(function(data, status, headers, config) 
								{
									console.log(status);
								}).
								error(function(data, status, headers, config) 
								{
									console.log(status);
								});
							}							
						});	
										
					}).
					error(function(data, status, headers, config) 
					{
						console.log(status);
						$scope.message='Error Adding record';
					});
				}
			}
		}
		else
		{
			//============If record being added is not verified====================//
			var countVerify=0;
			//====Check if other records in the family are verified or not and how many verified=====//
			angular.forEach($scope.wholeWordMatches,function(item)
			{
				if(item.doc._id!=id)
				{
					if(item.doc.verify)
					{
						if(item.doc.verify==1)
						{
							countVerify++;
						}
					}
				}				
			});	
			if(countVerify>=1)
			{
				//==========if exactly one record is verified================//
				var allRef=[];
				allRef.push(refrence);
				var termsMatch=0;
				//==============Check which other records have same term=================//
				angular.forEach($scope.wholeWordMatches,function(item)
				{
					var termCheck=item.doc.term;
					if(item.doc._id!=id)
					{
						if(termCheck)
						{
							if((termCheck.indexOf(term))!=-1 && termCheck.length==term.length)
							{
								allRef.push(item.doc.ref);
								termsMatch++;
							}				
						}
					}
				});
				if(termsMatch>0)
				{
					//====================if any term matches====================//
					//============if any other verified term in the family===============//
					var allReferences=allRef.join();
					allReferences=$scope.getUnique(allReferences);
					var data= JSON.stringify
					({
						"source": userName,   
						"original":original , 
						"definition":definition, 
						"type": "term", 
						"user": userName,
						"term": term,
						"ref":allReferences,
						"wordfamily":wordfamilyField,
						"verify":1,
						"ambiguous":0
					});	
					//================adding data record======================//
					if(confirm("Please Confirm the following Addition:"+data))
					{	
						$http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev, data).
						success(function(data, status, headers, config) 
						{
							console.log(status);
							$scope.message='Record Added Successfully';
							angular.forEach($scope.wholeWordMatches ,function(match)
							{
								if(match.doc._id!=id)
								{
									//================deleting all other ambiguous records=================//
									$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+match.doc._id+'?rev='+match.doc._rev).
									success(function(data, status, headers, config) 
									{
										console.log(status);
									}).
									error(function(data, status, headers, config) 
									{
										console.log(status);
									});
								}
							});	
											
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
					//====================if no term matches====================//
					alert("The term you are trying to add does not match with any of the existing verified spellings and will not be saved unless spelling is verified.");
				}
			}
			//~ else if(countVerify>1)
			//~ {
				//~ //==========if more than one record is verified================//
			//~ }
			else
			{
				//==========if no other record is verified================//
				var data= JSON.stringify
					({
						"source": userName,   
						"original":original , 
						"definition":definition, 
						"type": "term", 
						"user": userName,
						"term": term,
						"ref":refrence,
						"wordfamily":wordfamilyField,
						"verify":0,
						"ambiguous":0
					});	
				//================adding data record======================//
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
		}
		$scope.allDocsFunc();
	}
    
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
				string=string.toLowerCase();	
				string=Utils.dotUndersRevert(string);		
				if( ((string.indexOf(key)) !=-1) && (string.length== key.length)) 
				{    	
					filtered.push(item.doc);
				}				
			}
			
		});
		$scope.filterresult = filtered;
		$scope.viewkey=key;
		$("span[id^='sideIcon-']").addClass("glyphicon glyphicon-play mr5 openPanel");
		 document.getElementById("sideIcon-"+key).className = "glyphicon glyphicon-chevron-down mr5 openPanel";
		 document.getElementById("showDiv-"+key).style.display='block';
		 
	}
	$scope.getUnique = function(arrayNew)
	{
		var u = {}, a = [];   
		var refArr=arrayNew.split(",");
			for(var i = 0, l = refArr.length; i < l; ++i){
      if(u.hasOwnProperty(refArr[i])) {
         continue;
      }
      a.push(refArr[i]);
      u[refArr[i]] = 1;
   }
   var aString=a.join()
   return aString;
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
				string=string.toLowerCase();	
				string=Utils.dotUndersRevert(string);		
				search=search.toLowerCase();
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
						string=string.toLowerCase();		
						if( ((string.indexOf(key)) !=-1) && (string.length== key.length)) 
						{   
								filtered.push(item); 
								return false;
						}				
					}
					else
					{
						var string=item.doc.term;
						if(string)
						{
							string= string.replace("_","");
							string=Utils.dotUndersRevert(string);
							string=string.toLowerCase();	
							if( ((string.indexOf(key)) !=-1) && (string.length== key.length)) 
							{    
									filtered.push(item); 
									return false;
							}
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
				string=string.toLowerCase();	
				string=Utils.dotUndersRevert(string);		
				search=search.toLowerCase();
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
				string=string.toLowerCase();	
				string=Utils.dotUndersRevert(string);		
				search=search.toLowerCase();
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
