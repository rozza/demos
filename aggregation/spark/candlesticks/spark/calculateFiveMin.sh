#!/bin/sh

# spark-shell needs this
export SPARK_LOCAL_IP=127.0.0.1

# Home paths
export SPARK_DEMO=/Users/rozza/sandbox/sparkDemo
export HADOOP_PREFIX=$SPARK_DEMO/hadoop-2.6.1
export SPARK_HOME=$SPARK_DEMO/spark-1.4.1

# Add Spark to path
export PATH=$PATH:$SPARK_HOME/bin

# run spark-shell
spark-shell --packages com.stratio:spark-mongodb-core:0.8.7 -i fiveMinuteCandleSticks.scala
