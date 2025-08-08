function checkAuth() {
    // Gọi API /auth/me để kiểm tra đăng nhập
    // Nếu không hợp lệ, chuyển hướng về trang login
    return fetch('/auth/me', { credentials: 'include' })
      .then(res => {
        if (res.status !== 200) {
          window.location.href = '/auth/login';
          return false;
        }
        return true;
      })
      .catch(() => {
        window.location.href = '/auth/login';
        return false;
      });
}

  function logout() {
    // Gọi API logout nếu có, hoặc chỉ chuyển hướng
    window.location.href = '/auth/login';
  }

  // Mobile sidebar toggle
  const toggleButton = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');

  if (toggleButton && sidebar) {
    toggleButton.addEventListener('click', function () {
      sidebar.classList.toggle('open');
    });
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', function(e) {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.getElementById('sidebarToggle');
    
    if (window.innerWidth <= 768 && 
        !sidebar.contains(e.target) && 
        !toggle.contains(e.target) && 
        sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
    }
  });

  // Initialize
  document.addEventListener('DOMContentLoaded', function() {
    if (checkAuth()) {
      // Page-specific initialization can be added here
    }
  });
