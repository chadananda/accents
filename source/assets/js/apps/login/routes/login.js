Accents.module("LoginApp", function(LoginApp, Accents, Backbone, Marionette, $, _){
  LoginApp.Router = Marionette.AppRouter.extend({
    appRoutes:{
      "login": "login"
    }
  });

});
