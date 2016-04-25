var express = require('express')
  , bodyParser = require('body-parser')
  , request = require('request').defaults({json: true})
  , httpProxy = require('http-proxy');

// 1
var app = express();

var port = Number(process.env.PORT || 8080);

var server = app.listen(port, function () {
  var host = server.address().address;
  console.log('App listening at http://localhost:8080', host, port);
});

