// server.js
const dotenv = require('dotenv');
const express = require('express');
const cors = require("cors");
const connectDB = require('./config/db');
const productRoutes = require("./routes/productRoutes");

dotenv.config({ path: './.env' });  

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend server is running successfully!');
});

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
