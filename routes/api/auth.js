const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');

// @route GET api/auth
// @desc Test route
// @access Public
// uso -auth- como segundo param como interceptor
router.get('/', auth, async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password") // no quiero que me traiga la password
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route POST api/auth
// @desc Authenticate user and get token
// @access Public
router.post(
    '/', [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    async(req, res) => {
        console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // si hay errores mando un 400 y devuelvo los errores en el response
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;

        try {
            // see if the users exists
            let user = await User.findOne({ email });

            if (!user) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid credentials' }] });
            }

            const isMatch = await bcrypt.compare(password, user.password); // TODO fix db

            if (!isMatch) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid credentials' }] });
            }

            // return jwt
            const payload = {
                user: {
                    id: user.id, // no tengo que llamarlo _id (como figura en la mongodb) porque uso mongoose
                },
            };

            jwt.sign(
                payload,
                config.get('jwtSecret'), {
                    expiresIn: 36000000, // 3600 es un valor productivo
                },
                (err, token) => {
                    if (err) {
                        throw err;
                    }
                    console.log(token);
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

module.exports = router;