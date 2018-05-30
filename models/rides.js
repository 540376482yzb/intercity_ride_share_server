const mongoose = require('mongoose')

const rideSchema = new mongoose.Schema({
	startCity: { type: String, require: true },
	startState: { type: String, require: true },
	arriveState: { type: String, require: true },
	arriveCity: { type: String, require: true },
	startCoordinate: [],
	arriveCoordinate: [],
	scheduleDate: { type: String, require: true },
	rideCost: { type: Number, default: 0 },
	driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
	messages: [],
	match: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	maxOccupancy: { type: Number, default: 4 },
	lock: { type: Boolean, default: false }
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
