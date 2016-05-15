require('newrelic');
var gcm = require('android-gcm');
var gcmObject = new gcm.AndroidGcm('AIzaSyBH-qEHaimY4Fg8Twsl_Uw24WLgvUrorL4');
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var router = express.Router();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));
var port = process.env.PORT || 8080;
var router = express.Router();
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
mongo = require('mongodb');
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var request = require('request');
var GCM = require('./gcm');
//var gcm = new GCM("AIzaSyBH-qEHaimY4Fg8Twsl_Uw24WLgvUrorL4");
var URL = "mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx"

var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx';

var MongoClient = require("mongodb").MongoClient
var activeUsers = [];
var allMessages = [];
var db;
app.get("/hey",function(req,res){
    res.json({"message" : "Hey World!"});
});


MongoClient.connect("mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx", function(err, database) {
  if(err) throw err;
  db = database;
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
                  users.insert({reg_id:"none",username: username, email: email, password: password, charclass:"none", firstLogin:0,xp:10,lvl:1,status:"offline"});
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
        
        MongoClient.connect(URL, function (err, db) {
            var users = db.collection("Users")

            //login
            users.find({"username": username}).toArray(function (err, items) {
                   users.count({username: username}, function (err, count){
                if(count>0){
                      hash = items[0]["password"];
                id = items[0]["_id"]
                
                bcrypt.compare(password, hash, function (err, result) {
                    if (err == null) {
                        result === true
                    }

                    if (result) {
                        res.send(items);
                    }
                    else
                    {
                        res.send("error");
                    }
                });
                }
                else {
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


app.post('/api/status', function(req, res) {
    var id = req.param('id');
    MongoClient.connect(URL, function(err, db) {
        var users = db.collection("Users")
          users.update({'_id' : new ObjectId(id)}, {$set: {status:"online"}});
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
            var users = db.collection("Users")
            activeUsers = [];
            users.find({"status":"online"}).toArray(function (err, items) {
              res.contentType('application/json');
              for(var i = 0;i<items.length;i++)
              {
               activeUsers.push({"usr":items[i]["username"]})
              }
              res.send(JSON.stringify(activeUsers));
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

 send = function(from,to,msg,date,callback){

    MongoClient.connect("mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx", function (err, db) {
        var users = db.collection("Users")
             var convos = db.collection("Convos")
                  convos.insert({player1:from,player2:to,text:msg,date:date});
        users.find({"username": to}).toArray(function (err, items) {
            users.count({username: to}, function (err, count) {
                if (count > 0) {
                    var r_id = items[0]["reg_id"]
                    var message = new gcm.Message({
                        registration_ids: [r_id],
                        data: {
                            key1: from,
                            key2: msg
                        }
                    });
                    console.log(message);
                    gcmObject.send(message, function (err, response) {
                        if(err==null){
                            callback({'response': "Success"});
                        }
                    });
                }
                else {
                    res.send("error");
                }

            });

        });

    })
}

app.post('/api/sendgcm',function(req,res) {
    var from = req.param('player1');
    var to = req.param('player2');
    var msg = req.param('text');
    var date = req.param('date');

    send(from,to,msg,date,function (found) {
        console.log(found);
        res.json(found);
    });
})

app.post('/api/send', function(req, res) {
    var player1 = req.param('player1');
    var player2 = req.param('player2');
    var text = req.param('text');
    var date = req.param('date');
    
   
    MongoClient.connect("mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx", function(err, db) {
        var convos = db.collection("Convos")
                  convos.insert({player1:player1,player2:player2, text: text,date:date});
                  res.send("ok");
    })
})


app.get('/api/convos', function(req, res) {
    MongoClient.connect("mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx", function (err, db) {
        var convos = db.collection("Convos")
        var player1 = req.param('player1');
        var player2 = req.param('player2');
        allMessages = [];
     
        convos.find({$or:[{"player1":player1}, {"player1":player2}]}).sort({date: 1}).toArray(function (err, items) {
            res.contentType('application/json');
            for(var i = 0;i<items.length;i++)
            {
                allMessages.push({"msg":items[i]})
            }
            res.send(JSON.stringify(allMessages));
        });

    });
});



app.post('/api/logout', function(req, res) {
var id = req.param('id');
    MongoClient.connect("mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx", function (err, db) {
            var users = db.collection("Users")
                   users.update({'_id' : new ObjectId(id)}, {$set: {status:"offline"}});
                   res.send("ok");
        });
})


// bind the app to listen for connections on a specified port
var port = process.env.PORT || 3000;
app.listen(port);

// Render some console log output
console.log("Listening on port " + port);


