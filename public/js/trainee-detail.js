document.addEventListener('DOMContentLoaded', () => {
    let currentTraineeData = null;

    const getTraineeIdFromUrl = () => {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1];
    };

    const populateTraineeData = (trainee) => {
        currentTraineeData = trainee;
        document.title = trainee.userName;
        document.getElementById('trainee-name-header').textContent = trainee.userName;
        document.getElementById('trainee-username').textContent = trainee.userName;
        document.getElementById('trainee-email').textContent = trainee.email;
        document.getElementById('trainee-role').textContent = trainee.role;
        document.getElementById('trainee-status').textContent = trainee.status;
    };

    const fetchTraineeDetails = async (traineeId) => {
        try {
            const lang = getCurrentLanguage();
            const response = await fetch(`/trainee/${traineeId}?lang=${lang}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                populateTraineeData(result.data);
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showToast(tMsg('unexpectedError'), 'error');
        }
    };

    const updateBtn = document.getElementById('update-trainee-btn');
    const deleteBtn = document.getElementById('delete-trainee-btn');

    if (updateBtn) {
        updateBtn.addEventListener('click', () => {
            // Redirect to trainees list with edit modal
            window.location.href = `/admin/trainees#edit-${getTraineeIdFromUrl()}`;
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            const traineeId = getTraineeIdFromUrl();
            if (!traineeId) {
                showToast(tMsg('failedLoadData'), 'error');
                return;
            }
            const confirmation = await Swal.fire({
                title: tMsg('confirmDeleteTitle'),
                text: tMsg('confirmDeleteText'),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: tMsg('confirmDeleteBtn')
            });
            if (!confirmation.isConfirmed) return;
            try {
                const lang = getCurrentLanguage();
                const response = await fetch(`/trainee/${traineeId}?lang=${lang}`, { method: 'DELETE' });
                const result = await response.json();
                if (result.success) {
                    showToast(result.message || tMsg('deletedSuccess'));
                    window.location.href = '/admin/trainees';
                } else {
                    showToast(result.message || tMsg('failedDelete'), 'error');
                }
            } catch (err) {
                showToast(tMsg('unexpectedNetworkError'), 'error');
            }
        });
    }

    const initPage = async () => {
        const traineeId = getTraineeIdFromUrl();
        if (traineeId) {
            await fetchTraineeDetails(traineeId);
            // initButtons(traineeId); // Will be implemented later
        }
    };

    initPage();
});
