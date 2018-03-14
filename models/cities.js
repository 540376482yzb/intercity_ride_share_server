const mongoose = require('mongoose')
const citySchema = new mongoose.Schema({
	city: { type: String, require: true },
	state: { type: String, require: true }
})
citySchema.index({ city: 1, state: 1 }, { unique: true })
citySchema.set('toObject', {
	transform: function(doc, ret) {
		ret.id = ret._id
		delete ret._id
		delete ret.__v
	}
})
const City = mongoose.model('City', citySchema)
module.exports = City
