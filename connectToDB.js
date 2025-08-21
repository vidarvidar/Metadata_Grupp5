// Boilerplate code for connecting to database
// DB connection details must be stored in .env file in the root
// Import the database driver
import mysql from 'mysql2/promise';
import 'dotenv/config'

// Create a connection 'db' to the database
const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'dm24-hbg-grupp5'
});

// A small function for a query
async function query(sql){
   let result = await db.execute(sql);
   return result[0];
}
//// Test connection, should result in 1 row from table test
// let allPersons = await query('SELECT * FROM test');
// console.log(allPersons);