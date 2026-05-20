(function () {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('rrp-theme') || 'light';
  root.setAttribute('data-theme', savedTheme);

  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', current);
      localStorage.setItem('rrp-theme', current);
    });
  });

  const reader = document.querySelector('.reader-content');
  if (reader) {
    const savedSize = localStorage.getItem('rrp-reader-size') || '20';
    reader.style.setProperty('--reader-size', savedSize + 'px');
    document.querySelectorAll('[data-font]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-font');
        const current = parseInt(localStorage.getItem('rrp-reader-size') || '20', 10);
        const next = action === 'plus' ? Math.min(current + 2, 28) : Math.max(current - 2, 16);
        localStorage.setItem('rrp-reader-size', String(next));
        reader.style.setProperty('--reader-size', next + 'px');
      });
    });
  }

  document.querySelectorAll('[data-save-work]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-save-work');
      const library = JSON.parse(localStorage.getItem('rrp-library') || '[]');
      if (!library.includes(title)) library.push(title);
      localStorage.setItem('rrp-library', JSON.stringify(library));
      btn.textContent = 'Salvo na biblioteca';
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn');
    });
  });

  const libraryList = document.querySelector('[data-library-list]');
  if (libraryList) {
    const library = JSON.parse(localStorage.getItem('rrp-library') || '[]');
    if (library.length) {
      libraryList.innerHTML = library.map((title) => `
        <article class="chapter-card">
          <div class="cover tiny">R+</div>
          <div>
            <h3>${title}</h3>
            <p>Obra acompanhada localmente neste protótipo.</p>
          </div>
          <a class="btn-secondary" href="obra.html">Abrir</a>
        </article>
      `).join('');
    }
  }

  const search = document.querySelector('[data-search]');
  if (search) {
    const cards = Array.from(document.querySelectorAll('[data-work-card]'));
    const genre = document.querySelector('[data-genre]');
    const status = document.querySelector('[data-status]');
    function filterCards() {
      const q = search.value.toLowerCase().trim();
      const g = genre ? genre.value : '';
      const s = status ? status.value : '';
      cards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        const okQ = !q || text.includes(q);
        const okG = !g || card.dataset.genre === g;
        const okS = !s || card.dataset.status === s;
        card.style.display = okQ && okG && okS ? '' : 'none';
      });
    }
    [search, genre, status].filter(Boolean).forEach(el => el.addEventListener('input', filterCards));
  }
})();
