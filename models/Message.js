var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = new Schema({ 
	recepientId: String,
	messageBody: String,
	qrCode: String,
	urlSlug: String,
});

var Message  = mongoose.model('Story', messageSchema);