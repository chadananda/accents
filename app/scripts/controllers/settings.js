'use strict';

/**
 * @ngdoc function
 * @name accentsApp.controller:SettingsCtrl
 * @description
 * # SettingsCtrl
 * Controller of the accentsApp
 */
angular.module('accentsApp')
  .controller('SettingsCtrl', function ($rootScope,$scope,$http,getRecords,$window,$filter,myConfig,Utils,$sce,docData,crudFunctions) {
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

  //==================For slide toggle of help divs====================//
  $scope.slideShow=function(calledId)
  {
    $( "#"+calledId ).slideToggle( "3000" );
  }
  

  // compresses array of matching terms into one, returns termObj
  // this is not a whole word-family but just a sub-branch with exactly matching terms
  $scope.compressTerms = function(termsArray) {
    if (termsArray.length===1) return termsArray[0]; // no need to merge if there's only one
    var i, key, keys, term;
    var base = termsArray[0]; // first term we will merge everything into
    var allowedTerms = crudFunctions.termAllowedFields(); // list of allowed fields, we'll ignore all others
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
 
   

   //==========Change the verified field to 1 for all the records with original field value==========//
   $scope.changeVerify=function(){
     angular.forEach($scope.idDocs, function(termObj) {
       if(termObj.original && termObj.original!="")
       {
         var term = {};

         //term = {term:doc.term, ref:doc.ref, definition:doc.definition, original:doc.original, verified:true, wordFamily:doc.wordFamily};
         //console.log(term);
          var allowedTerms = crudFunctions.termAllowedFields();
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
     var wordFamilies = crudFunctions.getAllWordFamilies($scope);
    console.log('Cleaning up '+wordFamilies.length+' word families');
    wordFamilies.forEach(function(wordFamily){
      console.log('Cleaning up word family: '+wordFamily);
       crudFunctions.cleanWordFamily(termObj,$scope);
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
      var familyField=crudFunctions.genWordFamily(termObj);
       var term = {};
          var allowedTerms = crudFunctions.termAllowedFields();
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
      var term=crudFunctions.pruneUnallowedFields(termObj);
      console.log(term);
      $scope.termCRUD('update', term);
    });
    $scope.changeVerify();
  }
 });
