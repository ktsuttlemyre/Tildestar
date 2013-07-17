//DO NOT USE
//DO NOT USE
module.exports = function(options,env){
var app = env.app,
	express = env.express,
	io=env.io,
	server=env.server,
	port=env.port,
	dir=env.dir;
// configure express, since this server is
// also a web server, we need to define the
// paths to the static files
//app.use("/styles", express.static(__dirname + '/public/styles'));
//app.use("/scripts", express.static(__dirname + '/public/scripts'));
//app.use("/images", express.static(__dirname + '/public/images'));
app.use(express.static(dir.staticContent));
}