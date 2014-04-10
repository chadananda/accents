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
        btn.button('reset');
        if(error){
          self.showLoginError();
        }else{
          Accents.user.set({user: user, loggedIn: true});
          Accents.trigger("sync");
          //Accents.trigger('list:term');
        }
        console.log(error);
      });
      /*Accents.db.query(function(doc, emit){
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
      });*/

    },

    showLoginError: function(){
      var _errors =["Name or password is incorrect"];
      this.currentAlertView = new Accents.TermsApp.Views.AlertView( {model: new Backbone.Model({errors: _errors}) } );
      this.$(".alert-container").html(this.currentAlertView.render().el);
    }
  });

});

