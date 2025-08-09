window.currentUser = null;

function updateSidebarUserInfo() {

  if (window.currentUser && window.currentUser.data) {
    const userNameElement = document.getElementById('user-name');
    const userAvatarElement = document.getElementById('user-avatar');

    if (userNameElement) {
      userNameElement.textContent = window.currentUser.data.userName || 'Admin User';
    }
    
    if (userAvatarElement) {
      userAvatarElement.src = window.currentUser.data.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face';
    }
  } else {
  }
}

async function getUserInfo() {
  try {
    const response = await fetch('/auth/me', { 
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      window.currentUser = userData;
      return userData;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

async function checkAuth() {
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
    window.location.href = '/auth/login';
  }

  const toggleButton = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');

  if (toggleButton && sidebar) {
    toggleButton.addEventListener('click', function () {
      sidebar.classList.toggle('open');
    });
  }

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

  document.addEventListener('DOMContentLoaded', async function() {
    initializeLanguageSwitcher();

    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
      await getUserInfo();
      updateSidebarUserInfo();
      
      const event = new Event('userInfoLoaded');
      document.dispatchEvent(event);
    }
  });

function setCurrentLanguage(lang) {
  localStorage.setItem('language', lang);
}

function getCurrentLanguage() {
  return localStorage.getItem('language') || 'vn';
}

function initializeLanguageSwitcher() {
  const langButton = document.getElementById('language-switcher-button');
  const langMenu = document.getElementById('language-switcher-menu');
  const currentLangSpan = document.getElementById('current-lang');

  if (!langButton || !langMenu || !currentLangSpan) return;

  const currentLang = getCurrentLanguage();
  currentLangSpan.textContent = currentLang.toUpperCase();

  langButton.addEventListener('click', (e) => {
    e.stopPropagation();
    langMenu.classList.toggle('hidden');
  });

  langMenu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      const selectedLang = e.target.getAttribute('data-lang');
      if (selectedLang && selectedLang !== getCurrentLanguage()) {
        setCurrentLanguage(selectedLang);
        location.reload();
      }
    }
  });

  document.addEventListener('click', () => {
    if (!langMenu.classList.contains('hidden')) {
      langMenu.classList.add('hidden');
    }
  });
}

function showToast(message, type = 'success') {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  Toast.fire({
    icon: type,
    title: message
  });
}
