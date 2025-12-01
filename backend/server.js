// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs');

//console.log('DEBUG: MONGO_URI is:', process.env.MONGO_URI);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Serve uploads statically at /uploads
app.use('/uploads', express.static(uploadsDir));

// Serve frontend static files
const frontendDir = path.join(__dirname, '..', 'frontend');
if (fs.existsSync(frontendDir)) {
  app.use(express.static(frontendDir));
  // Root route to serve index.html
  app.get('/', (req, res) => {
    res.sendFile(path.join(frontendDir, 'index.html'));
  });
} else {
  console.warn('Warning: frontend directory not found at', frontendDir);
}

// Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));

app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});

const PORT = process.env.PORT || 5000;

// Kết nối database
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
