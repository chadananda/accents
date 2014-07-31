(function(){
	var accentsDataServices = angular.module('myDataServices',[]);

	var DBlocation = 'http://localhost:5984/'
	var DBcollection = 'accents';
	var DBcollectionTemp = 'accents_temp';
	PouchDB_opts={
		cache:false
	};

	accentsDataServices.factory('accessDB', [function() {

		var mydb = new PouchDB(DBlocation+DBcollection,PouchDB_opts);
		return mydb;

	}]);
	accentsDataServices.factory('tempDB',function($http,$q){
		
		var mydb = new PouchDB(DBcollectionTemp);
		PouchDB.replicate(DBcollectionTemp, DBlocation+DBcollectionTemp, {live: true});
  		PouchDB.replicate(DBlocation+DBcollectionTemp, DBcollectionTemp, {live: true});
		return mydb;
	});
	accentsDataServices.factory('pouchWrapper', ['$q', '$rootScope', 'accessDB', 'tempDB',
		function($q, $rootScope, accessDB, tempDB) {
			return {
				addToAccents: function(doc) 
				{
					var deferred = $q.defer();
					delete doc.termNonConvert;
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
						    deferred.reject(err);
						  } else {
						    tempDB.remove(doc, function(err, res) {
						      $rootScope.$apply(function() {
						        if (err) {
						          deferred.reject(err)
						        } else {
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
				tempDatas = data;
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