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
		if(document.getElementById('start')!=null){
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
	}
	else{
		audio_context = new AudioContext;
		  navigator.getUserMedia({audio: true}, function(audioStream) {
			  input = audio_context.createMediaStreamSource(audioStream);
		  }, function(e){ console.log('error occoured= '+e)});

	}
  },2000);
  
});

	function startRecord(callingElement)
	{
		recorder = new Recorder(input);
		recorder.record();
	}
	function stopRecord(callingElement)
	{
		var pauseButton=callingElement.id;
		var idArr=pauseButton.split("_");
		docId=idArr[1];
		recorder.stop(stopCallbackAll);
	}
	function stopCallbackAll(blob){
		 var url = URL.createObjectURL(blob);
          var scope = angular.element($("#main-container")).scope(); 
          var audioText="<div class='dispinblk playmic'><a onclick='playPause(this);'><audio src='"+url+"' onended='endaudio(this);'></audio><span class='glyphicon glyphicon-play green'></span></a></div>"; 
			document.getElementById("audio-"+docId).innerHTML=audioText;
		scope.saveAudioAll(docId);
	}
  function startRecording() {
	  console.log('start');
    recorder = new Recorder(input);
    recorder.record();
    start.setAttribute('disabled',true);
    start.setAttribute("class", "recordButton");
    stop.removeAttribute('disabled');
    stop.setAttribute("class", "red playButton");
  }

  function stopRecording() {
	  console.log('stop');
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
