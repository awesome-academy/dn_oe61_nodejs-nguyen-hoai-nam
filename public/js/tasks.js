class TasksManager {
    constructor() {
        this.tasks = [];
        this.currentPage = 1;
        this.pageSize = 5;
        this.totalPages = 1;
        this.currentTaskId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTasks().then(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const action = urlParams.get('action');
            const taskId = urlParams.get('taskId');

            if (action === 'edit' && taskId) {
                this.openModal(parseInt(taskId, 10));
            }
        });
    }

    bindEvents() {
        document.getElementById('add-task-btn').addEventListener('click', () => this.openModal());
        document.getElementById('modal-close-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('cancel-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });
    }

    async loadTasks(page = 1) {
        this.currentPage = page;
        const lang = getCurrentLanguage();
        try {
                        const response = await fetch(`/task?page=${this.currentPage}&pageSize=${this.pageSize}&lang=${lang}`);
            const result = await response.json();

            if (result.success && result.data) {
                const tasks = result.data.items || [];
                const meta = result.data.meta || {};
                this.totalPages = meta.totalPages || 1;

                this.renderTasks(tasks);
                this.renderPagination();
                this.updateStats(meta);
            } else {
                showToast(result.message || 'Failed to load tasks.', 'error');
            }
        } catch (error) {
            showToast('An unexpected error occurred.', 'error');
        }
    }

    renderTasks(tasks) {
        const tableBody = document.getElementById('tasks-table-body');
        tableBody.innerHTML = '';

        if (tasks.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">No tasks found.</td></tr>';
            return;
        }

        tasks.forEach(task => {
            const row = `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">${task.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap"><a href="${task.fileUrl}" target="_blank" class="text-indigo-600 hover:text-indigo-900">View File</a></td>
                    <td class="px-6 py-4 whitespace-nowrap">${new Date(task.createdAt).toLocaleDateString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a href="/admin/tasks/${task.taskId}" class="p-2 text-gray-600 hover:text-gray-800" title="View Details"><i class="fas fa-eye"></i></a>
                        <button onclick="tasksManager.openModal(${task.taskId})" class="p-2 text-gray-600 hover:text-gray-800" title="Edit"><i class="fas fa-edit"></i></button>
                        <button onclick="tasksManager.deleteTask(${task.taskId})" class="p-2 text-gray-600 hover:text-gray-800" title="Delete"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
            tableBody.innerHTML += row;
        });
    }

    renderPagination() {
        const paginationContainer = document.getElementById('pagination-container');
        if (!paginationContainer) return;

        let paginationHtml = '';
        if (this.totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        paginationHtml += `
            <button 
                class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${this.currentPage === 1 ? 'cursor-not-allowed' : ''}" 
                onclick="tasksManager.loadTasks(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}>
                <span class="sr-only">Previous</span>
                <i class="fas fa-chevron-left h-5 w-5"></i>
            </button>`;

        for (let i = 1; i <= this.totalPages; i++) {
            paginationHtml += `
                <button 
                    class="relative inline-flex items-center px-4 py-2 text-sm font-semibold ${i === this.currentPage ? 'bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}" 
                    onclick="tasksManager.loadTasks(${i})">${i}
                </button>`;
        }

        paginationHtml += `
            <button 
                class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${this.currentPage === this.totalPages ? 'cursor-not-allowed' : ''}" 
                onclick="tasksManager.loadTasks(${this.currentPage + 1})" ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                <span class="sr-only">Next</span>
                <i class="fas fa-chevron-right h-5 w-5"></i>
            </button>`;

        paginationContainer.innerHTML = paginationHtml;
    }

    updateStats(meta) {
        document.getElementById('total-tasks').textContent = meta.totalItems || 0;
        // You may need to adjust these stats based on your API response
        document.getElementById('completed-tasks').textContent = 0;
        document.getElementById('pending-tasks').textContent = meta.totalItems || 0;
    }

    async loadSubjects(selectedSubjectId = null) {
        try {
            const lang = document.documentElement.lang || 'en';
            const response = await fetch(`/subject?page=1&pageSize=1000&lang=${lang}`);
            const result = await response.json();

            if (result.success && Array.isArray(result.data.items)) {
                const select = document.getElementById('task-subject');
                select.innerHTML = '<option value="">Select a subject</option>';
                result.data.items.forEach(subject => {
                    const option = document.createElement('option');
                    option.value = subject.subjectId;
                    option.textContent = subject.name;
                    if (selectedSubjectId && subject.subjectId === selectedSubjectId) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
            } else {
                console.error('Failed to load subjects:', result.message);
            }
        } catch (error) {
            console.error('Error loading subjects:', error);
        }
    }

    async openModal(taskId = null) {
        this.currentTaskId = taskId;
        const modal = document.getElementById('task-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('task-form');
        form.reset();

        if (taskId) {
            modalTitle.textContent = 'Edit Task';
            const lang = getCurrentLanguage();
            try {
                const response = await fetch(`/task/${taskId}?lang=${lang}`);
                const result = await response.json();
                if (result.success && result.data) {
                    const task = result.data;
                    document.getElementById('task-id').value = task.taskId;
                    document.getElementById('task-name').value = task.name;
                    document.getElementById('task-file-url').value = task.fileUrl;
                    await this.loadSubjects(task.subject.subjectId);
                } else {
                    showToast(result.message || 'Failed to load task details.', 'error');
                    this.closeModal();
                    return;
                }
            } catch (error) {
                showToast('An unexpected error occurred.', 'error');
                this.closeModal();
                return;
            }
        } else {
            modalTitle.textContent = 'Add New Task';
            await this.loadSubjects();
        }

        modal.classList.remove('hidden');
    }

    closeModal() {
        const modal = document.getElementById('task-modal');
        modal.classList.add('hidden');
    }

    async saveTask() {
        const lang = getCurrentLanguage();
        const taskId = document.getElementById('task-id').value;
        const name = document.getElementById('task-name').value;
        const fileUrl = document.getElementById('task-file-url').value;
        const subjectId = document.getElementById('task-subject').value;

        if (!subjectId) {
            showToast('Please select a subject.', 'error');
            return;
        }

        const taskData = { name, fileUrl, subjectId: parseInt(subjectId, 10) };

        const url = taskId ? `/task/${taskId}?lang=${lang}` : `/task?lang=${lang}`;
        const method = taskId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });

            const result = await response.json();

            if (result.success) {
                showToast(result.message, 'success');
                this.closeModal();
                this.loadTasks(this.currentPage);
            } else {
                showToast(result.message || 'Failed to save task.', 'error');
            }
        } catch (error) {
            showToast('An unexpected error occurred.', 'error');
        }
    }

    deleteTask(taskId) {
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
                    const response = await fetch(`/task/${taskId}?lang=${lang}`, {
                        method: 'DELETE',
                    });

                    const apiResult = await response.json();

                    if (apiResult.success) {
                        showToast(apiResult.message, 'success');
                        this.loadTasks(this.currentPage);
                    } else {
                        showToast(apiResult.message || 'Failed to delete task.', 'error');
                    }
                } catch (error) {
                    showToast('An unexpected error occurred.', 'error');
                }
            }
        });
    }
}

let tasksManager;
document.addEventListener('userInfoLoaded', () => {
    tasksManager = new TasksManager();
});
