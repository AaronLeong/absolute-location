var locateApp = angular.module('locateApp', ['ngAnimate', 'angularMoment', 'btford.socket-io']);
locateApp.run(function(amMoment) {
  amMoment.changeLanguage('zh-tw');
});

locateApp.factory('socket', function (socketFactory) {
  return socketFactory();
});

locateApp.controller('locateCtrl', function ($scope, $http, socket) {
  $scope.status  = 'setting'; // start
  $scope.beacons = [];
  $scope.beacons_set = [
    {id: 0, uuid: '80c1be24a06e'},
    {id: 1, uuid: '80bc723e01e4'},
    {id: 2, uuid: '80c1be231c62'},
    {id: 3, uuid: '80c1be24e438'},
    {id: 4, uuid: '80bc72415b7f'},
    {id: 5, uuid: '80bc72405d11'},
    {id: 6, uuid: '80bc723edfd0'},
    {id: 7, uuid: '80c1be27dafc'},
    {id: 8, uuid: '80c1be26a3c9'},
    {id: 9, uuid: '80c1be243657'},
    {id: 10, uuid: '80c1be272218'},
    {id: 11, uuid: '80c1be26ef20'},
    {id: 12, uuid: '80c1be236ef3'},
    {id: 13, uuid: '80c1be246dcf'},
    {id: 14, uuid: '80c1be279a0e'},
    {id: 15, uuid: '80c1be2657ee'},
    {id: 16, uuid: '80c1be25192e'},
    {id: 17, uuid: '80c1be23c1e1'},
    {id: 18, uuid: '80c1be25d461'},
    {id: 19, uuid: '80c1be261898'},
    {id: 20, uuid: '80c1be23f3a4'}
  ]

  $scope.postion = null;

  $scope.set_page = function(status) {
    $scope.status = status;
  };

  $scope.update_beacon = function(beacon) {
    for (var i = 0; i < $scope.beacons.length; i++)
      if ($scope.beacons[i].uuid == beacon.uuid) {
        $scope.beacons[i].uuid = beacon.uuid;
        if( Math.abs(($scope.beacons[i].accuracy - beacon.accuracy)) < 0.2 )
        {
            $scope.beacons[i].accuracy = beacon.accuracy;
        }
        else
        {
            $scope.beacons[i].accuracy = (beacon.accuracy+$scope.beacons[i].accuracy)*0.5;
        }
        $scope.beacons[i].updated_at = beacon.updated_at;
        return;
      }
    if (beacon.accuracy != -1)
      $scope.beacons.push(beacon);
  };

  $scope.update_chart = function() {                    // x left   right  y left   right
    var brd = JXG.JSXGraph.initBoard('box',{boundingbox:[-50,400,800,-50], keepaspectratio:true, axis:true});
    var colors = [], beacons = [], p = [], l = [], c = [], j = [], cross = [], vector_near, vector_key,first_keypoint,k,dist,dist2,numberofbeacon;

    //-B-D-F-H-
    //--I-J-K--
    //-A-C-E-G-  for near before after

    colors = ['purple', 'orange', 'green', 'blue','purple', 'orange', 'green', 'blue', 'purple', 'orange', 'green','purple', 'orange', 'green', 'blue','purple', 'orange', 'green', 'blue','purple', 'orange'];

    // A B C D
    p[0] = brd.create('point',[50,50],   {name:'A',strokeColor:'purple',fillColor:'purple'});
    p[1] = brd.create('point',[50,250],  {name:'B',strokeColor:'orange',fillColor:'orange'});
    p[2] = brd.create('point',[250,250], {name:'C',strokeColor:'green', fillColor:'green'});
    p[3] = brd.create('point',[250,50],  {name:'D',strokeColor:'blue',  fillColor:'blue'});

    // E F G H
    p[4] = brd.create('point',[450,50],  {name:'E',strokeColor:'purple', fillColor:'purple'});
    p[5] = brd.create('point',[450,250], {name:'F',strokeColor:'orange', fillColor:'orange'});
    p[6] = brd.create('point',[650,250], {name:'G',strokeColor:'green', fillColor:'green'});
    p[7] = brd.create('point',[650,50],  {name:'H',strokeColor:'blue', fillColor:'blue'});

    // I J K
    p[8] = brd.create('point',[150,250],  {name:'I',strokeColor:'purple', fillColor:'purple'});
    p[9] = brd.create('point',[350,250], {name:'J',strokeColor:'orange', fillColor:'orange'});
    p[10] = brd.create('point',[550,250], {name:'K',strokeColor:'green', fillColor:'green'});

    p[11] = brd.create('point',[50,150],  {name:'L',strokeColor:'purple', fillColor:'purple'});
    p[12] = brd.create('point',[150,150], {name:'M',strokeColor:'orange', fillColor:'orange'});
    p[13] = brd.create('point',[250,150], {name:'N',strokeColor:'green', fillColor:'green'});
    p[14] = brd.create('point',[350,150],  {name:'O',strokeColor:'blue', fillColor:'blue'});
    p[15] = brd.create('point',[450,150],  {name:'P',strokeColor:'purple', fillColor:'purple'});
    p[16] = brd.create('point',[550,150], {name:'Q',strokeColor:'orange', fillColor:'orange'});
    p[17] = brd.create('point',[650,150], {name:'R',strokeColor:'green', fillColor:'green'});

    p[18] = brd.create('point',[150,50],  {name:'S',strokeColor:'blue', fillColor:'blue'});
    p[19] = brd.create('point',[350,50],  {name:'T',strokeColor:'purple', fillColor:'purple'});
    p[20] = brd.create('point',[550,50], {name:'U',strokeColor:'orange', fillColor:'orange'});
    //p[21] = brd.create('point',[650,250], {name:'V',strokeColor:'green', fillColor:'green'});

    for (var i = 0; i < $scope.beacons.length; i++) {
      for (var j = 0; j < $scope.beacons_set.length; j++) {
        if ($scope.beacons[i].uuid == $scope.beacons_set[j].uuid)
          beacons[j] = $scope.beacons[i];
      }
    }

    // 找出靠近的點
/*
    var near_beacon = beacons[0], near_index = 0;
    for (var i = 0; i < $scope.beacons.length; i++) {
      if (near_beacon.accuracy > beacons[i].accuracy) {
        near_beacon = beacons[i];
        near_index  = i;
      }
    }
*/

    numberofbeacon = 21;
    for (k=0;k<numberofbeacon;k++) {
      c[k] = brd.createElement('circle',[p[k], beacons[k].accuracy*100], {strokeColor:colors[k], strokeWidth:1});
    }

    for (var i = 0; i < beacons.length; i++) {
      beacons[i]['origin_index'] = i;
    }

    var sorted_beacons = beacons.sort(function(a, b){return a.accuracy - b.accuracy});
    near_beacon  = beacons[sorted_beacons[0].origin_index];

    near_index   = sorted_beacons[0].origin_index;
    after_index  = sorted_beacons[1].origin_index;
    before_index = sorted_beacons[2].origin_index;

    // B -> C => B + (dist(B)/ dist(B,C) )*(C-B)
    // dist(B) = rssi_B , dist(B,C) = rssi_B + rssi_C
    // Vector : first_keypoint = B + X* BC;

    // BC Vector_near
    //vector_near = brd.create('point',[p[after_index].X() - p[before_index].X(),p[after_index].Y() - p[before_index].Y()],  {name:'Vectornear',strokeColor:'orange',fillColor:'orange'});
    vector_near = {
                    x: p[after_index].X() - p[before_index].X(),
                    y: p[after_index].Y() - p[before_index].Y()
                  };

    // B -> C => B + (dist(B)/ dist(B,C) )*(C-B)
    first_keypoint = brd.create('point',[p[before_index].X() + (beacons[before_index].accuracy*100/(beacons[before_index].accuracy*100+beacons[after_index].accuracy*100) * vector_near.x)
                                       , p[before_index].Y() + (beacons[before_index].accuracy*100/(beacons[before_index].accuracy*100+beacons[after_index].accuracy*100) * vector_near.y)],  {name:'firstkeypoint',strokeColor:'orange',fillColor:'orange'});

    l[0] = brd.createElement('line',[p[(after_index)], p[before_index]], {strokeColor:'gray', strokeWidth:1});


    // first_keypoint & near_index Vector
    // vector_key = brd.create('point',[ first_keypoint.X() - p[near_index].X(), first_keypoint.Y() - p[near_index].Y()],  {name:'Vector',strokeColor:'green',fillColor:'green'});
    // Vector: form near_index to first_keypoint.
    vector_key = {
                   x: first_keypoint.X() - p[near_index].X(),
                   y: first_keypoint.Y() - p[near_index].Y()
                 };

    l[1] = brd.createElement('line',[p[(near_index)], first_keypoint], {strokeColor:'blue', strokeWidth:2});
    // key = near_index + (dist(near_index)/ dist(B,near_index) ) * (first_keypoint - near_index);
    // j[3] = brd.create('point',[p[near_index].X() + (near_beacon.accuracy*100/(beacons[before_index].accuracy*100+near_beacon.accuracy*100) * vector_key.x)
    //                          , p[near_index].Y() + (near_beacon.accuracy*100/(beacons[before_index].accuracy*100+near_beacon.accuracy*100) * vector_key.y)],  {name:'Position',strokeColor:'red',fillColor:'red'});


    //j[3] = brd.create('point',[p[near_index].X() + 0.5 * vector_key.x
    //                          ,p[near_index].Y() + 0.5 * vector_key.y],  {name:'Position',strokeColor:'red',fillColor:'red'});
    j[3] = brd.create('intersection',[c[near_index], l[1], 0], {name:'Position',strokeColor:'red',fillColor:'red'});
    c[11] = brd.createElement('circle',[j[3], 40], {strokeColor:'red', strokeWidth:1});


    if (j[3] && j[3].X() > 50 && j[3].Y() > 0) {
      $scope.last_index   = near_index;
      $scope.last_point = {
        x: j[3].X(),
        y: j[3].Y()
      };
    }

    else if ($scope.last_point) {
      brd.create('point',[$scope.last_point.x, $scope.last_point.y],  {name:'Position',strokeColor:'red',fillColor:'red'});
    }

    //8 point
    if ($scope.last_point) {
      // var x = (($scope.last_point.x*3)/700)-1.5,
      //     z = (($scope.last_point.y*3)/700)-1.5;

      var x = $scope.last_point.x,
          z = $scope.last_point.y;

      socket.emit('updatePosition', {x: x, y: 1, z: z, A: 0.7 });
    }

    // if ($scope.last_point) {
    //   var x = (($scope.last_point.x*4.6)/800)-2.3,
    //       z = (($scope.last_point.y*4.6)/800)-2.3;

    //   socket.emit('updatePosition', {x: x, y: 0, z: z, A: 0.7 });
    // }
  };

  socket.on('updateBeacons', function (beacons) {
    if ($scope.status == 'setting') { return; }

    for (var i = 0; i < beacons.length; i++)
      $scope.update_beacon(beacons[i]);
    $scope.update_chart();
  });

});
