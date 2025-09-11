document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.search_box');
    const resultsDiv = document.getElementById('results');
    const emptyHint = document.getElementById('empty-hint');
    const dropdown = document.getElementById("filetypeDropdown");
    const checkboxes = dropdown.querySelectorAll("input[type='checkbox']");
    const button = dropdown.querySelector(".dropdown-btn");

    // Escape HTML för säker rendering
    function escapeHtml(input) {
        const str = String(input ?? '');
        return str.replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[m]));
    }

    // Highlight search-term i metadata
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
        let text = escapeHTML(stringifyMetadata(rawMeta));
        let rx = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
        return text.replace(rx, '<span class="highlight">$1</span>');
    }

    // Toggle dropdown
    window.ToggleDropdown = function () {
        dropdown.classList.toggle("show");
    }

    // Uppdatera text i dropdown-knappen
    checkboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            let selected = Array.from(checkboxes)
                .filter(c => c.checked)
                .map(c => c.value);
            button.textContent = selected.length > 0 ? "Valt: " + selected.join(", ") : "Välj filtyper";
        });
    });

    // Stäng dropdown om klick utanför
    window.addEventListener('click', (event) => {
        if (!event.target.closest('#filetypeDropdown')) {
            dropdown.classList.remove('show');
        }
    });

    // Hantera submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const searchTerm = document.getElementById('search')?.value.trim() || '';
        const category = document.getElementById('category')?.value || 'all';

        if (!searchTerm) {
            resultsDiv.innerHTML = '<p>Skriv ett sökord.</p>';
            return;
        }

        if (emptyHint) emptyHint.style.display = 'none';
        resultsDiv.innerHTML = '<p>Laddar…</p>';

        // Filtyper från checkboxar
        let types = [];
        if (document.getElementById('audioCheckbox')?.checked) types.push('.mp3','.wav','.aac');
        if (document.getElementById('videoCheckbox')?.checked) types.push('.mp4','.avi','.mkv');
        if (document.getElementById('imagesCheckbox')?.checked) types.push('.jpg','.jpeg','.png');
        if (document.getElementById('pdfCheckbox')?.checked) types.push('.pdf','.xlsx');

        // Bygg URL för API (eller mock data)
        let url = `/api/files?searchTerm=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(category)}`;
        if (types.length > 0) url += `&filetype=${types.join(',')}`;

        try {
            let res = await fetch(url);
            let data = await res.json();

            if (!Array.isArray(data) || data.length === 0) {
                resultsDiv.innerHTML = '<p>Inga träffar.</p>';
                return;
            }

            let html = data.map(file => {
                const filename = escapeHtml(file.filename || '');
                const type = escapeHtml(file.filetype || '');
                const url = escapeHtml(file.url || '');
                const highlightedMeta = highlightSafe(file.metadata, searchTerm);

                let isImage = /\.(jpg|jpeg|png|tif|tiff)$/i.test(type);

                return `
                    <article class="result-card">
                        <header class="result-head">
                            <strong class="result-name">${filename}</strong>
                            <span class="result-type">${type}</span>
                        </header>
                        ${isImage && url ? `<img src="${url}" alt="${filename}">` : ''}
                        <div class="result-meta">
                            <p>Metadata: ${highlightedMeta}</p>
                        </div>
                        ${url ? `<a class="result-link" href="${url}" target="_blank" rel="noopener">Öppna fil</a>` : ''}
                    </article>
                `;
            }).join('');

            resultsDiv.innerHTML = html;

        } catch (err) {
            console.error('Sökningen misslyckades:', err);
            resultsDiv.innerHTML = '<p>Ett fel inträffade vid sökningen.</p>';
        }
    });
});
