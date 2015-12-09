var express = require('express');
var fs = require('fs');

process.on('uncaughtException', function (err) {
  console.error(err.message);
});

var Promise = require('es6-promise').Promise;
var SmartPlug = require('./SmartPlug');

var config = JSON.parse(fs.readFileSync('./lightsConfig.json'));

var plugs = {};
config.plugs.forEach(function (plugConfig) {
  var ipAddress = plugConfig.ipAddress;
  var name = plugConfig.name;
  plugs[name] = {
    ref: SmartPlug.getSmartPlug(ipAddress),
    config: plugConfig
  };
});

var app = express();
app.get('/', function (req, res) {
  // get the state of all plugs
  var keys = Object.keys(plugs);
  Promise.all(keys.map(function (key) {
    return plugs[key].ref.getState();
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
  Promise.all(Object.keys(plugs).map(function (name) {
    return plugs[name].ref.off();
  })).then(function () {
    res.redirect('/');
  });
});

app.get('/on', function (req, res) {
  // turn all off
  Promise.all(Object.keys(plugs).map(function (name) {
    return plugs[name].ref.on();
  })).then(function () {
    res.redirect('/');
  });
});

app.get('/:action/:name', function (req, res) {
  switch(req.params.action) {
    case "on":
    case "off":
    case "toggle":
      var plug = plugs[req.params.name];
      if (!plug) {
        res.send('Unknown plug');
      } else {
        plug.ref[req.params.action]().then(function () {
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
