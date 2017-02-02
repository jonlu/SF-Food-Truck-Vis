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

csv
   .fromPath("foodpermits.csv", {headers: true})
   .transform(function(data){
     return {
       "Latitude": data.Latitude,
       "Longitude" : data.Longitude
     }
   })
   .pipe(csv.createWriteStream({headers: true}))
   .pipe(fs.createWriteStream("out3.csv", {encoding: "utf8"}));
