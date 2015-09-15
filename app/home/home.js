(function(angular) {
  "use strict";

  var app = angular.module('myApp.home', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute']);

  app.controller('HomeCtrl', ['$scope', 'fbutil', 'user', '$firebaseObject', 'FBURL', function ($scope, fbutil, user, $firebaseObject, FBURL) {
    $scope.user = user;
    $scope.FBURL = FBURL;
    $scope.bgWidth = 1400;
    $scope.bgHeight = 900;
    $scope.fgWidth = Math.round($scope.bgWidth/20);
    $scope.fgHeight = Math.round($scope.bgHeight/10);
    var constructCoordlist = function() {
	var coordList = []
	var id = 0;
	for (var i=0;i<$scope.bgHeight / $scope.fgHeight;i++) {
	    for (var j=0;j<$scope.bgWidth / $scope.fgWidth;j++) {
		var entry = {top:i*$scope.fgHeight+'px',left:j*$scope.fgWidth+'px',id:id};
		id += 1;
		coordList.push(entry);
	    }
	}
	return coordList;
    }

    $scope.coordList = constructCoordlist();//[{top:'10px',left:'10px',id:0},{top:'10px',left:'50px',id:1}];
      console.dir($scope.coordList);
    var prevHash = {};
    
    _.each($scope.coordList, function(coordObj) { 
      var syncedRectColor = $firebaseObject(fbutil.ref('paintsquares/'+coordObj.id.toString()));
      prevHash[coordObj.id] = '';	 // init prevhash - used to return from yellow highlight
      
      syncedRectColor.$loaded().then(function() {
        if (!syncedRectColor.color) { // init fb storage on first run
	  syncedRectColor.top=coordObj.top;
          syncedRectColor.left=coordObj.left;
          syncedRectColor.color='';
	  syncedRectColor.$save();
        }
	// MAIN BINDTO per square for individual 3way binding
        syncedRectColor.$bindTo($scope,"colorHash_"+coordObj.id.toString()).then(function() {
	  prevHash[coordObj.id] = getSquare(coordObj.id).color; // reinit prevhash for preexisting
        });

      });

    });  


    $scope.hoverEnterAction = function(objId) {
      getSquare(objId).color = 'yellow'; // sets on screen and in fb due to 3way binding
    };
    $scope.hoverLeaveAction = function(objId) {
      getSquare(objId).color = prevHash[objId];
    };

    $scope.clickAction = function(objId) {
      var obj = getSquare(objId)
      if (prevHash[objId] == "red") {
        obj.color = "";
      }
      else {
        obj.color = "red";
      }
      prevHash[objId] = obj.color;
    }

    $scope.getColor = function(objId) {
	var obj = getSquare(objId)
	if (obj) { // check first for during init phase
	    return obj.color;
	}
    }

    var getSquare = function(objId) {
	return $scope['colorHash_'+objId.toString()];
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

