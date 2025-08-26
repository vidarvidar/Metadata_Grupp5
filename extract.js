// import exifr - a metadata extractor for images
import exifr from 'exifr';
// import fs (file system) - a built in module in Node.js
import fs from 'fs';
import mysql from 'mysql2/promise';
import 'dotenv/config';

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
// let result = await query('SELECT * FROM test')
// console.log(result)

// give me a list of all files in the image folder
let images = fs.readdirSync('client/Data/');


// Loop through the images and extract the metadata
for (let image of images) {
  // let metadata_list = []
  // Only for files ending with .jpg
  // slice(-4) get the last 4 letters from the image name
  if (image.slice(-4) == '.jpg'); {

    let raw = await exifr.parse('client/Data/' + image);

    let metadata = JSON.stringify(raw);
    // Uploads row by row into database with local storage path as url
    let [result] = await db.execute('INSERT INTO files (fileName, url, metadata) VALUES (?,?,?)', [image, 'Data/' + image, metadata]);
    console.log(result)
  }
}
await db.end()