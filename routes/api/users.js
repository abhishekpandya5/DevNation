const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
// importimg User Model
const User = require('../../models/User');

// @desc    Register User
// @route   POST api/users
// @access  Public
router.post(
	'/',
	[
		check('name', 'Name is required').not().isEmpty(),
		check('email', 'Please include a valid email').isEmail(),
		check(
			'password',
			'Please enter a password with 6 or more characters'
		).isLength({ min: 6 })
	],
	async (req, res) => {
		// Finds any validation error
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password } = req.body;

		try {
			// See if user exists
			let user = await User.findOne({ email });
			if (user) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'User already exists' }] });
			}

			// Get users gravatar
			const avatar = gravatar.url(email, {
				s: '200', //size
				r: 'pg', //default
				d: 'mm' //rating
			});

			// creating a new instance from User model but not saving to DB in this step.
			user = new User({
				name,
				email,
				avatar,
				password
			});

			// Encrypt password
			const salt = await bcrypt.genSaltSync(10);
			user.password = await bcrypt.hash(password, salt);
			await user.save();

			// Return jsonwebtokens
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
					return res.status(201).json({
						user,
						token
					});
				}
			);
		} catch (err) {
			console.log(err.message);
			return res.status(500).send('Server Error');
		}
	}
);

module.exports = router;
