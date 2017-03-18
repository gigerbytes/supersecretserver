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
	// ...
	console.log(req.body.message);
	console.log(req.body.recipient);
	//save to DB logic

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