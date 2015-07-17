'use strict';

/**
 * @ngdoc function
 * @name accentsApp.controller:SettingsCtrl
 * @description
 * # SettingsCtrl
 * Controller of the accentsApp
 */
angular.module('accentsApp')
  .controller('SettingsCtrl', function ($rootScope,$scope,$http,getRecords,$window,$filter,myConfig,Utils,$sce,docData) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ]; 
	var domainRemoteDb=myConfig.remoteDbDomain;
	var remoteDb=myConfig.database;
	//===================Reload Page on route change===========================//
//~ $rootScope.$on('$locationChangeStart', function($event, changeTo, changeFrom) {
      //~ if (changeTo == changeFrom) {
        //~ return;
      //~ }
 //~ 
      //~ window.location.assign(changeTo);
      //~ window.location.reload(true);
    //~ });
	//===========Calling Utility Functions============//
 $scope.i2html = function(text)
 {
	return $sce.trustAsHtml(Utils.ilm2HTML(text));
 }
 $scope.customi2html=function(text)
 {
	 return Utils.renderGlyph2UTF(text);
 }
 //=========Pass document data to edit page=================//
 $scope.editdocPage=function(docid,rev)
 {
	 //alert(docid+rev);
	 var list=[{"id":docid},{"rev":rev}];
	 docData.setFormData(list);
	 window.location.href="http://localhost:9000/#/getdata";
 };
	/******************************************************/
	// some helper functions to clean up CRUD operations
	/******************************************************/

  // single point for DB path in case we want to change it later (including http)
  $scope.db_url = function() {
    // detect page https?
    return 'http://'+domainRemoteDb+'/'+remoteDb + '/';
  };
  // returns a "word family" stripped down version of the term
  // parameter can be a wordfamily, termObj, HTML or glyph
  $scope.genWordFamily = function(term) {
    if (!term) return;
    // given any version of a term, even an object, return the word family
    if (term.hasOwnProperty('term')) term = term.term;
    return Utils.dotUndersRevert(term).replace(/\_|<[\/]?u>/g, '').trim();
  };
 // scrub any user generated field (may contain multiple items)
  $scope.scrubField = function(field, isReference) {
    // scrub any user-generated field part
    var scrubItem = function(item, isReference) {
      // this is good for reference fields and other fields
      if (isReference) return item.replace(/(pg[\.]?|page|p\.)/ig, 'pg ') // cleanup PG
                  .replace(/(par[\.]?|pp[\.]?)/ig,'par ') // cleanup PAR
                  .replace(/\s+/ig, ' ') // remove any excess spaces
                  .trim(); // remove surrounding spaces
        else return item.replace(/\s+/ig, ' ').trim();
    };

    if (!field) return '';
    return field.split(",").
      // clean up field
      map(scrubItem, isReference).
      // remove duplicates and empties
      filter(function(ref, index, self) {
        return ((index == self.indexOf(ref)) && (ref.length>1));
      }).
      // re-join with a comma and a space
      join(', ');
  };
  
  // remove fields that are not allowed -- we use this on loading records and before saving
  $scope.pruneUnallowedFields = function(termObj) {
    var fields = Object.keys(termObj);
    var allowedFields = $scope.termAllowedFields();
    for (var i=0; i<fields.length; i++) {
      if (allowedFields.indexOf(fields[i])<0) delete termObj[fields[i]];
    }
    return termObj;
  };
  
  // returns array of allowable term fields (so we can adjust this on one place)
  $scope.termAllowedFields = function() {
    return ['definition', 'original', 'source', 'term', 'user', 'wordfamily', 'ref',
            'verified', 'ambiguous', 'audio', '_id', '_rev', 'type'];
  };
    // refresh $scope.docs from idDocs without having to query DB
  $scope.refreshOldDocsList = function() {
    $scope.docs = Object.keys($scope.idDocs).map(function(key){ return $scope.idDocs[key]; });
    $scope.count = $scope.docs.length;
  };
  // DATABASE read all fields into hash cache ($scope.idDocs[id]) instant access by _id
  $scope.refreshAllDocList = function(callback) {
    var termObj;
    $http.get($scope.db_url() + '_all_docs?include_docs=true')
      .success(function(data)  {
        if(data.rows) {
          $scope.idDocs = {}; // clear termObj cache
          data.rows.forEach(function(doc){
            termObj = doc.doc;
            if (termObj.type === 'term') {
              termObj.wordfamily = $scope.genWordFamily(termObj.term); // in case it is not there already
              termObj.original = termObj.original || ''; // default blank string
              termObj.definition = termObj.definition || ''; // default blank
              termObj.ref = $scope.scrubField(termObj.ref, true);
              termObj.verified = termObj.verified || false;
              termObj = $scope.pruneUnallowedFields(termObj); // remove any extraneous fields
              $scope.idDocs[termObj['_id']] = termObj; // add to termObj cache
            }
          });

          // for the time being, we can use this to refresh $scope.docs
          $scope.refreshOldDocsList();

          if (callback) callback();
        }
      })
      .error(function(error) { console.log(error); });
  };   
  //////////////////////////Fetch  data/////////////////////////////////////
	$scope.refreshAllDocList(function(){
		$("#spinner").hide();
		$(".pagination").css("display","block");
		// wahat does this do?
		if(sessionStorage.length>0  && sessionStorage.data) {
		  // get previous term id
		  var arrayDoc=JSON.parse(docData.getFormData());
		  var id=JSON.stringify(arrayDoc[0]['id']);
		  id=id.replace(/"/g,'');
		  // load form with previous term
		  var termObj = $scope.getTermObj(id);
		  $scope.setFormTerm(termObj);
		}
  }); 
   // DATABASE term WRITE functions in one place for easy override
  $scope.termCRUD = function(action, termObj, callback) {
    if (['put', 'update', 'post', 'add', 'delete'].indexOf(action) < 0) {
      console.log('No db action: '+action);
      return false;
    }
    console.log('termCRUD', action, termObj);
    // prune unallowed fields
    termObj = $scope.pruneUnallowedFields(termObj);

    // delete action requires _id and _rev
    if (action == 'delete') {
      // we update global cache first so our cache is valid synchronously
      delete $scope.idDocs[termObj._id]; // remove item from cache
        $scope.refreshOldDocsList();
      // now delete from the database
      $http.delete($scope.db_url() + termObj._id +'?rev='+ termObj._rev)
        .success(function(data, status, headers, config){ if (callback) callback(); })
        .error(function(data, status, headers, config) { console.log(status); });

    // update (put) requires object with _id and _rev, term, wordfamily
    } else if (termObj['_rev']) {
      if (!termObj.term || !termObj._id || !termObj._rev) {
        console.log('Error: put (update) requires term, _id and _rev');
      }
      termObj.wordfamily = $scope.genWordFamily(termObj.term);
      termObj.type = 'term';
      $http.put($scope.db_url() +termObj._id+'?rev='+termObj._rev,JSON.stringify(termObj))
        .success(function(newdata, status, headers, config) {
          termObj._rev = newdata.rev; // update object with new _rev
          $scope.idDocs[termObj._id] = termObj; // update cache (not sure if this is needed -- ref or copy?)
            $scope.refreshOldDocsList();
          if (callback) callback();
        })
        .error(function(data, status, headers, config) { console.log(status); });


    // add (post) requires object with term, wordfamily
    } else if (!termObj['_rev']) {
      if (!termObj.term) {
        console.log('Error: post (add) requires term');
        return;
      }
      termObj.wordfamily = $scope.genWordFamily(termObj.term);
      termObj.type = 'term';
      $http.post($scope.db_url(), JSON.stringify(termObj))
        .success(function(newdata, status, headers, config) {
          termObj._rev = newdata.rev;
          termObj._id = newdata.id;
          //console.log('newly added termObj', termObj);
          $scope.idDocs[termObj._id] = termObj; // add to cache now that we have an id
            $scope.refreshOldDocsList();
          if (callback) callback(termObj);
        })
        .error(function(data, status, headers, config) { console.log(status); });
    }
  };

	//==================For slide toggle of help divs====================//
	$scope.slideShow=function(calledId)
	{
		$( "#"+calledId ).slideToggle( "3000" );
	}
  // compresses family down to one record per unique term, merging fields as appropriate
  // also sets ambiguous if there is more than one remaining verfied member
  // this function should be run after any CRUD operation to reset and clean word family
  // parameter can be a wordfamily, termObj, HTML or glyph
  $scope.cleanWordFamily = function(wordfamily) {
    if (!wordfamily) return;
    wordfamily = $scope.genWordFamily(wordfamily); // cleanup just in case
    var terms = $scope.getWordFamilyTerms(wordfamily);
    var family = {};
    // split into object of one termArray for each spelling
    // eg. { "_Shiráz" => [termObj, termObj, termObj],
    //       "_Shíráz" => [termObj, termObj, termObj] }
    terms.forEach(function(termObj) {
      if (!family[termObj.term]) family[termObj.term] = []; // initialize if neccesary
      family[termObj.term].push(termObj);
    });
    //console.log('cleanWordFamily: '+ wordfamily, family);
    // now compress each list down to just one record each
    var verified_count = 0;
    Object.keys(family).forEach(function(term) {
      family[term] = $scope.compressTerms(family[term]); // takes array of termObj, returns merged termObj
      if (family[term].verified) verified_count++;
    });

    // wait a second then set them all to ambiguous or not depending on verified count
    setTimeout(function() {
      Object.keys(family).forEach(function(term) {
        var termObj = $scope.idDocs[family[term]._id]; // reload object from cache just in case it has changed
        termObj.ambiguous = (verified_count>1);
        $scope.termCRUD('update', termObj);
      });
    }, 1000);
  };
  
  // compresses array of matching terms into one, returns termObj
  // this is not a whole word-family but just a sub-branch with exactly matching terms
  $scope.compressTerms = function(termsArray) {
    if (termsArray.length===1) return termsArray[0]; // no need to merge if there's only one
    var i, key, keys, term;
    var base = termsArray[0]; // first term we will merge everything into
    var allowedTerms = $scope.termAllowedFields(); // list of allowed fields, we'll ignore all others
    // sanity check, make sure all terms match
    for (i = 0; i < termsArray.length; i++) {
      if (base.term != termsArray[i].term) {
        console.log('Error: compressTerms received non-matching terms list');
        return false;
      }
    }
    // now merge records #1-n into termObj #0 and then discard each merged record
    for (var i = 1; i < termsArray.length; i++) {
      term = termsArray[i];
      keys = Object.keys(term); // iterate through each field of termObj to be discarded
      for (var j = 1; j < keys.length; j++) {
        key = keys[j];
        if (allowedTerms.indexOf(key)!=-1) { // ignore properties not on our allowed list
          if (key == 'verified') {
            // merge with or, so if either field is verified, the base will now be
            base[key] = (base[key] || term[key]);
          } else if (key == 'ref') {
            // merge with TRUE causes cleanup of PG and PAR
            base[key] = $scope.scrubField(base[key]+','+term[key], true);
          } else if (key == 'audio') {
            // TODO: not sure how this should merge because we need to keep any file attachment
            //
          } else if (['_id','_rev','type','term','ambiguous','wordfamily'].indexOf(key)>-1) {
            // skip these, we do not need to merge them
          } else {
            // default merge style for all other fields
            base[key] = $scope.scrubField(base[key]+','+term[key]);
          }
        }
      };
      // discard merged record
      $scope.termCRUD('delete', term);
    }
    // update base record
    $scope.termCRUD('update', base);

    // $scope.refreshAllDocList();  -- we don't need to do this because CRUD updats idDocs list
         // rather we need to make sure everything uses the idDocs list

    return base;
  };
  // returns unique array of all word families
  $scope.getAllWordFamilies = function() {
    var result = {};
    // loop through entire cache and grab unique word families
    Object.keys($scope.idDocs).forEach(function(id) {
      result[$scope.idDocs[id].wordfamily] = 1; // faster than removing duplicates with an array
    });
    return Object.keys(result); // return array of the object properties
  };
   // returns array of termObjects matching this family
  // loads entire db and generates correct wordfamily for each so should be backwards compatible
  $scope.getWordFamilyTerms = function(wordfamily) {
    if (!wordfamily) return [];
    var result = [];
    wordfamily = $scope.genWordFamily(wordfamily); // just to make sure
    // loop through entire cache and grab matches. This should be very fast
    Object.keys($scope.idDocs).forEach(function(id) {
      var termObj = $scope.idDocs[id];
      if (termObj.wordfamily === wordfamily) result.push(termObj);
    });
    return result;
  };
  
   //==========Change the verified field to 1 for all the records with original field value==========//
	 $scope.changeVerify=function(){
		 angular.forEach($scope.idDocs, function(termObj) {
			 if(termObj.original && termObj.original!="")
			 {
				 var term = {};
							 
				 //term = {term:doc.term, ref:doc.ref, definition:doc.definition, original:doc.original, verified:true, wordFamily:doc.wordFamily};
				 //console.log(term);
				  var allowedTerms = $scope.termAllowedFields();
				  for(var i=0;i<allowedTerms.length;i++){
					  if(allowedTerms[i]=="verified") term[allowedTerms[i]]=true;
					  else  term[allowedTerms[i]]=termObj[allowedTerms[i]];
				  }
					$scope.termCRUD('update', term);
			 }
				
				
		 });
		 $scope.setAmbiguous();
	 };
	//==================SET EACH RECORD IN A WORD FAMILY GROUP TO AMBIGUOUS IF MORE THAN ONE VERIFIED OR IF NONE===============//
	$scope.setAmbiguous=function()
	{
		 var wordFamilies = $scope.getAllWordFamilies();
		console.log('Cleaning up '+wordFamilies.length+' word families');
		wordFamilies.forEach(function(wordFamily){
		  console.log('Cleaning up word family: '+wordFamily);
		  $scope.cleanWordFamily(wordFamily);
		});
	}
	//===================Delete Duplicate Records================//
	$scope.deleteDuplicate=function(){
		 angular.forEach($scope.idDocs, function(termObj) {
			 angular.forEach($scope.idDocs, function(termObj1){
				if((termObj._id!=termObj1._id )&& (termObj._rev!=termObj1._rev))
				{
					if((termObj.term==termObj1.term) && (termObj.original==termObj1.original) && (termObj.definition==termObj1.definition) && (termObj.source==termObj1.source))
					{
						if(termObj1.verify && termObj1.verify=="1")
						{
							var term=termObj;
						}
						else
						{
							var term=termObj1;
						}
						console.log(term);
						 $scope.termCRUD('delete', term);
					}
				}
			 });
		 });
		 $scope.addFamilyField();
	}
	//==================For add family field in the docs====================//
	$scope.addFamilyField=function()
	{
		angular.forEach($scope.idDocs, function(termObj) {
			var familyField=$scope.genWordFamily(termObj);
			 var term = {};
				  var allowedTerms = $scope.termAllowedFields();
				  for(var i=0;i<allowedTerms.length;i++){
					  if(allowedTerms[i]=="wordfamily") term[allowedTerms[i]]=familyField;
					  else  term[allowedTerms[i]]=termObj[allowedTerms[i]];
				  }
					$scope.termCRUD('update', term);
		});
		$scope.removeUnusedData();
	}
	//==================================REMOVING UNUSED DATA IN DOCUMENTS=========================================//
	$scope.removeUnusedData=function()
	{
		angular.forEach($scope.idDocs, function(termObj) {			
			var term=$scope.pruneUnallowedFields(termObj);
			console.log(term);
			$scope.termCRUD('update', term);
		});
	}
 });
