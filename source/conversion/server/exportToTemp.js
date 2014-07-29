var fs = require('fs');
var md5 = require('md5-jkmyers');
var xlsx = require('xlsx');
var PouchDB = require('pouchdb');
var rootDir = './import-data';
GLOBAL.termCounter = [];
var resendLimit = 9;

var glyphs = ["","","","","","","","","","","","","ʾ","ʿ",""];
var accents =["_Kh","_Gh","_Sh","_Ch","_Th","_th","_ch","_kh","_dh","_zh","_sh","_gh","’","‘","_Dh"];

var conversionHolder ='';
var mainRowCounter = 0;
var subRowCounter = 0;
var worksheetNo = 0;
var filename = '';

module.exports.startProcess = function(req,res){
	if(res!=null)
	{
		res.send("starting Export Process ...");
	}
	console.log("starting Export Process ...");
	//
	//scan for files in rootDir
	// push verified files to ListOfFiles
	var ListOfFiles = [];
	scanDir(rootDir,ListOfFiles);
	checkHash(ListOfFiles);
	// traverse ListOfFiles and process each file
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
			//filename = file;
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
  	//debugger;
  	var sheet_name_list = workbook.SheetNames;
  	GLOBAL.count_limit = 0;
  	worksheetNo=0;
	sheet_name_list.forEach(function(y) {
		var worksheet = workbook.Sheets[y];
		var columnARegex = /^A.+/gmi;
		var columnBRegex = /^B.+/gmi;
		var columnERegex = /^F.+/gmi;
		mainRowCounter = 0;
		subRowCounter = 0;
		worksheetNo ++;
		conversionHolder='';
		for (z in worksheet) {
			if(z[0] === '!') continue;
			if(columnARegex.test(z) && z[1]>1)//orignal word
			{
				LastAColumnValue = JSON.stringify(worksheet[z].v);
			}
			if(columnBRegex.test(z) && z[1]>1)//accent word
			{
				LastBColumnValue = JSON.stringify(worksheet[z].v);
			}
			if(columnERegex.test(z) && z[1]>1)//description
			{
				mainRowCounter ++;
				saveRecord(file,LastAColumnValue,LastBColumnValue,JSON.stringify(worksheet[z].v));
			}
		}
	});
}
function convertGlyph(Astring,Bstring,Cstring,file)
{
	// subRowCounter ++;
	var oldString = Bstring;

	glyphs.forEach(function(glyph){
		if(Bstring.indexOf(glyph)!=-1)
		{
			var glyphRegex = new RegExp(glyph,"g");
			var myindex = glyphs.indexOf(glyph);
			Bstring = Bstring.replace(glyphRegex, accents[myindex]);
		}
	});
	// console.log(oldString+" -> "+Bstring);
	// conversionHolder=conversionHolder+oldString+" -> "+Bstring+"\n";
	// if(subRowCounter == mainRowCounter)
	// {
	// 	//save data into UTF8 format file
	// 	var filenames = file.split('/');
	// 	filename = filenames[(filenames.length)-1];
	// 	var options = {
	// 		encoding:'utf8'
	// 	};
	// 	//form the data here but we need to also save the definition
	// 	fs.writeFileSync(filename+worksheetNo+".txt", conversionHolder, options);
	// }
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
	var ConvertedBString = convertGlyph(Astring,Bstring,Cstring,file);
	var splitBstring = Bstring.split(" ");
	var splitConvertedBString = ConvertedBString.split(" ");
	var mapFunction = 'function(doc){ if(doc.source == "marciel" ';
	var emitPortion = "emit(doc.original,doc.term);";
	for(var x=0;x<splitConvertedBString.length;x++)
	{
		var temp = '';
		var temp2 = '';
		try{
			temp = eval("("+splitConvertedBString[x]+")");
			temp = splitConvertedBString[x];
		}catch(error){
			if(splitConvertedBString[x].indexOf('"')>0)
			{
				temp = '"'+splitConvertedBString[x];
			}else{
				temp = splitConvertedBString[x]+'"';
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

	queryME(mapFunction,Astring,splitBstring,Cstring,splitConvertedBString);
}

function queryME(mapFunction,Astring,splitBstring,Cstring,splitConvertedBString)
{
	GLOBAL.db.query({"map": mapFunction}, function(err, response){
		//console.log("responding to db.query");
		//GLOBAL.db.viewCleanup();
		if(err==null)
		{
			subRowCounter ++;
			if(response.rows.length>0)
			{
				//then this means that the data is there and we should do nothing
				console.log("DB already has the term "+Astring);
			}else{
				console.log("Processing "+Astring);
				saveME(Astring,splitBstring,Cstring,splitConvertedBString);
			}
		}else{
			if(err.status==404)
			{
				//no data found then we will save the record
				subRowCounter ++;
				console.log(Astring+" term is not found - Saving Term");
				saveME(Astring,splitBstring,Cstring,splitConvertedBString);
			}else{
				if(err.message == undefined)
				{
					//console.log("Undefined reached - resending query for "+Astring);
					queryME(mapFunction,Astring,splitBstring,Cstring,splitConvertedBString);
				}else{
					console.log("Error with map query");
					console.log(mapFunction);
					console.log(err);
				}
			}
		}
	});
}
function saveME(Astring,splitBstring,Cstring,splitConvertedBString)
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
		term:[],
		termNonConvert:[]
	};
	mystruct["id"]=genUUID('xxxxxxxxxx');
	mystruct["source"]="marciel";
	splitBstring.forEach(function(word){
		var temp = word;
		temp = temp.replace('"', '');
		temp = temp.replace('"', '');
		mystruct.term.push(temp);
	});
	splitConvertedBString.forEach(function(word){
		var temp = word;
		temp = temp.replace('"', '');
		temp = temp.replace('"', '');
		mystruct.termNonConvert.push(temp);
	});
	mystruct["original"]=eval("("+Astring+")");
	mystruct["definition"]=eval("("+Cstring+")");
	mystruct["type"]="term";
	mystruct["user"]="chad";
	var uid = genUUID();
	saveMEDATA(mystruct,uid,splitBstring);

}
function saveMEDATA(mystruct,uid,Bstring)
{
	if(process.env.NODE_ENV=='development'){
		var db = new PouchDB(GLOBAL.db_temp,GLOBAL.PouchDB_opts);
	}else{
		var db = new PouchDB(remoteLocation+GLOBAL.db_temp,GLOBAL.PouchDB_opts);
	}
	
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

