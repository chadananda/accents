navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var  audio_context
  , recorder
  , input
  , start
  , stop
  , recordingslist
;

    
document.addEventListener("DOMContentLoaded", function() {
	setTimeout(function(){
  start = document.getElementById('start');
  stop = document.getElementById('stop');
  recordingslist = document.getElementById('allrecords');
  audio_context = new AudioContext;
  navigator.getUserMedia({audio: true}, function(audioStream) {
      input = audio_context.createMediaStreamSource(audioStream);
      start.removeAttribute('disabled');
      start.setAttribute("class", "green recordButton");
  }, function(e){ console.log('error occoured= '+e)});

  start.setAttribute('disabled',true);
  stop.setAttribute('disabled',true);
  start.onclick = startRecording;
  stop.onclick = stopRecording;
  },2000);
});


  function startRecording() {
    recorder = new Recorder(input);
    recorder.record();
    start.setAttribute('disabled',true);
    start.setAttribute("class", "recordButton");
    stop.removeAttribute('disabled');
    stop.setAttribute("class", "red playButton");
  }

  function stopRecording() {
    start.removeAttribute('disabled');
    start.setAttribute("class", "green recordButton");
    stop.setAttribute('disabled',true);   
    stop.setAttribute("class", "playButton");
	recorder.stop(stopCallback);
  }
  
  function stopCallback(blob) {
          var url = URL.createObjectURL(blob);
          var li = document.createElement('li');
          var au = document.createElement('audio');
          var hf = document.createElement('a');
          
          au.controls = true;
          au.src = url;
          hf.href = url;
          hf.download = 'test.mp3';
          hf.innerHTML = hf.download;
          var audioText="<a onclick='this.firstChild.play()'><audio src='"+url+"'></audio><span class='glyphicon glyphicon-play green'></span></a>";
         //var audioText= "<audio controls='controls' autobuffer='autobuffer' autoplay='autoplay'><source src='"+url+"'/></audio>";
        // $("#allrecords").text( audioText );
         recordingslist.innerHTML=audioText;   
    }
   function deleteAttachment(attachmentId,docId)
   {
	   var scope = angular.element($("#main-container")).scope();
	   scope.deleteAttachment(attachmentId,docId);
   }
