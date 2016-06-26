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
var activeNow = [];
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
  activeNow = [];
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
                  users.insert({reg_id:"none",username: username, email: email, password: password, charclass:"none", firstLogin:0,xp:10,lvl:1,status:"offline","dp":"https://s3.amazonaws.com/nevereverland/default.jpg"});
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
    
        users.update({'_id' : new ObjectId(id)}, {$set: {reg_id:regID}});
        res.send("ok");
})

// set status
app.post('/api/set-online', function(req, res) {
    var id;
    var idx = req.param('id');
    var regid;
    var player2 = req.param('player2');
    users.update({'_id': new ObjectId(idx)}, {$set: {status: "online"}});
    users.find({"username": {$ne: player2}}).toArray(function (err, items) {

        var x = 0;
        while (x < items.length) {
            id = items[x]["_id"];
            console.log(id);
            // regid = items[x]["reg_id"];
            // activeUsers.push(regid);
            x++;
            users.update(
                {'_id': new ObjectId(id),"friends":{$elemMatch: {"username": player2}}},
                {$set: { "friends.$.status" : "online" } }
            )
        }
        res.send("ok");
    });
});

//set class
app.post('/api/set-class', function(req, res) {
    var id = req.param('id');
    var charClass = req.param('charClass');

        doc = users.findOne({_id:id})
        users.update({'_id' : new ObjectId(id)}, {$set: {charclass:charClass,firstLogin:1}});
        res.send("ok");
})

//set xp
app.post('/api/setxp', function(req, res) {
    var id = req.param('id');

        users.update({'_id' : new ObjectId(id)}, { $inc: { xp:10}});
        res.send("ok");
})

//set lvl
app.post('/api/lvlup', function(req, res) {
    var id = req.param('id');

        users.update({'_id' : new ObjectId(id)}, { $inc: { lvl:1}});
        res.send("ok");
})

//reset xp
app.post('/api/resetxp', function(req, res) {
    var id = req.param('id');

        users.update({'_id' : new ObjectId(id)}, { $set: { xp:10}});
        res.send("ok");
})

//get properties
app.get('/api/properties', function(req, res) {

        var player = req.param("char");
        res.contentType('application/json');
        users.aggregate([
            {
                '$match': {
                    "username": player
                }
            },
            {
            '$group': {
            '_id' : '$_id',
                'char':
                {'$push':
                 {
                    'lvl':'$lvl',
                     'xp': '$xp',
                     'dp': '$dp'
                 }
                }
             }
            }
        ]).toArray(function (err, items) {
            console.log(items);
            res.send(JSON.stringify(items));
        });
});


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
app.get('/api/onlineusers', function(req, res) {
        res.contentType('application/json');
        users.aggregate([
            {
                '$match': {
                    "status": "online"
                }
            },
            {
            '$group': {
            '_id' : '$_id',
                'online':
                {'$push': {"username" : '$username','lvl':'$lvl','charclass':'$charclass','dp':'$dp'}}
             }
            }
        ]).toArray(function (err, items) {
            console.log(items);
            res.send(JSON.stringify(items));
        });
});

//set display picture
app.post('/api/set_picture', function(req, res) {
   var id = req.body.id;
   var link = req.body.link;
    var xid;
    var player = req.body.player;
    users.update({'_id' : new ObjectId(id)}, { $set: { dp:link}});
    users.find({"username": {$ne: player}}).toArray(function (err, items) {

        var x = 0;
        while (x < items.length) {
            xid = items[x]["_id"];
            x++;
            console.log(xid);
            users.update(
                {'_id': new ObjectId(xid),"friends":{$elemMatch: {"username": player}}},
                {$set: { "friends.$.dp" : link } }
            )
        }
        res.send("ok");
        });
       
})

//get list of friends for user
app.get('/api/friends', function(req, res) {

    var player1 = req.param('player1');
  //  var result = db.users.find({friends: {$elemMatch: {status:'online'}}})
    res.contentType('application/json');
    users.aggregate([
        {
            '$match': {
                "username": player1
            }
        },
        {'$unwind': '$friends'},
        {
            '$group': {
                '_id' : '$_id',
                'friends':
                {'$push': '$friends'}
                }
        }
    ]).toArray(function (err, items) {
        console.log(items);
        res.send(JSON.stringify(items));
    });
});

//send friend request
 sendRequest = function(from,to,callback){
       
                  users.update({"username": to},
        {$push: {
            "notifications":{ "from": from,"message":from +" has sent you a friend request.","type":"f", "date":new Date()}
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
                            key2: from +" has sent you a friend request.",
                            type: "f"
                        }
                    });
                    console.log(message);
                    gcmObject.send(message, function (err, response) {
                            callback({'response': "Success"});
                    });
                }
                else {
                    callback({'response': "error"});
                }

            });

        });
}

// friend request
app.post('/api/send-friend-request',function(req,res) {
    var from = req.param('player1');
    var to = req.param('player2');
    
    sendRequest(from,to,function (found) {
        console.log(found);
        res.json(found);
    });
})

//send friend request answer
sendFriendAnswer = function(from,to,ans,callback){
       var answer = "accepted"
       var username;
       var lvl;
       var charclass;
       var dp;
       var status;
       var xp;
       var hp;
       
       if(ans=="yes"){
           answer = "accepted";
            users.find({"username": from}).toArray(function (err, items) {
                 username = items[0]["username"];
                  lvl = items[0]["lvl"];
                  charclass = items[0]["charclass"];
                  status = items[0]["status"];
                  dp = items[0]["dp"];
                  xp = items[0]["xp"];
                 
        users.update({"username": to},
           {$push: {
        "friends":{ "username": from,"lvl":lvl,"charclass":charclass,"dp":dp,"status":status,"inparty":"no","xp":xp,}}})
            });
            
             users.find({"username": to}).toArray(function (err, items) {
                    username = items[0]["username"];
                  lvl = items[0]["lvl"];
                  charclass = items[0]["charclass"];
                  status = items[0]["status"];
                  dp = items[0]["dp"];
                  xp = items[0]["xp"];
        users.update({"username": from},
           {$push: {
        "friends":{ "username": to,"lvl":lvl,"charclass":charclass,"dp":dp,"status":status,"inparty":"no","xp":xp}}})
            });
                  users.update({"username": to},
        {$push: {
            "notifications":{ "from": from,"message":from +" has accepted your request.","type":"a", "date":new Date()}}})
        }
    else{
          answer = "denied";
                users.update({"username": to},
        {$push: {
            "notifications":{ "from": from,"message":from +" has denied your request.","type":"a", "date":new Date()}}})
    }
        users.find({"username": to}).toArray(function (err, items) {
            users.count({username: to}, function (err, count) {
                if (count > 0) {
                    var r_id = items[0]["reg_id"]
                    var message = new gcm.Message({
                        registration_ids: [r_id],
                        data: {
                            key1: from,
                            key2: from +" has "+ answer + " your request.",
                            type: "a",
                            answer:answer
                        }
                    });
                    console.log(message);
                    gcmObject.send(message, function (err, response) {
                            callback({'response': "Success"});
                    });
                }
                else {
                    callback({'response': "error"});
                }

            });

        });
}

//post answer to friend request
app.post('/api/send-answer',function(req,res) {
    var from = req.param('player1');
    var to = req.param('player2');
    var ans = req.param('answer');
    sendFriendAnswer(from,to,ans,function (found) {
        console.log(found);
        res.json(found);
    });
})
      
// send party invite        
 sendInvite = function(from,to,callback){
     
             users.update({"username": to},
        {$push: {
            "notifications":{ "from": from,"message":from +" has sent you a party invite.","type":"p", "date":new Date()}
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
                            key2: from +" has sent you a party invite.",
                            type: "p"
                        }
                    });
                    console.log(message);
                    gcmObject.send(message, function (err, response) {
                            callback({'response': "Success"});
                    });
                }
                else {
                    callback({'response': "error"});
                }

            });

        });
}

// post invite
app.post('/api/send-party-invite',function(req,res) {
    var from = req.param('player1');
    var to = req.param('player2');
    
    sendInvite(from,to,function (found) {
        console.log(found);
        res.json(found);
    });
})

//send party invite answer
sendPartyAnswer = function(from,to,ans,callback){
       var answer = "accepted"
       var username;
       var lvl;
       var charclass;
       var dp;
       var hp;
       var xp;
       
       if(ans=="yes"){
           answer = "accepted";
        //     users.find({"username": from}).toArray(function (err, items) {
        //          username = items[0]["username"];
        //           lvl = items[0]["lvl"];
        //           charclass = items[0]["charclass"];
        //           status = items[0]["status"];
        //           xp = items[0]["xp"];
        //           dp = items[0]["dp"];
        // users.update({"username": to},
        //   {$push: {
        // "party":{ "username": from,"lvl":lvl,"charclass":charclass,"dp":dp,"status":status,"xp":xp}}})
        //     });
            
        //      users.find({"username": to}).toArray(function (err, items) {
        //             username = items[0]["username"];
        //           lvl = items[0]["lvl"];
        //           charclass = items[0]["charclass"];
        //           status = items[0]["status"];
        //           dp = items[0]["dp"];
        //           xp = items[0]["xp"];
        // users.update({"username": from},
        //   {$push: {
        // "party":{ "username": to,"lvl":lvl,"charclass":charclass,"dp":dp,"status":status,"xp":xp}}})
        //     });
              users.find({"username": {$ne: to}}).toArray(function (err, items) {
        var x = 0;
        var xid;
        while (x < items.length) {
            xid = items[x]["_id"];
            x++;
            console.log(xid);
            users.update(
                {'_id': new ObjectId(xid),"friends":{$elemMatch: {"username": to}}},
                {$set: { "friends.$.inparty" : "yes" } }
            )
        }
    });
    
                  users.update({"username": to},
        {$push: {
            "notifications":{ "from": from,"message":from +" has accepted your invite.","type":"pa", "date":new Date()}}})
            
             users.find({"username": {$ne: from}}).toArray(function (err, items) {
        var x = 0;
        var xid;
        while (x < items.length) {
            xid = items[x]["_id"];
            x++;
            console.log(xid);
            users.update(
                {'_id': new ObjectId(xid),"friends":{$elemMatch: {"username": from}}},
                {$set: { "friends.$.inparty" : "yes" } }
            )
        }
    });
        }
        
       
    else{
          answer = "denied";
                users.update({"username": to},
        {$push: {
            "notifications":{ "from": from,"message":from +" has denied your invite.","type":"p", "date":new Date()}}})
    }
        users.find({"username": to}).toArray(function (err, items) {
            users.count({username: to}, function (err, count) {
                if (count > 0) {
                    var r_id = items[0]["reg_id"]
                    var message = new gcm.Message({
                        registration_ids: [r_id],
                        data: {
                            key1: from,
                            key2: from +" has "+ answer + " your invite.",
                            type: "p",
                            answer:answer
                        }
                    });
                    console.log(message);
                    gcmObject.send(message, function (err, response) {
                            callback({'response': "Success"});
                    });
                }
                else {
                    callback({'response': "error"});
                }

            });

        });
}

//post answer to invite
app.post('/api/send-party-answer',function(req,res) {
    var from = req.param('player1');
    var to = req.param('player2');
    var ans = req.param('answer');
    sendPartyAnswer(from,to,ans,function (found) {
        console.log(found);
        res.json(found);
    });
})

 app.get('/api/party', function (req, res) {
        var player1 = req.param('player1');
        
              users.aggregate([
                {'$unwind': '$friends'},
                {'$match':{
                $and:[
                {"friends.inparty":
                "{$ne: player1}" },
                {username:"{$ne:player1}"}
                ]}},
                {'$group':
                {
                    '_id': '$friends.username',
                   "party": { "$members": "$friends" }
                }
                }]).toArray(function (err, items) {
        res.send(JSON.stringify(items));
    })
});

//leave party
leaveParty = function(player,callback){  
// users.find({"username": {$ne: player}}).toArray(function (err, items) {
        var x = 0;
        var xid;
        // remove from my object 1st
        users.find({"username":player}).toArray(function (err, items) {
        var x = 0;
        var xid = items["_id"];
            users.update(
                {'_id': new ObjectId(xid)},
        {$set: { "party" : [] } }
            )
        callback({'response': "Success"});
        
        // while (x < items.length) {
        //     xid = items[x]["_id"];
        //     x++;
        //     console.log(xid);
        //     users.update(
        //         {'_id': new ObjectId(xid),"friends":{$elemMatch: {"username": player}}},
        //         {$pullAll: { "party.$.username" : player } }
        //     )
            
        // }
            
    });
}

//post leave party
app.post('/api/leave-party',function(req,res) {
    var player = req.param('player');
    leaveParty(player,function (found) {
        console.log(found);
        res.json(found);
    });
})
        

//send main chat msg
sendMain = function(from,msg,callback){
    activeUsers = [];
    users.aggregate([
        {
            '$match': {
                "status": "online"
            }
        }
    ]).toArray(function (err, items) {
        for(var i=0;i<items.length;i++){
            if(items[i]["username"]!=from){
                activeUsers.push(items[i]["reg_id"])
            }
        }
         var message = new gcm.Message({
            registration_ids: activeUsers,
            data: {
                key1: from,
                key2: msg,
                type: "m"
            }
        });
        console.log(message);
        gcmObject.send(message, function (err, response) {
            callback({'response': JSON.stringify(message)});
        });
    });

       
}


app.post('/api/send-msg-chat',function(req,res) {
    var from = req.param('player1');
    var msg = req.param('text');

    sendMain(from,msg,function (found) {
        console.log(found);
        res.json(found);
    });
})
// 

// send msg
 send = function(from,to,msg,date,callback){
       
                  users.update({"username": from},
        {$push: {
            "conversations":{ "with": to,"message":msg,"date":new Date(),"type":"s","realDate":date }
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
                            callback({'response': JSON.stringify(message)});
                    });
                }
                else {
                    callback({'response': "error"});
                }

            });

        });
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

 save = function(from,to,msg,date,callback){
    users.update({"username": to},
        {$push: {
            "conversations":{ "with": from,"message":msg,"date":new Date(),"type":"r","realDate":date }
        }
        }
    )
     callback({'response': "Success"});
     
}

app.post('/api/save-received',function(req,res) {
    var from = req.param('player1');
    var to = req.param('player2');
    var msg = req.param('text');
    var date = req.param('date');

    save(from,to,msg,date,function (found) {
        console.log(found);
        res.json(found);
    });
})

//get last conversation foreach friend
  app.get('/api/last-convos', function (req, res) {
        var player1 = req.param('player1');
        
              users.aggregate([
                {'$unwind': '$conversations'},
                {'$match':{
                $and:[
                {"conversations.with":
                {$ne: player1} },
                {username:player1}
                ]}},

                { "$sort": {"conversations.with":1, "conversations.date": 1 } },
                {'$group':
                {
                    '_id': '$conversations.with',
                   "lastMessage": { "$last": "$conversations" }
                }
                }]).toArray(function (err, items) {
        res.send(JSON.stringify(items));
    })
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

//logout
app.post('/api/set-offline', function(req, res) {
    var id;
    var idx = req.param('id');
    var player2 = req.param('player2');
    users.update({'_id': new ObjectId(idx)}, {$set: {status: "offline"}});
    users.find({"username": {$ne: player2}}).toArray(function (err, items) {

        var x = 0;
        while (x < items.length) {
            id = items[x]["_id"];
            x++;
            console.log(id);
            users.update(
                {'_id': new ObjectId(id),"friends":{$elemMatch: {"username": player2}}},
                {$set: { "friends.$.status" : "offline" } }
            )
        }
        res.send("ok");
    });
});

var port = process.env.PORT || 3000;
app.listen(port);

console.log("Listening on port " + port);


