// inital setup
var PouchDB = require('pouchdb');

var exportProcess = require('./server/exportToTemp');
GLOBAL.PouchDB_opts={
		cache:false
	};

// if(process.env.NODE_ENV=='development'){
// 	console.log("running Dev");
	var db1 = "accents";
	var db2 = "accents_temp";
	// GLOBAL.db_name = 'http://chad:vanilla123@diacritics.iriscouch.com/'+db1;
	// GLOBAL.db_temp_name = 'http://chad:vanilla123@diacritics.iriscouch.com/'+db2;
	GLOBAL.db_name = 'http://localhost:5984/'+db1;
	GLOBAL.db_temp_name = 'http://localhost:5984/'+db2;
	//var db_hashName = 'http://localhost:5984/importexcelhashqueue';
	//GLOBAL.db = new PouchDB(GLOBAL.db_name);
	

	PouchDB.destroy(db1,function(err,info){
		PouchDB.destroy(db1,function(err,info){
			GLOBAL.db = new PouchDB(db1);
			//GLOBAL.db = new PouchDB(GLOBAL.db_name);
			GLOBAL.db_temp = new PouchDB(db2);
			var opts ={
				live: true,
				create_target: true,
				batch_size:500
			};
			console.log("replicating "+GLOBAL.db_name);
			GLOBAL.db.replicate.from(GLOBAL.db_name,{create_target:true,batch_size:1000})
			.on('complete',function(info){
				GLOBAL.db_temp.replicate.to(GLOBAL.db_temp_name,opts);
				GLOBAL.db_temp.replicate.from(GLOBAL.db_temp_name,opts);
				GLOBAL.db.replicate.to(GLOBAL.db_name,opts);
				GLOBAL.db.replicate.from(GLOBAL.db_name,opts);
				process.on('SIGTERM', function(){
				    console.log('terminating');
				    process.exit(1);
				});
				console.log("Starting Import Process");
				exportProcess.startProcess(null,null);	
			})
			.on('error',function(info){
				console.log(info);
			});
			
		});
	});
	
	// GLOBAL.db = new PouchDB(GLOBAL.db_name);
	// GLOBAL.db_temp = new PouchDB(GLOBAL.db_temp_name);

	//GLOBAL.db_hash = new PouchDB(db_hashName,PouchDB_opts);
// }else{
// 	console.log("running Prod");
// 	var remoteLocation = 'http://location:port/'
// 	GLOBAL.db_name = 'accents';
// 	GLOBAL.db_temp = 'accents_temp';
// 	var db_hashName = 'importexcelhashqueue';
// 	var remote = remoteLocation+GLOBAL.db_name;
// 	var remote_hash = remoteLocation+GLOBAL.db_hashName;


// process.on('SIGTERM', function(){
//     console.log('terminating');
//     process.exit(1);
// });
// console.log("Starting Import Process");
// exportProcess.startProcess(null,null);