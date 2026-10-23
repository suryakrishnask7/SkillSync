const test = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()

const User = require('../src/models/User')
const Request = require('../src/models/Request')
const Message = require('../src/models/Message')
const {
  BADGE_DEFINITIONS,
  calculateNewStreak,
  evaluateBadges,
  processSessionCompletion,
  processRating
} = require('../src/services/gamificationService')

test('SkillSync Backend & Gamification Test Suite', async (t) => {
  // Connect to DB
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skillsync')

  // Clean test artifacts
  await User.deleteMany({ email: { $in: ['test_learner@example.com', 'test_helper@example.com', 'test_competitor@example.com'] } })
  await Request.deleteMany({ skill: { $regex: /TestSkill/ } })

  let learner, helper

  await t.test('1. User Registration & Password Hashing', async () => {
    const rawPass = 'Secret123!'
    const hashed = await bcrypt.hash(rawPass, 10)
    assert.strictEqual(await bcrypt.compare(rawPass, hashed), true)

    learner = new User({
      name: 'Test Learner',
      email: 'test_learner@example.com',
      password: hashed,
      bio: 'Ready to learn',
      skillsToLearn: ['React', 'Node.js']
    })
    await learner.save()

    helper = new User({
      name: 'Test Helper',
      email: 'test_helper@example.com',
      password: hashed,
      bio: 'Senior Mentor',
      skillsToTeach: ['React', 'Python', 'TestSkill']
    })
    await helper.save()

    assert.ok(learner._id)
    assert.ok(helper._id)
    assert.strictEqual(learner.reputation, 100)
    assert.strictEqual(helper.reputation, 100)
  })

  await t.test('2. JWT Generation & Verification', () => {
    const token = jwt.sign({ id: learner._id, name: learner.name }, process.env.JWT_SECRET, { expiresIn: '1h' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    assert.strictEqual(decoded.id.toString(), learner._id.toString())
    assert.strictEqual(decoded.name, 'Test Learner')
  })

  let reqDoc
  await t.test('3. Request Creation with Validation', async () => {
    reqDoc = new Request({
      skill: 'TestSkill React',
      description: 'Need assistance with state management',
      requester: learner._id,
      status: 'open'
    })
    await reqDoc.save()

    assert.strictEqual(reqDoc.status, 'open')
    assert.strictEqual(reqDoc.helper, null)
  })

  await t.test('4. Atomic Acceptance & Self-Acceptance Prevention', async () => {
    // Attempt self-acceptance (should fail)
    const selfAccept = await Request.findOneAndUpdate(
      { _id: reqDoc._id, status: 'open', requester: { $ne: learner._id } },
      { status: 'in-progress', helper: learner._id },
      { new: true }
    )
    assert.strictEqual(selfAccept, null, 'Learner must not accept own request')

    // Helper accepts
    const accepted = await Request.findOneAndUpdate(
      { _id: reqDoc._id, status: 'open', requester: { $ne: helper._id } },
      { status: 'in-progress', helper: helper._id, acceptedAt: new Date() },
      { new: true }
    )
    assert.ok(accepted, 'Helper should successfully accept open request')
    assert.strictEqual(accepted.status, 'in-progress')
    assert.strictEqual(accepted.helper.toString(), helper._id.toString())

    // Second helper attempts to accept already accepted request (race condition prevention)
    const secondAccept = await Request.findOneAndUpdate(
      { _id: reqDoc._id, status: 'open', requester: { $ne: helper._id } },
      { status: 'in-progress', helper: helper._id },
      { new: true }
    )
    assert.strictEqual(secondAccept, null, 'Second accept attempt must fail atomically')
  })

  await t.test('5. Message Persistence', async () => {
    const msg = new Message({
      roomId: reqDoc._id.toString(),
      sender: helper._id,
      senderName: helper.name,
      text: 'Hello, I am ready to help you with TestSkill!'
    })
    await msg.save()

    const found = await Message.findOne({ roomId: reqDoc._id.toString() })
    assert.ok(found)
    assert.strictEqual(found.text, 'Hello, I am ready to help you with TestSkill!')
  })

  await t.test('6. Session Closure and Gamification Stats Update', async () => {
    reqDoc.status = 'closed'
    reqDoc.closedAt = new Date()
    await reqDoc.save()

    await processSessionCompletion(helper._id, 'helper')
    await processSessionCompletion(learner._id, 'learner')

    const updatedHelper = await User.findById(helper._id)
    const updatedLearner = await User.findById(learner._id)

    assert.strictEqual(updatedHelper.stats.sessionsHelped, 1)
    assert.strictEqual(updatedLearner.stats.sessionsLearned, 1)
    assert.ok(updatedHelper.badges.some(b => b.id === 'newbie_helper'), 'Helper should earn Newbie Helper badge')
    assert.ok(updatedLearner.badges.some(b => b.id === 'fast_learner'), 'Learner should earn Fast Learner badge')
  })

  await t.test('7. Rating Submission and Reputation Calculation', async () => {
    // Learner rates helper 5 stars
    await processRating(helper._id, 5)

    const updatedHelper = await User.findById(helper._id)
    assert.strictEqual(updatedHelper.stats.totalRatingsCount, 1)
    assert.strictEqual(updatedHelper.stats.averageRating, 5)
    assert.strictEqual(updatedHelper.stats.ratingDistribution['5'], 1)
    assert.ok(updatedHelper.reputation > 100, 'Reputation should increase after 5-star rating')
  })

  await t.test('8. Idempotent Badge Awards', async () => {
    const updatedHelper = await User.findById(helper._id)
    const badgeCountBefore = updatedHelper.badges.length
    const awardedAgain = evaluateBadges(updatedHelper)

    assert.strictEqual(awardedAgain.length, 0, 'No duplicate badges should be awarded')
    assert.strictEqual(updatedHelper.badges.length, badgeCountBefore)
  })

  await t.test('9. Streak Calculation Rules', () => {
    const now = new Date()
    // Consecutive day within 36 hours
    const yesterday = new Date(now.getTime() - 26 * 60 * 60 * 1000)
    const newStreak = calculateNewStreak(1, yesterday)
    assert.strictEqual(newStreak, 2, 'Streak should increment on consecutive day')

    // More than 48 hours
    const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000)
    const resetStreak = calculateNewStreak(5, threeDaysAgo)
    assert.strictEqual(resetStreak, 1, 'Streak should reset after inactivity')
  })

  // Cleanup
  await User.deleteMany({ email: { $in: ['test_learner@example.com', 'test_helper@example.com', 'test_competitor@example.com'] } })
  await Request.deleteMany({ skill: { $regex: /TestSkill/ } })
  await Message.deleteMany({ roomId: reqDoc._id.toString() })

  await mongoose.disconnect()
})
