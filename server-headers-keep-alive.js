

var express = require('express');
var request = require('request');
var app     = express();


var cpt = 0;
app.get('/', function (req, res) {
    console.log(cpt++)

    var options = {
        uri: 'http://localhost:4000',
        headers : {
            "Connection": "keep-alive"
        }
    }
    request(options).pipe(res, {end: true});
});

var server = app.listen(3000, function () {
});
