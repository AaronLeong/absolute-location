/*
7c669d777237 A
7c669d776ee3 B
bc6a29b15c58 C
7c669d777032 D
*/

var locateApp = angular.module('locateApp', ['ngAnimate', 'angularMoment', 'btford.socket-io']);
locateApp.run(function(amMoment) {
  amMoment.changeLanguage('zh-tw');
});

locateApp.factory('socket', function (socketFactory) {
  return socketFactory();
});

locateApp.controller('locateCtrl', function ($scope, $http, socket) {
  $scope.beacons = [];
  $scope.postion = null;

  $scope.update_beacons = function(beacon) {
    for (var i = 0; i < $scope.beacons.length; i++)
      if ($scope.beacons[i].uuid == beacon.uuid) {
        $scope.beacons[i].uuid = beacon.uuid;
        $scope.beacons[i].accuracy = beacon.accuracy;
        $scope.beacons[i].updated_at = beacon.updated_at;
        return;
      }
    if (beacon.accuracy != -1)
      $scope.beacons.push(beacon);
  };

  $scope.update_axis_chart = function() {
    var board = JXG.JSXGraph.initBoard('box', {boundingbox: [-100, 3000, 3000, -200], axis:true});
    for (var i = 0; i < $scope.beacons.length; i++) {
      if ($scope.beacons[i].x != -1 && $scope.beacons[i].y != -1) {
        var p = board.create('point', [$scope.beacons[i].x*100, $scope.beacons[i].y*100], {color: 'blue'});
      }
    }
    var p = board.create('point', [$scope.position.x*100, $scope.position.y*100], {color: 'red'});
  };

  socket.on('updateBeacons', function (beacons) {
    for (var i = 0; i < beacons.length; i++)
      $scope.update_beacon(beacons[i]);
  });
});
