var restify = require('restify');

module.exports = function (server, db) {
    var validateRequest = require("../auth/validateRequest");
 
 //YK begin - upload
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
 
 server.get("/upload", function (req, res, next) {
console.log('here');	 
	upload_file(req, res); 
 });	 
 //YK end
 
		//server.use(restify.queryParser());//YK -  - without this params is empty (even if same statement is in the server.js)
		//All -------------------YK
  server.get("/api/v1/Menu/data/list", function (req, res, next) {
        //YK validateRequest.validate(req, res, db, function () {
			//
            db.Menus.find({
                //YK - get all, not only for a user - commented:		user : req.params.token
            }, function (err, list) {
//console.log('getAll err=', JSON.stringify(err));				
                res.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8'
                });
                res.end(JSON.stringify(list));
            });
			
        //});
        return next();
    });
 
    server.get('/api/v1/Menu/data/item/:id', function (req, res, next) {
        validateRequest.validate(req, res, db, function () {
			if (db.appUsers == undefined){} //YK
			else {
            db.Menus.find({
                _id: db.ObjectId(req.params.id)
            }, function (err, data) {
                res.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8'
                });
                res.end(JSON.stringify(data));
            });
        }});
        return next();
    });
 
  	//server.use(restify.bodyParser()); //YK ? - without this params is empty (even if same statement is in the server.js)
	//Save New Item:
    server.post('/api/v1/Menu/data/item', function (req, res, next) {
        validateRequest.validate(req, res, db, function () {
            var item = req.params;
//console.log('save item req.params.user=',req.params.user.toString());
//db.appUsers.findOne({email: '1'}, function(err, doc) {
//console.log('save item err=',err);
//console.log('save item doc=',doc);
            item.user = req.params.user; //YK add user (email==userID) so then can filter by it
  db.Menus.save(item,
                function (err, data) {
console.log('save item data=', data, 'err=', err);					
                    res.writeHead(200, {
                        'Content-Type': 'application/json; charset=utf-8'
                    });
                    res.end(JSON.stringify(data));
                });
        return next();

		});
	
});


  	//server.use(restify.bodyParser()); //YK ? - without this params is empty (even if same statement is in the server.js)
    server.put('/api/v1/Menu/data/item/:id', function (req, res, next) {
console.log('Save New Item 1');		
        validateRequest.validate(req, res, db, function () {
			if (db.Menus == undefined){} //YK
			else {
            db.Menus.findOne({
                _id: db.ObjectId(req.params.id)
            }, function (err, data) {
                // merge req.params/product with the server/product
 
                var updProd = {}; // updated products 
                // logic similar to jQuery.extend(); to merge 2 objects.
                for (var n in data) {
                    updProd[n] = data[n];
                }
                for (var n in req.params) {
                    if (n != "id")
                        updProd[n] = req.params[n];
                }
                db.Menus.update({
                    _id: db.ObjectId(req.params.id)
                }, updProd, {
                    multi: false
                }, function (err, data) {
                    res.writeHead(200, {
                        'Content-Type': 'application/json; charset=utf-8'
                    });
                    res.end(JSON.stringify(data));
                });
            });
        }});
        return next();
    });
 
  	//server.use(restify.bodyParser()); //YK ? - without this params is empty (even if same statement is in the server.js)
    server.del('/api/v1/Menu/data/item/:id', function (req, res, next) {
console.log('Save New Item 2');		
        validateRequest.validate(req, res, db, function () {
            db.Menus.remove({
                _id: db.ObjectId(req.params.id)
            }, function (err, data) {
                res.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8'
                });
                res.end(JSON.stringify(data));
            });
            return next();
        });
    });
 
}				