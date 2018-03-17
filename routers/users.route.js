const express = require('express')
const router = express.Router()
const User = require('../models/users')

router.get('/sign-up', (req, res, next) => {
	User.find()
		.then(users => res.status(200).json(users))
		.catch(next)
})
router.post('/sign-up', (req, res, next) => {
	const { email, firstName, lastName, password } = req.body

	//todo: field validations

	return User.hashPassword(password)
		.then(digest => {
			const newUser = { email, firstName, lastName, password: digest }
			return User.create(newUser)
		})
		.then(user => {
			return res
				.status(200)
				.location(`${req.originalUrl}/${user.id}`)
				.json(user)
		})
		.catch(err => {
			if (err.code === 11000) {
				err = new Error('The email has already exist')
				err.status = 400
			}
			next(err)
		})
})

module.exports = router
