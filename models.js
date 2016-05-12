var mongoose = require('mongoose');  

var Schema = mongoose.Schema;  

var userSchema = mongoose.Schema({
    name : String,
    mobno: String,
    reg_id: String
}); 

mongoose.connect('mongodb://miru:toor@ds013340.mlab.com:13340/heroku_tn8g3mwx'); 
module.exports = mongoose.model('usersTest', userSchema);
