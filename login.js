var crypto = require('crypto'); 
var rand = require('csprng'); 
var mongoOp = require('./models/mongo');
var gravatar = require('gravatar'); 
var user = require('models');  

exports.login = function(name,callback) {  

user.find({name: name},function(err,users){  

if(users.length != 0){  

var temp = users[0].salt; 
var hash_db = users[0].hashed_password; 
var id = users[0].token; 
var newpass = temp + password; 
var hashed_password = crypto.createHash('sha512').update(newpass).digest("hex"); 

if(hash_db == hashed_password){  

callback({'response':"Login Sucess",'res':true,'token':id});  

}else{  

callback({'response':"Invalid Password",'res':false});  

} 
}else {  

callback({'response':"User not exist",'res':false});  
} 
}); 
} 