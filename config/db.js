const mongoose = require('mongoose');

// Connects to MongoDB Atlas using the connection string in .env (MONGODB_URI).
// If the connection fails, we log the error and stop the server, because
// the API cannot function without a database.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
