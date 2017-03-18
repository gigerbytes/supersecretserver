var Message = require('../models/Message');

exports.new = function( req, res ) {

	res.render("../views/messages");

}

exports.create = function( req, res ) {

	// ...
	console.log(req.body.message);
	console.log(req.body.recipient);
	res.send(req.body.message);
}
