var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  res.send('Hello World!');
});

router.post('/message/new', function (req, res) {
  res.send('POST request to the homepage \n')
});

module.exports = router;