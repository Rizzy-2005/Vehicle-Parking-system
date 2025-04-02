const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const PORT = 3000;
const app = express();

//middleware

app.use(express.json())
app.use(cors());
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, '..')));
//db connection

const db = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password:'NewPassword',
    database:'ez_park',
})


db.connect((err)=>{
    if (err){
        console.error('Database Connection Failed: ',err.message);
    }

    else{
        console.log("Connected to MYSQL Database");
    }
})



app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'Parking-revenue.html'),(err)=>{
        if (err){
            console.error("Page not found: ",err.message);
        }
    });
})

app.post('/',(req,res)=>{
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




app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})