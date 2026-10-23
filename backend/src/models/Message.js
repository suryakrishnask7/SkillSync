const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 2000,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
})

messageSchema.index({ roomId: 1, createdAt: 1 })

module.exports = mongoose.model('Message', messageSchema)
