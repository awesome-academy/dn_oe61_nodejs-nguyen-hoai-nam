async function getUserInfo() {
    try {
      const response = await fetch('/auth/me', {
        credentials: 'include'
      });
      
      if (response.status === 200) {
        const result = await response.json();
        if (result.success && result.data && result.data.user_profile) {
          const user = result.data.user_profile;
          document.getElementById('user-name').textContent = user.userName;
        }
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }
  }

  // Update current date
  function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
  }

  // Initialize dashboard
  document.addEventListener('DOMContentLoaded', function() {
    if (checkAuth()) {
      getUserInfo();
      updateCurrentDate();
    }
  });
