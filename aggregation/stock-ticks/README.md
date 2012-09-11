SETUP
======

Install python dependencies
---------------------------

pip install -r requirements.txt

Mongod
------
* download mongod 2.2.0+
* start mongod

Load the data
-------------

* mongorestore -d demo -c money --drop ./money.bson

Start web app
-------------
* ./app.py

All set
-------

![Candlesticks](https://raw.github.com/rozza/demos/master/aggregation/candlesticks/candlesticks.png)


[http://127.0.0.1:4000](http://127.0.0.1:4000/)

Run example script - examine variables
--------------------------------------
* mongo demo.js --shell