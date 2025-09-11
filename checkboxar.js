async function loadGenres() {
  let res = await fetch('/api/genres');
  let genres = await res.json();

  renderGenreCheckboxes(genres);
}


function renderGenreCheckboxes(genres) {
  let container = document.getElementById('genreCheckboxes');
  container.innerHTML = '<h3>Filter by genre:</h3>';


function renderGenreCheckboxes(genres) {
  let container = document.getElementById('genreCheckboxes');
  container.innerHTML = '<h3>Filter by genre:</h3>';

  genres.forEach(genre => {
    let label = document.createElement('label');
    label.innerHTML = `
      <input type="checkbox" name="genre" value="${genre}">
      ${genre}
    `;
    container.appendChild(label);
  });
}


  let genreRes= await fetch('/api/genres/' + encodeURIComponent(searchTerm));
  let genres = await genreRes.json();
  renderGenreCheckboxes(genres);


// REST API route: Get all unique genres from the metadata in the database
app.get('/api/genres', async (request, response) => {
  try {
    let rows = await query(`
      SELECT metadata
      FROM files
      WHERE
        LOWER(metadata) IS NOT NULL
    `);

  // Extract unique genres from metadata
    let genreset = new Set();

    rows.forEach(row => {
      if (!row.metadata) return; // Skip if metadata is null or empty

      let meta;
      try {
        meta = typeof row.metadata === 'string' 
        ? JSON.parse(row.metadata)
        : row.metadata;
      } catch (err) {
        console.error('Error parsing metadata JSON:', row.metadata);
        return;
      }
      

      if (meta.genre) {
        if (Array.isArray(meta.genre)) {
          meta.genre.forEach(g => genreset.add(g));
        } else {
        genreset.add(meta.genre);
        }
      } 
    });

    response.json(Array.from(genreset).sort());

  } catch (error) {
    console.error('Error fetching genres:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/genres/:searchTerm', async (request, response) => {
  try {
    let searchTerm = `%${request.params.searchTerm}%`;
    let rows = await query(`
      SELECT metadata
      FROM files
      WHERE 
        (LOWER(fileName) LIKE LOWER(?) 
        OR LOWER(url) LIKE LOWER(?) 
        OR LOWER(metadata) LIKE LOWER(?))
        AND metadata IS NOT NULL
    `, [searchTerm, searchTerm, searchTerm]);

    let genreset = new Set();

    rows.forEach(row => {
      if (!row.metadata) return;

      let meta;
      try {
        meta = typeof row.metadata === 'string' 
          ? JSON.parse(row.metadata) 
          : row.metadata;
      } catch {
        return;
      }

      if (meta.genre) {
        if (Array.isArray(meta.genre)) meta.genre.forEach(g => genreset.add(g));
        else genreset.add(meta.genre);
      }
    });

    response.json(Array.from(genreset).sort());
  } catch (error) {
    console.error('Error fetching filtered genres:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});