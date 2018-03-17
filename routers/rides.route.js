const express = require('express')
const router = express.Router()
const Ride = require('../models/rides')
const User = require('../models/users')
router.get('/', (req, res, next) => {
	Ride.find()
		.populate('driver')
		.populate('requests')
		.populate('match')
		.then(rides => res.status(200).json(rides))
		.catch(err => {
			console.log(err)
			return next(err)
		})
})

router.get('/:id', (req, res, next) => {
	Ride.findById(req.params.id)
		.populate('driver')
		.populate('requests')
		.populate('match')
		.then(ride => res.status(200).json(ride))
		.catch(err => {
			console.log(err)
			return next(err)
		})
})

router.post('/', (req, res, next) => {
	const {
		startCity,
		startState,
		arriveCity,
		arriveState,
		scheduleDate,
		rideCost,
		driver,
		disClaimer
	} = req.body
	const newRide = {
		startCity: startCity.toUpperCase(),
		startState: startState.toUpperCase(),
		arriveCity: arriveCity.toUpperCase(),
		arriveState: arriveState.toUpperCase(),
		scheduleDate,
		rideCost,
		driver,
		disClaimer
	}
	User.findOneAndUpdate({ _id: driver }, { host: true }, { new: true })
		.then(user => {
			return Ride.create(newRide)
		})
		.then(rides => {
			return res.status(200).json(rides)
		})
		.catch(err => {
			return next(err)
		})
})

router.put('/requests/:id', (req, res, next) => {
	//to do validation
	const { userId } = req.body
	const rideId = req.params.id
	Ride.findByIdAndUpdate(rideId, { $push: { requests: userId } }, { new: true })
		.then(ride => {
			if (!ride) {
				const err = new Error('nothing got returned')
				err.status = 400
				return err
			}
			res.status(201).json(ride)
		})
		.catch(err => {
			console.log(err)
		})
})

router.put('/match/:id', (req, res, next) => {
	const { driverId, passengerId } = req.body
	const rideId = req.params.id
	Ride.findByIdAndUpdate(rideId, { match: [driverId, passengerId] })
		.then(ride => {
			const driverUpdate = User.findByIdAndUpdate(driverId, { match: rideId })
			const passengerUpdate = User.findByIdAndUpdate(passengerId, {
				match: rideId
			})
			return Promise.all([driverUpdate, passengerUpdate])
		})
		.then(results => {
			res.status(200).json({ message: 'update completed', rideId })
		})
		.catch(next)
})

router.put('/:id', (req, res, next) => {
	//todos: validate fields
	const {
		startCity,
		startState,
		arriveCity,
		arriveState,
		scheduleDate,
		rideCost,
		disClaimer
	} = req.body
	const update = {
		startCity,
		startState,
		arriveCity,
		arriveState,
		scheduleDate,
		rideCost,
		disClaimer
	}
	Ride.findByIdAndUpdate(req.params.id, { $set: update }, { new: true })
		.then(ride => {
			res.status(200).json({ message: 'update successful', content: ride })
		})
		.catch(next)
})

router.delete('/requests/:id', (req, res, next) => {
	const rideId = req.params.id
	Ride.findByIdAndUpdate(rideId, { requests: [] })
		.then(result =>
			res.status(202).json({ message: 'requests delete success', rideId })
		)
		.catch(next)
})
module.exports = router
