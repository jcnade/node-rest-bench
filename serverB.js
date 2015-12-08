
var express = require('express');
var app = express();

var cpt = 0;
app.get('/', function (req, res) {
  console.log(cpt++)
  res.send('Hello World!');
});

var server = app.listen(4000, function () {
// console.log(process.pid)
});
