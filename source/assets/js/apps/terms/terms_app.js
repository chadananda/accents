Accents.module("TermsApp", function(TermsApp, App, Backbone, Marionette, $, _){
  var API = {
    termsList: function(){
      if( App.user.isLoggedIn() ){
        TermsApp.Controller.termsList();
      }else{
        App.trigger("login");
      }
    }
  };

  App.on("list:term", function(){
    App.navigate("terms");
    API.termsList();
  });

  App.addInitializer(function(){
    new TermsApp.Router({controller: API});
  });

});
