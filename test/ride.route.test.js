'use strict'
require('dotenv').config()
const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiSpies = require('chai-spies')
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config')
const { dbConnect, dbDisconnect } = require('../db-mongoose')
const mongoose = require('mongoose')
const app = require('../index.js')
const User = require('../models/users')
const Ride = require('../models/rides')
const seedUsers = require('../utils/seedUsers.json')
const seedRides = require('../utils/seedRides.json')
const jwt = require('jsonwebtoken')

// Set NODE_ENV to `test` to disable http layer logs
// You can do this in the command line, but this is cross-platform

// Clear the console before each run
process.stdout.write('\x1Bc\n')

const expect = chai.expect
chai.use(chaiHttp)
chai.use(chaiSpies)

describe('ride end points', function() {
	let token
	let passengerToken
	before(function() {
		return dbConnect(TEST_DATABASE_URL).then(() =>
			mongoose.connection.db.dropDatabase()
		)
	})
	beforeEach(function() {
		const userPromises = seedUsers.map(user => {
			return User.hashPassword(user.password).then(hash => {
				return User.create({
					_id: user._id,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					password: hash,
					rating: user.rating
				})
			})
		})

		const ridePromises = Ride.insertMany(seedRides)
		return Promise.all([...userPromises, ridePromises])
			.then(() => {
				return User.findOne({ _id: '000000000000000000000000' })
			})
			.then(user => {
				token = jwt.sign({ user }, JWT_SECRET, { subject: user.email })
				return User.findOne({ _id: '000000000000000000000002' })
			})
			.then(user => {
				passengerToken = jwt.sign({ user }, JWT_SECRET, { subject: user.email })
			})
			.catch(err => {
				console.log(err)
			})
	})
	afterEach(function() {
		return mongoose.connection.db.dropDatabase()
	})
	after(function() {
		return dbDisconnect()
	})

	describe('ride get route on /', function() {
		it('should return true', function() {
			return true
		})
		it('should not allow to be visited on unauthorized request', function() {
			return chai
				.request(app)
				.get('/api/board')
				.then(res => {
					expect(res).to.not.exist
				})
				.catch(err => {
					if (err instanceof chai.AssertionError) {
						throw err
					}
					expect(err.response).to.have.status(401)
					expect(err.response.body.message).to.equal('Unauthorized')
				})
		})

		it('should return array of rides on request', function() {
			return chai
				.request(app)
				.get('/api/board')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					expect(res).to.be.json
					expect(res).to.have.status(200)
					expect(res.body).to.be.an('array')
					expect(res.body.length).to.not.equal(0)
				})
		})
	})

	describe('ride get on /:id', function() {
		const rideId = '100000000000000000000000'
		it('should not be allowed to visited on unauthorized attempt', function() {
			return chai
				.request(app)
				.get(`/api/board/${rideId}`)
				.then(res => {
					expect(res).to.not.exist
				})
				.catch(err => {
					if (err instanceof chai.AssertionError) {
						throw err
					}
					expect(err.response).to.have.status(401)
					expect(err.response.body.message).to.equal('Unauthorized')
				})
		})
		it('should return ride object when request on :/id', function() {
			return chai
				.request(app)
				.get(`/api/board/${rideId}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					expect(res).to.be.json
					expect(res).to.have.status(200)
					expect(res.body).to.be.an('object')
					expect(res.body.id).to.equal(rideId)
				})
		})
	})

	describe('ride post on /', function() {
		const newRide = {
			startCity: 'Pittsburgh',
			startState: 'PA',
			arriveCity: 'New York',
			arriveState: 'NY',
			scheduleDate: '03-24-2018',
			rideCost: '15',
			driver: '000000000000000000000000',
			disClaimer: 'Please properly behave.'
		}
		it('should not be allowed to post on authorized attempt', function() {
			return chai
				.request(app)
				.post('/api/board')
				.send(newRide)
				.then(res => {
					expect(res).to.not.exist
				})
				.catch(err => {
					if (err instanceof chai.AssertionError) {
						throw err
					}
					expect(err.response).to.have.status(401)
					expect(err.response.body.message).to.equal('Unauthorized')
				})
		})

		it('should create a new ride and update user status on post request on /', function() {
			return chai
				.request(app)
				.post('/api/board')
				.send(newRide)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					expect(res).to.be.json
					expect(res).to.have.status(200)
					expect(res.body).to.be.an('object')
					return User.findById(res.body.driver)
				})
				.then(user => {
					expect(user.host).to.be.true
				})
		})
	})

	describe('ride update routes', function() {
		const rideId = '100000000000000000000000'

		it('should not be allowed to visited on unauthorized attempt', function() {
			return chai
				.request(app)
				.put(`/api/board/${rideId}`)
				.then(res => {
					expect(res).to.not.exist
				})
				.catch(err => {
					if (err instanceof chai.AssertionError) {
						throw err
					}
					expect(err.response).to.have.status(401)
					expect(err.response.body.message).to.equal('Unauthorized')
				})
		})

		it('should update the requests field when request on /requests/:id', function() {
			//passengerId who requested the ride
			const userId = '000000000000000000000002'
			return chai
				.request(app)
				.put(`/api/board/requests/${rideId}`)
				.set('Authorization', `Bearer ${passengerToken}`)
				.send({ userId })
				.then(res => {
					expect(res).to.be.json
					expect(res).to.have.status(201)
					expect(res.body).to.be.an('object')
					expect(res.body.message).to.equal('sent request successful')
				})
		})

		it('should update ride match field and user match field when request on /match/:id', function() {
			const userId = '000000000000000000000000'
			const newUpdate = {
				driverId: '000000000000000000000000',
				passengerId: '000000000000000000000002'
			}
			return chai
				.request(app)
				.put(`/api/board/match/${rideId}`)
				.set('Authorization', `Bearer ${token}`)
				.send(newUpdate)
				.then(res => {
					expect(res).to.be.json
					expect(res).to.have.status(201)
					expect(res.body).to.be.an('object')
					expect(res.body.message).to.equal('update completed')
				})
		})

		it('should update ride info and user match field when request on /match/:id', function() {
			const userId = '000000000000000000000000'
			const newUpdate = {
				driverId: '000000000000000000000000',
				passengerId: '000000000000000000000002'
			}
			return chai
				.request(app)
				.put(`/api/board/match/${rideId}`)
				.set('Authorization', `Bearer ${token}`)
				.send(newUpdate)
				.then(res => {
					expect(res).to.be.json
					expect(res).to.have.status(201)
					expect(res.body).to.be.an('object')
					expect(res.body.message).to.equal('update completed')
				})
		})
	})
})
