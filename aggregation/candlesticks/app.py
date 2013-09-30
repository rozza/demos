#!/usr/bin/env python

import flask
import pymongo
import sys
import datetime

from flask import request

app = flask.Flask(__name__)

db = pymongo.Connection().demo
db.money.ensure_index("ts")


@app.route("/")
def index():
    return flask.render_template("index.html")


@app.route("/money.json")
def money():

    # Get the page
    page = int(request.args.get('page', 1))
    limit = 6
    skip = page

    candlesticks = db.command("aggregate", "money",
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
    return JSONEncoder().encode(candlesticks)


class JSONEncoder(flask.json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.strftime('%Y-%m-%dT%H:%M:%S')
        else:
            return flask.json.JSONEncoder.default(self, obj)


if __name__ == "__main__":
    debug = any([x == 'debug' for x in sys.argv])
    app.run(debug=debug, host='0.0.0.0', port=4000)
