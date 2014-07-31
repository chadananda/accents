//require our md5check
console.log(process.cwd());
//var exportProcess = require(__dirname +'/exportProcess')
//setup our routes
module.exports = function(router){
	router.route('/')
		.get(function(req, res) {
			//server the demo landing page
			res.sendfile('./public/index.html'); // so this really doesn't have to be index.html
		});
}