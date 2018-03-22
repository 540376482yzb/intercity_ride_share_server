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
	before(function() {
		return dbConnect(TEST_DATABASE_URL).then(() =>
			mongoose.connection.db.dropDatabase()
		)
	})
	beforeEach(function() {
		let token
		const userPromises = seedUsers.map(user => {
			return User.hashPassword(user.password).then(hash => {
				console.log(hash)
				return User.create({
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					password: hash,
					rating: user.rating
				})
			})
		})

		const ridePromises = Ride.insertMany(seedRides)
		return Promise.all([userPromises, ridePromises])
			.then(() => Ride.createIndexes())
			.then(() => User.createIndexes())
			.then(() => {
				return User.findOne({ email: 'admin1@gmail.com' })
			})
			.then(user => {
				console.log(user.id)
				token = jwt.sign({ user }, JWT_SECRET, { subject: user.email })
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
	})
})
