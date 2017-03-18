var Message = require('../models/Message');

exports.new = function( req, res ) {

	res.render("../views/messages");

}

exports.create = function( req, res ) {

	Message.create({ recepientId: req.body.recipient, messageBody: req.body.message }, function (err, message) {
	  if (err) res.status(500).send('Something broke!' + err);
		res.send("Sent.")
	})

}
