/**
 * Module dependencies.
 */
// var express  = require('express');
// var connect = require('connect');
// var app      = express();
// var port     = process.env.PORT || 8080;
 
// // Configuration
// app.use(express.static(__dirname + '/public'));
// app.use(connect.logger('dev'));
// app.use(connect.json());
// app.use(connect.urlencoded());
 
// // Routes
 
// require('./routes/routes.js')(app);
 
// app.listen(port);
 
// console.log('The App runs on port ' + port);


var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var router = express.Router();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));
var mongo = require('./model/mongo');
var port = process.env.PORT || 8080;
var router = express.Router();
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
mongo = require('mongodb');
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var request = require('request');
var GCM = require('./gcm');
var gcm = new GCM("AIzaSyBH-qEHaimY4Fg8Twsl_Uw24WLgvUrorL4");

var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx';

var MongoClient = require("mongodb").MongoClient
var activeUsers = [];
app.get("/hey",function(req,res){
    res.json({"message" : "Hey World!"});
});

  MongoClient.connect("mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx", function(err, db) {
var users = db.collection("Users");
activeUsers = [];
  });

//add user
app.post('/api/add_user', function(req, res) {
    var name = req.param('name');
    var mobno = req.param('mobno');
    var reg_id = req.param('reg_id');
    // var salt = bcrypt.genSaltSync(10);
    // var hash = "hush";

    MongoClient.connect("mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx", function(err, db) {
        var users = db.collection("Users")
        // users.find({"email": email}).toArray(function (err, items) {
        users.find({"name": name}).toArray(function (err, items) {
            users.count({name: name}, function (err, count){
                if(count>0){
                    res.send("error");
                }
                else {

                 //   users.insert({username: username, email: email, password: password, charclass:"none", firstLogin:0, reg_id:"none",xp:10,lvl:1});
                  users.insert({name: name,mobno:mobno,reg_id:reg_id});
                  res.send("ok");
                }
            });


        });
    });
})

//login
  app.get('/api/users', function (req, res) {
        var username = req.param('username');
        var password = req.param('password');
        var hash = "";
        MongoClient.connect("mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx", function (err, db) {
            var users = db.collection("Users")

            //login
            users.find({"username": username}).toArray(function (err, items) {
                hash = items[0]["password"];
                bcrypt.compare(password, hash, function (err, result) {
                    if (err == null) {
                        result === true
                    }

                    if (result) {
                        activeUsers.push({"usr": items[0]["username"]})
                        res.send(items);
                    }
                    else
                    {
                        res.send("error");
                    }
                });
            });
        });
    })

//set reg id
app.post('/api/setID', function(req, res) {
    var id = req.param('id');
    var regID = req.param('regID');

    MongoClient.connect("mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx", function(err, db) {
        var users = db.collection("Users")
        doc = users.findOne({_id:id})
        users.update({'_id' : new ObjectId(id)}, {$set: {reg_id:regID}});
        res.send("ok");
    });
})


//set class
app.post('/api/set-class', function(req, res) {
    var id = req.param('id');
    var charClass = req.param('charClass');

    MongoClient.connect("mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx", function(err, db) {
        var users = db.collection("Users")
        doc = users.findOne({_id:id})
        users.update({'_id' : new ObjectId(id)}, {$set: {charclass:charClass,firstLogin:1}});
        res.send("ok");

    });
})

// get list of online users
app.get('/api/online-users', function(req, res) {
res.contentType('application/json');
res.send(JSON.stringify(activeUsers));
})

function removeByValue(arr, val) {
    for(var i=0; i<arr.length; i++) {
        if(arr[i] == val) {
            arr.splice(i, 1);
            break;
        }
    }
}

// send msg

 send = function (from, to, msg, callback) {
        MongoClient.connect("mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx", function (err, db) {
            var users = db.collection("Users")
            users.find({"username": to}).toArray(function (err, items) {
                var reg_id = items[0]["reg_id"];
                request(
                    {
                        method: 'POST',
                        uri: 'https://android.googleapis.com/gcm/send',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'AIzaSyBH-qEHaimY4Fg8Twsl_Uw24WLgvUrorL4'
                        },
                        body: JSON.stringify({
                            "registration_ids": reg_id,
                            "data": {
                                "message": "mere",
                                "fromu": from
                            },
                            "time_to_live": 108
                        })
                    }

                    , function (error, response, body) {

                        callback({'response': "Success"});
                    }
                )
            })
        })
    }

    app.post('/api/send', function (req, res) {
        var from = req.param('username');
        var to = req.param('friend');
        var msg = req.param('message');
        send(from, to, msg, function (found) {
            console.log(found);
            res.json(found);
        });
    })


function removeByValue(arr,name){
    for(var i = 0; i < arr.length; i++) {
        if(arr[i].usr == name) {
            arr.splice(i, 1);
            break;
        }
    }
}


app.post('/api/logout', function(req, res) {
var username = req.param('username');
  removeByValue(activeUsers,username);
    res.contentType('application/json');
    res.send(JSON.stringify(activeUsers));
})


// bind the app to listen for connections on a specified port
var port = process.env.PORT || 3000;
app.listen(port);

// Render some console log output
console.log("Listening on port " + port);
