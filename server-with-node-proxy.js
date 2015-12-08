
var express = require('express');
var request = require('request');
var app     = express();
var proxy = require('express-http-proxy');

var cpt = 0;
// New hostname+path as specified by question:
var apiProxy = proxy('http://localhost:4000/', {
    forwardPath: function (req, res) {
        console.log(cpt++);
        return require('url').parse(req.url).path;
    }
});

var express = require('express');
var request = require('request');
var app     = express();


app.use("/*", apiProxy);

var server = app.listen(3000, function () {
});
