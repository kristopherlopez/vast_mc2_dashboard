$(document).ready(function () { 

  $(".sensor-button").click(function () {

    var name = $(this).attr("id");
    name = name.replace(' ', '-').toLowerCase()
    var sensor_no = +name.replace('sensor-', '')
    var svg = d3.select('.svg-page-1')
    
    if(name.substring(0,6).toLowerCase() === 'sensor'){ 

      var circle = $('#b-' + name.replace('sensor-', ''))

      var cx = circle.attr("cx"),
          cy = circle.attr("cy"),
          r = +circle.css("r").replace('px','')

      var 
        dx = r * 2,
        dy = r * 2,
        x = cx,
        y = cy,
        width = $('.svg-page-1').width(),
        height = $('.svg-page-1').height(),
        scale = Math.max(1, Math.min(8, 0.825 / Math.max(dx / width, dy / height))),
        translate = [ (width / 2 - x) * scale, (height / 2 - y) * scale ];

      for (var i = 1; i <= 9; i++){ 

          if(i !== sensor_no){ $('.sensor-button#sensor-' + i).removeClass('clicked') }
          else if( $(this).hasClass('clicked')) {
            scale = 1 
            translate = [0, 0] 
          }
      } 

      function zoomed() { svg.attr("transform", d3.event.transform); }

      var zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

      svg.call(zoom)
        .on("mousedown.zoom", null)
        .on("touchstart.zoom", null)
        .on("touchmove.zoom", null)
        .on("touchend.zoom", null);

      svg.transition()
        .duration(750)
        .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) ); 

      } else {

        svg.selectAll("circle." + name)
        .classed('grey', function (d, i) {
          return !d3.select(this).classed('grey');
        });        

      }

    $(this).hasClass('clicked') ? $(this).removeClass('clicked') : $(this).addClass('clicked')

  });

  f = Math.round($(window).height() * 0.0175)

  $(".sensor-button").css({ 'font-size': f });
  $(".chem-button").css({ 'font-size': f });
  $(".date-filter").css({ 'font-size': f * 2 });

  $(".chem-button").click(function () {

    var svg = d3.select('.svg-page-1')
    var name = $(this).attr("id").substring(0, 4).toLowerCase(),
        chem = ['agoc', 'appl', 'chlo', 'meth']

    for (c in chem) { 

      if(name !== chem[c]) {

        var grey = true
        if($(this).hasClass('clicked')) { grey = false }
        $('.chem-button#' + chem[c]).removeClass('clicked') 
        svg.selectAll("circle." + chem[c]).classed('grey', grey);

      } 
      else {

          svg.selectAll("circle." + chem[c]).classed('grey', false);

      }
    }

    $(this).hasClass('clicked') ? $(this).removeClass('clicked') : $(this).addClass('clicked')

  });

})


