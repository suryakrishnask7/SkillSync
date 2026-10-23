const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const mongooseConnection = await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected successfully')
    console.log('Database connected: ', mongooseConnection.connection.name)
  } catch (err) {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  }
}

module.exports = connectDB
