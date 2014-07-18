Accents.module("LoginApp", function(LoginApp, Accents, Backbone, Marionette, $, _){
  var API = {
    login: function(){
      if( Accents.user.isLoggedIn() ){
        Accents.trigger('list:term');
      }else{
        LoginApp.Controller.login();
      }
    }
  };

  Accents.on("login", function(){
    Accents.navigate("login");
    try {
      $(window).unbind("scroll");
    }catch(error){
      //nothing
    }
    API.login();
  });

  LoginApp.addInitializer(function(){
    new LoginApp.Router({controller: API});
  });
  try{
    $(window).unbind("scroll");
  }catch(error){
    //nothing
  }
});
