const express = require('express')
const requestController = require('../controllers/requestController')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/', auth, requestController.createRequest)
router.get('/', requestController.getAllRequests) // Public browsing, authenticated filtering optional
router.get('/my', auth, requestController.getMyRequests)
router.get('/:id', auth, requestController.getRequestById)
router.put('/:id/accept', auth, requestController.acceptRequest)
router.delete('/:id', auth, requestController.deleteRequest)
router.put('/:id/close', auth, requestController.closeRequest)
router.post('/:id/rate', auth, requestController.rateHelper)
router.get('/:id/messages', auth, requestController.getMessages)

module.exports = router
