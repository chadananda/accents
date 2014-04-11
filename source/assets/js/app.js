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
  var user = {};
  if(typeof(Storage)!=="undefined"){
    var userSession = sessionStorage.getItem( "session-user" );
    if(userSession){
      user = $.parseJSON(userSession);
    }
  }
  Accents.user = new Accents.Entities.Login(user);
});

onCompleteSync = function(){ Accents.trigger("list:term") };

Accents.on("sync", function(){
  var opts = {live: true, complete: onCompleteSync };
  var urlConnection = "http://" + Accents.domainRemoteDb + "/" + Accents.remoteDb;
  Accents.db.replicate.to(urlConnection, opts, function(err, data){ console.log(err); console.log(data); });
  Accents.db.replicate.from(urlConnection, opts, function(err, data){ console.log(err); console.log(data); });
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
