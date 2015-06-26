'use strict';

/**
 * @ngdoc function
 * @name accentsApp.controller:SettingsCtrl
 * @description
 * # SettingsCtrl
 * Controller of the accentsApp
 */
angular.module('accentsApp')
  .controller('SettingsCtrl', function ($scope,$http,getRecords,$window,$filter,myConfig,Utils,$sce,docData) {
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
 //=========Pass document data to edit page=================//
 $scope.editdocPage=function(docid,rev)
 {
	 //alert(docid+rev);
	 var list=[{"id":docid},{"rev":rev}];
	 docData.setFormData(list);
	 window.location.href="http://localhost:9000/#/getdata";
 };
	//////////////////////////Fetch  data/////////////////////////////////////
	// $scope.getAllData = function() {
	$("#spinner").show();
	getRecords.getAllData()
	.success(function(data) 
	{			
		if(data.rows)
		{		
			$scope.docs=data.rows;
			$scope.count=data.total_rows;
			$("#spinner").hide();
			$(".pagination").css("display","block");
		}	          
	})     
 //==========Change the verified field to 1 for all the records with original field value==========//
 $scope.changeVerify=function(alldocs){
	  angular.forEach(alldocs, function(docs) {
		  if(docs.doc.original!="" && docs.doc.original)
		  {
			var id=docs.id;
			console.log(id);
			var rev=docs.doc._rev;
			 var data= JSON.stringify
			   ({
				   "source": "Swarandeep",   
				   "original":docs.doc.original , 
				   "definition":docs.doc.definition, 
				   "type": "term", 
				   "user": "Swarandeep",
				   "term": docs.doc.term,
				   "ref":  docs.doc.ref,
				   "verify":"1"
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
					$scope.message='Records Updated Successfully';
				});
				 
		  }
		  else
		  {
			console.log(docs.id+"no original");
		  }
    });
    $scope.setAmbiguous(alldocs);
 };
 
 
 //===================Delete Duplicate Records================//
 $scope.deleteDuplicate=function(alldocs){
	 angular.forEach(alldocs, function(docs) {		
		 angular.forEach(alldocs,function(doc)
		 {
		  if(doc.doc.term==docs.doc.term && doc.doc.original==docs.doc.original && doc.doc.definition==docs.doc.definition && doc.doc.source==docs.doc.source)
		  {
				if(doc.doc.verify && doc.doc.verify=="1")
				{
					var id=docs.id;
					var rev=docs.doc._rev;
				}
				else
				{
					var id=doc.id; 
					var rev=doc.doc._rev;
				}
				//console.log(id);
				$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev).
				success(function(data, status, headers, config) 
				{
					//$("#spinner").show();
					$scope.message='Records Deleted Successfully';					
				}).
				error(function(data, status, headers, config) 
				{
					$scope.message='Error Deleting Record';
				});
				
		  }
		});
		
	 });
	 $scope.addFamilyField(alldocs);
	 $scope.removeUnusedData(alldocs);
 };
	//==================For slide toggle of help divs====================//
	$scope.slideShow=function(calledId)
	{
		$( "#"+calledId ).slideToggle( "3000" );
	}
	//==================For add family field in the docs====================//
	$scope.addFamilyField=function(items)
	{
		var filtered = [];
		angular.forEach(items, function(item) 
		{
			var string=item.doc.term;
			if(string)
			{
				string= string.replace("_","");	
				string=Utils.dotUndersRevert(string);
				var id=item.doc._id;
				var rev=item.doc._rev;
				var original=item.doc.original;
				var definition=item.doc.definition;
				var term=item.doc.term;
				var refrence=item.doc.ref;
				var additemverify=item.doc.verify;
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
												"verify":additemverify,
												"wordfamily":string
											}
										); 
				$http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev, data).
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
	}
	//==================SET EACH RECORD IN A WORD FAMILY GROUP TO AMBIGUOUS IF MORE THAN ONE VERIFIED OR IF NONE===============//
	$scope.setAmbiguous=function(docs)
	{
		var groupFamily={};
		var count=1;
		console.log('calledhere');
		angular.forEach(docs,function(doc)
		{
			var family=doc.doc.wordfamily; 
			if(family in groupFamily)
			{
				var countnew=groupFamily[family];	
				countnew++;
				groupFamily[family]=countnew;
			}
			else
			{
				count=1;
				groupFamily[family]=count;
			}
		});
		var i=1;
		angular.forEach(groupFamily,function(item,key)
		{
			//~ if( i==200)
				//~ return false;
			var mainArray=[];
			angular.forEach(docs,function(doc)
			{
				var searchString=doc.doc.term;
				searchString= searchString.replace("_","");
				searchString=Utils.dotUndersRevert(searchString);	
				if(key==searchString)
				{
					mainArray.push(doc);
				}
			});
			var countVerified=0;
			var countAmbiguous=0;
			var arrlength=mainArray.length;
			for(var j=0;j<arrlength;j++)
			{
				var verifyVal=mainArray[j].doc.verify;
				if(verifyVal)
				{
					if(verifyVal==1)
					{
						countVerified++;
					}
					if(verifyVal==0)
					{
						countAmbiguous++;
					}
				}
			}
			
			var refArr=[];
			
			for(var j=0;j<arrlength;j++)
			{
				if(countVerified==1)
				{
					//console.log("just one verified record");
					if(mainArray[j].doc.verify && mainArray[j].doc.verify==1)
					{
						var id=mainArray[j].doc._id;
						var rev=mainArray[j].doc._rev;
						var source=mainArray[j].doc.source;
						var term=mainArray[j].doc.term;
						var type=mainArray[j].doc.type;
						var user=mainArray[j].doc.user;
						var wordfamily=mainArray[j].doc.wordfamily;
						if(mainArray[j].doc.original)
						{
							var original=mainArray[j].doc.original;
						}
						else
						{
							var original="";
						}
						if(mainArray[j].doc.definition)
						{
							var definition=mainArray[j].doc.definition;
						}
						else
						{
							var definition="";
						}
						if(mainArray[j].doc.ref)
						{
							var ref=mainArray[j].doc.ref;
							if(refArr.indexOf(ref)==-1)
								refArr.push(ref);
						}
						
						var verify=mainArray[j].doc.verify;					
						
					}
					else
					{
						if(mainArray[j].doc.ref)
						{
							var ref=mainArray[j].doc.ref;
							if(refArr.indexOf(ref)==-1)
								refArr.push(ref);
						}
						var delid=mainArray[j].doc._id;
						var delrev=mainArray[j].doc._rev;
						$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+delid+'?rev='+delrev).
						success(function(data,status, headers, config) 
						{
							console.log(status);
						}).
						error(function(data, status, headers, config) 
						{
							console.log(status);
						}); 
					}
					if(j==(arrlength-1))
						{
							 var allReferences=refArr.join();
							 var data= JSON.stringify(
								{
									"source": source,   
									"original":original , 
									"definition":definition, 
									"type": type, 
									"user": user,
									"term": term,
									"ref":allReferences,
									"verify":verify,
									"wordfamily":wordfamily
								}
							);
							$http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev, data).
							success(function(data, status, headers, config) 
							{
								console.log(status);
							}).
							error(function(data, status, headers, config) 
							{
								console.log(status);
							});
							console.log(data);
						}
				}
				else
				{
					//console.log("set all ambiguous");
					var id=mainArray[j].doc._id;
					var rev=mainArray[j].doc._rev;
					var source=mainArray[j].doc.source;
					var term=mainArray[j].doc.term;
					var type=mainArray[j].doc.type;
					var user=mainArray[j].doc.user;
					var wordfamily=mainArray[j].doc.wordfamily;
					if(mainArray[j].doc.original)
					{
						var original=mainArray[j].doc.original;
					}
					else
					{
						var original="";
					}
					if(mainArray[j].doc.definition)
					{
						var definition=mainArray[j].doc.definition;
					}
					else
					{
						var definition="";
					}
					if(mainArray[j].doc.ref)
					{
						var ref=mainArray[j].doc.ref;
					}
					else
					{
						var ref="";
					}
					var verify="0";
					var data= JSON.stringify(
								{
									"source": source,   
									"original":original , 
									"definition":definition, 
									"type": type, 
									"user": user,
									"term": term,
									"ref":ref,
									"verify":verify,
									"wordfamily":wordfamily
								}
							);
				$http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev, data).
				success(function(data, status, headers, config) 
				{
					console.log(status);
				}).
				error(function(data, status, headers, config) 
				{
					console.log(status);
				});
				//	console.log(id);
				}
				
				//~ else if(countVerified>1)
				//~ {
					//~ console.log("2-"+mainArray[j].doc.term);
					//~ console.log("again set all as ambiguous");
				//~ }
				//~ else if(countAmbiguous>=1)
				//~ {
					//~ console.log("3-"+mainArray[j].doc.term);
					//~ console.log("set all ambiguous");
				//~ }
				
			}
		
	
			i++;
			//console.log(mainArray);
		});
		
	}
	
	//==========================COMPRESS RECORDS TO PACK ALL REFERENCES IN ONE SINGLE VERIFIED RECORD===============================//
	$scope.compressVerify=function(docs)
	{
		var groupFamily=[];
		var mainGroup=[];
		var count=1;
		angular.forEach(docs, function(item) 
		{
				var family=item.doc.wordfamily; 	
				if(family in groupFamily)
				{
					var countnew=groupFamily[family];	
					countnew++;
					groupFamily[family]=countnew;
					// mainGroup[family][countnew]=item;
				}
				else
				{
					count=1;
					groupFamily[family]=count;
					//~ mainGroup.push([][]); 
					//~ mainGroup[family][count] = item;
				}	
					
		});
		//console.log(mainGroup);
		
	}
	//==================================REMOVING UNUSED DATA IN DOCUMENTS=========================================//
	$scope.removeUnusedData=function(docs)
	{
		angular.forEach(docs, function(item) 
		{
			var id=item.doc._id;
			var rev=item.doc._rev;
			var term=item.doc.term;
			var source=item.doc.source;
			var original=item.doc.original;
			var definition=item.doc.definition;
			var type=item.doc.type;
			var user=item.doc.user;
			var wordfamily=item.doc.wordfamily;
			if(item.doc.ref)
			{
				var ref=item.doc.ref;
			}
			else
			{
				var ref="";
			}
			
			if(item.doc.verify)
			{
				var verify=item.doc.verify;
			}
			else
			{
				var verify=0;
			}
			var data= JSON.stringify(
								{
									"source": source,   
									"original":original , 
									"definition":definition, 
									"type": type, 
									"user": user,
									"term": term,
									"ref":ref,
									"verify":verify,
									"wordfamily":wordfamily
								}
							);
			$http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev, data).
			success(function(data, status, headers, config) 
			{
				console.log(status);
			}).
			error(function(data, status, headers, config) 
			{
				console.log(status);
			});
		});
	}
	
	$scope.unique = function(origArr) 
	{
		var newArr = [],
		origLen = origArr.length,
		found, x, y;
		for (x = 0; x < origLen; x++) 
		{
			found = undefined;
			for (y = 0; y < newArr.length; y++) 
			{
				if (origArr[x] === newArr[y]) 
				{
					found = true;
					break;
				}
			}
			if (!found) 
			{
				newArr.push(origArr[x]);
			}
		}
		return newArr;
	}
 });
