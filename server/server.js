// Import the express package/module
// Express is a web framework for Node.js that makes it easy to create web servers and APIs
import express from 'express';

// Import the MySQL database driver (promise version)
// This allows us to connect to and query a MySQL database using async/await
import mysql from 'mysql2/promise';

import 'dotenv/config';

// Create an Express web server instance called 'app'
const app = express();

// Serve all static files (HTML, CSS, JS, images) from the 'client' folder
// This means visiting http://localhost:3000 will show client/index.html
app.use(express.static('client'));

// Start the server and listen for requests on port 3000
// When the server starts, print a message to the terminal
app.listen(3000, () =>
  console.log('Listening on http://localhost:3000'));

// Create a connection to the MySQL database
// Replace the credentials below with your own database details
// TODO: Replace the placeholder values below with your own MySQL database credentials
const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'dm24-hbg-grupp5'
});

// Helper function to run a SQL query with optional values
// Returns the result rows from the database
async function query(sql, listOfValues) {
  let result = await db.execute(sql, listOfValues);
  return result[0]; // result[0] contains the rows
}


app.get('/api/files', async (request, response) => {
  let { searchTerm, filetype } = request.query;

  let sql = `SELECT * FROM files WHERE 1=1`;
  let params = [];

  // Filtrera på sökord
  if (searchTerm) {
    searchTerm = `%${searchTerm}%`;
    sql += ` AND (LOWER(fileName) LIKE LOWER(?) OR LOWER(url) LIKE LOWER(?) OR LOWER(metadata) LIKE LOWER(?))`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  // Filtrera på filetype (t.ex. mp3, png, jpeg osv.)
  if (filetype) {
    let types = filetype.split(',').map(t => t.trim().toLowerCase());
    sql +=  ` AND LOWER(filetype) IN (${types.map(() => '?').join(',')})`;
    params.push(...types);
  }

  let result = await query(sql, params);
  response.json(result);
});
// REST API route: Get all people from the database
// When a GET request is made to /api/people, return all people as JSON
app.get('/api/files', async (request, response) => {
  // Query the database for all people
  let result = await query(`
    SELECT *
    FROM files
  `);
  // Send the result as a JSON response
  response.json(result);
});

// REST API route: Get all people from the database
// When a GET request is made to /api/people, return all people as JSON
app.get('/api/music', async (request, response) => {
  // Query the database for all people
  let audio_filetype = ['.mp3','.WAV','.aac','.ogg','.wma', '.flac', '.aiff', '.aif']

  let result = await query(`
    SELECT *
    FROM files
    WHERE filetype IN ${audio_filetype}
  `);
  // Send the result as a JSON response
  response.json(result);
});

// REST API route: Search for people by name or hobby
// When a GET request is made to /api/people/:searchTerm, search the database
app.get('/api/files/:searchTerm', async (request, response) => {
  // Get the search term from the URL and add % for SQL LIKE (partial match)
  let searchTerm = `%${request.params.searchTerm}%`;
  // Query the database for people where firstname, lastname, or hobby matches the search term (case-insensitive)
  let result = await query(`
    SELECT *
    FROM files
    WHERE 
      LOWER(fileName) LIKE LOWER(?) OR
      LOWER(filetype) LIKE LOWER(?) OR
      LOWER(metadata) LIKE LOWER(?)
  `, [searchTerm, searchTerm, searchTerm]);
  // Send the result as a JSON response
  response.json(result);
});

// REST API route: Search for people by name or hobby
// When a GET request is made to /api/people/:searchTerm, search the database
app.get('/api/music/:searchTerm', async (request, response) => {
  // Get the search term from the URL and add % for SQL LIKE (partial match)
  let searchTerm = `%${request.params.searchTerm}%`;
  let audio_filetype = ['.mp3', '.WAV','.aac','.ogg','.wma', '.flac', '.aiff', '.aif']
  // Query the database for people where firstname, lastname, or hobby matches the search term (case-insensitive)
  let result = await query(`
    SELECT *
    FROM files
    WHERE 
      LOWER(fileName) LIKE LOWER(?) OR
      LOWER(metadata) LIKE LOWER(?) AND
      filetype = (?)
  `, [searchTerm, searchTerm, '.mp3']);
  // Send the result as a JSON response
  response.json(result);
});

app.get('/api/filetypes', async (request, response) => {
  let result = await query(`
      SELECT DISTINCT filetype FROM files;
  `,);
  // Send the result as a JSON response
  
  response.json(result);
});

app.get('/api/genres', async (request, response) => {
  let result = await query(`
      SELECT DISTINCT metadata -> '$.genre' as Genres
      FROM files
      WHERE metadata -> '$.genre' IS NOT NULL
  `,);
 
  response.json(result);
});

app.get('/api/metadata', async (request, response) => {
  let result = await query(`
    SELECT DISTINCT (JSON_KEYS(metadata)) 'Keys'
    FROM files
  `,);
  // Send the result as a JSON response
  
  response.json(result);
});
