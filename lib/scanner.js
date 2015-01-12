var EventEmitter = require('events').EventEmitter;
var noble = require('noble');

function Beacon(peripheral) {
  this.peripheral    = peripheral;
  this.connected     = false;
  this.rssi_updating = false;
  this.x = -1;
  this.y = -1;
}

Beacon.prototype.get_accuracy = function() {
  var measuredPower = -68;

  if (isEstimote(this.peripheral)) {
    var manufacturerData = this.peripheral.advertisement.manufacturerData;
    measuredPower = manufacturerData.readInt8(24);

  } else if (this.peripheral.advertisement.localName == 'tod-000780535F0D') {
    measuredPower = -68 * (-77/-50);

    return -1;
  } else {
    return -1;
  }

  var rssi = this.peripheral.rssi;
  return Math.pow(12.0, 1.5 * ((rssi / measuredPower) - 1));
};

function isEstimote(peripheral) {
  return peripheral.advertisement.localName == 'estimote' && peripheral.uuid == '2d6a1b3a4886471d9d7477294814a174';
}

var DiscoveredPeripherals = {
  list: {},

  update: function _update(peripheral) {
    var uuid = peripheral.uuid;

    if (!this.list[uuid] && isEstimote(peripheral)) {
      var beacon = this.list[uuid] = new Beacon(peripheral);
      beacon.peripheral.updateRssi(function(err, rssi) {

        console.log(beacon.peripheral.uuid + ' start updating RSSI...');
      });
    }
  },
  monitor: function _monitor(interval) {
    var self = this;

    setInterval(function() {
      for (var uuid in self.list) {
        var beacon = self.list[uuid];

        console.log('uuid: ' + uuid + ', rssi: ' + beacon.peripheral.rssi + ', distance: ' + beacon.get_accuracy());
      }
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
