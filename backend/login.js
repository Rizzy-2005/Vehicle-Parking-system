const express = require('express');
const cors = require('cors');
const path = require('path');
const router = express.Router();
const db = require("./db");

router.use(express.json());
router.use(cors());

router.post('/login', (req, res) => {
    const { userID, password } = req.body;
    
    const checkSql = 'SELECT * FROM users WHERE user_id = ?';
    db.query(checkSql, [userID], (err, results) => {
        if (err) {
            console.error('Database error: ', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(409).json({ message: "User ID doesn't exist" });
        }

        if (results[0].user_password !== password) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        console.log('Login successful');
        req.session.userid = results[0].user_id;
        res.json({ success: true, message: "Logged in successfully", redirectUrl: "/user/available_branches.html" });        
    });
});

router.post('/signup', (req, res) => {
    const { name, gender, phone, userId, password} = req.body;

    const checkUserSql = 'SELECT * FROM users WHERE user_id = ?';
    db.query(checkUserSql, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length > 0) {
            return res.status(409).json({ message: 'User ID already exists. Choose another.' });
        }

        const insertUserSql = 'INSERT INTO users (user_id, user_name, phone_no, gender, user_password) VALUES (?, ?, ?, ?, ?)';
        db.query(insertUserSql, [userId, name, phone, gender, password], (err) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            console.log(`User Registered: ${name}, Phone: ${phone}, UserId: ${userId}`);
            
            res.status(201).json({ message: 'Signup successful!' });
        });
    });
});

module.exports = router;
