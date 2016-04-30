var mongoose = require('mongoose');  

var Schema = mongoose.Schema;  

var userSchema = mongoose.Schema({    
     token : String,     
     email: String,  
     hashed_password: String,    
     salt : String,  
     temp_str:String 
});  

mongoose.connect('mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx'); 
module.exports = mongoose.model('users', userSchema);
