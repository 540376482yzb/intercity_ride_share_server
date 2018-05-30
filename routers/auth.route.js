const express = require('express')
const router = express.Router()
const User = require('../models/users')
const passport = require('passport')
const options = { session: false, failWithError: true }
const jwt = require('jsonwebtoken')
const { JWT_SECRET, JWT_EXPIRY } = require('../config')
const localAuth = passport.authenticate('local', options)

function createAuthToken(user) {
	return jwt.sign({ user }, JWT_SECRET, {
		subject: user.email,
		expiresIn: JWT_EXPIRY
	})
}

router.post('/log-in', localAuth, (req, res, next) => {
	const authToken = createAuthToken(req.user)
	console.log(authToken)
	res.status(200).json({ authToken })
})
const jwtAuth = passport.authenticate('jwt', options)
router.post('/refresh', jwtAuth, (req, res, next) => {
	const authToken = createAuthToken(req.user)
	res.status(200).json({ authToken })
})

module.exports = router
