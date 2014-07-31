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
	})
})();