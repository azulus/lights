var http = require('http');
var Promise = require('es6-promise').Promise;

var SmartPlug = function(ipAddress) {
  this._ipAddress = ipAddress;
};

SmartPlug._call = function (method) {
  var ipAddress = this._ipAddress;
  return new Promise(function (resolve, reject) {
    http.get({
      hostname: ipAddress,
      port: 80,
      path: '/cgi-bin/relay.cgi?' + method,
      agent: false
    }, function (res) {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        reject(new Error(method + " to " + ipAddress + " failed with status code " + res.statusCode));
      }
    });
  });
};

SmartPlug.getState = function () {
  return this._call('state');
};

SmartPlug.on = function () {
  return this._call('on');
};

SmartPlug.off = function () {
  return this._call('off');
};

SmartPlug.toggle = function () {
  return this._call('toggle');
};

var smartPlugs = {};
module.exports.getSmartPlug = function (ipAddress) {
  if (!smartPlugs[ipAddress]) {
    smartPlugs[ipAddress] = new SmartPlug(ipAddress);
  }
  return smartPlugs[ipAddress];
};
