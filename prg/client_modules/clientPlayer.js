//==============================================================================
// Player module
//==============================================================================
const util = require('util')

var type = "player";  // module type identifier
var host;

module.exports = {
  type: type,
  createInput: ClientPlayer,
  createOutput: ClientPlayer,
  init: function(hostAPI){
    host = hostAPI;
  }
}

var client_io = require('./client_io');
function ClientPlayer(name){
  //var _this = this;
  console.log("Client Player");
  var io = client_io(type, name);
  io.owner = "user"; //removable
  var startMsec = 0;
  var messages = []; //辞書を突っ込む
  var intervalRef = null;
  var currentIndex = 0;

  // input
  io.listenMessage = function(){
  };

  // output
  io.sendMessage = function(msg){
    //console.log("player send message" + msg.address);
    //host.sendMessageTo(this.socketId, "message_json", msg);
  };

  // non io module functions

  io.loadData = function(data) {
    messages = data;
    //console.log("data"+messages)
  }

  io.startPlay = function() {
    console.log("startPlay");
    currentIndex = 0;
    startMsec = 0;

    if (intervalRef != null) {
      clearInterval(intervalRef);
    }
    var d = new Date();
    startMsec = d.getTime();

    var _this = this;
    var intervalFunc = function() {
      var date = new Date();
      var elapsed = date.getTime() - startMsec;
      if (messages.length > currentIndex && messages[currentIndex].time < elapsed) {
        console.log(util.inspect(messages[currentIndex].msg,false, null));
        host.deliverMessage(_this.id, messages[currentIndex].msg); // 配信
        ++currentIndex;
      }

      if (messages.length <= currentIndex) {
        console.log("stop playing");
        clearInterval(intervalRef);
      }
    }
    intervalRef = setInterval(intervalFunc, 1);
  }

  io.stopPlay = function() {
    currentIndex = 0;
    startMsec = 0;
    if (intervalRef != null) {
      clearInterval(intervalRef);
    }
  }

  return io;
}
