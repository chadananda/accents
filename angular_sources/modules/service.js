// Demonstrate how to register services
// In this case it is a simple value service.
var services = angular.module('myApp.services', []);
services.factory('pp', function($q, pouchdb, $rootScope) {
  
  return {
    getScore: function(playerId) {
      var deferred = $q.defer();
      var map = function(doc) {
        if (doc.type === 'goal') {
          emit(doc.playerId, null)
        }
      };
      pouchdb.query({map: map, reduce: '_count'}, {key: playerId}, function(err, res) {
        $rootScope.$apply(function() {
          if (err) {
            deferred.reject(err);
          } else {
            if (!res.rows.length) {
              deferred.resolve(0);
            } else {
              deferred.resolve(res.rows[0].value);
            }
          }
        });
      });
      return deferred.promise;
    }
  }
  
});