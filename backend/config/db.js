// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/ahsop';
    try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Lỗi kết nối DB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;

