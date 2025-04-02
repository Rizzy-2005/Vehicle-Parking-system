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
  db.query("SELECT * FROM users WHERE user_id = ?",[userId],(error,result) =>{
    if(error)
    {
      console.error("Some error occured: ",error);
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
      db.query(query,[selectedSlot, branch_name],(er) =>{
        if(er)
        {
          console.error("Some error occured: ",er);
          return res.status(407).json({message: "Some error with the database has occured"});
        }
        query = "INSERT INTO parking_record (user_id, vehicle_no, branch_name, attendant_in) VALUES(?, ?, ?, ?)";
        values = [userId, licensePlate, branch_name, attendant_id];
    
        db.query(query,values,(e) => {
          if(e)
          {
            console.error("Some error occured: ",e);
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
  db.query(query,[branch_name,old_slot],(error) => {
    if(error)
    {
      console.error("Some error occured: ",error);
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
      db.query(query,[selectedSlot, no, old_slot],(er) => {
        if(er){
          console.error("Some error occured: ",er);
          return res.status(407).json({message: "Some error with the database has occured"});
        }
        return res.status(200).json({});
      });
    });
  });
});

//Loading checkout table
router.get("/checkouttable",(req,res) => {
  let query = "SELECT v.user_id, slot_id, v.vehicle_no, vehicle_name FROM vehicles v JOIN parking_record p ON v.id = p.id WHERE checkout_at IS NULL AND branch_name = ?";
  db.query(query,[branch_name],(err,result) => {
    if(err)
    {
      console.error("Some error occured: ",err);
      return res.status(407).json({message: "Some error with the database has occured"});  
    }
    return res.status(200).json(result);
  });
});

//checkout details
router.post("/checkout",(req,res) => {
  const {userId, vehicleNo} = req.body;
  let query = "SELECT registered_at FROM vehicles WHERE user_id = ? AND vehicle_no = ? AND checkout_at IS NULL";
  db.query(query,[userId, vehicleNo],(err,result) => {
    if(err)
    {
      console.error("Some error occured: ",err);
      return res.status(407).json({message: "Some error with the database has occured"}); 
    }
    return res.status(200).json(result);
  });
});

//verify
router.post("/verify",(req,res) => {
  const {userId, slotId, vehicleNo, vehicleName,securityKey} = req.body;
  let query = "SELECT secret_no FROM vehicles WHERE user_id = ? AND vehicle_no = ? AND checkout_at IS NULL";
  db.query(query,[userId, vehicleNo],(err,result) => {
    if(err)
    {
      console.error("Some error occured: ",err);
      return res.status(407).json({message: "Some error with the database has occured"}); 
    }
    if(securityKey != result[0].secret_no)
    {
      return res.status(401).json({message:"The entered key is wrong"});
    }
    req.session.user = userId;
    req.session.slotId = slotId;
    req.session.vehicleNo = vehicleNo;
    req.session.vehicleName = vehicleName;
    return res.status(200).json({message: "The security key verified successfully",redirectUrl: "Attendant-Bill.html"})
  });
});

//calculate the duration of vehicle
function calculateDuration(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end - start;
  const durationHours = durationMs / (1000 * 60 * 60);
  return durationHours.toFixed(2);
  }

//loading the bill page
router.post("/loadbill",(req,res) => {
  const {now} = req.body;
  let query = "SELECT registered_at FROM vehicles WHERE user_id = ? AND vehicle_no = ? AND checkout_at IS NULL";
  db.query(query,[req.session.user,req.session.vehicleNo],(error,result) => {
    if(error)
    {
      console.error("Some error occured: ",error);
      return res.status(407).json({message: "Some error with the database has occured"});   
    }
    db.query("SELECT rate_per_hour FROM admin WHERE branch_name = ?",[branch_name],(err,results) => {
      if(err)
      {
        console.error("Some error occured: ",err);
        return res.status(407).json({message: "Some error with the database has occured"});  
      }
      results[0].duration = calculateDuration(result[0].registered_at,now);
      results[0].registered_at = result[0].registered_at;
      results[0].user_id = req.session.user;
      results[0].vehicle_name = req.session.vehicleName;
      results[0].vehicle_no = req.session.vehicleNo;
      results[0].slot_id = req.session.slotId;
      results[0].total = (results[0].duration)*(results[0].rate_per_hour);
      return res.status(200).json(results);
    });
  });
});

//final checkout
router.post("/paid",(req,res) => {
  const {now, total} = req.body;
  const checkoutAt = now.slice(0, 19).replace('T', ' ');

  let query = "UPDATE slots SET status = 'Vacant' WHERE branch_name = ? AND slot_id = ?";
  db.query(query,[branch_name,req.session.slotId],(error) => {
    if(error)
    {
      console.error("Some error occured: ",error);
      return res.status(407).json({message: "Some error with the database has occured"});  
    }
    query = "UPDATE vehicles SET checkout_at = ? WHERE user_id = ? AND vehicle_no = ? AND checkout_at IS NULL";
    db.query(query,[checkoutAt,req.session.user,req.session.vehicleNo],(err) => {
      if(err){
        console.error("Some error occured: ",err);
        return res.status(407).json({message: "Some error with the database has occured"});  
      }
      query = "UPDATE parking_record SET attendant_out = ?, profit = ? WHERE user_id = ? AND vehicle_no = ? AND attendant_out IS NULL";
      db.query(query,[attendant_id,total,req.session.user,req.session.vehicleNo],(er) => {
        if(er)
        {
          console.error("Some error occured: ",er);
          return res.status(407).json({message: "Some error with the database has occured"});  
        }
        return res.status(200).json({message: "The vehicle has been checked out successfully",redirectUrl: "Attendant-Checkout.html"});
      })
    });
  })
});

module.exports = router;