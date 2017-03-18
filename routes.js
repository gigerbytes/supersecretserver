var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

var router = module.exports = express.Router();

var messages = require("./controllers/messages");

// home
router.get('/', messages.index);

// messages
router.get('/messages/new', messages.new);
router.post('/messages/create', messages.create);
router.get('/messages/show/:id', messages.show);
router.get('/messages/list', messages.list);
router.get('/messages/image/:id', messages.image);


// ############################
// Auth0 - users
// Render the login template
router.get('/login',
  function(req, res){
    console.log(callbackURL)
    res.render('login', { env: process.env, callbackURL: callbackURL });
  });

// Perform the final stage of authentication and redirect to '/user'
router.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/' }),
  function(req, res) {
    console.log('authenticated')
    res.redirect(req.session.returnTo || '/user');
  });

// Perform session logout and redirect to homepage
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Get the user profile
router.get('/user', ensureLoggedIn, function(req, res, next) {
  res.render('user', { user: req.user });
});
