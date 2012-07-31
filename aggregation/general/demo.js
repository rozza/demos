// make sure we're using the right db;
// this is the same as "use demo;" in shell
db = db.getSiblingDB("demo");


/*************************************/
/* Match, sort, skip, limit Examples */
/*************************************/


// simple matching
var m1 = db.runCommand(
{ aggregate : "article", pipeline : [
    { $match : { author : "dave" } }
]});

// Combining operations (paginating - p1)
var m2 = db.runCommand(
{ aggregate : "article", pipeline : [
    { $sort : { author: 1} },
    { $skip : 0 },
    { $limit : 1 }
]});

// Combining operations (paginating - p2)
var m3 = db.runCommand(
{ aggregate : "article", pipeline : [
    { $sort : { author: 1 } },
    { $skip : 1 },
    { $limit : 1 }
]});



/***********************/
/* Projection Examples */
/***********************/



var p1 = db.runCommand(
{ aggregate : "article", pipeline : [
  { $project : {
    tags : 1,
    pageViews : 1
  }}
]});

// Combining pipeline operations using index
var p2 = db.runCommand(
{ aggregate : "article", pipeline : [
  { $match: { author : "bob" }},
  { $project : {
    tags : 1,
    pageViews : 1
  }}
]});

// pulling values out of subdocuments
var p3 = db.runCommand(
{ aggregate : "article", pipeline : [
  { $project : {
    foo : "$other.foo",
    bar : "$other.bar"
  }}
]});

// Dotted path inclusion; _id exclusion
var p4 = db.runCommand(
{ aggregate : "article", pipeline : [
  { $project : {
    _id : 0,
    author : 1,
    tags : 1,
    "comments.author" : 1
  }}
]});

// projection includes a virtual (fabricated) document
var p5 = db.runCommand(
{ aggregate : "article", pipeline : [
  { $project : {
    author : 1,
    meta : { tags : "$tags",
             views : "$pageViews" }
  }}
]});


/***********************************/
/* Projections and Computed values */
/***********************************/



// projection includes a computed value
var c1 = db.runCommand(
{ aggregate : "article", pipeline : [
  { $project : {
    author : 1,
    daveWroteIt : { $eq : ["$author", "dave"] }
  }}
]});




// Nested computed expression; $ifNull
var c2 = db.runCommand(
{ aggregate : "article", pipeline : [
    { $project : {
    totalViews : { $add :
                    ["$pageViews",
                     { $ifNull : ["$other.foo",
                                  "$other.bar"] } ] }
    }}
]});




// Date computations
var c3 = db.runCommand(
{aggregate : "article", pipeline : [
  { $project : {
    authors : 1,
    seconds : { $second: "$posted" },
    minutes : { $minute: "$posted" },
    hour : { $hour: "$posted" },
    dayOfYear : { $dayOfYear: "$posted" },
    dayOfMonth : { $dayOfMonth: "$posted" },
    dayOfWeek : { $dayOfWeek: "$posted" },
    month : { $month: "$posted" },
    week : { $week: "$posted" },
    year : { $year: "$posted" }

  }}
]});



/* Date arithmetic */  /* No longer works */
var c4 = db.runCommand(
{aggregate : "article", pipeline : [
  { $project : {
    authors : 1,
    date : "$posted",
    lastWeek : { $subtract : ["$posted", 7]},
    nextWeek : { $add : ["$posted", 7]},
    fiveMinutesAfter : { $add : ["$posted", (1 / 24 / 60) * 5 ]},
  }}
]});


// Ternary conditional operator
var c5 = db.runCommand(
{ aggregate : "article", pipeline : [
  { $project : {
    _id : 0,
    author : 1,
    pageViews : { $cond : [
                  { $eq : ["$author", "dave"]},
                      { $add : ["$pageViews", 1000]},
                               "$pageViews"]}
  }}
]});

/********************/
/* Unwinding Arrays */
/********************/

// Unwinding an array
var u1 = db.runCommand(
{ aggregate : "article", pipeline : [
  { $unwind : "$tags" }
]});


// Combining unwind (less memory usage)
var u2 = db.runCommand(
{ aggregate : "article", pipeline : [
  { $project : {
    author : 1,
    tags : 1,
    pageViews : 1
  }},
  { $unwind : "$tags" }
]});


// Find all comments by jenny
// match, unwind and match
var u3 = db.runCommand(
{ aggregate : "article", pipeline : [
  { $match : {"comments.author" : "jenny" }},
  { $project : {
    comments : 1
  }},
  { $unwind : "$comments" },
  { $match : { "comments.author" : "jenny" } },
]});


/************/
/* Grouping */
/************/


// Grouping and aggregates
var g1 = db.runCommand(
{ aggregate : "article", pipeline : [
  { $project : {
    author : 1,
    tags : 1,
    pageViews : 1
  }},
  { $unwind : "$tags" },
  { $group : {
    _id : "$tags",
    docsByTag : { $sum : 1 },
    viewsByTag : { $sum : "$pageViews" },
    mostViewsByTag : { $max : "$pageViews" },
    avgByTag : { $avg : "$pageViews" }
  }}
]});


// $addToSet as an accumulator - can pivot data
var g2 = db.runCommand(
{ aggregate : "article", pipeline : [
  { $project : {
    author : 1,
    tags : 1,
  }},
  { $unwind : "$tags" },
  { $group : {
    _id : "$tags",
    authors : { $addToSet : "$author" }
  }}
]});
