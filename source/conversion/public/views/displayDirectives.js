(function(){
	var mydirectives = angular.module('partialsController',[]);

	mydirectives.directive('tableList',function(){
		return{
			restrict:'EA',//E as an Element or A as a Attribute
			templateUrl:"views/tableList.html"
		}
	});
	mydirectives.directive('noList',function(){
		return{
			restrict:'EA',
			templateUrl:"views/noList.html"
		}
	})
})();