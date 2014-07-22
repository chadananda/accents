Accents.module("TermsApp", function(TermsApp, App, Backbone, Marionette, $, _){
  var API = {
    termsList: function(){
      if( App.user.isLoggedIn() ){
        $("#terms-table").scroll(TermsApp.Controller.scrollCheck);
        TermsApp.Controller.termsList();
        //add capture of scroll
        
        $("#terms-table").scroll(TermsApp.Controller.scrollCheck);
      }else{
        App.trigger("login");
        try{
          $("terms-table").unbind("scroll");
        }catch(error){
          //nothing
        }
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
