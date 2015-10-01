var pwdMgr = require('./managePasswords');
var util = require('util');
var restify = require('restify');

module.exports = function (server, db) {
    // unique index
    db.appUsers.ensureIndex({
        email: 1
    }, {
        unique: true
    })

	//server.use(restify.bodyParser()); //YK - without this params is empty (even if same statement is in the server.js)

    server.post('/api/v1/Menu/auth/register', function (req, res, next) {
        var user = req.params;
//var My=util.inspect(req);
//nsole.log('Register email=', user.email); //YK
//console.log(req.body);
        pwdMgr.cryptPassword(user.password, function (err, hash) {
            user.password = hash;
            db.appUsers.insert(user,
                function (err, dbUser) {
                    if (err) { // duplicate key error
                        if (err.code == 11000) /* http://www.mongodb.org/about/contributors/error-codes/*/ {
                            res.writeHead(400, {
                                'Content-Type': 'application/json; charset=utf-8'
                            });
                            res.end(JSON.stringify({
                                error: err,
                                message: "A user with this email already exists"
                            }));
                        }
                    } else {
                        res.writeHead(200, {
                            'Content-Type': 'application/json; charset=utf-8'
                        });
                        dbUser.password = "";
                        res.end(JSON.stringify(dbUser));
                    }
                });
        });
		currUserID = user.email;
        return next();
    });

	//server.use(restify.bodyParser()); //YK - without this params is empty (even if same statement is in the server.js)
    server.post('/api/v1/Menu/auth/login', function (req, res, next) {
        var user = req.params; 
console.log('Login email=', user.email, 'pwd=', user.password);		
 
        if (user.email.trim().length == 0 || user.password.trim().length == 0) {
            res.writeHead(403, {
                'Content-Type': 'application/json; charset=utf-8'
            });
            res.end(JSON.stringify({
                error: "Invalid Credentials"
            }));
        }
		
        db.appUsers.findOne({
            email: req.params.email
        }, function (err, dbUser) {
console.log('Login dbUser=', dbUser, 'err=', err);	
            pwdMgr.comparePassword(req.params.password, dbUser.password, function (err, isPasswordMatch) {

                if (isPasswordMatch) {
                    res.writeHead(200, {
                        'Content-Type': 'application/json; charset=utf-8'
                    });
                    // remove password hash before sending to the client
                    dbUser.password = "";
                    res.end(JSON.stringify(dbUser));
                } else {
                    res.writeHead(403, {
                        'Content-Type': 'application/json; charset=utf-8'
                    });
                    res.end(JSON.stringify({
                        error: "Invalid User"
                    }));
                }

            });
        });
        return next();
    });
};