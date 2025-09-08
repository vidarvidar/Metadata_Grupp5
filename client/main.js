// This function is called when the user submits the search form
// It searches for people in the database and displays the results
function highlight(text, searchTerm) {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}
// async function getTypes() {
//   let filetypesElment = document.querySelector('#Types')
//   let response = fetch('/api/filetypes/')
//   console.log(response)
//   let types = response.json()
//   console.log(types)
//   let html = `<h2>Current filetypes</h2>
//   `
//   for (let type of types) {
//     html += `  
//           <h2>Type:${type}</h2>
//       `
//   }
//   filetypesElment.innerHTML = html;
// }

document.querySelector("#SearchMusic").addEventListener("click",(e) => musicSearch(e));
document.querySelector("#SearchAll").addEventListener("click",(e) => search(e));
document.querySelector("#SearchImages").addEventListener("click",(e) => imageSearch(e));
document.querySelector("#SearchVideos").addEventListener("click",(e) => videoSearch(e));
document.querySelector("#SearchPdfs").addEventListener("click",(e) => pdfSearch(e));

async function pdfSearch(e) {
  e.preventDefault()
   console.log("Searching...")
   let searchTerm = document.forms.searchForm.term.value
   console.log("search term -", searchTerm)
  
   document.forms.searchForm.term.value = '';

   const response = await fetch("/api/pdfs/" + searchTerm)

   console.log("Status - ", response.status)

   const results = await response.json()
   console.log("Result - ", results)
   let searchResultsElement = document.querySelector('.searchResults');  
   let html = `
    <p>You searched for "<span class="highlight">${searchTerm}</span>"...</p>
    <p>Found ${results.length} results.</p>
  `;  
   for (let result of results) {
        html += `
        <section>
          <h2>Filename: ${result.fileName}</h2>
          <p>Metadata: ${JSON.stringify(result.metadata)}</p>
        </section>
      `;
   }
  searchResultsElement.innerHTML = html;

};

async function videoSearch(e) {
  e.preventDefault()
   console.log("Searching...")
   let searchTerm = document.forms.searchForm.term.value
   console.log("search term -", searchTerm)
  
   document.forms.searchForm.term.value = '';

   const response = await fetch("/api/videos/" + searchTerm)

   console.log("Status - ", response.status)

   const results = await response.json()
   console.log("Result - ", results)
   let searchResultsElement = document.querySelector('.searchResults');  
   let html = `
    <p>You searched for "<span class="highlight">${searchTerm}</span>"...</p>
    <p>Found ${results.length} results.</p>
  `;  
   for (let result of results) {
        html += `
        <section>
          <h2>Filename: ${result.fileName}</h2>
          <p>Metadata: ${JSON.stringify(result.metadata)}</p>
        </section>
      `;
   }
  searchResultsElement.innerHTML = html;

}

async function imageSearch(e) {
  e.preventDefault()
   console.log("Searching...")
   let searchTerm = document.forms.searchForm.term.value
   console.log("search term -", searchTerm)
  
   document.forms.searchForm.term.value = '';

   const response = await fetch("/api/images/" + searchTerm)

   console.log("Status - ", response.status)

   const results = await response.json()
   console.log("Result - ", results)
   let searchResultsElement = document.querySelector('.searchResults');  
   let html = `
    <p>You searched for "<span class="highlight">${searchTerm}</span>"...</p>
    <p>Found ${results.length} results.</p>
  `;  
   for (let result of results) {
        html += `
        <section>
          <h2>Filename: ${result.fileName}</h2>
          <img src="${result.url}">
          <p>Metadata: ${JSON.stringify(result.metadata)}</p>
        </section>
      `;
   }
  searchResultsElement.innerHTML = html;

}

async function musicSearch(e) {

   console.log("Searching...")
   let searchTerm = document.forms.searchForm.term.value
   console.log("search term -", searchTerm)
  
   document.forms.searchForm.term.value = '';

   const response = await fetch("/api/music/" + searchTerm)

   console.log("Status - ", response.status)

   const results = await response.json()
   console.log("Result - ", results)
   let searchResultsElement = document.querySelector('.searchResults');  
   let html = `
    <p>You searched for "<span class="highlight">${searchTerm}</span>"...</p>
    <p>Found ${results.length} results.</p>
  `;  
   for (let result of results) {
        html += `
        <section>
          <h2>Filename: ${result.fileName}</h2>
          <p>Metadata: ${JSON.stringify(result.metadata)}</p>
        </section>
      `;
   }
  searchResultsElement.innerHTML = html;

}

async function search(e) { 
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

// document.querySelector("#megaBtn").addEventListener("click",(e) => megaSearch(e));

// async function megaSearch(e) {
//    e.preventDefault()
//    console.log("Searching...")
//    const searchTerm = document.querySelector("#megaterm").value
//    const musicBox = document.querySelector("#musicBox").checked
//    console.log("search term -", searchTerm)
//    console.log("checkbox -", checkbox)

//    const response = await fetch("/api/files/",
//       {
//          method: "POST",
//          headers: {
//             "Content-Type": "application/json"
//          },
//          body: JSON.stringify({
//             "searchTerm": searchTerm,
//             "musicBox": musicBox
            
//          })
//       }
//    )
//    console.log("Status - ", response.status)

//    const result = await response.json()
//    console.log("Result - ", result)
// }