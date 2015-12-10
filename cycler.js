var fetch = require('node-fetch');

var callbacks = [];

module.exports.on = function (evt, callback) {
  callbacks.push(callback);
};

module.exports.start = (function(){
  var lastVal;

  return function(url, delay) {
    var fetchAndCallback = function() {
      console.log('CHECKING', url, 'FOR CHANGES');
      fetch(url)
        .then(function (res) {
          return res.text();
        })
        .then(function (body) {
          if (lastVal && lastVal !== body) {
            console.log('VALUE CHANGED!');
            callbacks.forEach(function (callback) {
              callback();
            });
          }

          if (lastVal !== body) {
            console.log('SETTING CHECK VAL TO', body);
            lastVal = body;
          }
        });
    };

    setInterval(fetchAndCallback, delay);
    fetchAndCallback();
  };
})();
