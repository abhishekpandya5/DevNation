const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');

// @desc    Get user info
// @route   GET api/auth
// @access  Public
router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');

		if (!user) {
			return res.status(404).json({
				success: false,
				msg: 'No user found'
			});
		}

		res.status(200).json(user);
	} catch (err) {
		console.log(err.message);
		res.status(500).send('Server Error');
	}
});

// @desc    Login user
// @route   POST api/auth
// @access  Public
router.post(
	'/',
	[
		check('email', 'Please include a valid email').isEmail(),
		check('password', 'Password is required').exists()
	],
	async (req, res) => {
		// Finds any validation error
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			let user = await User.findOne({ email });
			if (!user) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'Invalid credentials' }] });
			}

			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'Invalid credentials' }] });
			}

			const payload = {
				user: {
					id: user.id
				}
			};

			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 360000 },
				(err, token) => {
					if (err) throw err;
					return res.status(200).json({ token });
				}
			);
		} catch (err) {
			console.log(err.messsage);
			res.status(500).send('Server Error');
		}
	}
);

module.exports = router;
