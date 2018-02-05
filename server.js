var http = require('http');
var url = require('url'); 
var fs = require('fs'); 
http.createServer(function (req, res) {
	var q = url.parse(req.url, true);
	var filename = "./home.html";
	if (!(q.pathname == '/')){filename = "." + q.pathname}

	//---Send the requested web page to the browser---//
	fs.readFile(filename, function(err, data) {  
		if (err) {
		  res.writeHead(404, {'Content-Type': 'text/html'});
		  return res.end("404 Not Found");
		}
		if (extensionIs(filename, ".png")){	res.writeHead(200, {'Content-Type': 'image/png'});}
		if (extensionIs(filename, ".html")){	res.writeHead(200, {'Content-Type': 'text/html'});}
		if (extensionIs(filename, ".css")){	res.writeHead(200, {'Content-Type': 'text/css'});}
		res.write(data);
		return res.end();
	});
}).listen(8080);
//--------------------------------------------------------------------------------
function extensionIs(filename, extension){if (filename.substring(filename.length - extension.length, filename.length) == extension){return true;}else{return false;}}
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------