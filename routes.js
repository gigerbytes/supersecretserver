var express = require('express');
var router = express.Router();

// controllers
var messages = require("./controllers/messagesController");

router.get('/', function (req, res) {
  res.send('Hello World!');
});

router.get('/message/new', messages.message_new);

module.exports = router;