const mongoose = require('mongoose')
const { DATABASE_URL, TEST_DATABASE_URL } = require('../config')
const Cheese = require('../models/cheeses')
const seed = require('./seeds')
mongoose
	.connect(DATABASE_URL)
	.then(() => mongoose.connection.db.dropDatabase())
	.then(() => Cheese.insertMany(seed))
	.then(() => Cheese.createIndexes())
	.then(() => mongoose.disconnect())
	.catch(err => {
		console.error(`Error: ${err.message}`)
		console.error(err)
	})
