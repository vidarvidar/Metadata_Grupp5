// import file system module
// - used to read file names from the music folder
import fs from 'fs';
// import the musicMetadata
// npm module - used to read metadata from music files
import musicMetadata from 'music-metadata';

// read all file names from the Music fodler
const files = await fs.readdirSync('Music');

// loop through all music files and read metadata
for (let file of files) {
console.log(file)
  // Get the metadata for the file
  let metadata = await musicMetadata.parseFile('./Music/' + file);

  // Log the result of inserting in the database
  console.log(metadata);

}
