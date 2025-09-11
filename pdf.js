import PdfParse from 'pdf-parse-new';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
// import dotenv from 'dotenv';
// dotenv.config()

// const db = await mysql.createConnection({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: 'dm24-hbg-grupp5'
// });

// // A small function for a query
// async function query(sql, listOfValues) {
//   let result = await db.execute(sql, listOfValues);
//   return result[0];
// }

let files = fs.readdirSync('./client/Data/')


for (let file of files) {
   

    if (path.parse(file).ext == '.pdf') {

    let raw = fs.readFileSync('client/Data/' + file)
    let metadata = await PdfParse(raw)
    delete metadata.text
    console.log(file)
    console.log(metadata)
    }
    // let result = await db.execute('INSERT INTO files (fileName, url, metadata) VALUES (?, ?, ?)' [file, 'pdfs/' + file, metadata]);
    // console.log(result)
    };