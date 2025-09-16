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
};
// Searches database on api/files endpoint
async function search(options = {}) {
  // Hämta sökord från formfältet
  let searchTerm = document.forms.searchForm.term.value.trim();


  let types = []
  // Läs checkboxar
  
  let onlyAudio = document.getElementById("audioCheckbox")?.checked ?? false;
  
  if (onlyAudio) types.push('.mp3', '.WAV','.aac','.ogg','.wma', '.flac', '.aiff', '.aif')
  if (document.getElementById("videoCheckbox")?.checked) types.push('.mp4', '.avi', '.mkv', '.mov')
  if (document.getElementById("imagesCheckbox")?.checked) types.push('.jpg','.jpeg', '.png', '.tif', '.tiff')
  if (document.getElementById("pdfCheckbox")?.checked) types.push('.pdf', '.xlsx')

  let sort = options.sort || null; 

  let searchResultsElement = document.querySelector('.searchResults');

  // Om inget sökord
  if (!searchTerm) {
    searchResultsElement.innerHTML = '<p>Found 0 results.</p>';
    return;
  }

  document.getElementById('dateFilterForm').addEventListener('submit', e => {
    e.preventDefault();

    let from = document.getElementById('dateFrom').value;
    let to   = document.getElementById('DateTo').value;

    search({dateFrom: from, dateTo: to});
  });

  
  // Bygg query-parametrar
  let url = `/api/files?searchTerm=${encodeURIComponent(searchTerm)}`;

  // Om audio är valt → hämta bara mp3
  if (types.length > 0) {
    url += `&filetype=${types.join(',')}`;
  if (sort) url += `&sort=${encodeURIComponent(sort)}`;
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

  allFiles.sort((a, b) => {
    let dateA = new Date(a.metadata.date || 0);
    let dateB = new Date(b.metadata.date || 0);
    return dateB - dateA; 
  });

  
  // Börja bygga HTML för resultaten
  let html = `
    <p>You searched for "<span class="highlight">${escapeHTML(searchTerm)}</span>"...</p>
    <p>Found ${allFiles.length} results.</p>
  `;

  // Vanliga bild-ändelser
  let imageExts = ['.jpg', '.jpeg', '.png', '.tif', '.tiff'];
  let audio_filetype = ['.mp3', '.WAV','.aac','.ogg','.wma', '.flac', '.aiff', '.aif']
  let video_filetype = ['.mp4', '.avi', '.mkv', '.mov']
  // processing response and rendering for html - perhaps should be made into its own function
  for (let file of allFiles) {
    let filename = file.filename ?? file.fileName ?? 'Unknown filename';
    let filetype = (file.filetype ?? '').toLowerCase();
    let url = file.url ?? '';

    // Kolla om filen är en bild
    let isImage = imageExts.some(ext => filetype.endsWith(ext));

    let highlightedMetadata = highlightSafe(file.metadata, searchTerm);


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
            <div ="metadata">
              <p>Metadata: ${JSON.stringify(file.metadata)}</p>
            </div>
          </section>
        ` 
    } 
      else {

        html += `
            <section>
              <h2>Filename: ${escapeHTML(filename)}</h2>
              ${isImage && url ? `<img src="${escapeHTML(url)}" alt="${escapeHTML(filename)}">` : ''}
              <div ="metadata">
                <p>Metadata: ${highlightedMetadata}</p>
              </div>  
            </section>
          `  
      }
  }  
  searchResultsElement.innerHTML = html;

  const filtersElement = document.querySelector(".filters")

  let filterHtml = `
  <form id="secondaryFilter">
    <h3>File Types:</h3>
    
    `;

  let filterRes = await fetch('/api/filetypes');
  let filterTypes = await filterRes.json();
  let genreRes = await fetch('/api/genres');
  let genres = await genreRes.json();
  let rawMeta = await fetch('/api/metadata')
  let jsonMeta = await rawMeta.json()
  console.log('rawmeta', jsonMeta)
  console.log('genres', genres)
  // Generate checkboxes for filetypes and genres
  for (let filterType of filterTypes) {

    filterHtml += `
      <label><input name="filterBox" type="checkbox" value="${filterType.filetype}" id="${filterType.filetype}Checkbox">${filterType.filetype}</label>
    `
  }
  filterHtml += `
    <br>
    <h3>Music Genres:</h3>
  `
  for (let genre of genres) {

      filterHtml += `
      <label><input name="filterBox" type="checkbox" value="${genre.Genres}" id="${genre.Genres}Checkbox">${genre.Genres}</label>
    `
  }
  filterHtml += `
    <br>
    <button id="filterBtn" type="Submit">Filter</button>
  </form>
  `
  filtersElement.innerHTML = filterHtml
  

  document.getElementById("secondaryFilter").addEventListener('submit', (e) => {
    e.preventDefault();
    // collects all checked boxes and pushes values into a list through which allFiles is filtered
    filterCheckedBoxes = document.querySelectorAll('input[name=filterBox]:checked');
    boxValues = []
    for (let box of filterCheckedBoxes) {
      console.log(box.value)
      boxValues.push(box.value)
    };
    console.log("boxValues", boxValues)
    const filterFiles = allFiles.filter((file) => boxValues.includes(file.filetype) || boxValues.includes(file.metadata.genre))
    console.log('filter result', filterFiles)

    let filterResultHtml = `
    <h2>Filtered Results: ${filterFiles.length} files</h2>
    
    `;

    for (let file of filterFiles) {
      let filename = file.filename ?? file.fileName ?? 'Unknown filename';
      let filetype = (file.filetype ?? '').toLowerCase();
      let url = file.url ?? '';

      // Kolla om filen är en bild
      let isImage = imageExts.some(ext => filetype.endsWith(ext));

      let highlightedMetadata = highlightSafe(file.metadata, searchTerm);

      if (imageExts.includes(filetype)) {

        if (file.metadata.longitude && file.metadata.latitude) {

        let lon = file.metadata.longitude
        let lat = file.metadata.latitude

          filterResultHtml += `
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
          
          filterResultHtml += `
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

        filterResultHtml += `
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

        filterResultHtml += `
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
    else if (video_filetype.includes(filetype)) {

        filterResultHtml += `
          <section>
            <h2>Filename: ${escapeHTML(filename)}</h2>
            ${url ? `<img src="${escapeHTML(url)}" alt="${escapeHTML(filename)}">` : ''}
            <div ="metadata">
              <p>Metadata: ${JSON.stringify(file.metadata)}</p>
            </div>
          </section>
        ` 
    }
    else {

        filterResultHtml += `
            <section>
              <h2>Filename: ${escapeHTML(filename)}</h2>
              ${isImage && url ? `<img src="${escapeHTML(url)}" alt="${escapeHTML(filename)}">` : ''}
              <div ="metadata">
                <p>Metadata: ${highlightedMetadata}</p>
              </div>  
            </section>
          `  
      }
  }  
    searchResultsElement.innerHTML = filterResultHtml;

  })
 };


document.getElementById('searchForm').addEventListener('submit', function (e) {
  e.preventDefault();          // hindra omladdning
  search();                    // kör din async-funktion
  document.forms.searchForm.term.value = ''; // rensa fältet
});

// stäng dropdown när klickar utanför
document.addEventListener('click', function (e) {
  const dropdown = document.getElementById('filetypeDropdown');
  if (!dropdown) return;                 
  // om klick innanför, gör inget
  if (e.target.closest('#filetypeDropdown')) return;
  dropdown.classList.remove('show');     // annars stäng
});
