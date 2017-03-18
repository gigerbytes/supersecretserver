var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = mongoose.Schema({ 
	username: String,
	passwdHash: String,
	salt: String
});

var User = mongoose.model("User", "userSchema")