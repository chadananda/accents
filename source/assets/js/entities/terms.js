Accents.module("Entities", function(Entities, App, Backbone, Marionette, $, _){

    //Backbone.sync = BackbonePouch.sync(defaults);
    //Backbone.Model.prototype.idAttribute = '_id';
    
    Backbone.sync =  BackbonePouch.sync({
      db: PouchDB('termsdb')
      //fetch: 'allDocs',
      //listen: true
    });
    Backbone.Model.prototype.idAttribute = '_id';

    

    Entities.Term = Backbone.Model.extend({
        idAttribute: '_id',

        defaults: function(){  
         return  {
          term: "",
          ref: "",
          user: ""
          }
        },

        validate: function(attrs, options) {
          var errors = {};
          if (! attrs.term) {
            errors.term = "can't be blank";
          }
          if (! attrs.ref) {
            errors.ref = "can't be blank";
          }
          else{
            if (attrs.term.length < 2) {
              errors.term = "is too short";
            }
          }
          if( ! _.isEmpty(errors)){
            return errors;
          }
        },
      //  error: function (model, resp, options) {
       //     console.log("Error trying to save model: ", model, resp);
      // },

/*
        //pouch: options,
        idAttribute: '_id',
        sync: BackbonePouch.sync({
          db: PouchDB('termsdb')
        }),
*/

    });

    Entities.Terms = Backbone.Collection.extend({
        model: Entities.Term,
        pouch: {
          listen: true,
          fetch: 'allDocs',
          changes: {
            include_docs: true
          }
        },
        comparator: 'term',

        parse: function(result) {
          return _.pluck(result.rows, 'doc');
        }
    });

    Entities.fakeTerms = function(collection){
       console.log('Called Entities.initializeTerms');
       /*
       var terms = [
            { id: Accents.Utils.genUUID(), term: "Ḥusayn", ref: "DB pg 1", user: "Chad" },
            { id: Accents.Utils.genUUID(), term: "_Shay_kh", ref: "DB pg 2", user: "Chad" },
            { id: Accents.Utils.genUUID(), term: "Aḥmad", ref: "DB pg 3", user: "Chad" }
        ];
        terms.forEach(function(term){
            collection.create(term);
        }); */
        for (var i=0; i<100; i++) {
            collection.create(Accents.Utils.randomTerm());
        }
    };


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
