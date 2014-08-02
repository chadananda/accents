(function(){
	var accentsDataServices = angular.module('myDataServices',[]);

	var DBlocation = 'http://chad:vanilla123@diacritics.iriscouch.com/'
	var DBcollection = 'accents';
	var DBcollectionTemp = 'accents_temp';
	var opts ={
			live: true,
			create_target: true,
			batch_size:500
		};
	var initopt = {
			create_target:true,
			batch_size:500
		};
	accentsDataServices.factory('accessDB', [function() {

		// var mydb = new PouchDB(DBlocation+DBcollection);
		//PouchDB.destroy(DBcollection);
		var mydb = new PouchDB(DBcollection);
		mydb.replicate.from(DBlocation+DBcollection,opts);
		mydb.replicate.to(DBlocation+DBcollection,opts);
		// mydb.replicate.from(DBlocation+DBcollection,initopt).
		// 	on('complete', function (info) {
		// 		// handle complete
		// 		mydb.replicate.to(DBlocation+DBcollection,opts);
		// 		mydb.replicate.from(DBlocation+DBcollection,opts);
		// 	});
		return mydb;

	}]);
	accentsDataServices.factory('tempDB',function($http,$q){

		//PouchDB.destroy(DBcollectionTemp);
		var mydb = new PouchDB(DBcollectionTemp);
		mydb.replicate.from(DBlocation+DBcollectionTemp,opts);
		mydb.replicate.to(DBlocation+DBcollectionTemp,opts);
		
		// mydb.replicate.from(DBlocation+DBcollectionTemp,initopt).
		// 	on('complete', function (info) {
		// 		// handle complete
		// 		mydb.replicate.to(DBlocation+DBcollectionTemp,opts);
		// 		mydb.replicate.from(DBlocation+DBcollectionTemp,opts);
		// 	});
		return mydb;
	});
	accentsDataServices.factory('pouchWrapper', ['$q', '$rootScope', 'accessDB', 'tempDB',
		function($q, $rootScope, accessDB, tempDB) {
			return {
				addToAccents: function(doc) 
				{
					var deferred = $q.defer();
					delete doc["termNonConvert"];
					//check if Selected is there
					if(doc["Selected"] != undefined)
					{
						delete doc["Selected"];
					}
					accessDB.post(doc, function(err, res) {
						$rootScope.$apply(function() {
							if (err) {
								deferred.reject(err)
							} else {
								deferred.resolve(res)
							}
						});
					});
					return deferred.promise;
				},
				removeFromTemp: function(id) 
				{
					var deferred = $q.defer();
					tempDB.get(id, function(err, doc) {
						$rootScope.$apply(function() {
						  if (err) {
						  	console.log("Error reading document from delete");
						  	console.log(err);
						    deferred.reject(err);
						  } else {
						    tempDB.remove(doc, function(err, res) {
						      $rootScope.$apply(function() {
						        if (err) {
						          console.log("Error deleting document");
						          console.log(err);
						          deferred.reject(err)
						        } else {
						          console.log("Successful deleting");
						          console.log(res);
						          deferred.resolve(res)
						        }
						      });
						    });
						  }
						});
					});
					return deferred.promise;
				},
				pullAllDocs:function()
				{
					var deferred = $q.defer();
					var options = {
						descending:false,
						include_docs: true
					};
					tempDB.allDocs(options, 
						function(err, res) { 
							if(err==null)
							{
								deferred.resolve(res);
							}else{
								deferred.reject(err);
							}
						}
					);
					return deferred.promise;
				},
				destroyTemp:function()
				{
					var deferred = $q.defer();
					tempDB.destroy(function(err, info) {
						if(err==null)
						{
							deferred.resolve(info);
						}else{
							deferred.reject(err);
						}
					});
					return deferred.promise;
				}
	  		};
		}
	]);
	accentsDataServices.factory('listener', ['$rootScope', 'tempDB', function($rootScope, tempDB) {

		tempDB.changes({live: true}).
			on('change', function(change) {
				if (!change.deleted) {
					$rootScope.$apply(function() {
						tempDB.get(change.id, function(err, doc) {
							$rootScope.$apply(function() {
								if (err) console.log(err);
								$rootScope.$broadcast('tempNew', doc);
							})
						});
					})
				} else {
					$rootScope.$apply(function() {
						$rootScope.$broadcast('tempDel', change.id);
					});
				}
			});
	}]);

	accentsDataServices.service('dataStorage',[function(){
		return {
			pushTempData: function(data){
				tempDatas = [];
				data.forEach(function(item){
					tempDatas.push(item.doc);
				});
			},
			setTempData: function(data){
				tempDatas = [];
				data.forEach(function(item){
					tempDatas.push(item);
				});
			},
			getTempData: function(){
				return tempDatas;
			},
			emptyTempData: function(){
				tempDatas = [];
			}
		};
	}]);

	var tempDatas=[];
})();