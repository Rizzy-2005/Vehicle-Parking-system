const express = require('express');
const cors = require('cors');
const router = express.Router();
const db = require("./db");

router.use(express.json())
router.use(cors());

router.post('/data',(req,res)=>{
    const query = 'SELECT v.user_id, v.vehicle_no, v.registered_at, v.checkout_at, p.attendant_in, ai.attendant_name AS checkin_attendant, p.attendant_out, ao.attendant_name AS checkout_attendant, p.profit FROM vehicles v JOIN parking_record p ON v.id = p.id LEFT JOIN attendant ai ON p.attendant_in = ai.attendant_id LEFT JOIN attendant ao ON p.attendant_out = ao.attendant_id WHERE p.branch_name = ?';
    db.query(query,[req.session.branch_name],(err,result)=>{
        if (err){
            console.error("Error Encountered: ",err.message);
        }
        if (result.length === 0){
            return res.status(500).json({message:"No records found"});
        }
        res.status(200).json(result);
    })
})

router.get("/",(req,res) => {
    if(req.session.admin_id && req.session.branch_name)
    {
      return res.status(200).json({});
    }
    else{
      return res.status(401).json({redirectUrl: "/login/staff_portal.html"});
    }
  });
  
router.get("/rate",(req,res) => {
    db.query("SELECT rate_per_hour FROM admin WHERE admin_id = ?",[req.session.admin_id],(err,result) => {
        if(err)
        {
            console.error("Some error occured: ",err);
            return res.status(407).json({message: "Some error with the database has occured"})
        }
        return res.status(200).json(result);
    });
});

router.post("/updaterate",(req,res) => {
    const {new_rate} = req.body;   
    db.query("UPDATE admin SET rate_per_hour = ? WHERE admin_id = ?",[new_rate,req.session.admin_id],(err,result) => {
        if(err)
        {
            console.error("Some error occured: ",err);
            return res.status(407).json({message: "Some error with the database has occured"})
        }
        return res.status(200).json({message: "Successfully updated the rate/hour"});
    });
});

router.get("/logout",(req,res) => {
    req.session.destroy((err) =>{
      if(err)
      {
        return res.status(401).json({message: "Error in logging out"});
      }
      return res.status(200).json({message: "Successfully logged out",redirectUrl: "/login/staff_portal.html"});
    });
  });
  // ✅ Add a New Attendant
router.post("/attendant", (req, res) => {
  const { id, name, phone, gender, password, shift } = req.body;

  if (!id || !name || !phone || !gender || !password || !shift) {
      return res.status(400).json({ message: "All fields are required" });
  }

  const query = `
      INSERT INTO attendant (attendant_id, attendant_name, phone_no, gender, attendant_password, shift, branch_name) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [id, name, phone, gender, password, shift, req.session.branch_name], (err, result) => {
      if (err) {
          console.error("Error adding attendant:", err);
          return res.status(500).json({ message: "Database error while adding attendant" });
      }

      return res.status(201).json({ message: "Attendant added successfully" });
  });
});
// ✅ NEW: Get All Attendants
router.get("/attendant", (req, res) => {
  const query = `
      SELECT attendant_id, attendant_name, phone_no, branch_name, gender, shift 
      FROM attendant 
      WHERE branch_name = ?`;

  db.query(query, [req.session.branch_name], (err, results) => {
      if (err) {
          console.error("Error fetching attendants:", err);
          return res.status(500).json({ message: "Database error while fetching attendants" });
      }

      return res.status(200).json(results);
  });
});
// ✅ Delete an Attendant by ID
router.delete("/attendants/:id", (req, res) => {
  const id = req.params.id;

  const query = "DELETE FROM attendant WHERE attendant_id = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting attendant:", err);
      return res.status(500).json({ success: false, message: "Database error while deleting attendant" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Attendant not found" });
    }

    return res.status(200).json({ success: true, message: "Attendant deleted successfully" });
  });
});

module.exports = router;
