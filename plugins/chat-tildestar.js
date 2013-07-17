module.exports = function(options,dependencies){
var app = dependencies.app,
	io=dependencies.io,
	port=options.port,
	authentication=dependencies.authentication,
	When=dependencies.When,
	Q=dependencies.Q,
	async=dependencies.async
	_=dependencies._;



// serving the main applicaion file (index.html)
// when a client makes a request to the app root
// (http://localhost:8080/)
app.get('/', function (req, res) {
	res.sendfile('./public/index.html');
});


// hash object to save clients data,
// { socketid: { clientid, nickname }, socketid: { ... } }
var chatClients = new Object();

var apiMap = {connect:function(socket,user,data){ //official exposed socket.io event
					// after connection, the client sends us the 
					// nickname through the connect event
					//socket argument should be used in further communication with the client.
					connect(socket, data);
				},
				//socket.on('message', function(message,callback){}); //official exposed socket.io event
				chatmessage:function(socket,user,data){ //custom socket.io event
					// when a client sends a messgae, he emits
					// this event, then the server forwards the
					// message to other clients in the same room
					chatmessage(socket, data);
				},
				subscribe:function(socket,user,data){  //custom socket.io event
					// client subscribtion to a room
					subscribe(socket, data);
				},
				unsubscribe:function(socket,user,data){ //custom socket.io event
					// client unsubscribtion from a room
					unsubscribe(socket, data);
				},
				disconnect:function(socket,user,data){ //official exposed socket.io event
					// when a client calls the 'socket.close()'
					// function or closes the browser, this event
					// is built in socket.io so we actually dont
					// need to fire it manually
					disconnect(socket);
				}
			}




// socket.io events, each connection goes through here
// and each event is emited in the client.
// I created a function to handle each event
// see the docs for more info https://github.com/LearnBoost/socket.io/wiki/Exposed-events
io	.of('/chat')
	.on('connection', function(socket){
		//console.log(typeof socket)
		var address = socket.handshake.address;
		//console.log(socket)
		console.log("New connection from address"+ address.address + ":" + address.port);
		
		async.waterfall([function(callback){
				//queue this information to be handled later
				callback(null,authentication(socket));
			},
		function(user,callback){
			console.log('user',user)

			
			// var apiPerUserType = {
			// 	premium:apiMap,
			// 	varified:apiMap,
			// 	user:apiMap,
			// 	observer:apiMap,
			// 	lurker:apiMap,
			// 	unknown:apiMap,
			// 	delay:userAPI
			// };

			_.each(apiMap,function(value,key,obj){
				var func = (user.type=='delay')?
						_.bind(_.delay,undefined,value,1000,socket,user):
						_.bind(value,undefined,socket,user);
		 		socket.on(key, func);	
			})

			callback(null);
			}
		])
	});

// create a client for the socket
var connect = function $_connect(socket, data){
	//generate clientId
	data.clientId = generateId();
	console.log(data)
	// save the client to the hash object for
	// quick access, we can save this data on
	// the socket with 'socket.set(key, value)'
	// but the only way to pull it back will be
	// async
	chatClients[socket.id] = data;

	// now the client objtec is ready, update
	// the client
	socket.emit('ready', { clientId: data.clientId });
	
	// auto subscribe the client to the 'lobby'
	subscribe(socket, { room: 'lobby' });

	// sends a list of all active rooms in the
	// server
	socket.emit('roomslist', { rooms: getRooms() });
}

// when a client disconnect, unsubscribe him from
// the rooms he subscribed to
var disconnect = function $_disconnect(socket){
	// get a list of rooms for the client
	var rooms = io.sockets.manager.roomClients[socket.id];
	
	// unsubscribe from the rooms
	for(var room in rooms){
		if(room && rooms[room]){
			unsubscribe(socket, { room: room.replace('/','') });
		}
	}

	// client was unsubscribed from the rooms,
	// now we can selete him from the hash object
	delete chatClients[socket.id];
}

// receive chat message from a client and
// send it to the relevant room
var chatmessage = function $_chatmessage(socket, data){
	// by using 'socket.broadcast' we can send/emit
	// a message/event to all other clients except
	// the sender himself
	socket.broadcast.to(data.room).emit('chatmessage', { client: chatClients[socket.id], message: data.message, room: data.room });
}

// subscribe a client to a room
var subscribe = function $_subscribe(socket, data){
	// get a list of all active rooms
	var rooms = getRooms();

	// check if this room is exist, if not, update all 
	// other clients about this new room
	if(rooms.indexOf('/' + data.room) < 0){
		socket.broadcast.emit('addroom', { room: data.room });
	}

	// subscribe the client to the room
	socket.join(data.room);

	// update all other clients about the online
	// presence
	updatePresence(data.room, socket, 'online');

	// send to the client a list of all subscribed clients
	// in this room
	socket.emit('roomclients', { room: data.room, clients: getClientsInRoom(socket.id, data.room) });
}

// unsubscribe a client from a room, this can be
// occured when a client disconnected from the server
// or he subscribed to another room
var unsubscribe = function $_unsubscribe(socket, data){
	// update all other clients about the offline
	// presence
	updatePresence(data.room, socket, 'offline');
	
	// remove the client from socket.io room
	socket.leave(data.room);

	// if this client was the only one in that room
	// we are updating all clients about that the
	// room is destroyed
	if(!countClientsInRoom(data.room)){

		// with 'io.sockets' we can contact all the
		// clients that connected to the server
		io.sockets.emit('removeroom', { room: data.room });
	}
}

// 'io.sockets.manager.rooms' is an object that holds
// the active room names as a key, returning array of
// room names
var getRooms= function $_getRooms(){
	return Object.keys(io.sockets.manager.rooms);
}

// get array of clients in a room
var getClientsInRoom= function $_getClientsInRoom(socketId, room){
	// get array of socket ids in this room
	var socketIds = io.sockets.manager.rooms['/' + room];
	var clients = [];
	
	if(socketIds && socketIds.length > 0){
		socketsCount = socketIds.lenght;
		
		// push every client to the result array
		for(var i = 0, len = socketIds.length; i < len; i++){
			
			// check if the socket is not the requesting
			// socket
			if(socketIds[i] != socketId){
				clients.push(chatClients[socketIds[i]]);
			}
		}
	}
	
	return clients;
}

// get the amount of clients in aroom
var countClientsInRoom = function $_countClientsInRoom(room){
	// 'io.sockets.manager.rooms' is an object that holds
	// the active room names as a key and an array of
	// all subscribed client socket ids
	if(io.sockets.manager.rooms['/' + room]){
		return io.sockets.manager.rooms['/' + room].length;
	}
	return 0;
}

// updating all other clients when a client goes
// online or offline. 
var updatePresence = function $_updatePresence(room, socket, state){
	// socket.io may add a trailing '/' to the
	// room name so we are clearing it
	room = room.replace('/','');

	// by using 'socket.broadcast' we can send/emit
	// a message/event to all other clients except
	// the sender himself
	socket.broadcast.to(room).emit('presence', { client: chatClients[socket.id], state: state, room: room });
}

// unique id generator
var generateId = function $_generateId(){
	var S4 = function () {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	};
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

// show a message in console
console.log('Chat server is running and listening to port %d...', port);
}