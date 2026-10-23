const jwt = require('jsonwebtoken')

// Protect routes: Sets req.user if JWT token is valid
module.exports = function (req, res, next) {
  // Get token from header
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' })
  }
  const token = authHeader.split(' ')[1]

  try {
    // Verify token and set user
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // now req.user is set
    next()
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' })
  }
}
