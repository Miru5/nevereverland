var MongoClient = require('mongodb').MongoClient

var URL = 'ds013340.mlab.com:13340/heroku_tn8g3mwx'

MongoClient.connect(URL, function(err, db) {
  if (err) return

  var col = db.collection('food')
  // col.insert({name: 'taco'}, function(err, result) {
  //  col.find({name: 'bell'}).toArray(function(err, docs) {
  //     console.log(docs[0])
  //     db.close()
  //   })
	
	col.find().toArray(function(err, items) {
               //  console.log(items);
                 //res.send(items);
             });
})
