const mongoose = require('mongoose')
const { DATABASE_URL, TEST_DATABASE_URL } = require('../config')
const Cheese = require('../models/cheeses')
const User = require('../models/users')
const Ride = require('../models/rides')
const seed = require('./seeds')
const seedUsers = require('./seedUsers.json')
const seedRides = require('./seedRides.json')
mongoose
	.connect(DATABASE_URL)
	.then(() => mongoose.connection.db.dropDatabase())
	.then(() => User.insertMany(seedUsers))
	.then(() => Ride.insertMany(seedRides))
	.then(() => Ride.createIndexes())
	.then(() => mongoose.disconnect())
	.catch(err => {
		console.error(`Error: ${err.message}`)
		console.error(err)
	})
