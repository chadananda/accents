Accents.module("Entities", function(Entities, Accents, Backbone, Marionette, $, _){

  Entities.Login = Backbone.Model.extend({
    defaults:{
      user: null,
      loggedIn: false
    },

    isLoggedIn: function(){
      return this.get('loggedIn');
    }

  });

});
