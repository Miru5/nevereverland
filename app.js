var http = require('http');
 
var server = http.createServer(function(req,res){
res.WriteHead(200, {'Content-Type':'text/html'});
res.send('<h1>Hello World</h1>');
}); 

var port = Number(process.env.PORT || 8080);

app.listen(port);
