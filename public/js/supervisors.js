class SupervisorsManager {
    constructor() {
        this.currentSupervisorId = null;
        this.init();
    }

    init() {
        this.loadSupervisors();
        this.bindEvents();
    }

    bindEvents() {
        const addBtn = document.getElementById('add-supervisor-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showModal());
        }

        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchSupervisors());
        }

        const searchInput = document.getElementById('search-supervisor');
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.searchSupervisors();
                }
            });
        }

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('supervisor-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSupervisor();
        });
    }

    async loadSupervisors() {
        if (!document.getElementById('supervisors-tbody')) {
            return;
        }

        try {
            const lang = getCurrentLanguage();
            const response = await fetch(`/supervisor?lang=${lang}`);
            const result = await response.json();

            if (result.success) {
                this.renderSupervisors(result.data || []);
                this.updateStats(result.data || []);
            } else {
                showToast(result.message || 'Failed to load supervisors.', 'error');
            }
        } catch (error) {
            showToast('An unexpected error occurred.', 'error');
        }
    }

    renderSupervisors(supervisors) {
        const tbody = document.getElementById('supervisors-tbody');
        const emptyState = document.getElementById('empty-state');

        if (!supervisors || supervisors.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        tbody.innerHTML = supervisors.map(supervisor => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <img class="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="">
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${supervisor.userName}</div>
                            <div class="text-sm text-gray-500">ID: ${supervisor.userId}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${supervisor.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${supervisor.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                        ${supervisor.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${new Date().toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a href="/admin/supervisors/${supervisor.userId}" class="text-blue-600 hover:text-blue-900 mr-3">
                        <i class="fas fa-eye"></i> Details
                    </a>
                    <button onclick="supervisorsManager.editSupervisor(${supervisor.userId})" class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="supervisorsManager.deleteSupervisor(${supervisor.userId})" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateStats(supervisors) {
        const total = supervisors.length;
        const active = supervisors.filter(s => s.status === 'ACTIVE').length;
        const pending = supervisors.filter(s => s.status === 'INACTIVE').length;

        document.getElementById('total-supervisors').textContent = total;
        document.getElementById('active-supervisors').textContent = active;
        document.getElementById('pending-supervisors').textContent = pending;
    }

    showModal(supervisor = null) {
        this.currentSupervisorId = supervisor ? supervisor.userId : null;
        const modal = document.getElementById('supervisor-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('supervisor-form');
        const passwordFields = document.getElementById('password-fields');
        const passwordInput = document.getElementById('supervisor-password');
        const confirmPasswordInput = document.getElementById('supervisor-confirm-password');
        const statusField = document.getElementById('status-field');

        form.reset();

        if (supervisor) {
            // Edit mode
            title.textContent = 'Edit Supervisor';
            document.getElementById('supervisor-name').value = supervisor.userName;
            document.getElementById('supervisor-email').value = supervisor.email;
            document.getElementById('supervisor-status').value = supervisor.status;
            
            // Hide password fields as they are not required for editing
            passwordFields.classList.add('hidden');
            passwordInput.removeAttribute('required');
            confirmPasswordInput.removeAttribute('required');
            // Show status field for editing
            statusField.classList.remove('hidden');
        } else {
            // Add new mode
            title.textContent = 'Add New Supervisor';

            // Show password fields and make them required
            passwordFields.classList.remove('hidden');
            passwordInput.setAttribute('required', 'required');
            confirmPasswordInput.setAttribute('required', 'required');
            // Hide status field for creation
            statusField.classList.add('hidden');
        }

        modal.classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('supervisor-modal').classList.add('hidden');
        this.currentSupervisorId = null;
    }

    async saveSupervisor() {
        const formData = {
            userName: document.getElementById('supervisor-name').value,
            email: document.getElementById('supervisor-email').value,
            status: document.getElementById('supervisor-status').value,
            role: 'SUPERVISOR'
        };

        const password = document.getElementById('supervisor-password').value;
        const confirmPassword = document.getElementById('supervisor-confirm-password').value;

        if (!this.currentSupervisorId) {
            if (!password || !confirmPassword) {
                showToast('Password and confirmation are required.', 'error');
                return;
            }
            if (password !== confirmPassword) {
                showToast('Passwords do not match.', 'error');
                return;
            }
            formData.password = password;
        } else {
            if (password || confirmPassword) {
                if (password !== confirmPassword) {
                    showToast('Passwords do not match.', 'error');
                    return;
                }
                formData.password = password;
            }
        }

        try {
            const lang = getCurrentLanguage();
            const url = this.currentSupervisorId ? `/supervisor/${this.currentSupervisorId}?lang=${lang}` : `/supervisor/create?lang=${lang}`;
            const method = this.currentSupervisorId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                this.hideModal();
                this.loadSupervisors();
                showToast(result.message || 'Operation successful!');
            } else {
                showToast(result.message || 'An error occurred.', 'error');
            }
        } catch (error) {
            showToast('An unexpected network error occurred.', 'error');
        }
    }

    async editSupervisor(userId) {
        try {
            const lang = getCurrentLanguage();
            const response = await fetch(`/supervisor/${userId}?lang=${lang}`);
            const result = await response.json();

            if (result.success) {
                this.showModal(result.data);
            } else {
                showToast(result.message || 'Failed to load supervisor data.', 'error');
            }
        } catch (error) {
            showToast('An unexpected network error occurred.', 'error');
        }
    }

    async deleteSupervisor(userId) {
        const confirmation = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!confirmation.isConfirmed) {
            return;
        }

        try {
            const lang = getCurrentLanguage();
            const response = await fetch(`/supervisor/${userId}?lang=${lang}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                this.loadSupervisors();
                showToast(result.message || 'Supervisor deleted successfully.');
            } else {
                showToast(result.message || 'Failed to delete supervisor.', 'error');
            }
        } catch (error) {
            showToast('An unexpected network error occurred.', 'error');
        }
    }

    searchSupervisors() {
        const searchTerm = document.getElementById('search-supervisor').value.toLowerCase();
        const rows = document.querySelectorAll('#supervisors-tbody tr');

        rows.forEach(row => {
            const name = row.querySelector('td:first-child').textContent.toLowerCase();
            const email = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            
            if (name.includes(searchTerm) || email.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }


}

document.addEventListener('userInfoLoaded', () => {
    window.supervisorsManager = new SupervisorsManager();
});
