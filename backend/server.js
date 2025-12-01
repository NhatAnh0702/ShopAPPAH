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

// Mở trình duyệt mặc định tới trang chủ sau khi server khởi chạy
const { exec } = require('child_process');
const openUrl = (url) => {
  const platform = process.platform;
  let cmd;
  if (platform === 'win32') {
    // start is a cmd.exe internal command; give an empty title string
    cmd = `start "" "${url}"`;
  } else if (platform === 'darwin') {
    cmd = `open "${url}"`;
  } else {
    // linux and others (may require xdg-open installed)
    cmd = `xdg-open "${url}"`;
  }

  exec(cmd, (err) => {
    if (err) {
      console.warn('Could not automatically open browser:', err.message || err);
    }
  });
};

// Only attempt to auto-open when not running in CI and when a frontend exists
if (process.env.NODE_ENV !== 'test') {
  const frontendIndex = path.join(__dirname, '..', 'frontend', 'index.html');
  if (fs.existsSync(frontendIndex)) {
    const url = `http://localhost:${PORT}`;
    // Delay briefly to ensure server is ready
    setTimeout(() => openUrl(url), 300);
  }
}
