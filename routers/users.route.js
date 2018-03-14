const express = require('express')
const router = express.Router()
const User = require('../models/users')

router.get('/', (req, res, next) => {
	User.find()
		.then(users => res.status(200).json(users))
		.catch(next)
})
router.post('/', (req, res, next) => {
	const { email, firstName, lastName, password, rating } = req.body
	const newUser = { email, firstName, lastName, password, rating }
	User.create(newUser)
		.then(user => {
			return res
				.status(200)
				.location(`${req.originalUrl}/${user.id}`)
				.json(user)
		})
		.catch(next)
})

module.exports = router
