(function(angular) {
  "use strict";

  var app = angular.module('myApp.home', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute','once']);

    var badPaintSquares = new Set([0,1,2,3,4,5,6]); 

  app.controller('HomeCtrl', ['$scope', 'fbutil', 'user', '$firebaseObject', 'FBURL', '$window',function ($scope, fbutil, user, $firebaseObject, FBURL, $window) {
    $scope.user = user;
    $scope.FBURL = FBURL;
    $scope.bgWidth = $window.innerWidth;
    $scope.bgHeight = ((1820*$scope.bgWidth) / 1520); // dimensions of crumbleafter2.jpg
    $scope.fgWidth = Math.round($scope.bgWidth/80); //80
    $scope.fgHeight = Math.round($scope.bgHeight/100); //100
    var constructCoordlist = function() {
	var coordList = []
	var id = 0;
	for (var i=0;i<$scope.bgHeight / $scope.fgHeight;i++) {
	    for (var j=0;j<$scope.bgWidth / $scope.fgWidth;j++) {
		var entry = {top:i*$scope.fgHeight+'px',left:j*$scope.fgWidth+'px',id:id};
		if (!badPaintSquares.has(id)) {		   
		    coordList.push(entry);
		}
		id += 1;

	    }
	}
	return coordList;
    }

    $scope.coordList = constructCoordlist();//[{top:'10px',left:'10px',id:0},{top:'10px',left:'50px',id:1}];
    console.log("coordlist length is " + $scope.coordList.length);
    _.each($scope.coordList, function(coordObj) { 
      var syncedRectColor = $firebaseObject(fbutil.ref('paintsquares/'+coordObj.id.toString()));
      syncedRectColor.$loaded().then(function() {
        if (!syncedRectColor.color) { // init fb storage on first run
	  syncedRectColor.top=coordObj.top;
          syncedRectColor.left=coordObj.left;
          syncedRectColor.color='';
	  syncedRectColor.$save();
        }

	// MAIN BINDTO per square for individual 3way binding
        syncedRectColor.$bindTo($scope,"colorHash_"+coordObj.id.toString())
      });

    });  

    $scope.clickAction2 = function(event) {
	var objId = event.srcElement.id;
	$scope.clickAction(objId);
    }

    $scope.clickAction = function(objId) {
      var obj = getSquare(objId)
      if (!obj) {
	  return // maybe display something briefly?
      }
      if (obj.color == "") {
	  obj.color = "red";
      }
      else {
	  obj.color = "";
      }
    }

    $scope.getColor = function(objId) {
	var obj = getSquare(objId)
	if (obj) { // check first for during init phase
	    return obj.color;
	}
    }
    var getSquare = function(objId) {
	return $scope['colorHash_'+objId.toString()];
	//return $scope[objId]
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

