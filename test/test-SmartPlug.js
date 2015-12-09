var promise = require('es6-promise');
var SmartPlug = require('../SmartPlug');

var plug = SmartPlug.getSmartPlug('192.168.42.22');

plug.getState()
  .then(function (state) {
    console.log('PLUG IS ' + state, ' SETTING TO OFF');
    return plug.off();
  })
  .then(function () {
    return new Promise(function(resolve){
      console.log('WAITING 2 SECONDS');
      setTimeout(resolve, 2000);
    });
  })
  .then(function () {
    console.log('SETTING TO ON');
    return plug.on();
  })
  .then(function () {
    return plug.getState();
  })
  .then(function (state) {
    console.log('PLUG IS ' + state);
  });
