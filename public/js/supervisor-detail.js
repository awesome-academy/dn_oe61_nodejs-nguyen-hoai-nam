document.addEventListener('DOMContentLoaded', () => {
    const supervisorInfo = {
        username: document.getElementById('supervisor-username'),
        email: document.getElementById('supervisor-email'),
        role: document.getElementById('supervisor-role'),
        status: document.getElementById('supervisor-status'),
        nameHeader: document.getElementById('supervisor-name-header'),
    };

    const updateBtn = document.getElementById('update-supervisor-btn');
    const deleteBtn = document.getElementById('delete-supervisor-btn');

    let currentSupervisorData = null;
    const supervisorsManager = new SupervisorsManager();

    const getSupervisorIdFromUrl = () => {
        const path = window.location.pathname;
        const parts = path.split('/');
        return parts[parts.length - 1];
    };

    const fetchSupervisorDetails = async () => {
        const supervisorId = getSupervisorIdFromUrl();
        const lang = getCurrentLanguage();

        if (!supervisorId || isNaN(supervisorId)) {
            Object.values(supervisorInfo).forEach(el => el.textContent = 'Invalid ID');
            return;
        }

        try {
            const response = await fetch(`/supervisor/${supervisorId}?lang=${lang}`);
            const result = await response.json();

            if (result.success && result.data) {
                currentSupervisorData = result.data;
                const { userName, email, role, status } = result.data;
                supervisorInfo.nameHeader.textContent = userName;
                supervisorInfo.username.textContent = userName;
                supervisorInfo.email.textContent = email;
                supervisorInfo.role.textContent = role;
                supervisorInfo.status.textContent = status;
            } else {
                showToast(result.message || 'Failed to load supervisor details.', 'error');
                Object.values(supervisorInfo).forEach(el => el.textContent = 'Error');
            }
        } catch (error) {
            showToast('An unexpected network error occurred.', 'error');
            Object.values(supervisorInfo).forEach(el => el.textContent = 'Error');
        }
    };

    if (updateBtn) {
        updateBtn.addEventListener('click', () => {
            if (currentSupervisorData) {
                supervisorsManager.showModal(currentSupervisorData);
            } else {
                showToast('Supervisor data not available. Cannot update.', 'error');
            }
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const supervisorId = getSupervisorIdFromUrl();
            if (supervisorId) {
                supervisorsManager.deleteSupervisor(supervisorId);
            } else {
                showToast('Supervisor ID not found. Cannot delete.', 'error');
            }
        });
    }

    fetchSupervisorDetails();
});
