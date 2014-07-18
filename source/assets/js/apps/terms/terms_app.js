Accents.module("TermsApp", function(TermsApp, App, Backbone, Marionette, $, _){
  var API = {
    termsList: function(){
      if( App.user.isLoggedIn() ){
        TermsApp.Controller.termsList();
        //add capture of scroll
        $(window).scroll(TermsApp.Controller.scrollCheck);
      }else{
        App.trigger("login");
        try{
          $(window).unbind("scroll");
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
