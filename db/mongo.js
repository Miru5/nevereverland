var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
 
var Mewser = new Schema({
    user_id    : String,
    content    : String,
    updated_at : Date
});
 
mongoose.model( 'Mewser', Mewser );
mongoose.connect('mongodb://localhost:27017/local');