const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const app = express();
const db = require('./db'); // Your MySQL connection
const adminRoutes = require('./jadmin')(db); // Pass db to jadmin.js

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Enable CORS for frontend (adjust origin as needed)
app.use(cors({
  origin: 'http://127.0.0.1:5500', // or wherever your HTML is served
  credentials: true
}));

// Session setup (optional for admin login etc.)
app.use(session({
  secret: 'testsecret',
  resave: false,
  saveUninitialized: true
}));

// Parse JSON request bodies
app.use(express.json());

// Use admin routes
app.use('/admin', adminRoutes);

// Start server
app.listen(3000, () => console.log("Test server running on port 3000"));
