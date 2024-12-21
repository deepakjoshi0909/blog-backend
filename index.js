const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoute');
const postRoutes = require('./routes/postRoute');
const cors = require("cors");

const app = express();


app.use(cors());

dotenv.config();
connectDB();


app.use(express.json()); // Middleware for parsing JSON requests

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
