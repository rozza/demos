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

    ticks = db.command("aggregate", "money",
            pipeline=[
                {"$project": {
                    "minute": {"$isoDate": {
                        "year": {"$year": "$ts"},
                        "month": {"$month": "$ts"},
                        "dayOfMonth": {"$dayOfMonth": "$ts"},
                        "hour": {"$hour": "$ts"},
                        "minute": {"$minute": "$ts"}}},
                     "ts": 1,
                     "bid": 1,
                     "ask": 1
                    }
                  },
                  {"$sort": {"minute": 1}},
                  {"$group": {
                      "_id": "$minute",
                      "bid_open": {"$first": "$bid"},
                      "bid_close": {"$last": "$bid"},
                      "bid_high": {"$max": "$bid"},
                      "bid_low": {"$min": "$bid"},
                      "bid_avg": {"$avg": "$bid"},
                      "ask_open": {"$first": "$ask"},
                      "ask_close": {"$last": "$ask"},
                      "ask_high": {"$max": "$ask"},
                      "ask_low": {"$min": "$ask"},
                      "ask_avg": {"$avg": "$ask"}
                    }
                  },
                  {"$sort": {"_id": 1}},
                  {"$skip": skip},
                  {"$limit": limit},
                  {"$project": {
                      "_id": 1,
                      "bid": {
                        "open": "$bid_open",
                        "close": "$bid_close",
                        "high": "$bid_high",
                        "low": "$bid_low",
                        "avg": "$bid_avg"
                      },
                      "ask": {
                        "open": "$ask_open",
                        "close": "$ask_close",
                        "high": "$ask_high",
                        "low": "$ask_low",
                        "avg": "$ask_avg"
                      }
                    }
                  },
            ])["result"]
    return JSONEncoder().encode(ticks)


class JSONEncoder(flask.json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.strftime('%Y-%m-%dT%H:%M:%S')
        else:
            return flask.json.JSONEncoder.default(self, obj)


if __name__ == "__main__":
    debug = any([x == 'debug' for x in sys.argv])
    app.run(debug=False, host='0.0.0.0', port=4000)
