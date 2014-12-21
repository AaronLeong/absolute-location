(function() {
  var AHRSApp = angular.module('AHRSApp', ['ngAnimate', 'angularMoment', 'btford.socket-io', 'nvd3ChartDirectives']);

  AHRSApp.run(function(amMoment) {
    amMoment.changeLanguage('zh-tw');
  });

  AHRSApp.factory('socket', function (socketFactory) {
    return socketFactory();
  });

  AHRSApp.controller('AHRSCtrl', function ($scope, $http, socket) {
    $scope.tab = 'ahrs';

    // Acceleration Sets
    $scope.acceleration_index = 1;
    $scope.acceleration_x = [{
      "key": "acceleration_x",
      "values": []
    }];
    $scope.acceleration_y = [{
      "key": "acceleration_y",
      "values": []
    }];
    $scope.acceleration_z = [{
      "key": "acceleration_z",
      "values": []
    }];

    // AHRS Data
    $scope.ahrs_data = {
      pitch:  0,
      yaw:    0,
      roll:   0,
      accelX: 0,
      accelY: 0,
      accelZ: 0,
      gyroX:  0,
      gyroY:  0,
      gyroZ:  0
    };

    socket.on('updateAHRS', function (ahrs_data) {
      for (key in ahrs_data) {
        $scope.ahrs_data[key] = ahrs_data[key];
      }

      cube.rotation.z  = 1 * ahrs_data.pitch / 180 * Math.PI ;
      cube.rotation.y  = 1 * ahrs_data.yaw   / 180 * Math.PI;
      cube.rotation.x  = 1 * ahrs_data.roll  / 180 * Math.PI;

      $scope.acceleration_x.values.push([$scope.acceleration_index, -cube.accelX]);
      $scope.acceleration_y.values.push([$scope.acceleration_index, cube.accelY]);
      $scope.acceleration_z.values.push([$scope.acceleration_index, -cube.accelZ]);
      $scope.acceleration_index += 1;
    });
  });
})();
