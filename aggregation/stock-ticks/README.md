SETUP
======

Install python dependencies
---------------------------

pip install -r requirements.txt

Mongod
------
* download mongod 2.1.0+ (or 2.1 nightly)
* start mongod

Load the data
-------------

* ./mongodb/bin/mongorestore -d demo -c money --drop ./stock-ticks/money.bson

Start web app
-------------
* ./app.py

All set
-------

[http://127.0.0.1:4000](http://127.0.0.1:4000/)

Run example script - examine variables
--------------------------------------
* ./mongodb/bin/mongo ./stock-ticks/demo.js --shell