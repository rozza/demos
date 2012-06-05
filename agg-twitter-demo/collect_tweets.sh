#!/bin/sh
. ./.credentials

echo "What tags do you want to track (comma delimitted no spaces), followed by [ENTER]:"
read tags

curl -u $CREDENTIALS -d '' https://stream.twitter.com/1/statuses/filter.json?track=$tags | mongoimport -d test -c live