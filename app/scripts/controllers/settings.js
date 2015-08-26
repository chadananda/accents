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
    function ($rootScope,$scope,$http,getRecords,$window,$filter,myConfig,Utils,$sce,docData,crudFunctions,$modal) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  var db = new PouchDB(myConfig.database, {auto_compaction: true});
  $scope.data = { progress : 0 };
  $scope.varnew=0;
  //===========init function for settings page======//
  $scope.settingsInit = function() {
    var remoteDbUrl = localStorage.getItem('remoteDbUrl');
    if(remoteDbUrl) $scope.remoteDbUrl = remoteDbUrl;
  };
  
  $scope.changeDb=function(){
	 $scope.open('settingsContent.html');
  }

  //===========Replicate local db to remote db entered===============//
  $scope.replicateToRemote=function(){
	  $(".panel-box").css('display','none');
	  crudFunctions.replicateDB($scope);
	  $("#progressbar").css('display','block');
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
