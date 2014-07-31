// inital setup
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var PouchDB = require('pouchdb');
GLOBAL.router = express.Router();

// configuration ===============================================================

var port = process.env.PORT || 9876;
//var exportProcess = require('./server/webReview');
GLOBAL.PouchDB_opts={
		cache:false
	};

if(process.env.NODE_ENV=='development'){
	console.log("running Dev");
	app.use(express.static(__dirname + '/public')); 
	app.use(logger('dev')); 						// log every request to the console
	app.use(bodyParser.json()); 							// parse application/json
	app.use(bodyParser.urlencoded({extended:true}));		// parse application/x-www-form-urlencoded

	GLOBAL.db_name = 'http://localhost:5984/accents';
	GLOBAL.db_temp = 'http://localhost:5984/accents_temp';
	//var db_hashName = 'http://localhost:5984/importexcelhashqueue';
	GLOBAL.db = new PouchDB(GLOBAL.db_name,GLOBAL.PouchDB_opts);
	//GLOBAL.db_hash = new PouchDB(db_hashName,PouchDB_opts);
}else{
	console.log("running Prod");
	app.use(express.static(__dirname + '/public')); 
	app.use(logger()); 								// log every request to the console - default settings
	app.use(bodyParser.json()); 							// parse application/json
	app.use(bodyParser.urlencoded({extended:true}));		// parse application/x-www-form-urlencoded

	var remoteLocation = 'http://location:port/'
	GLOBAL.db_name = 'accents';
	GLOBAL.db_temp = 'accents_temp';
	var db_hashName = 'importexcelhashqueue';
	var remote = remoteLocation+GLOBAL.db_name;
	var remote_hash = remoteLocation+GLOBAL.db_hashName;
	var opts ={
		live: true,
		create_target: true
	};
	
	GLOBAL.db.replicate.to(remote,opts);
	GLOBAL.db.replicate.from(remote,opts);
	//GLOBAL.db.replicate.to(remote_hash,opts);
	//GLOBAL.db.replicate.from(remote_hash,opts);
	GLOBAL.db = new PouchDB(GLOBAL.db_name,GLOBAL.PouchDB_opts);
	//GLOBAL.db_hash = new PouchDB(db_hashName,PouchDB_opts);
}
process.on('SIGTERM', function(){
    console.log('terminating');
    process.exit(1);
});
//load the routes
require('./server/routes')(GLOBAL.router);

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be from root /
app.use('/', GLOBAL.router);

//start our server
app.listen(port);
console.log('starting server at port '+port);