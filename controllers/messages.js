var Message = require('../models/Message');

exports.new = function( req, res ) {

	res.render("../views/messages");

}

exports.create = function( req, res ) {

	// ...
	console.log(req);
	res.send(".");
}
