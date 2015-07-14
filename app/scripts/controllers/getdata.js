'use strict';

/**
 * @ngdoc function
 * @name accentsApp.controller:getdataCtrl
 * @description
 * # getdataCtrl
 * Controller of the accentsApp
 */
angular.module('accentsApp')
  .controller('getdataCtrl', function($rootScope,$scope,$http,getRecords,$window,$filter,myConfig,Utils,$sce,docData) {
  $scope.docs={};
  $scope.filterresult={};
  $scope.awesomeThings = [
    'HTML5 Boilerplate',
    'AngularJS',
    'Karma'
  ];

  var domainRemoteDb=myConfig.remoteDbDomain;
  var remoteDb=myConfig.database;

  //===================Reload Page on route change===========================//
  $rootScope.$on('$locationChangeStart', function($event, changeTo, changeFrom) {
    if (changeTo == changeFrom) {
      return;
    }
    window.location.assign(changeTo);
    window.location.reload(true);
  });

  //===========Calling Utility Functions============//
  $scope.i2html = function(text) {
    return $sce.trustAsHtml(Utils.ilm2HTML(text));
  }
  $scope.customi2html=function(text) {
    return Utils.renderGlyph2UTF(text);
  }
  $scope.dotUnderRevert=function(text) {
    return Utils.dotUndersRevert(text);
  }

  //============On key up of the term textbox change the term=========//
  $( "#term" ).keyup(function() {
    var term = $('#term').val();
    if(term!="") {
      // TODO: get cursor position
      // split the word at the cursor position - part1 & part2
      // run customi2html on part1
      // then set val to part1+part2 and set the cursor position to part1.length
      var changedTerm = $scope.customi2html(term);
      $("#term").val(changedTerm);
      $("#heading-term").html(Utils.ilm2HTML(changedTerm));
    }
    else {
      $("#heading-term").html("");
    }
  });

  if(document.getElementById('term')) {
    document.getElementById('term').onkeydown = function(e){
      if (e.keyCode == 13) {
        // submit.
        // $scope.allDocsFunc();

        // what is this?
        $scope.adddata($scope.docs);
      }
    };
  }

  //Every checkboxes in the page
  $('.checkbox input:checkbox').click(function() {
      $('.checkbox input:checkbox').not(this).prop('checked', false);
  });

  $scope.checkVerifiedCheckBox=function() {
    var field=document.getElementById('original');
    if (field.value !== '') {
      document.getElementById('verifiedCheckbox').checked=true;
    }
  };




  /******************************************************/
  // some helper functions to clean up CRUD operations
  /******************************************************/

  // single point for DB path in case we want to change it later (including http)
  $scope.db_url = function() {
    // detect page https?
    return 'http://'+domainRemoteDb+'/'+remoteDb + '/';
  };

  // loads one term from $scope.idDocs list. This is here in case we want to change how fields are cached.
  $scope.getTermObj = function(id) {
      if ($scope.idDocs && $scope.idDocs[id]) return $scope.idDocs[id];
      // if it fails, re-load the list so it will work next time
      if (!$scope.idDocs) $scope.refreshAllDocList();
      return false;
  };

  // returns array of allowable term fields (so we can adjust this on one place)
  $scope.termAllowedFields = function() {
    return ['definition', 'original', 'source', 'term', 'user', 'wordfamily', 'ref',
            'verified', 'ambiguous', 'audio', '_id', '_rev', 'type'];
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

  // DATABASE term WRITE functions in one place for easy override
  $scope.termCRUD = function(action, termObj, callback) {
    if (['put', 'update', 'post', 'add', 'delete'].indexOf(action) < 0) {
      console.log('No db action: '+action);
      return false;
    }
    //console.log('termCRUD', action, termObj);

    // prune unallowed fields
    termObj = $scope.pruneUnallowedFields(termObj);

    // delete action requires _id and _rev
    if (action == 'delete') {
      $http.delete($scope.db_url() + termObj._id+'?rev='+termObj._rev)
        .success(function(data, status, headers, config){
          console.log(status);
          delete $scope.idDocs[termObj._id]; // remove item from cache
          if (callback) callback();
        })
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
          console.log(status);
          $scope.idDocs[termObj._id] = termObj; // update cache
          if (callback) callback();})
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
          $http.get($scope.db_url() +newdata.id)
            .success(function(termObj) {
              console.log('newly added termObj', termObj);
              $scope.idDocs[termObj._id] = termObj; // add to cache
              if (callback) callback(termObj);
            });

        })
        .error(function(data, status, headers, config) { console.log(status); });
    }
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
          // console.log('refreshed idDocs list: ', $scope.idDocs);
          //
          $scope.docs=data.rows; // I think this is used for other stuff
          $scope.count=data.total_rows;
          if (callback) callback();
        }
      })
      .error(function(error) { console.log(error); });
  };

  // returns a "word family" stripped down version of the term
  // parameter can be a wordfamily, termObj, HTML or glyph
  $scope.genWordFamily = function(term) {
    if (!term) return;
    // given any version of a term, even an object, return the word family
    if (term.hasOwnProperty('term')) term = term.term;
    return Utils.dotUndersRevert(term).replace(/\_|<[\/]?u>/g, '').trim();
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

  // returns unique array of all word families
  $scope.getAllWordFamilies = function() {
    var result = {};
    // loop through entire cache and grab unique word families
    Object.keys($scope.idDocs).forEach(function(id) {
      result[$scope.idDocs[id].wordfamily] = 1; // faster than removing duplicates with an array
    });
    return Object.keys(result); // return array of the object properties
  };

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

    console.log('cleanWordFamily: '+ wordfamily, family);

    // now compress each list down to just one record each
    var verified_count = 0;
    Object.keys(family).forEach(function(term) {
      family[term] = $scope.compressTerms(family[term]); // takes array of termObjs, returns merged termObj
      if (family[term].verified) verified_count++;
    });

    // now set them all to ambiguous or not depending on verified count
    Object.keys(family).forEach(function(term) {
      family[term].ambiguous = (verified_count>1);
      $scope.termCRUD('update', family[term]);
    });

    // wait a second then refresh main cache list
    setTimeout(function() {
      $scope.refreshAllDocList();
    }, 2000);
  };

  // compresses array of matching terms into one, returns termObj
  // this is not a whole word-family but just a sub-branch with exactly matching terms
  $scope.compressTerms = function(termsArray) {
    if (termsArray.length===1) return termsArray[0]; // no need to merge if there's only one

    // for some reason, the first term is already compressed
    console.log('compressTerms', termsArray);
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
        if (allowedTerms.indexOf(key)) { // ignore properties not on our allowed list
          if (key == 'verified') {
            base[key] = (base[key] || term[key]);
          } else if (key == 'ref') {
            base[key] = $scope.scrubField(base[key]+','+term[key], true);
          } else if (key == 'audio') {
            // TODO: not sure how this should merge because we need to keep any file attachment
            //
          } else if (['_id','_rev','type','term','ambiguous','wordfamily'].indexOf(key)>-1) {
            // skip these, we do not need to merge them
          } else {
            // default merge style for any other fields
            base[key] = $scope.scrubField(base[key]+','+term[key]);
          }
        }
      };
      // discard merged record
      $scope.termCRUD('delete', term);
    }
    // update base record
    $scope.termCRUD('update', base);
    return base;
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

  // re-cleans all word families in DB
  $scope.cleanAllWordFamilies = function() {
    var wordFamilies = $scope.getAllWordFamilies();
    console.log('Cleaning up '+wordFamilies.length+' word families');
    wordFamilies.forEach(function(wordFamily){
      console.log('Cleaning up word family: '+wordFamily);
      $scope.cleanWordFamily(wordFamily);
    });
  };

  // get current session user
  $scope.getSessionUser = function() {
    var sessionArray= JSON.parse(localStorage.getItem("session-user"));
    return sessionArray.username;
  };


  // clear form (except reference field) and set to Add mode
  $scope.clearEditForm = function() {
    // clear all fields except for reference field
    document.getElementById("keyid").value="";
    document.getElementById("keyrev").value="";
    $scope.addform.$setPristine();
    //$scope.search.doc.term='';
    document.getElementById("term").value="";
    // if multi value reference, keep only the first one
    var ref = document.getElementById("reference").value.split(',').shift().trim();
    $scope.editdata = {ref: ref};
    document.getElementById("verifiedCheckbox").checked = false;

    // $scope.addState();
    // $scope.allDocsFunc();

    // switch form to add state
    document.getElementById("toptext").innerHTML="Add:";
    document.getElementById("heading-term").innerHTML="";
    $('#Button2').css({ "display":"none" });
    $('#Button3').css({ "display":"none" });
    $('#updateword').css({ "display":"none" });
    $('#addword').css({ "display":"block" });

    // what does sessionstorage handle?
    if(sessionStorage.length!=0)   {
      var sessionTerm=sessionStorage.term;
      sessionStorage.clear();
      sessionStorage.term=sessionTerm;
    }
  };

  // get termObj from form fields (careful to not lose fields not stored in the form)
  $scope.getFormTerm = function() {
    var term = {};
    var id=document.getElementById("keyid").value;
    // if objects exists, get object from global list and then override
    if (id && $scope.idDocs[id]) term = $scope.idDocs[id];
     else term = {term:'', ref:'', definition:'', original:'', verified:false, wordFamily:''};

    // override fields on the form
    term.term = document.getElementById("term").value.trim();
    if ($scope.editdata) {
      if ($scope.editdata.original) term.original = $scope.scrubField($scope.editdata.original);
      if ($scope.editdata.ref) term.ref = $scope.scrubField($scope.editdata.ref, true);
      if ($scope.editdata.definition) term.definition = $scope.scrubField($scope.editdata.definition);
    }
    term.verified = document.getElementById("verifiedCheckbox").checked;
    if (term.term) term.wordfamily = $scope.genWordFamily(term.term);
    if (!term.user) term.user = $scope.getSessionUser();
    return term;
    //var searchTerm=$scope.search.doc.term;
    //var original=$scope.editdata.original;
    //var refrence=$scope.editdata.ref;
    //refrence=$scope.getUnique(refrence);
    //var definition=$scope.editdata.definition;
    //var verified=$scope.verified;
    //var verified=document.getElementById("verifiedCheckbox").checked;
    //var ambiguous=$scope.ambiguous;
    //var wordfamilyField=$scope.search.doc.term;
    //wordfamilyField= wordfamilyField.replace("_","");
    //wordfamilyField=Utils.dotUndersRevert(wordfamilyField);
    //var sessionArray= JSON.parse( localStorage.getItem("session-user"));
    //var userName=sessionArray.username;
  };

  // set the form data from a termObj and set to edit mode
  $scope.setFormTerm = function(termObj) {
    // clear form -- (it will set to "add" mode temporarily but that does not matter)
    $scope.clearEditForm();

    // what is this?
    $scope.editdata=termObj;

    // override all fields
    document.getElementById("keyid").value = termObj['_id'];
    document.getElementById("keyrev").value = termObj['_rev']; // we should stop using this one

    // what does this do?
    //$scope.addform.$setPristine();

    // what is this one??
    //$scope.search.doc.term = t.wordfamily.toLowerCase();

    // if multi value reference, keep only the first one
    //$scope.editdata.term = t.term.trim();
    console.log(termObj);
    document.getElementById("term").value = termObj.term.trim();
    document.getElementById("reference").value = $scope.scrubField(termObj.ref, true);
    document.getElementById("original").value = termObj.original.trim();
    document.getElementById("definition").value = termObj.definition.trim();
    document.getElementById("verifiedCheckbox").checked = termObj.verified;

    // why do we need this?
    $scope.editdata.original =termObj.original.trim();
    //$scope.editdata.definition = t.definition.trim();

    //$scope.addState();
    //$scope.allDocsFunc();

    // set edit mode
    $('#addword').css({ "display":"none" });
    $('#Button2').css({ "display":"block" });
    $('#Button3').css({ "display":"block" });
    $('#updateword').css({ "display":"block" });
    document.getElementById("toptext").innerHTML="Edit:";


    // ??? what does this do?
    //$scope.testFunction();
    /*
    var term = $('#term').val();
    if(term !== "") {
      var changedTerm=$scope.customi2html(term);
      $("#term").val(changedTerm);
      $("#heading-term").html(Utils.ilm2HTML(changedTerm));
    }
    */


    $("#heading-term").html(Utils.ilm2HTML(termObj.term));

    setTimeout(function() {
      $("#term").trigger("change");
    }, 100);


    // TODO: add audio state
  };

  /********* end of CRUD DRY Utils *************/






  $("#spinner").show();
  $scope.refreshAllDocList(); // added by Chad to load cache
  getRecords.getAllData()
    .success(function(data) {
      if(data.rows) {
        $scope.docs=data.rows;
        $scope.count=data.total_rows;
        $("#spinner").hide();
        $(".pagination").css("display","block");
      }
    })
    .error(function(error) {
      //  console.log(error);
    });
    if(sessionStorage.length!=0){
      if(sessionStorage.data) {
        var arrayDoc=JSON.parse(docData.getFormData());
        var id=JSON.stringify(arrayDoc[0]['id']);
        id=id.replace(/"/g,'');
        var rev=JSON.stringify(arrayDoc[1]['rev']);
        rev=rev.replace(/"/g,'');
        setTimeout(function(){$scope.editdoc(id,rev)},5000);
      }
    }



  /* what is this? should it be part of the term Form load?
  $scope.testFunction=function() {
    var term = $('#term').val();
    if(term !== "") {
      var changedTerm=$scope.customi2html(term);
      $("#term").val(changedTerm);
      $("#heading-term").html(Utils.ilm2HTML(changedTerm));
    }
    setTimeout(function() {
      $("#term").trigger("change");
    }, 100);
  };
  */



  //===============All docs function======================//
  $scope.allDocsFunc=function() {
    $scope.refreshAllDocList();
  };


  //==Delete Record from the partial or whole word searches========//
  $scope.deletedoc = function(id) {
    if($window.confirm('Are you SURE you want to delete this term?')) {
      var termObj = $scope.getTermObj(id);
      $scope.termCRUD('delete', termObj, function() {
        // clean & compact the word family
        $scope.cleanWordFamily(termObj);
        // wait a second then refresh global list and filtered matches
        setTimeout(function(){
          // refresh filtered list with form term, this is not implemented yet
          // $scope.refreshFilteredMatches(termObj);
        }, 1000);
      });
    }
  };
    /*
      if($window.confirm('Are you SURE you want to delete?')) {
        $http.get('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev+'&include_docs=true').
        success(function(data, status, headers, config) {
          $scope.editdata=data;
          document.getElementById("term").value=data.term;
          //==============First check the record being deleted is verified or not===============//
          if(data.verify==1) {
            //=============if verified record====================//
            //=============Get record's word family================//
            $scope.wholeWordMatches = $filter('wholeWordFilter')(items,data.term);
            var countVerify=0;
            angular.forEach($scope.wholeWordMatches,function(match) {
              if(match.doc._id!=id) {
                if(match.doc.verify==1) {
                  countVerify++;
                }
              }
            });
            if(countVerify==1)   {
              //===========if this is not alone verified record and more verified left============//
              $http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev).
              success(function(data, status, headers, config) {
                $("#spinner").show();
                $scope.message='Record Deleted Successfully';
                //================Unmark the family ambiguous======================//
                angular.forEach($scope.wholeWordMatches,function(match) {
                  var updateid= match.doc._id;
                  var revid= match.doc._rev;
                  var updatedWordfamilyField=$scope.search.doc.term;
                  updatedWordfamilyField= updatedWordfamilyField.replace("_","");
                  updatedWordfamilyField=Utils.dotUndersRevert(updatedWordfamilyField);
                  if(match.doc._id!=data.id) {
                    if(match.doc.verify==1) {
                      var verify=1;
                    }
                    else {
                      var verify=0;
                    }
                    var newdata= JSON.stringify
                    ({
                      "source": match.doc.source,
                      "original": match.doc.original ,
                      "definition": match.doc.definition,
                      "type": "term",
                      "user":  match.doc.user,
                      "term":  match.doc.term,
                      "ref": match.doc.ref,
                      "wordfamily":updatedWordfamilyField,
                      "verify":verify,
                      "ambiguous":0
                    });
                    $http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+updateid+'?rev='+revid, newdata).
                    success(function(newdata, status, headers, config) {
                      console.log(status);
                    }).
                    error(function(data, status, headers, config) {
                      console.log(status);
                    });
                  }
                });
              }).
              error(function(data, status, headers, config)
              {
              });
            }
            else if(countVerify>=1) {
              //===========if this is not alone verified record and more verified left============//
              $http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev).
              success(function(data, status, headers, config) {
                $("#spinner").show();
                $scope.message='Record Deleted Successfully';
                //================mark the family ambiguous======================//
                angular.forEach($scope.wholeWordMatches,function(match) {
                  var updateid= match.doc._id;
                  var revid= match.doc._rev;
                  var updatedWordfamilyField=$scope.search.doc.term;
                  updatedWordfamilyField= updatedWordfamilyField.replace("_","");
                  updatedWordfamilyField=Utils.dotUndersRevert(updatedWordfamilyField);
                  if(match.doc._id!=data.id) {
                    if(match.doc.verify==1) {
                      var verify=1;
                    }
                    else {
                      var verify=0;
                    }
                    var newdata= JSON.stringify
                    ({
                      "source": match.doc.source,
                      "original": match.doc.original ,
                      "definition": match.doc.definition,
                      "type": "term",
                      "user":  match.doc.user,
                      "term":  match.doc.term,
                      "ref": match.doc.ref,
                      "wordfamily":updatedWordfamilyField,
                      "verify":verify,
                      "ambiguous":1
                    });
                    $http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+updateid+'?rev='+revid, newdata).
                    success(function(newdata, status, headers, config)
                    {
                      console.log(status);
                    }).
                    error(function(data, status, headers, config)
                    {
                      console.log(status);
                    });
                  }
                });
              }).
              error(function(data, status, headers, config)
              {
              });
            }
            else
            {
              //===============if this alone is verified=================//
              //===========if this is not alone verified record and more verified left============//
              $http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev).
              success(function(data, status, headers, config)
              {
                $("#spinner").show();
                $scope.message='Record Deleted Successfully';
              }).
              error(function(data, status, headers, config)
              {
              });
            }
          }
          else
          {
            //=============if not a verified record====================//
            $http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev).
            success(function(data, status, headers, config)
            {
              $("#spinner").show();
              $scope.message='Record Deleted Successfully';
              $http.get('http://'+domainRemoteDb+'/'+remoteDb+'/_all_docs?include_docs=true')
              .success(function(data)
              {
                if(data.rows)
                {
                  $scope.docs=data.rows;
                  $scope.count=data.total_rows;
                  $('div[id^="showDiv-"]').hide();
                }
              })
              .error(function(error)
              {
                console.log(error);
              });
            }).
            error(function(data, status, headers, config)
            {
              $scope.message='Error Deleting Record';
            });
          }
        }).
        error(function(data, status, headers, config) {
        });
      }


      setTimeout(function(){
      $scope.editdata.ref="";
      $scope.editdata.original="";
      $scope.editdata.definition="";
      document.getElementById("verifiedCheckbox").checked = false;
      $scope.allDocsFunc();
      },1000);


    };

    */
  //============================Delete data in the form=====================================//
  $scope.deletedata = function() {
    if($window.confirm('Are you SURE you want to delete this term?')) {
      var termObj = $scope.getFormTerm();
      $scope.termCRUD('delete', termObj, function() {
        // clean & compact the word family
        $scope.cleanWordFamily(termObj);
        // wait a second then refresh global list and filtered matches
        setTimeout(function() {
          // refresh filtered list with form term, this is not implemented yet
          // $scope.refreshFilteredMatches(termObj);
        }, 1000);
      });
    }
  };

   /*


      var id=document.getElementById("keyid").value;
      var rev=document.getElementById("keyrev").value;
      if($window.confirm('Are you SURE you want to delete?')) {

        $http.get('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev+'&include_docs=true').
        success(function(data, status, headers, config)
        {
          $scope.editdata=data;
          document.getElementById("term").value=data.term;
          //==============First check the record being deleted is verified or not===============//
          if(data.verify==1)
          {
            //=============if verified record====================//
            //=============Get record's word family================//
            $scope.wholeWordMatches = $filter('wholeWordFilter')(items,data.term);
            var countVerify=0;
            angular.forEach($scope.wholeWordMatches,function(match)
            {
              if(match.doc._id!=id)
              {
                if(match.doc.verify==1)
                {
                  countVerify++;
                }
              }
            });
            if(countVerify==1)
            {
              //===========if this is not alone verified record and more verified left============//
              $http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev).
              success(function(data, status, headers, config)
              {
                $("#spinner").show();
                $scope.message='Record Deleted Successfully';
                //================Unmark the family ambiguous======================//
                angular.forEach($scope.wholeWordMatches,function(match)
                {
                  var updateid= match.doc._id;
                  var revid= match.doc._rev;
                  var updatedWordfamilyField=$scope.search.doc.term;
                  updatedWordfamilyField= updatedWordfamilyField.replace("_","");
                  updatedWordfamilyField=Utils.dotUndersRevert(updatedWordfamilyField);
                  if(match.doc._id!=data.id)
                  {
                    if(match.doc.verify==1)
                    {
                      var verify=1;
                    }
                    else
                    {
                      var verify=0;
                    }
                    var newdata= JSON.stringify
                    ({
                      "source": match.doc.source,
                      "original": match.doc.original ,
                      "definition": match.doc.definition,
                      "type": "term",
                      "user":  match.doc.user,
                      "term":  match.doc.term,
                      "ref": match.doc.ref,
                      "wordfamily":updatedWordfamilyField,
                      "verify":verify,
                      "ambiguous":0
                    });
                    $http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+updateid+'?rev='+revid, newdata).
                    success(function(newdata, status, headers, config)
                    {
                      console.log(status);
                    }).
                    error(function(data, status, headers, config)
                    {
                      console.log(status);
                    });
                  }
                });
              }).
              error(function(data, status, headers, config)
              {
              });
            }
            else if(countVerify>=1)
            {
              //===========if this is not alone verified record and more verified left============//
              $http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev).
              success(function(data, status, headers, config)
              {
                $("#spinner").show();
                $scope.message='Record Deleted Successfully';
                //================mark the family ambiguous======================//
                angular.forEach($scope.wholeWordMatches,function(match)
                {
                  var updateid= match.doc._id;
                  var revid= match.doc._rev;
                  var updatedWordfamilyField=$scope.search.doc.term;
                  updatedWordfamilyField= updatedWordfamilyField.replace("_","");
                  updatedWordfamilyField=Utils.dotUndersRevert(updatedWordfamilyField);
                  if(match.doc._id!=data.id)
                  {
                    if(match.doc.verify==1)
                    {
                      var verify=1;
                    }
                    else
                    {
                      var verify=0;
                    }
                    var newdata= JSON.stringify
                    ({
                      "source": match.doc.source,
                      "original": match.doc.original ,
                      "definition": match.doc.definition,
                      "type": "term",
                      "user":  match.doc.user,
                      "term":  match.doc.term,
                      "ref": match.doc.ref,
                      "wordfamily":updatedWordfamilyField,
                      "verify":verify,
                      "ambiguous":1
                    });
                    $http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+updateid+'?rev='+revid, newdata).
                    success(function(newdata, status, headers, config)
                    {
                      console.log(status);
                    }).
                    error(function(data, status, headers, config)
                    {
                      console.log(status);
                    });
                  }
                });
              }).
              error(function(data, status, headers, config)
              {
              });
            }
            else
            {
              //===============if this alone is verified=================//
              //===========if this is not alone verified record and more verified left============//
              $http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev).
              success(function(data, status, headers, config)
              {
                $("#spinner").show();
                $scope.message='Record Deleted Successfully';
              }).
              error(function(data, status, headers, config)
              {
              });
            }
          }
          else
          {
            //=============if not a verified record====================//
            $http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev).
            success(function(data, status, headers, config)
            {
              $("#spinner").show();
              $scope.message='Record Deleted Successfully';
              $http.get('http://'+domainRemoteDb+'/'+remoteDb+'/_all_docs?include_docs=true')
              .success(function(data)
              {
                if(data.rows)
                {
                  $scope.docs=data.rows;
                  $scope.count=data.total_rows;
                  $('div[id^="showDiv-"]').hide();
                }
              })
              .error(function(error)
              {
                console.log(error);
              });
            }).
            error(function(data, status, headers, config)
            {
              $scope.message='Error Deleting Record';
            });
          }
        }).
        error(function(data, status, headers, config) {
        });
      }
      setTimeout(function(){
      $scope.cancelUpdate();
      },1000);
    };
   */

  //=============Cancel function to reset to add state======================//
  $scope.cancelUpdate = function() {
    $scope.clearEditForm();
    /*
    document.getElementById("keyid").value="";
    document.getElementById("keyrev").value="";
    $scope.addform.$setPristine();
    $scope.search.doc.term="";
    $scope.editdata.ref="";
    $scope.editdata.original="";
    $scope.editdata.definition="";
    document.getElementById("verifiedCheckbox").checked = false;
    $scope.addState();
    $scope.allDocsFunc();
    */
  };


  //=============Cancel function to reset to add state after add and update======================//
  $scope.cancelUpdateAdd = function() {
    $scope.clearEditForm();
    /*
    document.getElementById("keyid").value="";
    document.getElementById("keyrev").value="";
    $scope.addform.$setPristine();
    $scope.search.doc.term="";
    //$scope.editdata.ref="";
    $scope.editdata.original="";
    $scope.editdata.definition="";
    document.getElementById("verifiedCheckbox").checked = false;
    $scope.addState();
    $scope.allDocsFunc();
    */
  };

    //==============Add state of the form========================//
    /*
    $scope.addState = function() {
      // note: I've added this to the clearForm function so clear form sets to add state.
      // that will have to be overridden for edit mode
      document.getElementById("toptext").innerHTML="Add:";
      document.getElementById("heading-term").innerHTML="";
      $('#Button2').css({ "display":"none" });
      $('#Button3').css({ "display":"none" });
      $('#updateword').css({ "display":"none" });
      $('#addword').css({ "display":"block" });
    };
    */

  //////////////////////////single record data/////////////////////////////////////
  $scope.editdoc = function(id) {
    var termObj = $scope.getTermObj(id);
    if (termObj) $scope.setFormTerm(termObj);
      else $scope.clearEditForm();
     /*
    $http.get('http://'+domainRemoteDb+'/'+remoteDb+'/'+id+'?rev='+rev+'&include_docs=true')
      .success(function(data, status, headers, config) {
        $scope.editdata=data;
        document.getElementById("term").value=data.term;
        document.getElementById("keyid").value=data._id;
        document.getElementById("keyrev").value=data._rev;
        $('#addword').css({ "display":"none" });
        $('#Button2').css({ "display":"block" });
        //$( "#Button2" ).attr( "ng-click", "deletedata('"+id+"','"+rev+"');" );
        $('#Button3').css({ "display":"block" });
        $('#updateword').css({ "display":"block" });
        document.getElementById("toptext").innerHTML="Edit:";
        var refrenceArray=data.ref;
        if(sessionStorage.length!=0)   {
          var sessionTerm=sessionStorage.term;
          sessionStorage.clear();
          sessionStorage.term=sessionTerm;
        }
        $scope.testFunction();
      })
      .error(function(data, status, headers, config) {
      });
     */
  };

  //=====================================Add a new term===================================//
  $scope.adddata=function() {
    var termObj = $scope.getFormTerm();
    if (!termObj.term.trim()) alert('Warning: term field required.');
      else $scope.termCRUD('add', termObj, function(){
        // clean up word family
        $scope.cleanWordFamily(termObj.wordfamily);
        // clear form
        $scope.clearEditForm();
      });
  };

      /*
        //===========Get all data of the record==================//
        var term=$scope.search.doc.term;
        var original=$scope.editdata.original;
        var refrence=$scope.editdata.ref;
        refrence=$scope.getUnique(refrence);
        var definition=$scope.editdata.definition;
        //var verified=$scope.verified;
        var verified=document.getElementById("verifiedCheckbox").checked;
        var ambiguous=$scope.ambiguous;
        var sessionArray= JSON.parse( localStorage.getItem("session-user"));
        var userName=sessionArray.username;
        var wordfamilyField=$scope.search.doc.term;
        wordfamilyField= wordfamilyField.replace("_","");
        wordfamilyField=Utils.dotUndersRevert(wordfamilyField);
        //==============Get its word family=======================//
        $scope.wholeWordMatches = $filter('wholeWordFilter')(items,term);
        if(verified) {
          //============If record being added is verified====================//
          var countVerify=0;
          //====Check if other records in the family are verified or not=====//
          angular.forEach($scope.wholeWordMatches,function(item) {
            if(item.doc.verify) {
              if(item.doc.verify==1) {
                countVerify++;
              }
            }
          });
          //===============if other records in family are verified=================//
          if(countVerify>0) {
            var allRef=[];
            allRef.push(refrence);
            var termsMatch=0;
            //==============Check which other records have same term=================//
            angular.forEach($scope.wholeWordMatches, function(item) {
              var termCheck=item.doc.term;
              if(termCheck) {
                if((termCheck.indexOf(term))!=-1 && termCheck.length==term.length) {
                  allRef.push(item.doc.ref);
                  termsMatch++;
                }
              }
            });
            if(termsMatch>0) {
              //=======if any other verified term that matches the current term in the family====//
              var allReferences=allRef.join();
              allReferences=$scope.getUnique(allReferences);
              //==check if the term being added has definition and original==//
              if(original=="" || definition=="") {
                //=get both the values from other terms already present=//
                angular.forEach($scope.wholeWordMatches, function(match) {
                  if(original=="") {
                    original=match.doc.original;
                  }
                  if(definition=="") {
                    definition=match.doc.definition;
                  }
                });
              }
              var data= JSON.stringify
              ({
                "source": userName,
                "original":original ,
                "definition":definition,
                "type": "term",
                "user": userName,
                "term": term,
                "ref":allReferences,
                "wordfamily":wordfamilyField,
                "verify":1,
                "ambiguous":0
              });
              //================adding data record======================//
              if(confirm("Please Confirm the following Addition:"+data)) {
                $http.post('http://'+domainRemoteDb+'/'+remoteDb+'/', data).
                success(function(data, status, headers, config) {
                  console.log(status);
                  $scope.message='Record Added Successfully';
                  angular.forEach($scope.wholeWordMatches, function(match) {
                    //================deleting all other ambiguous records=================//
                    $http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+match.doc._id+'?rev='+match.doc._rev).
                    success(function(data, status, headers, config) {
                      console.log(status);
                    }).
                    error(function(data, status, headers, config) {
                      console.log(status);
                    });
                  });

                }).
                error(function(data, status, headers, config) {
                  console.log(status);
                  $scope.message='Error Adding record';
                });
              }
              else {
                return false;
              }
            }
            else {
              //=====if no other verified term that matches with the current term in the family========//
              var data= JSON.stringify
              ({
                "source": userName,
                "original":original ,
                "definition":definition,
                "type": "term",
                "user": userName,
                "term": term,
                "ref":refrence,
                "wordfamily":wordfamilyField,
                "verify":1,
                "ambiguous":1
              });
              //================adding data record======================//
              if(confirm("Please Confirm the following Addition:"+data))
              {
                $http.post('http://'+domainRemoteDb+'/'+remoteDb+'/', data).
                success(function(data, status, headers, config)
                {
                  console.log(status);
                  $scope.message='Record Added Successfully';
                  //=============making all others ambiguous============//
                  angular.forEach($scope.wholeWordMatches ,function(match)
                  {
                    var updateid= match.doc._id;
                    var revid= match.doc._rev;
                    var updatedWordfamilyField=$scope.search.doc.term;
                    updatedWordfamilyField= updatedWordfamilyField.replace("_","");
                    updatedWordfamilyField=Utils.dotUndersRevert(updatedWordfamilyField);
                    if(match.doc.verify==1)
                    {
                      var verify=1;
                    }
                    else
                    {
                      var verify=0;
                    }
                    var newdata= JSON.stringify
                    ({
                      "source": match.doc.source,
                      "original": match.doc.original ,
                      "definition": match.doc.definition,
                      "type": "term",
                      "user":  match.doc.user,
                      "term":  match.doc.term,
                      "ref": match.doc.ref,
                      "wordfamily":updatedWordfamilyField,
                      "verify":verify,
                      "ambiguous":1
                    });
                    $http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+updateid+'?rev='+revid, newdata).
                    success(function(newdata, status, headers, config)
                    {
                      console.log(status);
                    }).
                    error(function(data, status, headers, config)
                    {
                      console.log(status);
                    });
                  });
                }).
                error(function(data, status, headers, config)
                {
                  console.log(status);
                  $scope.message='Error Adding record';
                });
              }
              else
              {
                return false;
              }
            }
          }
          else
          {
            //==============if other records in family are not verified===============//
            var allRef=[];
            allRef.push(refrence);
            //=====So here we will compress the family into one=======//
            angular.forEach($scope.wholeWordMatches,function(item)
            {
              if(item.doc.ref)
              {
                allRef.push(item.doc.ref);
              }
            });
            var allReferences=allRef.join();
            allReferences=$scope.getUnique(allReferences);
            //==check if the term being added has definition and original==//
            if(original=="" || definition=="")
            {
              //=get both the values from other terms already present=//
              angular.forEach($scope.wholeWordMatches ,function(match)
              {
                if(original=="")
                {
                  original=match.doc.original;
                }
                if(definition=="")
                {
                  definition=match.doc.definition;
                }
              });
            }
            var data= JSON.stringify
            ({
              "source": userName,
              "original":original ,
              "definition":definition,
              "type": "term",
              "user": userName,
              "term": term,
              "ref":allReferences,
              "wordfamily":wordfamilyField,
              "verify":1,
              "ambiguous":0
            });
            //================adding data record======================//
            if(confirm("Please Confirm the following Addition:"+data))
            {
              $http.post('http://'+domainRemoteDb+'/'+remoteDb+'/', data).
              success(function(data, status, headers, config)
              {
                console.log(status);
                $scope.message='Record Added Successfully';
                angular.forEach($scope.wholeWordMatches ,function(match)
                {
                  //================deleting all other ambiguous records=================//
                  $http.delete('http://'+domainRemoteDb+'/'+remoteDb+'/'+match.doc._id+'?rev='+match.doc._rev).
                  success(function(data, status, headers, config)
                  {
                    console.log(status);
                  }).
                  error(function(data, status, headers, config)
                  {
                    console.log(status);
                  });
                });
              }).
              error(function(data, status, headers, config)
              {
                console.log(status);
                $scope.message='Error Adding record';
              });
            }
            else
            {
              return false;
            }
          }
        }
        else
        {
          //============If record being added is not verified====================//
          var countVerify=0;
          //====Check if other records in the family are verified or not and how many verified=====//
          angular.forEach($scope.wholeWordMatches,function(item)
          {
            if(item.doc.verify)
            {
              if(item.doc.verify==1)
              {
                countVerify++;
              }
            }
          });
          if(countVerify>=1)
          {
            //==========if exactly one record is verified================//
            var termsMatch=0;
            //==============Check which other records have same term=================//
            angular.forEach($scope.wholeWordMatches,function(item)
            {
              var termCheck=item.doc.term;
              if(item.doc.verify && item.doc.verify==1)
              {
                if((termCheck.indexOf(term))!=-1 && termCheck.length==term.length)
                {
                  var allRef=[];
                  allRef.push(refrence);
                  allRef.push(item.doc.ref);
                  var allReferences=allRef.join();
                  allReferences=$scope.getUnique(allReferences);
                  //==check if the term being added has definition and original==//
                  if((item.doc.original=="" || typeof(item.doc.original)=="undefined") ||
                     (item.doc.definition=="" || typeof(item.doc.definition)=="undefined"))
                  {
                    //=get both the values from other terms already present=//
                    if(item.doc.original=="" || typeof(item.doc.original)=="undefined")
                    {
                      var neworiginal=original;
                    }
                    if(item.doc.definition=="" || typeof(item.doc.definition)=="undefined")
                    {
                      var newdefinition=definition;
                    }
                  }
                  else
                  {
                    var neworiginal=item.doc.original;
                    var newdefinition=item.doc.definition;
                  }
                  var data= JSON.stringify
                  ({
                    "source": item.doc.source,
                    "original":neworiginal ,
                    "definition":newdefinition,
                    "type": "term",
                    "user": item.doc.userName,
                    "term": item.doc.term,
                    "ref":allReferences,
                    "wordfamily":item.doc.wordfamily,
                    "verify":1,
                    "ambiguous":0
                  });
                  var upid=item.doc._id;
                  var uprev=item.doc._rev;
                  //================adding data record======================//
                  if(confirm("Please Confirm the following Addition:"+data))
                  {
                    $http.put('http://'+domainRemoteDb+'/'+remoteDb+'/'+upid+'?rev='+uprev, data).
                    success(function(data, status, headers, config)
                    {
                      console.log(status);
                      $scope.message='Record Merged Successfully';
                    }).
                    error(function(data, status, headers, config)
                    {
                      console.log(status);
                      $scope.message='Error Adding record';
                    });
                  }
                  else
                  {
                    return false;
                  }
                  termsMatch++;
                }
              }
            });
            if(termsMatch==0)
            {
              //====================if no term matches====================//
              alert("The term you are trying to add does not match with any of the existing verified spellings "+
                "and will not be saved unless spelling is verified.");
            }
          }
          //~ else if(countVerify>1)
          //~ {
            //~ //==========if more than one record is verified================//
          //~ }
          else
          {
            //==========if no other record is verified================//
            var data= JSON.stringify
              ({
                "source": userName,
                "original":original ,
                "definition":definition,
                "type": "term",
                "user": userName,
                "term": term,
                "ref":refrence,
                "wordfamily":wordfamilyField,
                "verify":0,
                "ambiguous":0
              });
            //================adding data record======================//
            if(confirm("Please Confirm the following Addition:"+data))
            {
              $http.post('http://'+domainRemoteDb+'/'+remoteDb+'/', data).
              success(function(data, status, headers, config)
              {
                console.log(status);
                $scope.message='Record Added Successfully';
              }).
              error(function(data, status, headers, config)
              {
                console.log(status);
                $scope.message='Error Adding record';
              });
            }
            else
            {
              return false;
            }
          }

        }
        setTimeout(function(){
          $scope.cancelUpdateAdd();
        },2000);

        */



  //=======Form Update record======================================//
  $scope.updatedata=function(items) {
    var termObj = $scope.getFormTerm();
    //alert(JSON.stringify(termObj));
    $scope.termCRUD("update",termObj, function() {
      // clean & compact the word family
      $scope.cleanWordFamily(termObj);
      // wait a second then refresh global list and filtered matches
      setTimeout(function(){
          // refresh filtered list with whatever matches the form term, this is not implemented yet
          // $scope.refreshFilteredMatches(termObj);
      }, 1000);
    });
  };

  //////////////////////////Search data/////////////////////////////////////
  $scope.getnames=function(searchval){
    $http.get('http://'+domainRemoteDb+'/'+remoteDb+'/_design/lists/_view/full_term?startkey="'+searchval+
        '"&endkey="'+searchval+'\\ufff0"&include_docs=true')
    .success(function(data) {
      console.log(data);
      if(data.rows) {
        $scope.docs=data.rows;
        $scope.count=data.total_rows;
      }
    })
    .error(function(error) {
       //
    });
  };


  // is this for the filtered list?
  $scope.getAllRecords = function(key, docs){
    // I replace the old code with code that uses the new object-based cache
    // since the object-based cache has hash lookup and does not need reloaded with each crud change
    var filtered = [];
    // iterate termObj cache idDocs, grab matches
    Object.keys($scope.idDocs).forEach(function(id) {
      var termObj = $scope.idDocs[id];
      var match = termObj.wordfamily.toLowerCase();
      if(((match.indexOf(key)) !=-1) && (match.length == key.length)) filtered.push(termObj);
    });
        /*var filtered = new Array();
        angular.forEach(docs, function(item) {
          var string=item.doc.term;
          if(string) {
            string = string.replace("_","");
            string = string.toLowerCase();
            string = Utils.dotUndersRevert(string);
            if( ((string.indexOf(key)) !=-1) && (string.length == key.length) ) {
              filtered.push(item.doc);
            }
          }
        });*/
    $scope.filterresult = filtered;
    $scope.viewkey=key;
    $("span[id^='sideIcon-']").addClass("glyphicon glyphicon-play mr5 openPanel");
    document.getElementById("sideIcon-"+key).className = "glyphicon glyphicon-chevron-down mr5 openPanel";
    document.getElementById("showDiv-"+key).style.display='block';
  };


      /*
      $scope.getUnique = function(arrayNew) {
        // (modified by Chad July 10 2015)
        // clean up references replacing variants of PG. with pg, PAR. with par, are removing excess spaces
        if(arrayNew=="undefined") arrayNew = '';
        return arrayNew.split(",").map(function(ref) {
          return ref.replace(/(pg[\.]?|page|p\.)/ig, 'pg ') // cleanup PG
                    .replace(/(par[\.]?|pp[\.]?)/ig,'par ') // cleanup PAR
                    .replace(/\s+/ig, ' ') // remove any excess spaces
                    .trim(); // remove surrounding spaces
        })
        // remove duplicates
        .filter(function(ref, index, self) {
          return index == self.indexOf(ref);
        })
        // re-join with a comma and a space
        .join(', ');
      };
      */



})


/*
This directive allows us to pass a function in on an enter key to do what we want.
 */
.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
    })
.filter('singlegroupFilter',['Utils',function(Utils){
  return function(items,search)
  {
    var subArray=[];
    var filtered = [];
    var mainArray={};
    var count=1;
    var wordFamily=[];

    angular.forEach(items, function(item)
    {
      var string=item.doc.term;
      if(string)
      {
        string= string.replace("_","");
        string=string.toLowerCase();
        string=Utils.dotUndersRevert(string);
        search=search.toLowerCase();
        search= search.replace("_","");
        search=Utils.dotUndersRevert(search);
        if( ((string.indexOf(search)) !=-1) && (string.length!= search.length))
        {
          if(string in mainArray)
          {
            var countnew=mainArray[string];
            countnew++;
            mainArray[string]=countnew;
          }
          else
          {
            count=1;
            mainArray[string]=count;

          }
        }
      }
    });
    angular.forEach(mainArray,function(value,key)
    {
      if(value==1)
      {
        angular.forEach(items, function(item)
        {
          var string=item.doc.wordfamily;
          if(string)
          {
            string=string.toLowerCase();
            if( ((string.indexOf(key)) !=-1) && (string.length== key.length))
            {
                filtered.push(item);
                return false;
            }
          }
          else
          {
            var string=item.doc.term;
            if(string)
            {
              string= string.replace("_","");
              string=Utils.dotUndersRevert(string);
              string=string.toLowerCase();
              if( ((string.indexOf(key)) !=-1) && (string.length== key.length))
              {
                  filtered.push(item);
                  return false;
              }
            }
          }
        });
      }

    });
    return filtered;
  };
  }])
.filter('offset', function() {
  return function(input, start) {
   if (!input || !input.length) { return; }
        start = +start; //parse to int
        return input.slice(start);
  };
})

.filter('myfilterData',['Utils',function(Utils){
  return function(items,search)
  {
    var subArray={};
    var filtered = [];
    var mainArray={};
    var count=1;

    angular.forEach(items, function(item)
    {
      var string=item.doc.term;
      if(string)
      {
        string= string.replace("_","");
        //string=string.toLowerCase();
        string=Utils.dotUndersRevert(string);
        if(search)
        {
        //  search=search.toLowerCase();
          search= search.replace("_","");
          search=Utils.dotUndersRevert(search);
          if( ((string.indexOf(search)) !=-1) && (string.length!= search.length))
          {
            filtered.push(item);
          }
        }

      }
    });

    return filtered;
  };

}])
.filter('wholeWordFilter',['Utils',function(Utils){
  return function(items,search)
  {
    var filtered = [];
    angular.forEach(items, function(item)
    {
      var string=item.doc.term;
      if(string)
      {
        string= string.replace("_","");
        //string=string.toLowerCase();
        string=Utils.dotUndersRevert(string);
        //search=search.toLowerCase();
        search= search.replace("_","");
        search=Utils.dotUndersRevert(search);
        if( ((string.indexOf(search)) !=-1) && (string.length== search.length))
        {
          filtered.push(item);
        }
      }
    });
    return filtered;
  }
}])
.filter('wholeWordFilterMatch',['Utils',function(Utils){
  return function(items,search)
  {
    var filtered = [];
    angular.forEach(items, function(item)
    {
      var string=item.doc.term;
      if(string)
      {
        string= string.replace("_","");
        string=string.toLowerCase();
        string=Utils.dotUndersRevert(string);
        search=search.toLowerCase();
        search= search.replace("_","");
        search=Utils.dotUndersRevert(search);
        if( ((string.indexOf(search)) !=-1) && (string.length== search.length))
        {
          filtered.push(item);
        }
      }
    });
    return filtered;
  }
}])
.filter('groupfilter',['Utils',function(Utils){
  return function(items,search)
  {
    var subArray={};
    var filtered = [];
    var mainArray={};
    var count=1;

    angular.forEach(items, function(item)
    {
      var string=item.doc.term;
      if(string)
      {
        string= string.replace("_","");
        string=string.toLowerCase();
        string=Utils.dotUndersRevert(string);
        search=search.toLowerCase();
        search= search.replace("_","");
        search=Utils.dotUndersRevert(search);
        if( ((string.indexOf(search)) !=-1) && (string.length!= search.length))
        {
          if(string in mainArray)
          {
            var countnew=mainArray[string];
            countnew++;
            mainArray[string]=countnew;
          }
          else
          {
            count=1;
            mainArray[string]=count;
          }
        }
      }
    });
    //console.log(mainArray);
    return mainArray;
  };

}])
.filter('groupfiltercount',['Utils',function(Utils){
  return function(items,search)
  {
    var subArray={};
    var filtered = [];
    var mainArray={};
    var count=1;

    angular.forEach(items, function(item)
    {
      var string=item.doc.term;
      if(string)
      {
        string= string.replace("_","");
        string=string.toLowerCase();
        string=Utils.dotUndersRevert(string);
        search=search.toLowerCase();
        search= search.replace("_","");
        search=Utils.dotUndersRevert(search);
        if( ((string.indexOf(search)) !=-1) && (string.length!= search.length))
        {
          if(string in mainArray)
          {
            var countnew=mainArray[string];
            countnew++;
            mainArray[string]=countnew;
          }
          else
          {
            count=1;
            mainArray[string]=count;
          }
        }
      }
    });
    var sum=0;
    angular.forEach(mainArray,function(it)
    {
      sum=sum+it;
    });
    return sum;
  };

}])
.filter('newfilter',function(){
  return function(items,search)
  {
    var filtered = [];
    if(search)
    {
      angular.forEach(items, function(item)
      {
        var string=item.doc.term;
        if(string)
        {
          if( ((string.toLowerCase().indexOf(search.toLowerCase())) !=-1) && item.doc.verified==1)
          {
            filtered.push(item);
          }
        }
      });
      return filtered;
    }
    else
    {
      return items;
    }
  }
})
.controller("PaginationCtrl", function($scope) {

  $scope.itemsPerPage = 10;
  $scope.currentPage = 0;
  $scope.items = [];
  $scope.totalRows=5334;

  for (var i=0; i<$scope.totalRows; i++) {

    $scope.items.push({ id: i, name: "name "+ i, description: "description " + i });
  }

  $scope.range = function() {
    var rangeSize = 5;
    var ret = [];
    var start;

    start = $scope.currentPage;
    if ( start > $scope.pageCount()-rangeSize ) {
      start = $scope.pageCount()-rangeSize+1;
    }

    for (var i=start; i<start+rangeSize; i++) {
      ret.push(i);
    }
    return ret;
  };

  $scope.prevPage = function() {
    if ($scope.currentPage > 0) {
      $scope.currentPage--;
    }
  };

  $scope.prevPageDisabled = function() {
    return $scope.currentPage === 0 ? "disabled" : "";
  };

  $scope.pageCount = function() {
    return Math.ceil($scope.items.length/$scope.itemsPerPage)-1;
  };

  $scope.nextPage = function() {
    if ($scope.currentPage < $scope.pageCount()) {
      $scope.currentPage++;
    }
  };

  $scope.nextPageDisabled = function() {
    return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
  };

  $scope.setPage = function(n) {
    $scope.currentPage = n;
  };

  /******************************************************/
  // some helper functions to clean up CRUD operations



});
