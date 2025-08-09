document.addEventListener('DOMContentLoaded', () => {
    const getTaskIdFromUrl = () => {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1];
    };

    const taskId = getTaskIdFromUrl();
    const lang = document.documentElement.lang || 'en';

    if (!taskId) {
        console.error('Task ID is missing from the URL');
        return;
    }

    const fetchTaskDetails = async () => {
        try {
            const response = await fetch(`/task/${taskId}?lang=${lang}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            if (result.success && result.data) {
                updateUI(result.data);
            } else {
                console.error('Failed to load task details:', result.message);
                showToast('Failed to load task details.', 'error');
            }
        } catch (error) {
            console.error('Error fetching task details:', error);
            showToast('An error occurred while fetching task details.', 'error');
        }
    };

    const updateUI = (task) => {
        // Update Task Header
        document.getElementById('task-name-header').textContent = task.name;

        // Update Task Details
        const fileLink = document.getElementById('task-file-url');
        fileLink.href = task.fileUrl;
        document.getElementById('task-created-at').textContent = new Date(task.createdAt).toLocaleDateString();

        // Update Subject Details
        if (task.subject) {
            document.getElementById('subject-name').textContent = task.subject.name;
            document.getElementById('subject-description').textContent = task.subject.description;
            const durationElement = document.getElementById('subject-duration');
            durationElement.innerHTML = `<i class="fas fa-clock mr-2"></i> ${task.subject.studyDuration} hours`;
        } else {
            document.getElementById('subject-name').textContent = 'N/A';
            document.getElementById('subject-description').textContent = 'No associated subject found.';
            document.getElementById('subject-duration').textContent = 'N/A';
        }
    };

    const bindActionButtons = () => {
        const updateBtn = document.getElementById('update-task-btn');
        const deleteBtn = document.getElementById('delete-task-btn');

        if (updateBtn) {
            updateBtn.addEventListener('click', () => {
                // Redirect to the tasks page and trigger the modal
                window.location.href = `/admin/tasks?action=edit&taskId=${taskId}`;
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                Swal.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Yes, delete it!'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        deleteTask();
                    }
                });
            });
        }
    };

    const deleteTask = async () => {
        try {
            const response = await fetch(`/api/tasks/${taskId}?lang=${lang}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (result.success) {
                showToast('Task deleted successfully!', 'success');
                window.location.href = '/admin/tasks';
            } else {
                showToast(result.message || 'Failed to delete task.', 'error');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            showToast('An error occurred while deleting the task.', 'error');
        }
    };

    // Initial fetch
    fetchTaskDetails();
    bindActionButtons();
});

// Dummy showToast function if not globally available
if (typeof showToast === 'undefined') {
    function showToast(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}
