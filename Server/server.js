
var pollServer = new PollServer();
var connection = new ConnectionHandler();
var polls = [];

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds){
			break;
		}
	}
}

function Poll(){
	// Static
	var title = "";
	var code = "";
	// Dynamic
	var status = "close";
	var quesion = "";
	var answers = [];

	this.addNew = function(title, code){
		this.title = title;
		this.code = code;
		console.log("Poll added ("+code+")");
	}

	this.toString = function(){
		var str = "POLL "+this.code+" :\n";
		str += "Title : "+this.title+" \n";
		str += "Status : "+this.status+" \n";
		if (this.status == "open"){
			str += "Current Question : "+this.question+" \n";
			for(var i = 0; i < this.answers; i++){ str += "Answer("+i+") : "+this.answers[i]+" \n"; }
		}
		console.log(str);
	}
}



function PollServer(){
	this.net = require("net");
	this.PORT = 8000;
	this.create = function(){
		this.server = this.net.createServer(function(socket){
			connection.connect(socket); // Incoming Connection
		});
	}
	this.listen = function(){
		this.server.listen(this.PORT);
		console.log("...POLL Server Started...");
		console.log("Listening connections from port "+this.PORT);
	}
	this.terminate = function(){
		this.server.close();
	}
}

function ConnectionHandler(){
	this.connections = [];

	// Client connected
	this.connect = function(socket){
		socket.setEncoding("utf8");
		connection.connections.push(socket);
		connection.send(socket, "connected");
		this.listen(socket);
	}

	// Listen for actions
	this.listen = function(socket){
		this.dataListener(socket);
		this.errorListener(socket);
		this.disconnectListener(socket);
	}

	// Listen console commands
	this.serverCmdListener = function(){
		var ths = this;
		process.stdin.resume();
		process.stdin.setEncoding('utf8');
		var util = require('util');
		process.stdin.on('data', function (text) {
			var received = util.inspect(text);
			received = received.replace(/\'/gm,"");
			ths.serverReceive(received);
		});
	}

	// Listen to client messages
	this.dataListener = function(socket){
		socket.on("data", function(data){
			data = data.replace(/^\s+|\s+$/g, '');
			console.log("s<-c"+REQ.connIndex(socket)+" : "+data);
			connection.receive(socket, data);
		});
	}
	
	// Listen to client errors
	this.errorListener = function(socket){
		socket.on("error", function(){
			//TODO: errors
		});
	}

	// Listen to client disconnects
	this.disconnectListener = function(socket){
		socket.on("end", function(){
			CMD.removeClient(socket);
			console.log("Client disconnected.");
		});
	}

	// Send client a message
	this.send = function(socket, message){
		socket.write(""+message+"#");
		console.log("s->c"+REQ.connIndex(socket)+" : "+message+"#");
	}

	// Handle server side commands
	this.serverReceive = function(message){
		// Remove the new line break at the end (regex wont work for some reason)
		message = message.substring(0,message.length-2);
		var messageSpl = message.split(".");
		if (messageSpl[0]=="echo"){
			console.log(message);
		}
		else if (messageSpl[0]==""){
		}
		else if (messageSpl[0]=="polls"){
			if (polls.length == 0){ console.log("s -> No polls available"); }
			else{
				for(var i = 0; i < polls.length; i++){
					if (messageSpl[1]=="a"){ polls.toString(); }
					else { console.log("s -> Title : "+polls[i].title+" | Code : "+polls[i].code); }
				}
			}
		}
		else if (messageSpl[0]=="add"){
			var title = messageSpl[1];
			var courseCode = messageSpl[2];
			var poll = new Poll();
			poll.addNew(title, courseCode);
			polls.push(poll);
		}
		else if (messageSpl[0]=="open"){
		}
	}

	// Handle messages from clients
	this.receive = function(socket, data){
		if (data == "connindex"){
			connection.send(socket, REQ.connIndex(socket));
		}
		else{
			// Command has more arguments
			var dataSpl = data.split(" ");
			if (dataSpl[0] == "lorem"){
				// do stuff with dataSpl[1]
			}
			else { connection.send(socket, "cmderr"); }
		}
	}

	// Send message to all connected clients
	this.broadcast = function(message){
		for(var i = 0; i<connection.connections.length; i++){
			if (connection.connections[i] != null){
				connection.connections[i].write(""+message+"#");
			}
		}
		console.log("s->all : "+message+"#");
	}
}
// Commands
var CMD = {
	removeClient: function(socket){
		var i = REQ.connIndex(socket);
		connection.connections.splice(i, 1);
	}
}
// Requests
var REQ = {
	connIndex: function(socket){
		return ""+connection.connections.indexOf(socket);
	},
	connCount: function(){
		return ""+connection.connections.length;
	}
}

// *** MAIN *** //
pollServer.create();
pollServer.listen();
connection.serverCmdListener();


