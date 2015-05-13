
angular.module('accentsApp')
  .factory('getRecords', function($http) {
    return {
      getAllData: function(userId) {
        return $http.get('http://diacritics.iriscouch.com/accents_swarandeep/_all_docs?include_docs=true');
      },
    };
  })


.factory('pouchdb', function() {
  Pouch.enableAllDbs = true;
  return new Pouch('accents');
});





