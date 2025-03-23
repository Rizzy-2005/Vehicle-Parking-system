/*Code for database connection. we will not be defining this code everywhere so defining it as module
so that it can be exported and used*/
/*Also we have used the pool here so that we dont have to like open and close the connection to the db 
again and again(for resource managment)*/
//Also using the env file to make the details more secure
require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_host,
  user: process.env.DB_user,
  password: process.env.DB_password,
  database: process.env.DB_database,
  connectionLimit: 10,
  waitForConnections: true
});

module.exports = db;


