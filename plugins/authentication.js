
module.exports = function(options,env){
var app = env.app,
  express = env.express,
  io=env.io,
  server=env.server,
  port=env.port,
  dir=env.dir;

 //This module is used for tracking users to see if they are 

// Create a MySQL connection pool with
// a max of 10 connections, a min of 2, and a 30 second max idle time
var poolModule = require('generic-pool');
var pool = poolModule.Pool({
    name     : 'mysql',
    create   : function(callback) {
        var Client = require('mysql').Client;
        var c = new Client();
        c.user     = 'scott';
        c.password = 'tiger';
        c.database = 'mydb';
        c.connect();

        // parameter order: err, resource
        // new in 1.0.6
        callback(null, c);
    },
    destroy  : function(client) { client.end(); },
    max      : 10,
    // optional. if you set this, make sure to drain() (see step 3)
    min      : 2, 
    // specifies how long a resource can stay idle in pool before being removed
    idleTimeoutMillis : 30000,
     // if true, logs via console.log - can also be a function
    log : true 
});

this.newsocketIOConnetion=function(socketIO){
	// acquire connection - callback function is called
	// once a resource becomes available
	pool.acquire(function(err, client) {
	    if (err) {
	        // handle error - this is generally the err from your
	        // factory.create function  
	    }
	    else {
	        client.query("select * from foo", [], function() {
	            // return object back to pool
	            pool.release(client);
	        });
	    }
	});
}


}