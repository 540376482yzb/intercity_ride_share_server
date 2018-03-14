const express = require('express')
const router = express.Router()
const Ride = require('../models/rides')
const City = require('../models/cities')
router.get('/', (req, res, next) => {
	Ride.find()
		.populate('driver')
		.populate('startCity')
		.populate('arriveCity')
		.then(rides => res.status(200).json(rides))
		.catch(err => {
			console.log(err)
			return next(err)
		})
})

router.post('/', (req, res, next) => {
	const { startCity, arriveCity, scheduleDate, rideCost, driver } = req.body
	const newRide = { startCity, arriveCity, scheduleDate, rideCost, driver }
	Ride.create(newRide)
		.then(ride => {
			return res
				.status(200)
				.location(`${req.originalUrl}/${ride.id}`)
				.json(ride)
		})
		.catch(err => {
			console.log(err)
			return next(err)
		})
})

module.exports = router
