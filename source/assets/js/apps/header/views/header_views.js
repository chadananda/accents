Accents.module("HeaderApp.List.Views", function(Views, Accents, Backbone, Marionette, $, _){
  // navigation bar at top
  Views.NavbarLinksView = Backbone.Marionette.ItemView.extend({
    template: '#navbar-links-template',
    tagName: 'ul',
    className: 'nav nav-pills pull-right'
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
