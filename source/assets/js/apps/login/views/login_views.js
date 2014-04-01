Accents.module("LoginApp.Views", function(Views, Accents, Backbone, Marionette, $, _){
  Views.LoginView = Backbone.Marionette.ItemView.extend({
    template: '#login-template',

    events:{
      'click button': 'login'
    },

    ui: {
      userInput: 'input#user',
      passwordInput: 'input#password',
      loginBtn: 'button#login-btn',
      alert: '.alert'
    },

    login: function(){
      var self = this;
      var myId = this.ui.userInput.val();
      var password = this.ui.passwordInput.val();
      Accents.db.query(function(doc, emit){
        if(doc._id === myId && doc.password === password){
          emit(doc);
        }
      }, function(err, results) {  
        if(results.rows.length > 0){
          Accents.user.set({user: myId, loggedIn: true});
          Accents.trigger('list:term');
        }else{
          self.ui.alert.html("Credentials are not valid").show();
        }
      });

    }
  });

});

