const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI; // ensure this is set in backend/.env

if (!uri) {
  console.error('MONGODB_URI is not set in .env');
  process.exit(1);
}

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000, // fail quickly if can't connect
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas (test)');
  return mongoose.connection.close();
})
.catch(err => {
  console.error('❌ MongoDB connection error (test):', err);
  process.exit(1);
});