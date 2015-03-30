angular.module("root",[])
.controller("index",["$scope",function($scope){
$scope.isUser;
$scope.isPassword;
$scope.isValidate=false;
$scope.getUser=function(){
  if($scope.isUser=="chad" && $scope.isPassword=="vanilla123" ){
  $scope.isValidate=false;
  localStorage.setItem("user",$scope.isUser);
  window.location.href="after-signin.html";
  } 
  else{
  $scope.isValidate=true;
  } 
};
}]);