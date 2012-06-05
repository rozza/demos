
SETUP
======

Install python dependencies
---------------------------

pip install -r requirements.txt

Mongod
------
* download mongod 2.1.0+ (or 2.1 nightly)
* start mongod

Start web app
-------------
* ./app.py

Collect tweets
--------------

Create a .credentials file with your twitter credentials:

   #!/bin/bash
   CREDENTIALS=<USERNAME>:'<PASSWORD>'

* ./collect_tweets.sh
(You will be asked to enter the tags to track, no spaces!)

All set
-------

[http://127.0.0.1:4000](http://127.0.0.1:4000/)
