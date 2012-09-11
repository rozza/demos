var load_next = true;
var w = 120,
    h = 500,
    min = false,
    max = false;

var x = d3.scale.linear()
    .domain([0, 1])
    .range([0, w]);

var y = d3.scale.linear()
    .domain([1, 2])
    .range([h, 0]);

var chart = d3.select("#chart").append("svg")
    .attr("class", "chart")
    .attr("height", h);

var page = 0;

function toggle() {
  load_next = (!load_next) ? true : false;
  if (load_next) {
    document.getElementById("button").className = "darkblue active";
  } else {
    document.getElementById("button").className = "darkblue";
  }
  loadNext();
}

function loadNext() {
  if (!load_next) {return}
  page += 1;
  d3.json("/money.json?page="+page, redraw);
  d3.timer.flush();
}
loadNext();

function redraw(data) {
  if (data.length < 6) { return }

  var bid_data = [];

  data.forEach(function(d) {
    bid_data.push(d.bid.high, d.bid.low);
  });
  all_data = bid_data.sort();

  new_min = all_data[0];
  new_max = all_data[all_data.length-1];

  // Update min max?
  min = (min == false | new_min < min) ? new_min : min;
  max = (max == false | new_max > max) ? new_max : max;

  y = d3.scale.linear()
      .domain([min, max])
      .range([450, 30]);

  // Update center line: the vertical line spanning the whiskers.
  var center = chart.selectAll("line.center")
      .data(data, function(d) { return d._id; });

  center.enter().insert("line")
      .attr("class", "center")
      .attr("x1", function(d, i) { return x(i + 1) + 9.5; })
      .attr("x2", function(d, i) { return x(i + 1) + 9.5; })
      .attr("y1", function(d) { return y(d.bid.high); })
      .attr("y2", function(d) { return y(d.bid.low); })
      .style("opacity", 1);

  center.transition()
      .duration(1000).ease('in-out')
      .attr("x1", function(d, i) { return x(i) + 9.5; })
      .attr("x2", function(d, i) { return x(i) + 9.5; })
      .attr("y1", function(d) { return y(d.bid.high); })
      .attr("y2", function(d) { return y(d.bid.low); });

  center.exit().transition()
      .duration(1000).ease('in-out')
      .attr("x1", function(d, i) { return x(i - 1) + 9.5; })
      .attr("x2", function(d, i) { return x(i - 1) + 9.5; })
      .remove();

  var candle = chart.selectAll("line.candle")
      .data(data, function(d) { return d._id; });

  candle.enter().insert("line")
      .attr("class", "candle")
      .attr("x1", function(d, i) { return x(i + 1) + 9.5; })
      .attr("x2", function(d, i) { return x(i + 1) + 9.5; })
      .attr("y1", function(d) { var start = (d.bid.open > d.bid.close) ? d.bid.open : d.bid.close; return y(start); })
      .attr("y2", function(d) { var end = (d.bid.open < d.bid.close) ? d.bid.open : d.bid.close; return y(end); })
      .style("opacity", 1);

  candle.transition()
      .duration(1000).ease('in-out')
      .attr("x1", function(d, i) { return x(i) + 9.5; })
      .attr("x2", function(d, i) { return x(i) + 9.5; })
      .attr("y1", function(d) { var start = (d.bid.open > d.bid.close) ? d.bid.open : d.bid.close; return y(start); })
      .attr("y2", function(d) { var end = (d.bid.open < d.bid.close) ? d.bid.open : d.bid.close; return y(end); });

  candle.exit().transition()
      .duration(1000).ease('in-out')
      .attr("x1", function(d, i) { return x(i - 1) + 9.5; })
      .attr("x2", function(d, i) { return x(i - 1) + 9.5; })
      .remove();

  // Draw the candle
  var candle = chart.selectAll("rect.candle")
      .data(data, function(d) { return d._id; });

  candle.enter().insert("rect")
      .attr("class", function(d) { return (d.bid.open > d.bid.close) ? "candle red" : "candle blue";})

      .attr("x", function(d, i) { return x(i + 1) - .5; })
      .attr("y", function(d) {
        return  (d.bid.open > d.bid.close) ? y(d.bid.open): y(d.bid.close)
      })
      .attr("width", 20)
      .attr("height", function(d) { return (d.bid.open > d.bid.close) ? y(d.bid.close) - y(d.bid.open) : y(d.bid.open) - y(d.bid.close); })
      .style("opacity", 1);

  candle.transition()
      .duration(1000).ease('in-out')
      .attr("x", function(d, i) { return x(i) - .5; })
      .attr("y", function(d) {
        return  (d.bid.open > d.bid.close) ? y(d.bid.open): y(d.bid.close)
      })
      .attr("height", function(d) { return (d.bid.open > d.bid.close) ? y(d.bid.close) - y(d.bid.open) : y(d.bid.open) - y(d.bid.close); });

  candle.exit().transition()
      .duration(1000).ease('in-out')
      .attr("x", function(d, i) { return x(i - 1) - .5; })
      .remove();

  // Add median line
  var median = chart.selectAll("path.median")
      .data(data, function(d) { return d._id; });

  median.enter().insert("path")
      .attr("class", "median")
      .attr("transform", function(d, i) { return "translate(" +  (x(i + 1) + 9.5) + "," + y(d.bid.avg) + ")"; })
      .attr("d", d3.svg.symbol().type("triangle-up"))
      .style("opacity", 1);

  median.transition()
      .duration(1000).ease('in-out')
      .attr("transform", function(d, i) {return "translate(" +  (x(i) + 9.5) + "," + y(d.bid.avg) + ")"; })

  median.exit().transition()
      .duration(1000).ease('in-out')
      .attr("transform", function(d, i) { return "translate(" +  (x(i - 1) + 9.5) + "," + y(d.bid.avg) + ")"; })
      .remove();

  // Update whiskers.
  var whisker_low = chart.selectAll("line.whiskerLow")
      .data(data, function(d) { return d._id; });

  whisker_low.enter()
    .insert("line")
      .attr("class", "whiskerLow")
      .attr("x1", function(d, i) { return x(i + 1) + .5; })
      .attr("x2", function(d, i) { return x(i + 1) + 19.5; })
      .attr("y1", function(d) { return y(d.bid.low); })
      .attr("y2", function(d) { return y(d.bid.low); })
      .style("opacity", 1)

  whisker_low.transition()
      .duration(1000).ease('in-out')
      .attr("x1", function(d, i) { return x(i) + .5; })
      .attr("x2", function(d, i) { return x(i) + 19.5; })
      .attr("y1", function(d) { return y(d.bid.low); })
      .attr("y2", function(d) { return y(d.bid.low); });

  whisker_low.exit().transition()
      .duration(1000).ease('in-out')
      .attr("x1", function(d, i) { return x(i - 1) + 9.5; })
      .attr("x2", function(d, i) { return x(i - 1) + 9.5; })
      .remove();

  var whisker_high = chart.selectAll("line.whiskerHigh")
      .data(data, function(d) { return d._id; });

  whisker_high.enter()
    .insert("line")
      .attr("class", "whiskerHigh")
      .attr("x1", function(d, i) { return x(i + 1) + .5; })
      .attr("x2", function(d, i) { return x(i + 1) + 19.5; })
      .attr("y1", function(d) { return y(d.bid.high); })
      .attr("y2", function(d) { return y(d.bid.high); })
      .style("opacity", 1)

  whisker_high.transition()
      .duration(1000).ease('in-out')
      .attr("x1", function(d, i) { return x(i) + .5; })
      .attr("x2", function(d, i) { return x(i) + 19.5; })
      .attr("y1", function(d) { return y(d.bid.high); })
      .attr("y2", function(d) { return y(d.bid.high); });

  whisker_high.exit().transition()
      .duration(1000).ease('in-out')
      .attr("x1", function(d, i) { return x(i - 1) + 9.5; })
      .attr("x2", function(d, i) { return x(i - 1) + 9.5; })
      .remove();

  // Update open ticks.
  var open = chart.selectAll("text.tick_open")
      .data(data, function(d) { return d._id; });

  open.enter().append("text")
      .attr("class", "tick_open")
      .attr("x", function(d, i) { return x(i + 1) + 25; })
      .attr("y", function(d, i) { return y(d.bid.open) + 5;})
      .attr("text-anchor", function(d, i) { "end" })
      .text(function(d, i) { return d.bid.open});

  open.transition()
      .duration(1000).ease('in-out')
      .attr("x", function(d, i) { return x(i) + 25; })
      .attr("y", function(d, i) { return y(d.bid.open) + 5;});

  open.exit().transition()
      .duration(1000).ease('in-out')
      .attr("x", function(d, i) { return x(i - 1) + 25; })
      .remove();

  // Close ticks
  var close = chart.selectAll("text.tick_close")
      .data(data, function(d) { return d._id; });

  close.enter().append("text")
      .attr("class", "tick_close")
      .attr("x", function(d, i) { return x(i + 1) + 25; })
      .attr("y", function(d, i) { return y(d.bid.close) + 5;})
      .attr("text-anchor", function(d, i) { "end" })
      .text(function(d, i) { return d.bid.close});

  close.transition()
      .duration(1000).ease('in-out')
      .attr("x", function(d, i) { return x(i) + 25; })
      .attr("y", function(d, i) { return y(d.bid.close) + 5;});

  close.exit().transition()
      .duration(1000).ease('in-out')
      .attr("x", function(d, i) { return x(i - 1) + 25; })
      .remove();

  // Legend
  var legend = chart.selectAll("text.legend")
      .data(data, function(d) { return d._id; });

  legend.enter().append("text")
      .attr("class", "legend")
      .attr("x", function(d, i) { return x(i + 1) + 10; })
      .attr("y", 20)
      .text(function(d){
        var time = d._id.split("T")[1].split(":");
        return time[0] + ":" + time[1]; });

  legend.transition()
      .duration(1000).ease('in-out')
      .attr("x", function(d, i) { return x(i) + 10; });

  legend.exit().transition()
      .duration(1000).ease('in-out')
      .attr("x", function(d, i) { return x(i - 1) + 10; })
      .remove();

  setTimeout(loadNext, 2000);

}
