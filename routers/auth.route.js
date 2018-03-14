const express = require('express')
const router = express.Router()
const User = require('../models/users')

router.get('/', (req, res, next) => {
	res.json({ message: 'hello from auth router' })
})

router.post('/', (req, res, next) => {
	const { email, password } = req.body
	const returnedUser = { email, password }
	console.log(returnedUser)
	User.findOne({ email: returnedUser.email })
		.then(user => {
			res
				.status(200)
				.location(`${req.originalUrl}/${user.id}`)
				.json(user)
		})
		.catch(err => {
			console.log(err)
			return next(err)
		})
})

module.exports = router
