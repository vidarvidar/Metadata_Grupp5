  // This function is called when the user submits the search form
  // It// Escapa regex-tecken i sökordet (t.ex. +, *, ?, etc.)
  function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  // Escapa HTML-tecken i en sträng för att förhindra XSS-attacker (vet ej om detta behövs)
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Gör metadata till en läsbar text
  function stringifyMetadata(meta) {
    if (meta == null) return '';

    if (typeof meta === 'string') return meta;

    if (Array.isArray(meta)) return meta.join(', ');

    if (typeof meta === 'object') {
      try {
        return Object.entries(meta)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
          .join('; ');
      } catch {
        return JSON.stringify(meta);
      }
    }
    return String(meta);
  }

  // Highlight search term in metadata safely (after escaping HTML)
  function highlightSafe(rawMeta, searchTerm) {
    if (!searchTerm) return escapeHTML(stringifyMetadata(rawMeta));
    let text = escapeHTML(stringifyMetadata(rawMeta));
    let rx = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(rx, '<span class="highlight">$1</span>');
  }

async function ToggleDropdown() {
  document.getElementById("filetypeDropdown").classList.toggle("show");
}


async function search() {
  // Hämta sökord från formfältet
  let searchTerm = document.forms.searchForm.term.value.trim();



  let types = []
  // Läs checkboxar
  
  let onlyAudio = document.getElementById("audioCheckbox")?.checked ?? false;
  
  if (onlyAudio) types.push('.mp3', '.WAV','.aac','.ogg','.wma', '.flac', '.aiff', '.aif')
  if (document.getElementById("videoCheckbox")?.checked) types.push('.mp4', '.avi', '.mkv', '.mov')
  if (document.getElementById("imagesCheckbox")?.checked) types.push('.jpg','.jpeg', '.png', '.tif', '.tiff')
  if (document.getElementById("pdfCheckbox")?.checked) types.push('.pdf', '.xlsx')


  let searchResultsElement = document.querySelector('.searchResults');

  // Om inget sökord
  if (!searchTerm) {
    searchResultsElement.innerHTML = '<p>Found 0 results.</p>';
    return;
  }

  
  // Bygg query-parametrar
  let url = `/api/files?searchTerm=${encodeURIComponent(searchTerm)}`;

  // Om audio är valt → hämta bara mp3
  if (types.length > 0) {
    url += `&filetype=${types.join(',')}`;
  }

  
  // Hämta från API
  let allFiles = [];
  try {
    let res = await fetch(url);
    allFiles = await res.json();
  } catch (err) {
    console.error("Error fetching files:", err);
  }
  console.log('allfiles log -', allFiles)
  // Börja bygga HTML för resultaten
  let html = `
    <p>You searched for "<span class="highlight">${escapeHTML(searchTerm)}</span>"...</p>
    <p>Found ${allFiles.length} results.</p>
  `;

  // Vanliga bild-ändelser
  let imageExts = ['.jpg', '.jpeg', '.png', '.tif', '.tiff'];
  let audio_filetype = ['.mp3', '.WAV','.aac','.ogg','.wma', '.flac', '.aiff', '.aif']
  let video_filetype = ['.mp4', '.avi', '.mkv', '.mov']

  for (let file of allFiles) {
    let filename = file.filename ?? file.fileName ?? 'Unknown filename';
    let filetype = (file.filetype ?? '').toLowerCase();
    let url = file.url ?? '';
    console.log('file - ', file, filename, filetype)
    console.log('meta - ', file.metadata)
    console.log('longitude - ', file.metadata.longitude)
    // Kolla om filen är en bild
    let isImage = imageExts.some(ext => filetype.endsWith(ext));

    let highlightedMetadata = highlightSafe(file.metadata, searchTerm);
    console.log('highlighted meta -', highlightedMetadata)

    if (imageExts.includes(filetype)) {

        if (file.metadata.longitude && file.metadata.latitude) {

        let lon = file.metadata.longitude
        let lat = file.metadata.latitude

          html += `
            <section>
              <h2>Filename: ${escapeHTML(filename)}</h2>
              ${isImage && url ? `<img src="${escapeHTML(url)}" alt="${escapeHTML(filename)}">` : ''}
              <li>
                <p>Camera Make & Model: ${file.metadata.Make} ${file.metadata.Model}</p>
                <p>Date/Time taken: ${file.metadata.DateTimeOriginal}</p>
                <p>Exposure: ${file.metadata.ExposureTime} - FNumber: ${file.metadata.FNumber}
                <p>Lat: ${lat}, Long: ${lon}
                  <a href="https://maps.google.com/?q=${lat},${lon}">Open in Google Maps</a>
              </li>
                <div class="metadata">
                  <p>Metadata: ${highlightedMetadata}</p>
                </div>
            </section>
        `;
          }
        else {  
          
          html += `
              <section>
                <h2>Filename: ${escapeHTML(filename)}</h2>
                ${isImage && url ? `<img src="${escapeHTML(url)}" alt="${escapeHTML(filename)}">` : ''}
                <li>
                  <p>Camera Make & Model: ${file.metadata.Make} ${file.metadata.Model}</p>
                  <p>Date/Time taken: ${file.metadata.DateTimeOriginal}</p>
                  <p>Exposure: ${file.metadata.ExposureTime} - FNumber: ${file.metadata.FNumber}
                </li>
                  <div class="metadata">
                    <p>Metadata: ${highlightedMetadata}</p>
                  </div>
              </section>
            ` 
            }
      }
    else if (audio_filetype.includes(filetype)) {

        html += `
          <section>
            <h2>Filename: ${escapeHTML(filename)}</h2>
            ${isImage && url ? `<img src="${escapeHTML(url)}" alt="${escapeHTML(filename)}">` : ''}
            <li>
              <p>Artist: ${file.metadata.artist}, Album:${file.metadata.album}</p>
              <p>Genre: ${file.metadata.genre}</p>
              <p>Duration: ${file.metadata.duration_seconds} sec</p>
            </li>
            <div class="metadata">
              <p>Metadata: ${highlightedMetadata}</p>
            </div>
          </section>
      `
      }
    else if (file.filetype == '.pdf') {

        html += `
          <section>
            <h2>Filename: ${escapeHTML(filename)}</h2>
            ${isImage && url ? `<img src="${escapeHTML(url)}" alt="${escapeHTML(filename)}">` : ''}
            <li>
              <p>Author: ${file.metadata.author}, Language:${file.metadata.language}</p>
              <p>Publication Date: ${file.metadata.publication_date}
              <p>Keywords: ${file.metadata.keywords}</p>
              <p>Page Count: ${file.metadata.page_count} sec</p>
            </li>
            <div class="metadata">
              <p>Metadata: ${highlightedMetadata}</p>
            </div>
          </section>
      `      

    }
    else if (video_filetype.includes(filetype)){

        html += `
          <section>
            <h2>Filename: ${escapeHTML(filename)}</h2>
            ${url ? `<img src="${escapeHTML(url)}" alt="${escapeHTML(filename)}">` : ''}
            <p>Metadata: ${JSON.stringify(file.metadata)}</p>
          </section>
        `      
    }
      else {

        html += `
            <section>
              <h2>Filename: ${escapeHTML(filename)}</h2>
              ${isImage && url ? `<img src="${escapeHTML(url)}" alt="${escapeHTML(filename)}">` : ''}
              <p>Metadata: ${highlightedMetadata}</p>
            </section>
          `  
      }
  }  

  searchResultsElement.innerHTML = html;
}

// Rensa inputfält efter sökning
document.forms.searchForm.term.value = '';