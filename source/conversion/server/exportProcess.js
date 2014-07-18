var fs = require('fs');
var md5 = require('md5-jkmyers');
var xlsx = require('xlsx');
var PouchDB = require('pouchdb');
var rootDir = './import-data';
GLOBAL.termCounter = [];
var resendLimit = 9;
var glyphs = ["ʾ","ʾ","ʾ","ʾ","ʾ","ʾ","á","b","p","t","","j","","ḥ","","d","","r","z","","s","","ṣ","ḍ","ṭ","ẓ","ʿ","","f","q","k","k","g","l","m","n","v","ú","h","y","í","a","i","u"];
var accents = ["’","’","’","’","’","’","á","b","p","t","_th","j","_ch","ḥ","_kh","d","_dh","r","z","_zh","s","_sh","ṣ","ḍ","ṭ","ẓ","‘","_gh","f","q","k","k","g","l","m","n","v","ú","h","y","í","a","i","u"];

//	GLOBAL.db 
//	GLOBAL.db_hash

module.exports.startProcess = function(req,res){
	if(res!=null)
	{
		res.send("starting Export Process ...");
	}
	console.log("starting Export Process ...");
	//scan for files in rootDir
	// push verified files to ListOfFiles
	var ListOfFiles = [];
	scanDir(rootDir,ListOfFiles);
	// traverse ListOfFiles and process each file
	checkHash(ListOfFiles);
	console.log("waiting for another request ...");
}
// returns Array of directories
function scanDir(sourceDir, ListOfFiles)
{
	var returnedList = [];
	returnedList = fs.readdirSync(sourceDir);
	returnedList.forEach(function(file){
		if(fs.existsSync(rootDir+'/'+file))
		{
			ListOfFiles.push(rootDir+'/'+file);
		}
	});
}
function checkHash(ListOfFiles)
{
	ListOfFiles.forEach(function(file){
		processFiles(file);
		GLOBAL.termCounter = [];
	});
}
function processFiles(file)
{
	console.log("Processing "+file);
	var LastAColumnValue = '';
	var LastBColumnValue = '';
  	var workbook = xlsx.readFile(file);
  	var sheet_name_list = workbook.SheetNames;
  	GLOBAL.count_limit = 0;
	sheet_name_list.forEach(function(y) {
		var worksheet = workbook.Sheets[y];
		var columnARegex = /^A.+/gmi;
		var columnBRegex = /^B.+/gmi;
		var columnERegex = /^F.+/gmi;
		for (z in worksheet) {
			if(z[0] === '!') continue;
			if(columnARegex.test(z) && z[1]>1)
			{
				LastAColumnValue = JSON.stringify(worksheet[z].v);
			}
			if(columnBRegex.test(z) && z[1]>1)
			{
				LastBColumnValue = JSON.stringify(worksheet[z].v);
			}
			if(columnERegex.test(z) && z[1]>1)
			{
				saveRecord(file,LastAColumnValue,LastBColumnValue,JSON.stringify(worksheet[z].v));
			}
		}
	});
}
function convertGlyph(Bstring)
{
	var oldString = Bstring;
	glyphs.forEach(function(glyph){
		if(Bstring.indexOf(glyph)!=-1)
		{
			var glyphRegex = new RegExp(glyph,"g");
			var myindex = glyphs.indexOf(glyph);
			Bstring = Bstring.replace(glyphRegex,accents[myindex]);
		}
	});
	console.log(oldString+" -> "+Bstring);
	return Bstring;
}
function saveRecord(file,Astring,Bstring,Cstring)
{
	//Structure:
	// {
	// 	id:genUUID('xxxxxxxxxx'),
	// 	source: 'marciel',
	// 	term:{
	// 		word1,
	// 		word2
	// 	},
	// 	original:"string",
	// 	definition:"string"
	// }
	//find existing record with source == 'marciel' and term == Bstring
	Bstring = convertGlyph(Bstring);
	var splitBstring = Bstring.split(" ");
	var mapFunction = 'function(doc){ if(doc.source == "marciel" ';
	var emitPortion = "emit(doc.original,doc.term);";
	for(var x=0;x<splitBstring.length;x++)
	{
		var temp = '';
		var temp2 = '';
		try{
			temp = eval("("+splitBstring[x]+")");
			temp = splitBstring[x];
		}catch(error){
			if(splitBstring[x].indexOf('"')>0)
			{
				temp = '"'+splitBstring[x];
			}else{
				temp = splitBstring[x]+'"';
			}
			try{
				temp2 = eval("("+temp+")");
			}catch(error){
				temp2 = temp;
				if(temp2.indexOf('"')>0)
				{
					temp = '"'+temp2;
				}else{
					temp = temp2+'"';
				}
			}
		}
		mapFunction = mapFunction+"&& doc.term["+x+"] == "+temp+" ";
	}
	mapFunction = mapFunction+"){"+emitPortion+"}}";
	//console.log(mapFunction);
	
	queryME(mapFunction,Astring,splitBstring,Cstring);
}

function queryME(mapFunction,Astring,splitBstring,Cstring)
{
	GLOBAL.db.query({"map": mapFunction}, function(err, response){
		//console.log("responding to db.query");
		//GLOBAL.db.viewCleanup();
		if(err==null)
		{
			if(response.rows.length>0)
			{
				//then this means that the data is there and we should do nothing
				console.log("DB already has the term "+Astring);
			}else{
				// console.log("rows is zero from query");
				// console.log(response);
				// if(splitBstring!=undefined && Astring!=undefined && Cstring!=undefined)
				// {
					console.log("Processing "+Astring);
					saveME(Astring,splitBstring,Cstring);
				// }else{
				// 	console.log(Astring+" term or definition is missing");
				// }
			}
		}else{
			if(err.status==404)
			{
				//no data found then we will save the record
				// if(splitBstring!=undefined && Astring!=undefined && Cstring!=undefined)
				// {
					console.log(Astring+" term is not found - Saving Term");
					saveME(Astring,splitBstring,Cstring);
				// }else{
				// 	console.log(Astring+" term or definition is missing");
				// }
			}else{
				if(err.message == undefined)
				{
					//console.log("Undefined reached - resending query for "+Astring);
					queryME(mapFunction,Astring,splitBstring,Cstring);
				}else{
					console.log("Error with map query");
					console.log(mapFunction);
					console.log(err);
				}
			}
		}
	});
}
function saveME(Astring,Bstring,Cstring)
{
	//Structure:
	// {
	// 	id:genUUID('xxxxxxxxxx'),
	// 	source: 'marciel',
	// 	term:[
	// 		word1,
	// 		word2
	// 	],
	// 	original:"string",
	// 	definition:"string"
	// }
	var mystruct = {
		term:[]
	};
	mystruct["id"]=genUUID('xxxxxxxxxx');
	mystruct["source"]="marciel";
	Bstring.forEach(function(word){
		var temp = word;
		temp = temp.replace('"', '');
		temp = temp.replace('"', '');
		mystruct.term.push(temp);
	});
	mystruct["original"]=eval("("+Astring+")");
	mystruct["definition"]=eval("("+Cstring+")");
	mystruct["type"]="term";
	mystruct["user"]="chad";
	var uid = genUUID();
	saveMEDATA(mystruct,uid,Bstring);
	
}
function saveMEDATA(mystruct,uid,Bstring)
{
	var db = new PouchDB(GLOBAL.db_name,GLOBAL.PouchDB_opts);
	db.put(mystruct,uid,function(err,res){
		if(err==null)
		{
			console.log("Saved accent");
			console.log(Bstring);
		}else{
			if(err.message!="undefined")
			{
				if(GLOBAL.termCounter[Bstring] == NaN || GLOBAL.termCounter[Bstring] == undefined)
				{
					GLOBAL.termCounter[Bstring]=1;
				}else{
					GLOBAL.termCounter[Bstring]=GLOBAL.termCounter[Bstring]+1;
				}
				if(GLOBAL.termCounter[Bstring]>resendLimit)
				{
					console.log("Undefined reached");
					console.log("Term "+Bstring+" has reached resend Limit - Terminating resend");
				}else{
					console.log("Undefined reached - resending save for "+Bstring);
					console.log("Current Resend Count : "+GLOBAL.termCounter[Bstring]);
					saveMEDATA(mystruct,uid,Bstring);
				}
			}else{
				console.log("Error Saving Data");
				console.log(err);
			}
		}
	});
}
function genUUID(pattern) 
{
	pattern = pattern || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
	var uuid = pattern.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
	return uuid;
};

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}