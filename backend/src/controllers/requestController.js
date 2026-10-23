const Request = require('../models/Request')
const Message = require('../models/Message')
const { processSessionCompletion, processRating } = require('../services/gamificationService')

// Create a new help request
exports.createRequest = async (req, res) => {
  try {
    const { skill, description } = req.body

    if (!skill || !skill.trim()) {
      return res.status(400).json({ message: 'Skill name is required' })
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' })
    }

    if (description.trim().length > 1000) {
      return res.status(400).json({ message: 'Description cannot exceed 1,000 characters' })
    }

    const requesterId = req.user.id

    const newRequest = new Request({
      skill: skill.trim(),
      description: description.trim(),
      requester: requesterId,
      status: 'open',
      active: true
    })

    await newRequest.save()

    const populated = await Request.findById(newRequest._id).populate('requester', 'name skillsToTeach reputation stats')

    res.status(201).json({
      message: 'Help request posted successfully',
      request: populated
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Browse requests (defaults to open; excludes accepted/closed unless requested)
exports.getAllRequests = async (req, res) => {
  try {
    const { search, skill, status } = req.query
    const query = {}

    if (status && status !== 'all') {
      if (status === 'in-progress' || status === 'accepted') {
        query.status = { $in: ['accepted', 'in-progress'] }
      } else {
        query.status = status
      }
    } else if (!status) {
      // Default: only open requests show up in the requests tab
      query.status = 'open'
    }

    if (skill) {
      query.skill = { $regex: skill, $options: 'i' }
    } else if (search) {
      query.$or = [
        { skill: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const requests = await Request.find(query)
      .populate('requester', 'name skillsToTeach reputation stats')
      .populate('helper', 'name skillsToTeach reputation stats')
      .sort({ createdAt: -1 })

    res.json(requests)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get user's own requests and sessions (dashboard view)
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id

    const [learningSessions, helpingSessions] = await Promise.all([
      Request.find({ requester: userId })
        .populate('helper', 'name email reputation stats badges')
        .sort({ createdAt: -1 }),
      Request.find({ helper: userId })
        .populate('requester', 'name email reputation stats badges')
        .sort({ acceptedAt: -1, createdAt: -1 })
    ])

    res.json({
      learningSessions,
      helpingSessions
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get single request by ID
exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('requester', 'name email reputation stats badges')
      .populate('helper', 'name email reputation stats badges')

    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    res.json(request)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Accept a request (Atomic operation)
exports.acceptRequest = async (req, res) => {
  try {
    const requestId = req.params.id
    const helperId = req.user.id

    // Check if user is trying to accept their own request
    const existing = await Request.findById(requestId)
    if (!existing) {
      return res.status(404).json({ message: 'Request not found' })
    }

    if (existing.requester.toString() === helperId) {
      return res.status(400).json({ message: 'You cannot accept your own request' })
    }

    if (existing.status !== 'open') {
      return res.status(400).json({ message: 'This request is no longer open' })
    }

    // Atomic update: transition from open to accepted
    const updated = await Request.findOneAndUpdate(
      {
        _id: requestId,
        status: 'open',
        requester: { $ne: helperId }
      },
      {
        status: 'accepted',
        active: false,
        helper: helperId,
        acceptedAt: new Date()
      },
      { new: true }
    )
      .populate('requester', 'name email reputation stats')
      .populate('helper', 'name email reputation stats')

    if (!updated) {
      return res.status(409).json({ message: 'Request has already been accepted by another helper' })
    }

    const io = req.app.get('io')
    if (io) {
      io.to(`user_${updated.requester._id.toString()}`).emit('requestAccepted', {
        message: `${updated.helper?.name || 'A helper'} accepted your help request for ${updated.skill}!`,
        request: updated
      })
    }

    res.json({
      message: 'Request accepted successfully. Session is now active.',
      request: updated
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Delete an open request
exports.deleteRequest = async (req, res) => {
  try {
    const requestId = req.params.id
    const userId = req.user.id

    const request = await Request.findById(requestId)
    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    if (request.requester.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this request' })
    }

    if (request.status !== 'open') {
      return res.status(400).json({ message: 'Cannot delete a request that is in-progress, accepted, or closed' })
    }

    await Request.findByIdAndDelete(requestId)
    res.json({ message: 'Request deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Close an in-progress or accepted session (ONLY requester can close)
exports.closeRequest = async (req, res) => {
  try {
    const requestId = req.params.id
    const userId = req.user.id

    const request = await Request.findById(requestId)
    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    const isRequester = request.requester.toString() === userId

    // Enforce that ONLY the requester can close the session
    if (!isRequester) {
      return res.status(403).json({ message: 'Only the learner/requester can close this session' })
    }

    if (request.status === 'closed') {
      return res.status(400).json({ message: 'Session is already closed' })
    }

    request.status = 'closed'
    request.active = false
    request.closedAt = new Date()
    await request.save()

    // Trigger session completion stats for helper and learner
    if (request.helper) {
      await processSessionCompletion(request.helper, 'helper')
    }
    await processSessionCompletion(request.requester, 'learner')

    const updated = await Request.findById(requestId)
      .populate('requester', 'name email reputation stats badges')
      .populate('helper', 'name email reputation stats badges')

    res.json({
      message: 'Session closed successfully',
      request: updated
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Rate the helper (Learner only, after closure)
exports.rateHelper = async (req, res) => {
  try {
    const requestId = req.params.id
    const learnerId = req.user.id
    const { rating, feedback } = req.body

    const numericRating = Number(rating)
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' })
    }

    if (feedback && feedback.length > 500) {
      return res.status(400).json({ message: 'Feedback cannot exceed 500 characters' })
    }

    const request = await Request.findById(requestId)
    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    if (request.requester.toString() !== learnerId) {
      return res.status(403).json({ message: 'Only the learner can rate this session' })
    }

    if (request.status !== 'closed') {
      return res.status(400).json({ message: 'Can only rate a session after it has been closed' })
    }

    if (request.rating !== null && request.rating !== undefined) {
      return res.status(400).json({ message: 'This session has already been rated' })
    }

    if (!request.helper) {
      return res.status(400).json({ message: 'No helper assigned to this session' })
    }

    request.rating = numericRating
    request.feedback = feedback ? feedback.trim() : ''
    request.ratedAt = new Date()
    await request.save()

    // Process helper rating and update gamification stats
    await processRating(request.helper, numericRating)

    res.json({
      message: 'Rating and feedback submitted successfully',
      request
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get message history for a request session
exports.getMessages = async (req, res) => {
  try {
    const requestId = req.params.id
    const userId = req.user.id

    const request = await Request.findById(requestId)
    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    const isRequester = request.requester.toString() === userId
    const isHelper = request.helper && request.helper.toString() === userId

    if (!isRequester && !isHelper) {
      return res.status(403).json({ message: 'Not authorized to view messages in this session' })
    }

    const messages = await Message.find({ roomId: requestId })
      .sort({ createdAt: 1 })
      .limit(200)

    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
