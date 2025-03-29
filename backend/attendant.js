const express = require("express");
const router = express.Router();
const db = require("./db");

router.use(express.json());

let attendant_id;
let branch_name;

router.get("/",(req,res) => {
  if(req.session.attendant_id && req.session.branch_name)
  {
    attendant_id = req.session.attendant_id;
    branch_name = req.session.branch_name;
  }
  else{
    return res.status(401).json({redirectUrl: "/login/staff_portal.html"});
  }
});

router.get("/fetchSlots",(req,res) => {
  let query = "SELECT slot_id, type, status FROM slots WHERE branch_name = ?";
  db.query(query,[branch_name],(err,result) => 
  {
    if(err)
    {
      console.error("Some error occured: ",err);
      return res.status(407).json({message: "Some error with the database has occured"});
    }
    return res.json(result);
  });
});

router.post("/register",(req,res) => {
  const {userId, vehicleName, licensePlate, selectedSlot} = req.body;
  db.query("SELECT * FROM users WHERE user_id = ?",[userId],(err,result) =>{
    if(err)
    {
      console.error("Some error occured: ",err);
      return res.status(407).json({message: "Some error with the database has occured"});
    }
    if(result.length === 0)
    {
      return res.status(401).json({message: "Userid is not in database"});
    }
    const secret_no = Math.floor(1000 + Math.random() * 9000);

    let query = "INSERT INTO vehicles (user_id, vehicle_no, vehicle_name, slot_id, secret_no, registered_at) VALUES(?, ?, ?, ?, ?, NOW())";
    let values = [userId, licensePlate, vehicleName, selectedSlot, secret_no];

    db.query(query,values,(err) => {
      if(err)
        {
          console.error("Some error occured: ",err);
          return res.status(407).json({message: "Some error with the database has occured"});
        }
    });

    query = "UPDATE slots set status = 'Parked' WHERE slot_id = ? and branch_name = ?";
    db.query(query,[selectedSlot, branch_name],(err) =>{
      if(err)
      {
        console.error("Some error occured: ",err);
        return res.status(407).json({message: "Some error with the database has occured"});
      }
    });

    query = "INSERT INTO parking_record (user_id, vehicle_no, branch_name, attendant_in) VALUES(?, ?, ?, ?)";
    values = [userId, licensePlate, branch_name, attendant_id];

    db.query(query,values,(err) => {
      if(err)
      {
        console.error("Some error occured: ",err);
        return res.status(407).json({message: "Some error with the database has occured"});
      }
    });
    return res.status(200).json({message: "Your vehicle has been registered successfully!"});
  });
});

router.get("/logout",(req,res) => {
  req.session.destroy((err) =>{
    if(err)
    {
      return res.status(401).json({message: "Error in logging out"});
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({message: "Successfully logged out",redirectUrl: "/login/staff_portal.html"});
  });
});

module.exports = router;