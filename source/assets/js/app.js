var Accents = new Backbone.Marionette.Application();

// pluggible regions
Accents.addRegions({
    navbar: 'header',
    main: '#maincontent',
    footer: 'footer'
});

Accents.navigate = function(route, options){
  console.log("Navigate ");
  console.log(route);
  console.log(options);
  var options = options || {};
  Backbone.history.navigate(route, options);
};

Accents.getCurrentRoute = function(){
  return Backbone.history.fragment;
};

// wire up application
var onCompleteSync = function(){
  console.log("Trigger list:term due to onCompleteSync call");
  Accents.trigger("list:term")
  console.log("sync called every 10 seconds timer");
  setTimeout(sync,10000);
};

Accents.addInitializer(function () {
  Accents.db = new PouchDB('accents');
  Accents.remoteDb = 'accents';
  Accents.domainRemoteDb = 'localhost:5984';
  //Accents.domainRemoteDb = 'diacritics.iriscouch.com';
  //Accents.domainRemoteDb = 'accents.couchappy.com'; // backup db
 
  Accents.db.changes({live: true, onChange: function(change){ /*console.log(change); */} });  

  sync();

  var user = {};
  if(typeof(Storage)!=="undefined"){
    var userSession = sessionStorage.getItem( "session-user" );
    if(userSession){
      user = $.parseJSON(userSession);
    }
  }
  Accents.user = new Accents.Entities.Login(user);
});

Accents.on("sync", function(){
  console.log("triggering list:term");
  Accents.trigger("list:term")
});

var sync = function(){
  console.log("sync called");
  var opts = {continuous: true, complete: onCompleteSync, batch_size: 500};
  var urlConnection = "http://" + Accents.domainRemoteDb + "/" + Accents.remoteDb;
  PouchDB.replicate('accents', urlConnection, opts, function(err, data){ console.log("replicating local to remote");/*console.log(err); console.log(data); */});
  PouchDB.replicate(urlConnection, 'accents', opts, function(err, data){ console.log("replicating remote to local");/*console.log(err); console.log(data);*/ });
};

Accents.on("initialize:after", function(){
  console.log("initialize:after called");
  if(Backbone.history){
    Backbone.history.start();
    if( !Accents.user.isLoggedIn() ){
      Accents.trigger("login");
    }else if( Accents.getCurrentRoute() == "" ){
      Accents.trigger("list:term");
    }
  }
});
