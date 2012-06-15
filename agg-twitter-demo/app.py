#!/usr/bin/env python

import flask
import pymongo
import sys

app = flask.Flask(__name__)

db = pymongo.Connection().demo
db.demo.ensure_index("created_at")


@app.route("/")
def index():

    if db.tweets.count() == 0:
        return flask.render_template("index.html", no_data=True)

# -----------------------------------------------------------------------------
# The old way...

    mentions = db.tweets.inline_map_reduce('''
      function(){
        if ( ! ( this.entities && this.entities.user_mentions ) )
          return;

        var x = this.entities.user_mentions;

        for ( var i=0; i<x.length; i++ ) {
            emit( x[i].screen_name , 1 );
        }
      }
''', '''
      function(k, arr) {
        return Array.sum(arr)
}
''')

    mentions.sort(lambda a, b: int(b["value"] - a["value"]))
    mentions = mentions[0:8]

# -----------------------------------------------------------------------------
# With the new aggregation framework

    posters = db.command("aggregate", "tweets",
                pipeline=[
                    {"$match": {"user.screen_name": {"$exists": True}}},
                    {"$group": {"_id": "$user.screen_name",
                                "total": {"$sum": 1}}},
                    {"$sort": {"total": -1}},
                    {"$limit": 8}
                ])["result"]




# -----------------------------------------------------------------------------

    context = {"mentions": mentions, "posters": posters}
    context["last"] = db.tweets.find({"user.screen_name": {"$exists": True}},
                                    sort=[("created_at", -1)]
                                  ).limit(6)

    return flask.render_template("index.html", **context)


if __name__ == "__main__":
    debug = any([x == 'debug' for x in sys.argv])
    app.run(debug=True, host='0.0.0.0', port=4000)
