// backend/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log('MONGO_URI =', process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`SUCCESS: MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(" ERROR: MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
