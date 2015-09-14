(function(angular) {
  "use strict";

  var app = angular.module('myApp.home', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute']);

  app.controller('HomeCtrl', ['$scope', 'fbutil', 'user', '$firebaseObject', 'FBURL', function ($scope, fbutil, user, $firebaseObject, FBURL) {
    $scope.syncedValue = $firebaseObject(fbutil.ref('syncedValue'));
    $scope.user = user;
    $scope.FBURL = FBURL;
      
    $scope.syncedRectColor = $firebaseObject(fbutil.ref('testRecColor'));
    $scope.syncedRectColor.$loaded().then(function() {
	if (!$scope.syncedRectColor.$value) {
	    $scope.syncedRectColor.$value = 'black';
	    $scope.syncedRectColor.$save();
	}
	$scope.colorStyle = {background: $scope.syncedRectColor.$value};
    });


    $scope.hoverEnterAction = function() {
	$scope.colorStyle = {background: "yellow"};
    };
    $scope.hoverLeaveAction = function() {
	$scope.colorStyle = {background: $scope.syncedRectColor.$value || 'black'};
    };

    $scope.clickAction = function() {
	if ($scope.syncedRectColor.$value == "red") {
	    $scope.syncedRectColor.$value = "black";
	}
	else {
	    $scope.syncedRectColor.$value = "red";
	}
	$scope.syncedRectColor.$save();
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

