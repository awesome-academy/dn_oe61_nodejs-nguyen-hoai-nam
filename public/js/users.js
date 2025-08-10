document.addEventListener('DOMContentLoaded', function () {
  const usersTableBody = document.getElementById('users-table-body');
  const searchInput = document.getElementById('search-input');

  let allUsers = [];

  function getCurrentLanguage() {
    return localStorage.getItem('language') || 'vn';
  }

  function renderUsers(users) {
    usersTableBody.innerHTML = '';
    if (!users || users.length === 0) {
      usersTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No users found.</td></tr>';
      return;
    }
    users.forEach(user => {
      const userRow = `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-10">
                <img class="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="User avatar">
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">${user.userName}</div>
                <div class="text-sm text-gray-500">${user.email}</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
              ${user.role}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
              ${user.status}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${new Date(user.joinedDate).toLocaleDateString()}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <a href="/admin/user/${user.userId}" class="text-indigo-600 hover:text-indigo-900"><i class="fas fa-eye"></i></a>
          </td>
        </tr>
      `;
      usersTableBody.innerHTML += userRow;
    });
  }

  async function fetchUsers() {
    const lang = getCurrentLanguage();
    try {
      const response = await axios.get(`/user?lang=${lang}`);
      if (response.data.success) {
        allUsers = response.data.data;
        renderUsers(allUsers);
      } else {
        console.error('Failed to fetch users:', response.data.message);
        usersTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-red-500">${response.data.message}</td></tr>`;
      }

    } catch (error) {
      console.error('An error occurred while fetching users:', error);
      usersTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-500">Error loading users.</td></tr>';
    }
  }

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredUsers = allUsers.filter(user => 
      user.userName.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
    renderUsers(filteredUsers);
  });

  fetchUsers();
});
