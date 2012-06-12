#!/bin/sh
. ./.credentials  # Your credentials (shh don't show anyone!)

echo "What tags do you want to track (comma delimitted no spaces), followed by [ENTER]:"
read tags

curl -u $CREDENTIALS -d '' https://stream.twitter.com/1/statuses/filter.json?track=$tags | mongoimport -d demo -c tweets