(function() {
  var AHRSApp = angular.module('AHRSApp', ['ngAnimate', 'angularMoment', 'btford.socket-io']);

  AHRSApp.run(function(amMoment) {
    amMoment.changeLanguage('zh-tw');
  });

  AHRSApp.factory('socket', function (socketFactory) {
    return socketFactory();
  });

  AHRSApp.controller('AHRSCtrl', function ($scope, $http, socket) {
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

      cube.rotation.y  = -1 * ahrs_data.pitch / 180 * Math.PI ;
      cube.rotation.x  =  1 * ahrs_data.yaw   / 180 * Math.PI;
      cube.rotation.z  = -1 * ahrs_data.roll  / 180 * Math.PI;
    });
  });
})();
