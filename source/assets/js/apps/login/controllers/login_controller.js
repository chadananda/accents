Accents.module("LoginApp", function(LoginApp, Accents, Backbone, Marionette, $, _){
  LoginApp.Controller = {
    login: function(){
      loginView = new LoginApp.Views.LoginView();
      Accents.main.show( loginView );
    }
  };

});

