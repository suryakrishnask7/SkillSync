const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema({
  skill: { type: String, required: true, trim: true },
  description: { type: String, required: true, maxlength: 1000, trim: true },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  helper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['open', 'accepted', 'in-progress', 'closed'],
    default: 'open'
  },
  // Kept for backward compatibility
  active: {
    type: Boolean,
    default: true
  },
  acceptedAt: { type: Date, default: null },
  closedAt: { type: Date, default: null },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  feedback: {
    type: String,
    maxlength: 500,
    default: null
  },
  ratedAt: { type: Date, default: null }
}, {
  timestamps: true
})

requestSchema.index({ status: 1, createdAt: -1 })
requestSchema.index({ requester: 1 })
requestSchema.index({ helper: 1 })
requestSchema.index({ skill: 1 })

module.exports = mongoose.model('Request', requestSchema)

