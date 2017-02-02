var width = 800,
    height = 580;

var projection = d3.geoMercator()

var geoPath = d3.geoPath()
    .projection( projection );
document.addEventListener('DOMContentLoaded', function (event) {

  var body = d3.select("body");
  var svg = d3.select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  var div = body.append("div");
  //
  d3.json('http://localhost:80/geojson.geojson',
  function(error, data) {
    if (error) return console.error(error);
    svg.append("g")
       .selectAll("path")
       .data(data.features)
       .enter()
         .append("path")
         .attr("fill", "red")
         .attr("stroke", "#999")
         .attr("d", geoPath);
    console.log(data[2]);
  });
  div.html("Hello World!");


  // var map = L.mapbox.map('map', 'fcc.map-toolde8w')
	// 	.setView([40, -94.50], 4);
  // d3.json('http://localhost:80/geojson.geojson', function(error, data) {
  //   if (error) return console.error(error);
  //   L.geoJson(data).addTo(map);
  // });
});
