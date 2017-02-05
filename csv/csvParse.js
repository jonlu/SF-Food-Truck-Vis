var csv = require('fast-csv');
var fs = require('fs');

// var stream = fs.createReadStream("2entries.csv");
// var csvStream = csv
//     .fromStream(stream, {headers: true})
//     .on("data", function(data){
//          console.log(data);
//     })
//     .on("end", function(){
//          console.log("done");
//     });
//
// stream.pipe(csvStream);
var top20=["Sandwiches", "Drinks", "Cold Truck", "Candy", "Snacks", "Hot Dogs", "Burritos", "Chips", "Fruit","Burgers", "Soda", "Coffee","Tacos","Cookies", "Fries","Water","Muffins","Melts", "Onion Rings", "Juice",
           "Yogurt", "Cup Of Noodles", "Salads", "Pre-packaged Snacks", "Milk" ]
csv
  .fromPath("foodpermits.csv", { headers: true })
  //  .transform(function(data){
  //    return {
  //      "Latitude": data.Latitude,
  //      "Longitude" : data.Longitude
  //    }
  //  })
  .transform(function(d) {
    var count = 0;
    /******** Parse popular Foods *******/
    var tokens = d.FoodItems.split(":");
    tokens.forEach (function(t) {
      t = t.trim();
      t = t.charAt(0).toUpperCase() + t.slice(1);
      if (top20.indexOf(t) > -1) {
        count++;
      }
    });
    return {
      "Popularity": count,
      "Latitude": d.Latitude,
      "Longitude" : d.Longitude,
      "Applicant" : d.Applicant
    }

  })
  .pipe(csv.createWriteStream({ headers: true }))
  .pipe(fs.createWriteStream("geo.csv", { encoding: "utf8" }));
