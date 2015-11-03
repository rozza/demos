#!/usr/bin/env python

import flask
import pymongo
from pymongo import ASCENDING
import sys
import datetime

from flask import request

app = flask.Flask(__name__)

dbname = "sparkDemo"
db = pymongo.MongoClient()[dbname]
db["fiveMinBars"].ensure_index("ts")
db["minbars"].ensure_index("ts")

@app.route("/")
def one():
    return flask.render_template("index.html", title="One Minute Chart")

@app.route("/five")
def five():
    return flask.render_template("index.html", title="Five Minute Chart")

@app.route("/fiveticks.json")
def fiveticks():
    # Get the page
    page = int(request.args.get('page', 1))
    collname = "fiveMinBars"
    return process_quotes(collname, page)

@app.route("/minticks.json")
def ticks():
    # Get the page
    page = int(request.args.get('page', 1))
    collname = "minbars"
    return process_quotes(collname, page)

# Loads data from the collection and the page
def process_quotes(collname, page):
    limit = 200
    skip = page
    projection = { '_id': False}
    quotes = [ format(x, 'Timestamp') for x in db[collname].find({},projection=projection).sort("Timestamp", ASCENDING)
        .skip(skip).limit(limit)]
    return JSONEncoder().encode(quotes)

def format(x, k='_id'):
    x[k] = datetime.datetime.strptime(x[k], '%Y-%m-%d %H:%M')
    if k != '_id':
        x.pop('_id', None)
    return x

class JSONEncoder(flask.json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.strftime('%Y-%m-%dT%H:%M:%S')
        else:
            return flask.json.JSONEncoder.default(self, obj)


if __name__ == "__main__":
    debug = any([x == 'debug' for x in sys.argv])
    app.run(debug=debug, host='0.0.0.0', port=4000)
