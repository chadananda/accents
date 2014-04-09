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
  Accents.remoteCouch = 'http://guest-user:12345@diacritics.iriscouch.com/accents';
  //Initialization fake user
  Accents.db.get('guest-user', function(err, doc){
    if(err){ 
      Accents.db.put( {password: "12345"}, 'guest-user', function(err, res){ if(err) console.log('error') }) ;
    };
  });
  
  Accents.user = new Accents.Entities.Login();
});

Accents.on("sync", function(){
  var opts = {live: true};
  Accents.db.replicate.to(Accents.remoteCouch, opts, function(err, data){ console.log(err); console.log(data); });
  Accents.db.replicate.from(Accents.remoteCouch, opts, function(err, data){ console.log(err); console.log(data); });
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
