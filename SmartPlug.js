var http = require('http');
var Promise = require('es6-promise').Promise;

var SmartPlug = function(ipAddress) {
  this._ipAddress = ipAddress;
};

SmartPlug.prototype._call = function (method) {
  var ipAddress = this._ipAddress;
  return new Promise(function (resolve, reject) {
    var options = {
        host: ipAddress,
        path: '/cgi-bin/relay.cgi?' + method
    }
    var request = http.request(options, function (res) {
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            resolve(data);
        });
    });
    request.on('error', function (e) {
        reject(e);
    });
    request.end();
  });
};

SmartPlug.prototype.getState = function () {
  return this._call('state');
};

SmartPlug.prototype.on = function () {
  return this._call('on');
};

SmartPlug.prototype.off = function () {
  return this._call('off');
};

SmartPlug.prototype.toggle = function () {
  return this._call('toggle');
};

var smartPlugs = {};
module.exports.getSmartPlug = function (ipAddress) {
  if (!smartPlugs[ipAddress]) {
    smartPlugs[ipAddress] = new SmartPlug(ipAddress);
  }
  return smartPlugs[ipAddress];
};
