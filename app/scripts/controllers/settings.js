'use strict';

/**
 * @ngdoc function
 * @name accentsApp.controller:SettingsCtrl
 * @description
 * # SettingsCtrl
 * Controller of the accentsApp
 */
angular.module('accentsApp')
  .controller('SettingsCtrl',
    function ($rootScope,$scope,$http,getRecords,$window,$filter,myConfig,Utils,$sce,docData,crudFunctions) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  var db = new PouchDB(myConfig.database, {auto_compaction: true});
  //var domainRemoteDb = myConfig.remoteDbDomain;
  //var remoteDb = myConfig.database;
  $scope.settingsInit = function() {
    //db.query('my_list/by_type').then(function (res) {
    var remoteDbUrl = localStorage.gitItem('remoteDbUrl');
    if(remoteDbUrl) document.getElementById('remoteDbUrl').value = remoteDbUrl;
    //}).catch(function (err) { console.log('$scope.settingsInit(): ', err); });
  };

  //===========Calling Utility Functions============//
  $scope.i2html = function(text) {
    return $sce.trustAsHtml(Utils.ilm2HTML(text));
  };

  $scope.customi2html = function(text) {
   return Utils.renderGlyph2UTF(text);
  };

  //=========Pass document data to edit page=================//
  $scope.editdocPage = function(docid,rev) {
    var list=[{"id":docid},{"rev":rev}];
    docData.setFormData(list);
    //window.location.href="http://localhost:9000/#/getdata";
    //$location.path('getdata');
  };

  //===========Replicate local db to remote db entered===============//
  $scope.replicateToRemote=function(){
  /*
  // what query is this? what are we expecting to get?
  db.query('my_list/by_type').then(function(res) {
    // got the query results
    var response = false;
    var result = res.total_rows;
    if(result>0) response = res.rows[0];
    var remoteDbid = response.id;
    var fullResponse = response.key;
    var termDb = {
      _id:   fullResponse._id,
      _rev:  fullResponse._rev,
      dbUrl: remoteUrl,
      type:  fullResponse.type,
      username:fullResponse.username
    };


    // save it
    db.put(termDb, fullResponse._id, fullResponse._rev).then(function (response) {
        // success!
      //console.log(response);
    }).catch(function (err) {
      // some error (maybe a 409, because it already exists?)
    });
   */

    // this works but needs replaced with cookie-based authentication
    // so that we are not sending password out over the request

    var remoteDbUrl = document.getElementById("remoteDbUrl").value
     localStorage.setItem('remoteDbUrl', remoteDbUrl);
    var protocol = 'http://'; // default
    var username = localStorage['username'];
    var userpass = localStorage['userpass'];
    if (!remoteDbUrl || !username || !userpass) return;
    // if remoteDBUrl has a protocol then cut it off
    if (remoteDbUrl.indexOf('://')>-1) {
      protocol = remoteDbUrl.substr(0, remoteDbUrl.indexof('://')+3);
      remoteDbUrl = remoteDbUrl.substr(remoteDbUrl.indexof('://')+3);
    }
    var remote = protocol + username +':'+ userpass +'@'+ remoteDbUrl;

    // pull down all changes
    console.log ('Replicating from remote');
    db.replicate.from(remote)
      .on('change', function (info) { console.log("Sync progress: ", info);  })
      .on('complete', function (info) { console.log("Sync complete: ", info); })
      .on('denied', function (info) { console.log("Sync denied: ", info); })
      .on('error', function (err) { console.log("Sync failed: ", err);  })
      .then(function(){
        // clean up and compact
        console.log ('Cleaning up and compressing all word families...');
        crudFunctions.cleanAllWordFamilies($scope);
        // push up all changes
        console.log ('Replicating to remote');
        db.replicate.to(remote)
          .on('change', function (info) { console.log("Sync progress: ", info); })
          .on('complete', function (info) { console.log("Sync complete: ", info); })
          .on('denied', function (info) { console.log("Sync denied: ", info); })
          .on('error', function (err) { console.log("Sync failed: ", err); });
      });
  /*
  }).catch(function (err) {
    // some error
    console.log('$scope.replicateToRemote(): ', err);
  });
*/

  };

  //==================For slide toggle of help divs====================//
  $scope.slideShow=function(calledId)  {
    $( "#"+calledId ).slideToggle("3000");
  };

  //=======================cleanup and compress two step function=================//
  $scope.cleanupAndCompress=function(){
    /*
    //=======step 1 set verified to true for all docs having original field=======//
    angular.forEach($scope.idDocs, function(termObj) {
       if(termObj.original && termObj.original!="" && !termObj.verified) {
         // no need to purge non-allowed fields at this point, it will be done during crud update
         termObj.verified = true;
         $scope.termCRUD('update', termObj);
       }
     });
     */
     //======step 2 call cleanAllwordfamilies=======//
     crudFunctions.cleanAllWordFamilies($scope);
  };


 });
