
angular.module('accentsApp')
  .factory('getRecords', function($http) {
    return {
      getAllData: function(userId) {
        return $http.get('http://127.0.0.1:5986/testdb/_all_docs?include_docs=true');
      },
    };
  })


.factory('pouchdb', function() {
  Pouch.enableAllDbs = true;
  return new Pouch('accents');
});
