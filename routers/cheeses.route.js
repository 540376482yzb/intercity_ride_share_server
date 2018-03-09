const express = require('express')
const router = express.Router()
const Cheese = require('../models/cheeses')
router.get('/cheeses', (req, res, next) => {
	Cheese.find()
		.then(cheeses => res.status(200).json(cheeses))
		.catch(next)
})
router.post('/', (req, res, next) => {
	const { name } = req.body
	if (!name) {
		const err = new Error('name required')
		err.status = 400
		return next(err)
	}
	Cheese.create({ name })
		.then(cheese => {
			return res
				.status(200)
				.location(`${req.originalUrl}/${cheese.id}`)
				.json(cheese)
		})
		.catch(next)
})

module.exports = router
