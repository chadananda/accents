(function(){
	var mydirectives = angular.module('partialsController',[]);

	mydirectives.directive('tablelist',function(){
		return{
			restrict:'EA',//E as an Element or A as a Attribute
			templateUrl:"views/tableList.html"
		}
	});
	mydirectives.directive('nolist',function(){
		return{
			restrict:'EA',
			templateUrl:"views/noList.html"
		}
	});
	// mydirectives.factory('modalloader',["$scope",
	// 	function($scope)
	// 	{
	// 		$scope.openModal = function (size) {

	// 		    var modalInstance = $modal.open({
	// 		      templateUrl: 'views/loadingModal.html',
	// 		      controller: ModalInstanceCtrl,
	// 		      size: size,
	// 		      backdrop: 'static'
	// 		    });

	// 		    modalInstance.result.then(function (selectedItem) {
	// 		      $scope.selected = selectedItem;
	// 		    }, function () {
	// 		      $log.info('Modal dismissed at: ' + new Date());
	// 		    });
	// 		};
	// 		var ModalInstanceCtrl = function ($scope, $modalInstance, items) {

	// 		  $scope.items = items;
	// 		  $scope.selected = {
	// 		    item: $scope.items[0]
	// 		  };

	// 		  $scope.okModal = function () {
	// 		    $modalInstance.close($scope.selected.item);
	// 		  };

	// 		  $scope.cancelModal = function () {
	// 		    $modalInstance.dismiss('cancel');
	// 		  };
	// 		};
	// 	}]);
})();