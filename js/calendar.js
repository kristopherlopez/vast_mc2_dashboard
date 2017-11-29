$(document).ready(function () {

	d3.csv('/data/data.csv', function(data){
		// console.log(data[0])

		var w = $(window).width() * 0.125,
			h = $(window).width() * 0.125

		data = data.filter(function(d) { return +d.missing_sensor === 0})

		var svg = d3.select("#april")
			.append("svg")
			.attr("width", w)
			.attr("height", h)
			.attr("class", "calendar-filter")

		createCalendar(4, svg, data)

		var svg = d3.select("#august")
			.append("svg")
			.attr("width", w)
			.attr("height", h)
			.attr("class", "calendar-filter")

		createCalendar(8, svg, data)

		var svg = d3.select("#december")
			.append("svg")
				.attr("width", w)
				.attr("height", h)
				.attr("class", "calendar-filter")

		createCalendar(12, svg, data)

	})
})

createCalendar = function(m, svg, data) {

	var textDays = [{'value': 'Mo'}, {'value': 'Tu'}, {'value': 'We'}, {'value': 'Th'}, {'value': 'Fr'}, {'value': 'Sa'}, {'value': 'Su'}]

	function getNewDay(oldDay){
    	if(oldDay === 0) return 6
    	if(oldDay !== 0) return oldDay - 1
    }

	Date.prototype.getWeekOfMonth = function(exact) {
        var month = this.getMonth()
            , year = this.getFullYear()
            , firstWeekday = getNewDay(new Date(year, month, 1).getDay())
            , lastDateOfMonth = new Date(year, month + 1, 0).getDate()
            , offsetDate = this.getDate() + firstWeekday - 1
            , index = 1 // start index at 0 or 1, your choice
            , weeksInMonth = index + Math.ceil((lastDateOfMonth + firstWeekday - 7) / 7)
            , week = index + Math.floor(offsetDate / 7)
        return week;
    };

    var parseDate = d3.timeParse("%d/%m/%Y")

	var w = $(window).width() * 0.1,
    	h = $(window).width() * 0.1,
    	py = $(window).width() * 0.01
    	ty = $(window).height() * 0.02
    	f = $(window).height() * 0.02

	var nest = d3.nest()
		.key(function(d) { return d.month })
		.key(function(d) { return d.date })
		.rollup(function(v) { return d3.sum(v, function(d) { return +d.reading}) })
		.entries(data)	

	nest = nest.filter(function(d) { return +d.key === m })

	min_value = d3.min(nest[0].values, function(d) { return d.value })
	max_value = d3.max(nest[0].values, function(d) { return d.value })

	var tooltip = d3.select("body").append("div")	
	    .attr("class", "tooltip")				
	    .style("opacity", 0);

	colour = d3.scaleLinear().domain([min_value, max_value])
		.interpolate(d3.interpolateHcl)
		.range([d3.rgb("#FFFFFF"), d3.rgb('#424242')])

	var cell = svg.selectAll("g")
		.data(nest)
		.enter().append("svg:g")

	var rect = cell.selectAll("rect")
		.data( function(d) { return d.values; })
		.enter().append("svg:rect")
		    .attr("width", w / 7)
		    .attr("height", h / 7)
			.attr("x", function(d, i) {	return getNewDay(parseDate(d.key).getDay()) * w / 7; })
			.attr("y", function(d, i) { return parseDate(d.key).getWeekOfMonth() * h / 7; })
			.attr("class", function(d, i) {	return d.key })
			.attr("fill", function(d) { return colour(d.value)})
			.attr("stroke", "#424242")
			.attr("stroke-width", "1px")
			.on("mouseover", function(d) {	
	            tooltip.transition()		
	                .duration(200)		
	                .style("opacity", .9);		
	            tooltip.html(d.key + "<br/>"  + d.value.toFixed(2))	
	                .style("left", (d3.event.pageX) + "px")		
	                .style("top", (d3.event.pageY - py) + "px");	
	            })					
	        .on("mouseout", function(d) {		
	            tooltip.transition()		
	                .duration(500)	
	                .style("opacity", 0);	
	        });

	var text = cell.selectAll("text")
	    .data(textDays)
	    .enter().append("text")
	    	.attr("x", function(d, i) { return i * w / 7 + 5 })
	    	.attr("y", ty)
	    	.text(function(d) { return d.value} )
	    	.style("color", "#424242")
	    	.style("font-size", f)
	    	.style("font-family", 'Satisfy')

}

filterCalendar = function(m, svg, data){


}