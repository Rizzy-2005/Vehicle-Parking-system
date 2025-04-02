const express = require('express');
const cors = require('cors');
const router = express.Router();
const db = require("./db");

router.use(express.json());
router.use(cors());

router.post('/admin', (req, res) => {
    const { userName, password } = req.body;
     
    const userType = userName[1];
    let checkSql = '';
    
    if (userType === 'T') {
        console.log("Attendant login attempt");
        checkSql = 'SELECT * FROM attendant WHERE attendant_id = ? AND attendant_password = ?';
    } else if (userType === 'D') {
        console.log("Admin login attempt");
        checkSql = 'SELECT * FROM admin WHERE admin_id = ? AND admin_password = ?';
    } else {
        return res.status(401).json({ message: "Invalid Credentials" });
    }

    db.query(checkSql, [userName, password], (err, results) => {
        if (err) {
            console.error("Database error during login:", err.message);
            return res.status(500).json({ message: "Server Error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        if (userType === 'T') {      
                req.session.attendant_id = results[0].attendant_id;
                req.session.branch_name = results[0].branch_name;
                return res.json({ redirectUrl: "/attendant/Attendant-Reg.html" });
        } else {
                req.session.admin_id = results[0].admin_id;
                req.session.branch_name = results[0].branch_name;
                return res.json({ redirectUrl: "/admin/Manage-attendant.html" });
        }
    });
});

router.post('/login', (req, res) => {
    const { userID, password } = req.body;
    
    const checkSql = 'SELECT * FROM users WHERE user_id = ? and user_password = ?';
    db.query(checkSql, [userID,password], (err, results) => {
        if (err) {
            console.error('Database error: ', err);
            return res.status(500).json({ message: 'Server error' });
        }
        if (results.length === 0) {
            return res.status(409).json({ message: "User ID doesn't exist" });
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
