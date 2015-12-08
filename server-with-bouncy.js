
var express = require('express');
var request = require('request');
var app     = express();

var bouncy = require('bouncy');

var server = bouncy(function (req, res, bounce) {

    if (req.headers.host === 'localhost:3000') {
        bounce(4000);
    }
    else {
        res.statusCode = 404;
        res.end('no such host');
    }
});
server.listen(3000);

