/**  
 * Module dependencies.  
 */ 
 
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var router = express.Router();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));
// var mongo = require('./model/mongo');
var port = process.env.PORT || 8080;
var router = express.Router();
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var fruits;

// var ObjectId = require('mongodb').ObjectID;



router.get("/",function(req,res){
    res.json({"message" : "Hello World!"});
});
// var MongoClient = require("mongodb").MongoClient
// var activeUsers = [];

//login
// app.get('/api/users', function(req, res) {
//     var username = req.param('username');
//     var password = req.param('password');
//     var a = " ";
//     var hash = "";
//     MongoClient.connect("mongodb://localhost:27017/local", function(err, db) {
//         var users = db.collection("users")

//         //login
//         users.find({"username":username}).toArray(function (err, items) {
//         hash = items[0]["password"];
//             bcrypt.compare(password, hash, function(err, result) {
//                 if(err==null){
//                     result === true
//                 }
               
//                 if(result){

//                     activeUsers.push({"usr":items[0]["username"]})
//                     res.send(items);
//                 }
//             });
//             // users.count({username:username}, function (err, count){
//             //     if(count>0){
//             //         res.send(items);
//             //     }
//             //     else {
//             //        res.send("error");
//             //     }
//             // });


//         });
//     });
// })

// //add user
// app.post('/api/add_user', function(req, res) {
//     var username = req.param('username');
//     var email = req.param('email');
//     var password = req.param('password');
//     var salt = bcrypt.genSaltSync(10);
//     var hash = "hush";

//     MongoClient.connect("mongodb://localhost:27017/local", function(err, db) {
//         var users = db.collection("users")
//         users.find({"email": email}).toArray(function (err, items) {
//             users.count({email: email}, function (err, count){
//                 if(count>0){
//                     res.send("error");
//                 }
//                 else {

//                         hash = bcrypt.hashSync(password, salt);
//                         password = hash;

//                     users.insert({username: username, email: email, password: password, charclass:"none", firstLogin:0});
//                     res.send("ok");
//                 }
//             });


//         });
//     });
// })

// //set class
// app.post('/api/set-class', function(req, res) {
//     var id = req.param('id');
//     var charClass = req.param('charClass');

//     MongoClient.connect("mongodb://localhost:27017/local", function(err, db) {
//         var users = db.collection("users")
//         doc = users.findOne({_id:id})
//         users.update({'_id' : new ObjectId(id)}, {$set: {charclass:charClass,firstLogin:1}});
//         res.send("ok");

//     });
// })

// //get online users
// app.get('/api/online-users', function(req, res) {
//     activeUsers.push({"usr":"miru"});
//     activeUsers.push({"usr":"anon"});

// res.contentType('application/json');
// res.send(JSON.stringify(activeUsers));

// })

app.listen(process.env.PORT || 8080)

console.log("Listening to PORT "+ port);
