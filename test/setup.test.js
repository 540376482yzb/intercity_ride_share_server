'use strict'
require('dotenv').config()
const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiSpies = require('chai-spies')
const { TEST_DATABASE_URL } = require('../config')
const { dbConnect, dbDisconnect } = require('../db-mongoose')

const app = require('../index.js')
// Set NODE_ENV to `test` to disable http layer logs
// You can do this in the command line, but this is cross-platform

// Clear the console before each run
process.stdout.write('\x1Bc\n')

const expect = chai.expect
chai.use(chaiHttp)
chai.use(chaiSpies)

before(function() {
	return dbConnect(TEST_DATABASE_URL)
})

after(function() {
	return dbDisconnect()
})

describe('Mocha and Chai', function() {
	it('should be properly setup', function() {
		expect(true).to.be.true
	})
})

describe('Environment', () => {
	it('NODE_ENV should be "test"', () => {
		expect(process.env.NODE_ENV).to.equal('test')
	})
})

describe('Basic Express setup', () => {
	describe('404 handler', () => {
		it('should respond with 404 when given a bad path', () => {
			const spy = chai.spy()
			return chai
				.request(app)
				.get('/bad/path')
				.then(spy)
				.catch(err => {
					expect(err.response).to.have.status(401)
				})
				.then(() => {
					expect(spy).to.not.have.been.called()
				})
		})
	})
})
