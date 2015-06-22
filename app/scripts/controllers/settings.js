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
     $http.get('http://'+domainRemoteDb+'/'+remoteDb+'/_all_docs?include_docs=true')
					.success(function(data) 
					{
						if(data.rows)
						{
							console.log(data.rows.doc);
							$scope.docs=data.rows;
							$scope.count=data.total_rows;
							$("#spinner").hide();
						}	
					})
					.error(function(error) 
					{
					console.log(error);
					});
 };
 
 
 //===================Delete Duplicate Records================//
 $scope.deleteDuplicate=function(alldocs){
	 angular.forEach(alldocs, function(docs) {
		
		 angular.forEach(alldocs,function(doc)
		 {
		  if(doc.doc.term==docs.doc.term && doc.doc.original==docs.doc.original && doc.doc.definition==docs.doc.definition && doc.id!=docs.id)
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
	 $http.get('http://'+domainRemoteDb+'/'+remoteDb+'/_all_docs?include_docs=true')
					.success(function(data) 
					{
						if(data.rows)
						{
							console.log(data.rows.doc);
							$scope.docs=data.rows;
							$scope.count=data.total_rows;
							$("#spinner").hide();
						}	
					})
					.error(function(error) 
					{
					console.log(error);
					});
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
		//var i=1;
		angular.forEach(items, function(item) 
		{
			//if(i==10)
				//return false;
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
				//console.log(data);
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
			//i++;
		});
	}
 });
