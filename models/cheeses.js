const mongoose = require('mongoose')

const cheeseSchema = new mongoose.Schema({
	name: { type: String, require: true }
})
cheeseSchema.index({ name: 1 })

cheeseSchema.set('toObject', {
	transform: function(doc, ret) {
		(ret.id = ret._id), delete ret._id, delete ret.__v
	}
})

const Note = mongoose.model('Note', cheeseSchema)
module.exports = Note
