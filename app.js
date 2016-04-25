var express = require("express");
var app = express();
var router = express.Router();
mongo = require('mongodb');
var mongoose = require('mongoose');
var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx';

var MongoClient = require("mongodb").MongoClient

app.get("/hey",function(req,res){
    res.json({"message" : "Hey World!"});
});

app.get("/api/users", function(req, res) {
    MongoClient.connect("mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx" , function(err, db) {
    var users = db.collection("Users")
    //login
    users.find({"username": "xmy"}).toArray(function (err, items) {
        res.send(items);
        });
    });
})



  

// bind the app to listen for connections on a specified port
var port = process.env.PORT || 3000;
app.listen(port);

// Render some console log output
console.log("Listening on port " + port);
