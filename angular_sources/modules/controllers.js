var ctrl = angular.module('myApp.controllers', []);

ctrl.controller('MyCtrl', ['$scope', function($scope) {
  $scope.arr = [];

  $scope.todos = [];
  $scope.jObj = [];
  $scope.all = 'active';  
  $scope.isSecondElementVisible=false;
   $scope.isFirstElementVisible=true;
   $scope.waitContent=false;
   $scope.mainContentiner=true;
   
   
   
  $scope.al = function() {
        $scope.isSecondElementVisible=false;
         $scope.fil = '';        
        $scope.isFirstElementVisible=true;
        $scope.all = 'active';                
    };
     $scope.fl = function() {
        $scope.jObj=[];
        var result = foo($scope.arr);
        for(var i=0;i<result[0].length;i++)
        {
            var myTodo = {
            term:result[0][i],            
            count: result[1][i]
        }; 
         $scope.jObj.push(myTodo);
        }
        
        $scope.isSecondElementVisible=true;
        $scope.fil = 'active';        
        $scope.isFirstElementVisible=false;
        $scope.all = '';        
    };
       $scope.pouchdb = Pouch('idb://todos', function(err, db) {
        if (err) {
            console.log(err);
        }
        else {
            
            db.allDocs(function(err, response) {
                if (err) {
                    console.log(err);
                }
                else {
                    $scope.loadTodos(response.rows)
                    
                }
            });
        }
    });

    $scope.loadTodos = function(todos) {
        for (var i = 0; i < todos.length; i++) {
            var todo = todos[i];
            $scope.pouchdb.get(todo.id, function(err, doc) {
                if (err) {
                    console.log(err);
                }
                else {
                   
                    $scope.$apply(function() {
                        $scope.todos.push(doc);
                        $scope.arr.push(doc.term);
                        
                    });
                }
            });
        };
    }
    $scope.addTodo = function() {
        var newTodo = {
            _id: Math.uuid(),
            id:alphanumeric_unique(),
            term: $scope.todoTerm,
            type:"term",            
            ref:$scope.myRef,            
            done: false
        };
        $scope.todos.push(newTodo);
        $scope.todoTerm = '';
        $scope.myRef = '';        
        $scope.pouchdb.put(newTodo);
        $scope.arr.push(newTodo.term);
    };

    $scope.updateTodo = function(todo) {
        $scope.pouchdb.put(todo);
    };

    $scope.remaining = function() {
        var count = 0;
        angular.forEach($scope.todos, function(todo) {
            count += todo.done ? 0 : 1;
        });
        return count;
    };

    $scope.removeDone = function(todo) {
        todo.done="true";        
        var oldTodos = $scope.todos;
        $scope.todos = [];
        angular.forEach(oldTodos, function(todo) {
            if (!todo.done) {
                $scope.todos.push(todo);
            }
            else {
                $scope.removeTodo(todo);
            }
        });
    };

    $scope.removeTodo = function(todo) {
        $scope.pouchdb.get(todo._id, function(err, doc) {
            if (err) {
                console.log(err);
            }
            else {
                $scope.pouchdb.remove(doc, function(err, response) {
                    console.log(response);
                    remove(todo.term);
                });
            }
        });
    };
    
function foo(arr) {
    var a = [], b = [], prev;
    
    arr.sort();
    for ( var i = 0; i < arr.length; i++ ) {
        if ( arr[i] !== prev ) {
            a.push(arr[i]);
            b.push(1);
        } else {
            b[b.length-1]++;
        }
        prev = arr[i];
    }
    
    return [a, b];
}
function remove(what) {
    var found = $scope.arr.indexOf(what);
        $scope.arr.splice(found, 1);
}

  function alphanumeric_unique() {
    return Math.random().toString(36).split('').filter( function(value, index, self) { 
        return self.indexOf(value) === index;
    }).join('').substr(2,8);
}
function sync() {
  var syncDom = document.getElementById('sync-wrapper');
  syncDom.setAttribute('data-sync-state', 'syncing');
  var opts = {live: true};
  $scope.pouchdb.replicate.to(remoteCouch, opts, syncError);
  $scope.pouchdb.replicate.from(remoteCouch, opts, syncError);
  }
  function syncError() {
    syncDom.setAttribute('data-sync-state', 'error');
  }
}]);