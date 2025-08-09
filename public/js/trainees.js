class TraineesManager {
    constructor() {
        this.currentTraineeId = null;
        this.init();
    }

    init() {
        this.loadTrainees();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('add-trainee-btn').addEventListener('click', () => {
            this.showModal();
        });

        document.getElementById('search-btn').addEventListener('click', () => {
            this.searchTrainees();
        });

        document.getElementById('search-trainee').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.searchTrainees();
            }
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('trainee-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTrainee();
        });
    }

    async loadTrainees() {
        try {
            const lang = getCurrentLanguage();
            const response = await fetch(`/trainee?lang=${lang}`);
            const result = await response.json();

            if (result.success) {
                this.renderTrainees(result.data || []);
                this.updateStats(result.data || []);
            } else {
                showToast(result.message || 'Failed to load trainees.', 'error');
            }
        } catch (error) {
            showToast('An unexpected error occurred.', 'error');
        }
    }

    renderTrainees(trainees) {
        const tbody = document.getElementById('trainees-tbody');
        const emptyState = document.getElementById('empty-state');

        if (!trainees || trainees.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        tbody.innerHTML = trainees.map(trainee => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <img class="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="">
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${trainee.userName}</div>
                            <div class="text-sm text-gray-500">ID: ${trainee.userId}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${trainee.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${trainee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                        ${trainee.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${new Date().toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a href="/admin/trainees/${trainee.userId}" class="text-blue-600 hover:text-blue-900 mr-3">
                        <i class="fas fa-eye"></i> Details
                    </a>
                    <button onclick="traineesManager.editTrainee(${trainee.userId})" class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="traineesManager.deleteTrainee(${trainee.userId})" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateStats(trainees) {
        const total = trainees.length;
        const active = trainees.filter(t => t.status === 'ACTIVE').length;
        const inactive = total - active;

        document.getElementById('total-trainees').textContent = total;
        document.getElementById('active-trainees').textContent = active;
        document.getElementById('inactive-trainees').textContent = inactive;
    }

    showModal(trainee = null) {
        const modal = document.getElementById('trainee-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('trainee-form');
        form.reset();
        this.currentTraineeId = null;

        const passwordInput = document.getElementById('trainee-password');
        const confirmPasswordInput = document.getElementById('trainee-confirm-password');

        if (trainee) {
            // Edit mode
            modalTitle.textContent = 'Edit Trainee';
            this.currentTraineeId = trainee.userId;
            document.getElementById('trainee-name').value = trainee.userName;
            document.getElementById('trainee-email').value = trainee.email;
            document.getElementById('trainee-status').value = trainee.status;

            passwordInput.required = false;
            confirmPasswordInput.required = false;
            passwordInput.placeholder = 'Leave blank to keep current password';
        } else {
            // Add mode
            modalTitle.textContent = 'Add New Trainee';
            passwordInput.required = true;
            confirmPasswordInput.required = true;
            passwordInput.placeholder = 'Enter password';
        }

        modal.classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('trainee-modal').classList.add('hidden');
    }

    async saveTrainee() {
        const formData = {
            userName: document.getElementById('trainee-name').value,
            email: document.getElementById('trainee-email').value,
            status: document.getElementById('trainee-status').value,
            role: 'TRAINEE'
        };

        const password = document.getElementById('trainee-password').value;
        const confirmPassword = document.getElementById('trainee-confirm-password').value;

        // When creating a new trainee, password is required.
        if (!this.currentTraineeId && !password) {
            showToast('Password is required for new trainees.', 'error');
            return;
        }

        if (password || confirmPassword) {
            if (password !== confirmPassword) {
                showToast('Passwords do not match.', 'error');
                return;
            }
            if (password) {
                 formData.password = password;
            }
        }

        try {
            const lang = getCurrentLanguage();
            const url = this.currentTraineeId ? `/trainee/${this.currentTraineeId}?lang=${lang}` : `/trainee?lang=${lang}`;
            const method = this.currentTraineeId ? 'PUT' : 'POST';

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
                this.loadTrainees();
                showToast(result.message || 'Operation successful!');
            } else {
                showToast(result.message || 'An error occurred.', 'error');
            }
        } catch (error) {
            showToast('An unexpected network error occurred.', 'error');
        }
    }

    async editTrainee(userId) {
        try {
            const lang = getCurrentLanguage();
            const response = await fetch(`/trainee/${userId}?lang=${lang}`);
            const result = await response.json();

            if (result.success) {
                this.showModal(result.data);
            } else {
                showToast(result.message || 'Failed to load trainee data.', 'error');
            }
        } catch (error) {
            showToast('An unexpected network error occurred.', 'error');
        }
    }

    async deleteTrainee(userId) {
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
            const response = await fetch(`/trainee/${userId}?lang=${lang}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                this.loadTrainees();
                showToast(result.message || 'Trainee deleted successfully.');
            } else {
                showToast(result.message || 'Failed to delete trainee.', 'error');
            }
        } catch (error) {
            showToast('An unexpected network error occurred.', 'error');
        }
    }

    searchTrainees() {
        const searchTerm = document.getElementById('search-trainee').value.toLowerCase();
        const rows = document.querySelectorAll('#trainees-tbody tr');

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
    window.traineesManager = new TraineesManager();
});
