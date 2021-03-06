const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const userSchema = new mongoose.Schema({
	email: {type: String, require: true},
	rating: {type: String, default: '5'},
	reviews: [],
	firstName: {type: String, require: true},
	lastName: {type: String, require: true},
	password: {type: String, require: true},
	host: {type: Boolean, default: false},
	match: {type: mongoose.Schema.Types.ObjectId, ref: 'Ride', default: null},
	sentRequests: [{type: mongoose.Schema.Types.ObjectId, ref: 'Ride'}],
	pendingReview: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null}
})

userSchema.index({email: 1}, {unique: true})
userSchema.set('toObject', {
	transform: function(doc, ret) {
		ret.id = ret._id
		delete ret._id
		delete ret.__v
		delete ret.password
	}
})

userSchema.statics.hashPassword = function(password) {
	return bcrypt.hash(password, 10)
}
userSchema.methods.validatePassword = function(password) {
	return bcrypt.compare(password, this.password)
}
const User = mongoose.model('User', userSchema)
module.exports = User
