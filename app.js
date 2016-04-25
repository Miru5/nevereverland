var express = require("express");
var app = express();
var router = express.Router();
mongo = require('mongodb');
var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://heroku_tn8g3mwx@ds013340.mlab.com:13340/heroku_tn8g3mwx';
// var mongo = require('./model/mongo');
// var MongoClient = require("mongodb").MongoClient
// Set up a URL route





// mongo.connect(uristring, {}, function(error, db){
// var users = db.collection("Users");
// users.find({"username":"xmy"}).toArray(function (err, items) {
//         hash = items[0]["password"];
//         res.send(hash);
//   });

  // console.log will write to the heroku log which can be accessed via the 
  // command line as "heroku logs"
//   db.addListener("error", function(error){
//     console.log("Error connecting to MongoLab");
//   });
// });


app.get("/hey",function(req,res){
    res.json({"message" : "Hey World!"});
});

app.get("/", function(req, res) {
  res.json({"message" : "Hey World!"});
});


  

// bind the app to listen for connections on a specified port
var port = process.env.PORT || 3000;
app.listen(port);

// Render some console log output
console.log("Listening on port " + port);
