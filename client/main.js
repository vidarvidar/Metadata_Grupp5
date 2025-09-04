// This function is called when the user submits the search form
// It// Escapa regex-tecken i sökordet (t.ex. +, *, ?, etc.)
function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

function highlightSafe(rawMeta, searchTerm) {
  if (!searchTerm) return escapeHTML(stringifyMetadata(rawMeta));
  const text = escapeHTML(stringifyMetadata(rawMeta));
  const rx = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  return text.replace(rx, '<span class="highlight">$1</span>');
}


async function search() {
  // Get the search term entered by the user in the form field named 'term'
  let searchTerm = document.forms.searchForm.term.value;

  // Find the element on the page where search results will be shown
  let searchResultsElement = document.querySelector('.searchResults');

  // If the search term is empty (user didn't type anything), show 0 results and stop
  if (!searchTerm.trim()) {
    searchResultsElement.innerHTML = '<p>Found 0 results.</p>';
    return;
  }

  // Clear the input field after searching
  document.forms.searchForm.term.value = '';

  // Send a request to the server to search for people matching the search term
  // The server will return a JSON array of people
  let rawData = await fetch('/api/files/' + encodeURIComponent(searchTerm));

  // Convert the JSON response to a JavaScript array
  let files = await rawData.json();

  // Start building the HTML to show the results  
   let html = `
    <p>You searched for "<span class="highlight">${escapeHTML, (searchTerm)}</span>"...</p>
    <p>Found ${files.length} results.</p>
  `;
  let image_filetype = ['.jpg','.png', '.tif']
  // Loop through each person in the results and add their info to the HTML
  for (let file of files) {
    
    let highlightedMetadata = highlight(file.metadata, searchTerm);
    
    if (image_filetype.includes(file.filetype)) {
      html += `
      
      <section>
        <h2>Filename: ${escapeHTML(filename)} — Filetype: <span class="highlight">${escapeHTML(filetype)}</span></h2>
        ${isImage && url ? `<img src="${escapeHTML(url)}" alt="${escapeHTML(filename)}">` : ''}
        <p>Metadata: ${highlightedMetadata}</p>
      </section>
    `;
  }
  // Update the page with the new HTML showing the search results
  searchResultsElement.innerHTML = html;
}