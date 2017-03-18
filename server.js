var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var Auth0Strategy = require('passport-auth0');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var bodyParser = require('body-parser');

var messages = require("controllers/messages");

var app = express();
app.set('view engine', 'pug')

// Setups
var port = process.env.PORT || 3000;
var db = process.env.MONGODB_URI || "mongodb://heroku_14r5fjjv:cspbhrn9cceku0ss1k7t758evs@ds133260.mlab.com:33260/heroku_14r5fjjv";
mongoose.connect(db);
callbackURL = process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback';

//read post requests
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


// ############################
// Auth0
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
passport.use(strategy);
// This can be used to keep a smaller payload
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
app.use(passport.initialize());
app.use(passport.session());

// ############################
// App - routes
// home
app.get('/', messages.index);

// messages
app.get('/messages/new', messages.new);
app.post('/messages/create', messages.create);
app.get('/messages/show/:id', messages.show);
app.get('/messages/list', messages.list);
app.get('/messages/image/:id', messages.image);


// ############################
// Auth0 - users
// Render the login template
app.get('/login',
  function(req, res){
    console.log(callbackURL)
    res.render('login', { env: process.env, callbackURL: callbackURL });
  });

// Perform the final stage of authentication and redirect to '/user'
app.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/' }),
  function(req, res) {
    console.log('authenticated')
    res.redirect(req.session.returnTo || '/user');
  });

// Perform session logout and redirect to homepage
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Get the user profile
app.get('/user', ensureLoggedIn, function(req, res, next) {
  res.render('user', { user: req.user });
});


app.listen(port, function () {
  console.log('Listening on port 3000!');
});
