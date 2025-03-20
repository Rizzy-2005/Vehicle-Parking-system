require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST ,
    user:  "vscode",
    password: "password",
    database: process.env.DB_DATABASE,
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
        process.exit(1);
    } else {
        console.log("Connected to MySQL database");
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Route: Get all states
app.get("/get_states", (req, res) => {
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
app.get("/get_cities", (req, res) => {
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
app.get('/search_branches', (req, res) => {
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


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
