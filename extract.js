
import exifr from 'exifr';

import fs from 'fs';
import mysql from 'mysql2/promise';
import 'dotenv/config';
import PdfParse from 'pdf-parse-new';
import musicMetadata from 'music-metadata';
import xlsx from 'xlsx';
import path from 'path';
import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';

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

// give me a list of all files in the image folder
let files = fs.readdirSync('client/Data/');
// Empties the database before attempting insert to avoid duplicate,
// Take this out if you wish to add to db without deleting
// let empty = await query('DELETE FROM files')



// Loop through the images and extract the metadata
for (let file of files) {
  // Create lists of file extensions that we use to sort en specify which metadata parser to use for each file
  // Individual metadata parsers can sometimes handle additional extensions but these are the most common.
  let audio_filetype = ['.mp3', '.WAV','.aac','.ogg','.wma', '.flac', '.aiff', '.aif']
  let image_filetype = ['.jpg','.png', '.tif', '.jpeg']
  let video_filetype = ['.mp4', '.avi', '.mkv', '.mov']
  
  if (image_filetype.includes(path.parse(file).ext.toLowerCase())) {

    let raw = await exifr.parse('client/Data/' + file);

    let metadata = JSON.stringify(raw);
    console.log(file)
    try {
    // Uploads row by row into database with local storage path as url, stores metadata as JSON in MySQL column
      let [result] = await db.execute('INSERT INTO files (fileName, filetype, url, metadata) VALUES (?,?,?,?)', [file, path.parse(file).ext, 'Data/' + file, metadata]);
    }
    catch(err) {
      console.log(err)
    }
  }
  if (audio_filetype.includes(path.parse(file).ext.toLowerCase())) {
  
    let raw = await musicMetadata.parseFile('client/Data/' + file);
    delete raw.native;
    delete raw.quality;
    delete raw.common.picture;
    // let metadata = JSON.stringify(raw.common);
    console.log(file);
    // A good chunk of our mp3 files have metadata located within an object called common, these if statements sort and specify which
    // part of the entire metadata we wish to store in our database
    if (raw.common) {
      let metadata = JSON.stringify(raw.common)
      try {
        let [result] = await db.execute('INSERT INTO files (fileName, filetype, url, metadata) VALUES (?,?,?,?)', [file, path.parse(file).ext, 'Data/' + file, metadata]);
      }
      catch(err) {console.log(err)}
      };
    if (!raw.common) {
      let metadata = JSON.stringify(raw)
      try {
        let [result] = await db.execute('INSERT INTO files (fileName, filetype, url, metadata) VALUES (?,?,?,?)', [file, path.parse(file).ext, 'Data/' + file, metadata]);
      }
      catch(err) {console.log(err)}
      };
    }
  if (path.parse(file).ext == '.pdf') {

    let raw = fs.readFileSync('client/Data/' + file)
      
    let raw_metadata = await PdfParse(raw)
    delete raw_metadata.text;

    // let metadata = JSON.stringify(raw_metadata)
    console.log(file);
    // Same here as for audio files, sometimes theres an object called info that has all the stuff we want and
    // sometimes there is not and the metadata lies within the first level of the json. 
    if (raw_metadata.info) {
      let metadata = JSON.stringify(raw_metadata.info);
      try {
      let result = await db.execute('INSERT INTO files (fileName, filetype, url, metadata) VALUES (?, ?,?, ?)', [file, path.parse(file).ext, 'Data/' + file, metadata]);
      }
      catch(err) {console.log(err)}
      }
    if (!raw_metadata.info) {
      let metadata = JSON.stringify(raw_metadata)
      try {
      let result = await db.execute('INSERT INTO files (fileName, filetype, url, metadata) VALUES (?, ?,?, ?)', [file, path.parse(file).ext, 'Data/' + file, metadata]);
      }
      catch(err) {console.log(err)}
      }
  
    }
  if (path.parse(file).ext == '.xlsx') {

    let raw = await xlsx.readFile('client/Data/' + file)

    let metadata = JSON.stringify(raw);
    console.log(file)
    try {
      let [result] = await db.execute('INSERT INTO files (fileName, filetype, url, metadata) VALUES (?,?,?,?)', [file, path.parse(file).ext, 'Data/' + file, metadata]);
    }
    catch(err) {console.log(err)}
  }
    
    
  if (video_filetype.includes(path.parse(file).ext.toLowerCase())) {
    let ext = path.parse(file).ext.toLowerCase();
    let filePath = path.join('client/Data/', file);

    let raw = await ffprobe(filePath, { path: ffprobeStatic.path });

    let metadata = JSON.stringify(raw);
    console.log(file)
    try {
      let [result] = await db.execute('INSERT INTO files (fileName, filetype, url, metadata) VALUES (?,?,?,?)', [file, path.parse(file).ext, 'Data/' + file, metadata]);
    }
    catch(err) {console.log(err)}
    }
  };

await db.end();

