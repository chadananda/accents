Accents.module("TermsApp", function(TermsApp, Accents, Backbone, Marionette, $, _){
  TermsApp.Router = Marionette.AppRouter.extend({
    appRoutes:{
      "terms": "termsList"
    }
  });

});
