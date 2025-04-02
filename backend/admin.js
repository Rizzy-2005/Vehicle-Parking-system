const express = require('express');
const cors = require('cors');
const router = express.Router();
const db = require("./db");

router.use(express.json())
router.use(cors());

router.post('/',(req,res)=>{
    const query = 'select p.user_id,p.vehicle_no,ai.attendant_name as checkin_attendant,ao.attendant_name as checkout_attendant,v.registered_at, v.checkout_at,p.profit from vehicles as v, parking_record as p LEFT JOIN attendant ai ON p.attendant_in = ai.attendant_id LEFT JOIN attendant ao ON p.attendant_out = ao.attendant_id where p.id = v.id;'
    db.query(query,(err,result)=>{
        if (err){
            console.error("Error Encountered: ",err.message);
        }
        if (result.length === 0){
            return res.status(500).json({message:"No records found"});
        }
        res.status(200).json(result);
    })
})

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

module.exports = router;
