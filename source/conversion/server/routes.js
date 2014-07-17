//require our md5check
console.log(process.cwd());
var exportProcess = require(__dirname +'/exportProcess')
//setup our routes
module.exports = function(router){
	router.route('/')
		.get(exportProcess.startProcess);
}