// make sure we're using the right db;
// this is the same as "use demo;" in shell
db = db.getSiblingDB("demo");


// Get minute - to aggregate by
var a1 = db.runCommand(
{ aggregate : "money", pipeline : [
  {$project : {
    minute : {
      0: {"$year": "$ts"},
      1: {"$month": "$ts"},
      2: {"$dayOfMonth": "$ts"},
      3: {"$hour": "$ts"},
      4: {"$minute": "$ts"}
    },
    ts : 1,
    bid : 1
  }},
  { $limit : 1}
]});

// Sort and Group
var a2 = db.runCommand(
{ aggregate : "money", pipeline : [
  {$project : {
    minute : {
      0: {"$year": "$ts"},
      1: {"$month": "$ts"},
      2: {"$dayOfMonth": "$ts"},
      3: {"$hour": "$ts"},
      4: {"$minute": "$ts"}
    },
    ts : 1,
    bid : 1
  }},
  { $sort  : { "ts" : 1 }},
  { $group : {
      _id       : "$minute",
      bid_open  : { $first : "$bid"},
      bid_close : { $last : "$bid"},
      bid_high  : { $max : "$bid"},
      bid_low   : { $min : "$bid"},
      bid_avg   : { $avg : "$bid"}
    }
  },
  { $limit : 1}
]});


/* sort, limit and skip */
var a3 = db.runCommand(
{ aggregate : "money", pipeline : [
  {$project : {
    minute : {
      0: {"$year": "$ts"},
      1: {"$month": "$ts"},
      2: {"$dayOfMonth": "$ts"},
      3: {"$hour": "$ts"},
      4: {"$minute": "$ts"}
    },
    ts : 1,
    bid : 1
  }},
  { $sort  : { "ts" : 1 }},
  { $group : {
      _id       : "$minute",
      ts        : { $first: "$ts"},
      bid_open  : { $first : "$bid"},
      bid_close : { $last : "$bid"},
      bid_high  : { $max : "$bid"},
      bid_low   : { $min : "$bid"},
      bid_avg   : { $avg : "$bid"}
    }
  },
  { $sort  : { _id : 1 }},
  { $limit : 1}
]});


/* Project the final document */
var a4 = db.runCommand(
{ aggregate : "money", pipeline : [
  {$project : {
    minute : {
      0: {"$year": "$ts"},
      1: {"$month": "$ts"},
      2: {"$dayOfMonth": "$ts"},
      3: {"$hour": "$ts"},
      4: {"$minute": "$ts"}
    },
    ts : 1,
    bid : 1
  }},
  { $sort  : { "ts" : 1 }},
  { $group : {
      _id       : "$minute",
      ts        : { $first: "$ts"},
      bid_open  : { $first : "$bid"},
      bid_close : { $last : "$bid"},
      bid_high  : { $max : "$bid"},
      bid_low   : { $min : "$bid"},
      bid_avg   : { $avg : "$bid"}
    }
  },
  { $sort : { _id : 1 }},
  { $skip : 0 },
  { $limit : 5 },
  { $project : {
    _id : "$ts",
    bid : {
      open  : "$bid_open",
      close : "$bid_close",
      high  : "$bid_high",
      low   : "$bid_low",
      avg   : "$bid_avg"
      }
    }
  }
]});