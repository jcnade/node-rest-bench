
### Intro

Under Ubunto with node.js express and request, sseveral users noticed performance issue when piping a response from a service B to a client through server A.

This issue was spoted by severals people in the past:

* http://stackoverflow.com/questions/19844594/node-js-pipe-to-a-http-response-results-in-slow-response-time-on-ubuntu
* https://github.com/nodejs/node-v0.x-archive/issues/6481




### The Problem


Code of server B ():

    var express = require('express');
    var app = express();

    app.get('/', function (req, res) {
      res.send('Hello World!');
    });

    var server = app.listen(4000, function () {
    console.log(process.pid)
    });


Code of server A (proxy/pipe):

    var express = require('express');
    var request = require('request');
    var app     = express();

    app.get('/', function (req, res) {
        request('http://localhost:4000').pipe(res);
    });

    var server = app.listen(3000, function () {
    });

Bench on server B (hello world)

    ab -c 10 -n 1000 http://localhost:4000/
    Requests per second:    4041.61 [#/sec] (mean)


Bench on server A (proxing server B)

    ab -c 10 -n 1000 http://localhost:3000/
    Requests per second:    948.89 [#/sec] (mean)


### Testing different settings

with express-http-proxy:

     ab -c 10 -n 1000 http://localhost:3000/
     Requests per second:    1232.76 [#/sec] (mean)


with maxSockey to Infinity:

     ab -k -c 50 -n 10000 http://localhost:3000/
     Requests per second:    1126.82 [#/sec]





### Report Script

This script generate a performance report between two service doing rest calls.


prerequisite:
  
* node.js
* nvm (node virtual manager)
* git

Install:
    
     git clone git@github.com:jcnade/node-rest-bench.git
     cd node-rest-bench.git
     npm install


Running the bench:

     ./report.sh



