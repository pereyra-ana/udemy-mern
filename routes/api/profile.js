const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const request = require('request');
const config = require('config');

const { check, validationResult } = require('express-validator');
const { route } = require('./users');
const nodemon = require('nodemon');

// @route GET api/profile/me
// @desc Get current users profile
// @access Private
router.get('/me', auth, async(req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id,
        }).populate('user', ['name', 'avatar']); // populate con parametros, para traerme los campos que quiero

        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route POST api/profile
// @desc Create or update a user profile
// @access Private
router.post(
    '/', [
        auth, [
            check('status', 'Status is required').not().isEmpty(),
            check('skills', 'Skills is required').not().isEmpty(),
        ],
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin,
        } = req.body;

        // build profile object
        const profileFileds = {};
        profileFileds.user = req.user.id;
        if (company) profileFileds.company = company;
        if (website) profileFileds.website = website;
        if (location) profileFileds.location = location;
        if (bio) profileFileds.bio = bio;
        if (status) profileFileds.status = status;
        if (githubusername) profileFileds.githubusername = githubusername;

        if (skills) {
            profileFileds.skills = skills.split(',').map((skill) => skill.trim());
        }

        console.log(skills);
        console.log(profileFileds.skills);

        // build social object
        profileFileds.social = {};
        if (youtube) profileFileds.social.youtube = youtube;
        if (twitter) profileFileds.social.twitter = twitter;
        if (facebook) profileFileds.social.facebook = facebook;
        if (linkedin) profileFileds.social.linkedin = linkedin;
        if (instagram) profileFileds.social.instagram = instagram;

        try {
            // siempre que llamo a algun metodo de mongoose, pongo un await porque devuelve una promesa
            let profile = await Profile.findOne({ user: req.user.id });

            if (profile) {
                // update
                profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFileds }, { new: true });

                return res.json(profile);
            }

            // create
            profile = new Profile(profileFileds);
            await profile.save();
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);


// @route GET api/profile
// @desc Get all profiles
// @access Public
router.get('/', async(req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route GET api/profile/user/:user_id
// @desc Get profile by user id
// @access Public
router.get('/user/:user_id', async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);

        if (!profile) return res.status(400).json({ msg: 'There is no profile for this user' });

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') // si no es un id valido
            return res.status(400).json({ msg: 'There is no profile for this user' });
        res.status(500).send('Server error');
    }
});

// @route DELETE api/profile
// @desc Delete profile, user, posts
// @access Private
router.delete('/', auth, async(req, res) => {
    try {
        // @todo remove users posts

        // remove profile
        await Profile.findOneAndRemove({ user: req.user.id });

        // remove user
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: 'Profile deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route PUT api/profile/experience
// @desc Add profile experience
// @access Private
router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title, // podria hacerse como title: title
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newExp);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route DELETE api/profile/experience/:exp_id
// @desc Delete experience from profile
// @access Private
router.delete('/experience/:exp_id', auth, async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        // get the remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);

        await profile.save();

        res.json(profile)

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

// @route PUT api/profile/education
// @desc Add profile education
// @access Private
router.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school, // podria hacerse como school: school
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEdu);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route DELETE api/profile/education/:edu_id
// @desc Delete education from profile
// @access Private
router.delete('/education/:edu_id', auth, async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        // get the remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.exp_id);

        profile.education.splice(removeIndex, 1);

        await profile.save();

        res.json(profile)

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

// @route GET api/profile/github/:username
// @desc GET user repos from github
// @access Public
router.get('/github/:username', (req, res) => {
    try {
        // traigo los repos de github
        const options = {
            uri: 'https://api.github.com/users/' + req.params.username +
                '/repos?per_page=5&sort=created:asc&client_id=' + config.get('githubClientId') + '&client_secret=' +
                config.get('githubSecret'),
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        }

        request(options, (error, response, body) => {
            if (error) {
                console.error(error.message);
            }

            if (response.statusCode !== 200) {
                return res.status(404).json({ msg: 'No Github profile found' });
            }

            res.json(JSON.parse(body));
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

module.exports = router;