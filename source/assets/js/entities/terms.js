Accents.module("Entities", function(Entities, App, Backbone, Marionette, $, _){

    Backbone.sync =  BackbonePouch.sync({
      db: PouchDB('accents')
    });
    Backbone.Model.prototype.idAttribute = '_id';



    Entities.Term = Backbone.Model.extend({
        defaults: function(){
         return  {
          type: "term",
          term: "",
          ref: "",
          user: "",
          id:""
          };
        },

        validate: function() {
          var errors = {};
          if (! this.attributes.term) {
            errors.term = "can't be blank";
          }
          if (! this.attributes.ref) {
            errors.ref = "can't be blank";
          }
          else{
            if (this.attributes.term.length < 2) {
              errors.term = "is too short";
            }
          }
          if( ! _.isEmpty(errors)){
            return errors;
          }
        }
    });
    // Entities.AddTermFormView = '';
    // Entities.TermsListLayout = '';
    // Entities.FilteredListView = '';
    // Entities.TermsView = '';
    Entities.TotalTermsView = Number(0);
    Entities.currTermsPos = Number(0);
    Entities.currPos = Number(0);
    Entities.limit = Number(500);
    Entities.requestMoreFlag = true;
    Entities.evenResults = true;
    Entities.lastrowsLength = Number(0);
    Entities.limitorig = Entities.limit;
    Entities.Preload;
    Entities.CacheLoad;
    //debugger;

    Entities.Terms = Backbone.Collection.extend({
        model: Entities.Term,
        sync: BackbonePouch.sync({
          db: PouchDB('accents'),
          fetch: 'query',
          options: {
            query: {
              include_docs: true,
              fun: "entities_terms"
              // fun:{
              //   map: function(doc) {
              //     if (doc.type === 'term') {
              //       emit(doc.position, null)
              //     }
              //   }
              //},
              // limit: Entities.limit,
              // skip: Entities.currPos
            }
          }
        }),
        comparator: 'term',
        sort_key: "term",

        parse: function(result) {
          console.log("parser collection");
          console.log("Entities.limit : "+Entities.limit+" Entities.currPos : "+Entities.currPos);
          console.log("From Term entities");
          console.log(result);
          Entities.lastrowsLength = result.rows.length;
          Entities.TotalTermsView = result.total_rows;
          return _.pluck(result.rows, 'doc');
        },

       comparator: function(a, b){
         a = Accents.Utils.dotUndersRevert( a.get(this.sort_key) );
         b = Accents.Utils.dotUndersRevert( b.get(this.sort_key) );
         return a > b ?  1 : a < b ? -1 : 0;
       }

    });
    
    Entities.DBpage = Backbone.Collection.extend({
        model: Entities.Term,
        sync: BackbonePouch.sync({
          db: PouchDB("http://diacritics.iriscouch.com/accents"),
          fetch: 'query',
          options: {
            query: {
              include_docs: true,
              //limit: 900000
              fun: "entities_terms"
              // fun:{
              //   map: function(doc) {
              //     if (doc.ref) {
              //       emit(doc.position, null)
              //     }
              //   }
              // },
            }
          }
        }),
        comparator: 'term',
        sort_key: "term",

        parse: function(result) {
          console.log("parser collection");
          console.log("Entities.limit : "+Entities.limit+" Entities.currPos : "+Entities.currPos);
          console.log("From DBpage entities");
          console.log(result);
          Entities.lastrowsLength = result.rows.length;
          Entities.TotalTermsView = result.total_rows;
          return _.pluck(result.rows, 'doc');
        },

       comparator: function(a, b){
         a = Accents.Utils.dotUndersRevert( a.get(this.sort_key) );
         b = Accents.Utils.dotUndersRevert( b.get(this.sort_key) );
         return a > b ?  1 : a < b ? -1 : 0;
       }

    });

    Entities.fakeTerms = function(collection){
       console.log('Called Entities.initializeTerms');
        for (var i=0; i<10; i++) {
            collection.create(Accents.Utils.randomTerm());
        }
    };

    var API = {
      getTermEntities: function(){
        return App.db.allDocs({include_docs: true, descending: true});
      }
    };

    App.reqres.setHandler("term:entities", function(){
      return API.getTermEntities();
    });



/*
      var API = {
        getTermEntities: function(){
          var terms = new Entities.TermCollection();
          var defer = $.Deferred();
          terms.fetch({
            success: function(data){
              defer.resolve(data);
            }
          });
          var promise = defer.promise();
          $.when(promise).done(function(terms){
            if(terms.length === 0){
              // if we don't have any terms yet, create some for convenience
              var models = initializeTerms();
              terms.reset(models);
            }
          });
          return promise;
        },

        getTermEntity: function(termId){
          var term = new Entities.Term({id: termId});
          var defer = $.Deferred();
          setTimeout(function(){
            term.fetch({
              success: function(data){
                defer.resolve(data);
              },
              error: function(data){
                defer.resolve(undefined);
              }
            });
          }, 2000);
          return defer.promise();
        }
      };







      Accents.reqres.setHandler("terms:entities", function(){
        return API.getTermEntities();
      });

      Accents.reqres.setHandler("terms:entity", function(id){
        return API.getTermEntity(id);
      });
*/

});
