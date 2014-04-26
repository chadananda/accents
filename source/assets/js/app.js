var Accents = new Backbone.Marionette.Application();

// pluggible regions
Accents.addRegions({
    navbar: 'header',
    main: '#maincontent',
    footer: 'footer'
});

Accents.navigate = function(route, options){
  var options = options || {};
  Backbone.history.navigate(route, options);
};

Accents.getCurrentRoute = function(){
  return Backbone.history.fragment;
};

// wire up application
Accents.addInitializer(function () {
  Accents.db = new PouchDB('accents');
  Accents.remoteDb = 'accents';
  Accents.domainRemoteDb = 'diacritics.iriscouch.com';

  Accents.db.changes({continuous: true, onChange: function(change){ console.log(change); } });

  var opts = {continuous: true, complete: onCompleteSync };
  var urlConnection = "http://" + Accents.domainRemoteDb + "/" + Accents.remoteDb;
  PouchDB.replicate('accents', urlConnection, opts, function(err, data){ console.log(err); console.log(data); });
  PouchDB.replicate(urlConnection, 'accents', opts, function(err, data){ console.log(err); console.log(data); });


  var user = {};
  if(typeof(Storage)!=="undefined"){
    var userSession = sessionStorage.getItem( "session-user" );
    if(userSession){
      user = $.parseJSON(userSession);
    }
  }
  Accents.user = new Accents.Entities.Login(user);
});

var onCompleteSync = function(){ Accents.trigger("list:term") };

Accents.on("sync", function(){
  Accents.trigger("list:term")
});


Accents.on("initialize:after", function(){
  if(Backbone.history){
    Backbone.history.start();
    if( !Accents.user.isLoggedIn() ){
      Accents.trigger("login");
    }else if( Accents.getCurrentRoute() == "" ){
      Accents.trigger("list:term");
    }
  }
});
