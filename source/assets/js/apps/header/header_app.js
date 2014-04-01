Accents.module("HeaderApp", function(HeaderApp, Accents, Backbone, Marionette, $, _){
  var API = {
    listHeader: function(){
      HeaderApp.List.Controller.listHeader();
    }
  };

  HeaderApp.on("start", function(){
    API.listHeader();
  });

});
