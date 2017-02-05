String.prototype.capitalize = function() {
  return this.replace(/(?:^|\s)\S/g, function(a) {
    return a.toUpperCase();
  });
};
var foodArray = [];
document.addEventListener('DOMContentLoaded', function(event) {

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
    .attr("width", 300)
    .attr("height", 300);
  var cartSvg = d3.select("#cartsApproval").append("svg")
    .attr("width", 300)
    .attr("height", 300);
  var truckTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d) { return d + ": " + approval.Truck[d] });
  var cartTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d) { return d + ": " + approval["Push Cart"][d] });
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
    .html(function(d) { return d; });
  var svg = d3.select("#barChart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  svg.call(barTip);
  /**********************************/

  /*********** PIE CHART ************/
  var truckFoods = {};
  var cartFoods = {};
  // var pieColor = d3.scaleOrdinal()
  //   .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
  // var pieColor = d3.interpolateCool();
  var truckPieColor = d3.scaleLinear()
    .domain([50, 600])
    .range(["rgb(124, 233, 90)", "rgb(124, 233, 255)"])
    .interpolate(d3.interpolateHcl);
  var cartPieColor = d3.scaleLinear()
    .domain([9, 22])
    .range(["rgb(124, 233, 90)", "rgb(124, 233, 255)"])
    .interpolate(d3.interpolateHcl);
  var pie = d3.pie()
    // .sortValues(function(a,b) {return a < b})
    .sort(null)
    .value(function(d) { return d[1] });
  var arc = d3.arc()
    .outerRadius(150)
    .innerRadius(70);

  var truckPie = d3.select("#truckPie")
    .append("svg")
    .attr("width", 300)
    .attr("height", 300)
    .append("g")
    .attr("transform", "translate(150, 150)"); //where 150 is half of width/height;
  var truckPieTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d) { return d.data[0] + ", " + d.data[1] });
  truckPie.call(truckPieTip);
  var cartPie = d3.select("#cartPie")
    .append("svg")
    .attr("width", 300)
    .attr("height", 300)
    .append("g")
    .attr("transform", "translate(150, 150)"); //where 150 is half of width/height;
  var cartPieTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d) { return d.data[0] + ", " + d.data[1] });
  cartPie.call(cartPieTip);
  /**********************************/

  d3.csv('http://localhost:80/foodpermits.csv', function(error, data) {
    if (error) {
      return console.log(error);
    }

    data.forEach(function(d) {
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
        /******** BAR CHART ***************/
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
        /**********************************/

        /********** PIE CHART *************/
        if (d.FacilityType == "Truck") {
          var sw = "Sandwiches";
          if (tokens[i].includes("Sandwiches") || tokens[i].includes("Sandwich")) {
            sw in truckFoods ? truckFoods[sw]++ : truckFoods[sw] = 1;
          } else if (tokens[i].includes("Drinks") || tokens[i].includes("Beverages")) {
            "Drinks" in truckFoods ? truckFoods["Drinks"]++ : truckFoods["Drinks"] = 1;
          } else if (tokens[i] in truckFoods) {
            truckFoods[tokens[i]]++;
          } else {
            truckFoods[tokens[i]] = 1;
          }
        } else {
          if (tokens[i] in cartFoods) {
            cartFoods[tokens[i]]++;
          } else {
            cartFoods[tokens[i]] = 1;
          }
        }
        /**********************************/

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
      .style("fill", function(d) {
        var returnColor;
        if (d == "Approved") {
          returnColor = "rgb(124, 233, 255)";
        } else if (d == "Expired") {
          returnColor = "orange";
        }
        return returnColor;
      })
      .transition()
      .delay(400)
      .duration(600)
      .attr("r", function(d) { return Math.round((approval.Truck[d] / 480) * 125); });
    truckSvg.append("text")
      .attr("transform", "translate(-39)")
      .attr("font-weight", "800")
      .attr("font-size", "12px")
      .style("text-transform", "uppercase")
      .attr("dy", "300px")
      .attr("dx", "125px")
      .text("Food Trucks")
    cartSvg.selectAll("circle")
      .data(d3.keys(approval["Push Cart"]))
      .enter()
      .append("circle")
      .attr("cx", 125)
      .attr("cy", 125)
      .on('mouseover', cartTip.show)
      .on('mouseout', cartTip.hide)
      .style("fill", function(d) {
        var returnColor;
        if (d == "Approved") {
          returnColor = "rgb(124, 233, 255)";
        } else if (d == "Expired") {
          returnColor = "orange";
        }
        return returnColor;
      })
      .transition()
      .delay(300)
      .duration(600)
      .attr("r", function(d) { return Math.round((approval["Push Cart"][d] / 480) * 125); });
    cartSvg.append("text")
      .attr("transform", "translate(-37)")
      .attr("font-weight", "800")
      .attr("font-size", "12px")
      .style("text-transform", "uppercase")
      .attr("dy", "300px")
      .attr("dx", "125px")
      .text("Push Carts")
    /********************************/


    /********** BAR CHART ***********/

    /******* CODE TO TURN DICT INTO SORTED ARRAY ********/
    //source: http://stackoverflow.com/questions/25500316/sort-a-dictionary-by-value-in-javascript
    foodArray = Object.keys(foodMap).map(function(key) {
      return [key, foodMap[key]];
    });

    // Sort the array based on the second element
    foodArray.sort(function(first, second) {
      return second[1] - first[1];
    });

    foodArray = foodArray.slice(0, 25);
    /***************************************************/

    x.domain(foodArray.map(function(d) { return d[0] }));
    y.domain([0, d3.max(foodArray, function(d) { return d[1]; })]);
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
      .attr("x", function(d) { return x(d[0]); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d[1]); })
      .attr("fill", function(d) {
        return "rgb(124, 233, " + Math.round(50 + (d[1] / 200) * 155) + ")";
      })
      .on('mouseover', function(d) {
        barTip.show(d);
        d3.select(this)
          .attr('fill', 'orange');
      })

      .on('mouseout', function(d) {
        barTip.hide(d);
        d3.select(this)
          .transition()
          .duration(250)
          .attr("fill", "rgb(124, 233, " + Math.round(50 + (d[1] / 200) * 155) + ")");
      });
    /**********************************/

    /********** PIE CHART *************/
    var truckFoodArray = Object.keys(truckFoods).map(function(key) {
      return [key, truckFoods[key]];
    });
    var cartFoodArray = Object.keys(cartFoods).map(function(key) {
      return [key, cartFoods[key]];
    });

    // Sort the array based on the second element
    truckFoodArray.sort(function(first, second) {
      return second[1] - first[1];
    });
    cartFoodArray.sort(function(first, second) {
      return second[1] - first[1];
    });

    truckFoodArray = truckFoodArray.slice(0, 20);
    cartFoodArray = cartFoodArray.slice(0, 20);

    var tp = truckPie.selectAll(".arc")
      .data(pie(truckFoodArray))
      .enter().append("g")
      .attr("class", "arc");
    tp.append("path")
      .attr("d", arc)
      .style("stroke", "white")
      .style("fill", function(d) {
        return truckPieColor(d.value)
      })
      .on('mouseover', function(d) {
        truckPieTip.show(d);
        d3.select(this)
          .style('fill', 'orange');
      })
      .on('mouseout', function(d) {
        truckPieTip.hide(d);
        d3.select(this)
        .transition()
        .duration(250)
          .style("fill", function(d) {
            return truckPieColor(d.value)
          });
      });
    tp.append("text")
      .attr("transform", "translate(-43)")
      .attr("dy", ".35em")
      .attr("font-weight", "500")
      .attr("font-size", "12px")
      .style("text-transform", "uppercase")
      .text("Food Trucks")

    var cp = cartPie.selectAll(".arc")
      .data(pie(cartFoodArray))
      .enter().append("g")
      .attr("class", "arc");

    cp.append("path")
      .attr("d", arc)
      .style("stroke", "white")
      .style("fill", function(d) {
        return cartPieColor(d.value)
      })
      .on('mouseover', function(d) {
        cartPieTip.show(d);
        d3.select(this)
          .style('fill', 'orange');
      })
      .on('mouseout', function(d) {
        cartPieTip.hide(d);
        d3.select(this)
        .transition()
        .duration(250)
          .style("fill", function(d) {
            return cartPieColor(d.value)
          });
      });


    cp.append("text")
      .attr("transform", "translate(-43)")
      .attr("dy", ".35em")
      .attr("font-weight", "500")
      .attr("font-size", "12px")
      .style("text-transform", "uppercase")
      .text("Push Carts")
    /**********************************/
  foodArray.forEach(function (d) {
    console.log(d);
  });
  });


  /************ MAP *************/
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
  d3.json('http://localhost:80/geo.geojson', function(error, data) {
    if (error) return console.error(error);
    map.on('style.load', function() {
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
          'circle-color': {
            property: 'Popularity',
            stops: [
              [0, 'orange'],
              [10, 'rgb(50,90,255)']
            ]

          },
          'circle-stroke-width': 1,
          'circle-stroke-color': "#FFF"
        }
      });
    });
  });
});
