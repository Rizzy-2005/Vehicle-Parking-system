const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));  // Serves current directory files
app.use(express.static(path.join(__dirname, '..'))); // Serves parent directory files

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'tiger',
    database: 'vehicle_parking',
});

db.connect((err) => {
    if (err) {
        console.error('Database Connection Failed: ', err);
    } else {
        console.log('Connected to MySQL Database');
    }
});

// Routes
// Serve login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve signup page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

// Login API endpoint
app.post('/login', (req, res) => {
    const { userID, password } = req.body;

    if (!userID || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const checkSql = 'SELECT * FROM users WHERE userID = ?';
    db.query(checkSql, [userID], (err, results) => {
        if (err) {
            console.error('Database error: ', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(409).json({ message: "User ID doesn't exist" });
        }

        if (results[0].password !== password) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        console.log('Login successful');
        res.status(200).json({ message: 'Login Successful' });
    });
});

// Signup API endpoint
app.post('/signup', (req, res) => {
    const { name, phone, userId, password } = req.body;

    if (!name || !phone || !userId || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const checkUserSql = 'SELECT * FROM users WHERE userId = ?';
    db.query(checkUserSql, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length > 0) {
            return res.status(409).json({ message: 'User ID already exists. Choose another.' });
        }

        // Insert new user
        const insertUserSql = 'INSERT INTO users (name, phone, userId, password) VALUES (?, ?, ?, ?)';
        db.query(insertUserSql, [name, phone, userId, password], (err) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            console.log(`User Registered: ${name}, Phone: ${phone}, UserId: ${userId}`);
            res.status(201).json({ message: 'Signup successful!' });
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});