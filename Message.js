var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = mongoose.model({ 
	recepientId: String,
	messageBody: String,
	qrCode: String,
	urlSlug: String,
});

var Message  = mongoose.model('Story', messageSchema);