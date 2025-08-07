function isAdmin() {
    if (document.getElementById('assign-supervisor-btn')) return true;
    if (!window.currentUser || !window.currentUser.data) return false;
    const d = window.currentUser.data;
    if (typeof d.role === 'string') return d.role.toUpperCase() === 'ADMIN';
    if (Array.isArray(d.roles)) return d.roles.map(r => r.toUpperCase()).includes('ADMIN');
    return false;
}

function isSupervisor() {
    if (!window.currentUser || !window.currentUser.data) return false;
    const d = window.currentUser.data;
    if (typeof d.role === 'string') return d.role.toUpperCase() === 'SUPERVISOR';
    if (Array.isArray(d.roles)) return d.roles.map(r => r.toUpperCase()).includes('SUPERVISOR');
    return false;
}

document.addEventListener('DOMContentLoaded', () => {
    let currentCourseData = null;



    /** Fetch all subjects */
    async function fetchAllSubjects() {
        const lang = getCurrentLanguage();
        const res = await fetch(`/subject?page=1&pageSize=1000&lang=${lang}`);
        const json = await res.json();
        
        if (json.success) return json.data.items;
        throw new Error(json.message || tMsg('failedLoadSubjects'));
    }

    /** Show modal to pick multiple subjects */
    async function showAddSubjectsModal(courseId) {
        try {
            const allSubjects = await fetchAllSubjects();
            // get current subjects to exclude
            const existingIds = Array.from(document.querySelectorAll('.subject-row-checkbox')).map(cb => cb.value);
            const available = allSubjects.filter(s => !existingIds.includes(String(s.subjectId)));

            if (available.length === 0) {
                showToast(tMsg('noSubjectsAvailable'), 'info');
                return;
            }

            const checkboxHtml = available.map(s => `<label class="flex items-center space-x-2 mb-2"><input type="checkbox" value="${s.subjectId}" class="subject-checkbox h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"><span>${s.name}</span></label>`).join('');

            const { value: selectedIds } = await Swal.fire({
                title: tMsg('selectSubjects'),
                width: '40rem',
                customClass: {
                    popup: 'p-6 rounded-lg',
                    title: 'text-xl font-semibold mb-4 text-gray-800',
                    confirmButton: 'px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700',
                    cancelButton: 'px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300'
                },
                html: `<div class="max-h-96 overflow-y-auto">${checkboxHtml}</div>`,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: tMsg('assignBtn'),
                cancelButtonText: tMsg('cancelBtn'),
                preConfirm: () => {
                    return Array.from(document.querySelectorAll('.subject-checkbox:checked')).map(cb => cb.value);
                }
            });

            if (selectedIds && selectedIds.length > 0) {
                await performAddSubjects(courseId, selectedIds);
            }
        } catch (err) {
            console.error(err);
            showToast(tMsg('unexpectedError'), 'error');
        }
    }

    async function performDeleteSubjects(courseId, subjectIds) {
    const lang = getCurrentLanguage();
    try {
        const res = await fetch(`/course_subject/${courseId}/subjects?lang=${lang}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subjectIds })
        });
        const json = await res.json();
        if (json.success) {
            showToast(json.message || tMsg('deleteSuccess'), 'success');
            fetchCourseSubjects(courseId);
        } else {
            showToast(json.message || tMsg('failedDelete'), 'error');
        }
    } catch (e) {
        showToast(tMsg('unexpectedError'), 'error');
    }
}

async function performAddSubjects(courseId, subjectIds) {
        const lang = getCurrentLanguage();
        try {
            const res = await fetch(`/course_subject/${courseId}?lang=${lang}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subjectIds })
            });
            const json = await res.json();
            if (json.success) {
                showToast(json.message || tMsg('subjectsAdded'), 'success');
                fetchCourseSubjects(courseId);
            } else {
                showToast(json.message || tMsg('failedAddSubjects'), 'error');
            }
        } catch (e) {
            showToast(tMsg('unexpectedError'), 'error');
        }
    }

    function initDeleteSubjectsButton(courseId) {
    const deleteBtn = document.getElementById('delete-subjects-btn');
    const selectAllCb = document.getElementById('select-all-subjects');
    const tbody = document.getElementById('subject-list-body');

    if (selectAllCb) {
        const tbody = document.getElementById('subject-list-body');
        selectAllCb.addEventListener('change', () => {
            tbody.querySelectorAll('.subject-row-checkbox').forEach(cb => {
                cb.checked = selectAllCb.checked;
            });
            updateDeleteBtnState();
        });
    }

    if (tbody) {
        tbody.addEventListener('change', (e) => {
            if (e.target && e.target.classList.contains('subject-row-checkbox')) {
                // update select-all state as well
                if (selectAllCb) {
                    const allRows = tbody.querySelectorAll('.subject-row-checkbox');
                    const allChecked = Array.from(allRows).every(cb => cb.checked);
                    selectAllCb.checked = allChecked;
                }
                updateDeleteBtnState();
            }
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const ids = Array.from(document.querySelectorAll('.subject-row-checkbox:checked')).map(cb => cb.value);
            if (ids.length === 0) return;
            Swal.fire({
                title: tMsg('confirmDeleteTitle'),
                text: tMsg('confirmDeleteText'),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: tMsg('confirmDeleteBtn'),
                cancelButtonText: tMsg('cancelBtn')
            }).then((result) => {
                if (result.isConfirmed) {
                    performDeleteSubjects(courseId, ids);
                }
            });
        });
    }

    function updateDeleteBtnState() {
        const anyChecked = !!document.querySelector('.subject-row-checkbox:checked');
        deleteBtn.disabled = !anyChecked;
    }
}

function initAddSubjectsButton(courseId) {
        const btn = document.getElementById('add-subjects-btn');
        if (btn) {
            btn.addEventListener('click', () => showAddSubjectsModal(courseId));
        }
    }

    // existing mapping
    const subjectStatusClasses = {
        NOT_STARTED: 'bg-gray-100 text-gray-800',
        IN_PROGRESS: 'bg-blue-100 text-blue-800',
        FINISH: 'bg-green-100 text-green-800',
    };
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
                showToast(result.message || tMsg('failedLoadData'), 'error');
            }
        } catch (error) {
            showToast(tMsg('unexpectedError'), 'error');
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
        document.getElementById('end-date').textContent = course.end;

        if (course.creator && course.creator.userName) {
            document.getElementById('course-creator').textContent = course.creator.userName;
        }

        const startBtn = document.getElementById('start-course-btn');
        const finishBtn = document.getElementById('finish-course-btn');
        const canManage = isAdmin() || isSupervisor();

        // Ẩn mặc định
        if (startBtn) startBtn.classList.add('hidden');
        if (finishBtn) finishBtn.classList.add('hidden');

        // Chỉ hiển thị khi khoá học đang ACTIVE và người dùng có quyền quản lý
        if (canManage && course.status === 'ACTIVE') {
            if (startBtn) {
                startBtn.classList.remove('hidden');
                startBtn.classList.add('inline-flex');
            }
            if (finishBtn) {
                finishBtn.classList.remove('hidden');
                finishBtn.classList.add('inline-flex');
            }
        }


    };

    async function fetchCourseSubjects(courseId) {
        const tbody = document.getElementById('subject-list-body');
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4"><i class="fas fa-spinner fa-spin mr-2"></i>${tMsg('loadingSubjects')}</td></tr>`;

        try {
            const lang = getCurrentLanguage();
            const response = await fetch(`/course_subject/${courseId}?lang=${lang}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            renderSubjectList(result.data.subjects);

        } catch (error) {
            console.error('Error fetching subjects:', error);
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-red-500">${tMsg('failedLoadSubjects')}</td></tr>`;
        }
    }

    const renderSubjectList = (subjects) => {
        const tbody = document.getElementById('subject-list-body');
        tbody.innerHTML = '';

        if (!subjects || subjects.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-gray-500">${tMsg('noSubjectsCourse')}</td></tr>`;
            return;
        }

        subjects.forEach(subject => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 text-center">
                    <input type="checkbox" value="${subject.subjectId}" class="subject-row-checkbox h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${subject.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${subject.description}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${subject.studyDuration}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${subjectStatusClasses[subject.status] || 'bg-gray-100 text-gray-800'}">
                        ${subject.status.replace('_', ' ')}
                    </span>
                </td>
            `;
            tbody.appendChild(row);
        });
    };

    const renderTraineeList = (trainees) => {
    const courseId = getCourseIdFromUrl();
        const adminModeT = isAdmin();
        const tbody = document.getElementById('trainee-list-body');
        tbody.innerHTML = '';

        if (!trainees || trainees.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">${tMsg('noTrainees')}</td></tr>`;
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
                <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                <a href="/admin/courses/${courseId}/trainee/${trainee.userId}/progress" class="hover:underline"><i class="fas fa-eye"></i></a>
            </td>
            ${adminModeT ? `<td class="px-6 py-4 whitespace-nowrap"><div class="flex items-center justify-center"><button data-id="${trainee.userId}" class="remove-trainee-btn text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button></div></td>` : '<td></td>'}
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
                throw new Error(result.message || tMsg('failedLoadTrainees'));
            }
        } catch (error) {
            console.error('Fetch trainees error:', error);
            const tbody = document.getElementById('trainee-list-body');
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">${tMsg('failedLoadTrainees')}</td></tr>`;
        }
    };

    const courseId = getCourseIdFromUrl();
    if (courseId) {
        fetchCourseDetails(courseId);
        fetchCourseSubjects(courseId);
        fetchAssignedSupervisors(courseId);
        fetchEnrolledTrainees(courseId);
        initDeleteButton(courseId);
        initUpdateButton();
        initRemoveTraineeButton(courseId);
        initRemoveSupervisorButton(courseId);
        initStartCourseButton(courseId);
        initFinishCourseButton(courseId);
        initAddSubjectsButton(courseId);
        initDeleteSubjectsButton(courseId);
    }

    function initDeleteButton(courseId) {
        const deleteBtn = document.getElementById('delete-course-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                Swal.fire({
                    title: tMsg('confirmDeleteTitle'),
                    text: tMsg('confirmDeleteText'),
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: tMsg('confirmDeleteBtn'),
                    cancelButtonText: tMsg('cancelBtn')
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
                showToast(result.message || tMsg('failedDelete'), 'error');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            showToast(tMsg('unexpectedError'), 'error');
        }
    }

    function initUpdateButton() {
        const updateBtn = document.getElementById('update-course-btn');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => {
                if (currentCourseData) {
                    showUpdateModal(currentCourseData);
                } else {
                    showToast(tMsg('courseDataNotAvailable'), 'error');
                }
            });
        }
    }

    function showUpdateModal(course) {
        Swal.fire({
            title: tMsg('editCourse'),
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
                            <label for="swal-course-name" class="block text-sm font-medium text-gray-700 mb-1">${tMsg('name')}</label>
                            <input id="swal-course-name" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="${course.name}" placeholder="${tMsg('courseNamePlaceholder')}">
                        </div>
                        <div>
                            <label for="swal-course-description" class="block text-sm font-medium text-gray-700 mb-1">${tMsg('description')}</label>
                            <textarea id="swal-course-description" rows="4" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="${tMsg('courseDescriptionPlaceholder')}">${course.description}</textarea>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="swal-course-start" class="block text-sm font-medium text-gray-700 mb-1">${tMsg('startDate')}</label>
                                <input id="swal-course-start" type="date" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="${new Date(course.start).toISOString().split('T')[0]}">
                            </div>
                            <div>
                                <label for="swal-course-end" class="block text-sm font-medium text-gray-700 mb-1">${tMsg('endDate')}</label>
                                <input id="swal-course-end" type="date" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="${new Date(course.end).toISOString().split('T')[0]}">
                            </div>
                        </div>
                        <div>
                            <label for="swal-course-status" class="block text-sm font-medium text-gray-700 mb-1">${tMsg('status')}</label>
                            <select id="swal-course-status" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option value="ACTIVE" ${course.status === 'ACTIVE' ? 'selected' : ''}>${tMsg('active')}</option>
                                <option value="INACTIVE" ${course.status === 'INACTIVE' ? 'selected' : ''}>${tMsg('inactive')}</option>
                            </select>
                        </div>
                    </div>
                `,
            confirmButtonText: tMsg('saveChanges'),
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
                showToast(result.message || tMsg('failedUpdateCourse'), 'error');
            }
        } catch (error) {
            showToast(tMsg('unexpectedError'), 'error');
        }
    }

    function renderSupervisorList(supervisors) {
        const tbody = document.getElementById('supervisor-list-body');
        tbody.innerHTML = '';
        if (!supervisors || supervisors.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">${tMsg('noSupervisor')}</td></tr>`;
            return;
        }
        const adminMode = isAdmin();
        const supervisorMode = isSupervisor();
        supervisors.forEach(sp => {
            const row = document.createElement('tr');
            const statusClasses = {
                'ACTIVE': 'bg-green-100 text-green-800',
                'INACTIVE': 'bg-red-100 text-red-800',
                'PENDING': 'bg-yellow-100 text-yellow-800'
            };
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${sp.userName}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sp.email}</td>
                <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[sp.status] || 'bg-gray-100 text-gray-800'}">${sp.status}</span></td>
                ${adminMode || supervisorMode ? `<td class="px-6 py-4 whitespace-nowrap"><div class="flex items-center justify-center"><button data-id="${sp.userId}" class="remove-sup-btn text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button></div></td>` : '<td></td>'}
            `;
            tbody.appendChild(row);
        });
    }

    async function fetchAssignedSupervisors(courseId) {
        const lang = getCurrentLanguage();
        try {
            const response = await fetch(`/course/${courseId}/supervisor?lang=${lang}`);
            const result = await response.json();
            if (result.success) {
                renderSupervisorList(result.data);
            } else {
                throw new Error(result.message || 'Failed to load supervisors');
            }
        } catch (error) {
            const tbody = document.getElementById('supervisor-list-body');
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Error: ${error.message}</td></tr>`;
        }
    }

    function initRemoveTraineeButton(courseId) {
        const tbody = document.getElementById('trainee-list-body');
        tbody.addEventListener('click', (e) => {
            const btn = e.target.closest('button.remove-trainee-btn');
            if (btn) {
                const traineeId = btn.dataset.id;
                Swal.fire({
                    title: tMsg('confirmDeleteTitle'),
                    text: tMsg('confirmDeleteText'),
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: tMsg('confirmDeleteBtn'),
                    cancelButtonText: tMsg('cancelBtn')
                }).then((result) => {
                    if (result.isConfirmed) {
                        performRemoveTrainee(courseId, traineeId);
                    }
                });
            }
        });
    }

    async function performRemoveTrainee(courseId, traineeId) {
        const lang = getCurrentLanguage();
        try {
            const response = await fetch(`/course/${courseId}/trainee/${traineeId}?lang=${lang}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                showToast(result.message, 'success');
                setTimeout(() => {
                    fetchEnrolledTrainees(courseId);
                }, 1500);
            } else {
                showToast(result.message || 'Failed to remove trainee.', 'error');
            }
        } catch (error) {
            console.error('Error removing trainee:', error);
            showToast(tMsg('unexpectedError'), 'error');
        }
    }

    function initRemoveSupervisorButton(courseId) {
        const tbody = document.getElementById('supervisor-list-body');
        tbody.addEventListener('click', (e) => {
            const btn = e.target.closest('button.remove-sup-btn');
            if (btn) {
                const supervisorId = btn.dataset.id;
                Swal.fire({
                    title: tMsg('confirmDeleteTitle'),
                    text: tMsg('confirmDeleteText'),
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: tMsg('confirmDeleteBtn'),
                    cancelButtonText: tMsg('cancelBtn')
                }).then((result) => {
                    if (result.isConfirmed) {
                        performRemoveSupervisor(courseId, supervisorId);
                    }
                });
            }
        });
    }

    async function performRemoveSupervisor(courseId, supervisorId) {
        const lang = getCurrentLanguage();
        try {
            const response = await fetch(`/course/${courseId}/supervisor/${supervisorId}?lang=${lang}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (result.success) {
                showToast(result.message, 'success');
                setTimeout(() => {
                    fetchAssignedSupervisors(courseId);
                }, 1500);
            } else {
                showToast(result.message || tMsg('failedDelete'), 'error');
            }
        } catch (error) {
            console.error('Error removing supervisor:', error);
            showToast(tMsg('unexpectedError'), 'error');
        }
    }

    function initStartCourseButton(courseId) {
        const startBtn = document.getElementById('start-course-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                Swal.fire({
                    title: tMsg('confirmDeleteTitle'),
                    text: tMsg('startCourseText'),
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#28a745',
                    cancelButtonColor: '#d33',
                    confirmButtonText: tMsg('startCourseBtn')
                }).then((result) => {
                    if (result.isConfirmed) {
                        performStartCourse(courseId);
                    }
                });
            });
        }
    }

    async function performStartCourse(courseId) {
        const lang = getCurrentLanguage();
        try {
            const response = await fetch(`/course/${courseId}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();
            if (result.success) {
                showToast(result.message, 'success');
                setTimeout(() => location.reload(), 1500);
            } else {
                showToast(result.message || tMsg('failedStartCourse'), 'error');
            }
        } catch (error) {
            console.error('Error starting course:', error);
            showToast(tMsg('unexpectedError'), 'error');
        }
    }

    function initFinishCourseButton(courseId) {
        const finishBtn = document.getElementById('finish-course-btn');
        if (finishBtn) {
            finishBtn.addEventListener('click', () => {
                Swal.fire({
                    title: tMsg('confirmDeleteTitle'),
                    text: tMsg('finishCourseText'),
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#dc3545',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: tMsg('finishCourseBtn')
                }).then((result) => {
                    if (result.isConfirmed) {
                        performFinishCourse(courseId);
                    }
                });
            });
        }
    }

    async function performFinishCourse(courseId) {
        const lang = getCurrentLanguage();
        try {
            const response = await fetch(`/course/${courseId}/finish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();
            if (result.success) {
                showToast(result.message, 'success');
                setTimeout(() => location.reload(), 1500);
            } else {
                showToast(result.message || tMsg('failedFinishCourse'), 'error');
            }
        } catch (error) {
            console.error('Error finishing course:', error);
            showToast(tMsg('unexpectedError'), 'error');
        }
    }

});
