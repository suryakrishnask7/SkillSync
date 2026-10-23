const express = require('express')
const cors = require('cors')
const connectDB = require('./config/database')
require('dotenv').config()
const userRoutes = require('./routes/userRoutes')
const requestRoutes = require('./routes/requestRoutes')

const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors())
app.use(express.json())

// Root route
app.get('/', (req, res) => {
  res.send('SkillSync backend is running!')
})

// Routes
app.use('/api/users', userRoutes)
app.use('/api/requests', requestRoutes)

// Centralized error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  })
})

module.exports = app

