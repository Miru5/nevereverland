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

var MongoClient = require("mongodb").MongoClient
var activeUsers = [];
var allMessages = [];
var messagedUsers = [];
var db;
var users;
var convos;
app.get("/hey",function(req,res){
    res.json({"message" : "Hey World!"});
});


MongoClient.connect("mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx", function(err, database) {
  if(err) throw err;
  db = database;
  users = db.collection("Users");
  convos = db.collection("Convos");
  activeUsers = [];
});

//add user
app.post('/api/add_user', function(req, res) {
    var username = req.param('username');
    var email = req.param('email');
    var password = req.param('password');
    var salt = bcrypt.genSaltSync(10);
    var hash = "hush";
    
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

//login
  app.get('/api/users', function (req, res) {
        var username = req.param('username');
        var password = req.param('password');
        var hash = "";
        var id = "this";
        
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
    })

//set reg id
app.post('/api/setID', function(req, res) {
    var id = req.param('id');
    var regID = req.param('regID');

        doc = users.findOne({_id:id})
        users.update({'_id' : new ObjectId(id)}, {$set: {reg_id:regID}});
        res.send("ok");
})


app.post('/api/status', function(req, res) {
    var id = req.param('id');

          users.update({'_id' : new ObjectId(id)}, {$set: {status:"online"}});
        res.send("ok");
})


//set class
app.post('/api/set-class', function(req, res) {
    var id = req.param('id');
    var charClass = req.param('charClass');

        doc = users.findOne({_id:id})
        users.update({'_id' : new ObjectId(id)}, {$set: {charclass:charClass,firstLogin:1}});
        res.send("ok");
})

function unique(arr) {
    var hash = {}, result = [];
    for ( var i = 0, l = arr.length; i < l; ++i ) {
        if ( !hash.hasOwnProperty(arr[i]) ) { //it works with objects! in FF, at least
            hash[ arr[i] ] = true;
            result.push(arr[i]);
        }
    }
    return result;
}

// get list of online users
app.get('/api/online-users', function(req, res) {

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
        
        //get list of conversations by user
  app.get('/api/messages', function(req, res) {
    messagedUsers = [];
    var player1 = req.param('player1');
    var lastMessage;
    convos.find({$or:[{"player1":player1}, {"player2":player1}]},{"sort" : [['date', 'asc']]}).toArray(function (err, items) {
        res.contentType('application/json');
         for(var i = 0;i<items.length;i++)
            {
                messagedUsers.push({"msg":items[i]})
            }

        res.send(JSON.stringify(messagedUsers));
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

 send = function(from,to,msg,callback){
       
                  users.update({"username": from},
        {$push: {
            "conversations":{ "with": to,"message":msg,"date":new Date(),"type":"s" }
        }
        }
    )
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
                            callback({'response': "Success"});
                    });
                }
                else {
                    res.send("error");
                }

            });

        });
}

app.post('/api/sendgcm',function(req,res) {
    var from = req.param('player1');
    var to = req.param('player2');
    var msg = req.param('text');
    
    send(from,to,msg,function (found) {
        console.log(found);
        res.json(found);
    });
})


 save = function(from,to,msg,date,callback){
    users.update({"username": to},
        {$push: {
            "conversations":{ "with": from,"message":msg,"date":"a","type":"r" }
        }
        }
    )
     callback({'response': "Success"});
     
}


app.post('/api/save-received',function(req,res) {
    var from = req.param('player1');
    var to = req.param('player2');
    var msg = req.param('text');

    save(from,to,msg,function (found) {
        console.log(found);
        res.json(found);
    });
})

//get last conversation foreach friend

 app.get('/api/all-messages', function (req, res) {
        MongoClient.connect("mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx", function(err, database) {
        db = database;
        users = db.collection("Users");
        var player1 = req.param('player1');

            users.aggregate([
                {'$unwind': '$conversations'},
                {'$match':
                {"conversations.with":

                {$ne: player1} }
                },
                { "$sort": { "_id": 1 } },
                {'$group':
                {
                    '_id': '$_id',
                    "result": {"$last":"$conversations"},
                    'conversations':
                    {'$push': '$conversations'}
                }
                }])
            .toArray(function (err, items) {
                console.log(items);
                res.send(JSON.stringify(items));
            });

    });
});


// get conversations by user
app.get('/api/convos', function(req, res) {
        var player2 = req.param('player2');
        allMessages = [];
            users.aggregate([
                {'$unwind': '$conversations'},
                {'$match':
                {"conversations.with":
                    player2 }
        },
        {'$group':
        {
            '_id': '$_id',
            'conversations':
            {'$push': '$conversations'}
        }
        }
    ]).toArray(function (err, items) {
     console.log(items);
        res.send(JSON.stringify(items));
        });
});



app.post('/api/logout', function(req, res) {
                var id = req.param('id');

                   users.update({'_id' : new ObjectId(id)}, {$set: {status:"offline"}});
})


// bind the app to listen for connections on a specified port
var port = process.env.PORT || 3000;
app.listen(port);

// Render some console log output
console.log("Listening on port " + port);


