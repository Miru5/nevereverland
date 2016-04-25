var express = require("express");
var app = express();
var router = express.Router();
mongo = require('mongodb');
var mongoose = require('mongoose');
var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://heroku_tn8g3mwx@ds013340.mlab.com:13340/heroku_tn8g3mwx';
var MongoClient = mongo.MongoClient;

// var Schema = mongoose.Schema
//   , ObjectId = Schema.ObjectID;

// var User = new Schema({
//     username      : { type: String, required: true, trim: true }
//   , password       : { type: String, required: true, trim: true }
//   , email        : { type: String, required: true, trim: true }
//   , charclass         : { type: String, required: true, trim: true }
//   , firstLogin       : Number
// });

// mongoose.model( 'User', User );
// mongoose.connect(uristring);



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

app.get("/api/users", function(req, res) {
    MongoClient.connect(process.env.MONGOLAB_URI, {}, function(error, db){
var users = db.collection("Users");
    users.insert({username: "username", email: "email", password: "password", charclass:"none"});
                    res.send("ok");
  });
})


  

// bind the app to listen for connections on a specified port
var port = process.env.PORT || 3000;
app.listen(port);

// Render some console log output
console.log("Listening on port " + port);
