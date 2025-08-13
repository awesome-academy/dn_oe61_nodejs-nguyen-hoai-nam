document.addEventListener('DOMContentLoaded', function () {
  let reportType = 'monthly'; // Default to monthly

  const dailyBtn = document.getElementById('daily-btn');
  const monthlyBtn = document.getElementById('monthly-btn');
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  const filterBtn = document.getElementById('filter-btn');

  let subjectChart = null;
  let taskChart = null;

  function getISODate(date) {
    return date.toISOString().split('T')[0];
  }

  function getCurrentLanguage() {
    return localStorage.getItem('language') || 'vn';
  }

  async function fetchReportData(params) {
    try {
      const lang = getCurrentLanguage();
      const response = await axios.get(`/reporting?lang=${lang}`, { params });
      if (response.data.success) {
        updateUI(response.data.data);
      } else {
        Swal.fire({
          icon: 'error',
          title: tMsg('operationFailed'),
          text: response.data.message,
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || tMsg('failedFetchReport');
      Swal.fire({
        icon: 'error',
        title: tMsg('errorOccurred'),
        text: errorMessage,
      });
    }
  }

  function updateUI(data) {
    document.getElementById('total-subjects').textContent = data.totalSubjects;
    document.getElementById('completed-subjects').textContent = data.completedSubjects;
    document.getElementById('total-tasks').textContent = data.totalTasks;
    document.getElementById('completed-tasks').textContent = data.completedTasks;

    renderSubjectProgressChart(data.completedSubjects, data.uncompletedSubjects);
    renderTaskProgressChart(data.completedTasks, data.uncompletedTasks);
  }

  function renderChart(canvasId, chartInstance, labels, data, colors) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (chartInstance) {
      chartInstance.destroy();
    }
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.background,
          hoverBackgroundColor: colors.hover
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: { display: true, position: 'bottom' },
      }
    });
  }

  function renderSubjectProgressChart(completed, uncompleted) {
    subjectChart = renderChart('subject-progress-chart', subjectChart, ['Completed', 'Uncompleted'], [completed, uncompleted], { background: ['#10B981', '#F59E0B'], hover: ['#059669', '#D97706'] });
  }

  function renderTaskProgressChart(completed, uncompleted) {
    taskChart = renderChart('task-progress-chart', taskChart, ['Completed', 'Uncompleted'], [completed, uncompleted], { background: ['#8B5CF6', '#EF4444'], hover: ['#7C3AED', '#DC2626'] });
  }

  function setActiveButton(activeBtn) {
    [dailyBtn, monthlyBtn].forEach(btn => {
      btn.classList.remove('bg-blue-600', 'text-white');
      btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    activeBtn.classList.add('bg-blue-600', 'text-white');
    activeBtn.classList.remove('bg-gray-200', 'text-gray-700');
  }

  function loadReport() {
    let startDate, endDate;
    const today = new Date();

    if (reportType === 'daily') {
      startDate = getISODate(today);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      endDate = getISODate(tomorrow);
    } else { // monthly
      startDate = getISODate(new Date(today.getFullYear(), today.getMonth(), 1));
      endDate = getISODate(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    }

    startDateInput.value = startDate;
    endDateInput.value = endDate;

    fetchReportData({ type: reportType, startDate, endDate });
  }

  dailyBtn.addEventListener('click', () => {
    reportType = 'daily';
    setActiveButton(dailyBtn);
    loadReport();
  });

  monthlyBtn.addEventListener('click', () => {
    reportType = 'monthly';
    setActiveButton(monthlyBtn);
    loadReport();
  });

  filterBtn.addEventListener('click', () => {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    if (!startDate || !endDate) {
      Swal.fire({
        icon: 'warning',
        title: tMsg('missingInfo'),
        text: tMsg('selectDatesPrompt'),
      });
      return;
    }
    fetchReportData({ type: reportType, startDate, endDate });
  });

  // Initial load for main report
  setActiveButton(monthlyBtn); // Default to monthly button
  loadReport();

  // --- SEPARATE LOGIC FOR ACTIVITY LOG ---
  const logCourseSelect = document.getElementById('log-course-select');
  const activityLogBody = document.getElementById('activity-log-body');

  const userCache = {};
  const subjectCache = {};

  async function getUserDetails(userId) {
    if (userCache[userId]) return userCache[userId];
    try {
      const lang = getCurrentLanguage();
      const response = await axios.get(`/trainee/${userId}?lang=${lang}`);
      if (response.data.success) {
        userCache[userId] = response.data.data;
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error(`Failed to fetch user ${userId}`, error);
      return null;
    }
  }

  async function getSubjectDetails(subjectId) {
    if (!subjectId) return null;
    if (subjectCache[subjectId]) return subjectCache[subjectId];
    try {
      const lang = getCurrentLanguage();
      // Assuming this is the correct endpoint for subject details
      const response = await axios.get(`/subject/${subjectId}?lang=${lang}`);
      if (response.data.success) {
        subjectCache[subjectId] = response.data.data;
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error(`Failed to fetch subject ${subjectId}`, error);
      return null;
    }
  }

  async function fetchLogCourses() {
    try {
      const lang = getCurrentLanguage();
      // Assuming the endpoint can provide a list of all courses for the dropdown
      const response = await axios.get(`/course?lang=${lang}`, { params: { page: 1, pageSize: 200 } }); 
      if (response.data.success) {
        populateLogCourseSelect(response.data.data.items);
      } else {
        Swal.fire({ icon: 'error', title: tMsg('failedLoadCourses'), text: response.data.message });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || tMsg('errorFetchingCourses');
      Swal.fire({ icon: 'error', title: tMsg('errorOccurred'), text: errorMessage });
    }
  }

  function populateLogCourseSelect(courses) {
    if (!courses) return;
    courses.forEach(course => {
      const option = document.createElement('option');
      option.value = course.id;
      option.textContent = course.name;
      logCourseSelect.appendChild(option);
    });
  }

  async function fetchActivityLogs(courseId) {
    if (!courseId) {
      activityLogBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-gray-500">${tMsg('selectCoursePrompt')}</td></tr>`;
      return;
    }
    try {
      const lang = getCurrentLanguage();
      const response = await axios.get(`/reporting/${courseId}/logs?lang=${lang}`);
      if (response.data.success) {
        renderActivityLogs(response.data.data);
      } else {
        activityLogBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-red-500">${response.data.message}</td></tr>`;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || tMsg('errorFetchingLogs');
      activityLogBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-red-500">${errorMessage}</td></tr>`;
    }
  }

  async function renderActivityLogs(logs) {
    activityLogBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-gray-500">${tMsg('loadingLogs')}</td></tr>`; // Show loading state

    if (!logs || logs.length === 0) {
      activityLogBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-gray-500">${tMsg('noLogs')}</td></tr>`;
      return;
    }

    const eventTypeMap = {
      COURSE_REGISTER: 'Course Registration',
      COURSE_FINISH: 'Course Finished',
      SUBJECT_START: 'Subject Started',
      SUBJECT_FINISH: 'Subject Finished',
      TASK_DONE: 'Task Completed',
    };

    // Fetch all details in parallel
    const promises = logs.map(log => Promise.all([
        getUserDetails(log.userId),
        getSubjectDetails(log['meta.subjectId'])
    ]));

    const results = await Promise.all(promises);

    activityLogBody.innerHTML = ''; // Clear loading state

    logs.forEach((log, index) => {
      const [user, subject] = results[index];
      
      const userName = user ? user.userName : `ID: ${log.userId}`;
      let details = '';
      if (subject) {
        details = `Subject: ${subject.name}`;
      }

      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${userName}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${eventTypeMap[log.eventType] || log.eventType}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${details}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(log.timestamp).toLocaleString()}</td>
      `;
      activityLogBody.appendChild(row);
    });
  }

  // Event listener for the new course select dropdown
  logCourseSelect.addEventListener('change', (event) => {
    const courseId = event.target.value;
    fetchActivityLogs(courseId);
  });

  // Initial load for the activity log section
  fetchLogCourses();

});
