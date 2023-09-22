const express = require('express')

const authController = require('../controllers/auth');
const { check, body } = require('express-validator');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin)

router.get('/signup', authController.getSignup);

router.get('/reset', authController.getReset)

router.post('/reset/:token', authController.getNewPassword)

router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        // khi làm sạch thì nó cx ảnh hưởng đến giá trị trong req.body khi POST
        .normalizeEmail(),
    body('password', 'Password has to be valid.')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim()
], authController.postLogin)

router.post('/signup', [
    check('email').isEmail().withMessage('Please enter a valid email.').normalizeEmail()
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('E-Mail exists already ,please pick a different one. ')
                    }
                })
        }),
    body('password')
        .isLength({ min: 5 })
        .withMessage('Please enter a password with only numbers and text and at least 5 characters.')
        .isAlphanumeric()
        .trim()
    , body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords have to match!')
        }
        return true
    })
], authController.postSignup);

router.post('/logout', authController.postLogout)

router.post('/reset', authController.postReset)

router.post('/new-password', authController.postNewPassword)

module.exports = router