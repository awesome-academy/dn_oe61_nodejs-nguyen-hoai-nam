/* confirm-account.js */
(async () => {
  const t = (key) => (typeof window.t === 'function' ? window.t(key) : key);
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const lang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'vn';

  const statusEl = document.getElementById('status-message');
  const formEl = document.getElementById('password-form');
  const errorEl = document.getElementById('form-error');
  const saveBtn = document.getElementById('save-btn');

  if (!token) {
    statusEl.textContent = t('confirmAccount.expired');
    statusEl.classList.add('text-red-600');
    return;
  }

  // verify account first
  try {
    const res = await fetch(`/supervisor/confirm_account?token=${token}&lang=${lang}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Invalid');

    // show form
    statusEl.textContent = t('confirmAccount.success');
    formEl.classList.remove('hidden');
  } catch (err) {
    statusEl.textContent = err.message || t('confirmAccount.expired');
    statusEl.classList.add('text-red-600');
    return;
  }

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('hidden');

    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    if (password.length < 8) {
      errorEl.textContent = t('passwordTooShort') || 'Password too short';
      errorEl.classList.remove('hidden');
      return;
    }
    if (password !== confirmPassword) {
      errorEl.textContent = t('confirmAccount.invalid');
      errorEl.classList.remove('hidden');
      return;
    }

    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>' + t('loading');
    saveBtn.disabled = true;

    try {
      const res = await fetch(`/supervisor/change_password?lang=${lang}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed');
      // success
      statusEl.textContent = t('confirmAccount.saved');
      formEl.remove();
      setTimeout(() => (window.location.href = 'login'), 2500);
    } catch (error) {
      errorEl.textContent = error.message;
      errorEl.classList.remove('hidden');
    } finally {
      saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>' + t('confirmAccount.saveBtn');
      saveBtn.disabled = false;
    }
  });
})();
