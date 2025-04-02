/*This is the part where all the request will be coming first and according to the request url it will 
be redirected to differnt file like user.js, login.js.. etc.*/
require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");

app.use(session({
  secret: process.env.SESSION_secret, 
  resave: false,  
  saveUninitialized: false, 
  cookie: { 
      secure: false, 
      httpOnly: true, 
      maxAge: 1000 * 60 * 30 
  }
}));

const login = require("./login");
const user = require("./user");
const attendant = require("./attendant");
const admin = require("./admin");

app.use("/login",login);
app.use("/user",user);
app.use("/attendant",attendant);
app.use("/admin",admin);

app.use(express.static(path.join(__dirname,"../frontend")));

app.listen(process.env.MAIN_port,(err) => {
  if(err) throw err;
  console.log("The server has hosted on: http://localhost:3000/login/login.html");
});