const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator/check')
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/authenticate');

// @route  POST api/users
// @desc   Register user
// @access Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('surname', 'Surname is requires').not().isEmpty(),
    check('email', 'Please enter a valid email.').isEmail(),
    check('password', 'Please enter a password with 8 or more characters').isLength({min: 8}),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    const {name, surname, email, password} = req.body;
    //Email daha once alinmis mi? Token.Encryp islemlerini burada toparladim.Modelde sadece schemayı bırakmak adına.
    try {
        let user = await User.findOne({'email': email});
        if (user) {
            //Bad request
            return res.status(400).json({errors: [{msg: 'User already exists.'}]});
        }
        const avatar = gravatar.url(email, {
            //defult size
            s: '200',
            r: 'pg',
            d: 'mm',
        })
        user = new User({name, email, surname, avatar, password});
        //Encrypt password
        const salt = await bcrypt.genSalt(10);
        //hash olusturup user password icine koyariz
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        //Return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(payload, "mysecretjwttoken", {expiresIn: 360000}, (err, token) => {
            if (err) throw err;
            res.json({token});
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

});
router.post('/update', auth, async (req, res) => {
    console.log("this is req",req.user);
    const {name, surname, email} = req.body;
    console.log(name,surname,email);
    //build user object
    const userFields = {};
    if (name) userFields.name = name;
    if (surname) userFields.surname = surname;
    if (email) userFields.email = email;
    try {
        let userUp = await User.findOneAndUpdate({_id: req.user.id}, {$set: userFields},{new: true});
        return res.json(userUp);
        console.log('User updated');

    } catch (e) {
        console.error(e.message);
        res.status(500).send('Server error');
    }


});
module.exports = router;
