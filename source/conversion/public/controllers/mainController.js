(function(){
	
	var accentReviewApp = angular.module('mainAppController',["ui.bootstrap","myDataServices"]);

	accentReviewApp.controller('mainPageController',["$scope","dataStorage","pouchWrapper",
		function($scope,dataStorage,pouchWrapper){
			$scope.myData = dataStorage.getTempData();
			$scope.checkedMemoryItems = [];
			console.log($scope.myData);

			$scope.$watch(function(){
				return dataStorage.getTempData();
			},function(newval,oldval){
				if(newval===oldval)
				{
					return;
				}
				$scope.myData = dataStorage.getTempData();
			})
			pouchWrapper.pullAllDocs().then(function(res){
				console.log(this.reviewdata);
				console.log(res);
				dataStorage.pushTempData(res.rows);
			},function(err){
				console.log(err);
			});
			$scope.checkedItem = function(index,event){
			
				if((event.target).checked)
				{
					if($scope.checkedMemoryItems.indexOf(event.target.value)===-1)
					{
						//add to list of checked memory indexes
						$scope.checkedMemoryItems.push(event.target.value);
						$scope.checkedMemoryItems.sort();
					}
				}else{
					$scope.checkedMemoryItems.splice($scope.checkedMemoryItems.indexOf(event.target.value),1);
				}
				console.log($scope.checkedMemoryItems);
			};
			$scope.deleteItems = function(){
				if($scope.checkedMemoryItems.length>0)
				{
					if (confirm("Are you sure?") == true) {
				        //delete checked items
				        for(var x=0;x<$scope.checkedMemoryItems.length;x++)
				        {
				        	var id = $scope.myData[x]["_id"];
				        	pouchWrapper.removeFromTemp(id);
				        }
				        for(var x=0;x<$scope.checkedMemoryItems.length;x++)
				        {
				        	//remove from list
				        	var myIndex = $scope.checkedMemoryItems[x];
				        	delete $scope.myData[myIndex];
				        }
				        var newData = [];
				        $scope.myData.forEach(function(data){
				        	if(data!=undefined)
				        	{
				        		newData.push(data);
				        	}
				        });
				        angular.forEach($scope.myData,function(item){
				        	item.Selected=false;
				        });
				        $scope.checkedMemoryItems=[];
				        dataStorage.setTempData(newData);
				    } 
				}else{
					alert("You have not picked an item to delete");
				}
			};
			$scope.addToAccents = function(){
				if($scope.myData.length>0){
					if (confirm("Are you sure?") == true) {
						var counter=0;
						for(var x=0;x<$scope.myData.length;x++)
				        {
				        	pouchWrapper.addToAccents($scope.myData[x]).then(function(res){
				        		counter++;
				        		$scope.checkAddStatus(counter);
				        	},function(err){
				        		console.log(err);
				        		counter++;
				        		$scope.checkAddStatus(counter);
				        	});
				        }
					}
				}else{
					alert("You have no items left to push to the Accents Collection");
				}
			};
			$scope.checkAddStatus = function(mycounter){
				console.log("Finished Saving ("+mycounter+"/"+$scope.myData.length+")");
				if(mycounter==$scope.myData.length || mycounter>$scope.myData.length)
				{
					alert("Data Transfer Done");
					//destroy the db
			        pouchWrapper.destroyTemp();
			        dataStorage.emptyTempData();
				}
			}

	}]);

})();