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
    $scope.refreshAllDocList(function(){
		console.log("complete");
		$("#main-container").loader('hide');
		});
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
	crudFunctions.replicateDB($scope);
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
