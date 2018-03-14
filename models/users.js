const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
	email: { type: String, require: true, unique: true },
	rating: { type: String, require: true },
	firstName: { type: String, require: true },
	lastName: { type: String, require: true },
	password: { type: String, require: true }
})
userSchema.set('toObject', {
	transform: function(doc, ret) {
		ret.id = ret._id
		delete ret._id
		delete ret.__v
	}
})

const User = mongoose.model('User', userSchema)
module.exports = User
