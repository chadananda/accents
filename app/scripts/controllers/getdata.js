'use strict';

/**
 * @ngdoc function
 * @name accentsApp.controller:getdataCtrl
 * @description
 * # getdataCtrl
 * Controller of the accentsApp
 */
angular.module('accentsApp')
  .controller('getdataCtrl',
    function($rootScope,$scope,$http,getRecords,$window,$filter,myConfig,Utils,$sce,docData,$modal,$log,crudFunctions) {
  $scope.docs={};
  $scope.filterresult={};
  $scope.awesomeThings = [
    'HTML5 Boilerplate',
    'AngularJS',
    'Karma'
  ];

  var domainRemoteDb=myConfig.remoteDbDomain;
  var remoteDb=myConfig.database;


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

  //=======Called on ng-keyup of term======//
  $scope.changeTerm=function(){
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
    else $("#heading-term").html("");
  };


  // Every checkboxes in the page
  // Why?
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

 

  // loads one term from $scope.idDocs list. This is here in case we want to change how fields are cached.
  $scope.getTermObj = function(id) {
      if ($scope.idDocs && $scope.idDocs[id]) return $scope.idDocs[id];
      // if it fails, re-load the list so it will work next time
      if (!$scope.idDocs) $scope.refreshAllDocList();
      return false;
  };

  // DATABASE term WRITE functions in one place for easy override
  $scope.termCRUD = function(action, termObj, callback) {
    if (['put', 'update', 'post', 'add', 'delete'].indexOf(action) < 0) {
      console.log('No db action: '+action);
      return false;
    }
    console.log('termCRUD', action, termObj);
    // prune unallowed fields
    termObj = crudFunctions.pruneUnallowedFields(termObj);

    // delete action requires _id and _rev
    if (action == 'delete') {
      // we update global cache first so our cache is valid synchronously
      delete $scope.idDocs[termObj._id]; // remove item from cache
        crudFunctions.refreshOldDocsList($scope);
      // now delete from the database
      $http.delete(crudFunctions.db_url() + termObj._id +'?rev='+ termObj._rev)
        .success(function(data, status, headers, config){ if (callback) callback(); })
        .error(function(data, status, headers, config) { console.log(status); });

    // update (put) requires object with _id and _rev, term, wordfamily
    } else if (termObj['_rev']) {
      if (!termObj.term || !termObj._id || !termObj._rev) {
        console.log('Error: put (update) requires term, _id and _rev');
      }
      termObj.wordfamily = crudFunctions.genWordFamily(termObj.term);
      termObj.type = 'term';
      $http.put(crudFunctions.db_url() +termObj._id+'?rev='+termObj._rev,JSON.stringify(termObj))
        .success(function(newdata, status, headers, config) {
          termObj._rev = newdata.rev; // update object with new _rev
          $scope.idDocs[termObj._id] = termObj; // update cache (not sure if this is needed -- ref or copy?)
            crudFunctions.refreshOldDocsList($scope);
          if (callback) callback();
        })
        .error(function(data, status, headers, config) { console.log(status); });


    // add (post) requires object with term, wordfamily
    } else if (!termObj['_rev']) {
      if (!termObj.term) {
        console.log('Error: post (add) requires term');
        return;
      }
      termObj.wordfamily = crudFunctions.genWordFamily(termObj.term);
      termObj.type = 'term';
      $http.post(crudFunctions.db_url(), JSON.stringify(termObj))
        .success(function(newdata, status, headers, config) {
          termObj._rev = newdata.rev;
          termObj._id = newdata.id;
          //console.log('newly added termObj', termObj);
          $scope.idDocs[termObj._id] = termObj; // add to cache now that we have an id
            crudFunctions.refreshOldDocsList($scope);
          if (callback) callback(termObj);
        })
        .error(function(data, status, headers, config) { console.log(status); });
    }
  };

  // DATABASE read all fields into hash cache ($scope.idDocs[id]) instant access by _id
  $scope.refreshAllDocList = function(callback) {
    var termObj;
    $http.get(crudFunctions.db_url() + '_all_docs?include_docs=true')
      .success(function(data)  {
        if(data.rows) {
          $scope.idDocs = {}; // clear termObj cache
          data.rows.forEach(function(doc){
            termObj = doc.doc;
            if (termObj.type === 'term') {
              termObj.wordfamily = crudFunctions.genWordFamily(termObj.term); // in case it is not there already
              termObj.original = termObj.original || ''; // default blank string
              termObj.definition = termObj.definition || ''; // default blank
              termObj.ref = crudFunctions.scrubField(termObj.ref, true);
              termObj.verified = termObj.verified || false;
              termObj = crudFunctions.pruneUnallowedFields(termObj); // remove any extraneous fields
              $scope.idDocs[termObj['_id']] = termObj; // add to termObj cache
            }
          });

          // for the time being, we can use this to refresh $scope.docs
         crudFunctions.refreshOldDocsList($scope);

          if (callback) callback();
        }
      })
      .error(function(error) { console.log(error); });
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
            base[key] = crudFunctions.scrubField(base[key]+','+term[key], true);
          } else if (key == 'audio') {
            // TODO: not sure how this should merge because we need to keep any file attachment
            //
          } else if (['_id','_rev','type','term','ambiguous','wordfamily'].indexOf(key)>-1) {
            // skip these, we do not need to merge them
          } else {
            // default merge style for all other fields
            base[key] = crudFunctions.scrubField(base[key]+','+term[key]);
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

 



  // get current session user
  $scope.getSessionUser = function() {
    var sessionArray= JSON.parse(localStorage.getItem("session-user"));
    return sessionArray.username;
  };


  // clear form (except reference field) and set to Add mode
  $scope.clearEditForm = function() {
    // clear all fields except for reference field
    document.getElementById("keyid").value="";
    //document.getElementById("keyrev").value="";
    if(typeof($scope.addform)!="undefined") $scope.addform.$setPristine();
    //$scope.search.doc.term='';
   // document.getElementById("term").value="";
    // if multi value reference, keep only the first one
    var ref = document.getElementById("reference").value.split(',').shift().trim();
    $scope.editdata = {ref: ref};
    document.getElementById("verifiedCheckbox").checked = false;
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
      if ($scope.editdata.original) term.original = crudFunctions.scrubField($scope.editdata.original);
      if ($scope.editdata.ref) term.ref = crudFunctions.scrubField($scope.editdata.ref, true);
      if ($scope.editdata.definition) term.definition = crudFunctions.scrubField($scope.editdata.definition);
    }
    term.verified = document.getElementById("verifiedCheckbox").checked;
    if (term.term) term.wordfamily = crudFunctions.genWordFamily(term.term);
    if (!term.user) term.user = $scope.getSessionUser();
    return term;
  };

  // set the form data from a termObj and set to edit mode
  $scope.setFormTerm = function(termObj) {
    // clear form -- (it will set to "add" mode temporarily but that does not matter)
    $scope.clearEditForm();

    // what is this?
    $scope.editdata=termObj;

    // override all fields
    document.getElementById("keyid").value = termObj['_id'];
    //document.getElementById("keyrev").value = termObj['_rev']; // we should stop using this one

    // what does this do?
    //$scope.addform.$setPristine();

    // what is this one??
    //$scope.search.doc.term = t.wordfamily.toLowerCase();

    // if multi value reference, keep only the first one
    //$scope.editdata.term = t.term.trim();
    document.getElementById("term").value = termObj.term.trim();
    document.getElementById("reference").value = crudFunctions.scrubField(termObj.ref, true);
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
    $("#heading-term").html(Utils.ilm2HTML(termObj.term));

    $scope.refreshFilteredMatches(termObj);

    // TODO: add audio state
  };


  // Generate an object of word families
  $scope.getMatchLists = function(search) {
    // Each member being an object of terms,
    // Each term holds an array of matching term objects
    // Because each sub-group is an array, we don't need to keep count, just use length
    //
    // {
    //  whole: {
    //    Shiraz:  {_Shiraz:  [termObj, termObj],  _Shiráz: [termObj, termObj],   Shiráz:  [termObj] }
    //  }
    //  partial: {
    //    Shirazi: {_Shirazi: [termObj, termObj],  _Shirázi: [termObj, termObj],  Shirázi: [termObj] }
    //  }
    // }
    var whole = {}, partial = {}; // format of our result object
    search = crudFunctions.genWordFamily(search).toLowerCase(); // properly format search term
    // iterate all terms in cache
    angular.forEach($scope.idDocs, function(termObj) {
      // matching objects added to either the partial or whole objects
      if (termObj.wordfamily.toLowerCase().indexOf(search)>-1) {
        if (termObj.wordfamily.length === search.length) {
          // create the sub-array if necessary before attaching the object
          if (!whole[termObj.term]) whole[termObj.term] = [];
          whole[termObj.term].push(termObj);
        } else {
          if (!partial[termObj.term]) partial[termObj.term] = [];
          partial[termObj.term].push(termObj);
        }
      }
    });
    return {whole: whole, partial: partial};
  };


  /********* end of CRUD DRY Utils *************/


  // Inititlization Code
  $("#spinner").show();

  // load data cache
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

      //to call the edit function from allterms page
      setTimeout(function(){$scope.editdoc(id,rev)},5000);
    }
  });

  //==Delete Record from the partial or whole word searches========//
  $scope.deletedoc = function(id) {
    if(confirm('Are you SURE you want to delete this term?')) {
      var termObj = $scope.getTermObj(id);
      $scope.termCRUD('delete', termObj, function() {
        // how could $scope.editdata be undefined at this point? Why would we have a delete button?
        if (typeof($scope.editdata)!="undefined") {
          $scope.clearEditForm(); // clear form
        }
        // clean & compact the word family
        crudFunctions.cleanWordFamily(termObj,$scope);
        // refresh global list and filtered matches
        $scope.refreshFilteredMatches(termObj);
      });
    }
  };

  // Refresh the search with supplied term object
  $scope.refreshFilteredMatches = function(term) {
    setTimeout(function(){
      // in case this is a termObj, just grab the term part
      if (term.hasOwnProperty('term')) term = term.term;
      $scope.changeTerm(term);
      $("#term").trigger("change"); // interesting
    }, 500);
  };


  // Delete from Form itself
  $scope.deletedata = function() {
    if($window.confirm('Are you SURE you want to delete this term?')) {
      var termObj = $scope.getFormTerm();
      $scope.termCRUD('delete', termObj, function() {
        // clean & compact the word family
        crudFunctions.cleanWordFamily(termObj,$scope);
        // clear form
        $scope.clearEditForm();
      });
    }
  };
  // Cancel Add or Update Event
  $scope.cancelUpdate = function() {
    $scope.clearEditForm();
  };
  // Cancel Add or Update Event
  $scope.cancelUpdateAdd = function() {
    $scope.clearEditForm();
  };
  // Edit item
  $scope.editdoc = function(id) {
    var termObj = $scope.getTermObj(id);
    if (termObj) $scope.setFormTerm(termObj);
      else $scope.clearEditForm();
  };

  // Form Add
  $scope.adddata=function() {
    var termObj = $scope.getFormTerm();
    if (!termObj.term.trim()) alert('Warning: term field required.');
      else $scope.termCRUD('add', termObj, function(){
        // clean up word family
        crudFunctions.cleanWordFamily(termObj,$scope);
        // clear form
        $scope.clearEditForm();
     });
  };

  // Form Update
  $scope.updatedata=function() {
    var termObj = $scope.getFormTerm();
    $scope.termCRUD("update", termObj, function() {
      // clean & compact the word family
      crudFunctions.cleanWordFamily(termObj,$scope);
      // clear form
      $scope.clearEditForm();
    });
  };
//~ $scope.saveAudio=function(){
	//~ console.log("testing");
	//~ var xhr = new XMLHttpRequest();
//~ xhr.open('GET', 'blob:http://localhost:9000/a9b74b9e-d626-4d66-84ce-108b9e03f346', true);
//~ xhr.responseType = 'blob';
//~ xhr.onload = function(e) {
  //~ if (this.status == 200) {
    //~ var myBlob = this.response;
    //~ // myBlob is now the blob that the object URL pointed to.
    //~ console.log(myBlob);
  //~ }
//~ };
//~ xhr.send();
//~ console.log(myBlob);
//~ };
  // Search data
  $scope.getnames=function(searchval){
    // Pull from the idDocs list instead of from the DB to speed this up
    // something like:
    var rows = [];
    Object.keys($scope.idDocs).forEach(function(id) {
      var termObj = $scope.idDocs[id];
      if (termObj.term.indexOf(searchval)>-1) rows.push(termObj);
    });
    if (rows.length) {
      $scope.docs=rows;
      $scope.count=rows.length;
    }
  };
  // is this for the filtered list?
  $scope.getAllRecords = function(key){
    document.getElementById("sideIcon-"+key).className = "glyphicon glyphicon-chevron-down mr5 openPanel";
    document.getElementById("showDiv-"+key).style.display='block';
  };
  $scope.objectKeys = function(obj){
  return Object.keys(obj);
}
$scope.groupfilter=function(term){
	var search=$scope.customi2html(term);
	var matchlist = $scope.getMatchLists(search);
    return  matchlist.partial;
};
$scope.groupfiltercount=function(term){
	var search=$scope.customi2html(term);
	var matchlist = $scope.getMatchLists(search);
    var sum=0;
    angular.forEach(matchlist.partial,function(item){
			sum+=item.length;
		});
      return  sum;
};
$scope.wholeWordFilter=function(term){
	var search=$scope.customi2html(term);
	var matchlist = $scope.getMatchLists(search);
    return  matchlist.whole;
}
$scope.wholeWordFilterCount=function(term){
	var search=$scope.customi2html(term);
	var matchlist = $scope.getMatchLists(search);
	var sum=0;
    angular.forEach(matchlist.whole,function(item){
			sum+=item.length;
		});
      return  sum;
}
})


/*
This directive allows us to pass a function in on an enter key to do what we want.
 */
.directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which === 13) {
        scope.$apply(function () {
            scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
})


.filter('offset', function() {
  return function(input, start) {
    if (!input || !input.length) return;
    start = +start; //parse to int
    return input.slice(start);
  };
})

.controller("PaginationCtrl", function($scope) {
  $scope.itemsPerPage = 10;
  $scope.currentPage = 0;
  $scope.items = [];
  $scope.totalRows=5334; // ????

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
    if ($scope.currentPage > 0) $scope.currentPage--;
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

});
