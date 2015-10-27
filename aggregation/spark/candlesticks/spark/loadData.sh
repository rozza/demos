#!/bin/sh

# spark-shell needs this
export SPARK_LOCAL_IP=127.0.0.1

# Demo location
export SPARK_DEMO=/Users/rozza/sandbox/sparkDemo

# Home paths
export MONGODB_HOME=$SPARK_DEMO/mongodb
export PATH=$PATH:$MONGODB_HOME/bin

# Vars
export dbname=sparkDemo
export collname=minbars

# Start clean! *** WARNING ***
mongo --eval "db.dropDatabase()" $dbname

# import mstf.csv file through mongoimport
mongoimport -d $dbname -c minbars --type csv --headerline mstf.csv

# echo some results
mongo --eval "db.$collname.find().limit(10).forEach(function(d){printjson(d)})" $dbname
