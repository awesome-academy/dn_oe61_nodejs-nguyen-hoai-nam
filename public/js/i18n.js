// Simple i18n helper – loads JSON file for current language and applies translations to DOM
// Assumes each translatable element has data-i18n="translation.key"

(function () {
  const CACHE = {};

  function getCurrentLanguage() {
    if (typeof window.getCurrentLanguage === 'function') {
      return window.getCurrentLanguage();
    }
    return localStorage.getItem('language') || 'vn';
  }

  async function loadTranslations(lang) {
    if (CACHE[lang]) return CACHE[lang];
    try {
      const res = await fetch(`/i18n/${lang}.json`);
      if (res.ok) {
        const data = await res.json();
        CACHE[lang] = data;
        return data;
      }
    } catch (e) {
      console.error('Failed to load translation file', e);
    }
    return {};
  }

  function t(key) {
    const lang = getCurrentLanguage();
    const dict = CACHE[lang] || {};
    return dict[key] || key;
  }

  async function applyTranslations() {
    const lang = getCurrentLanguage();
    const translations = await loadTranslations(lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!translations[key]) return;
      if ('placeholder' in el) {
        el.placeholder = translations[key];
      }
      // for buttons with nested icons we may have span etc
      else {
        el.textContent = translations[key];
      }
    });

    // Placeholder specific attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[key]) {
        el.placeholder = translations[key];
      }
    });
  }

  document.addEventListener('DOMContentLoaded', applyTranslations);

  // Expose globally for other scripts if needed
  window.t = t;
  window.applyTranslations = applyTranslations;
})();
