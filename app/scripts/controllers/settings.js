'use strict';

/**
 * @ngdoc function
 * @name accentsApp.controller:SettingsCtrl
 * @description
 * # SettingsCtrl
 * Controller of the accentsApp
 */
angular.module('accentsApp')
  .controller('SettingsCtrl', function ($rootScope,$scope,$http,getRecords,$window,$filter,myConfig,Utils,$sce,docData) {
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
				   "verify":"1",
				   "ambiguous":0,
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
    $scope.setAmbiguous($scope.docs);
 };
 
 
 //===================Delete Duplicate Records================//
 $scope.deleteDuplicate=function(alldocs){
	 var idArray=[];
	  angular.forEach(alldocs, function(docs) {		
		 angular.forEach(alldocs,function(doc)
		 {
			 if((docs.doc._id!=doc.doc._id )&& (docs.doc._rev!=doc.doc._rev))
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
					idArray.push(id);
					
					//~ $http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev).
					//~ success(function(data, status, headers, config) 
					//~ {
						//~ //$("#spinner").show();
						//~ $scope.message='Records Deleted Successfully';					
					//~ }).
					//~ error(function(data, status, headers, config) 
					//~ {
						//~ $scope.message='Error Deleting Record';
					//~ });		
				 }
			 }
		 });
		 //$scope.allDocsFunc();
	  });
	  console.log(idArray);
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
				if(item.doc.ambiguous)
				{
					var ambiguous=item.doc.ambiguous;
				}
				else
				{
					var ambiguous=0;
				}
				
				var data= JSON.stringify(
											{
												"source": userName,   
												"original":original , 
												"definition":definition, 
												"type": "term", 
												"user": userName,
												"term": term,
												"ref":refrence,
												"wordfamily":string,
												"verify":additemverify,
												"ambiguous":ambiguous,
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
	$scope.setAmbiguous=function(alldocs)
	{
		var groupFamily={};
		var count=1;
		console.log('calledhere');
		//=================Making a group array for all family groups==================//
		angular.forEach(alldocs,function(doc)
		{
			if(doc.doc.wordfamily)
			{
				var family=doc.doc.wordfamily; 
			}
			else
			{
				var string=doc.doc.term;
				if(string)
				{
					string= string.replace("_","");	
					string=Utils.dotUndersRevert(string);
					var family=string;				
				}
				else
				{
					return false;
				}
			}			
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
		//===============Traversing through the group=================//
		angular.forEach(groupFamily,function(item,key)
		{
			//~ if( i==200)
				//~ return false;
			var mainArray=[];
			//===========Traversing through the main docs array to form a sub array of family for each word family group========//
			angular.forEach(alldocs,function(doc)
			{
				var searchString=doc.doc.term;
				if(searchString)
				{
					searchString= searchString.replace("_","");
					searchString=Utils.dotUndersRevert(searchString);	
					if(key==searchString)
					{
						mainArray.push(doc);
					}
				}				
			});
			//==================Check count of ambiguous and verified records===========================//
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
				}
			}
			if(countVerified==1)
			{
				//=====only one verified term=====//
				if(arrlength>1)
				{
					var allRef=[];
					//====Compressing the references====//
					for(var j=0;j<arrlength;j++)
					{
						if(mainArray[j].doc.ref)
							allRef.push(mainArray[j].doc.ref);
					}
					//========compress into one record======//
					for(var j=0;j<arrlength;j++)
					{	
						var verifyVal=mainArray[j].doc.verify;
						if(verifyVal && verifyVal==1)
						{
							//==verified record==//
							var updateid=mainArray[j].doc._id;
							var revid=mainArray[j].doc._rev;
							var term=mainArray[j].doc.term;
							var original=mainArray[j].doc.original;						
							var refrence=mainArray[j].doc.ref;	
							var source=mainArray[j].doc.source;	
							var user=mainArray[j].doc.user;
							if(refrence)					
								allRef.push(refrence);
							var allReferences=allRef.join();
							allReferences=$scope.getUnique(allReferences);						
							var definition=mainArray[j].doc.definition;
							if(mainArray[j].doc.wordfamily)
							{
								var wordfamilyField=mainArray[j].doc.wordfamily;
							}
							else
							{
								var wordfamilyField=mainArray[j].doc.term;
								wordfamilyField= wordfamilyField.replace("_","");	
								wordfamilyField=Utils.dotUndersRevert(wordfamilyField);
							}
							var data= JSON.stringify
							({
								"source": source,   
								"original":original , 
								"definition":definition, 
								"type": "term", 
								"user": user,
								"term": term,
								"ref":allReferences,
								"wordfamily":wordfamilyField,
								"verify":1,
								"ambiguous":0
							});
							$http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+updateid+'?rev='+revid, data).
							success(function(data, status, headers, config) 
							{
								console.log(status);												
							}).
							error(function(data, status, headers, config) 
							{
								console.log(status);
							});
						}
						else
						{
							//==unverified record to be deleted==//
							var delid=mainArray[j].doc._id;
							var delrev=mainArray[j].doc._rev;
							$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+delid+'?rev='+delrev).
							success(function(data, status, headers, config) 
							{
								console.log(status);
							}).
							error(function(data, status, headers, config) 
							{
								console.log(status);
							});
						}
					}
				}				
			}
			else if(countVerified>1)
			{
				//=====more than one verified term=====//
				var verifiedArray=[];
				for(var j=0;j<arrlength;j++)
				{
					var verifyVal=mainArray[j].doc.verify;
					if(verifyVal && verifyVal==1)
					{
						verifiedArray.push(mainArray[j].doc.term);
					}
				}
				angular.forEach(verifiedArray,function(ver)
				{
					var allRef=[];
					for(var j=0;j<arrlength;j++)
					{
						if(mainArray[j].doc.verify && mainArray[j].doc.verify==0)
						{
							if((ver.indexOf(mainArray[j].doc.term))!=-1)
							{
								//if the ambiguous record term matches the verified term
								// get its reference 
								allRef.push(mainArray[j].doc.ref);
								//and delete the term
								var delid=mainArray[j].doc._id;
								var delrev=mainArray[j].doc._rev;
								$http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+delid+'?rev='+delrev).
								success(function(data, status, headers, config) 
								{
									console.log(status);
								}).
								error(function(data, status, headers, config) 
								{
									console.log(status);
								});
							}
							
						}
						else if(mainArray[j].doc.verify && mainArray[j].doc.verify==1)
						{
							allRef.push(mainArray[j].doc.ref);
							var updateid=mainArray[j].doc._id;
							var revid=mainArray[j].doc._rev;
							var term=mainArray[j].doc.term;
							var original=mainArray[j].doc.original;						
							var refrence=mainArray[j].doc.ref;	
							var source=mainArray[j].doc.source;	
							var user=mainArray[j].doc.user;					
							var definition=mainArray[j].doc.definition;
							if(mainArray[j].doc.wordfamily)
							{
								var wordfamilyField=mainArray[j].doc.wordfamily;
							}
							else
							{
								var wordfamilyField=mainArray[j].doc.term;
								wordfamilyField= wordfamilyField.replace("_","");	
								wordfamilyField=Utils.dotUndersRevert(wordfamilyField);
							}
						}
						else
						{
						}
						if(j==(arrlength-1))
						{
							var allReferences=allRef.join();
							allReferences=$scope.getUnique(allReferences);
							//save the verified record
							var data= JSON.stringify
							({
								"source": source,   
								"original":original , 
								"definition":definition, 
								"type": "term", 
								"user": user,
								"term": term,
								"ref":allReferences,
								"wordfamily":wordfamilyField,
								"verify":1,
								"ambiguous":1
							});
							$http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+updateid+'?rev='+revid, data).
							success(function(data, status, headers, config) 
							{
								console.log(status);												
							}).
							error(function(data, status, headers, config) 
							{
								console.log(status);
							});	
						}
					}
				});
				
				
			}
			else
			{
				//=====no verified term=====//
				console.log("no one verified term");
			}
			
			i++;
		});
		 $scope.allDocsFunc();
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
			if(item.doc.ambiguous)
			{
				var ambiguous=item.doc.ambiguous;
			}
			else
			{
				var ambiguous=0;
			}
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
									"wordfamily":wordfamily,
									"verify":verify,
									"ambiguous":ambiguous									
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
 });
