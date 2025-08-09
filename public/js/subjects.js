class SubjectsManager {
    constructor() {
        this.currentSubjectId = null;
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalPages = 1;
        this.init();
    }

    init() {
        this.loadSubjects();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('add-subject-btn').addEventListener('click', () => {
            this.showModal();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('subject-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSubject();
        });

        document.getElementById('add-task-btn').addEventListener('click', () => {
            this.addTaskInput();
        });
    }

    showModal(subject = null) {
        const modal = document.getElementById('subject-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('subject-form');
        const tasksSection = document.querySelector('#tasks-container').parentElement;
        form.reset();
        this.currentSubjectId = null;
        document.getElementById('tasks-container').innerHTML = '';

        if (subject) {
            modalTitle.textContent = 'Edit Subject';
            this.currentSubjectId = subject.subjectId;
            document.getElementById('subject-name').value = subject.name;
            document.getElementById('subject-description').value = subject.description;
            document.getElementById('subject-duration').value = subject.studyDuration;
            tasksSection.classList.add('hidden');
        } else {
            modalTitle.textContent = 'Add New Subject';
            tasksSection.classList.remove('hidden');
        }

        modal.classList.remove('hidden');
    }

    hideModal() {
        const modal = document.getElementById('subject-modal');
        modal.classList.add('hidden');
    }

    addTaskInput(task = { name: '', fileUrl: '' }) {
        const container = document.getElementById('tasks-container');
        const taskInputGroup = document.createElement('div');
        taskInputGroup.classList.add('flex', 'items-center', 'space-x-2', 'task-input-group');
        taskInputGroup.innerHTML = `
            <input type="text" placeholder="Task Name" value="${task.name}" class="task-name-input mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
            <input type="text" placeholder="File URL" value="${task.fileUrl}" class="task-url-input mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
            <button type="button" class="remove-task-btn px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600">&times;</button>
        `;
        container.appendChild(taskInputGroup);

        taskInputGroup.querySelector('.remove-task-btn').addEventListener('click', () => {
            taskInputGroup.remove();
        });
    }

    async saveSubject() {
        const name = document.getElementById('subject-name').value;
        const description = document.getElementById('subject-description').value;
        const studyDuration = parseInt(document.getElementById('subject-duration').value, 10);

        const tasks = [];
        document.querySelectorAll('.task-input-group').forEach(group => {
            const taskName = group.querySelector('.task-name-input').value;
            const fileUrl = group.querySelector('.task-url-input').value;
            if (taskName && fileUrl) {
                tasks.push({ name: taskName, fileUrl });
            }
        });

        if (!this.currentSubjectId && tasks.length === 0) {
            showToast('Please add at least one task.', 'error');
            return;
        }

        const subjectData = {
            name,
            description,
            studyDuration,
            tasks
        };

        const lang = getCurrentLanguage();
        let url = `/subject?lang=${lang}`;
        let method = 'POST';

        // If we are editing, change method and URL
        if (this.currentSubjectId) {
            url = `/subject/${this.currentSubjectId}?lang=${lang}`;
            method = 'PUT';
            // When updating, we don't send the tasks array.
            delete subjectData.tasks;
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(subjectData),
            });

            const result = await response.json();

            if (result.success) {
                showToast(result.message, 'success');
                this.hideModal();
                this.loadSubjects(this.currentPage);
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            showToast('An unexpected error occurred.', 'error');
        }
    }

    async deleteSubject(subjectId, subjectName) {
        const lang = getCurrentLanguage();
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete the subject: "${subjectName}". You won't be able to revert this!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/subject/${subjectId}?lang=${lang}`, {
                    method: 'DELETE',
                });

                const result = await response.json();

                if (result.success) {
                    showToast(result.message, 'success');
                    this.loadSubjects(this.currentPage);
                } else {
                    showToast(result.message, 'error');
                }
            } catch (error) {
                showToast('An unexpected error occurred.', 'error');
            }
        }
    }

    async loadSubjects(page = 1) {
        this.currentPage = page;
        try {
            const lang = getCurrentLanguage();
            const response = await fetch(`/subject?page=${this.currentPage}&pageSize=${this.pageSize}&lang=${lang}`);
            const result = await response.json();

            if (result.success) {
                const subjects = result.data.items || [];
                const meta = result.data.meta;

                this.totalPages = meta.totalPages || 1;
                
                this.renderTable(subjects);
                this.updateStats(meta);
                this.renderPagination();
            } else {
                showToast(result.message || 'Failed to load subjects.', 'error');
            }
        } catch (error) {
            console.error('Error loading subjects:', error);
            showToast('An unexpected error occurred while fetching subjects.', 'error');
        }
    }

    updateStats(meta) {
        const totalSubjects = meta.totalItems || 0;
        document.getElementById('total-subjects').textContent = totalSubjects;
    }

    renderPagination() {
        const paginationContainer = document.getElementById('pagination-container');
        if (!paginationContainer) return;

        let paginationHtml = '';
        paginationHtml += `
            <button 
                class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${this.currentPage === 1 ? 'cursor-not-allowed' : ''}" 
                onclick="subjectsManager.loadSubjects(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}>
                <span class="sr-only">Previous</span>
                <i class="fas fa-chevron-left h-5 w-5"></i>
            </button>`;

        for (let i = 1; i <= this.totalPages; i++) {
            paginationHtml += `
                <button 
                    class="relative inline-flex items-center px-4 py-2 text-sm font-semibold ${i === this.currentPage ? 'bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}" 
                    onclick="subjectsManager.loadSubjects(${i})">${i}
                </button>`;
        }

        paginationHtml += `
            <button 
                class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${this.currentPage === this.totalPages ? 'cursor-not-allowed' : ''}" 
                onclick="subjectsManager.loadSubjects(${this.currentPage + 1})" ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                <span class="sr-only">Next</span>
                <i class="fas fa-chevron-right h-5 w-5"></i>
            </button>`;

        paginationContainer.innerHTML = `<nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">${paginationHtml}</nav>`;
    }

    renderTable(subjects) {
        const tableBody = document.getElementById('subjects-tbody');
        tableBody.innerHTML = '';

        if (subjects.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No subjects found.</td></tr>';
            return;
        }

        subjects.forEach(subject => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${subject.subjectId}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${subject.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${subject.description}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${subject.studyDuration}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="/admin/subjects/${subject.subjectId}" class="text-blue-600 hover:text-blue-900" title="Details">
                        <i class="fas fa-eye"></i>
                    </a>
                    <button class="text-indigo-600 hover:text-indigo-900 ml-4 edit-btn" title="Edit">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900 ml-4 delete-btn" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            row.querySelector('.edit-btn').addEventListener('click', () => this.showModal(subject));
            row.querySelector('.delete-btn').addEventListener('click', () => this.deleteSubject(subject.subjectId, subject.name));
            tableBody.appendChild(row);
        });
    }
}

let subjectsManager;
document.addEventListener('userInfoLoaded', () => {
    subjectsManager = new SubjectsManager();
});
