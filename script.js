String.prototype.capitalize = function () {
  return this.replace(/(?:^|\s)\S/g, function (a) {
    return a.toUpperCase();
  });
};

document.addEventListener('DOMContentLoaded', function (event) {

  var foodMap = {};
  var approval = {
    "Truck": {
      "Approved": 1,
      "Expired": 1
    },
    "Push Cart": {
      "Approved": 1,
      "Expired": 1
    }
  };

  /********* Approval ********/
  var truckSvg = d3.select("#trucksApproval").append("svg")
    .attr("width", 250)
    .attr("height", 250);
  var cartSvg = d3.select("#cartsApproval").append("svg")
    .attr("width", 250)
    .attr("height", 250);
  var truckTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function (d) { return d + ": " + approval.Truck[d] });
  var cartTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function (d) { return d + ": " + approval["Push Cart"][d] });
  truckSvg.call(truckTip);
  cartSvg.call(cartTip);
  /********** BAR CHART ***********/
  var margin = { top: 20, right: 20, bottom: 120, left: 40 },
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
  var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().range([height, 0]);
  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y).ticks(10);
  var barTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function (d) { return d; });
  var svg = d3.select("#barChart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  svg.call(barTip);
  /**********************************/


  d3.csv('http://localhost:80/foodpermits.csv', function (error, data) {
    if (error) {
      return console.log(error);
    }

    data.forEach(function (d) {
      /******** Parse approval % **********/
      if (d.FacilityType == "Truck") {
        d.Status == "APPROVED" ? approval.Truck.Approved++ : approval.Truck.Expired++;
      } else {
        d.Status == "APPROVED" ? approval["Push Cart"].Approved++ : approval["Push Cart"].Expired++;
      }
      /******** Parse popular Foods *******/
      var tokens = d.FoodItems.split(":");
      for (var i = 0; i < tokens.length; i++) {
        tokens[i] = tokens[i].trim();
        tokens[i] = tokens[i].capitalize();
        var sw = "Sandwiches"
        if (tokens[i].includes("Sandwiches") || tokens[i].includes("Sandwich")) {
          sw in foodMap ? foodMap[sw]++ : foodMap[sw] = 1;
        } else if (tokens[i].includes("Drinks") || tokens[i].includes("Beverages")) {
          "Drinks" in foodMap ? foodMap["Drinks"]++ : foodMap["Drinks"] = 1;
        } else if (tokens[i] in foodMap) {
          foodMap[tokens[i]]++;
        } else {
          foodMap[tokens[i]] = 1;
        }
      }
    });

    /********** Approval ******/
    truckSvg.selectAll("circle")
      .data(d3.keys(approval.Truck))
      .enter()
      .append("circle")
      .attr("cx", 125)
      .attr("cy", 125)

      .on('mouseover', truckTip.show)
      .on('mouseout', truckTip.hide)
      .style("fill", function (d) {
        var returnColor;
        if (d == "Approved") {
          returnColor = "rgb(124, 233, 255)";
        } else if (d == "Expired") {
          returnColor = "orange";
        }
        return returnColor;
      })
      .transition()
      .delay(800)
      .duration(600)
      .attr("r", function (d) { return Math.round((approval.Truck[d] / 480) * 125); });
    cartSvg.selectAll("circle")
      .data(d3.keys(approval["Push Cart"]))
      .enter()
      .append("circle")
      .attr("cx", 125)
      .attr("cy", 125)
      .on('mouseover', cartTip.show)
      .on('mouseout', cartTip.hide)
      .style("fill", function (d) {
        var returnColor;
        if (d == "Approved") {
          returnColor = "rgb(124, 233, 255)";
        } else if (d == "Expired") {
          returnColor = "orange";
        }
        return returnColor;
      })
      .transition()
      .delay(500)
      .duration(600)
      .attr("r", function (d) { return Math.round((approval["Push Cart"][d] / 480) * 125); });
    /********************************/


    /********** BAR CHART ***********/

    /******* CODE TO TURN DICT INTO SORTED ARRAY ********/
    //source: http://stackoverflow.com/questions/25500316/sort-a-dictionary-by-value-in-javascript
    var foodArray = Object.keys(foodMap).map(function (key) {
      return [key, foodMap[key]];
    });

    // Sort the array based on the second element
    foodArray.sort(function (first, second) {
      return second[1] - first[1];
    });

    foodArray = foodArray.slice(0, 25);
    /***************************************************/

    x.domain(foodArray.map(function (d) { return d[0] }));
    y.domain([0, d3.max(foodArray, function (d) { return d[1]; })]);
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-50)");

    svg.append("g")
      .attr("class", "axis axis--y")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Frequency");
    svg.selectAll(".bar")
      .data(foodArray)
      .enter().append("rect")
      .attr("x", function (d) { return x(d[0]); })
      .attr("y", function (d) { return y(d[1]); })
      .attr("width", x.bandwidth())
      .attr("height", function (d) { return height - y(d[1]); })
      .attr("fill", function (d) {
        return "rgb(124, 233, " + Math.round((d[1] / 400) * 255) + ")";
      })
      .on('mouseover', function (d) {
        barTip.show(d);
        d3.select(this)
          .attr('fill', 'orange');
      })

      .on('mouseout', function (d) {
        barTip.hide(d);
        d3.select(this)
          .transition()
          .duration(250)
          .attr("fill", "rgb(124, 233, " + Math.round((d[1] / 400) * 255) + ")");
      });
    /**********************************/
  });


  /************ MAP *************/
  //super secret access token necessary for viewing the map!
  //please don't share or use!
  mapboxgl.accessToken = 'pk.eyJ1Ijoiam9ubHUiLCJhIjoiY2l5bWdmYjlxMDAwZjQ0czdtYmNwYXQwNyJ9.PXRqPMmzNofQx4FYKMmJ_A';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [-122.44, 37.7749],
    minZoom: 8.5,
    maxZoom: 16,
    zoom: 11.5,
    attributionControl: false,
    scrollZoom: false
  });
  var nav = new mapboxgl.NavigationControl();
  map.addControl(nav, 'top-left');
  map.addControl(new mapboxgl.AttributionControl({
    compact: true
  }));
  d3.json('http://localhost:80/geojson.geojson', function (error, data) {
    if (error) return console.error(error);
    map.on('style.load', function () {
      map.addSource("trucks", {
        "type": "geojson",
        "data": data
      });
      map.addLayer({
        'id': 'trucksLayer',
        'source': 'trucks',
        'type': 'circle',
        'paint': {
          'circle-radius': {
            'base': 1.57,
            'stops': [
              [12, 3.5],
              [22, 180]
            ]
          },
          'circle-color': 'red',
          'circle-stroke-width': 1,
          'circle-stroke-color': "#FFF"
        }
      });
    });
  });
});
