document.addEventListener('DOMContentLoaded', () => {
    let currentCourseData = null;
    const getCourseIdFromUrl = () => {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1];
    };

    const fetchCourseDetails = async (courseId) => {
        try {
            const lang = getCurrentLanguage();
            const response = await fetch(`/course/${courseId}?lang=${lang}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                populateCourseData(result.data);
            } else {
                showToast(result.message || 'Failed to load course details.', 'error');
            }
        } catch (error) {
            showToast('An unexpected error occurred. Please try again later.', 'error');
        }
    };

    const populateCourseData = (course) => {
        currentCourseData = course;
        document.title = course.name;

        document.getElementById('course-name-header').textContent = course.name;
        const statusBadge = document.getElementById('status-badge');
        statusBadge.textContent = course.status;
        const statusClasses = {
            'ACTIVE': 'bg-green-100 text-green-800',
            'INACTIVE': 'bg-red-100 text-red-800',
            'PENDING': 'bg-yellow-100 text-yellow-800'
        };
        statusBadge.className = `px-3 py-1 rounded-full text-sm font-semibold ${statusClasses[course.status] || 'bg-gray-100 text-gray-800'}`;

        document.getElementById('course-description').textContent = course.description;

        document.getElementById('start-date').textContent = new Date(course.start).toLocaleDateString('vi-VN');
        document.getElementById('end-date').textContent = new Date(course.end).toLocaleDateString('vi-VN');

        if (course.creator && course.creator.userName) {
            document.getElementById('course-creator').textContent = course.creator.userName;
        }

        if (course.subjects) {
            renderSubjectList(course.subjects);
        }
    };

    const renderSubjectList = (subjects) => {
        const tbody = document.getElementById('subject-list-body');
        tbody.innerHTML = '';

        if (!subjects || subjects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="px-6 py-4 text-center text-gray-500">No subjects assigned to this course.</td></tr>';
            return;
        }

        subjects.forEach(subject => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${subject.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${subject.description}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${subject.studyDuration}</td>
            `;
            tbody.appendChild(row);
        });
    };

    const renderTraineeList = (trainees) => {
        const tbody = document.getElementById('trainee-list-body');
        const loadingState = document.getElementById('trainee-loading-state');
        tbody.innerHTML = '';

        if (!trainees || trainees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No trainees enrolled in this course.</td></tr>';
            return;
        }

        const statusClasses = {
            'PASS': 'bg-green-100 text-green-800',
            'FAIL': 'bg-red-100 text-red-800',
            'IN_PROGRESS': 'bg-blue-100 text-blue-800',
            'RESIGN': 'bg-yellow-100 text-yellow-800'
        };

        trainees.forEach(trainee => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${trainee.userName}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(trainee.registrationDate).toLocaleDateString('vi-VN')}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                        <div class="bg-indigo-600 h-2.5 rounded-full" style="width: ${trainee.courseProgress}%"></div>
                    </div>
                    <span class="text-xs text-gray-500">${trainee.courseProgress}% Complete</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[trainee.status] || 'bg-gray-100 text-gray-800'}">
                        ${trainee.status}
                    </span>
                </td>
            `;
            tbody.appendChild(row);
        });
    };

    const fetchEnrolledTrainees = async (courseId) => {
        try {
            const lang = getCurrentLanguage();
            const response = await fetch(`/user_course/${courseId}/users?lang=${lang}`);
            const result = await response.json();

            if (result.success) {
                renderTraineeList(result.data);
            } else {
                throw new Error(result.message || 'Failed to load enrolled trainees.');
            }
        } catch (error) {
            console.error('Fetch trainees error:', error);
            const tbody = document.getElementById('trainee-list-body');
            tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">Error: ${error.message}</td></tr>`;
        }
    };

    const courseId = getCourseIdFromUrl();
    if (courseId) {
        fetchCourseDetails(courseId);
        fetchEnrolledTrainees(courseId);
        initDeleteButton(courseId);
        initUpdateButton();
    }

    function initDeleteButton(courseId) {
        const deleteBtn = document.getElementById('delete-course-btn');
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
                }).then((result) => {
                    if (result.isConfirmed) {
                        performDelete(courseId);
                    }
                });
            });
        }
    }

    async function performDelete(courseId) {
        const lang = getCurrentLanguage();
        try {
            const response = await fetch(`/course/${courseId}?lang=${lang}`, {
                method: 'DELETE',
            });
    
            const result = await response.json();
    
            if (result.success) {
                showToast(result.message, 'success');
                setTimeout(() => {
                    window.location.href = '/admin/courses';
                }, 1500);
            } else {
                showToast(result.message || 'Failed to delete course.', 'error');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            showToast('An unexpected error occurred.', 'error');
        }
    }

    function initUpdateButton() {
        const updateBtn = document.getElementById('update-course-btn');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => {
                if (currentCourseData) {
                    showUpdateModal(currentCourseData);
                } else {
                    showToast('Course data is not available for editing.', 'error');
                }
            });
        }
    }

    function showUpdateModal(course) {
            Swal.fire({
                title: 'Edit Course',
                width: '48rem',
                customClass: {
                    popup: 'p-6 rounded-lg',
                    title: 'text-2xl font-bold mb-4 text-gray-800',
                    htmlContainer: 'text-left',
                    confirmButton: 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                    cancelButton: 'px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400'
                },
                html: `
                    <div class="space-y-6">
                        <div>
                            <label for="swal-course-name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input id="swal-course-name" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="${course.name}" placeholder="e.g. Advanced JavaScript">
                        </div>
                        <div>
                            <label for="swal-course-description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea id="swal-course-description" rows="4" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="A detailed description of the course.">${course.description}</textarea>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="swal-course-start" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input id="swal-course-start" type="date" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="${new Date(course.start).toISOString().split('T')[0]}">
                            </div>
                            <div>
                                <label for="swal-course-end" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input id="swal-course-end" type="date" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="${new Date(course.end).toISOString().split('T')[0]}">
                            </div>
                        </div>
                        <div>
                            <label for="swal-course-status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select id="swal-course-status" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option value="ACTIVE" ${course.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
                                <option value="INACTIVE" ${course.status === 'INACTIVE' ? 'selected' : ''}>Inactive</option>
                            </select>
                        </div>
                    </div>
                `,
                confirmButtonText: 'Save Changes',
                showCancelButton: true,
                focusConfirm: false,
                preConfirm: () => {
                    return {
                        name: document.getElementById('swal-course-name').value,
                        description: document.getElementById('swal-course-description').value,
                        start: document.getElementById('swal-course-start').value,
                        end: document.getElementById('swal-course-end').value,
                        status: document.getElementById('swal-course-status').value
                    };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    performUpdate(course.courseId, result.value);
                }
            });
    }

    async function performUpdate(courseId, courseData) {
        const lang = getCurrentLanguage();
        try {
            const response = await fetch(`/course/${courseId}?lang=${lang}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(courseData),
            });

            const result = await response.json();

            if (result.success) {
                showToast(result.message, 'success');
                setTimeout(() => location.reload(), 1500);
            } else {
                showToast(result.message || 'Failed to update course.', 'error');
            }
        } catch (error) {
            showToast('An unexpected error occurred.', 'error');
        }
    }
});
