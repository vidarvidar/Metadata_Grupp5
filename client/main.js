// This function is called when the user submits the search form
// It searches for people in the database and displays the results
function highlight(text, searchTerm) {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
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
  let rawData = await fetch('/api/files/' + searchTerm);

  // Convert the JSON response to a JavaScript array
  let files = await rawData.json();

  // Start building the HTML to show the results
  let html = `
    <p>You searched for "<span class="highlight">${searchTerm}</span>"...</p>
    <p>Found ${files.length} results.</p>
  `;
  let image_filetype = ['jpg','png', 'tif']
  // Loop through each person in the results and add their info to the HTML
  for (let file of files) {
    
    if (image_filetype.includes(file.filetype)) {

      html += `
        <section>
          <h2>Filename: ${file.fileName} "Filetype:" <span class="highlight">${file.filetype}</span></h2>
          <img src="${file.url}">
          <p>Metadata: ${JSON.stringify(file.metadata)}</p>
        </section>
      `;
    }
    else {
      html += `
        <section>
          <h2>Filename: ${file.fileName} "Filetype:" <span class="highlight">${file.filetype}</span></h2>
          <p>Metadata: ${JSON.stringify(file.metadata)}</p>
        </section>
      `;
    }
  }
  // Update the page with the new HTML showing the search results
  searchResultsElement.innerHTML = html;
}