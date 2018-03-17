const express = require('express')
const router = express.Router()
const User = require('../models/users')
const passport = require('passport')
const options = { session: false, failWithError: true }
const localAuth = passport.authenticate('local', options)
const jwt = require('jsonwebtoken')
const { JWT_SECRET, JWT_EXPIRY } = require('../config')

function createAuthToken(user) {
	return jwt.sign({ user }, JWT_SECRET, {
		subject: user.email,
		expiresIn: JWT_EXPIRY
	})
}

router.get('/log-in', (req, res, next) => {
	res.json({ message: 'hello from auth router' })
})

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
