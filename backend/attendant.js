const express = require("express");
const router = express.Router();
const db = require("./db");

router.use(express.json());

let attendant_id;
let branch_name;

//for login confirmation
router.get("/",(req,res) => {
  if(req.session.attendant_id && req.session.branch_name)
  {
    console.log(req.session.attendant_id,req.session.branch_name)
    attendant_id = req.session.attendant_id;
    branch_name = req.session.branch_name;
    return res.status(200).json({});
  }
  else{
    return res.status(401).json({redirectUrl: "/login/staff_portal.html"});
  }
});

//for fetching the slots
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

//for registering vehicles
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
        query = "UPDATE slots set status = 'Parked' WHERE slot_id = ? and branch_name = ?";
      db.query(query,[selectedSlot, branch_name],(err) =>{
        if(err)
        {
          console.error("Some error occured: ",err);
          return res.status(407).json({message: "Some error with the database has occured"});
        }
        query = "INSERT INTO parking_record (user_id, vehicle_no, branch_name, attendant_in) VALUES(?, ?, ?, ?)";
        values = [userId, licensePlate, branch_name, attendant_id];
    
        db.query(query,values,(err) => {
          if(err)
          {
            console.error("Some error occured: ",err);
            return res.status(407).json({message: "Some error with the database has occured"});
          }
          return res.status(200).json({message: "Your vehicle has been registered successfully!"});
        });
      });
    });
  });
});

//for logout
router.get("/logout",(req,res) => {
  req.session.destroy((err) =>{
    if(err)
    {
      return res.status(401).json({message: "Error in logging out"});
    }
    return res.status(200).json({message: "Successfully logged out",redirectUrl: "/login/staff_portal.html"});
  });
});

//for loading table in update page
router.get("/updatetable",(req,res) => {
  let query = "SELECT slot_id, v.user_id, v.vehicle_no FROM vehicles v JOIN parking_record p ON v.id = p.id WHERE checkout_at IS NULL and branch_name = ?";
  db.query(query,[branch_name],(err,results) => {
    if(err){
      console.error("Some error occured: ",err);
      return res.status(407).json({message: "Some error with the database has occured"});
    }
    return res.status(200).json(results);
  });
});

//for updating slot of vehicles
router.post("/update",(req,res) => {
  const {no, old_slot,selectedSlot} = req.body;
  let query = "UPDATE slots SET status = 'Vacant' WHERE branch_name = ? and slot_id = ?";
  db.query(query,[branch_name,old_slot],(err) => {
    if(err)
    {
      console.error("Some error occured: ",err);
      return res.status(407).json({message: "Some error with the database has occured"});
    }
    query = "UPDATE slots SET status = 'Parked' WHERE branch_name = ? and slot_id = ?"
    db.query(query,[branch_name,selectedSlot],(err) => {
      if(err)
      {
        console.error("Some error occured: ",err);
        return res.status(407).json({message: "Some error with the database has occured"});
      }
      query = "UPDATE vehicles SET slot_id = ? WHERE vehicle_no = ? and slot_id = ? and checkout_at IS NULL";
      db.query(query,[selectedSlot, no, old_slot],(err) => {
        if(err){
          console.error("Some error occured: ",err);
          return res.status(407).json({message: "Some error with the database has occured"});
        }
        return res.status(200).json({});
      });
    });
  });
});
module.exports = router;