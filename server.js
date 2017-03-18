var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var Auth0Strategy = require('passport-auth0');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var messages = require("controllers/messages");

// settings
var port = process.env.PORT || 3000;
var db = process.env.MONGODB_URI || "mongodb://heroku_14r5fjjv:cspbhrn9cceku0ss1k7t758evs@ds133260.mlab.com:33260/heroku_14r5fjjv";
mongoose.connect(db);
callbackURL = process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback';
// Configure Passport to use Auth0
var strategy = new Auth0Strategy({
    domain:       process.env.AUTH0_DOMAIN,
    clientID:     process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL:  callbackURL
  }, function(accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  });


// express settings
var app = express();
app.set('view engine', 'pug')
app.use(express.static('public'));
//read post requests
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(cookieParser());
app.use(session({
  secret: 'shhhhhhhhh',
  resave: true,
  saveUninitialized: true
}));
passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

// This can be used to keep a smaller payload
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

 // Local helpers
app.use( (req, res, done) => {
  res.locals.env = process.env
  res.locals.callbackURL = callbackURL

  if (req.isAuthenticated()) {
    res.locals.isAuthenticated = true
    res.locals.user = req.user
  }
  else {
    res.locals.isAuthenticated = false
    res.locals.user = {}
  }

  done()
})

// routes
// home
app.get('/', function(req, res) {
	res.render("index");
});

// messages
app.post('/messages/create', messages.create);
app.get('/messages/show/:id', messages.show);
app.get('/messages/image/:id', messages.image);

// Render the login template
app.get('/login',
  function(req, res){
    res.redirect("/?login=true")
  });

// Perform the final stage of authentication and redirect to '/user'
app.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/?login=true' }),
  function(req, res) {
    res.redirect(req.session.returnTo || '/');
  });

// Perform session logout and redirect to homepage
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Get the user profile
app.get('/user', ensureLoggedIn, function(req, res, next) {
  res.render('user');
});


// start server
app.listen(port, function () {
  console.log('Listening on port 3000!');
});
