module.exports = function(options,dependencies){
var app = dependencies.app,
	express = dependencies.express,
	io=dependencies.io,
	server=dependencies.server,
	port=options.port,
	dir=options.dir,
	_=dependencies._,
	URI=dependencies.URI,
	passport=dependencies.passport,
	ensureLoggedIn=dependencies.ensureLoggedIn;


var root = options.routeRoot || '';

app.get(root+'/:id', function (req, res) {
	res.send('Welcome to the ' + req.params.id + ' page');
});

app.get(root+'/user/:id', function (req, res) {
	res.send('Welcome to the ' + req.params.id + ' page');
});

app.post


}