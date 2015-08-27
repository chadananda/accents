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
	//All Variables Declaration
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
	var db = new PouchDB(myConfig.database, {auto_compaction: true});
	$scope.data = { progress : 0 };
	$scope.varnew=0;
	//===Initialization function for settings page===//
	$scope.settingsInit = function() {
		var remoteDbUrl = localStorage.getItem('remoteDbUrl');
		if(remoteDbUrl) $scope.remoteDbUrl = remoteDbUrl;
	};
	//===Function to call edit remotedb modal popup===//  
	$scope.changeDb=function(){
		$scope.open('settingsContent.html');
	}
	//===Replicate local db to remote db entered===//
	$scope.replicateToRemote=function(){
	  $(".panel-box").css('display','none');
	  crudFunctions.replicateDB($scope);
	  $("#progressbar").css('display','block');
	};
	//===For slide toggle of help divs===//
	$scope.slideShow=function(calledId)  {
		$( "#"+calledId ).slideToggle("3000");
	};
	//===cleanup and compress two step function===//
	$scope.cleanupAndCompress=function(){
		crudFunctions.cleanAllWordFamilies($scope);
	};
 });
