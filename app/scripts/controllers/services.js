
angular.module('accentsApp')
  .factory('getRecords', function($http,myConfig) {
    return {
      getAllData: function(userId) {
        return $http.get(myConfig.url+'_all_docs?include_docs=true');
      },
    };
  })


.factory('pouchdb', function() {
  Pouch.enableAllDbs = true;
  return new Pouch('accents');
});
