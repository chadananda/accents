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
  //===========init function for settings page======//
  $scope.settingsInit = function() {
    var remoteDbUrl = localStorage.getItem('remoteDbUrl');
    if(remoteDbUrl) $scope.remoteDbUrl = remoteDbUrl;
  };
  //===========Calling Utility Functions============//
  $scope.i2html = function(text) {
    return $sce.trustAsHtml(Utils.ilm2HTML(text));
  };

  $scope.customi2html = function(text) {
   return Utils.renderGlyph2UTF(text);
  };
  $scope.changeDb=function(){
	  console.log('test');
	  $scope.open('settingsContent.html');
  }

  //===========Replicate local db to remote db entered===============//
  $scope.replicateToRemote=function(){

    // this works but needs replaced with cookie-based authentication
    // so that we are not sending password out over the request

    var remoteDbUrl = document.getElementById("remoteDbUrl").value
     localStorage.setItem('remoteDbUrl', remoteDbUrl);
    var protocol = 'http://'; // default
    var username = localStorage['username'];
    var userpass = localStorage['userpass'];
    if (!remoteDbUrl || !username || !userpass) return;
    // if remoteDBUrl has a protocol then cut it off
    //~ if (remoteDbUrl.indexOf('://')>-1) {
      //~ protocol = remoteDbUrl.substr(0, remoteDbUrl.indexof('://')+3);
      //~ remoteDbUrl = remoteDbUrl.substr(remoteDbUrl.indexof('://')+3);
    //~ }
  //  var remote = protocol + username +':'+ userpass +'@'+ remoteDbUrl;
  var remote = remoteDbUrl;
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
      //  crudFunctions.cleanAllWordFamilies($scope);
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
