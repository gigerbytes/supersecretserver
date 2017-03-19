var express = require('express');
var mongoose = require('mongoose');
var request = require("request");
var passport = require('passport');
var Auth0Strategy = require('passport-auth0');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var NodeRSA = require('node-rsa');
var messages = require("controllers/messages");
var User = require("models/User");


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

// var options = { method: 'POST',
//   url: process.env.AUTH0_TEST_URL,
//   headers: { 'content-type': 'application/json' },
//   body: '{"client_id": process.env.AUTH0_TEST_CLIENT_ID, "client_secret": process.env.AUTH0_TEST_CLIENT_SECRET,"audience": process.env.AUTH0_TEST_AUDIENCE,"grant_type": process.env.AUTH0_TEST_GRANT_TYPE}' };

var options = { method: 'POST',
  url: 'https://app65248950.eu.auth0.com/oauth/token',
  headers: { 'content-type': 'application/json' },
  body: '{"client_id":"sKv7dm3RPhLYQBsbQ98bycAfIGpWkVcc","client_secret":"1pN01GLckukxBIymVlCxpYwMnkWfT21Xnj5FtAMOjjncOGPID9w2KWQi-NPiN3U7","audience":"https://app65248950.eu.auth0.com/api/v2/","grant_type":"client_credentials"}' };

request(options, function (error, response, body) {
  if (error) throw new Error(error);
  auth0_test_access_token = body.access_token;
});

// ENCRYPTION HELPER
//generate
function generateUserKeys(userData){
  // query if user exists:
  var username = userData.displayName;
  User.count({"username": username}, function(err, count){
    if(count == 0) { // no user, go generate a key pair

      var key = new NodeRSA();
      key.generateKeyPair();
      var publicPem = key.exportKey('pkcs8-public-pem');
      var privatePem = key.exportKey('pkcs8-private-pem');

      User.create({
        username: username,
        publicKey: publicPem,
        privateKey: privatePem
      });
    }

  });
}

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
    generateUserKeys(req.user);
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

  var options = { method: 'GET',
    url: 'https://app65248950.eu.auth0.com/api/v2/users',
    headers: { authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik1FRTVNVGhFTnpFM01rVXpPVE5DUXpRM1JqVTFSamt3UkRkRVJFWXdOa1ZCUkRJNVJVTTRPQSJ9.eyJpc3MiOiJodHRwczovL2FwcDY1MjQ4OTUwLmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJzS3Y3ZG0zUlBoTFlRQnNiUTk4YnljQWZJR3BXa1ZjY0BjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9hcHA2NTI0ODk1MC5ldS5hdXRoMC5jb20vYXBpL3YyLyIsImV4cCI6MTQ4OTk2NTQxMiwiaWF0IjoxNDg5ODc5MDEyLCJzY29wZSI6InJlYWQ6Y2xpZW50X2dyYW50cyBjcmVhdGU6Y2xpZW50X2dyYW50cyBkZWxldGU6Y2xpZW50X2dyYW50cyB1cGRhdGU6Y2xpZW50X2dyYW50cyByZWFkOnVzZXJzIHVwZGF0ZTp1c2VycyBkZWxldGU6dXNlcnMgY3JlYXRlOnVzZXJzIHJlYWQ6dXNlcnNfYXBwX21ldGFkYXRhIHVwZGF0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgZGVsZXRlOnVzZXJzX2FwcF9tZXRhZGF0YSBjcmVhdGU6dXNlcnNfYXBwX21ldGFkYXRhIGNyZWF0ZTp1c2VyX3RpY2tldHMgcmVhZDpjbGllbnRzIHVwZGF0ZTpjbGllbnRzIGRlbGV0ZTpjbGllbnRzIGNyZWF0ZTpjbGllbnRzIHJlYWQ6Y2xpZW50X2tleXMgdXBkYXRlOmNsaWVudF9rZXlzIGRlbGV0ZTpjbGllbnRfa2V5cyBjcmVhdGU6Y2xpZW50X2tleXMgcmVhZDpjb25uZWN0aW9ucyB1cGRhdGU6Y29ubmVjdGlvbnMgZGVsZXRlOmNvbm5lY3Rpb25zIGNyZWF0ZTpjb25uZWN0aW9ucyByZWFkOnJlc291cmNlX3NlcnZlcnMgdXBkYXRlOnJlc291cmNlX3NlcnZlcnMgZGVsZXRlOnJlc291cmNlX3NlcnZlcnMgY3JlYXRlOnJlc291cmNlX3NlcnZlcnMgcmVhZDpkZXZpY2VfY3JlZGVudGlhbHMgdXBkYXRlOmRldmljZV9jcmVkZW50aWFscyBkZWxldGU6ZGV2aWNlX2NyZWRlbnRpYWxzIGNyZWF0ZTpkZXZpY2VfY3JlZGVudGlhbHMgcmVhZDpydWxlcyB1cGRhdGU6cnVsZXMgZGVsZXRlOnJ1bGVzIGNyZWF0ZTpydWxlcyByZWFkOmVtYWlsX3Byb3ZpZGVyIHVwZGF0ZTplbWFpbF9wcm92aWRlciBkZWxldGU6ZW1haWxfcHJvdmlkZXIgY3JlYXRlOmVtYWlsX3Byb3ZpZGVyIGJsYWNrbGlzdDp0b2tlbnMgcmVhZDpzdGF0cyByZWFkOnRlbmFudF9zZXR0aW5ncyB1cGRhdGU6dGVuYW50X3NldHRpbmdzIHJlYWQ6bG9ncyByZWFkOnNoaWVsZHMgY3JlYXRlOnNoaWVsZHMgZGVsZXRlOnNoaWVsZHMgcmVhZDpncmFudHMgZGVsZXRlOmdyYW50cyByZWFkOmd1YXJkaWFuX2ZhY3RvcnMgdXBkYXRlOmd1YXJkaWFuX2ZhY3RvcnMgcmVhZDpndWFyZGlhbl9lbnJvbGxtZW50cyBkZWxldGU6Z3VhcmRpYW5fZW5yb2xsbWVudHMgY3JlYXRlOmd1YXJkaWFuX2Vucm9sbG1lbnRfdGlja2V0cyByZWFkOnVzZXJfaWRwX3Rva2VucyJ9.a3YGhNPFy6Dd-_qPkEItSKDu6j7soS2fy-Ux4I3o8y290TgZ2cuYN5KixIkay0HSP73qLZ2BY3m9see1cDDbzftQZBUeEZa4uqBLDvF3e8tqoR5a6Yk4vJYcBfcpD7xD0nwwBOWqjQ7-fzLixzTmWrEnx8WUtGskWVLgzl_G-Wf8IHyoDrk0h4QFCBnUhYxdD6owTMRd0aI_IL-F_MghWRIbkivGi4IpQeu68TLddBo_KXJwUQoVlhOsMhY_kwMIa6t9kIFGGSvlrQYNuzJUTZwIp-gi0TN6VEgY1cwD2T2wy0Lc_l4jurws9OhsXnXMOdBTp6MlE6Zwt5LcqnUcrg' } };

  request(options, function (error, response, users) {
    if (error) throw new Error(error);

    // name, email, picture
    res.render("index", {users: JSON.parse(users)});
  });


});

// messages
app.post('/messages/create', messages.create);
app.post('/messages/show/:id', messages.show);
app.get('/messages/image/:id', messages.image);
app.get('/messages/stone/:id', messages.stone);

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


//to: refactor (?)
app.get('/user/configure', messages.configure);


// start server
app.listen(port, function () {
  console.log('Listening on port 3000!');
});
