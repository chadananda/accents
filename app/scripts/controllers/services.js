
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
})

//======Factory for crud functions=======//
.factory('crudFunctions', function(myConfig, Utils){
  var domainRemoteDb = myConfig.remoteDbDomain;
  var remoteDb = myConfig.database;
  return {

    // single point for DB path in case we want to change it later (including http)
    db_url: function() {
      // detect page https?
      return 'http://'+domainRemoteDb+'/'+remoteDb + '/';
    },

    // remove fields that are not allowed -- we use this on loading records and before saving
    pruneUnallowedFields: function(termObj) {
      var fields = Object.keys(termObj);
      var allowedFields = this.termAllowedFields();
      for (var i=0; i<fields.length; i++) {
        if (allowedFields.indexOf(fields[i])<0) delete termObj[fields[i]];
      }
      return termObj;
    },

     // returns array of allowable term fields (so we can adjust this on one place)
    termAllowedFields: function() {
      return ['definition', 'original', 'source', 'term', 'user', 'wordfamily', 'ref',
              'verified', 'ambiguous', 'audio', '_id', '_rev', 'type','_attachments'];
    },

    // returns unique array of all word families
    getAllWordFamilies: function(scope) {
      var result = {};
      // loop through entire cache and grab unique word families
      Object.keys(scope.idDocs).forEach(function(id) {
        result[scope.idDocs[id].wordfamily] = 1; // faster than removing duplicates with an array
      });
      return Object.keys(result); // return array of the object properties
    },

    // clean up all word families in DB
    cleanAllWordFamilies: function(scope) {
      // gather and clean up every single word family:
      var wordFamilies = this.getAllWordFamilies(scope);
      console.log('Cleaning up '+wordFamilies.length+' word families. '+
        ' Total records: '+ Object.keys(scope.idDocs).length);
      angular.forEach(wordFamilies,function(wordFamily) {
        console.log('Cleaning up word family: '+wordFamily +
            ' Total records: '+ Object.keys(scope.idDocs).length);
        this.cleanWordFamily(wordFamily, scope);
      }, this);
      console.log("Done cleaning word families. "+
        ' Total records: '+ Object.keys(scope.idDocs).length);
    },

    // compresses family down to one record per unique term, merging fields as appropriate
    // also sets ambiguous if there is more than one remaining verfied member
    // this function should be run after any CRUD operation to reset and clean word family
    // parameter can be a wordfamily, termObj, HTML or glyph
    cleanWordFamily: function(wordfamily, scope) {
      if (!wordfamily) return;
      wordfamily = this.genWordFamily(wordfamily); // cleanup just in case
      var terms = this.getWordFamilyTerms(wordfamily, scope);
      var family = {};
      // split into object of one termArray for each spelling
      // eg. { "_Shiráz" => [termObj, termObj, termObj],
      //       "_Shíráz" => [termObj, termObj, termObj] }
      terms.forEach(function(termObj) {
        if (!family[termObj.term]) family[termObj.term] = []; // initialize if neccesary
        family[termObj.term].push(termObj);
      });
      // now compress each list down to just one record each
      var verified_count = 0;
      var termscount=0;
      Object.keys(family).forEach(function(term) {
        family[term] = scope.compressTerms(family[term]); // takes array of termObj, returns merged termObj
        if (family[term].verified) verified_count++;
        termscount++;
      });
      if(termscount>1){
        // wait a second to allow any CRUD writes to finish - (sloppy, I know)
        // then set them all to ambiguous or not depending on verified count
        setTimeout(function() {
          Object.keys(family).forEach(function(term) {
            var termObj = scope.idDocs[family[term]._id]; // reload object from cache just in case it has changed
            var ambiguous = verified_count>1;
            // if term ambiguity does not match, change and save
            if (ambiguous != termObj.ambiguous) {
              termObj.ambiguous = ambiguous;
              scope.termCRUD('update', termObj);
            }
          });
        }, 1000);
      }
    },

    // returns a "word family" stripped down version of the term
    // parameter can be a wordfamily, termObj, HTML or glyph
    genWordFamily: function(term) {
      if (!term) return;
      // given any version of a term, even an object, return the word family
      if (term.hasOwnProperty('term')) term = term.term;
      return Utils.dotUndersRevert(term).replace(/\_|<[\/]?u>/g, '').trim();
    },

    // returns array of termObjects matching this family
    // loads entire db and generates correct wordfamily for each so should be backwards compatible
    getWordFamilyTerms : function(wordfamily,scope) {
      if (!wordfamily) return [];
      var result = [];
      wordfamily = this.genWordFamily(wordfamily); // just to make sure
      // loop through entire cache and grab matches. This should be very fast
      Object.keys(scope.idDocs).forEach(function(id) {
        var termObj = scope.idDocs[id];
        if (termObj.wordfamily === wordfamily) result.push(termObj);
      });
      return result;
    },

    // scrub any user generated field (may contain multiple items)
    scrubField: function(field, isReference) {
      if (!field) return '';
      // scrub any user-generated field part
      var scrubItem = function(item, isReference) {
        // this is good for reference fields and other fields
        if (isReference) return item.replace(/(pg[\.]?|page|p\.)/ig, 'pg ') // cleanup PG
                    .replace(/(par[\.]?|pp[\.]?)/ig,'par ') // cleanup PAR
                    .replace(/\s+/ig, ' ') // remove any excess spaces
                    .trim(); // remove surrounding spaces
          else return item.replace(/\s+/ig, ' ').trim();
      };
      return field.split(",").
        // clean up field
        map(scrubItem, isReference).
        // remove duplicates and empties
        filter(function(ref, index, self) {
          return ((index == self.indexOf(ref)) && (ref.length>1));
        }).
        // re-join with a comma and a space
        join(', ');
    },

    //
    scrubAttachmentField: function(baseData, termData){
      var obj3 = $.extend(baseData, termData);
      console.log("scrubAttachmentField(): ", obj3);
      return obj3;

    },

    // refresh $scope.docs from idDocs without having to query DB
    refreshOldDocsList: function(scope) {
      scope.docs = Object.keys(scope.idDocs).map(function(key){ return scope.idDocs[key]; });
      scope.count = scope.docs.length;
    },

    //
    all: function() {
      return users;
    }


  };
})

  .service('docData', function() {
    var data = this;
    return {
      getFormData: function () { return sessionStorage.data; },
      setFormData: function (list) { sessionStorage.data =JSON.stringify(list); }
    };
  });
