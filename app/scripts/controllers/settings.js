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
  var db = new PouchDB(myConfig.database, { cache: true,stub:true,ajax: {cache:true}});
  var domainRemoteDb=myConfig.remoteDbDomain;
  var remoteDb=myConfig.database;
  $scope.settingsInit=function(){
    db.query('my_list/by_type').then(function (res) {
      // got the query results
      var result=res.total_rows;
      if(result>0)
      var response=res.rows[0];
      else
      var response=false;
      document.getElementById('remoteDbUrl').value=response.key.dbUrl;

    }).catch(function (err) {
    // some error
    console.log(err);
  });
  };
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
 //===========Replicate local db to remote db entered===============//
 $scope.replicateToRemote=function(){
  var remoteUrl =document.getElementById("remoteDbUrl").value;
  db.query('my_list/by_type').then(function (res) {
      // got the query results
      var result=res.total_rows;
      if(result>0)
      var response=res.rows[0];
      else
      var response=false;
      var remoteDbid=response.id;
      var fullResponse=response.key;
      var termDb={
        _id:fullResponse._id,
        _rev:fullResponse._rev,
        dbUrl:remoteUrl,
        type:fullResponse.type,
        username:fullResponse.username
      };
      // save it
      db.put(termDb,fullResponse._id,fullResponse._rev).then(function (response) {
          // success!
        //  console.log(response);
      }).catch(function (err) {
        // some error (maybe a 409, because it already exists?)
      });
        //~ PouchDB.replicate(db,remoteUrl, function(err,resp){
        //~ if(err){
          //~ alert("Push failed!")
        //~ }
      //~ });
      db.replicate.to(remoteUrl,{retry: true}).on('complete', function () {
        // yay, we're done!
        console.log("replication complete");
      }).on('error', function (err) {
        // boo, something went wrong!
        console.log("replication has some error"+err);
      });

    }).catch(function (err) {
    // some error
    console.log(err);
  });

 };

  //==================For slide toggle of help divs====================//
  $scope.slideShow=function(calledId)
  {
    $( "#"+calledId ).slideToggle( "3000" );
  }
  //=======================cleanup and compress two step function=================//
  $scope.cleanupAndCompress=function(){
    //=======step 1 set verified to true for all docs having original field=======//
    angular.forEach($scope.idDocs, function(termObj) {
       if(termObj.original && termObj.original!="" && !termObj.verified) {
         // no need to purge non-allowed fields at this point, it will be done during crud update
         termObj.verified = true;
         $scope.termCRUD('update', termObj);
         /*
      var term = {};
      var allowedTerms = crudFunctions.termAllowedFields();
      for(var i=0;i<allowedTerms.length;i++){
        if(allowedTerms[i]=="verified") term[allowedTerms[i]]=true;
        else  term[allowedTerms[i]]=termObj[allowedTerms[i]];
      }
      $scope.termCRUD('update', term); */
       }
     });
     //======step 2 call cleanAllwordfamilies=======//
     crudFunctions.cleanAllWordFamilies($scope);
  }

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
