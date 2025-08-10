document.addEventListener('DOMContentLoaded', () => {
    const courseId = (() => {
        const parts = window.location.pathname.split('/');
        return parts[parts.length - 1];
    })();

    if (!courseId) return;

    const assignBtn = document.getElementById('assign-supervisor-btn');

    function isAdmin() {
        if (!window.currentUser || !window.currentUser.data) return false;
        const d = window.currentUser.data;
        if (typeof d.role === 'string') return d.role.toUpperCase() === 'ADMIN';
        if (Array.isArray(d.roles)) return d.roles.map(r => r.toUpperCase()).includes('ADMIN');
        return false;
    }

    function handleAssignBtnVisibility() {
        if (assignBtn) {
            if (isAdmin()) {
                assignBtn.classList.remove('hidden');
            } else {
                assignBtn.classList.add('hidden');
            }
        }
    }

    // determine visibility now (in case userInfo already loaded)
    handleAssignBtnVisibility();
    // also update when user info is asynchronously loaded
    document.addEventListener('userInfoLoaded', handleAssignBtnVisibility);
    if (assignBtn) {
        assignBtn.addEventListener('click', () => showAssignSupervisorModal(courseId));
    }

    async function showAssignSupervisorModal(courseId) {
        const lang = getCurrentLanguage ? getCurrentLanguage() : 'en';
        try {
            const response = await fetch(`/supervisor?lang=${lang}`);
            const result = await response.json();
            if (!result.success) {
                showToast(result.message || 'Failed to load supervisors', 'error');
                return;
            }
            const supervisors = result.data;
            if (!Array.isArray(supervisors) || supervisors.length === 0) {
                showToast('No supervisors available.', 'warning');
                return;
            }

            const optionsHtml = supervisors.map(s => `
                <label class="flex items-center p-2 border rounded-lg hover:bg-indigo-50 cursor-pointer">
                    <input type="radio" name="supervisorRadio" value="${s.userId}" class="form-radio h-4 w-4 text-indigo-600">
                    <span class="ml-3 font-medium text-gray-700">${s.userName}</span>
                    <span class="ml-auto text-gray-500 text-sm">${s.email}</span>
                </label>`).join('');
            const { value: supervisorId } = await Swal.fire({
                title: 'Assign Supervisor',
                width: '32rem',
                customClass: {
                    popup: 'p-6 rounded-lg',
                    confirmButton: 'px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700',
                    cancelButton: 'px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300'
                },
                html: `<div id="supervisor-list" class="space-y-3 max-h-60 overflow-y-auto">${optionsHtml}</div>`,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Assign',
                preConfirm: () => {
                    const checked = document.querySelector('input[name="supervisorRadio"]:checked');
                    return checked ? parseInt(checked.value, 10) : null;
                }
            });

            if (supervisorId) {
                await performAssignSupervisor(courseId, supervisorId, lang);
            }
        } catch (error) {
            console.error(error);
            showToast('Unexpected error when loading supervisors', 'error');
        }
    }

    async function performAssignSupervisor(courseId, supervisorId, lang) {
        try {
            const response = await fetch(`/course/${courseId}/supervisor?lang=${lang}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ supervisorId: Number(supervisorId) })
            });
            const result = await response.json();
            if (result.success) {
                showToast(result.message, 'success');
                setTimeout(() => location.reload(), 1500);
            } else {
                showToast(result.message || 'Failed to assign supervisor', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Unexpected error occurred.', 'error');
        }
    }
});
