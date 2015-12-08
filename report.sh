#!/bin/bash

FILENAME="bench_report.txt"
CONCURENCY=50
NUMBEROFCALLS=10000


echo -e "\nnode.js + express + request + proxy + ubuntu TCP stack"
echo -e "------------------------------------------------------\n"

#
# Get Node version
#
NODEVERSION="$(node -v)" 
echo "node version     : $NODEVERSION"
echo "Concurency       : $CONCURENCY"
echo "Number of calls  : $NUMBEROFCALLS"


#
# Running the End Server
#

nohup node /pserverB.js > /dev/null 2>&1 &

PID1="$(nohup node serverB.js > /dev/null 2>&1 & echo $!)"
PID2="$(nohup node serverB.js > /dev/null 2>&1 & echo $!)"

echo -e "\nStarting Server A (pid $PID1)"
echo -e "Starting Server B (pid $PID2)\n"

# Bench
#

echo -e "\nServer B (hello world)"
ab -k -c $CONCURENCY -n $NUMBEROFCALLS  http://localhost:4000/ > /tmp/res.txt  2>&1
cat /tmp/res.txt | grep 'Requests'
rm  /tmp/res.txt

echo -e "\nServer A (express + request)"
ab -k -c $CONCURENCY -n $NUMBEROFCALLS  http://localhost:3000/ > /tmp/res.txt  2>&1
cat /tmp/res.txt | grep 'Requests'
rm  /tmp/res.txt

#
# Stoping service
#
echo ""
echo "Stoping server A (pid $PID1)"
echo "Stoping server B (pid $PID2)"
echo ""
kill -9 $PID1
kill -9 $PID2

