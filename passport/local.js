const User = require('../models/users')
const { Strategy: LocalStrategy } = require('passport-local')

const localStrategy = new LocalStrategy(
	{ usernameField: 'email' },
	(email, password, done) => {
		let mUser
		User.findOne({ email })
			.then(user => {
				if (!user) {
					console.log('no user')
					return Promise.reject({
						reason: 'Login Error',
						message: 'Incorrect Email',
						location: 'email'
					})
				}
				mUser = user
				return user.validatePassword(password)
			})
			.then(isValid => {
				if (!isValid) {
					console.log('bad password')
					return Promise.reject({
						reason: 'Login Error',
						message: 'Incorrect Password',
						location: 'password'
					})
				}
				console.log('I went through')
				return done(null, mUser)
			})
			.catch(err => {
				if (err.reason === 'Login Error') {
					console.log('why am I here?')
					return done(null, false)
				}
				return done(err)
			})
	}
)

module.exports = localStrategy
