let manualeData = [];

function createAccordionItem(sezione, idx) {
  const stepsHtml = sezione.steps
    ? `<ul>${sezione.steps.map(step => `<li>${step.step}</li>`).join('')}</ul>`
    : '';

  const tipsHtml = sezione.tips
    ? `<p class="meta"><strong>Nota:</strong> ${sezione.tips}</p>`
    : '';

  const infoHtml = sezione.info
    ? `<p class="meta"><strong>Info:</strong> ${sezione.info}</p>`
    : '';

  const imagesHtml = sezione.immagini && sezione.immagini.length
    ? `<div class="images">${sezione.immagini.map(src => `<img src="${src}" alt="" data-src="${src}">`).join('')}</div>`
    : '';

  return `
    <div class="card">
      <button class="accordion" type="button" onclick="toggleAccordion(this)">${sezione.titolo}</button>
      <div class="panel">
        <p class="section-content" data-idx="${idx}">${renderTruncated(sezione.contenuto, idx)}</p>
        ${imagesHtml}
        ${stepsHtml}
        ${tipsHtml}
        ${infoHtml}
      </div>
    </div>
  `;
}

function renderTruncated(text, idx, limit = 400) {
  if (!text) return '';
  if (text.length <= limit) return escapeHtml(text);
  const short = escapeHtml(text.slice(0, limit)).replace(/\n/g, '<br>') + '…';
  const full = escapeHtml(text).replace(/\n/g, '<br>');
  return `
    <span class="short-text" id="short-${idx}">${short}</span>
    <span class="full-text" id="full-${idx}">${full}</span>
    <a class="readmore" data-idx="${idx}">Leggi tutto</a>
  `;
}

function escapeHtml(s) {
  return (s+'')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function renderManuale(data) {
  manualeData = data;
  const container = document.getElementById('manuale');
  if (!container) return;

  if (!data.length) {
    container.innerHTML = '<div class="no-results">Nessuna sezione disponibile.</div>';
    return;
  }

  container.innerHTML = data.map((s,i) => createAccordionItem(s,i)).join('');
}

function search() {
  const input = document.getElementById('search');
  if (!input) return;
  const query = input.value.toLowerCase();
  const container = document.getElementById('manuale');
  const filtered = manualeData.filter(section => {
    return (
      section.titolo.toLowerCase().includes(query) ||
      section.contenuto.toLowerCase().includes(query) ||
      (section.tips && section.tips.toLowerCase().includes(query)) ||
      (section.info && section.info.toLowerCase().includes(query)) ||
      (section.steps && section.steps.some(step => step.step.toLowerCase().includes(query)))
    );
  });

  if (!filtered.length) {
    container.innerHTML = '<div class="no-results">Nessun risultato trovato. Prova con altre parole chiave.</div>';
    return;
  }
  container.innerHTML = filtered.map((s,i) => createAccordionItem(s,i)).join('');
}

function toggleAccordion(button) {
  button.classList.toggle('active');
  const panel = button.nextElementSibling;
  if (!panel) return;
  if (panel.style.display === 'block') {
    panel.style.display = 'none';
  } else {
    panel.style.display = 'block';
  }
}

fetch('data/manuale.json')
  .then(response => response.json())
  .then(data => renderManuale(data))
  .catch(() => {
    const container = document.getElementById('manuale');
    if (container) {
      container.innerHTML = '<div class="loading">Impossibile caricare il manuale. Verifica il file data/manuale.json.</div>';
    }
  });

// Event delegation for readmore toggles and image clicks
document.addEventListener('click', function(e) {
  // Read more toggle
  const rm = e.target.closest('.readmore');
  if (rm) {
    const idx = rm.getAttribute('data-idx');
    const shortEl = document.getElementById('short-' + idx);
    const fullEl = document.getElementById('full-' + idx);
    if (shortEl && fullEl) {
      const isHidden = shortEl.style.display === 'none';
      shortEl.style.display = isHidden ? 'inline' : 'none';
      fullEl.style.display = isHidden ? 'none' : 'inline';
      rm.textContent = isHidden ? 'Leggi tutto' : 'Mostra meno';
      if (!isHidden) { // opened
        shortEl.style.display = 'none';
        fullEl.style.display = 'inline';
        rm.textContent = 'Mostra meno';
      } else {
        shortEl.style.display = 'inline';
        fullEl.style.display = 'none';
        rm.textContent = 'Leggi tutto';
      }
    }
    e.preventDefault();
    return;
  }

  // Image click -> open lightbox
  const img = e.target.closest('.images img');
  if (img) {
    openLightbox(img.getAttribute('data-src') || img.src);
    return;
  }

  // Close lightbox
  if (e.target.id === 'lightbox-backdrop' || e.target.id === 'lightbox-close') {
    closeLightbox();
  }
});

function openLightbox(src) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (!lb || !img) return;
  img.src = src;
  lb.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (!lb || !img) return;
  img.src = '';
  lb.setAttribute('aria-hidden', 'true');
}
