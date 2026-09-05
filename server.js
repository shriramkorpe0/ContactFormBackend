require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const contactRoutes = require('./routes/contactRoutes');
const errorHandler = require('./middleware/errorHandler');

// Connect to MongoDB Atlas before anything else
connectDB();

const app = express();

// --- Global middleware ---
app.use(cors());               // allow the sample frontend (or any origin) to call this API
app.use(express.json());       // parse incoming JSON request bodies into req.body

// Serve the simple sample frontend from /public (e.g. public/index.html)
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes ---
app.use('/api', contactRoutes); // registers POST /api/contact

// --- Centralized error handler (must be registered LAST) ---
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
