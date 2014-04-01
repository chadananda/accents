Accents.module("HeaderApp.List", function(List, Accents, Backbone, Marionette, $, _){
  List.Controller = {
    listHeader: function(){
      Accents.navbar.show(new List.Views.NavLinksBoss({  }));
    }
  };
});
