(function(){
	
	var accentReviewApp = angular.module('mainAppController',["ui.bootstrap","myDataServices","partialsController"]);

	accentReviewApp.controller('mainPageController',["$scope","dataStorage","pouchWrapper","$modal","$log",
		function($scope,dataStorage,pouchWrapper,$modal,$log){
			$scope.myData = dataStorage.getTempData();
			$scope.checkedMemoryItems = [];
			$scope.checkedMemoryItemsIndex = [];
			console.log($scope.myData);

			$scope.$watch(function(){
				return dataStorage.getTempData();
			},function(newval,oldval){
				if(newval===oldval)
				{
					return;
				}
				$scope.myData = dataStorage.getTempData();
			});

			$scope.open = function (size) {

				$scope.modalInstance = $modal.open({
					templateUrl: 'views/loadingModal.html',
					size: size,
					backdrop:'static',
					scope: $scope
				});
			};
			$scope.close = function(){
				$scope.modalInstance.dismiss('cancel');
			}
			$scope.loadingmsg = "Loading temp data";
			$scope.open("sm");
			pouchWrapper.pullAllDocs().then(function(res){
				console.log(this.reviewdata);
				console.log(res);
				dataStorage.pushTempData(res.rows);
				$scope.close();
			},function(err){
				console.log(err);
				$scope.close();
			});

			$scope.checkedItem = function(id,event){
			
				if((event.target).checked)
				{
					if($scope.checkedMemoryItems.indexOf(id)===-1)
					{
						//add to list of checked memory indexes
						$scope.checkedMemoryItems.push(id);//event.target.value
						$scope.checkedMemoryItems.sort();
						$scope.checkedMemoryItemsIndex.push(event.target.value);
						$scope.checkedMemoryItemsIndex.sort();
					}
				}else{
					$scope.checkedMemoryItems.splice($scope.checkedMemoryItems.indexOf(id),1);
					$scope.checkedMemoryItemsIndex.splice($scope.checkedMemoryItemsIndex.indexOf(event.target.value),1);
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
				        	//var id = $scope.myData[x]["_id"];
				        	var id = $scope.checkedMemoryItems[x];
				        	pouchWrapper.removeFromTemp(id);
				        }
				        for(var x=0;x<$scope.checkedMemoryItems.length;x++)
				        {
				        	//remove from list
				        	// var myIndex = $scope.checkedMemoryItems[x];
				        	// delete $scope.myData[myIndex];
				        	for(var y=0;y<$scope.myData.length;y++)
				        	{
				        		if($scope.myData[y]!=undefined)
				        		{
				        			if($scope.checkedMemoryItems[x] == $scope.myData[y]["_id"])
					        		{
					        			delete $scope.myData[y];
					        			break;
					        		}
				        		}
				        	}
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
						$scope.open("sm");
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
				$scope.loadingmsg = "Finished Saving record ("+mycounter+"/"+$scope.myData.length+")";
				if(mycounter==$scope.myData.length || mycounter>$scope.myData.length)
				{
					alert("Data Transfer Done");
					$scope.close();
					//destroy the db
			        pouchWrapper.destroyTemp().then(function(res){
			        	console.log("destroy complete");
			        	console.log(res);
			        },function(err){
			        	console.log("destroy Error");
			        	console.log(err);
			        });
			        dataStorage.emptyTempData();
			        $scope.myData=[];
			        $scope.loadingmsg = "No more data to load since temp DB is already dropped";
				}
			}
	}]);

})();