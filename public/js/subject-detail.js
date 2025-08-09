document.addEventListener('DOMContentLoaded', () => {
    let currentSubjectData = null;

    const getSubjectIdFromUrl = () => {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1];
    };

    const populateSubjectData = (subject) => {
        currentSubjectData = subject;
        document.title = subject.name;
        document.getElementById('subject-name-header').textContent = subject.name;
        document.getElementById('subject-description').textContent = subject.description;
        document.getElementById('study-duration').textContent = `${subject.studyDuration} hours`;

        if (subject.tasks) {
            renderTaskList(subject.tasks);
        }
    };

    const fetchSubjectDetails = async (subjectId) => {
        try {
            const lang = getCurrentLanguage();
            const response = await fetch(`/subject/${subjectId}?lang=${lang}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                populateSubjectData(result.data);
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            showToast('An unexpected error occurred. Please try again later.', 'error');
        }
    };

    const renderTaskList = (tasks) => {
        const tbody = document.getElementById('task-list-body');
        tbody.innerHTML = '';

        if (!tasks || tasks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="px-6 py-4 text-center text-gray-500">No tasks found for this subject.</td></tr>';
            return;
        }

        tasks.forEach(task => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${task.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a href="${task.fileUrl}" target="_blank" class="text-indigo-600 hover:text-indigo-900">View File</a>
                </td>
            `;
            tbody.appendChild(row);
        });
    };

    const showUpdateModal = (subject) => {
        Swal.fire({
            title: 'Update Subject',
            html: `
                <div class="space-y-4">
                    <div>
                        <label for="swal-subject-name" class="block text-sm font-medium text-gray-700 text-left">Name</label>
                        <input id="swal-subject-name" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="${subject.name}">
                    </div>
                    <div>
                        <label for="swal-subject-description" class="block text-sm font-medium text-gray-700 text-left">Description</label>
                        <textarea id="swal-subject-description" rows="4" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">${subject.description}</textarea>
                    </div>
                    <div>
                        <label for="swal-subject-duration" class="block text-sm font-medium text-gray-700 text-left">Study Duration (hours)</label>
                        <input id="swal-subject-duration" type="number" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="${subject.studyDuration}">
                    </div>
                </div>
            `,
            confirmButtonText: 'Save Changes',
            showCancelButton: true,
            focusConfirm: false,
            preConfirm: () => {
                return {
                    name: document.getElementById('swal-subject-name').value,
                    description: document.getElementById('swal-subject-description').value,
                    studyDuration: parseInt(document.getElementById('swal-subject-duration').value, 10)
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                performUpdate(subject.subjectId, result.value);
            }
        });
    };

    const performUpdate = async (subjectId, data) => {
        try {
            const lang = getCurrentLanguage();
            const response = await fetch(`/subject/${subjectId}?lang=${lang}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                showToast(result.message, 'success');
                fetchSubjectDetails(subjectId);
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            showToast('An unexpected error occurred.', 'error');
        }
    };

    const showDeleteConfirmation = (subjectId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                performDelete(subjectId);
            }
        });
    };

    const performDelete = async (subjectId) => {
        try {
            const lang = getCurrentLanguage();
            const response = await fetch(`/subject/${subjectId}?lang=${lang}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (result.success) {
                showToast(result.message, 'success');
                window.location.href = '/admin/subjects';
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            showToast('An unexpected error occurred.', 'error');
        }
    };

    const initButtons = (subjectId) => {
        const updateBtn = document.getElementById('update-subject-btn');
        const deleteBtn = document.getElementById('delete-subject-btn');

        updateBtn.addEventListener('click', () => {
            if (currentSubjectData) {
                showUpdateModal(currentSubjectData);
            } else {
                showToast('Subject data is not available for update.', 'error');
            }
        });

        deleteBtn.addEventListener('click', () => {
            showDeleteConfirmation(subjectId);
        });
    };

    const initPage = async () => {
        const subjectId = getSubjectIdFromUrl();
        if (subjectId) {
            await fetchSubjectDetails(subjectId);
            initButtons(subjectId);
        }
    };

    initPage();
});
