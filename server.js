var express = require('express');
var mongoose = require('mongoose');

var app = express();

var port = process.env.PORT || 3000;
var db = process.env.MONGODB_URI || "mongodb://heroku_14r5fjjv:cspbhrn9cceku0ss1k7t758evs@ds133260.mlab.com:33260/heroku_14r5fjjv";
mongoose.connect(db);

//routes
app.use('/', require('./routes.js'));


app.listen(port, function () {
  console.log('Example app listening on port 3000!');
});
