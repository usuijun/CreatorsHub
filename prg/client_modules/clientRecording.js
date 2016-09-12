//==============================================================================
// Recording module
//==============================================================================
const util = require('util')

var type = "recording";  // module type identifier

module.exports = {
  type: type,
  createInput: ClientRecording,
  createOutput: ClientRecording,
  init: function(hostAPI){
    //var input = ClientModule("null input");
    //hostAPI.addInput(input);
    //var output = ClientRecording("null output");
    //hostAPI.addOutput(output);
  }
}

var client_io   = require('./client_io');
function ClientRecording(name){
  var io = client_io(type, name);
  io.owner = "user"; //removable
  var startMsec = 0;
  var messages = []; //辞書を突っ込む
  var isStart = false;

  var date = new Date();
  startMsec = date.getTime(); // 本当はRec開始時にセットしたい

  // input initialize
  io.listenMessage = function(){
  };

  // output
  io.sendMessage = function(msg){
    if (isStart) {
      var date = new Date();
      var elapsed = date.getTime() - startMsec;
      messages.push({"msg":msg, "time":elapsed});
      console.log(util.inspect({"msg":msg, "time":elapsed},false, null));
    }
  };

  io.decodeMessage = function(msg){
    return buf;
  };

  io.encodeMessage = function(buf){
    return buf;
  };

  // non io module functions
  io.startRec = function() {
    console.log("startRec");
    messages = [];
    isStart = true;
    var date = new Date();
    startMsec = date.getTime();
  }

  io.stopRec = function() {
    isStart = false;
  }

  io.getRecordingData = function() {
    return messages;
  }
  return io;
}
