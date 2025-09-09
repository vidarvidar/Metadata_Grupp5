// public/final-search.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.search_box');
  const resultsDiv = document.getElementById('results');
  const emptyHint = document.getElementById('empty-hint');

  if (!form) {
    console.error('Formuläret .search_box hittades inte. Kontrollera att din HTML innehåller ett element med class="search_box".');
    return;
  }
  if (!resultsDiv) {
    console.error('#results hittades inte. Skapa <div id="results"></div> i HTML.');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const categoryElem = document.getElementById('category');
    const searchElem = document.getElementById('search');
    const category = categoryElem ? categoryElem.value : 'all';
    const q = searchElem ? searchElem.value.trim() : '';

    if (emptyHint) emptyHint.style.display = 'none';
    if (resultsDiv) resultsDiv.innerHTML = '<p>Laddar…</p>';

    try {
      const res = await fetch(`/search?category=${encodeURIComponent(category)}&q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`Nätverksfel: ${res.status}`);
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        if (resultsDiv) resultsDiv.innerHTML = '<p>Inga träffar.</p>';
        return;
      }

      const html = data.map(file => {
        const filename = String(file.filename ?? '');
        const type = String(file.type ?? '');
        const path = String(file.path ?? '');
        const url = String(file.url ?? '');
        const title = String(file.title ?? '');
        const author = String(file.author ?? '');
        const camera = String(file.camera_model ?? '');
        const created = file.created ? new Date(file.created).toLocaleDateString() : '';
        const lat = file.latitude ?? null;
        const lon = file.longitude ?? null;

        return `
          <article class="result-card">
            <header class="result-head">
              <strong class="result-name">${escapeHtml(filename)}</strong>
              ${type ? `<span class="result-type">${escapeHtml(type)}</span>` : ''}
            </header>
            <div class="result-meta">
              ${path ? `<div><span>Path:</span> <code>${escapeHtml(path)}</code></div>` : ''}
              ${typeof file.size === 'number' ? `<div><span>Size:</span> ${formatBytes(file.size)}</div>` : ''}
              ${title ? `<div><span>Title:</span> ${escapeHtml(title)}</div>` : ''}
              ${author ? `<div><span>Author:</span> ${escapeHtml(author)}</div>` : ''}
              ${camera ? `<div><span>Camera:</span> ${escapeHtml(camera)}</div>` : ''}
              ${created ? `<div><span>Created:</span> ${escapeHtml(created)}</div>` : ''}
              ${(lat != null && lon != null) ? `<div><span>Geo:</span> ${lat}, ${lon}</div>` : ''}
            </div>
            ${url ? `<a class="result-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">Öppna fil</a>` : ''}
          </article>
        `;
      }).join('');

      if (resultsDiv) resultsDiv.innerHTML = html;
    } catch (err) {
      console.error('Sökningen misslyckades:', err);
      if (resultsDiv) resultsDiv.innerHTML = '<p>Ett fel inträffade när sökningen gjordes.</p>';
    }
  });
});

// Hjälpfunktioner
function escapeHtml(input) {
  const str = String(input ?? '');
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B','KB','MB','GB','TB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}
