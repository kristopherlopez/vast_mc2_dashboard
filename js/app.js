$(document).ready(function () {

  console.log($(window).width())
  console.log($(window).height())

  max_height = $(".side").height()
  max_width = $(".main").width() * 0.76

  
  $('.line-graph').height(max_height /4)

  location_data = {}
  sensor_data = {}

  var svg = d3.select("div.pt-page-1")
    .append("svg")
    .attr("class", 'svg-page-1')
    .attr("width", max_width)
    .attr("height", max_height)
    // .call(d3.zoom().on("zoom", function () {
    //     svg.attr("transform", d3.event.transform)
    //   }))
    .append("g")
    .attr("class", 'g-page-1')

  d3.csv("data/locations.csv", function(error, data){
    if (error) throw error;

    // load circles for chemical diagnostic

    b_radius = 0.105 * max_height;
    l_radius = 0.025 * max_height;

    east_offset = 0.01 * max_height
    north_offset = 10
    text_offset = 0.03 * max_height
    sensor_x = 0.003 * max_height
    sensor_y = 0.005 * max_height

    max_east = d3.max(data, function(d) { return +d.east_gu}) + east_offset
    min_east = d3.min(data, function(d) { return +d.east_gu}) - east_offset

    max_north = d3.max(data, function(d) { return +d.north_gu}) + north_offset
    min_north = d3.min(data, function(d) { return +d.north_gu}) - north_offset

    range_east = max_east - min_east
    range_north = max_north - min_north

    var big_circles = svg.append('g')
      .attr('class', 'b-circles')
      .selectAll("circle")
      .data(data.filter(function(d){ return d.type === 'sensor'}))
      .enter()
      .append("circle")
      .attr("id", function(d) { return 'b-' + d.name;})
      .attr("class", function(d) { return 'b-' + d.type;})
      .attr("cx", function(d) { return max_width * (+d.east_gu - min_east) / (range_east);})
      .attr("cy", function(d) { return max_height - max_height * (+d.north_gu - min_north) / (range_north);})
      .style("r", b_radius)

    var little_circles = svg.append('g')
      .attr('class', 'l-circles')
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("id", function(d) { return d.name;})
      .attr("class", function(d) { return 'l-' + d.type;})
      .attr("cx", function(d) { return max_width * (+d.east_gu - min_east) / (range_east);})
      .attr("cy", function(d) { return max_height - max_height * (+d.north_gu - min_north) / (range_north);})
      .style("stroke", function(d) { return "black"})
      .style("r", function(d) {
        if(d.type === 'sensor') { return 0.01 * max_height }
        else { return 0.0025 * max_height }
      })

    var text = svg.selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "circText")
      .attr("x", function(d) { 
        if(d.type === 'sensor'){ offset = sensor_x; }
        else if(d.type === 'factory'){ offset = text_offset; }
        return max_width * (+d.east_gu - min_east) / (range_east) - offset; 
      })
      .attr("y", function(d) { 
        if(d.type === 'sensor'){ offset = sensor_y; }
        else if(d.type === 'factory'){ offset = text_offset; }
        return max_height - max_height * (+d.north_gu - min_north) / (range_north) + offset; 

      })
      .text(function(d) { return d.name; })
      .attr("font-size", f)

    d3.csv("data/data.csv", function(error, data){
      if (error) throw error;

      var sensor_data = data.filter(function(d) { return +d.missing_sensor === 0 })
      sensor_data = sensor_data.filter(function(d) { return +d.missing_wind === 0 })
      sensor_data = sensor_data.filter(function(d) { return +d.reading > 0.01 })
      sensor_data = sensor_data.filter(function(d) { return +d.monitor === 6})

      var pivot_data = {}

      for(var i = 1; i <= 9; i++){
        filter_data = sensor_data.filter(function(d) { return +d.monitor === i})
        pivot_data[i] = {}
        pivot_data[i]['min_value'] = d3.min(filter_data, function(d) { return +d.reading})
        pivot_data[i]['max_value'] = d3.max(filter_data, function(d) { return +d.reading})
        pivot_data[i]['rng_value'] = pivot_data[i]['max_value'] - pivot_data[i]['min_value']
        pivot_data[i]['deviation'] = d3.deviation(filter_data, function(d) {return +d.reading})
      }
      
      m = b_radius

      var data_circles = svg.selectAll("circle")
        .data(sensor_data)
        .enter()
        .append("circle")
        .attr("cx", function(d) { 
          a = +d.wind_direction
          s = (+d.reading - pivot_data[d.monitor]['min_value']) / pivot_data[d.monitor]['rng_value']
          c = 'circle#' + d.monitor
          if (450 - a > 360) { a = 90 - a } else { a = 450 - a }
          if (a < 180 ) { a = 180 + a } else { a = a - 180}
          return +$(c).attr('cx') + m * s * Math.cos(a * (Math.PI / 180)) 
        })
        .attr("cy", function(d) {
          a = +d.wind_direction
          s = (+d.reading - pivot_data[d.monitor]['min_value']) / pivot_data[d.monitor]['rng_value']
          c = 'circle#' + d.monitor
          if (450 - a > 360) { a = 90 - a } else { a = 450 - a }
          return +$(c).attr('cy') + m * s * Math.sin(a * (Math.PI / 180))
        })
        .attr("class", function(d) { return d.chemical.substring(0, 4).toLowerCase() + ' sensor-' + d.monitor; })
        .attr("r", 3)

      })

  });

    // // Colour scales for contour plot
    // var i0 = d3.interpolateHsvLong(d3.hsv(120, 1, 0.65), d3.hsv(60, 1, 0.90)),
    //     i1 = d3.interpolateHsvLong(d3.hsv(60, 1, 0.90), d3.hsv(0, 0, 0.95)),
    //     interpolateTerrain = function(t) { return t < 0.5 ? i0(t * 2) : i1((t - 0.5) * 2); },
    //     color = d3.scaleSequential(interpolateTerrain).domain([90, 190]);

    // load in Location data

    // // D3 block for contour
    // svg.selectAll("path")
    //   .data(d3.contours()
    //       .size([volcano.width, volcano.height])
    //       .thresholds(d3.range(90, 195, 5))
    //     (volcano.values))
    //   .enter().append("path")
    //     .attr("d", d3.geoPath(d3.geoIdentity().scale(width / volcano.width)))
    //     .attr("fill", function(d) { return color(d.value); });

});