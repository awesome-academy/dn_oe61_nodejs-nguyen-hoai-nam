class CoursesManager {
    constructor() {
        this.courses = [];
        this.currentCourseId = null;
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalPages = 1;
        this.init();
    }

    init() {
        this.initEventListeners();
        this.loadCourses();
    }

    initEventListeners() {
        document.getElementById('add-course-btn')?.addEventListener('click', () => this.showAddModal());
        document.getElementById('modal-close-btn')?.addEventListener('click', () => this.hideModal());
        document.getElementById('modal-cancel-btn')?.addEventListener('click', () => this.hideModal());
        document.getElementById('course-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCourse();
        });
    }

    showModal(courseId = null) {
        const modal = document.getElementById('course-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('course-form');
        const subjectsContainer = document.getElementById('subjects-container');
        form.reset();
        this.currentCourseId = null;

        if (courseId) {
            const course = this.courses.find(c => c.id === courseId);
            if (course) {
                modalTitle.textContent = 'Edit Course';
                this.currentCourseId = course.id;
                document.getElementById('course-id').value = course.id;
                document.getElementById('course-name').value = course.name;
                document.getElementById('course-description').value = course.description;
                document.getElementById('course-start').value = course.start.split('T')[0];
                document.getElementById('course-end').value = course.end.split('T')[0];
                document.getElementById('course-status').value = course.status;
                subjectsContainer.classList.add('hidden');
            } else {
                showToast(`Course not found.`, 'error');
                return;
            }
        } else {
            modalTitle.textContent = 'Add New Course';
        }

        modal.classList.remove('hidden');
    }

    async showAddModal() {
        document.getElementById('course-form').reset();
        document.getElementById('course-id').value = '';
        document.getElementById('modal-title').textContent = 'Add New Course';
        document.getElementById('subjects-container').classList.remove('hidden');
        await this.loadSubjects();
        const modal = document.getElementById('course-modal');
        modal.classList.remove('hidden');
    }

    async loadSubjects() {
        try {
            const lang = getCurrentLanguage();
            const response = await fetch(`/subject?page=1&pageSize=1000&lang=${lang}`);
            const result = await response.json();
            if (result.success) {
                const subjectsSelect = document.getElementById('course-subjects');
                subjectsSelect.innerHTML = '';
                result.data.items.forEach(subject => {
                    const option = document.createElement('option');
                    option.value = subject.subjectId;
                    option.textContent = subject.name;
                    subjectsSelect.appendChild(option);
                });
            } else {
                showToast(result.message || 'Failed to load subjects.', 'error');
            }
        } catch (error) {
            showToast('An unexpected error occurred while fetching subjects.', 'error');
        }
    }

    hideModal() {
        const modal = document.getElementById('course-modal');
        modal.classList.add('hidden');
    }

    async saveCourse() {
        const courseId = document.getElementById('course-id').value;
        const form = document.getElementById('course-form');
        const formData = new FormData(form);

        const courseData = {
            name: formData.get('name'),
            description: formData.get('description'),
            start: formData.get('start'),
            end: formData.get('end'),
            status: formData.get('status')
        };

        // Only include subjectIds when creating a new course
        if (!courseId) {
            const subjectIds = Array.from(document.getElementById('course-subjects').selectedOptions).map(opt => parseInt(opt.value));
            courseData.subjectIds = subjectIds;
        }

        const lang = getCurrentLanguage();
        const url = courseId ? `/course/${courseId}?lang=${lang}` : `/course?lang=${lang}`;
        const method = courseId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(courseData),
            });

            const result = await response.json();

            if (result.success) {
                showToast(result.message || `Course successfully ${courseId ? 'updated' : 'created'}!`, 'success');
                this.hideModal();
                this.loadCourses(this.currentPage);
            } else {
                showToast(result.message || 'An error occurred while saving the course.', 'error');
            }
        } catch (error) {
            showToast('An unexpected error occurred.', 'error');
        }
    }

    async loadCourses(page = 1) {
        this.currentPage = page;
        try {
            const lang = getCurrentLanguage();
            const response = await fetch(`/course?page=${this.currentPage}&pageSize=${this.pageSize}&lang=${lang}`);
            const result = await response.json();

            if (result.success) {
                this.courses = result.data.items || [];
                const meta = result.data.meta;

                this.totalPages = meta.totalPages || 1;
                
                this.renderTable(this.courses);
                this.updateStats(this.courses, meta);
                this.renderPagination();
            } else {
                showToast(result.message || 'Failed to load courses.', 'error');
            }
        } catch (error) {
            showToast('An unexpected error occurred.', 'error');
        }
    }

    updateStats(courses, meta) {
        const totalCourses = meta.totalItems || 0;
        const activeCourses = courses.filter(course => course.status === 'ACTIVE').length;
        const inactiveCourses = courses.filter(course => course.status !== 'ACTIVE').length;

        document.getElementById('total-courses').textContent = totalCourses;
        document.getElementById('active-courses').textContent = activeCourses;
        document.getElementById('inactive-courses').textContent = inactiveCourses;
    }

    renderPagination() {
        const paginationContainer = document.getElementById('pagination-container');
        if (!paginationContainer) return;

        let paginationHtml = '';
        paginationHtml += `
            <button 
                class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${this.currentPage === 1 ? 'cursor-not-allowed' : ''}" 
                onclick="coursesManager.loadCourses(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}>
                <span class="sr-only">Previous</span>
                <i class="fas fa-chevron-left h-5 w-5"></i>
            </button>`;

        for (let i = 1; i <= this.totalPages; i++) {
            paginationHtml += `
                <button 
                    class="relative inline-flex items-center px-4 py-2 text-sm font-semibold ${i === this.currentPage ? 'bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}" 
                    onclick="coursesManager.loadCourses(${i})">${i}
                </button>`;
        }

        paginationHtml += `
            <button 
                class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${this.currentPage === this.totalPages ? 'cursor-not-allowed' : ''}" 
                onclick="coursesManager.loadCourses(${this.currentPage + 1})" ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                <span class="sr-only">Next</span>
                <i class="fas fa-chevron-right h-5 w-5"></i>
            </button>`;

        paginationContainer.innerHTML = `<nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">${paginationHtml}</nav>`;
    }

    renderTable(courses) {
        const tableBody = document.getElementById('courses-table-body');
        tableBody.innerHTML = '';

        if (courses.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No courses found.</td></tr>';
            return;
        }

        courses.forEach(course => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${course.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${course.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${course.description}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(course.start).toLocaleDateString()}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(course.end).toLocaleDateString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${course.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${course.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="/admin/courses/${course.id}" class="p-2 text-gray-600 hover:text-gray-800" title="View Details"><i class="fas fa-eye"></i></a>
                    <button class="p-2 text-blue-600 hover:text-blue-800" onclick="coursesManager.showModal(${course.id})" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="p-2 text-red-600 hover:text-red-800" onclick="coursesManager.deleteCourse(${course.id})" title="Delete"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    async deleteCourse(courseId) {
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
                const lang = getCurrentLanguage();
                try {
                    const response = await fetch(`/course/${courseId}?lang=${lang}`, {
                        method: 'DELETE',
                    });

                    const apiResult = await response.json();

                    if (apiResult.success) {
                        showToast(apiResult.message, 'success');
                        this.loadCourses(this.currentPage);
                    } else {
                        showToast(apiResult.message || 'Failed to delete course.', 'error');
                    }
                } catch (error) {
                    showToast('An unexpected error occurred.', 'error');
                }
            }
        });
    }
}

let coursesManager;
document.addEventListener('userInfoLoaded', () => {
    coursesManager = new CoursesManager();
});
