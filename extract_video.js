// import fs from 'fs';
// import path from 'path';
// import ffprobe from 'ffprobe';
// import ffprobeStatic from 'ffprobe-static';

// give me a list of all files in the image folder
// let files = fs.readdirSync('client/Data/');


// Loop through the images and extract the metadata
for (let file of files) {

    let ext = path.parse(file).ext.toLowerCase();
    let filePath = path.join('videos', file);
  

//   let video_filetype = ['.mp4', '.avi', '.mkv', '.mov']
  
  if (video_filetype.includes(path.parse(file).ext)) {

    let raw = await ffprobe(filePath, { path: ffprobeStatic.path });

    let metadata = JSON.stringify(raw, null, 2);

    // console.log(`Metadata for ${file}:`);

    console.log(metadata);
  }


}

if (video_filetype.includes(path.parse(file).ext)) {

    let raw = await ffprobe(filePath, { path: ffprobeStatic.path });

    let metadata = JSON.stringify(raw);
    console.log(file)
    // Uploads row by row into database with local storage path as url
    let [result] = await db.execute('INSERT INTO files (fileName, filetype, url, metadata) VALUES (?,?,?,?)', [path.parse(file).name, path.parse(file).ext, 'Data/' + file, metadata]);
    
  }