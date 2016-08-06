var APP_PORT = 8090;
var HUB_ADDR = 'http://localhost:16080'

var express = require('express');
var app = express();
var http = require('http').Server(app);
var fs = require('fs');
var io = require('socket.io')(http);

var noteons = {};
var allClients = [];

app.use(express.static(__dirname));
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
http.listen(APP_PORT);

// midi socket connects to the hub as json client
var midiSocket = require('socket.io-client').connect(HUB_ADDR);
midiSocket.on('connect', function() {
  console.log('[MidiSocket] Establishing connection');
  midiSocket.emit('join_as_wsjson', {name: 'Touch Example'});
});

// clinet connection
// clients send xy message via io.socket
// then this server send note on to the hub via midiSocket
//io.set('heartbeat interval', 100);
//io.set('heartbeat timeout', 1000);

io.sockets.on('connection', function(socket) {
  allClients.push(socket);
  socket.emit('usernumber', {'number':allClients.length-1}  );

  socket.on('disconnect', function(args) {
    var i = allClients.indexOf(socket);
    allClients.splice(i,1);

    for(var i = 0; i < allClients.length; ++i) {
      allClients[i].emit('usernumber', {'number':i}  );
    }
  });
  socket.on('down', function(args) {
    console.log("down");
    var ch = args.ch;
    var notenum = clamp(Math.round(args.x * 127), 0, 127);
    var velocity = clamp(Math.round(args.y * 127), 20, 127);;
    var noteArg = [ch, notenum, velocity];
    var msg = {address:'/midi/noteon', args: noteArg};

    console.log("socket id:" + socket.id + " xy args:" + args.x + "," + args.y);
    console.log("ON channel:" + ch + " notenum:" + notenum + " velocity:" + velocity);
    console.log("send test midi message");

    noteons[args.id.toString()] = notenum;
    midiSocket.emit('message_json', msg);
  });

  socket.on('up', function(args) {
    console.log(noteons);
    if (args.id in noteons) {
      var ch = args.ch;
      var notenum = noteons[args.id.toString()];
      var velocity = 0
      var noteArg = [ch, notenum, velocity];
      var msg = {address:'/midi/noteoff', args: noteArg};

      console.log("socket id:" + socket.id + " xy args:" + args.x + "," + args.y);
      console.log("OFF channel:" + ch + " notenum:" + notenum + " velocity:" + velocity);
      console.log("send test midi message");

      midiSocket.emit('message_json', msg);
    }
  });
});

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

var timerFunction = function () {
  console.log("connected clients:" + allClients.length);
  for(var i = 0; i < allClients.length; ++i) {
    allClients[i].emit('usernumber', {'number':i}  );
  }
  setTimeout(timerFunction,3000);
}
timerFunction();
