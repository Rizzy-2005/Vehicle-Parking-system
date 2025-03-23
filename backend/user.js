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
    console.log(req.session.userid);
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




module.exports = router;
