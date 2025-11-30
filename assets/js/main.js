
(function () {
  // Format
  function formatDate(str) {
    if (!str) return '—';
    try {
      const d = new Date(str);
      if (isNaN(d.getTime())) return str;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return str;
    }
  }


  async function loadHome() {
    if (!document.getElementById('kpi-approval')) return;


    if (window.TrumpTrackData) {
      try {
        const { SERIES, getSeries } = window.TrumpTrackData;


        const gdp = await getSeries(SERIES.gdp_qoq_saar.id, SERIES.gdp_qoq_saar.params);
        if (gdp.observations.length) {
          const last = gdp.observations[gdp.observations.length - 1];
          document.getElementById('kpi-gdp').textContent = last.value.toFixed(1) + '%';
          document.getElementById('asof-gdp').textContent = formatDate(last.date);
        }
      } catch (e) {
        console.warn('Live data fetch failed for Home', e);
      }
    }

    try {
      const ap = await fetch('/data/approval.json').then(r => r.json());
      document.getElementById('kpi-approval').textContent = (ap.current * 100).toFixed(1) + '%';
      document.getElementById('asof-approval').textContent = formatDate(ap.as_of);



      const prs = await fetch('/data/maga_promises.json').then(r => r.json());
      const items = prs.promises || [];
      const kept = items.filter(x => x.status === 'Promise Kept').length;
      const pct = items.length ? Math.round(kept / items.length * 100) : 0;
      document.getElementById('kpi-promises').textContent = pct + '% kept';
      document.getElementById('asof-promises').textContent = formatDate(prs.source?.retrieved);
    } catch (e) {
      console.warn('Home KPI load failed', e);
    }
  }


  async function loadEconomy() {
    if (!document.getElementById('kpi-jobs-yoy')) return;
    if (!window.TrumpTrackData) return;

    const { SERIES, getSeries } = window.TrumpTrackData;
    const targets = [
      { id: 'jobs', el: 'jobs-yoy' },
      { id: 'cpi', el: 'cpi-yoy' },
      { id: 'gdp_qoq_saar', el: 'gdp' },
      { id: 'fedfunds', el: 'rate' }
    ];

    for (const t of targets) {
      try {
        const s = SERIES[t.id];
        const data = await getSeries(s.id, s.params);
        if (data.observations.length) {
          const last = data.observations[data.observations.length - 1];
          document.getElementById(`kpi-${t.el}`).textContent = last.value.toFixed(2) + (data.units === 'Percent' || s.params.units === 'pc1' ? '%' : '');
          document.getElementById(`asof-${t.el}`).textContent = formatDate(last.date);
        }
      } catch (e) {
        console.warn(`Failed to load ${t.id}`, e);
      }
    }
  }


  async function loadPromises() {
    const table = document.getElementById('promises-table');
    if (!table) return;
    const tbody = table.querySelector('tbody');
    const chips = document.querySelectorAll('.chip[data-filter]');
    let data = { promises: [], source: {} };
    try {
      data = await fetch('/data/maga_promises.json').then(r => r.json());
      document.getElementById('promises-asof').textContent = formatDate(data.source?.retrieved);
    } catch (e) {
      console.warn('Failed to load promises.json', e);
    }

    function render(filter = 'all') {
      tbody.innerHTML = '';
      const rows = (data.promises || []).filter(x => {
        const s = (x.status || 'Pending').toLowerCase();
        if (filter === 'all') return true;
        return s === filter;
      });
      for (const x of rows) {
        const tr = document.createElement('tr');
        const status = x.status || 'Pending';
        tr.innerHTML = `<td>${x.title}</td>
                        <td>${status}</td>
                        <td>${x.topics?.join(', ') || ''}</td>
                        <td>${x.url ? `<a href="${x.url}">Link</a>` : ''}</td>`;
        tbody.appendChild(tr);
      }
    }
    chips.forEach(c => c.addEventListener('click', () => {
      chips.forEach(b => b.setAttribute('aria-pressed', 'false'));
      c.setAttribute('aria-pressed', 'true');
      render(c.dataset.filter);
    }));
    render('all');
  }


  function initContact() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const status = document.getElementById('form-status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        status.textContent = 'Please complete required fields.';
        status.style.color = 'var(--color-danger)';
        form.querySelectorAll(':invalid')[0]?.focus();
        return;
      }
      status.textContent = 'Submitted (demo only).';
      status.style.color = 'inherit';
      form.reset();
    });
  }


  function initTheme() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    // Load saved theme
    try {
      const saved = localStorage.getItem('tt-theme');
      if (saved) document.documentElement.setAttribute('data-theme', saved);
    } catch (e) { }

    btn.addEventListener('click', () => {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      try { localStorage.setItem('tt-theme', next); } catch (e) { }
    });
  }


  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadHome();
    loadEconomy();
    loadPromises();
    initContact();
  });
})();
