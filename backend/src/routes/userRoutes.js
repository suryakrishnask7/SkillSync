const express = require('express')
const userController = require('../controllers/userController')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/me', auth, userController.getMe)
router.put('/me', auth, userController.updateMe)
router.get('/leaderboard/helpers', userController.getTopHelpers)
router.get('/leaderboard/learners', userController.getTopLearners)
router.get('/:id', userController.getUserById)
router.get('/', userController.getAllUsers)

module.exports = router
