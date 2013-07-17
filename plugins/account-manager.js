
var accounts =null;
var db =null;


var crypto 		= require('crypto')
var moment 		= require('moment');


module.exports=function(options,dependiencies){
	return new (function(options,dependiencies){
	options=options||{};
	dependiencies=dependiencies||{};


accounts=options.db.collection('accounts');


this.login=function(profile,credentials,callback){
	switch(profile.provider){
		case 'tildestar':
			manualLogin(profile.displayName,credentials.password,callback);
			break;
		case 'twitter':
			//token,tokenSecret
		case 'google':
			//identifier
		case 'facebook':
			//accessToken,refreshToken
			callback(null,profile);
			break;
		default:
			callback(new Error('No hook for service type '+profile.provider));
	}
	//accessToken,refreshToken,profile,function(err,user){}
}

/* login validation methods */
var autologin = this.autoLogin = function(user, pass, callback)
{
	accounts.findOne({user:user}, function(e, o) {
		if (o){
			o.pass == pass ? callback(o) : callback(null);
		}	else{
			callback(null);
		}
	});
}

var manualLogin = this.manualLogin = function(user, pass, callback)
{
	accounts.findOne({user:user}, function(e, o) {
		if (o == null){
			callback('user-not-found');
		}	else{
			validatePassword(pass, o.pass, function(err, res) {
				if (res){
					callback(null, o);
				}	else{
					callback('invalid-password');
				}
			});
		}
	});
}

/* record insertion, update & deletion methods */

this.addNewAccount = function(newData, callback)
{
	accounts.findOne({user:newData.user}, function(e, o) {
		if (o){
			callback('username-taken');
		}	else{
			accounts.findOne({email:newData.email}, function(e, o) {
				if (o){
					callback('email-taken');
				}	else{
					saltAndHash(newData.pass, function(hash){
						newData.pass = hash;
					// append date stamp when record was created //
						newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
						accounts.insert(newData, {safe: true}, callback);
					});
				}
			});
		}
	});
}

this.updateAccount = function(newData, callback)
{
	accounts.findOne({user:newData.user}, function(e, o){
		o.name 		= newData.name;
		o.email 	= newData.email;
		o.country 	= newData.country;
		if (newData.pass == ''){
			accounts.save(o, {safe: true}, callback);
		}	else{
			saltAndHash(newData.pass, function(hash){
				o.pass = hash;
				accounts.save(o, {safe: true}, callback);
			});
		}
	});
}

this.updatePassword = function(email, newPass, callback)
{
	accounts.findOne({email:email}, function(e, o){
		saltAndHash(newPass, function(hash){
			o.pass = hash;
			accounts.save(o, {safe: true}, callback);
		});
	});
}

/* account lookup methods */

this.deleteAccount = function(id, callback)
{
	accounts.remove({_id: getObjectId(id)}, callback);
}

this.getAccountByEmail = function(email, callback)
{
	accounts.findOne({email:email}, function(e, o){ callback(o); });
}

this.validateResetLink = function(email, passHash, callback)
{
	accounts.find({ $and: [{email:email, pass:passHash}] }, function(e, o){
		callback(o ? 'ok' : null);
	});
}

this.getAllRecords = function(callback)
{
	accounts.find().toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};

this.delAllRecords = function(callback)
{
	accounts.remove({}, callback); // reset accounts collection for testing //
}

/* private encryption & validation methods */

var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function(pass, callback)
{
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
}

var validatePassword = function(plainPass, hashedPass, callback)
{
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
}

/* auxiliary methods */

var getObjectId = function(id)
{
	return accounts.db.bson_serializer.ObjectID.createFromHexString(id)
}

var findById = function(id, callback)
{
	accounts.findOne({_id: getObjectId(id)},
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};


var findByMultipleFields = function(a, callback)
{
// this takes an array of name/val pairs to search against {fieldName : 'value'} //
	accounts.find( { $or : a } ).toArray(
		function(e, results) {
		if (e) callback(e)
		else callback(null, results)
	});
}
})(options,dependiencies);
}