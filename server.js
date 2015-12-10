var express = require('express');
var fs = require('fs');

process.on('uncaughtException', function (err) {
  console.error(err.message);
});

var Promise = require('es6-promise').Promise;
var SmartPlug = require('./MockSmartPlug');
var SmartPlugManager = require('./SmartPlugManager');

var config = JSON.parse(fs.readFileSync('./lightsConfig.json'));
var manager = new SmartPlugManager();

if (config.toggleUrl) {
  var cycler = require('./cycler');
  cycler.on('change', function () {
    console.log('CYCLING LIGHTS');
    manager.cycle();
  });
  cycler.start(config.toggleUrl, config.toggleCheckUrl || 15000);
}

config.plugs.forEach(function (plugConfig) {
  var ipAddress = plugConfig.ipAddress;
  var name = plugConfig.name;
  manager.add(name, SmartPlug.getSmartPlug(ipAddress));
});

var app = express();
app.get('/', function (req, res) {
  // get the state of all plugs
  var keys = manager.keys();
  Promise.all(keys.map(function (key) {
    return manager.get(key).getState();
  })).then(function (states) {
    res.send("<html>" +
      "<head><style type='text/css'>" +
      "body{font-size:3em} ul{list-style-type:none}" +
      "</style>" +
      "<body>" +
      "<a href='/on'>All ON</a> | <a href='/off'>All OFF</a>" +
      "<ul>" +
        states.map(function (state, idx) {
          return "<li><a href='/toggle/" + keys[idx] + "'>" + keys[idx] + "</a>: " + state + "</li>";
        }).join('') +
      "</ul></body></html>");
  });
});

app.get('/off', function (req, res) {
  // turn all off
  Promise.all(manager.map(function (plug) {
    return plug.off();
  })).then(function () {
    res.redirect('/');
  });
});

app.get('/on', function (req, res) {
  // turn all off
  Promise.all(manager.map(function (plug) {
    return plug.on();
  })).then(function () {
    res.redirect('/');
  });
});

app.get('/:action/:name', function (req, res) {
  switch(req.params.action) {
    case "on":
    case "off":
    case "toggle":
      var plug = manager.get(req.params.name);
      if (!plug) {
        res.send('Unknown plug');
      } else {
        plug[req.params.action]().then(function () {
          res.redirect('/');
        }, function (err) {
          res.send(err.message);
        });
      }
      break;

    default:
      res.send('Unknown action');
  }
});

app.listen(8080);
console.log('server is listening');
