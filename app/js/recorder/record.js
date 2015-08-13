function restore()
{
	$("#record, #live").removeClass("disabled");$(".one").addClass("disabled");Fr.voice.stop();
}
$(document).ready(function(){
	//mycode for edit page
	  $(document).on("click", "#start:not(.disabled)", function(){
    elem = $(this);
    Fr.voice.record($("#live").is(":checked"), function(){
      elem.addClass("disabled");
      $("#live").addClass("disabled");
      $(".one").removeClass("disabled");      
    });
  });
  $(document).on("click", "#stop:not(.disabled)", function(){
    Fr.voice.export(function(url){
		var audioText="<a onclick='playPause(this);'><audio id='audio' src="+url+"></audio><span class='glyphicon glyphicon-play green'></span></a>";
		document.getElementById("allrecords").innerHTML=audioText;
    }, "URL");
    restore();
  }); 
  //mycode for edit page ends here

	//mycode for allterms page
	 $(document).on("click", "button[id^='start_']:not(.disabled)", function(){
		var id=$(this).attr('id');
		 var idArr=id.split("_");
		docId=idArr[1];
		elem = $(this);
		Fr.voice.record($("#live").is(":checked"), function(){
		  elem.addClass("disabled");
		  $("#live").addClass("disabled");
		  $("button[id^='stop_"+docId+"']").removeClass("disabled");      
		});
	});
	 $(document).on("click", "button[id^='stop_']:not(.disabled)", function(){
		 
		var id=$(this).attr('id');
		 var idArr=id.split("_");
		docId=idArr[1];
		 
    Fr.voice.export(function(url){
		var audioText="<a onclick='playPause(this);'><audio id='audioPlay_"+docId+"' src="+url+"></audio><span class='glyphicon glyphicon-play green'></span></a>";		
		 document.getElementById("audio-"+docId).innerHTML=audioText;
    var scope = angular.element($("#main-container")).scope(); 
   setTimeout(function(){ scope.saveAudioAll(docId);},1200);
		
    }, "URL");
   
    restore();
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
