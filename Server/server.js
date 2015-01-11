
var pollServer = new PollServer();
var connection = new ConnectionHandler();
var polls = {};

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds){
			break;
		}
	}
}

var poll = {
	title : "",
	code : "",
	status : "close",
	quesion : "",
	answers : [],
	addNew : function(title, code){
		this.title = title;
		this.code = code;
		console.log("Poll added ("+code+")");
	},
	toString : function(){
		var str = "POLL "+this.code+" :\n";
		str += "Title : "+this.title+" \n";
		str += "Status : "+this.status+" \n";
		if (this.status == "open"){
			str += "Current Question : "+this.question+" \n";
			for(var i = 0; i < this.answers; i++){
				str += "Answer("+i+") : "+this.answers[i]+" \n";
			}
		}
		console.log(str);
	},
	reportAnswers: function(){
		for(var i = 0; i < this.answers.length; i++){
			console.log(this.answers[i]);
		}
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
		//connection.send(socket, "connected");
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
		socket.write(""+message);
		console.log("s->c"+REQ.connIndex(socket)+" : "+message);
	}

	// Handle server side commands
	this.serverReceive = function(message){
		// Remove the new line break at the end (regex wont work for some reason)
		message = message.substring(0,message.length-2);
		var messageSpl = message.split(".");
		// -> echo
		if (messageSpl[0]=="echo"){
			console.log(message);
		}
		// ->
		else if (messageSpl[0]==""){
		}
		// -> polls
		else if (messageSpl[0]=="polls"){
			if (polls.length == 0){ console.log("s -> No polls available"); }
			else{
				for(var code in polls){
					if (messageSpl[1]=="a"){ polls[code].toString(); }
					else { console.log("s -> Title : "+polls[code].title+" | Code : "+polls[code].code); }
				}
			}
		}
		// -> add
		else if (messageSpl[0]=="add"){
			var title = messageSpl[1];
			var courseCode = messageSpl[2];
			polls[courseCode] = poll;
			polls[courseCode].addNew(title, courseCode);
		}
		// -> open
		else if (messageSpl[0]=="open"){
			var code = messageSpl[1];
			if (polls[code]){
				polls[code].question = messageSpl[2];
				polls[code].status = "open";
				polls[code].answers = [];
			}
			else{ console.log("Error : This poll cannot be found."); }
		}
		// -> answer (For Debug)
		else if (messageSpl[0]=="answer"){
			var code = messageSpl[1];
			if (polls[code]){
				if (polls[code].status == "open"){
					polls[code].answers.push(messageSpl[2]);
				}
				else{ console.log("Error : Poll not open"); }	
			}
			else{ console.log("Error : This poll cannot be found."); }
		}
		// -> close
		else if (messageSpl[0]=="close"){
			var code = messageSpl[1];
			if (polls[code]){
				polls[code].status = "close";
				polls[code].question = "";
			}
			else{ console.log("Error : This poll cannot be found."); }
		}
		// -> report
		else if (messageSpl[0]=="report"){
			var code = messageSpl[1];
			if (polls[code]){
				polls[code].reportAnswers();
			}
			else{ console.log("Error : This poll cannot be found."); }
		}
		else{ console.log("cmderr"); }
	}

	// Handle messages from clients
	this.receive = function(socket, data){
		if (data == "connindex"){
			connection.send(socket, REQ.connIndex(socket));
		}
		else{
			// Command has more arguments
			var dataSpl = data.split(".");
			if (dataSpl[0] == "status") {
				var code = dataSpl[1];
				if (polls[code]){
					var tosend = polls[code].status;
					if (polls[code].status=="open"){ tosend+="."+polls[code].question }
						connection.send(socket, tosend);
				}
				else { connection.send(socket, "pollnotfound"); }
			}
			else if (dataSpl[0] == "answer") {
				var code = dataSpl[1];
				if (polls[code]){
					if (polls[code].status == "open"){
						polls[code].answers.push(dataSpl[2]);
						connection.send(socket, "success");
					}
					else{ connection.send(socket, "pollclosed"); }
				}
				else { connection.send(socket, "pollnotfound"); }
			}
			else {
				connection.send(socket, "cmderr");
				console.log(dataSpl);
			}
		}
	}

	// Send message to all connected clients
	this.broadcast = function(message){
		for(var i = 0; i<connection.connections.length; i++){
			if (connection.connections[i] != null){
				connection.connections[i].write(""+message);
			}
		}
		console.log("s->all : "+message);
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


