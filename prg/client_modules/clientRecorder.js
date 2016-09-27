//==============================================================================
// Recorder module
// 出力ポートを作成し、入ってきたデータを保持する
// [{"msg":msg1, "time":time1}, {"msg":msg2, "time":time2},,,]
//==============================================================================
const util = require('util')

var type = "recorder";  // module type identifier

module.exports = {
  type: type,
  createInput: ClientRecorder, //縦軸
  createOutput: ClientRecorder, //横軸
  init: function(hostAPI){
  }
}

var client_io = require('./client_io');
function ClientRecorder(name){
  var io = client_io(type, name);
  io.owner = "user"; //user=削除可能
  var startMsec = 0;
  var messages = []; //辞書形式で録音データを突っ込む
  var isStart = false;

  // createInput時に呼ばれる
  io.listenMessage = function(){
  };

  // 出力側に入ってきたメッセージを処理する
  io.sendMessage = function(msg){
    if (isStart) {
      var date = new Date();
      var elapsed = date.getTime() - startMsec;
      messages.push({"msg":msg, "time":elapsed});
      //console.log(util.inspect({"msg":msg, "time":elapsed},false, null));
    }
  };

  // 入力側に入ってきたデータを処理する
  // Recorderは入力ポートがないので何もしなくて良い
  io.decodeMessage = function(msg){
    //return msg;
  };

  // 出力側に入ってきたメッセージをエンコードする
  // 共通プロトコルで良いのでそのまま返す
  io.encodeMessage = function(buf){
    return buf;
  };

  // Recorder固有ファンクション
  // 録音開始
  io.startRec = function() {
    messages = [];
    isStart = true;
    var date = new Date();
    startMsec = date.getTime();
  }

  // Recorder固有ファンクション
  // 録音停止
  io.stopRec = function() {
    isStart = false;
  }

  // Recorder固有ファンクション
  // 録音データを取得
  io.getRecordingData = function() {
    return messages;
  }

  // Recorder固有ファンクション
  // 録音中かどうか
  io.isNowRecording = function() {
    return isStart
  }

  return io;
}
