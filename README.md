
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


with keep-alive :

     ab -k -c 50 -n 10000 http://localhost:3000/
     Requests per second:    1104.77 [#/sec] (mean)


with bouncy (pure stream):

     ab -k -c 50 -n 10000 http://localhost:3000/
     Requests per second:    7431.45 [#/sec] (mean)


#### Tuning sysctl.conf :

sysctl.conf:

    fs.file-max = 2097152
    vm.swappiness = 10
    vm.dirty_ratio = 60
    vm.dirty_background_ratio = 2
    net.ipv4.tcp_synack_retries = 2
    net.ipv4.ip_local_port_range = 2000 65535
    net.ipv4.tcp_rfc1337 = 1
    net.ipv4.tcp_fin_timeout = 15
    net.ipv4.tcp_keepalive_time = 300
    net.ipv4.tcp_keepalive_probes = 5
    net.ipv4.tcp_keepalive_intvl = 15
    net.core.rmem_default = 31457280
    net.core.rmem_max = 12582912
    net.core.wmem_default = 31457280
    net.core.wmem_max = 12582912
    net.core.somaxconn = 4096
    net.core.netdev_max_backlog = 65536
    net.core.optmem_max = 25165824
    net.ipv4.tcp_mem = 65536 131072 262144
    net.ipv4.udp_mem = 65536 131072 262144
    net.ipv4.tcp_rmem = 8192 87380 16777216
    net.ipv4.udp_rmem_min = 16384
    net.ipv4.tcp_wmem = 8192 65536 16777216
    net.ipv4.udp_wmem_min = 16384
    net.ipv4.tcp_max_tw_buckets = 1440000
    net.ipv4.tcp_tw_recycle = 1
    net.ipv4.tcp_tw_reuse = 1

Relaunching

    sudo syctl -p



with express-request simple config - with sysctl tunned:

     ab -c 10 -n 1000 http://localhost:3000/
     Requests per second:    1122.14 [#/sec] (mean)



with maxSockey to Infinity - with sysctl tunned:

     ab -k -c 50 -n 10000 http://localhost:3000/
     Requests per second:    1051.53 [#/sec] (mean)



with keep-alive - with sysctl tunned:

     ab -k -c 50 -n 10000 http://localhost:3000/
     Requests per second:    1082.32 [#/sec] (mean)



with bouncy (pure stream) - with sysctl tunned:

     ab -k -c 50 -n 10000 http://localhost:3000/
     Requests per second:    7618.94 [#/sec] (mean)


### With Passanger Load balancer


Passenger with 1 thread (and 8 CPU) - concurrency 10

    ab -k -c 10 -n 5000 http://localhost:3000/
    Requests per second:    800.02 [#/sec] (mean)


Passenger with 6 thread (and 8 CPU) - concurrency 10

    ab -k -c 10 -n 5000 http://localhost:3000/
    Requests per second:    1268.27 [#/sec] (mean)

Passenger with 6 thread (and 8 CPU) - concurrency 50

    ab -k -c 50-n 5000 http://localhost:3000/
    Requests per second:    1464.56 [#/sec] (mean)

Passenger with 6 thread (and 8 CPU)

    ab -k -c 50 -n 5000 http://localhost:3000/
    Requests per second:    1475.31 [#/sec] (mean)


### With node 4.2.3 LTS

Server A, simple express and request, 1 process, sysctl tunned

    ab -k -c 10 -n 5000 http://localhost:4000/
    Requests per second:    9420.63 [#/sec] (mean)

    ab -k -c 10 -n 5000 http://localhost:3000/
    Requests per second:    1857.09 [#/sec] (mean)


Server A,  with node proxy, 1 process, sysctl tunned

    ab -k -c 10 -n 5000 http://localhost:4000/
    Requests per second:    1642.88 [#/sec] (mean)

    ab -k -c 50 -n 5000 http://localhost:3000/
    Requests per second:    1745.92 [#/sec] (mean)


Server A,  with agent keep alive, 1 process, sysctl tunned

    ab -k -c 10 -n 5000 http://localhost:4000/
    Requests per second:    489.71 [#/sec] (mean)

    ab -k -c 50 -n 5000 http://localhost:3000/
    Requests per second:    2088.07 [#/sec] (mean)

    ab -k -c 100 -n 50000 http://localhost:3000/
    Requests per second:    2600.02 [#/sec] (mean)

    ab -k -c 300 -n 10000 http://localhost:3000/
    Requests per second:    2653.02 [#/sec] (mean)



Server A,  with agent keep alive, sysctl tunned

    ab -k -c 10 -n 10000 http://localhost:3000/
    Requests per second:    756.65 [#/sec] (mean)

    ab -k -c 50 -n 500000 http://localhost:4000/
    Requests per second:    1932.85 [#/sec] (mean)

    ab -k -c 100 -n 500000 http://localhost:4000/
    Requests per second:    2026.41 [#/sec] (mean)



Server A,  with hyperquest, sysctl tunned

    ab -k -c 1 -n 10000 http://localhost:3000/
    Requests per second:    850.65 [#/sec] (mean)

    ab -k -c 10 -n 10000 http://localhost:4000/
    Requests per second:    1433.04 [#/sec] (mean)

    ab -k -c 20 -n 10000 http://localhost:3000/
    Requests per second:    1700.63 [#/sec] (mean)

    ab -k -c 50 -n 10000 http://localhost:4000/
    Requests per second:    1610.08 [#/sec] (mean)

    ab -k -c 100 -n 10000 http://localhost:4000/
    Requests per second:    1598.39 [#/sec] (mean)

    ab -k -c 300 -n 10000 http://localhost:4000/
    Requests per second:   2050.731 [#/sec] (mean)



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



