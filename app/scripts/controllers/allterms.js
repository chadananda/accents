'use strict';

/**
 * @ngdoc function
 * @name accentsApp.controller:alltermsCtrl
 * @description
 * # alltermsCtrl
 * Controller of the accentsApp
 */
angular.module('accentsApp')
  .controller('AlltermsCtrl',
    function ($rootScope,$scope,$http,getRecords,$window,$location,$filter,myConfig,Utils,$sce,docData,crudFunctions) {
	//All Variables Declaration
	$scope.docs = {};
	$scope.awesomeThings = [
	  'HTML5 Boilerplate',
	  'AngularJS',
	  'Karma'
	];
	var db = new PouchDB(myConfig.database, {cache: true, ajax: {cache:true}});
	$scope.totalRows=0;
	//===========Calling Utility Functions============//
	$scope.i2html = function(text)  {
		return $sce.trustAsHtml(Utils.ilm2HTML(text));
	}
	$scope.customi2html=function(text) {
		return Utils.renderGlyph2UTF(text);
	}
	//============On key up of the term textbox change the term=========//
	$( "#term" ).keyup(function() {
		var term = $('#term').val();
		if(term!="") {
		  var changedTerm=$scope.customi2html(term);
		  $("#term").val(changedTerm);
		  $("#heading-term").html(changedTerm);
		  sessionStorage.setItem('term', term);
		}
		else sessionStorage.setItem('term', '');
	});
	//=========Pass document data to edit page=================//
	$scope.editdocPage=function(docid,rev) {
		var list=[{"id": docid}, {"rev": rev}];
		docData.setFormData(list);
		$location.path("/getdata");
	};
  setTimeout(function() {
    $scope.$watch("search.doc.term", function(v) {
      var count = 0;
      $scope.docs = $rootScope.idDocs; // <<-- is .docs an array?
      $scope.searchterm=v;
      if(typeof(v)!="undefined"){
        $scope.partialitems = $filter('newfilter')($scope.docs,v);
        if($scope.partialitems.length != null) {
          count = $scope.partialitems.length;
          $scope.paginationFunc(count);
        }
        // was here
      }
      else {
        $scope.partialitems = $filter('newfilter')($scope.docs,v);
        count = $scope.partialitems.length;
        $scope.paginationFunc(count);
      }
    });
  },1000);

  $scope.checkValue=function(searchterm)  {
    angular.forEach($scope.users, function(value , key){
      angular.forEach(value, function(val , key){
        if(searchterm) {
          var indexval=searchterm.indexOf(key);
          if(indexval!=-1) {
            var totallength=key.length;
            searchterm=searchterm.replace(key,val);
            var elem = document.getElementById('term');
            if(typeof elem !== 'undefined' && elem !== null) {
              document.getElementById('term').value = searchterm;
            }
          }
        }
      });
    });
  };

 //===Function to delete document===//
  $scope.deletedoc = function(id, rev) {
     if(confirm('Are you SURE you want to delete this term?')) {
      var termObj = $scope.getTermObj(id);
      $scope.termCRUD('delete', termObj, function() {
        // clean & compact the word family
        crudFunctions.cleanWordFamily(termObj,$scope);
        // refresh global list and filtered matches
        $scope.refreshFilteredMatches(termObj);
      });
    }
  };
	//===PAGINATION FUNCTIONS START===//
	//===Function for display of page numbers===//	
	$scope.paginationFunc = function(count) {
		$scope.itemsPerPage = 20;
		$scope.currentPage = 0;
		$scope.items = [];
		$scope.totalRows=count;
		for (var i=0; i<$scope.totalRows; i++) {
		  $scope.items.push({ id: i, name: "name "+ i, description: "description " + i });
		}
	};
	$scope.range = function(total) {
		var rangeSize= (Math.floor(total/$scope.itemsPerPage))+1;
		if(rangeSize>5) rangeSize = 5;
		var ret = [];
		var start;
		start = $scope.currentPage;
		if (start > $scope.pageCount()-rangeSize) start = $scope.pageCount()-rangeSize+1;
		for (var i=start; i<start+rangeSize; i++) ret.push(i);
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
		if ($scope.currentPage < $scope.pageCount()) $scope.currentPage++;
	};
	$scope.nextPageDisabled = function() {
		return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
	};
	$scope.setPage = function(n) {
		$scope.currentPage = n;
	};
	//===PAGINATION FUNCTIONS END HERE===//
})


.filter('offset', function() {
  return function(input, start) {
    if (!input || !input.length) { return; }
    start = +start; //parse to int
    return input.slice(start);
  };
})

.filter('newfilter',['Utils',function(Utils){
  return function(items, search) {
    var filtered = [];
    if(search) {
      angular.forEach(items, function(item) {
        var string=item.term;
        if(string) {
          string= string.replace("_","");
          string=Utils.dotUndersRevert(string);
          search=search.toLowerCase();
          search= search.replace("_","");
          search=Utils.dotUndersRevert(search);
          if( ((string.toLowerCase().indexOf(search.toLowerCase())) !=-1)) filtered.push(item);
        }
      });
    }
    else {
      angular.forEach(items, function(item) {
        filtered.push(item);
      });
    }
    return filtered;
  };
}])


.filter("checkfilter",function() {
  return function(items, scope) {
    var filtered = [];
    var checked=document.getElementById("verifiedCheckbox");
    var audioChecked=document.getElementById("noaudioCheckbox");
    if(checked.checked) {
      angular.forEach(items, function(item) {
        if(!item.verified) filtered.push(item);
      });
    }
    else if(audioChecked.checked) {
      angular.forEach(items, function(item) {
        //~ var attachmentArr=scope.attachments[item._id];
        if(!item._attachments) filtered.push(item);
      });
    }
    else {
      angular.forEach(items, function(item) {
        filtered.push(item);
      });
    }
    return filtered;
  };
});






