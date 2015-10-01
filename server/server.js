var restify     =   require('restify');
var mongojs     =   require('mongojs');
var morgan  	=   require('morgan');
var db          =   mongojs('myMenu', ['appUsers', 'Menus']);
var server      =   restify.createServer(
// from //http://debuggable.com/posts/streaming-file-uploads-with-node-js:4ac094b2-b6c8-4a7f-bd07-28accbdd56cb:
function(req, res) {
console.log('here');	
	console.log('req.uri.path='+req.uri.path);
	//
  switch (req.uri.path) {
    case '/':
      display_form(req, res);
      break;
    case '/upload':
      upload_file(req, res);
      break;
    default:
      show_404(req, res);
      break;
  }
}
);
 

//db.dropDatabase(); //YK - temp!!
 
//YK:
// Middlewares
server.use(restify.acceptParser(server.acceptable));
//server.use(restify.authorizationParser());
//server.use(restify.dateParser());
server.use(restify.queryParser());
//server.use(restify.urlEncodedBodyParser());
server.use(restify.bodyParser());
server.use(morgan('dev')); // LOGGER

//doesn't help server.pre(restify.pre.sanitizePath()); //YK
 
// CORS //YK tried to comment out - worked fine with post, not with get
 server.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

var manageUsers =   require('./auth/manageUser')(server, db);
var manageLists =   require('./list/manageList')(server, db);

var port = 27018;//9804; //27017;
server.listen(process.env.PORT || port, function () { 
    console.log("Server started @ ",process.env.PORT || port); 
});

//------------------------------------
// from //http://debuggable.com/posts/streaming-file-uploads-with-node-js:4ac094b2-b6c8-4a7f-bd07-28accbdd56cb:
var multipart = require('multipart'); 
var sys = require('sys');  

function display_form(req, res) {
  res.sendHeader(200, {'Content-Type': 'text/html'});
  res.sendBody(
    '<form action="/upload" method="post" enctype="multipart/form-data">'+
    '<input type="file" name="upload-file">'+
    '<input type="submit" value="Upload">'+
    '</form>'
  );
  res.finish();
}

function upload_file(req, res) {
  req.setBodyEncoding('binary');

  var stream = new multipart.Stream(req);
  stream.addListener('part', function(part) {
    part.addListener('body', function(chunk) {
      var progress = (stream.bytesReceived / stream.bytesTotal * 100).toFixed(2);
      var mb = (stream.bytesTotal / 1024 / 1024).toFixed(1);

      sys.print("Uploading "+mb+"mb ("+progress+"%)\015");

      // chunk could be appended to a file if the uploaded file needs to be saved
    });
  });
  stream.addListener('complete', function() {
    res.sendHeader(200, {'Content-Type': 'text/plain'});
    res.sendBody('Thanks for playing!');
    res.finish();
    sys.puts("\n=> Done");
  });
}

function show_404(req, res) {
  res.sendHeader(404, {'Content-Type': 'text/plain'});
  res.sendBody('You r doing it wrong!');
  res.finish();
}
