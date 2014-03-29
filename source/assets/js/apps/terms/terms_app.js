Accents.module("TermsApp", function(TermsApp, App, Backbone, Marionette, $, _){

  Accents.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "terms": "addTerm",
      "": "addTerm"
    }
  });

  var API = {
    addTerm: function(){
      TermsApp.List.Controller.addTerm();
      Accents.execute("set:active:header", "addterm");
    },
  };


});