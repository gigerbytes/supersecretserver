var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

var router = module.exports = express.Router();

// controllers
var messages = require("./controllers/messages");

router.get('/', function (req, res) {
  res.send('Hello World!');
});

router.get('/messages/new', messages.new);
router.post('/messages/create', messages.create);
router.get('/messages/show/:id', messages.show);
router.get('/messages/list', messages.list);
router.get('/messages/image/:id', messages.image);

// Auth0
// Render the login template
router.get('/login',
  function(req, res){
    res.render('login', { env: process.env });
  });

// Perform session logout and redirect to homepage
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Perform the final stage of authentication and redirect to '/user'
router.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/url-if-something-fails' }),
  function(req, res) {
    res.redirect(req.session.returnTo || '/user');
  });

// Get the user profile
router.get('/', ensureLoggedIn, function(req, res, next) {
  res.render('user', { user: req.user });
});
