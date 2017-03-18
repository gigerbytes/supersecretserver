var Message = require('../models/Message');
var QRCode = require('qrcode')



function generateQR(messageId, cb){

}

function renderQR(qrCode){
	console.log(qrCode);
	return qrCode;
}

exports.new = function( req, res ) {

	res.render("../views/messages");

}

exports.create = function( req, res ) {

	Message.create({ recepientId: req.body.recipient, messageBody: req.body.message }, function (err, message) {
	  if (err) res.status(500).send('Something broke!' + err);
	})

	// var baseurl = 'https://supersecretserver.herokuapp.com'
	var baseurl = 'localhost:3000'
	var uri = '/messages/show/'+ req.body.recipient;

	var wholeUrl = baseurl + uri;
	QRCode.toDataURL(wholeUrl, function (err, qrCode) {
		res.render("../views/show", {qrImg: qrCode});
	});
}

exports.show = function(req, res) {
	messageId = req.param('id');
}

exports.list = function( req, res ) {
	Message.find({}, function(err, users) {
		console.log(users);
		// if (err) res.status(500).send('Something broke!' + err);
		res.render(users);
	})
}
