require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db  = require("./db");
const router = express.Router();

router.use(cors());
router.use(express.json());

// Route: Get all states
router.get("/get_states", (req, res) => {
    const sql = "SELECT DISTINCT state FROM branch ORDER BY state";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching states:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results.map(row => row.state));
    });
});

// Route: Get cities for a state
router.get("/get_cities", (req, res) => {
    const { state } = req.query;
    if (!state) return res.status(400).json({ error: "State is required" });

    const sql = "SELECT DISTINCT city FROM branch WHERE state = ? ORDER BY city";
    db.query(sql, [state], (err, results) => {
        if (err) {
            console.error("Error fetching cities:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results.map(row => row.city));
    });
});

// Route: Get branches for a city & state
router.get('/search_branches', (req, res) => {
    let { state, city } = req.query;

    // Build dynamic SQL query
    let query = `
        SELECT 
            b.branch_name AS name, 
            b.street AS address, 
            b.city, 
            b.state, 
            b.phone_no AS phone, 
            (b.max_slots_car - COALESCE(SUM(CASE WHEN s.type = 'Car' AND s.status = 'Parked' THEN 1 ELSE 0 END), 0)) AS available_car_slots, 
            (b.max_slots_bike - COALESCE(SUM(CASE WHEN s.type = 'Bike' AND s.status = 'Parked' THEN 1 ELSE 0 END), 0)) AS available_bike_slots
        FROM branch b
        LEFT JOIN slots s ON b.branch_name = s.branch_name
    `;

    // Filters
    let conditions = [];
    let values = [];

    if (state) {
        conditions.push("b.state = ?");
        values.push(state);
    }
    if (city) {
        conditions.push("b.city = ?");
        values.push(city);
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }

    query += " GROUP BY b.branch_name";

    // Execute query
    db.query(query, values, (err, results) => {
        if (err) {
            console.error("Error fetching branches:", err);
            return res.status(500).json({ error: "Database query failed" });
        }
        res.json(results);
    });
});

router.get("/", (req, res) => {
    if (req.session.userid) {
        const sql = "SELECT user_name FROM users WHERE user_id = ?";
        db.query(sql, [req.session.userid], (err, results) => {
            if (err) {
                console.error("Error fetching user info:", err);
                return res.status(500).json({ error: "Database error" });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            const user = results[0];
            return res.status(200).json({name: user.user_name});
        });
    } else {
        return res.status(401).json({ redirectUrl: "/login/login.html" });
    }
});


router.get("/get_user_details", (req, res) => {
    if (!req.session.userid) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const sql = "SELECT user_name, phone_no, user_id , user_password FROM users WHERE user_id = ?";
    db.query(sql, [req.session.userid], (err, results) => {
        if (err) {
            console.error("Error fetching user details:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(results[0]);
        
    });
});

router.post("/update_user", (req, res) => {
    if (!req.session.userid) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const { user_name, phone_no, userId, user_password } = req.body;

    // Basic validation
    if (!user_name || !phone_no) {
        return res.status(400).json({ error: "Username and phone number are required" });
    }

    // Validate phone number (must be exactly 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone_no)) {
        return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
    }

    // Password validation if provided
    if (user_password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(user_password)) {
            return res.status(400).json({ error: "Password must be at least 8 characters and include lowercase, uppercase, and digits" });
        }
    }

    if (userId == req.session.userid) {
        // User is not changing their ID
        let sql, params;
        
        if (user_password) {
            // Update with password
            sql = "UPDATE users SET user_name = ?, phone_no = ?, user_password = ? WHERE user_id = ?";
            params = [user_name, phone_no, user_password, req.session.userid];
        } else {
            // Update without password
            sql = "UPDATE users SET user_name = ?, phone_no = ? WHERE user_id = ?";
            params = [user_name, phone_no, req.session.userid];
        }
        
        db.query(sql, params, (err, result) => {
            if (err) {
                console.error("Error updating user details:", err);
                return res.status(500).json({ error: "Database error" });
            }

            res.json({ success: true, message: "User details updated successfully" });
        });
    } else {
        // User is changing their ID
        db.query("SELECT * FROM users WHERE user_id = ?", [userId], (err, results) => {
            if (err) {
                console.error("Error checking user ID:", err);
                return res.status(500).json({ error: "Database error" });
            }
        
            if (results.length > 0) {
                return res.status(400).json({ error: "User ID already exists" });
            }
        
            // Safe to update now
            let sql, params;
            
            if (user_password) {
                // Update with password
                sql = "UPDATE users SET user_id = ?, user_name = ?, phone_no = ?, user_password = ? WHERE user_id = ?";
                params = [userId, user_name, phone_no, user_password, req.session.userid];
            } else {
                // Update without password
                sql = "UPDATE users SET user_id = ?, user_name = ?, phone_no = ? WHERE user_id = ?";
                params = [userId, user_name, phone_no, req.session.userid];
            }
            
            db.query(sql, params, (err, result) => {
                if (err) {
                    console.error("Error updating user details:", err);
                    return res.status(500).json({ error: "Database error" });
                }
        
                req.session.userid = userId;
                res.json({ success: true, message: "User details updated successfully" });
            });
        });
    }
});

router.get('/vehicle_details', (req, res) => {
    if (!req.session.userid) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    let query = `
       SELECT 
    v.vehicle_no,
    v.vehicle_name,
    v.slot_id,
    v.registered_at,
    v.secret_no,
    v.checkout_at,
    p.branch_name,
    p.id,
    CASE 
        WHEN v.checkout_at IS NULL THEN 'Parked'
        ELSE 'Checked Out'
    END AS status
FROM vehicles v
JOIN parking_record p 
    ON v.vehicle_no = p.vehicle_no
WHERE p.id = (
    SELECT MAX(p2.id) 
    FROM parking_record p2 
    WHERE p2.vehicle_no = v.vehicle_no
) and v.user_id=? order by v.registered_at desc;

    `;

    db.query(query, [req.session.userid], (err, results) => {
        if (err) {
            console.error("Error fetching vehicles:", err);
            return res.status(500).json({ error: "Database query failed" });
        }
        res.json(results);
    });
});

router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).json({ success: false, message: "Logout failed" });
        }
        res.clearCookie("connect.sid"); // Clear session cookie
        res.json({ success: true, message: "Logged out successfully", redirectUrl: "http://localhost:3000/login/login.html" });
    });
});


module.exports = router;
