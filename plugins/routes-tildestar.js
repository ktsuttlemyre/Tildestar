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

app.get('/', function(req, res){
    res.sendfile('./public/logo.html');
  });

app.get('/echo/:echo', function (req, res) {
    res.send("<html><body>"+req.params.echo+"</body></html>");
  });


//does not work but here for understanding
app.get('/flash/:channel', function (req, res) {
    res.send("<html><body>"+req.flash(req.params.channel)+"</body></html>");
  });





/*

var map =
{ 
  "/login":{
      get: function(req, res){

      },
      post: function(req, res){

      },
      put: function(req, res){

      },
      del: function(req, res){

      }
    }
  }
}



var users = {
  list: function(req, res){
    res.send('user list');
  },

  get: function(req, res){
    res.send('user ' + req.params.uid);
  },

  del: function(req, res){
    res.send('delete users');
  }
};

var pets = {
  list: function(req, res){
    res.send('user ' + req.params.uid + '\'s pets');
  },

  del: function(req, res){
    res.send('delete ' + req.params.uid + '\'s pet ' + req.params.pid);
  }
};

app.map({
  '/users': {
    get: users.list,
    del: users.del,
    '/:uid': {
      get: users.get,
      '/pets': {
        get: pets.list,
        '/:pid': {
          del: pets.del
        }
      }
    }
  }
});*/

}