  if (file.slice(-4) == '.mp3' || file.slice(-4) == '.WAV') {
    
    let raw = await musicMetadata.parseFile('./client/Data' + file);
    let metadata = JSON.stringify(raw);
    let result = await db.execute('INSERT INTO files (fileName, url, metadata) VALUES (?, ?, ?)', [file, 'Data/' + file, metadata]);
    console.log(result)

  if (file.slice(-4) == '.pdf') {

    let raw = fs.readFileSync('client/Data/' + file)
 
    let raw_metadata = await PdfParse(raw)

    let metadata = await JSON.stringify(raw_metadata)

    let result = await db.execute('INSERT INTO files (fileName, url, metadata) VALUES (?, ?, ?)', [file, 'Data/' + file, metadata]);
    console.log(result)
  };
}