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

const preventCaching = (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
};

app.use("/login", preventCaching, login);
app.use("/user", preventCaching, user);
app.use("/attendant", preventCaching, attendant);
app.use("/admin", preventCaching, admin);

app.use(express.static(path.join(__dirname,"../frontend")));

app.get("/", (req,res) => {
  res.redirect("/login/login.html");
});

app.listen(process.env.PORT,(err) => {
  if(err) throw err;
  console.log("The server has hosted on: http://localhost:3000");
});