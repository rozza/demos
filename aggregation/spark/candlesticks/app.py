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
@app.route("/min")
def one():
    return flask.render_template("index.html", title="One Minute Chart")

@app.route("/sparked")
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

def process_quotes(collname, page):
    limit = 200
    skip = page
    projection = { '_id': False}
    quotes = [ format(x, 'Timestamp') for x in db[collname].find({},projection=projection).sort("Timestamp", ASCENDING)
        .skip(skip).limit(limit)]
    return JSONEncoder().encode(quotes)

@app.route("/money.json")
def money():

    # Get the page
    page = int(request.args.get('page', 1))
    limit = 9
    skip = page

    """
    candlesticks = db.command("aggregate", collname,
            pipeline=[
                {"$project": {
                    "minute": {
                        "0": {"$year": "$ts"},
                        "1": {"$month": "$ts"},
                        "2": {"$dayOfMonth": "$ts"},
                        "3": {"$hour": "$ts"},
                        "4": {"$minute": "$ts"}
                      },
                     "ts": 1,
                     "bid": 1
                    }
                  },
                  {"$sort": {"ts": 1}},
                  {"$group": {
                      "_id": "$minute",
                      "ts": {"$first": "$ts"},
                      "bid_open": {"$first": "$bid"},
                      "bid_close": {"$last": "$bid"},
                      "bid_high": {"$max": "$bid"},
                      "bid_low": {"$min": "$bid"},
                      "bid_avg": {"$avg": "$bid"}
                    }
                  },
                  {"$sort": {"ts": 1}},
                  {"$skip": skip},
                  {"$limit": limit},
                  {"$project": {
                      "_id": "$ts",
                      "bid": {
                        "open": "$bid_open",
                        "close": "$bid_close",
                        "high": "$bid_high",
                        "low": "$bid_low",
                        "avg": "$bid_avg"
                      }
                    }
                  },
            ])["result"]
    """
    pipeline = [
    { "$project": {
        "bid": {"open": "$Open", "close": "$Close",
        "high": "$High", "low": "$Low", "avg": {"$avg": ["$High", "$Low"]} },
        "ts": "$Timestamp",
        "_id": "$Timestamp"
        }
    },
    {"$sort": {"ts":1}},
    {"$skip": skip},
    {"$limit": limit},
    ]
    result = db.minbars.aggregate(pipeline)['result']

    candlesticks = [format(x) for x in result]
    print candlesticks
    return JSONEncoder().encode(candlesticks)

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
