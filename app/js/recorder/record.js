function restore()
{
	$("#start, #live").removeClass("disabled");
	$(".one").addClass("disabled");Fr.voice.stop();
}
$(document).ready(function(){
	//mycode for edit page
	$(document).on("click","#audioAttach",function(){
		if($(this).children().hasClass("glyphicon glyphicon-record")){			
			$(this).children('span').removeClass("glyphicon-record");
			$(this).children('span').addClass("glyphicon glyphicon-stop");			
			setTimeout(function(){
				alert("Start Recording Your Voice!");
				Fr.voice.record($("#live").is(":checked"), function(){
				});
			},250);			
		} 
		else{
			$(this).children('span').removeClass("glyphicon-stop");
			$(this).children('span').addClass("glyphicon glyphicon-record");
			 Fr.voice.export(function(url){
				var audioText="<a onclick='playPause(this);'><audio id='audio' src="+url+" onended='endaudio(this);'></audio><span class='glyphicon glyphicon-play'></span></a>";
				document.getElementById("allrecords").innerHTML=audioText;				
				$("#deleteAudio").css("display","block");
			}, "URL");			
		}
	});
	$(document).on("click","#deleteAudio",function(){
		var audioText="<a id='playButton' class='disabled'><span class='glyphicon glyphicon-play'></span></a>";
		document.getElementById("allrecords").innerHTML=audioText;
		$("#deleteAudio").css("display","none");
	});
  //mycode for edit page ends here

	//mycode for allterms page
	$(document).on("click","button[id^='audioAttach_']:not(.disabled)",function(){
		var id=$(this).attr('id');
		var idArr=id.split("_");
		docId=idArr[1];
		if($(this).children().hasClass("glyphicon glyphicon-record")){			
			$(this).children('span').removeClass("glyphicon-record");
			$(this).children('span').addClass("glyphicon glyphicon-stop");	
			setTimeout(function(){	
				alert("Start Recording Your Voice!");	
				Fr.voice.record($("#live").is(":checked"), function(){
				});
			},250);			
		} 
		else{
			$(this).children('span').removeClass("glyphicon-stop");
			$(this).children('span').addClass("glyphicon glyphicon-record");
			 Fr.voice.export(function(url){
				var audioText="<button onclick='playPause(this);' class='btn btn-danger btn-xs remove' style='margin-left: 10px;padding-right:3px;'><audio id='audioPlay_"+docId+"' src="+url+"  onended='endaudio(this);'></audio><span class='glyphicon glyphicon-play'></span></button>";		
				document.getElementById("audio-"+docId).innerHTML=audioText;
				$("#deleteAudio-"+docId).removeClass("ng-hide");
				var scope = angular.element($("#main-container")).scope(); 
				setTimeout(function(){ scope.saveAudioAll(docId);},200);
			}, "URL");
			
		}
	});
	//mycode for allterms page ends here

	
  $(document).on("click", "#record:not(.disabled)", function(){
    elem = $(this);
    Fr.voice.record($("#live").is(":checked"), function(){
      elem.addClass("disabled");
      $("#live").addClass("disabled");
      $(".one").removeClass("disabled");      
    });
  });
  
  $(document).on("click", "#stop:not(.disabled)", function(){
    restore();
  });
  
  $(document).on("click", "#play:not(.disabled)", function(){
    Fr.voice.export(function(url){
      $("#audio").attr("src", url);
      $("#audio")[0].play();
    }, "URL");
    restore();
  });
  
  $(document).on("click", "#download:not(.disabled)", function(){
    Fr.voice.export(function(url){
      $("<a href='"+url+"' download='MyRecording.wav'></a>")[0].click();
    }, "URL");
    restore();
  });
  
  $(document).on("click", "#base64:not(.disabled)", function(){
    Fr.voice.export(function(url){
      console.log("Here is the base64 URL : " + url);
      alert("Check the web console for the URL");
      
      $("<a href='"+ url +"' target='_blank'></a>")[0].click();
    }, "base64");
    restore();
  });
  
  $(document).on("click", "#mp3:not(.disabled)", function(){
    alert("The conversion to MP3 will take some time (even 10 minutes), so please wait....");
    Fr.voice.export(function(url){
      console.log("Here is the MP3 URL : " + url);
      alert("Check the web console for the URL");
      
      $("<a href='"+ url +"' target='_blank'></a>")[0].click();
    }, "mp3");
    restore();
  });
});
