// import file system module
// - used to read file names from the music folder
import fs from 'fs';
// import the musicMetadata
// npm module - used to read metadata from music files
import musicMetadata from 'music-metadata';
// Import the database driver
import mysql from 'mysql2/promise';
// import dotenv from 'dotenv';
import path from 'path';
import dotenv from 'dotenv'
dotenv.config()

const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'dm24-hbg-grupp5'
});

// A small function for a query
async function query(sql, listOfValues) {
  let result = await db.execute(sql, listOfValues);
  return result[0];
};
// query('DELETE FROM files WHERE filetype = ".mp3"');

let file = fs.readFileSync('MOCK_DATA.json')
let raws = JSON.parse(file)

let filenames = []
for (let raw of raws) {
  console.log(raw.filename)
  filenames.push(raw.filename)
  delete raw.filename;
  try {
  let result = await db.execute('INSERT INTO files (fileName, filetype, metadata) VALUES (?, ?, ?)', [raw.title + '.mp3', '.mp3', raw]);
  }
  catch(err) {
    console.log(err)
  }

};

let pdfs = fs.readFileSync('MOCK_DATA_pdf.json')
let raws_pdf = JSON.parse(pdfs)

for (let raw_pdf of raws_pdf) {
  try {
  let result = await db.execute('INSERT INTO files (fileName, filetype, metadata) VALUES (?,?,?)', [raw_pdf.title +'.pdf', '.pdf', raw_pdf]);
  }
  catch(err) {
    console.log(err)
  }
};


let videos = fs.readFileSync('mockdata_videos.json')
let raws_videos = JSON.parse(videos)

for (let raw_video of raws_videos) {

  try {
  let result = await db.execute('INSERT INTO files (fileName, filetype, url, metadata) VALUES (?,?,?,?)', [raw_video.filename, raw_video.extension,raw_video.path, raw_video.metadata]);
  }
  catch(err) {
    console.log(err)
  }

  
};


// for (let file of filenames) {
//   console.log(file)
// };

// read all file names from the Music fodler
// const files = fs.readdirSync('client/Data/');
// console.log(files)
// loop through all music files and read metadata
// for (let file of files) {
//   if (path.parse(file).ext == '.mp3') {
//   // Get the metadata for the file
//   let metadata = await musicMetadata.parseFile('./client/Data/' + file);
//   delete metadata.native;
//   delete metadata.quality
//   console.log(file)
//   console.log(metadata)
  // delete (in-memory) some parts of the metadata
  // that we don't want in the database
  // note: we are not deleteing anything in the files
//   delete metadata.native;
//   delete metadata.quality;
//   delete metadata.common.disk;



  // Log the result of inserting in the database
//   console.log(file, result);s
    
// }
// }
// exit/stop the script when everything is imported
// so you don't have to press Ctrl+C
