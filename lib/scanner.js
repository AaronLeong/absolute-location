var EventEmitter = require('events').EventEmitter;
var noble = require('noble');

function Beacon(peripheral) {
  this.peripheral    = peripheral;
  this.connected     = false;
  this.rssi_updating = false;
  this.x = -1;
  this.y = -1;

  this.get_accuracy = function() {
    var measuredPower = -68;

    if (this.peripheral.advertisement.localName == 'estimote') {
      var manufacturerData = this.peripheral.advertisement.manufacturerData;
      measuredPower = manufacturerData.readInt8(24);
    } else if (this.peripheral.advertisement.localName == 'tod-000780535F0D') {
      measuredPower = -68 * (-77/-50);
      // return -1;
    } else {
      return -1;
    }

    var rssi = this.peripheral.rssi;
    //console.log(rssi);

    return Math.pow(12.0, 1.5 * ((rssi / measuredPower) - 1));
  };
}

function dumpRssi(beacon) {
  if (beacon.connected) {
    if (!beacon.rssi_updating) {
      beacon.rssi_updating = true;
      beacon.peripheral.updateRssi(function(err, rssi) {
        console.log(beacon.peripheral.uuid + ' start updating RSSI...');
      });
    } else {
      Scanner.events.emit('dumpRssi', beacon);
    }
  }
}

var DiscoveredPeripherals = {
  list: {},

  update: function _update(peripheral) {
    var uuid = peripheral.uuid;
    var self = this;
    if (!this.list[uuid]) {
      self.list[uuid] = new Beacon(peripheral);

      peripheral.connect(function(err) {
        self.list[uuid].connected = true;
      });
    }
  },
  caculate_location: function _caculate_location() {
    var pos = {
      x: -1,
      y: -1
    }
    var trilateration = require('trilateration');
    var beacons = [];

    for (var uuid in this.list) {
      if (this.list[uuid].get_accuracy() != -1) {
        beacons.push(this.list[uuid]);
      }
    }

    if (beacons.length >= 3) {
/*
      // Adding three beacons
      trilateration.addBeacon(0, trilateration.vector(2, 4));
      trilateration.addBeacon(1, trilateration.vector(5.5, 13));
      trilateration.addBeacon(2, trilateration.vector(11.5, 2));
*/
      // Adding three beacons
      console.log(beacons[0].peripheral.uuid, beacons[0].x, beacons[0].y);
      console.log(beacons[1].peripheral.uuid, beacons[1].x, beacons[1].y);
      console.log(beacons[2].peripheral.uuid, beacons[2].x, beacons[2].y);

      trilateration.addBeacon(0, trilateration.vector(beacons[0].x, beacons[0].y));
      trilateration.addBeacon(1, trilateration.vector(beacons[1].x, beacons[1].y));
      trilateration.addBeacon(2, trilateration.vector(beacons[2].x, beacons[2].y));

      // Setting the beacons distances
      trilateration.setDistance(0, beacons[0].get_accuracy());
      trilateration.setDistance(1, beacons[1].get_accuracy());
      trilateration.setDistance(2, beacons[2].get_accuracy());

      pos = trilateration.calculatePosition();
      console.log(pos);
    }

    Scanner.events.emit('dumpLocation', pos);
  },
  update_axis: function _update_axis(beacon) {
    console.log(beacon.uuid + ' update axis');

    var x = parseFloat(beacon.x);
    var y = parseFloat(beacon.y);
    this.list[beacon.uuid].x = x;
    this.list[beacon.uuid].y = y;

    this.caculate_location();
  },
  monitor: function _monitor(interval) {
    var self = this;
    setInterval(function() {
      for (var uuid in self.list) {
        var beacon = self.list[uuid];
        dumpRssi(beacon);
      }
      self.caculate_location();
    }, interval);
  }
};

var Scanner = {
  init: function _init(interval) {
    noble.on('scanStart', function(state) {
      console.log('BLE START SCANNING\n');
    });

    noble.on('stateChange', function(state) {
      if (state === 'poweredOn') {
        noble.startScanning([], true); // any service UUID, allow duplicates
      } else {
        noble.stopScanning();
      }
    });

    noble.on('discover', function(peripheral) {
      DiscoveredPeripherals.update(peripheral);
    });

    DiscoveredPeripherals.monitor(interval);
  },

  peripherals: DiscoveredPeripherals,
  events: new EventEmitter()
};

module.exports = Scanner;
