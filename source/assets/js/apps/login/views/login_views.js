Accents.module("LoginApp.Views", function(Views, Accents, Backbone, Marionette, $, _){
  Views.LoginView = Backbone.Marionette.ItemView.extend({
    template: '#login-template',

    currentAlertView: null,

    events:{
      'keypress input': 'checkPressedKey',
      'click button': 'login'
    },

    ui: {
      userInput: 'input#user',
      passwordInput: 'input#password',
      loginBtn: 'button#login-btn',
      alert: '.alert'
    },
    checkPressedKey:function(e){
      //console.log("checking login entry value");
      if(e.which === 13)//basically enter key
      {
        $('#login-btn').trigger('click');
      }
    },
    login: function(e){
      //console.log("process click");
      var self = this;
      var user = this.ui.userInput.val();
      var password = this.ui.passwordInput.val();
      var urlConnection = "http://" + user + ":" + password + "@" + Accents.domainRemoteDb + "/" + Accents.remoteDb;
      var btn = $(e.currentTarget);

      btn.button('loading');
      // if(user!='' && password!='')
      // {
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
      // }else{
      //   self.showLoginError("Username or Password is empty");
      //   btn.button('reset');
      // }
    },

    showLoginError: function(message){
      var _errors =[message || "Something went wrong, try again"];
      this.currentAlertView = new Accents.TermsApp.Views.AlertView( {model: new Backbone.Model({errors: _errors, type: "danger"}) } );
      this.$(".alert-container").html(this.currentAlertView.render().el);
    }

  });

});

