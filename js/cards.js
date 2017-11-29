$(document).ready(function () {

	d3.csv('/data/data.csv', function(data){

		c_data = d3.nest()
			.key(function(d) { return d.monitor + d.timestamp })
			.rollup(function(k) { return k.length })
			.entries(data)

		d_data = d3.nest()
			.key(function(d) { return d.chemical + d.timestamp })
			.rollup(function(k) { return k.length })
			.entries(data)

		fc_data = d3.nest()
			.key(function(d) { return d.chemical.substring(0, 4).toLowerCase() })
			.rollup(function(k) { return k.length })
			.entries(data.filter(function(d) { return +d.missing_sensor === 0 }))

		fs_data = d3.nest()
			.key(function(d) { return d.monitor })
			.rollup(function(k) { return k.length })
			.entries(data.filter(function(d) { return +d.missing_sensor === 0 }))

		for(f in fs_data){
			var percentage = 100 * fs_data[f].value / Object.keys(d_data).length
			percentage = percentage.toFixed(1) + '%'
			$('.performance-circle#sensor-' + fs_data[f].key + ' .circle-text').text(percentage)
		}

		for(f in fc_data){
			var percentage = 100 * fc_data[f].value / Object.keys(c_data).length
			percentage = percentage.toFixed(1) + '%'
			$('.performance-circle#sensor-' + fc_data[f].key + ' .circle-text').text(percentage)
		}

			console.log(c_data)
			console.log(fc_data)

		// console.log(Object.keys(d_data).length)

	})

})