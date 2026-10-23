const mongoose = require('mongoose')

const badgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: '🏅' },
  awardedAt: { type: Date, default: Date.now }
}, { _id: false })

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  bio: { type: String, default: '', maxlength: 500 },
  skillsToTeach: { type: [String], default: [] },
  skillsToLearn: { type: [String], default: [] },
  reputation: { type: Number, default: 100, min: 0, max: 1000 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  stats: {
    sessionsHelped: { type: Number, default: 0 },
    sessionsLearned: { type: Number, default: 0 },
    totalRatingsCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    ratingDistribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    }
  },
  streaks: {
    helpingStreak: { type: Number, default: 0 },
    learningStreak: { type: Number, default: 0 },
    lastHelpedAt: { type: Date, default: null },
    lastLearnedAt: { type: Date, default: null }
  },
  badges: { type: [badgeSchema], default: [] }
}, {
  timestamps: true
})

userSchema.index({ reputation: -1 })
userSchema.index({ 'stats.sessionsLearned': -1 })
userSchema.index({ skillsToTeach: 1 })

module.exports = mongoose.model('User', userSchema)

