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
            showToast('An unexpected error occurred. Please try again later.', 'error');
        }
    };

    const initPage = async () => {
        const traineeId = getTraineeIdFromUrl();
        if (traineeId) {
            await fetchTraineeDetails(traineeId);
            // initButtons(traineeId); // Will be implemented later
        }
    };

    initPage();
});
