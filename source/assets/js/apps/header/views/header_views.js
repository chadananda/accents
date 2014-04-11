Accents.module("HeaderApp.List.Views", function(Views, Accents, Backbone, Marionette, $, _){
  // navigation bar at top
  Views.NavbarLinksView = Backbone.Marionette.ItemView.extend({
    template: '#navbar-links-template',
    tagName: 'ul',
    className: 'nav nav-pills pull-right',
    
    events: {
      "click #login-link": "logout"
    },

    initialize: function(){
      this.listenTo(Accents.user, "change:loggedIn", this.swapLoginText);
    },

    onRender: function(){
      this.swapLoginText();
    },

    swapLoginText: function(){
      var newLoginIcon = Accents.user.get('loggedIn') ? '<i class="fa fa-sign-out"></i>&nbsp; Logout' : '<i class="fa fa-sign-in"></i>&nbsp; Login';
      this.$el.find('#login-link').html(newLoginIcon);
    },

    logout: function(e){
      e.preventDefault();
      if( Accents.user.get('loggedIn') ){
        Accents.user.set({user: null, loggedIn: false});
        if(typeof(Storage)!=="undefined"){
          sessionStorage.removeItem("session-user");
        }
        Accents.trigger("login");
      }
    }

  });

  Views.NavLinksBoss = Marionette.BossView.extend({
    template: '#navbar-template',
    subViews: {
        links: Views.NavbarLinksView
    },
    subViewEvents: {
        'links click:#add': 'onAddPageClick'
    },
    subViewContainers: {
        links:   '#primary_links', // Renders someSubView in  .sub-view-container
    },
    onAddPageClick: function(e) {
        e.preventDefault();
        alert('someone just clicked the add page link');
    }
  });


});
