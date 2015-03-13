var EventEmitter = require('events').EventEmitter;
var noble = require('noble');

function isAllow(peripheral) {

/*
  var red_bear_matrix = [
    "92c4bad7cf8a4a6d98960a2369dffce4",
    "97ea4cd30b0d4e9e8acdf53688b2d93e",
    "d66a10a82fc14d8fb97ae55befa7f5f8",
    "9773e24e1d9447c18faeba2d37f9bf23"
  ];
*/
  var red_bear_matrix = [
    "7c669d777032",
    "7c669d776ee3",
    "bc6a29b15c58",
    "7c669d777237"
  ];
  return red_bear_matrix.indexOf(peripheral.uuid) != -1;
}

function Beacon(peripheral) {
  this.peripheral    = peripheral;
  this.connected     = false;
  this.rssi_updating = false;
  this.x = -1;
  this.y = -1;
}

Beacon.prototype.get_accuracy = function() {
  //var measuredPower = -72;
  var measuredPower = -60;
  var rssi = this.peripheral.rssi;
  return Math.pow(12.0, 1.5 * ((rssi / measuredPower) - 1));
};

var DiscoveredPeripherals = {
  list: {},

  update: function _update(peripheral) {
    var uuid = peripheral.uuid;



    if (!this.list[uuid] /*&& isAllow(peripheral)*/) {
      var beacon = this.list[uuid] = new Beacon(peripheral);
      peripheral.on('rssiUpdate', function(rssi) {
        console.log('uuid: ' + beacon.peripheral.uuid + ', name: ' + beacon.peripheral.advertisement.localName + ', rssi: ' + rssi);
      });

    }
  },

  monitor: function _monitor(interval) {
    var self = this;
/*
    setInterval(function() {
      var beacons = [];

      //console.log('------');
      for (var uuid in self.list) {
        var beacon = self.list[uuid];
        //console.log('uuid: ' + uuid + ', name: ' + beacon.peripheral.advertisement.localName + ', rssi: ' + beacon.peripheral.rssi + ', distance: ' + beacon.get_accuracy());

        beacons.push({
          uuid: uuid,
          rssi: beacon.peripheral.rssi,
          accuracy: beacon.get_accuracy(),
          updated_at: new Date()
        })
      }

      Scanner.events.emit('updateBeacons', beacons);
    }, interval);
*/
    setInterval(function() {
      console.log('tick');
    }, 1000);
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
