(function(angular) {
  "use strict";

  var app = angular.module('myApp.home', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute','once','colorpicker.module']);

  var badPaintSquares = new Set([]); // new Set([0,1,2,3,4,5,6]); 
  var manifesto = "                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      the crumble aesthetic: a manifesto...   everything falls apart. life's length varies all the time slash who knows next big thing. change only constant blah blah blacksheep. crumble deliberately. crumble in creation, in living. if life is the act of slowly dying, do it it in style, with gustooooo. is this useful yet? if not, cut it. chop chop gone. OVERWRITTENOVERWRITTENOVERWRITTEN. crumble means all inputs, all the time, firing hard. all contributions are welcome! and assimilated according to the arcane anti-bureaucratic organization process known as Stick It Somewhere... crustpunk brutalism died and went to hippie hell. we all fiddle slash masturbate together while rahm burnssssssssssssssss                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              ";

  app.controller('HomeCtrl', ['$scope', 'fbutil', 'user', '$firebaseObject', 'FBURL', '$window',function ($scope, fbutil, user, $firebaseObject, FBURL, $window) {
    $scope.user = user;
    $scope.FBURL = FBURL;
    $scope.mode = 'default';  
    $scope.paintColor="black";  
    $scope.bgWidth = $window.innerWidth;
    $scope.bgHeight = ((1820*$scope.bgWidth) / 1520); // dimensions of crumbleafter2.jpg
    $scope.fgWidth = Math.round($scope.bgWidth/80); //80
    $scope.fgHeight = Math.round($scope.bgHeight/100); //100
    var constructCoordlist = function() {
	var coordList = []
	var id = 0;
	for (var i=0;i<$scope.bgHeight / $scope.fgHeight;i++) {
	    for (var j=0;j<$scope.bgWidth / $scope.fgWidth;j++) {
		var entry = {top:i*$scope.fgHeight+'px',
			     left:j*$scope.fgWidth+'px',
			     id:id,
			     letter:manifesto[id%manifesto.length],
			    };
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
        syncedRectColor.$bindTo($scope,"colorHash_"+coordObj.id.toString()).then(function() {
            coordObj.scopeRef = $scope["colorHash_"+coordObj.id.toString()];
	});
      });

    });  

    $scope.clickAction2 = function(event) {
	var objId = event.srcElement.id;

	if ($scope.mode == 'paint') {
	    $scope.clickAction(objId);
	}
    }

    $scope.clickAction = function(objId) {
      var obj = getSquare(objId)
      if (!obj) {
	  return // maybe display something briefly?
      }
      if (obj.color == "") {
	  obj.color = $scope.paintColor;
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
	return $scope["colorHash_"+objId.toString()]; 
    }

    $scope.manifestoToggle = function() {
      if ($scope.mode != 'manifesto') {
	  $scope.mode = 'manifesto';
      }	
      else {
	  $scope.mode = 'default';
      }
    }
    $scope.togglePaintMode = function() {
      if ($scope.mode != "paint") {	
	  $scope.mode = "paint"
      }
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

