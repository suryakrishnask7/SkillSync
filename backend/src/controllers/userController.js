const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, bio, skillsToTeach, skillsToLearn } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const exists = await User.findOne({ email: normalizedEmail })
    if (exists) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    const hashed = await bcrypt.hash(password, 10)

    const teachArray = Array.isArray(skillsToTeach)
      ? skillsToTeach.map(s => String(s).trim()).filter(Boolean)
      : (typeof skillsToTeach === 'string' ? skillsToTeach.split(',').map(s => s.trim()).filter(Boolean) : [])

    const learnArray = Array.isArray(skillsToLearn)
      ? skillsToLearn.map(s => String(s).trim()).filter(Boolean)
      : (typeof skillsToLearn === 'string' ? skillsToLearn.split(',').map(s => s.trim()).filter(Boolean) : [])

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      bio: bio ? bio.trim() : '',
      skillsToTeach: teachArray,
      skillsToLearn: learnArray,
      reputation: 100,
      xp: 0,
      level: 1,
      stats: {
        sessionsHelped: 0,
        sessionsLearned: 0,
        totalRatingsCount: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      },
      streaks: {
        helpingStreak: 0,
        learningStreak: 0,
        lastHelpedAt: null,
        lastLearnedAt: null
      },
      badges: []
    })

    await user.save()

    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const safeUser = user.toObject()
    delete safeUser.password

    res.status(201).json({
      message: 'Registered successfully',
      user: safeUser,
      token
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const safeUser = user.toObject()
    delete safeUser.password

    res.json({
      message: 'Login successful',
      user: safeUser,
      token
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get current authenticated user's profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Update current authenticated user's profile
exports.updateMe = async (req, res) => {
  try {
    const { name, bio, skillsToTeach, skillsToLearn } = req.body
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (name) user.name = name.trim()
    if (typeof bio === 'string') user.bio = bio.trim()

    if (skillsToTeach !== undefined) {
      user.skillsToTeach = Array.isArray(skillsToTeach)
        ? skillsToTeach.map(s => String(s).trim()).filter(Boolean)
        : (typeof skillsToTeach === 'string' ? skillsToTeach.split(',').map(s => s.trim()).filter(Boolean) : [])
    }

    if (skillsToLearn !== undefined) {
      user.skillsToLearn = Array.isArray(skillsToLearn)
        ? skillsToLearn.map(s => String(s).trim()).filter(Boolean)
        : (typeof skillsToLearn === 'string' ? skillsToLearn.split(',').map(s => s.trim()).filter(Boolean) : [])
    }

    await user.save()
    const safeUser = user.toObject()
    delete safeUser.password

    res.json({ message: 'Profile updated successfully', user: safeUser })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get public profile of any user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Helper directory & discovery: get all users with search and filter
exports.getAllUsers = async (req, res) => {
  try {
    const { search, skill, page = 1, limit = 20 } = req.query
    const query = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { skillsToTeach: { $regex: search, $options: 'i' } }
      ]
    }

    if (skill) {
      query.skillsToTeach = { $regex: skill, $options: 'i' }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ reputation: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ])

    res.json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Leaderboard: Top Helpers
exports.getTopHelpers = async (req, res) => {
  try {
    const helpers = await User.find()
      .select('name bio skillsToTeach reputation level xp stats streaks badges')
      .sort({
        reputation: -1,
        'stats.averageRating': -1,
        'stats.sessionsHelped': -1
      })
      .limit(20)

    res.json(helpers)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Leaderboard: Top Learners
exports.getTopLearners = async (req, res) => {
  try {
    const learners = await User.find()
      .select('name bio skillsToLearn reputation level xp stats streaks badges')
      .sort({
        'stats.sessionsLearned': -1,
        reputation: -1
      })
      .limit(20)

    res.json(learners)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
