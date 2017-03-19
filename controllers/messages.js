var qrCode = require('qr-image')
var mongoose = require('mongoose');
var User = require('../models/User');

var Schema = mongoose.Schema;
var messageSchema = new Schema({
	recepientId: String,
	messageBody: String,
});
var Message = mongoose.model('Message', messageSchema);


// Create - Creates a new message
// Image - Generate QR Code
// Show - Shows message

exports.configure = function (req, res){
	var username = res.locals.user.displayName;
	User.find({"username": username}, function(err, user){
		user = user[0];
		console.log(user);
		var privateKey = user.privateKey;
		console.log(privateKey);
		var qr_privkey = qrCode.image(privateKey, { type: 'png' });
		res.set('Content-Type', 'image/png');
		qr_privkey.pipe(res);
	});
}

exports.create = function( req, res ) {
	Message.create({
		recepientId: req.body.recipient,
		messageBody: req.body.message
	},
		function (err, message) {
		  if (err) res.status(500).send('Something broke!' + err);
		  res.send(message._id)
		})
}

exports.stone  = function( req, res ) {
	message = req.param('id');
	res.render("stone", {message: message});
};

exports.image = function(req, res) {
	messageId = req.param('id');
	var baseurl = (process.env.NODE_ENV == 'production' ? 'https://supersecretserver.herokuapp.com':'localhost:3000');
	var wholeUrl = baseurl + '/messages/show/'+ messageId;

	var qr_png = qrCode.image(wholeUrl, { type: 'png' });
	res.set('Content-Type', 'image/png');
	qr_png.pipe(res);
}

exports.show = function(req, res) {
	// Authenticate user
	// Send msg as json
	console.log(req.body.password);
	console.log("-----");
	console.log(req.body);
	if(req.body.password == '1234'){
		messageId = req.param('id');
		console.log(messageId);
		Message.findById(messageId, function(err, message) {
			console.log(message);
			if (err) res.status(500).send('Something broke!' + err);
			res.json({'message': message.messageBody});
		});
	} else {
		console.log("else");
		res.json({'message': 'Wrong Password, Try Again'});
	}
	console.log('end')
}
