var Promise = require('es6-promise').Promise;

var delay = function (val, err, delay) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (err) {
        reject(err);
      } else {
        resolve(val);
      }
    }, delay);
  });
};

var MockSmartPlug = function(ipAddress) {
  this._state = "OFF";
};

MockSmartPlug.prototype.getState = function () {
  return delay(this._state, null, 500);
};

MockSmartPlug.prototype.on = function () {
  this._state = 'ON';
  return delay('OK', null, 500);
};

MockSmartPlug.prototype.off = function () {
  this._state = 'OFF';
  return delay('OK', null, 500);
};

MockSmartPlug.prototype.toggle = function () {
  this._state = this._state === 'OFF' ? 'ON' : 'OFF';
  return delay('OK', null, 500);
};

var smartPlugs = {};
module.exports.getSmartPlug = function (ipAddress) {
  if (!smartPlugs[ipAddress]) {
    smartPlugs[ipAddress] = new MockSmartPlug(ipAddress);
  }
  return smartPlugs[ipAddress];
};
