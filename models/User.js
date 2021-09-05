const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please add a name']
	},
	email: {
		type: String,
		required: [true, 'Please add an email'],
		unique: true,
		match: [
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
			'Please add a valid email'
		]
	},
	password: {
		type: String,
		required: [true, 'Please enter password'],
		minlength: 6
	},
	avatar: {
		type: String
	},
	date: {
		type: String,
		default: Date.now
	}
});

module.exports = mongoose.model('User', UserSchema);
