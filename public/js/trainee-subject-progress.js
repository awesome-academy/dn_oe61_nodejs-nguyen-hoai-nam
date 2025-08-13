document.addEventListener('DOMContentLoaded', () => {
    const pathParts = window.location.pathname.split('/');
    const traineeId = pathParts[pathParts.indexOf('trainees') + 1];
    const userSubjectId = pathParts[pathParts.indexOf('subjects') + 1];

    const getLanguage = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('lang') || 'en'; // Default to 'en' if not present
    };

    if (!traineeId || !userSubjectId) {
        console.error('Could not extract traineeId or userSubjectId from URL.');
        return;
    }

    const lang = getLanguage();
    const API_URL = `/user_subject/${userSubjectId}/progress?lang=${lang}`;

    const fetchSubjectProgress = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(tMsg('failedLoadData'));
            }
            const data = await response.json();
            populateUI(data.data);
        } catch (error) {
            console.error('Error fetching subject progress:', error);
            showToast(tMsg('unexpectedError'), 'error'); // Handle error display
        }
    };

    const populateUI = (data) => {
        const { user, courseSubject, status, subjectProgress, startedAt, finishedAt, userTasks } = data;
        const subject = courseSubject.subject;

        // Breadcrumbs and Headers
        document.getElementById('breadcrumb-trainee-name').textContent = user.userName || 'Trainee';
        document.getElementById('breadcrumb-trainee-name').href = `/admin/trainees/${user.userId}`;
        document.getElementById('breadcrumb-subject-name').textContent = subject.name;
        document.getElementById('subject-name-header').textContent = subject.name;
        document.getElementById('trainee-name-subheader').textContent = user.userName;

        // Key Details
        document.getElementById('subject-status').textContent = status.replace(/_/g, ' ');
        document.getElementById('subject-progress').textContent = `${subjectProgress || 0}%`;
        document.getElementById('started-at-date').textContent = startedAt ? new Date(startedAt).toLocaleDateString() : tMsg('notStarted');
        document.getElementById('finished-at-date').textContent = finishedAt ? new Date(finishedAt).toLocaleDateString() : '--';

        // Action Button
        const actionContainer = document.getElementById('action-button-container');
        actionContainer.innerHTML = ''; // Clear previous content
        if (status === 'NOT_STARTED') {
            const startButton = document.createElement('button');
            startButton.innerHTML = `<i class="fas fa-play mr-2"></i> ${tMsg('startSubject')}`;
            startButton.className = 'px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50';
            startButton.addEventListener('click', () => handleStartSubject(userSubjectId));
            actionContainer.appendChild(startButton);
        }

        // Task List
        const taskListBody = document.getElementById('task-list-body');
        taskListBody.innerHTML = ''; // Clear loading state
        if (userTasks && userTasks.length > 0) {
            userTasks.forEach(userTask => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${userTask.task.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${userTask.status.replace(/_/g, ' ')}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a href="#" class="text-indigo-600 hover:text-indigo-900">${tMsg('viewTask')}</a>
                    </td>
                `;
                taskListBody.appendChild(row);
            });
        } else {
            taskListBody.innerHTML = `<tr><td colspan="3" class="px-6 py-4 text-center text-gray-500">${tMsg('noTasks')}</td></tr>`;
        }
    };

    const handleStartSubject = async (id) => {
        try {
            const lang = getLanguage();
            const response = await fetch(`/user_subject/${id}/start?lang=${lang}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || tMsg('failedStartSubject'));
            }

            const result = await response.json();

            // Refresh data to show updated state
            fetchSubjectProgress();
            // Show success message from server
            showToast(result.message, 'success');
        } catch (error) {
            console.error('Error starting subject:', error);
            showToast(error.message || tMsg('errorOccurred'), 'error');
        }
    };

    fetchSubjectProgress();
});
