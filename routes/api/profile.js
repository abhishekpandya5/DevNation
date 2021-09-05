const express = require('express');
const config = require('config');
// const request = require('request');
const axios = require('axios');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @desc     Get my profile
// @route    GET api/profile/me
// access    Private
router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.user.id
		}).populate('User', ['name', 'avatar']);

		if (!profile) {
			return res.status(400).json({ msg: 'There is no profile for this user' });
		}

		res.status(200).json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @desc     Get all profiles
// @route    GET api/profile
// access    Public
router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('User', ['name', 'avatar']);
		res.status(200).json({
			count: profiles.length,
			data: profiles
		});
	} catch (err) {
		console.error(err.message);
		return res.status(500).send('Server Error');
	}
});

// @desc     Get profile by User ID
// @route    GET api/profile/user/user_id
// access    Public
router.get('/user/:user_id', async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id
		}).populate('User', ['name', 'avatar']);

		if (!profile) {
			return res.status(400).json({ msg: 'Profile not found' });
		}

		res.status(200).json(profile);
	} catch (err) {
		console.error(err.message);
		if (err.kind == 'ObjectId') {
			console.log(err.name);
			console.log(err.kind);
			return res.status(400).json({ msg: 'Profile not found' });
		}
		return res.status(500).send('Server Error');
	}
});

// @desc     Create User Profile
// @route    POST api/profile
// access    Public
router.post(
	'/',
	auth,
	[
		check('status', 'Please provide status').not().isEmpty(),
		check('skills', 'Please add relevant skills').not().isEmpty()
	],
	async (req, res) => {
		// Finds any validation error
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			company,
			website,
			location,
			status,
			skills,
			bio,
			githubusername,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedIn
		} = req.body;

		// Build profile Object
		const profileFields = {};

		profileFields.user = req.user.id;
		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (status) profileFields.status = status;

		if (skills) {
			profileFields.skills = skills.split(',').map((skill) => skill.trim());
		}

		// Build social object
		profileFields.social = {};
		if (youtube) profileFields.social.youtube = youtube;
		if (facebook) profileFields.social.facebook = facebook;
		if (twitter) profileFields.social.twitter = twitter;
		if (instagram) profileFields.social.instagram = instagram;
		if (linkedIn) profileFields.social.linkedIn = linkedIn;

		if (bio) profileFields.bio = bio;
		if (githubusername) profileFields.githubusername = githubusername;

		try {
			let profile = await Profile.findOne({ user: req.user.id });

			if (profile) {
				// update if profile exists
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
					// set the new option to true to return the document after update was applied.
				);

				return res.status(200).json(profile);
			}

			// Create new profile
			profile = new Profile(profileFields);

			await profile.save();

			return res.status(201).json(profile);
		} catch (err) {
			console.error(err.message);
			return res.status(500).send('Server Error');
		}
	}
);

// @desc     Add profile experience
// @route    PUT api/profile/experience
// access    Private
router.put(
	'/experience',
	[
		auth,
		[
			check('title', 'Title is required').not().isEmpty(),
			check('company', 'Company is required').not().isEmpty(),
			check('from', 'From date is required').not().isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { title, company, location, from, to, current, description } =
			req.body;

		const newExp = {
			title,
			company,
			location,
			from,
			to,
			current,
			description
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });

			profile.experience.unshift(newExp);

			profile.save();

			res.status(200).json({
				profile
			});
		} catch (err) {
			console.error(err);
			res.status(500).send('Server Error');
		}
	}
);

// @desc     Delete experience from user profile
// @route    DELETE api/profile/experience/:exp_id
// access    Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		// Get remove index
		// const removeIndex = profile.experience.findIndex(item => item._id == req.params.exp_id);
		const removeIndex = profile.experience
			.map((item) => item.id)
			.indexOf(req.params.exp_id);

		if (removeIndex == -1) {
			return res.status(400).send('No record found');
		}

		profile.experience.splice(removeIndex, 1);

		await profile.save();

		res.status(200).json({
			msg: 'Record updated',
			profile
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @desc     Add profile Education
// @route    PUT api/profile/education
// access    Private
router.put(
	'/education',
	[
		auth,
		[
			check('school', 'Schoolitle is required').not().isEmpty(),
			check('degree', 'Degree is required').not().isEmpty(),
			check('fieldOfStudy', 'Firld of Study is required').not().isEmpty(),
			check('from', 'From date is required').not().isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { school, degree, fieldOfStudy, from, to, current, description } =
			req.body;

		const newEducation = {
			school,
			degree,
			fieldOfStudy,
			from,
			to,
			current,
			description
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });

			profile.education.unshift(newEducation);

			profile.save();

			res.status(200).json({
				success: true,
				data: profile
			});
		} catch (err) {
			console.error(err);
			res.status(500).send('Server Error');
		}
	}
);

// @desc     Delete education from user's profile
// @route    DELETE api/profile/education/:exp_id
// access    Private
router.delete('/education/:edu_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		// Get remove index
		// const removeIndex = profile.education.findIndex(item => item._id == req.params.exp_id);
		const removeIndex = profile.education
			.map((item) => item.id)
			.indexOf(req.params.edu_id);

		if (removeIndex == -1) {
			return res.status(400).send('No record found');
		}

		profile.education.splice(removeIndex, 1);

		await profile.save();

		res.status(200).json({
			msg: 'Record updated',
			profile
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @desc     Delete Profile, user and posts
// @route    DELETE api/profile
// access    Private
router.delete('/', auth, async (req, res) => {
	try {
		// @todo - Delete user's posts

		// Delete profile
		await Profile.findOneAndDelete({ user: req.user.id });
		// Delete user
		await User.findOneAndDelete({ _id: req.user.id });

		return res.status(200).json({ msg: 'User deleted' });
	} catch (err) {
		console.error(err.message);
		res.status(400).send('Server Error');
	}
});

// @desc     Get user's Github repos
// @route    GET api/profile/github/:username
// access    Private
router.get('/github/:username', (req, res) => {
	try {
		const options = {
			uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get(
				'githubClientId'
			)}&client_secret=${config.get('githubClientSecret')}`,
			method: 'GET',
			headers: { 'user-agent': 'node.js' }
		};

		/* request(options, (error, response, body) => {
			if (error) console.error(error);

			if (response.statusCode !== 200) {
				return res.status(400).json({ msg: 'No github profile found' });
			}

			res.json(JSON.parse(body));
		}); */

		axios.get(options.uri).then((response) => {
			if (response.status !== 200) {
				return res.status(400).json({ msg: 'No github profile found' });
			}

			res.json(response.data);
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
