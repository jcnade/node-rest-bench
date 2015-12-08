
var express = require('express');
var request = require('request');
var app     = express();

var http = require('http'),
    KeepAliveAgent = require('keep-alive-agent');

var agent = new KeepAliveAgent({

});

var cpt = 0;
app.get('/', function (req, res) {
    console.log(cpt++)

    var options = {
        uri: 'http://localhost:4000',
        agent: agent,
        headers : {
           // "Connection": "keep-alive"
        }
    }
    request(options).pipe(res, {end: true});
});

var server = app.listen(3000, function () {
});
