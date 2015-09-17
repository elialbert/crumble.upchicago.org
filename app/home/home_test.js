
describe('myApp.home', function() {
  beforeEach(module('myApp.home'));

  describe('HomeCtrl', function() {
    var homeCtrl, $scope;
    beforeEach(function() {
      module(function($provide) {
        // comes from routes.js in the resolve: {} attribute
        $provide.value('user', {uid: 'test123'});
      });
      inject(function($controller, _$window_) {
        $scope = {};
        $window = _$window_;
	$window.innerWidth = 500;
        homeCtrl = $controller('HomeCtrl', {$scope: $scope, $window: $window});
	createController = function(windowSize) {
	    $window.innerWidth = windowSize;
            return $controller('HomeCtrl', {$scope: $scope, $window: $window})
	};
      });
    });
      
    it('has default mode', function() {
      expect($scope.mode).toBe('default');
      expect($scope.mode).not.toBe('wrong');
    });

    it("should prepare a coordlist", function() {
        var controller = createController(600); 
	expect($scope.coordList.length).toBeGreaterThan(0);
    });

    it("should not prepare a coordlist for empty width", function() {
        var controller = createController(0); 
	expect($scope.coordList.length).toBe(0);
    });

    it("should prepare a coordlist with same number of paintsquares", function() {
        var controller = createController(600); 
	var l1 = $scope.coordList.length;
	var s1 = $scope.fgWidth;
        var controller = createController(400); 
	var l2 = $scope.coordList.length;
	var s2 = $scope.fgWidth;
	expect(l1).toBe(l2);
	expect(s1).not.toBe(s2);
    });

  });
});
