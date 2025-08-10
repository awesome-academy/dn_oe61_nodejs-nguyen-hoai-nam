document.addEventListener('DOMContentLoaded', function () {
  const userAvatar = document.getElementById('user-avatar');
  const userNameDisplay = document.getElementById('user-name');
  const userEmailDisplay = document.getElementById('user-email');
  const userRoleDisplay = document.getElementById('user-role');
  const userStatusDisplay = document.getElementById('user-status');

  const userNameInput = document.getElementById('userName');
  const emailInput = document.getElementById('email');

  const editProfileForm = document.getElementById('edit-profile-form');

  const roleClasses = {
    'SUPERVISOR': 'bg-blue-500',
    'TRAINEE': 'bg-green-500',
    'ADMIN': 'bg-purple-500',
  };

  const statusClasses = {
    'ACTIVE': 'bg-green-500',
    'INACTIVE': 'bg-red-500',
  };

  function getCurrentLanguage() {
    return localStorage.getItem('language') || 'vn';
  }

  // Fetch user data
  async function fetchProfile() {
    const lang = getCurrentLanguage();
    try {
      const response = await axios.get(`/user/me?lang=${lang}`);
      const user = response.data.data;

      // Populate profile card
      userAvatar.src = user.avatar || 'https://via.placeholder.com/128';
      userNameDisplay.textContent = user.userName;
      userEmailDisplay.textContent = user.email;
      
      userRoleDisplay.textContent = user.role;
      userRoleDisplay.className = `px-3 py-1 text-xs font-semibold text-white rounded-full ${roleClasses[user.role] || 'bg-gray-500'}`;

      userStatusDisplay.textContent = user.status;
      userStatusDisplay.className = `px-3 py-1 text-xs font-semibold text-white rounded-full ${statusClasses[user.status] || 'bg-gray-500'}`;

      // Populate form
      userNameInput.value = user.userName;
      emailInput.value = user.email;

    } catch (error) {
      console.error('Failed to fetch profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Could not load your profile data!',
      });
    }
  }

  // Handle form submission
  editProfileForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const updatedData = {
      userName: userNameInput.value,
    };

    const lang = getCurrentLanguage();
    try {
      const response = await axios.put(`/user/edit?lang=${lang}`, updatedData);
      if (response.data.success) {
        Swal.fire({
          icon: response.data.success ? 'success' : 'error',
          text: response.data.message,
          timer: 1500,
          showConfirmButton: false
        });
        fetchProfile(); 
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'An unexpected error occurred.',
      });
    }
  });

  fetchProfile();
});
