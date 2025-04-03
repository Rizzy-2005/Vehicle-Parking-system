const express = require('express');
const cors = require('cors');
const router = express.Router();
const db = require("./db");

router.use(express.json())
router.use(cors());

router.post('/',(req,res)=>{
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

module.exports = router;
