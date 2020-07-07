const express = require('express');
const router = express.Router();
// para validaciones de lo que mandan en el request
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route GET api/users
// @desc Test route
// @access Public
// es public porque no necesita token
router.get('/', (req, res) => res.send('User route'));

// @route POST api/users
// @desc Register user
// @access Public
// es public porque no necesita token
router.post(
    '/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
        'password',
        'Please enter a password with six or more char'
    ).isLength({ min: 6 }),
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // si hay errores mando un 400 y devuelvo los errores en el response
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        const { name, email, password } = req.body;

        try {
            // see if the users exists
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
            }

            // get users gravatar
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg', // no naked people photos gg
                d: 'mm',
            });

            user = new User({
                name,
                email,
                avatar,
                password,
            });

            // encrypt password using bcrypt
            const salt = await bcrypt.genSalt(10); // 10 is recommended in documentation
            user.password = await bcrypt.hash(password, salt); // this creates the hash

            await user.save(); // uso await-async en lugar de .then porque es la forma cool ahre

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