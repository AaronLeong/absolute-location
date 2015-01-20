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

  $scope.update_beacon = function(beacon) {
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

  $scope.update_chart = function() {
    var brd = JXG.JSXGraph.initBoard('box',{boundingbox:[-50,300,300,-50], keepaspectratio:true, axis:true});
    var colors = [], beacons = [], p = [], l = [], c = [], j = [], k;
/*
    for (var i = 0; i < $scope.beacons.length; i++) {
      if ($scope.beacons[i].uuid == '92c4bad7cf8a4a6d98960a2369dffce4')
        beacons[0] = $scope.beacons[i];
      else if ($scope.beacons[i].uuid == '97ea4cd30b0d4e9e8acdf53688b2d93e')
        beacons[1] = $scope.beacons[i];
      else if ($scope.beacons[i].uuid == 'd66a10a82fc14d8fb97ae55befa7f5f8')
        beacons[2] = $scope.beacons[i];
      else if ($scope.beacons[i].uuid == '9773e24e1d9447c18faeba2d37f9bf23')
        beacons[3] = $scope.beacons[i];
    }
*/
    for (var i = 0; i < $scope.beacons.length; i++) {
      if ($scope.beacons[i].uuid == '7c669d777237')
        beacons[0] = $scope.beacons[i];
      else if ($scope.beacons[i].uuid == '7c669d776ee3')
        beacons[1] = $scope.beacons[i];
      else if ($scope.beacons[i].uuid == 'bc6a29b15c58')
        beacons[2] = $scope.beacons[i];
      else if ($scope.beacons[i].uuid == '7c669d777032')
        beacons[3] = $scope.beacons[i];
    }

    var near_beacon = beacons[0], near_index = 0;
    for (var i = 0; i < $scope.beacons.length; i++) {
      if (near_beacon.accuracy > beacons[i].accuracy) {
        near_beacon = beacons[i];
        near_index  = i;
      }
    }


    colors = ['purple', 'orange', 'blue', 'green'];
    p[0] = brd.create('point',[50,50],  {name:'A',strokeColor:'purple',fillColor:'yellow'});
    p[1] = brd.create('point',[250,50], {name:'B',strokeColor:'orange',fillColor:'orange'});
    p[2] = brd.create('point',[250,250],{name:'C',strokeColor:'blue',  fillColor:'blue'});
    p[3] = brd.create('point',[50,250], {name:'D',strokeColor:'green', fillColor:'green'});

    for (k=0;k<4;k++) {
      c[k] = brd.createElement('circle',[p[k], beacons[k].accuracy*100], {strokeColor:colors[k], strokeWidth:1});
    }

    for (k=0;k<3;k++)
      j[k] = brd.create('intersection',[c[near_index],c[(near_index+k+1)%4],1],{name:'',fillColor:'black'});

    var min_x = 0, min_y = 0, min_length = 0;
    for (k=0;k<3;k++) {
      if (!(j[k].X() == 0 && j[k].Y() == 0) && (50 < j[k].X() < 250 && 50 < j[k].Y() < 250)) {

        min_x += j[k].X();
        min_y += j[k].Y();
        min_length++;
      }
    }

    if (!(min_x == 0 && min_y == 0)) {
      brd.create('point',[min_x/min_length,min_y/min_length],  {name:'Position',strokeColor:'red',fillColor:'red'});
      $scope.last_point = {
        x: min_x/min_length,
        y: min_y/min_length
      };
    } else if ($scope.last_point) {
      brd.create('point',[$scope.last_point.x, $scope.last_point.y],  {name:'Position',strokeColor:'red',fillColor:'red'});
    }
  };

  socket.on('updateBeacons', function (beacons) {
    for (var i = 0; i < beacons.length; i++)
      $scope.update_beacon(beacons[i]);
    $scope.update_chart();
  });
});
