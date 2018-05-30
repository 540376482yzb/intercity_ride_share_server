const express = require('express')
const router = express.Router()
const Ride = require('../models/rides')
const User = require('../models/users')
const jwtDecode = require('jwt-decode')

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
	//todo - check token to verify it's the same person

	const {
		startCity,
		startState,
		arriveCity,
		arriveState,
		scheduleDate,
		rideCost,
		driver,
		startCoordinate,
		arriveCoordinate,
		maxOccupancy
	} = req.body

	//validate user
	const validateError = validateUser(req, driver)
	if (validateError) return next(validateError)

	const newRide = {
		startCity: startCity.toLowerCase(),
		startState: startState.toUpperCase(),
		arriveCity: arriveCity.toLowerCase(),
		arriveState: arriveState.toUpperCase(),
		maxOccupancy,
		startCoordinate,
		arriveCoordinate,
		scheduleDate,
		rideCost,
		driver,
		match: [driver]
	}
	User.findOne({_id: driver})
		.then(user => {
			if (user.host) {
				const error = new Error('You can\'t host 2 trips at the same time')
				error.status = 400
				return next(error)
			}
			return Ride.create(newRide)
		})
		.then(ride => {
			return User.findOneAndUpdate(
				{_id: driver},
				{host: true, match: ride.id, sentRequests: []},
				{new: true}
			)
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
	const {userId} = req.body
	const {id} = req.params
	//to do compare token user to userId from req.body
	// to verify it's from same person

	const validateError = validateUser(req, userId)
	if (validateError) return next(validateError)

	User.findById(userId)
		.then(user => {
			const alreadySent = user.sentRequests.find(requestId => requestId.equals(id))
			if (alreadySent) {
				return res.status(400).json({message: 'You have already requested it'})
			}
			const updateRide = Ride.findByIdAndUpdate(id, {$push: {requests: userId}}, {new: true})
			const updateUser = User.findByIdAndUpdate(userId, {$push: {sentRequests: id}}, {new: true})
			return Promise.all([updateRide, updateUser])
		})
		.then(([ride, user]) => {
			if (ride) {
				return res.status(201).json({
					message: 'sent request successful',
					content: {
						user,
						ride
					}
				})
			}
			const err = new Error('failed to update ride')
			err.status = 400
			return next(err)
		})
		.catch(err => {
			console.log(err)
		})
})

router.put('/match/:id', (req, res, next) => {
	//todo verify driver is the same user in token
	const {driverId, passengerId, manualLock} = req.body
	const rideId = req.params.id

	const validateError = validateUser(req, driverId)
	if (validateError) return next(validateError)
	if (manualLock) {
		Ride.findByIdAndUpdate(rideId, {lock: manualLock === 'lock' ? true : false})
			.then(results => {
				res.status(201).json({message: 'update completed', rideId})
			})
			.catch(next)
	} else {
		User.findByIdAndUpdate(passengerId, {$set: {match: rideId}}, {new: true})
			.then(user => Ride.findById(rideId))
			.then(ride => {
				console.log(ride.match.length)
				const lock = ride.match.length >= ride.maxOccupation - 1 ? true : false
				return Ride.findByIdAndUpdate(
					rideId,
					{$push: {match: passengerId}, $set: {lock}},
					{new: true}
				)
			})
			.then(results => {
				res.status(201).json({message: 'update completed', rideId})
			})
			.catch(next)
	}
})

router.put('/:id', (req, res, next) => {
	//todos: validate fields
	//todos: very the person operates is the same in token

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

	const validateError = validateUser(req, driver)
	if (validateError) return next(validateError)

	const update = {
		startCity,
		startState,
		arriveCity,
		arriveState,
		scheduleDate,
		rideCost
	}
	Ride.findByIdAndUpdate(req.params.id, {$set: update}, {new: true})
		.then(ride => {
			res.status(200).json({message: 'update successful', content: ride})
		})
		.catch(next)
})

router.delete('/:id', (req, res, next) => {
	const rideId = req.params.id
	const {currentUserId} = req.body
	const validateError = validateUser(req, currentUserId)
	if (validateError) return next(validateError)
	Ride.findById(rideId)
		.then(ride => {
			let allPromises = []
			ride.match.forEach(user => {
				if (user.toString() === currentUserId) {
					allPromises.push(
						User.findByIdAndUpdate(user, {match: null, host: false, pendingReview: null})
					)
				} else {
					allPromises.push(
						User.findByIdAndUpdate(user, {match: null, host: false, pendingReview: currentUserId})
					)
				}
			})
			return Promise.all(allPromises)
		})
		.then(() => {
			return Ride.findByIdAndRemove(rideId)
		})
		.then(user => {
			res.status(201).json({message: 'update success'})
		})
		.catch(next)
})

router.delete('/match/:id', (req, res, next) => {
	//todo verify driver is the same user in token

	const {driverId, passengerId} = req.body

	const validateError = validateUser(req, driverId)
	if (validateError) return next(validateError)

	const rideId = req.params.id
	Ride.findByIdAndRemove(rideId)
		.then(() => {
			const driverUpdate = User.findByIdAndUpdate(driverId, {match: null, host: null}, {new: true})
			const passengerUpdate = User.findByIdAndUpdate(
				passengerId,
				{
					match: null
				},
				{new: true}
			)
			return Promise.all([driverUpdate, passengerUpdate])
		})
		.then(results => {
			res.status(200).json({message: 'update completed', results})
		})
		.catch(next)
})
module.exports = router

function validateUser(request, userId) {
	const authToken = request.headers.authorization.split(' ')[1]
	const currentUser = jwtDecode(authToken).user
	if (currentUser.id !== userId) {
		const err = new Error('un-authorized attempt is denied')
		err.status = 422
		return err
	}
	return false
}
