

var express = require('express');
var hyperquest = require('hyperquest');
var app     = express();

var cpt = 0;
app.get('/', function (req, res) {
    console.log(cpt++)
    hyperquest('http://localhost:4000', {} ).pipe(res, {end: true});
});

var server = app.listen(3000, function () {
});
