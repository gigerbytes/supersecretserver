var qrCode = require('qr-image')
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// var userSchema = mongoose.Schema({ 
// 	username: String,
// 	passwdHash: String,
// 	salt: String
// });
//
// var User = mongoose.model("User", "userSchema")

// Model
var messageSchema = new Schema({
	recepientId: String,
	messageBody: String,
	qrCode: String,
	urlSlug: String,
});

Message = mongoose.model('Message', messageSchema);



exports.index = function(req, res) {
	res.render("../views/index");
}

exports.new = function( req, res ) {
	res.render("../views/messages");
}

exports.create = function( req, res ) {
	//welcome to callback hell
	Message.create({ recepientId: req.body.recipient, messageBody: req.body.message }, function (err, message) {
	  if (err) res.status(500).send('Something broke!' + err);
	  res.redirect('/messages/image/'+message._id)
	})
}

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
	console.log(req.body);
	if(req.body.password == '1234'){
		messageId = req.param('id');
		Message.findById(messageId, function(err, message) {
			if (err) res.status(500).send('Something broke!' + err);
			res.json({'message': message.messageBody});
		});
	} else {
		res.json({'message': 'Wrong Password, Try Again'});
	}
}

exports.old_show = function(req, res) {
	// Authenticate user
	// Send msg as json
	messageId = req.param('id');
	Message.findById(messageId, function(err, message) {
		if (err) res.status(500).send('Something broke!' + err);
		res.send(message.messageBody);
	});
}

exports.list = function( req, res ) {
	Message.find({}, function(err, messages) {
		res.send(`${messages}`);
	})
}
