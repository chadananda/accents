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
  // console.log("Trigger list:term due to onCompleteSync call");
  // Accents.trigger("list:term")
  // console.log("sync called every 10 seconds timer");
  // setTimeout(sync,10000);
};

Accents.addInitializer(function () {
  Accents.db = new PouchDB('accents');

  Accents.remoteDb = 'accents';
  //Accents.domainRemoteDb = 'localhost:5984';
  Accents.domainRemoteDb = 'diacritics.iriscouch.com';
  //Accents.domainRemoteDb = 'accents.couchappy.com'; // backup db
  var urlConnection = "http://" + Accents.domainRemoteDb + "/" + Accents.remoteDb;
  //AccentsOnlinedb = new PouchDB("http://" + Accents.domainRemoteDb + "/" + Accents.remoteDb);
  // Accents.db.changes({live: true, onChange: function(change){ /*console.log(change); */} });  
  // Accents.Entities.Preload = new Accents.Entities.Terms();
  // sync(Accents.db);
  // Accents.Entities.Preload = {
  //   length:0,
  //   models:[],
  //   last:function(){
  //     try{
  //       return this.models[this.length-1].attributes;
  //     }catch(error){
  //       return "";
  //     }
  //   }
  // };
  Accents.Entities.Preload = new Accents.Entities.DBpage();
  sync(Accents.db);
  // AccentsOnlinedb.allDocs({include_docs:true},function(err, res){
  //   if(err==null)
  //   {
  //     // var counter=0;
  //     // for(var x = 0;x < res.rows.length;x++)
  //     // {
  //     //   for(var y = 1;y < res.rows.length;y++)
  //     //   {
  //     //     if(res.rows[x].doc.term>res.rows[y].doc.term)
  //     //     {
  //     //       var temp = res.rows[y];
  //     //       res.rows[y] = res.rows[x];
  //     //       res.rows[x] = temp;
  //     //     }
  //     //   }
  //     // }
  //     // res.rows.forEach(function(data){
  //     //   data.doc['get'] = function(key){
  //     //     return this[key];
  //     //   };
  //     //   var struct = {
  //     //     _changing:false,
  //     //     _pending:false,
  //     //     attributes : data.doc
  //     //   }
  //     //   Accents.Entities.Preload.models.push(struct);
  //     //   counter++;
  //     //   Accents.Entities.Preload.length = counter;
  //     // });
  //     // Accents.trigger("prefetch:data",Accents.Entities.Preload);
  //     console.log("allDocs done");
  //     console.log(res);
  //     AccentsOnlinedb.replicate.to(Accents.db)
  //     .on("complete",function(info){
  //       debugger;
  //       Accents.Entities.Preload = new Accents.Entities.DBpage();
  //       console.log("replicate done");
  //       var user = {};
  //       if(typeof(Storage)!=="undefined"){
  //         var userSession = sessionStorage.getItem( "session-user" );
  //         if(userSession){
  //           user = $.parseJSON(userSession);
  //         }
  //       }
  //       Accents.user = new Accents.Entities.Login(user);
  //     });
  //   }else{
  //     console.log("Error occurred");
  //   }
  // });
  var user = {};
  if(typeof(Storage)!=="undefined"){
    var userSession = sessionStorage.getItem( "session-user" );
    if(userSession){
      user = $.parseJSON(userSession);
    }
  }
  Accents.user = new Accents.Entities.Login(user);

  // var opts = {batch_size: 100000, batches_limit:10};
  // var urlConnection = "http://" + Accents.domainRemoteDb + "/" + Accents.remoteDb;
  // Accents.db.sync(urlConnection,opts)
  // .on("complete",function(info){
  //   console.log("DB updated");
  //   Accents.Entities.Preload = new Accents.Entities.DBpage();
  //   sync(Accents.db);

  //   var user = {};
  //   if(typeof(Storage)!=="undefined"){
  //     var userSession = sessionStorage.getItem( "session-user" );
  //     if(userSession){
  //       user = $.parseJSON(userSession);
  //     }
  //   }
  //   Accents.user = new Accents.Entities.Login(user);
  // });
  
});

Accents.on("sync", function(){
  console.log("triggering list:term");
  Accents.trigger("list:term");
});

var sync = function(target){
  console.log("sync called");
  //var opts = {live: true, complete: onCompleteSync, batch_size: 100, batches_limit:100};
  var opts = {live: true, batch_size: 100000, batches_limit:10};
  var urlConnection = "http://" + Accents.domainRemoteDb + "/" + Accents.remoteDb;
  // PouchDB.replicate('accents', urlConnection, opts, function(err, data){ console.log("replicating local to remote");/*console.log(err); console.log(data); */});
  // PouchDB.replicate(urlConnection, 'accents', opts, function(err, data){ console.log("replicating remote to local");/*console.log(err); console.log(data);*/ });
  target.sync(urlConnection,opts)
  .on('uptodate', function (info) {
    console.log("DB is upto date");
    console.log(info);
  })
  .on('complete',function(info){
    console.log("Complete is fired; Error Syncing");
    console.log(info);
    onCompleteSync();
  });//Accents.Entities.Preload = new Accents.Entities.DBpage();
  target.compact();
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
