Accents.module("LoginApp.Views", function(Views, Accents, Backbone, Marionette, $, _){
  Views.LoginView = Backbone.Marionette.ItemView.extend({
    template: '#login-template',

    currentAlertView: null,

    events:{
      'click button': 'login'
    },

    ui: {
      userInput: 'input#user',
      passwordInput: 'input#password',
      loginBtn: 'button#login-btn',
      alert: '.alert'
    },

    login: function(e){
      var self = this;
      var user = this.ui.userInput.val();
      var password = this.ui.passwordInput.val();
      var urlConnection = "http://" + user + ":" + password + "@" + Accents.domainRemoteDb + "/" + Accents.remoteDb;
      var btn = $(e.currentTarget);

      btn.button('loading');
      Accents.remote = new PouchDB(urlConnection, function(error){
        if(error){
          self.showLoginError(error.message);
          btn.button('reset');
        }else{
          Accents.user.set({user: user, loggedIn: true, startDate: new Date()});
          if(typeof(Storage)!=="undefined"){
            if(Accents.user){
              sessionStorage.setItem("session-user", JSON.stringify(Accents.user.toJSON()) );
            }
          }
          Accents.trigger("sync");
        }
      });
    },

    showLoginError: function(message){
      var _errors =[message || "Something went wrong, try again"];
      this.currentAlertView = new Accents.TermsApp.Views.AlertView( {model: new Backbone.Model({errors: _errors}) } );
      this.$(".alert-container").html(this.currentAlertView.render().el);
    }

  });

});

