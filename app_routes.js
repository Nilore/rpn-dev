const jwt = require('jsonwebtoken');
const rpn_user = require('./models/user_auth');

module.exports = function(app) {
    app.get('/', function(req, res){
	// TODO: Should direct to some landing page while client is it's own route
	res.sendFile(__dirname + '/client.html');
    });
    app.get('/new_user', function(req, res){
        res.render('create_user', {
	    csrfToken: req.csrfToken()
	});
    });
    app.post('/new_user', function(req, res){
	console.log('req: ' + req.body.name);
	console.log('creating new user: ' + req.body.name);
	const user_name = req.body.name;
	const user_passwd = req.body.password;
	rpn_user.add_user(user_name,user_passwd,function(err) {
	    if (err == rpn_user.DUPLICATE_USER) {
		//dup user code here. Don't return here, we need that res.end() at the bottom.
	    } else { //success
		res.redirect('/login');
	    }
	    res.end();
	});
    });
    app.get('/login', function(req, res){
	res.render('login', {
	    csrfToken: req.csrfToken()
	});
    });
    app.post('/login', function(req, res){
	console.log('Logging in with user: ' + req.body.name);
	rpn_user.auth_user(req.body.name,req.body.password,function(err,token){
	    if (err == rpn_user.FLAGRENT_SYSTEM_ERROR) throw err;
	    if (err == rpn_user.PASSWORD_INVALID) console.log("I'mma call the cops!");
	    if (err == rpn_user.USER_NOT_FOUND) console.log("User not in database: " + req.body.name);
	    console.log(token);
	    if (token) {
		const experation = new Date(jwt.decode(token).exp * 1000);
		console.log("Expires: " + experation);
		res.cookie('rpn_auth',token,{
		    httpOnly: true,
		    secure: true,
		    expires: experation
		});
	    }
	    res.end();
	});
    });
}
