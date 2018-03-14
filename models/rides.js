const mongoose = require('mongoose')

const rideSchema = new mongoose.Schema({
	startCity: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'City',
		require: true
	},
	arriveCity: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'City',
		require: true
	},
	scheduleDate: { type: Date, require: true, index: true },
	rideCost: { type: Number, default: 0 },
	disClaimer: { type: String, default: '' },
	driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
	requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
})

rideSchema.index({ startCity: 1, arriveCity: 1, scheduleDate: 1 })

rideSchema.set('toObject', {
	transform: function(doc, ret) {
		ret.id = ret._id
		delete ret._id
		delete ret.__v
	}
})

const Ride = mongoose.model('Ride', rideSchema)
module.exports = Ride
