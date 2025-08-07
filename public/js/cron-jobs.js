(function () {
  const tbody = document.getElementById('cron-table-body');

  const I18N_MAP = window.STATIC_I18N;

  function t(key) {
    const lang = getCurrentLanguage();
    return (I18N_MAP[lang] && I18N_MAP[lang][key]) || key;
  }

  function applyStaticTexts() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
  }

  function getCurrentLanguage() {
    return localStorage.getItem('language') || 'vn';
  }

  async function fetchCronJobs() {
    const lang = getCurrentLanguage();
    try {
      const res = await fetch(`/cron_jobs?lang=${lang}`);
      if (!res.ok) throw new Error('Network');
      const json = await res.json();
      // API wrapped response
      return Array.isArray(json) ? json : (json.data || []);
    } catch (e) {
      console.error('Cannot load jobs', e);
      return [];
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString();
  }

  function cronToText(expr) {
    if (!expr) return '-';
    expr = expr.trim().replace(/\s+/g, ' ');

    if (expr === '* * * * *' || expr === '*/1 * * * *') return t('cron.everyMinute');

    const parts = expr.split(' ');

    if (parts.length === 6) {
      const [sec, min, hour, day, mon, dow] = parts;
      if (day === '*' && mon === '*' && dow === '*') {
        return t('cron.dailyAt').replace('{time}', `${hour.padStart(2,'0')}:${min.padStart(2,'0')}`);
      }
    }

    if (parts.length === 5) {
      const [min, hour, day, mon, dow] = parts;
      if (day === '*' && mon === '*' && dow === '*') {
        return t('cron.dailyAt').replace('{time}', `${hour.padStart(2,'0')}:${min.padStart(2,'0')}`);
      }
      if (hour === '*' && day === '*' && mon === '*' && dow === '*') {
        return t('cron.hourlyAt').replace('{minute}', min.padStart(2,'0'));
      }
    }
    // fallback
    return expr;
  }


  function renderRow(job) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${job.name}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${cronToText(job.expression)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm">
        <button class="run-now-btn bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded" data-name="${job.name}">${t('run')}</button>
      </td>`;
    return tr;
  }

  async function loadAndRender() {
    tbody.innerHTML = '';
    const jobs = await fetchCronJobs();
    jobs.forEach(job => tbody.appendChild(renderRow(job)));
  }

  async function handleRun(name) {
    const lang = getCurrentLanguage();
    await fetch(`/cron_jobs/${encodeURIComponent(name)}/run?lang=${lang}`, {
      method: 'POST',
    });
    await loadAndRender();
  }

  function bindEvents() {
    tbody.addEventListener('click', async (e) => {
      const runBtn = e.target.closest('.run-now-btn');
      if (runBtn) {
        await handleRun(runBtn.dataset.name);
        return;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyStaticTexts();
    loadAndRender();
    bindEvents();
  });
})();
