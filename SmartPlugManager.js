var Promise = require('es6-promise').Promise;

var SmartPlugManager = function() {
  this._plugs = {};
};

SmartPlugManager.prototype.add = function (name, plug) {
  this._plugs[name] = plug;
};

SmartPlugManager.prototype.get = function (name) {
  return this._plugs[name];
};

SmartPlugManager.prototype.keys = function () {
  return Object.keys(this._plugs);
};

SmartPlugManager.prototype.forEach = function (fn) {
  var self = this;
  var keys = this.keys();
  keys.forEach(function (key, idx) {
    fn(self._plugs[key], key);
  });
};

SmartPlugManager.prototype.map = function (fn) {
  var self = this;
  var keys = this.keys();
  return keys.map(function (key, idx) {
    return fn(self._plugs[key], key);
  });
};

SmartPlugManager.prototype.cycle = function () {
  var self = this;

  return Promise.all(this.map(function (plug) {
    console.log('GETTING PLUG STATES');
    return plug.getState();
  })).then(function (states) {
    var hasOn = false;
    states.forEach(function (state) {
      if (state === 'ON') {
        console.log('FOUND AN ENABLED PLUG');
        hasOn = true;
      }
    });

    console.log('TURNING PLUGS', hasOn ? 'off' : 'on')
    return Promise.all(self.map(function (plug) {
      plug[hasOn ? 'off' : 'on']();
    }));
  });
};

module.exports = SmartPlugManager;
