const mongoose = require('mongoose')

const rideSchema = new mongoose.Schema({
	startCity: { type: String, require: true },
	startState: { type: String, require: true },
	arriveState: { type: String, require: true },
	arriveCity: { type: String, require: true },
	scheduleDate: { type: String, require: true },
	rideCost: { type: Number, default: 0 },
	disClaimer: { type: String, default: '' },
	driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
	requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	match: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
})

rideSchema.set('toObject', {
	transform: function(doc, ret) {
		ret.id = ret._id
		delete ret._id
		delete ret.__v
	}
})

const Ride = mongoose.model('Ride', rideSchema)
module.exports = Ride
