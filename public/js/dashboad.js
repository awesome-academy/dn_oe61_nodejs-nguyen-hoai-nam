  function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
  }

  document.addEventListener('DOMContentLoaded', function() {
    if (checkAuth()) {
      getUserInfo();
      updateCurrentDate();
    }
  });
