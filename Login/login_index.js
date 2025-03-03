const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());
// Serve files from both directories
app.use(express.static(path.join(__dirname)));  // Serves Login directory files
app.use(express.static(path.join(__dirname, '..')));  // Serves parent directory files

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'tiger',
    database: 'vehicle_parking',
});

db.connect((err) => {
    if (err) {
        console.log("Database Connection Failed: ", err);
    } else {
        console.log("Connected to MYSQL Database");
    }
});

// Serve login page at '/'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve signup page at '/signup'
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '..','signup.html'));
});

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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
