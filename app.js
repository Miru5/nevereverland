var express = require("express");
var app = express();
var router = express.Router();
var mongo = require('./model/mongo');
var MongoClient = require("mongodb").MongoClient
// Set up a URL route
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
