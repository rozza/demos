var margin = {top: 10, right: 50, bottom: 20, left: 50},
    width = 120 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x1 = null, data = null, page = 0;

var chart = boxChart()
    .width(width)
    .height(height);


function draw(data) {
  var bid_data = [],
      ask_data = [],
      all_data = [];

    data.forEach(function(d) {
      bid_data.push(d.bid.high, d.bid.low);
      ask_data.push(d.ask.high, d.ask.low);
    });

    all_data = bid_data.concat(ask_data).sort();

    min = all_data[0];
    max = all_data[all_data.length-1];

      // Compute the  x-scale.
    x1 = d3.scale.linear()
        .domain([min, max])
        .range([height, 0]);

  chart.domain([min, max]);

  var vis = d3.select("#chart").selectAll("svg")
      .data(data)
    .enter().append("svg")
      .attr("class", "box")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.bottom + margin.top )
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(chart);

  chart.duration(1000);
  timeout = setTimeout(loadNext, 2000);
}


function redraw(data) {
  if (data.length < 6) { return }
  var bid_data = [],
      ask_data = [],
      all_data = [];

  data.forEach(function(d) {
    bid_data.push(d.bid.high, d.bid.low);
    ask_data.push(d.ask.high, d.ask.low);
  });

  all_data = bid_data.concat(ask_data).sort();

  min = all_data[0];
  max = all_data[all_data.length-1];

    // Compute the  x-scale.
  x1 = d3.scale.linear()
      .domain([min, max])
      .range([height, 0]);

  chart.domain([min, max]);
  d3.select("#chart").selectAll("svg").data(data).call(chart)
  timeout = setTimeout(loadNext, 2000);

}


function loadNext() {
  func = (page == 0) ? draw : redraw;
  page += 1;
  d3.json("/money.json?page="+page, func);
}
loadNext();


// Inspired by http://informationandvisualization.de/blog/box-plot
function boxChart() {
  var width = 1,
      height = 1,
      duration = 0,
      yAxisGroup = null,
      xAxisGroup = null

  // For each small multiple..
  function box(g) {

    g.each(function(d, i) {

      var g = d3.select(this),

          whiskerData = [d.bid.low, d.bid.high];
          quartileData = [d.bid.open, d.bid.close];

      // Retrieve the old x-scale, if this is an update.
      var x0 = this.__chart__ || x1

      // Stash the new scale.
      this.__chart__ = x1;

      // Note: the box, median, and box tick elements are fixed in number,
      // so we only have to handle enter and update. Variable
      // elements also fade in and out.

      // Update center line: the vertical line spanning the whiskers.
      var center = g.selectAll("line.center")
          .data(whiskerData ? [whiskerData] : []);

      center.enter().insert("svg:line", "rect")
          .attr("class", "center")
          .attr("x1", width / 2)
          .attr("y1", function(d) { return x0(d[0]); })
          .attr("x2", width / 2)
          .attr("y2", function(d) { return x0(d[1]); })
          .style("opacity", 1e-6)
        .transition()
          .duration(duration)
          .style("opacity", 1)
          .attr("y1", function(d) { return x1(d[0]); })
          .attr("y2", function(d) { return x1(d[1]); });

      center.transition()
          .duration(duration)
          .style("opacity", 1)
          .attr("y1", function(d) { return x1(d[0]); })
          .attr("y2", function(d) { return x1(d[1]); });

      center.exit().transition()
          .duration(duration)
          .style("opacity", 1e-6)
          .attr("y1", function(d) { return x1(d[0]); })
          .attr("y2", function(d) { return x1(d[1]); })
          .remove();

      // Update innerquartile box.
      var box = g.selectAll("rect.box")
          .data([quartileData]);

      box.enter().append("svg:rect")
          .attr("x", 0)
          .attr("y", function(d) { return (d[0] > d[1]) ? x0(d[0]) : x0(d[1]); })
          .attr("width", width)
          .attr("height", function(d) { return (d[0] < d[1]) ? x0(d[0]) - x0(d[1]) : x0(d[1]) - x0(d[0]); })
          .attr("class", function(d) { return (d[1] > d[0]) ? "box blue" : "box red";})
        .transition()
          .duration(duration)
          .attr("y", function(d) { return (d[0] > d[1]) ? x1(d[0]) : x1(d[1]); })
          .attr("height", function(d) { return (d[0] < d[1]) ? x1(d[0]) - x1(d[1]) : x1(d[1]) - x1(d[0]); });

      box.transition()
          .duration(duration)
          .attr("y", function(d) { return (d[0] > d[1]) ? x1(d[0]) : x1(d[1]); })
          .attr("height", function(d) { return (d[0] < d[1]) ? x1(d[0]) - x1(d[1]) : x1(d[1]) - x1(d[0]); })
          .attr("class", function(d) { return (d[1] > d[0]) ? "box blue" : "box red";});


      // Update median line.
      var medianLine = g.selectAll("line.median")
          .data([d.bid.avg]);

      medianLine.enter().append("svg:line")
          .attr("class", "median")
          .attr("x1", 0)
          .attr("y1", x0)
          .attr("x2", width)
          .attr("y2", x0)
        .transition()
          .duration(duration)
          .attr("y1", x1)
          .attr("y2", x1);

      medianLine.transition()
          .duration(duration)
          .attr("y1", x1)
          .attr("y2", x1);

      // Update whiskers.
      var whisker = g.selectAll("line.whisker")
          .data(whiskerData || []);

      whisker.enter().insert("svg:line")
          .attr("class", "whisker")
          .attr("x1", 0)
          .attr("y1", x0)
          .attr("x2", width)
          .attr("y2", x0)
          .style("opacity", 1e-6)
        .transition()
          .duration(duration)
          .attr("y1", x1)
          .attr("y2", x1)
          .style("opacity", 1);

      whisker.transition()
          .duration(duration)
          .attr("y1", x1)
          .attr("y2", x1)
          .style("opacity", 1);

      whisker.exit().transition()
          .duration(duration)
          .attr("y1", x1)
          .attr("y2", x1)
          .style("opacity", 1e-6)
          .remove();

      // Compute the tick format.
      var format = x1.tickFormat("r");

      // Update box ticks.
      var boxTick = g.selectAll("text.box")
          .data(quartileData);

      boxTick.enter().append("svg:text")
          .attr("class", "box")
          .attr("dy", ".3em")
          .attr("dx", function(d, i) { return i & 1 ? 6 : -6 })
          .attr("x", function(d, i) { return i & 1 ? width : 0 })
          .attr("y", x0)
          .attr("text-anchor", function(d, i) { return i & 1 ? "start" : "end"; })
          .text(format)
        .transition()
          .duration(duration)
          .attr("y", x1);

      boxTick.transition()
          .duration(duration)
          .text(format)
          .attr("y", x1);

      // Update whisker ticks. These are handled separately from the box
      // ticks because they may or may not exist, and we want don't want
      // to join box ticks pre-transition with whisker ticks post-.
      var whiskerTick = g.selectAll("text.whisker")
          .data(whiskerData || []);

      whiskerTick.enter().append("svg:text")
          .attr("class", "whisker")
          .attr("dy", ".3em")
          .attr("dx", 6)
          .attr("x", width)
          .attr("y", x0)
          .text(format)
          .style("opacity", 1e-6)
        .transition()
          .duration(duration)
          .attr("y", x1)
          .style("opacity", 1);

      whiskerTick.transition()
          .duration(duration)
          .text(format)
          .attr("y", x1)
          .style("opacity", 1);

      whiskerTick.exit().transition()
          .duration(duration)
          .attr("y", x1)
          .style("opacity", 1e-6)
          .remove();


    var legend = g.selectAll("text.legend")
                 .data([d]);
     legend.enter().append("svg:text")
          .attr("class", "legend")
          .attr("dy", ".3em")
          .attr("dx", 6)
          .attr("x", 0)
          .attr("y", 0)
          .text(format_legend)
          .style("opacity", 1e-6)
        .transition()
          .duration(duration)
          .attr("y", 0)
          .style("opacity", 1);

      legend.transition()
          .duration(duration)
          .text(format_legend)
          .attr("y", 0)
          .style("opacity", 1);

      legend.exit().transition()
          .duration(duration)
          .attr("y", 0)
          .style("opacity", 1e-6)
          .remove();


    });
    d3.timer.flush();
  }

  box.width = function(x) {
    if (!arguments.length) return width;
    width = x;
    return box;
  };

  box.height = function(x) {
    if (!arguments.length) return height;
    height = x;
    return box;
  };

  box.tickFormat = function(x) {
    if (!arguments.length) return tickFormat;
    tickFormat = x;
    return box;
  };

  box.duration = function(x) {
    if (!arguments.length) return duration;
    duration = x;
    return box;
  };

  box.domain = function(x) {
    if (!arguments.length) return domain;
    domain = x == null ? x : d3.functor(x);
    return box;
  };


  return box;
};

var format_legend = function(d) {
  var date = d._id.split('T');
  return date[1];
}