//Interactive Debugger attmpt
//var agent = require('webkit-devtools-agent');


//////////////////////////////////
//		Options
/////////////////////////////////
// Command Line Options
var argv = require('optimist')
    	.usage('Usage: $0 -logToMongo [num]')
    	//.demand(['x','y'])
		.argv

//Internal Options
var port 	= process.env.VCAP_APP_PORT || 3000,
	dir 	= {	plugins:'./plugins',
				staticContent:'./public'};

///////////////////////////////////
//		General use Libraries
//////////////////////////////////
var util = require('util')
	,_=require('lodash')
	,URI = require('URIjs')

//Flow control
var q = 'test' == process.env.NODE_ENV
	,Q = require('q')
	,async = require('async')
	,Backbone = require('backbone');

//my own models
	//models = require('./models/models')
	//, auth = require('./lib/auth');

//syntax sugar
var When = _.bind(Q.when,Q);

//User Authentication libraries
//	These libraries will be used to determine who a connection belongs to (malitious or legit) (observer, user or crawler)
//	and attempt to determine how much the server we can trust them
var p = require('ua-parser');


/*console.log(p.parseUA(navigator.userAgent).toString());
// -> "Safari 5.0.1"
console.log(p.parseOS(navigator.userAgent).toString());
// -> "iOS 5.1"
console.log(p.parseDevice(navigator.userAgent).toString());
// -> "iPhone"
*/


/////////////////////////////////
//		Templates
//////////////////////////////////

//var templates = require('tmpl');

/////////////////////////////////
//			Create server
/////////////////////////////////
// listening to 'port', we are creating an express
// server and then we are binding it with socket.io
var express = require('express') //express.createServer() is deprecated, express applications no longer inherit from http.Server
	,app		= express()
	,server	= require('http').createServer(app)
	,io			= require('socket.io').listen(server, {'flash policy port': -1})
	,flash = require('connect-flash') //https://github.com/jaredhanson/connect-flash

/////////////////////////////////////
//		Server Security
////////////////////////////////////
var passport = require('passport')
	,LocalStrategy = require('passport-local').Strategy
	,TwitterStrategy = require('passport-twitter').Strategy
	,ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn
	,FacebookStrategy = require('passport-facebook').Strategy
	,GoogleStrategy = require('passport-google').Strategy;


//extend express to include a router map
app.map = function(a, route){
	route = route || '';
	for (var key in a) {
		switch (typeof a[key]) {
			// { '/path': { ... }}
			case 'object':
				app.map(a[key], route + key);
				break;
			// get: function(){ ... }
			case 'function':
				if (verbose) console.log('%s %s', key, route);
				app[key](route, a[key]);
				break;
		}
	}
};


/////////////////////////////////
//		Set the production var
//////////////////////////////////
var production = false;
if ('production' == app.settings.env) {
	console.log('In production mode');
	production = true;
}else{
	console.log('In Dev Mode');
}


/////////////////////////////////////////
//		Make A mongo DB connection
////////////////////////////////////////
var Mongo		= require('mongodb'),
	MongoDB		= Mongo.Db,
	MongoServer	= Mongo.Server,
	BSON 		= Mongo.BSONPure;

//GET Database connections
var mongoLogin={hostname:'localhost',
	port:27017,
	"username":"",
    "password":"",
    "name":"",
	db:'tildestar'};

//if running in production mode then load those settings
if(process.env.VCAP_SERVICES){
	var env = JSON.parse(process.env.VCAP_SERVICES||'');
	var mongoEnvOpts = env['mongodb-1.8'][0]['credentials'];
	_.each(mongoEnvOpts,function(value,key,obj){
		mongoLogin=mongoEnvOpts[key] || mongoLogin[key];
		})
}

var mongoURL = function(mongoLogin){
    if(mongoLogin.username && mongoLogin.password){
        return "mongodb://" + mongoLogin.username + ":" + mongoLogin.password + "@" + mongoLogin.hostname + ":" + mongoLogin.port + "/" + mongoLogin.db;
    }
    else{
        return "mongodb://" + mongoLogin.hostname + ":" + mongoLogin.port + "/" + mongoLogin.db;
    }
}(mongoLogin);

var mongoServer = new MongoServer(mongoLogin.hostname, mongoLogin.port, {auto_reconnect: true});

/* establish the database connection */
var db = new MongoDB(mongoLogin.db, mongoServer, {w: 1});
	db.open(function(e, d){
	if (e) {
		console.log(e);
	}	else{
		console.log('connected to database :: ' + mongoLogin.db);
	}
});

// db.open(function(err, db) {
//     if(!err) {
//         console.log("Connected to 'winedb' database");
//         db.collection('wines', {safe:true}, function(err, collection) {
//             if (err) {
//                 console.log("The 'wines' collection doesn't exist. Creating it with sample data...");
//                 populateDB();
//             }
//         });
//     }
// });


/*

//Node.JS console source 
//https://github.com/joyent/node/blob/master/lib/console.js

//Inspiration for streamHook
//https://gist.github.com/pguillory/729616
function streamHook(stream,callback) {
    var old_write = process[stream].write
 
    process[stream].write = (function(write) {
        return function(string, encoding, fd) {
            write.apply(process[stream], arguments)
            callback(string, encoding, fd)
        }
    })(process[stream].write)
 
    return function() {
        process[stream].write = old_write
    }
}

var unhookStdout = streamHook('stdout',function(string, encoding, fd) {
    util.debug('hooked: ' + util.inspect(string))
});
var unhookStderr = streamHook('stderr',function(string, encoding, fd) {
    util.debug('hooked: ' + util.inspect(string))
});

 
console.log('a')
console.log('b')
  
console.log('c','p')
console.log('d')
console.warn('d.1')
console.error('d.2')
console.log('log')
 
unhookStdout()
unhookStderr()

console.log('e')
console.log('f')

///end Stream Hook



//Cluster node ID output
module.exports = function(mediator) {

    var fs          = require('fs'),
        path        = require('path'),
        config      = require('../../config'),
        env         = process.env,
        stdout      = process.stdout,
        stderr      = process.stderr,
        workerId    = env.NODE_WORKER_ID || env.NODE_UNIQUE_ID,
        logDir      = config.debug.logDir,
        stdoutFile  = path.resolve(logDir, 'worker#' + workerId + '.log'),
        stderrFile  = path.resolve(logDir, 'worker#' + workerId + '.err.log');

    //run prior to boot ready
    mediator.once('boot.init', function() {

        //create a new stdout file stream
        var stdoutFS = fs.createWriteStream(stdoutFile, {
            encoding: 'utf8',
            flags   : 'a+'
        });

        //create a new stderr file stream
        var stderrFS = fs.createWriteStream(stderrFile, {
            encoding: 'utf8',
            flags   : 'a+'
        });

        //pipe stdout to a worker file
        var unhookStdout = hook_writestream(stdout, function(string, encoding, fd) {
            stdoutFS.write(string, encoding || 'utf8');
        });
        console.log('\n\nPrepared new stdout hook to worker file.');

        //pipe stderr to a worker file
        var unhookStderr = hook_writestream(stderr, function(string, encoding, fd) {
            stderrFS.write(string, encoding || 'utf8');
        });
        console.log('\n\nPrepared new stderr hook to worker file.');

        //unhook when things go wrong
        stdoutFS.once('close', function() {
            unhookStdout();
            console.log('Unhooked stdout.');
        });
        stdoutFS.once('error', function(err) {
            unhookStdout();
            console.error('Error: Unhooked stdout due to error %j.', err);
        });
        stderrFS.once('close', function() {
            unhookStderr();
            console.log('Unhooked stderr.');
        });
        stderrFS.once('error', function(err) {
            unhookStderr();
            console.error('Error: Unhooked stderr due to error %j.', err);
        });

    });

    function hook_writestream(stream, callback) {
        var old_write = stream.write;

        stream.write = (function(write) {
            return function(string, encoding, fd) {
                write.apply(stream, arguments);
                callback(string, encoding, fd);
            };
        })(stream.write);

        return function() {
            stream.write = old_write;
        };
    }

};

*/

//////////////////////////////////////
//		Winston Logging
//////////////////////////////////////
var winston = require('winston');
require('winston-mongodb').MongoDB;	// Requiring `winston-mongodb` will expose 
									// `winston.transports.MongoDB`

//Custom transport
  var WinstonConsole = winston.transports.CustomerLogger = function (options) {
    // Name this logger
    this.name = 'WinstonConsole';

    // Set the level from your options
    this.level = (options && options.level) || 'info';

    // Configure your storage backing as you see fit
    this.nodeConsole = global.console;
  };

  // Inherit from `winston.Transport` so you can take advantage
  // of the base functionality and `.handleExceptions()`.
  util.inherits(WinstonConsole, winston.Transport);

  WinstonConsole.prototype.log = function (level, msg, meta, callback) {
    // Store this message and metadata, maybe use some custom logic
    // then callback indicating success.
    //this.nodeConsole[level](msg); //excedes stack
    process.stdout.write(util.format.apply(this, [msg]) + '\n');
    //process.stdout.write(msg + '\n'); //[level](msg);
    callback(null, true);
  };

//Log level notes
// input: 1,
// verbose: 2,
// prompt: 3,
// debug: 4,
// info: 5,
// data: 6,
// help: 7,
// warn: 8,
// error: 9


var logger;
if(production||argv.logToMongo){
	console.log('creating winston-mongo logger')
	logger = new winston.Logger({
		transports: [
		new winston.transports.MongoDB({
					level		: 'info'					//Level of messages that this transport should log, defaults to 'info'.
															// if you want all logs, including verbose to go into mongo
					,silent		: false						//Boolean flag indicating whether to suppress output, defaults to false.
					,db			: mongoLogin.db				//The name of the database you want to log to. [required]
					,collection	: 'log'						//The name of the collection you want to store log messages in, defaults to 'log'.
					,safe		: true						//Boolean indicating if you want eventual consistency on your log messages, if set to true it requires an extra round trip to the server to ensure the write was committed, defaults to true.
					,host		: mongoLogin.hostName		//The host running MongoDB, defaults to localhost.
					,port		: mongoLogin.port			//The port on the host that MongoDB is running on, defaults to MongoDB's default port.
					,username	: mongoLogin.username		// The username to use when logging into MongoDB.
					,password	: mongoLogin.password		//The password to use when logging into MongoDB. If you don't supply a username and password it will not use MongoDB authentication.
					,errorTimeout:10						//Reconnect timeout upon connection error from Mongo, defaults to 10 seconds (10000).
					,timeout	: 10						//Timeout for keeping idle connection to Mongo alive, defaults to 10 seconds (10000).
					,handleExceptions: true
				})
			//,new WinstonConsole()
			//,new (winston.transports.Console)()
	]});

	logger.exitOnError = false;
	logger.padLevels = false; // do not pad levels


	// logger.log = function(){
	// 	var log = logger.log;
	// 	var args = Array.prototype.slice.call(arguments, 0);
	// 	args.unshift('info')
	// 	log.apply(logger,args);
	//}
	//global.console = logger;

	//http://nodejs.davidherron.com/2012/08/overriding-consolelog-in-nodejs-and.html
	var logInterface={};
	var consoleKeys=['log','info','warn','error','dir','time','timeEnd','trace','assert'];


	global.console={};
	global.console = logger;
	_.each(logger,function(value,key,obj){
		console[key]=value
		//logInterface[key]=value;
	})
	console.log = _.bind(logger.log,logger,'info');
	console.log('Started logging to Mongo at '+new Date)
}else{
	//transports.push(

	//	)
}



console.log({console:'json'})
console.log('string')
console.error('err')
console.warn('warn')



////////////////////////////////////
//	 Require redis 
//	 and setup the client 
//////////////////////////////////////////
var redis = require('redis')
		, rc = redis.createClient();
rc.on('error', function (err) {
		console.log('Error ' + err);
});



//http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
var generateGUID=function(format){
	format=format||'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
	return format.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
}


////////////////////////////////////////////////////
//				Set Config properties
/////////////////////////////////////////////////
var secret = 'mrex3HbIurJow2eq';

// our custom "verbose errors" setting
// which we can use in the templates
// via settings['verbose errors']
app.enable('verbose errors');
app.enable("jsonp jsonp");

// disable them in production
// use $ NODE_ENV=production node examples/error-pages
if (production) {
	app.disable('verbose errors');
}

app.use(express.favicon());

q || app.use(express.logger('dev'));




///////////////////////////////////////////////
//			Configure Express
////////////////////////////////////////////////

var msTimeInterval = {day : 86400000,hour:3600000};

app.use(express.compress());

app.use(express.logger());
app.use(express.cookieParser(/*'shhhh, very secret'*/)); //TODO change this

// // assign the engine to .html files
app.engine('html', require('consolidate').underscore);
// // set .html as the default extension 
app.set('view engine', 'html'); //TODO change this to lodash and use a caching system
 

app.set('views', __dirname + '/views');
app.enable('view cache')
//app.set('view engine', 'jade'); ----> Comment this out!! cause we use lodash
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.session({secret:secret}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
/*
app.use(function(req, res, next){
	if ( "GET" != req.method ) {
		next();
	}
	var uri=new URI(req.url);
	var suffix = uri.suffix();
	if(suffix=='json'){
		// req.accepted =[{
		// 	"value": "application/json",
		// 	"quality": 1.0,
		// 	"type": "application",
		// 	"subtype": "json"
		// }]
		//res.type('json');
		req.url = uri.filename(uri.filename().replace('.json','')).toString();
		//res.json({url:req.url,req:req.accepted});
		//res.redirect('/');
		//return;
	}else if(suffix=='txt'){
	
	}



		//res.status(404);
	
	// respond with html page
	// if (req.accepts('html')) {
	// 	//res.render('404', { url: req.url });
	// 	res.sendfile('./public/404.html')
	// 	return next();
	// }

	// respond with json
	
	//if (req.accepts('json')) {
		//res.writeHead(200, { 'Content-Type': 'application/json' });
		//res.jsonp(req.accepted);
		
	//	next();
	//}

	// // default to plain-text. send()
	// res.type('txt').send('Not found');
	next();
	
});*/

//<link rel="canonical" href="http://www.example.com/product.php?item=swedish-fish"/>
app.use(require("connect-slashes")(false)) //Alternatively, you can pass false as the only argument to .slashes() in order to remove trailing slashes instead of appending them

// "app.router" positions our routes 
// above the middleware defined below,
// this means that Express will attempt
// to match & call routes _before_ continuing
// on, at which point we assume it's a 404 because
// no route has handled the request.
app.use(app.router); //http://stackoverflow.com/questions/12695591/node-js-express-js-how-does-app-router-work

app.use(express.csrf());

//DEV NOTE:!!!!
//Usually, you want to put the router above the static middleware
// so that a accidentally-named file can't override one of your routes.



// configure express, since this server is
// also a web server, we need to define the
// paths to the static files
//app.use("/styles", express.static(__dirname + '/public/styles'));
//app.use("/scripts", express.static(__dirname + '/public/scripts'));
//app.use("/images", express.static(__dirname + '/public/images'));
//app.use(express.directory('public')) //allows users to browse the files too
app.use(express.static(dir.staticContent, { maxAge: msTimeInterval.hour })); //http://stackoverflow.com/questions/12695591/node-js-express-js-how-does-app-router-work





//var cacher = new require("cacher").("myhost:11211")
// as a global middleware
//app.use(cacher.cacheHourly())

//http://blog.luksidadi.com/expressjs-underscore-template/
// Add these lines to register underscore template
// //Dev note: app.register does not exist see
// https://github.com/ganarajpr/express-angular/issues/1
//var cache = Stallion.cache(25);
//app.engine('.html', function(path, options, fn){
	
	// fs.readFile(path, 'utf8', function(err, str){
	// if (err) return fn(err);
	// 	str = markdown.parse(str).toString();
	// 	fn(null, str);
	// });
//});
// app.register('.html', {
//   compile: function(str, options){
//     var compiled = _.template(str);
//     return function(locals) {
//         return compiled(locals);
//     };
//   }
// });

// Since this is the last non-error-handling
// middleware use()d, we assume 404, as nothing else
// responded.

// $ curl http://localhost:3000/notfound
// $ curl http://localhost:3000/notfound -H "Accept: application/json"
// $ curl http://localhost:3000/notfound -H "Accept: text/plain"

app.use(function(req, res, next){
	res.status(404);
	
	// respond with html page
	if (req.accepts('html')) {
		//res.render('404', { url: req.url });
		res.sendfile('./public/404.html')
		return next();
	}

	// respond with json
	if (req.accepts('json')) {
		res.send({ error: 'Not found' });
		return next();
	}

	// default to plain-text. send()
	res.type('txt').send('Not found');
});


app.use(function(req, res, next){
	res.status(404);
	
	// // respond with html page
	// if (req.accepts('html')) {
	// 	res.render('404', { url: req.url });
	// 	return;
	// }

	// // respond with json
	// if (req.accepts('json')) {
	// 	res.send({ error: 'Not found' });
	// 	return;
	// }

	// // default to plain-text. send()
	// res.type('txt').send('Not found');
});



// error-handling middleware, take the same form
// as regular middleware, however they require an
// arity of 4, aka the signature (err, req, res, next).
// when connect has an error, it will invoke ONLY error-handling
// middleware.

// If we were to next() here any remaining non-error-handling
// middleware would then be executed, or if we next(err) to
// continue passing the error, only error-handling middleware
// would remain being executed, however here
// we simply respond with an error page.

 // app.use(function(err, req, res, next){
 //	 // we may use properties of the error object
 //	 // here and next(err) appropriately, or if
 //	 // we possibly recovered from the error, simply next().
 //	 res.status(err.status || 500);
 //	 res.render('500', { error: err });
 // });













///////////////////////////////////////////////
//			Configure Socket.io
////////////////////////////////////////////////
io.enable('browser client minification');	// send minified client
io.enable('browser client etag');					// apply etag caching logic based on version number
io.enable('browser client gzip');					// gzip the file
// log level 2 we wont see all the heartbits
// of each socket but only the handshakes and
// disconnections
// 1 = reduce logging


// setting the transports by order, if some client
// is not supporting 'websockets' then the server will
// revert to 'xhr-polling' (like Comet/Long polling).
// for more configurations got to:
// https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO
io.configure('production', function(){
	console.log('socket.io configured to production mode')
	io.set('log level', 2); 
	// enable all transports (optional if you want flashsocket support,
	//please note that some hosting providers do not allow you to create
	// servers that listen on a port different than 80 or their default port)
	io.set('transports', [//'websocket' ,
				//'flashsocket' ,
				//'htmlfile' ,
				'xhr-polling' //, 
				// 'jsonp-polling'
	]);
	io.set("polling duration", 10); 
});

io.configure('development', function(){
	console.log('socket.io configured to dev mode')
	io.set('log level', 3); 
	io.set('transports', ['websocket',
			'flashsocket' ,
			'htmlfile' ,
			'xhr-polling'	,
			'jsonp-polling' ]);
});



 
 

///////////////////////////////////////////////////
//			Plugins
///////////////////////////////////////////////////

//custom modules
var Accounts = require(dir.plugins+'/account-manager.js')({
			server:mongoServer,
			url:mongoURL,
			db:db},
			{MongoDB:MongoDB}),
	authentication = function(){return {type:'premium'}}; //require(dir.plugins+"/authentication.js"),


var pass = require(dir.plugins+'/pass.js')
	(
		/* options [object*/
			{routeRoot:'/login',port:port,
			acceptedLogins:['local','facebook','twitter','google'],
			allowPasswordReminder:true,
			allowVisitorsSignup:true,
			onLoginRedirect:'/'
			},
		/*env [object]*/
		{
			app:app,io:io, URI:URI,
			When:When,Q:Q,async:async,
			_:_,passport:passport,
			ensureLoggedIn:ensureLoggedIn,
			authentication:authentication,
			LocalStrategy:LocalStrategy,
			TwitterStrategy:TwitterStrategy,
			FacebookStrategy:FacebookStrategy,
			GoogleStrategy:GoogleStrategy,
			Accounts:Accounts
			
		}
	);


var routes = require(dir.plugins+'/routes-tildestar.js')
		(// options [object
			{},
		//env [object]
			{app:app,io:io, URI:URI,
			When:When,Q:Q,async:async,
			_:_,passport:passport,
			ensureLoggedIn:ensureLoggedIn
		});

/*

var routes = require(dir.plugins+'/routes-q.js')
		(// options [object
			{},
		//env [object]
			{app:app,io:io, URI:URI,
			When:When,Q:Q,async:async,
			_:_,passport:passport,
			ensureLoggedIn:ensureLoggedIn});
*/

var chat = require(dir.plugins+'/chat-tildestar.js')
		(/* options [object*/
			{routeRoot:'/chat',port:port},
			{app:app,io:io,authentication:authentication,When:When,Q:Q,async:async,_:_}
		);
//var staticServer = require(dir.plugins+'/static-tildestar.js')
//		(/* options [object*/
//			{},//contentRoot:'./public'},
//		/*env [object]*/
//			env);
//			
var memeCabinet = require(dir.plugins+'/memeCabinet.js')
		(/* options [object*/
			{routeRoot:'/memeCabinet',port:port},
			{app:app,io:io,authentication:authentication,When:When,Q:Q,async:async,_:_}
		);
/*app.get('/admin/echo', function (req, res) {
	//var from=req.params.from,until=req.params.until,now = new Date();
	//res.type('json')
	//res.set('Content-Type', 'application/json');
	//res.contentType('application/json');
	//res.setHeader('Content-Type', 'application/json');

		res.format({
				text: function(){
					res.send('not Implemented');
			},
				html: function(){
					res.send('<html><body>Got Html'+req.url+' was '+req.originalUrl+'</body></html>')
			},
				json: function(){
					res.json({ msgId: 'dookie' })
			}
		});
	})*/



//http://stackoverflow.com/questions/10020099/express-js-routing-optional-spat-param
app.get('/admin/log/:from?/:until?', function (req, res) {
	var from=req.params.from,until=req.params.until,now = new Date();
	if(!from){
		from = new Date(0);
	}
	else if(from=='clear'||from=='delete'){
		db.collection('log').remove(function(){res.redirect('/admin/log')});
		return;
	}
	else if(from=='today'){
		from = new Date(now.getFullYear(),now.getMonth(),now.getDate());
	}else if(from=='help'){
		res.send('// Returns 807937200000 in time zone GMT-0300, and other values in other<br>\n'+
						'// timezones, since the argument does not specify a time zone.<br>\n'+
						'Date.parse("Aug 9, 1995");<br>\n'+
						'// Returns 807926400000 no matter the local time zone.<br>\n'+
						'Date.parse("Wed, 09 Aug 1995 00:00:00 GMT");<br>\n'+
						'// Returns 807937200000 in timezone GMT-0300, and other values in other<br>\n'+
						'// timezones, since there is no time zone specifier in the argument.<br>\n'+
						'Date.parse("Wed, 09 Aug 1995 00:00:00");<br>\n'+
						'// Returns 0 no matter the local time zone.<br>\n'+
						'Date.parse("Thu, 01 Jan 1970 00:00:00 GMT");<br>\n'+
						'// Returns 14400000 in timezone GMT-0400, and other values in other <br>\n'+
						'// timezones, since there is no time zone specifier in the argument.<br>\n'+
						'Date.parse("Thu, 01 Jan 1970 00:00:00");<br>\n'+
						'// Returns 14400000 no matter the local time zone.<br>\n'+
						'Date.parse("Thu, 01 Jan 1970 00:00:00 GMT-0400");<br>\n')
	}

	if(!until){
		until = now;
	}

	var options = {
		from: from,//new Date - 24 * 60 * 60 * 1000,
		until: until//new Date
	};
	if(!logger){
		res.send('Logger is currently off');
		return;
	}
	// Find items logged between today and yesterday.
	logger.query(options, function (err, results) {
		if (err) {
			throw err;
		}

		results = {from:from,until:until,results:results};

		res.format({
				text: function(){
					res.send('not Implemented');
			},
				html: function(){
					res.send('View logs from ' +from+ ' to ' +until+ ' date<br>\n'+
						'<pre>'+JSON.stringify(results,null,4)+'</pre>' // .replace(/[\n\r]/g, '<br>')
					)
			},
				json: function(){
					res.send(JSON.stringify(results));
			}
		});


	});
});




////////////////////////////////////////
//			Error handlers
////////////////////////////////////////
app.get('/404', function(req, res, next){
	// trigger a 404 since no other middleware
	// will match /404 after this one, and we're not
	// responding here
	next();
});

app.get('/403', function(req, res, next){
	// trigger a 403 error
	var err = new Error('not allowed!');
	console.warn('creating error');
	console.log('error coming')
	console.error('error')
	logger.error('shiiit')
	err.status = 403;
	next(err);
});

app.get('/500', function(req, res, next){
	// trigger a generic (500) error
	next(new Error('Someone broke something! We will look into our logs and take appropriate action'));
});

app.get('/robots.txt',function(req,res,next){ 
	console.log('possible robot requesting robots.txt\n user-agent: '+req.headers['user-agent']+' \n ip: ' +req.connection.remoteAddress);
	res.sendfile('./public/robots.txt')
})


if (!module.parent) {
	server.listen(port);
	console.log('Express started on port '+port);
	// process.on('uncaughtException', function(err) {
	// 	//TODO write these errors to database
	//   console.error(err.stack);
	// });
}