

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
var URL = "mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx"

var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx';

var MongoClient = require("mongodb").MongoClient
var activeUsers = [];
var onlineUsers = [];
app.get("/hey",function(req,res){
    res.json({"message" : "Hey World!"});
});

  MongoClient.connect(URL, function(err, db) {
var users = db.collection("Users");
activeUsers = [];
  });

//add user
app.post('/api/add_user', function(req, res) {
    var username = req.param('username');
    var email = req.param('email');
    var password = req.param('password');
    var salt = bcrypt.genSaltSync(10);
    var hash = "hush";

    MongoClient.connect(URL, function(err, db) {
        var users = db.collection("Users")
         users.find({"email": email}).toArray(function (err, items) {
        users.find({"username": username}).toArray(function (err, items) {
            users.count({username: username}, function (err, count){
                if(count>0){
                    res.send("error");
                }
                else {
                    hash = bcrypt.hashSync(password, salt);
                    password = hash;
                  users.insert({username: username, email: email, password: password, charclass:"none", firstLogin:0,xp:10,lvl:1,status:"offline"});
                  res.send("ok");
                    }
                });
            });
        });
    })
})

//login
  app.get('/api/users', function (req, res) {
        var username = req.param('username');
        var password = req.param('password');
        var hash = "";
        var id = "this";
        activeUsers = [];
        MongoClient.connect(URL, function (err, db) {
            var users = db.collection("Users")

            //login
            users.find({"username": username}).toArray(function (err, items) {
                hash = items[0]["password"];
                id = items[0]["_id"]
                bcrypt.compare(password, hash, function (err, result) {
                    if (err == null) {
                        result === true
                    }

                    if (result) {
                        users.update({'_id' : new ObjectId(id)}, {$set: {status:"online"}});
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

    MongoClient.connect(URL, function(err, db) {
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

    MongoClient.connect(URL, function(err, db) {
        var users = db.collection("Users")
        doc = users.findOne({_id:id})
        users.update({'_id' : new ObjectId(id)}, {$set: {charclass:charClass,firstLogin:1}});
        res.send("ok");

    });
})

function ArrNoDupe(a) {
    var temp = {};
    for (var i = 0; i < a.length; i++)
        temp[a[i]] = true;
    var r = [];
    for (var k in temp)
        r.push(k);
    return r;
}

// get list of online users
app.get('/api/online-users', function(req, res) {
    MongoClient.connect("mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx", function (err, db) {
            var users = db.collection("Users")
            users.find({"status": "online"}).toArray(function (err, items) {
              res.contentType('application/json');
              for(var i = 0;i<items.length;i++)
              {
               activeUsers.push({"usr":items[i]["username"]})
              }
                });
              onlineUsers = ArrNoDupe(activeUsers);
              res.send(JSON.stringify(onlineUsers));
            });
        });

function removeByValue(arr, val) {
    for(var i=0; i<arr.length; i++) {
        if(arr[i] == val) {
            arr.splice(i, 1);
            break;
        }
    }
}

// send msg

 send = function (fromn,fromu,to,msg,callback) {
        MongoClient.connect(URL, function (err, db) {
            var users = db.collection("Users")
          users.find({"mobno": to}).toArray(function (err, items) {
 var reg_id = items[0]["reg_id"];
 request(
    { method: 'POST',
    uri: 'https://android.googleapis.com/gcm/send',
    headers: {
        'Content-Type': 'application/json',
        'Authorization':'AIzaSyBH-qEHaimY4Fg8Twsl_Uw24WLgvUrorL4'
    },
    body: JSON.stringify({
  "registration_ids" : reg_id,
  "data" : {
    "msg":msg,
    "fromu":fromu,
    "name":fromn
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

   app.post('/send',function(req,res){
        var fromu = req.body.from;
        var fromn = req.body.fromn;
            var to = req.body.to;
            var msg = req.body.msg;
 
 
        send(fromn,fromu,to,msg,function (found) {
            console.log(found);
            res.json(found);
    });
    });





app.post('/api/logout', function(req, res) {
var username = req.param('username');

    MongoClient.connect(URL, function(err, db) {
        var users = db.collection("Users")
        doc = users.findOne({username:username})
        users.update({'status':"offline"});
        removeByValue(activeUsers,username);
        res.send("ok");
    });
})



// bind the app to listen for connections on a specified port
var port = process.env.PORT || 3000;
app.listen(port);

// Render some console log output
console.log("Listening on port " + port);
