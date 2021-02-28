const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
	let token;

	// Set token from Bearer token in header
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}

	// Check if no token
	if (!token) {
		return res.status(401).json({ msg: 'No token, authorization denied' });
	}

	// Verify token
	try {
		const decoded = jwt.verify(token, config.get('jwtSecret'));

		req.user = decoded.user;
		next();
	} catch (err) {
		res.status(401).json({ msg: 'Token not valid' });
	}
};
