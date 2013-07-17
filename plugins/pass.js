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
	ensureLoggedIn=dependencies.ensureLoggedIn,
	Accounts=dependencies.Accounts,
	LocalStrategy=dependencies.LocalStrategy,
	TwitterStrategy=dependencies.TwitterStrategy,
	FacebookStrategy =dependencies.FacebookStrategy,
	GoogleStrategy = dependencies.GoogleStrategy;
//Inspiration
//http://www.quietless.com/kitchen/building-a-login-system-in-node-js-and-mongodb/
//https://github.com/braitsch/node-login

var route = {login:'/login',
				userHome:options.onLoginRedirect,
				home:'/'
			};

passport.serializeUser(function(user, done) {
	done(null, user);
});
 
passport.deserializeUser(function(obj, done) {
	done(null, obj);
});


var loginStrategies ={
	local:function(){
		passport.use(new LocalStrategy({
			 usernameField: 'user',
				passwordField: 'pass'
			},
			function(username, password, done) {
				Accounts.login({provider:'tildestar',displayName:username},
						{password:password},
						function (err, user) {
							if (err) { return (_.isString(err))?done(null,false,{message:err}):done(err); }
							if (!user) {
								return done(null, false, { message: 'Incorrect username.' });
							}
							console.log(user)
							return done(null, user);
						});
			}
		));
	},


// app.get(route.login, function(req, res, next) {
//   passport.authenticate('local', function(err, user, info) {
//     //If authentication failed, user will be set to false.
//     // If an exception occurred, err will be set. 
//     //An optional info argument will be passed, containing 
//     //additional details provided by the strategy's verify callback.
//     if (err) { return next(err); }
//     if (!user) { return res.redirect(route.login); }
//      //application's responsibility to establish a session
//      //(by calling req.login()) and send a response.
//     req.logIn(user, function(err) {
//       if (err) { return next(err); }
//       return res.redirect(route.home +'#'+ user.username);
//     });
//   })(req, res, next);
// });
	twitter:function(){
		//https://github.com/jaredhanson/passport-twitter/issues/12
		//http://blog.nodeknockout.com/post/34765538605/getting-started-with-passport
		var TWITTER_CONSUMER_KEY = "iiFwvBfTYeLCdCKGzmOVxw";
		var TWITTER_CONSUMER_SECRET = "E7lB0l8XKnVKBszsUlyyurcSSGNkQjoUNm8F9942s";

		passport.use(new TwitterStrategy({
				consumerKey: TWITTER_CONSUMER_KEY,
				consumerSecret: TWITTER_CONSUMER_SECRET,
				callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
				//NOTE: the above must be the same url and subdomain that is in the app registry
				//DO NOT USE localhost when developing because that is not equal to 127.0.0.1
			},
			function(token, tokenSecret, profile, done) {
				// NOTE: You'll probably want to associate the Twitter profile with a
				//       user record in your application's DB.
				Accounts.login(profile,{token:token,tokenSecret:tokenSecret},function(err,user){
					if (err) { return done(err); }
				 
					return done(null, user);
				});
			}
		));
	},
	facebook:function(){
		var FACEBOOK_APP_ID = '500921256616684';
		var FACEBOOK_APP_SECRET = '45930cb43b1d50a948bfd032740af361';

		passport.use(new FacebookStrategy({
				clientID: FACEBOOK_APP_ID,
				clientSecret: FACEBOOK_APP_SECRET,
				callbackURL: "http://127.0.0.1:3000/auth/facebook/callback"
			},
			function(accessToken, refreshToken, profile, done) {
				Accounts.login(profile,
								{accessToken:accessToken,
								refreshToken:refreshToken},
								function(err,user){
					if (err) { return done(err); }
				 
					return done(null, user);
				});
			}
		));
	},
	google:function(){
		passport.use(new GoogleStrategy({
				returnURL: 'http://www.tildestar.com/auth/google/callback',
				realm: 'http://www.tildestar.com/'
			},
			function(identifier, profile, done) {
				Accounts.login(profile,{identifier:identifier},function(err,user){
					if (err) { return done(err); }
				 
					return done(null, user);
				});
			}
		));
}};


//set the accepted logins for this run
var redirectFailure = '/login#?serverMessage=unauthenticated'//new URI("/login").fragmentPrefix('?').addFragment("hello", "mars").toString();
_.each(options.acceptedLogins,function(value,key,object){
	if(value=='local'){
		app.post('/login',
			passport.authenticate('local', { successRedirect: route.userHome,
											failureRedirect: redirectFailure,
											failureFlash: true })
		);
	}
	var setup = loginStrategies[value];
	if(!setup){
		throw new Exception('There is not a setup for strategy '+value);
	}
	setup();
	// Redirect the user to profile.provider for authentication.  When complete, Google
	// will redirect the user back to the application at
	app.get('/auth/'+value, passport.authenticate(value));
	// <Provider> will redirect the user to this URL after authentication.  Finish
	// the process by verifying the assertion.  If valid, the user will be
	// logged in.  Otherwise, authentication has failed.

	app.get('/auth/'+value+'/callback',
	passport.authenticate(value, { successReturnToOrRedirect: route.UserHome, failureRedirect: redirectFailure }));
});


var binds = ['login']
_.each(binds,function(value,key,list){
	app.get('/'+value,
		function(req, res) {
			res.sendfile("./public/"+value+".html");
		});
})


//Routes
if(!options.allowVisitorsSignup){
	app.get('/signup',ensureLoggedIn('/login'),
		function(req, res) {
			res.sendfile("./public/signup.html");
		});
}else{
		app.get('/signup',
		function(req, res) {
			res.sendfile("./public/signup.html");
		});
}

var signup = function(req, res){
	var data = {
		name	: req.param('name'),
		email	 : req.param('email'),
		user	: req.param('user'),
		pass	: req.param('pass'),
		country : req.param('country')
	};
	console.log(data);
	Accounts.addNewAccount(data, function(e){
		if (e){
			res.send(e, 400);
		} else{
			res.send('ok', 200);
		}
	});
}

var todo=['/signup'];
if(!options.allowVisitorsSignup){
	todo.push(ensureLoggedIn('/login'));
}
todo.push(signup);

app.post.apply(app,todo);




/*
app.post('/login', passport.authenticate('local'),function(req, res){
		res.redirect('/account');
		/* Accounts.manualLogin(req.param('user'), req.param('pass'), function(e, o){
			if (!o){
				res.send(e, 400);
			} else{
					req.session.user = o;
				if (req.param('remember-me') == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.send(o, 200);
			}
		*});
	//});*/



	if(options.allowPasswordReminder){

		app.post('/lost-password', function(req, res){
		// look up the user's account via their email //
			AM.getAccountByEmail(req.param('email'), function(o){
				if (o){
					res.send('ok', 200);
					EM.dispatchResetPasswordLink(o, function(e, m){
					// this callback takes a moment to return //
					// should add an ajax loader to give user feedback //
						if (!e) {
						//	res.send('ok', 200);
						} else{
							res.send('email-server-error', 400);
							for (k in e) console.log('error : ', k, e[k]);
						}
					});
				} else{
					res.send('email-not-found', 400);
				}
			});
		});

		app.post('/reset-password', function(req, res) {
			var nPass = req.param('pass');
		// retrieve the user's email from the session to lookup their account and reset password //
			var email = req.session.reset.email;
		// destory the session immediately after retrieving the stored email //
			req.session.destroy();
			AM.updatePassword(email, nPass, function(o){
				if (o){
					res.send('ok', 200);
				} else{
					res.send('unable to update password', 400);
				}
			})
		});
	}

app.get('/logout',
	function(req, res) {
		req.logout();
		res.redirect(route.home);
	});
 
app.get('/account',
	ensureLoggedIn('/login'),
	function(req, res) {
		res.send('Hello ' + req.user.username);
	});

function restrict(req, res, next) {
	if (req.session.user) {
		next();
	} else {
		req.session.error = 'Access denied!';
		res.redirect('/login');
	}
}

app.get('/restricted', restrict, function(req, res){
	res.send('Wahoo! restricted area, click to <a href="/logout">logout</a>');
});


}