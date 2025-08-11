document.addEventListener('DOMContentLoaded', () => {
    const statusBadge = {
        'COMPLETED': 'bg-green-500',
        'IN_PROGRESS': 'bg-yellow-500',
        'NOT_STARTED': 'bg-gray-400'
    };

    const buildSubjectRow = (s) => {
        const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : '---';
        const { traineeId } = getParams();
        return `
          <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              <a href="/admin/trainees/${traineeId}/subjects/${s.userSubjectId}/progress" class="text-indigo-600 hover:text-indigo-900 hover:underline">${s.subjectName}</a>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span class="${statusBadge[s.status] || 'bg-gray-500'} text-white px-2 py-1 rounded-full text-xs font-semibold">${s.status.replace('_', ' ')}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${s.completedTasks} / ${s.totalTasks}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="bg-indigo-500 h-2.5 rounded-full" style="width:${s.progress}%"></div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(s.startedAt)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(s.finishedAt)}</td>
          </tr>`;
    };

    const getParams = () => {
        const parts = window.location.pathname.split('/');
        // expecting /admin/courses/{courseId}/trainee/{traineeId}/progress
        const traineeId = parts[parts.length - 2];
        const courseId = parts[parts.length - 4];
        return { courseId, traineeId };
    };

    const populateTraineeInfo = (trainee) => {
        const el = (id) => document.getElementById(id);
        if (el('trainee-avatar')) el('trainee-avatar').src = trainee.avatar || 'https://via.placeholder.com/80';
        if (el('trainee-name')) el('trainee-name').textContent = trainee.userName || trainee.name || '---';
        if (el('trainee-email')) el('trainee-email').textContent = trainee.email || '--';
    };

    const populateCourseProgress = (data) => {
        const el = (id) => document.getElementById(id);
        if (el('course-name')) el('course-name').textContent = data.courseName ?? '';
        if (el('total-tasks')) el('total-tasks').textContent = data.totalTasks ?? 0;
        if (el('completed-tasks')) el('completed-tasks').textContent = data.completedTasks ?? 0;
        if (el('course-progress-percent')) el('course-progress-percent').textContent = data.courseProgress ?? 0;
        if (el('course-progress-bar')) el('course-progress-bar').style.width = `${data.courseProgress ?? 0}%`;

        if(el('subjects-body')) el('subjects-body').innerHTML = (data.subjects || []).map(buildSubjectRow).join('');
    };

    const fetchData = async () => {
        const { courseId, traineeId } = getParams();
        if (!courseId || !traineeId) return;

        try {
            const lang = getCurrentLanguage();
            // Fetch both progress and trainee info concurrently
            const [progressRes, traineeRes] = await Promise.all([
                fetch(`/user_subject/${courseId}/trainee/${traineeId}/progress?lang=${lang}`),
                fetch(`/user/${traineeId}?lang=${lang}`)
            ]);

            const progressResult = await progressRes.json();
            const traineeResult = await traineeRes.json();

            if (progressResult.success) {
                populateCourseProgress(progressResult.data);
            } else {
                showToast(progressResult.message || 'Failed to load progress', 'error');
            }

            if (traineeResult.success) {
                populateTraineeInfo(traineeResult.data);
            } else {
                showToast(traineeResult.message || 'Failed to load trainee info', 'error');
            }

        } catch (err) {
            console.error(err);
            showToast('Unexpected error', 'error');
        }
    };

    fetchData();
});
