var express = require("express");
var app = express();
var router = express.Router();
// var mongo = require('./model/mongo');
// var MongoClient = require("mongodb").MongoClient
// Set up a URL route

mongo.connect("mongodb://heroku_tn8g3mwx@ds013340.mlab.com:13340/heroku_tn8g3mwx", {}, function(error, db){

  // console.log will write to the heroku log which can be accessed via the 
  // command line as "heroku logs"
  db.addListener("error", function(error){
    console.log("Error connecting to MongoLab");
  });
  
app.get("/hey",function(req,res){
    res.json({"message" : "Hey World!"});
});

app.get("/", function(req, res) {
  res.json({"message" : "Hey World!"});
});

app.get('/api/users', function(req, res) {
    var username = req.param('username');
    var password = req.param('password');
    var a = " ";
    var hash = "";
    MongoClient.connect("mongodb://heroku_tn8g3mwx@ds013340.mlab.com:13340/heroku_tn8g3mwx", function(err, db) {
        var users = db.collection("users")

        //login
        users.find({"username":username}).toArray(function (err, items) {
        hash = items[0]["password"];
            bcrypt.compare(password, hash, function(err, result) {
                if(err==null){
                    result === true
                }
               
                if(result){

                    activeUsers.push({"usr":items[0]["username"]})
                    res.send(items);
                }
            });
            // users.count({username:username}, function (err, count){
            //     if(count>0){
            //         res.send(items);
            //     }
            //     else {
            //        res.send("error");
            //     }
            // });


        });
    });
})

// bind the app to listen for connections on a specified port
var port = process.env.PORT || 3000;
app.listen(port);

// Render some console log output
console.log("Listening on port " + port);
