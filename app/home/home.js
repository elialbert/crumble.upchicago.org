(function(angular) {
  "use strict";

  var app = angular.module('myApp.home', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute']);

  app.controller('HomeCtrl', ['$scope', 'fbutil', 'user', '$firebaseObject', 'FBURL', function ($scope, fbutil, user, $firebaseObject, FBURL) {
    $scope.syncedValue = $firebaseObject(fbutil.ref('syncedValue'));
    $scope.user = user;
    $scope.FBURL = FBURL;
    //$scope.rectColor = 'white';  
    $scope.syncedRectColor = $firebaseObject(fbutil.ref('testRecColor'));
    $scope.previous = 'black';  

      
    $scope.syncedRectColor.$loaded().then(function() {
      $scope.rectColor = $scope.syncedRectColor.$value;	
      if (!$scope.syncedRectColor.$value) {
        $scope.syncedRectColor.$value = 'black';
        $scope.syncedRectColor.$save();
      }

      console.log($scope.syncedRectColor.$value);
      $scope.syncedRectColor.$bindTo($scope,'rectColor').then(function() {
	$scope.previous = $scope.rectColor.$value;
      });
    });

    $scope.hoverEnterAction = function() {
	$scope.rectColor.$value = 'yellow';
    };
    $scope.hoverLeaveAction = function() {
	$scope.rectColor.$value = $scope.previous;
    };

    $scope.clickAction = function() {
	if ($scope.previous == "red") {
	    $scope.rectColor.$value = "black";
	}
	else {
	    $scope.rectColor.$value = "red";
	}
        $scope.previous = $scope.rectColor.$value;
    }

  }]);

  app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/home', {
      templateUrl: 'home/home.html',
      controller: 'HomeCtrl',
      resolve: {
        // forces the page to wait for this promise to resolve before controller is loaded
        // the controller can then inject `user` as a dependency. This could also be done
        // in the controller, but this makes things cleaner (controller doesn't need to worry
        // about auth status or timing of accessing data or displaying elements)
        user: ['Auth', function (Auth) {
          return Auth.$waitForAuth();
        }]
      }
    });
  }]);

})(angular);

