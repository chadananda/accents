
angular.module('accentsApp')
  .factory('getRecords', function($http,myConfig) {
    return {
      getAllData: function(userId) {
        //return $http.get(myConfig.url+'_all_docs?include_docs=true');
      },
    };
  })


.factory('pouchdb', function() {
  Pouch.enableAllDbs = true;
  return new Pouch('accents', {auto_compaction: true});
})

//======Factory for crud functions=======//
.factory('crudFunctions', function(myConfig, Utils){
  return {
	  //===========Calling Utility Functions============//
		i2html : function(text) {
			return $sce.trustAsHtml(Utils.ilm2HTML(text));
		},
		customi2html : function(text) {
			return Utils.renderGlyph2UTF(text);
		},
		//===Function to remove fields that are not allowed===//
		//===we use this on loading records and before saving===//
		pruneUnallowedFields: function(termObj) {
			var fields = Object.keys(termObj);
			var allowedFields = this.termAllowedFields();
			for (var i=0; i<fields.length; i++) {
				if (allowedFields.indexOf(fields[i])<0) delete termObj[fields[i]];
			}
			return termObj;
		},
		//===Function get info about the db===//
		dbInfo:function(db,scope,callback){
			db.info(function(err,response){
			if(err) console.log(err);
			scope.dbInfoValue=response;	
			if(callback)callback();
		  });
		},
		//===Function get info about the remote db===//
		dbremoteInfo:function(db,scope,callback){
			var db = new PouchDB(db, {auto_compaction: true});
			db.info(function(err,response){
				if(err) console.log(err);
					scope.dbInfoValue=response;	
					if(callback)callback();
			});
		},
		//Function returns array of allowable term fields (so we can adjust this on one place)===//
		termAllowedFields: function() {
			return ['definition', 'original', 'source', 'term', 'user', 'wordfamily', 'ref',
				'verified', 'ambiguous', 'audio', '_id', '_rev', 'type','_attachments','misspelling'];
		},
		//===Function returns unique array of all word families===//
		getAllWordFamilies: function(scope) {
		  var result = {};
		  // loop through entire cache and grab unique word families
		  Object.keys(scope.idDocs).forEach(function(id) {
			result[scope.idDocs[id].wordfamily] = 1; // faster than removing duplicates with an array
		  });
		  return Object.keys(result); // return array of the object properties
		},
		//===Function to clean up all word families in DB===//
		cleanAllWordFamilies: function(scope) {
		  // gather and clean up every single word family:
		  var wordFamilies = this.getAllWordFamilies(scope);
		  var original_count = Object.keys(scope.idDocs).length;
		  console.log('Cleaning up '+wordFamilies.length+' word families. '+
			' Total records: '+ original_count);
		  angular.forEach(wordFamilies,function(wordFamily) {
		   // console.log('Cleaning up word family: '+wordFamily +
			 //   ' Total records: '+ Object.keys(scope.idDocs).length);
			this.cleanWordFamily(wordFamily, scope);
		  }, this);
		  console.log("Done cleaning word families. "+
			' Total records removed: '+  (original_count - Object.keys(scope.idDocs).length));
		},
		//===Function compresses family down to one record per unique term, merging fields as appropriate===//
		//===also sets ambiguous if there is more than one remaining verfied member===//
		//===this function should be run after any CRUD operation to reset and clean word family===//
		//===parameter can be a wordfamily, termObj, HTML or glyph===//
		cleanWordFamily: function(wordfamily, scope) {
		  if (!wordfamily) return;
		  wordfamily = this.genWordFamily(wordfamily); // cleanup just in case
		  var terms = this.getWordFamilyTerms(wordfamily, scope);
		  var family = {};
		  // split into object of one termArray for each spelling
		  // eg. { "_Shiráz" => [termObj, termObj, termObj],
		  //       "_Shíráz" => [termObj, termObj, termObj] }
		  terms.forEach(function(termObj) {
			if (!family[termObj.term]) family[termObj.term] = []; // initialize if neccesary
			family[termObj.term].push(termObj);
		  });
		  // now compress each list down to just one record each
		  var verified_count = 0;
		  var termscount=0;
		  Object.keys(family).forEach(function(term) {
			family[term] = scope.compressTerms(family[term]); // takes array of termObj, returns merged termObj		
			if (family[term].verified) verified_count++;
			termscount++;
		  });		 
		  if(termscount>1){
			 
			// wait a second to allow any CRUD writes to finish - (sloppy, I know)
			// then set them all to ambiguous or not depending on verified count
			setTimeout(function() {
			  Object.keys(family).forEach(function(term) {
				var termObj = scope.idDocs[family[term]._id]; // reload object from cache just in case it has changed
				var ambiguous = verified_count>1;
				// if term ambiguity does not match, change and save
				if (ambiguous != termObj.ambiguous) {
				  termObj.ambiguous = ambiguous;
				  scope.termCRUD('update', termObj);
				}
			  });
			}, 1000);
		  }
		},
		//===Function returns a "word family" stripped down version of the term===//
		//===parameter can be a wordfamily, termObj, HTML or glyph===//
		genWordFamily: function(term) {
		  if (!term) return;
		  // given any version of a term, even an object, return the word family
		  if (term.hasOwnProperty('term')) term = term.term;
		  return Utils.dotUndersRevert(term).replace(/\_|<[\/]?u>/g, '').trim();
		},
		//===Function returns array of termObjects matching this family===//
		//===loads entire db and generates correct wordfamily===//
		//===for each so should be backwards compatible===//
		getWordFamilyTerms : function(wordfamily, scope) {
		  if (!wordfamily) return [];
		  var result = [];
		  wordfamily = this.genWordFamily(wordfamily); // just to make sure
		  // loop through entire cache and grab matches. This should be very fast
		  Object.keys(scope.idDocs).forEach(function(id) {
			var termObj = scope.idDocs[id];
			if (termObj.wordfamily === wordfamily) result.push(termObj);
		  });
		  return result;
		},
		//===Function to scrub any user generated field (may contain multiple items)===//
		scrubField: function(field, isReference) {
		  if (!field) return '';
		  // scrub any user-generated field part
		  var scrubItem = function(item, isReference) {
			// this is good for reference fields and other fields
			if (isReference) return item.replace(/(pg[\.]?|page|p\.)/ig, 'pg ') // cleanup PG
						.replace(/(par[\.]?|pp[\.]?)/ig,'par ') // cleanup PAR
						.replace(/\s+/ig, ' ') // remove any excess spaces
						.trim(); // remove surrounding spaces
			  else return item.replace(/\s+/ig, ' ').trim();
		  };
		  return field.split(",").
			// clean up field
			map(scrubItem, isReference).
			// remove duplicates and empties
			filter(function(ref, index, self) {
			  return ((index == self.indexOf(ref)) && (ref.length>1));
			}).
			// re-join with a comma and a space
			join(', ');
		},
		//===Function to refresh $scope.docs from idDocs without having to query DB===//
		refreshOldDocsList: function(scope) {
		  scope.docs = Object.keys(scope.idDocs).map(function(key){ return scope.idDocs[key]; });
		  scope.count = scope.docs.length;
		},
		//===Function replicate from remote to local and local to remote===//
		replicateDB: function(scope) {		
		var self=this;	
		var scope= angular.element($(".addtext")).scope(); 
		scope.data.progress=0;
		scope.downloadMessage="Downloading Progress";
		 		
		var db = new PouchDB(myConfig.database, {auto_compaction: true});		
		self.dbInfo(db,scope,function(){
			scope.updateseq=scope.dbInfoValue.update_seq;
		});		
		
      var remoteDbUrl = localStorage.getItem('remoteDbUrl');
      self.dbremoteInfo(remoteDbUrl,scope,function(){
			scope.updateseqRemote=scope.dbInfoValue.update_seq;
		});	
      var protocol = 'http://'; // default
      var username = localStorage.getItem('username');
      var userpass = localStorage.getItem('userpass');
      if (!remoteDbUrl || !username || !userpass) {
        alert('Warning, we need all fields');
        return console.log('Could not replicate, missing some information: ');
      }
	  var remote = remoteDbUrl;
	   var remote = PouchDB(remote, 
					{withCredentials:true, cookieAuth: {username:username, password:userpass}});
					localStorage.setItem('remoteDbUrl', remoteDbUrl);      
      // pull down all changes
      console.log ('Replicating data from remote', remoteDbUrl);
      db.replicate.from(remote)
        .on('change', function (info) { console.log("Sync progress: ", info);
				var updateSeq=scope.updateseqRemote;	
				var lastSeq=info.last_seq;
				var Tdiff=100-(Math.ceil(((updateSeq-lastSeq)/updateSeq)*100));	
				setTimeout(function(){					
					scope.data.progress=Tdiff;
					if(scope.data.progress>100)
						scope.data.progress=100;
					if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
							scope.$apply();
						}
					},50);	
			  })
        .on('complete', function (info) { console.log("Sync complete: ", info); })
        .on('denied', function (info) { console.log("Sync denied: ", info); })
        .on('error', function (err) { console.log("Sync failed: ", err);
			alert("Sync Failed with following errors:"+err.message);	
			setTimeout(function(){
					scope.remoteDbUrl=localStorage.getItem('remoteDbUrl');
					scope.$apply();
					$("#progressbar").css('display','none');
					 $(".panel-box").css('display','block');
				},100);
			  })
        .then(function(){
          // clean up and compact
          console.log ('Cleaning up and compressing all word families...');
			self.cleanAllWordFamilies(scope);
          // push up all changes
          console.log ('Replicating to remote');
          scope.downloadMessage="Uploading Progress";
          scope.data.progress=0;
          db.replicate.to(remote)
            .on('change', function (info) 
            { 
				console.log("Sync progress: ", info); 
				var updateSeq=scope.updateseq;	
				var lastSeq=info.last_seq;
				var Tdiff=100-(Math.ceil(((updateSeq-lastSeq)/updateSeq)*100));	
				setTimeout(function(){					
					scope.data.progress=Tdiff;
					if(scope.data.progress>100)
						scope.data.progress=100;
					if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
							scope.$apply();
						}
					},50);	
			})
            .on('complete', function (info) { alert("Sync complete"); 
						setTimeout(function(){
							scope.remoteDbUrl=localStorage.getItem('remoteDbUrl');
							scope.$apply();
							$("#progressbar").css('display','none');
							 $(".panel-box").css('display','block');
						},100);
				})
            .on('denied', function (info) { console.log("Sync denied: ", info); })
            .on('error', function (err) { console.log("Sync failed: ", err); });
        },this);

    },
    //===Function called on start of the app when user has first used the app to replicate data from remote db to local db===//
    replicatefromDB:function(scope){
		 var remoteDbUrl = localStorage.getItem('remoteDbUrl');
		  var protocol = 'http://'; // default
		  var username = localStorage.getItem('username');
		  var userpass = localStorage.getItem('userpass');
		  if (!remoteDbUrl || !username || !userpass) {
			alert('Warning, we need all fields');
			return console.log('Could not replicate, missing some information: ');
		  }
		  var remote = remoteDbUrl;
		   var remote = PouchDB(remote, 
						{withCredentials:true, cookieAuth: {username:username, password:userpass}});
						localStorage.setItem('remoteDbUrl', remoteDbUrl);
		  var db = new PouchDB(myConfig.database, {auto_compaction: true});

		  // pull down all changes
		  console.log ('Replicating data from remote', remoteDbUrl);
		  db.replicate.from(remote)
			.on('change', function (info) { console.log("Sync progress: ", info);  })
			.on('complete', function (info) { console.log("Sync complete: ", info); })
			.on('denied', function (info) { console.log("Sync denied: ", info); })
			.on('error', function (err) { console.log("Sync failed: ", err);  })
			.then(function(){
				console.log("Replication Complete!");
				$("#spinnernew").hide();
			},this);
		}
	};
})
  .service('docData', function() {
    var data = this;
    return {
      getFormData: function () { return sessionStorage.data; },
      setFormData: function (list) { sessionStorage.data = JSON.stringify(list); }
    };
  });

