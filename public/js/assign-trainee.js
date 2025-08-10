document.addEventListener('DOMContentLoaded', () => {
    const courseId = (() => {
        const parts = window.location.pathname.split('/');
        return parts[parts.length - 1];
    })();
    if (!courseId) return;

    const assignBtn = document.getElementById('assign-trainee-btn');

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

    handleAssignBtnVisibility();
    document.addEventListener('userInfoLoaded', handleAssignBtnVisibility);

    if (assignBtn) {
        assignBtn.addEventListener('click', () => showAssignTraineeModal(courseId));
    }
});

async function showAssignTraineeModal(courseId) {
    const lang = getCurrentLanguage ? getCurrentLanguage() : 'en';
    try {
        const response = await fetch(`/trainee?lang=${lang}`);
        const result = await response.json();
        if (!result.success) {
            showToast(result.message || 'Failed to load trainees', 'error');
            return;
        }
        const trainees = result.data;
        if (!Array.isArray(trainees) || trainees.length === 0) {
            showToast('No trainees available.', 'warning');
            return;
        }
        const html = `
            <div class="max-h-60 overflow-y-auto text-left">
                ${trainees.map(tr => `
                    <div class="flex items-center py-1">
                        <input type="radio" name="traineeRadio" class="mr-2" value="${tr.userId}">
                        <span>${tr.userName} (${tr.email})</span>
                    </div>`).join('')}
            </div>`;
        const { value: traineeId } = await Swal.fire({
            title: 'Select Trainee',
            html,
            width: '30rem',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Assign',
            preConfirm: () => {
                const checked = document.querySelector('input[name="traineeRadio"]:checked');
                return checked ? parseInt(checked.value, 10) : null;
            }
        });
        if (traineeId) {
            await performAssignTrainee(courseId, traineeId, lang);
        }
    } catch (err) {
        console.error(err);
        showToast('Unexpected error when loading trainees', 'error');
    }
}

async function performAssignTrainee(courseId, traineeId, lang) {
    try {
        const response = await fetch(`/course/${courseId}/trainee?lang=${lang}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: Number(traineeId) })
        });
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showToast(result.message || 'Failed to assign trainee', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Unexpected error occurred.', 'error');
    }
}
