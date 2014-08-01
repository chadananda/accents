// inital setup
var PouchDB = require('pouchdb');

var exportProcess = require('./server/exportToTemp');
GLOBAL.PouchDB_opts={
		cache:false
	};

// if(process.env.NODE_ENV=='development'){
// 	console.log("running Dev");
	
	GLOBAL.db_name = 'http://chad:vanilla123@diacritics.iriscouch.com/accents2';
	GLOBAL.db_temp_name = 'http://chad:vanilla123@diacritics.iriscouch.com/accents_temp';
	//var db_hashName = 'http://localhost:5984/importexcelhashqueue';
	GLOBAL.db = new PouchDB("accents2");
	GLOBAL.db_temp = new PouchDB("accents_temp");
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
	var opts ={
		live: true,
		create_target: true,
		batch_size:500
	};
	var initopts = {
		create_target: true
	}
	
	console.log("replicating "+GLOBAL.db_name);
	GLOBAL.db.replicate.from(GLOBAL.db_name,initopts)

		.on('complete',function(info){
			console.log(GLOBAL.db_name+" done...");
			console.log("replicating "+GLOBAL.db_temp_name);

			GLOBAL.db_temp.replicate.from(GLOBAL.db_temp_name,initopts)

			.on('complete',function(info){
				console.log(GLOBAL.db_temp_name+" done...");
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
			.on('error',function(err){
				console.log("Error in replication of "+GLOBAL.db_temp_name);
				console.log(err);
			});
			// GLOBAL.db_temp.replicate.to(GLOBAL.db_temp_name,opts);
			// GLOBAL.db_temp.replicate.from(GLOBAL.db_temp_name,opts);
			// process.on('SIGTERM', function(){
			//     console.log('terminating');
			//     process.exit(1);
			// });
			// console.log("Starting Import Process");
			// exportProcess.startProcess(null,null);
		})
		.on('error',function(err){
			console.log("Error in replication of "+GLOBAL.db_name);
			console.log(err);
		});
	
// 	//GLOBAL.db.replicate.to(remote_hash,opts);
// 	//GLOBAL.db.replicate.from(remote_hash,opts);
// 	GLOBAL.db = new PouchDB(remoteLocation+GLOBAL.db_name,GLOBAL.PouchDB_opts);
// 	//GLOBAL.db_hash = new PouchDB(db_hashName,PouchDB_opts);
// }
// process.on('SIGTERM', function(){
//     console.log('terminating');
//     process.exit(1);
// });
// console.log("Starting Import Process");
// exportProcess.startProcess(null,null);