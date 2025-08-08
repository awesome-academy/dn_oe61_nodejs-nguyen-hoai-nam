const socket = io();
      const form = document.getElementById('chat-form');
      const messageInput = document.getElementById('message');
      const chatMessages = document.getElementById('chat-messages');

      // Auto-resize textarea
      messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
      });

      let currentRoom = null;
      let currentUserId = null;

      // Save chat state to localStorage
      function saveChatState() {
        if (currentRoom) {
          localStorage.setItem('chatRoom', currentRoom);
          localStorage.setItem('chatRoomName', document.getElementById('course-name').textContent);
        }
      }

      // Load chat state from localStorage
      function loadChatState() {
        const savedRoom = localStorage.getItem('chatRoom');
        const savedRoomName = localStorage.getItem('chatRoomName');
        return { room: savedRoom, roomName: savedRoomName };
      }

      // Clear chat state from localStorage
      function clearChatState() {
        localStorage.removeItem('chatRoom');
        localStorage.removeItem('chatRoomName');
      }

      // Get user info from server
      async function getUserInfo() {
        try {
          const response = await fetch('/auth/me', {
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          
          if (response.status === 200) {
            const result = await response.json();
            
            if (result.success && result.data) {
              const user = result.data;
              currentUserId = user.id;
              updateUserInfo(user);
              loadUserCourses();
            }
          }
        } catch (error) {
          console.error('Error getting user info:', error);
        }
      }

      // Update user info in UI
      function updateUserInfo(user) {
        const selectors = [
          '.sidebar .flex-1 p.text-sm.font-semibold',
          '.sidebar .flex-1 p:first-child',
          '.sidebar p.text-sm.font-semibold',
          '.user-avatar + div p:first-child'
        ];
        
        let userNameElement = null;
        for (const selector of selectors) {
          userNameElement = document.querySelector(selector);
          if (userNameElement) {
            break;
          }
        }
        
        if (userNameElement) {
          userNameElement.textContent = user.userName;
        }
      }

      // Load user's courses
      async function loadUserCourses() {
        try {
          const response = await fetch('/course/my_courses', {
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          
          if (response.status === 200) {
            const result = await response.json();
            
            if (result.success && result.data && Array.isArray(result.data)) {
              populateCourseSelector(result.data);
            } else if (Array.isArray(result)) {
              populateCourseSelector(result);
            }
          }
        } catch (error) {
          console.error('Error loading courses:', error);
        }
      }

      // Populate course selector
      function populateCourseSelector(courses) {
        const selector = document.getElementById('course-selector');
        if (!selector) {
          return;
        }
        
        selector.innerHTML = '<option value="">Select Course</option>';
        
        courses.forEach(course => {
          const option = document.createElement('option');
          option.value = course.courseId;
          option.textContent = course.name;
          selector.appendChild(option);
        });

        // Auto-restore chat state after courses are loaded
        restoreChatState();
      }

      // Restore chat state from localStorage
      async function restoreChatState() {
        const chatState = loadChatState();
        if (!chatState.room || !currentUserId) return;

        const selector = document.getElementById('course-selector');
        const joinBtn = document.getElementById('join-room-btn');
        const courseName = document.getElementById('course-name');
        const courseStatus = document.getElementById('course-status');

        // Check if the saved course still exists in user's courses
        const courseExists = Array.from(selector.options).some(option => 
          option.value === chatState.room
        );

        if (courseExists) {
          // Set the selector to the saved course
          selector.value = chatState.room;
          currentRoom = chatState.room;
          
          // Update UI to show the saved course
          courseName.textContent = chatState.roomName || 'Restored Course';
          courseStatus.textContent = 'Reconnecting...';
          courseStatus.className = 'text-sm text-yellow-600';
          
          // Auto-join the room
          joinBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i><span>Reconnecting...</span>';
          joinBtn.className = 'px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700';
          joinBtn.disabled = true;

          // Join the room
          socket.emit('join', { courseId: parseInt(chatState.room), userId: currentUserId });
        } else {
          // Clear invalid chat state
          clearChatState();
        }
      }

      // Handle course selection
      document.getElementById('course-selector').addEventListener('change', function() {
        const courseId = this.value;
        const joinBtn = document.getElementById('join-room-btn');
        const courseName = document.getElementById('course-name');
        const courseStatus = document.getElementById('course-status');
        
        if (courseId) {
          joinBtn.disabled = false;
          courseName.textContent = this.options[this.selectedIndex].text;
          courseStatus.textContent = 'Ready to join';
        } else {
          joinBtn.disabled = true;
          courseName.textContent = 'Select Course';
          courseStatus.textContent = 'Choose a course to start chatting';
        }
      });

      // Handle join room
      document.getElementById('join-room-btn').addEventListener('click', function() {
        const courseId = document.getElementById('course-selector').value;
        if (!courseId || !currentUserId) return;

        currentRoom = courseId;
        socket.emit('join', { courseId: parseInt(courseId), userId: currentUserId });
        
        this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i><span>Joining...</span>';
        this.disabled = true;
      });

      // Handle form submission
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        const content = messageInput.value.trim();
        if (!content || !currentRoom || !currentUserId) return;

        socket.emit('message', { 
          courseId: parseInt(currentRoom), 
          senderId: currentUserId, 
          content 
        });
        messageInput.value = '';
        messageInput.style.height = 'auto';
      });

      // Handle incoming messages
      socket.on('message', (msg) => {
        displayMessage(msg, true);
      });

      // Handle join success
      socket.on('joined', (data) => {
        const joinBtn = document.getElementById('join-room-btn');
        const courseStatus = document.getElementById('course-status');
        
        joinBtn.innerHTML = '<i class="fas fa-check mr-2"></i><span>Joined</span>';
        joinBtn.className = 'px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700';
        courseStatus.textContent = 'Connected to chat room';
        courseStatus.className = 'text-sm text-green-600';
        
        // Save chat state when successfully joined
        saveChatState();
        
        // Load existing messages
        loadMessages();
      });

      // Handle errors
      socket.on('error', (data) => {
        const joinBtn = document.getElementById('join-room-btn');
        const courseStatus = document.getElementById('course-status');
        
        joinBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i><span>Join Room</span>';
        joinBtn.className = 'px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed';
        joinBtn.disabled = false;
        courseStatus.textContent = data.message || 'Error joining room';
        courseStatus.className = 'text-sm text-red-600';
        
        // Clear chat state on error
        clearChatState();
      });

      // Load existing messages
      async function loadMessages() {
        if (!currentRoom || !currentUserId) return;
        
        try {
          const response = await fetch(`/chat/history/${currentRoom}`, {
            credentials: 'include'
          });
          
          if (response.status === 200) {
            const result = await response.json();
            if (result.success && result.data) {
              chatMessages.innerHTML = '';
              result.data.forEach(msg => {
                displayMessage(msg, false); // Không scroll từng message
              });
              // Scroll to bottom sau khi load xong
              setTimeout(() => scrollChatToBottom(false), 150);
            }
          }
        } catch (error) {
          console.error('Error loading messages:', error);
        }
      }

      // Display message function
      function displayMessage(msg, autoScroll = true) {
        const isSender = msg.sender?.userId === currentUserId;
        const currentTime = new Date(msg.createdAt).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });

        const messageDiv = document.createElement('div');
        messageDiv.className = `flex items-end space-x-3 ${isSender ? 'justify-end' : 'justify-start'}`;

        const avatarUrl = isSender
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
          : 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face';

        const senderName = isSender ? 'You' : (msg.sender?.userName || 'User');
        const bubbleClass = isSender ? 'sent' : 'received';

        messageDiv.innerHTML = `
          ${!isSender ? `<img src="${avatarUrl}" alt="${senderName}" class="w-10 h-10 rounded-full flex-shrink-0" />` : ''}
          <div class="message-bubble ${bubbleClass} p-4 max-w-xs lg:max-w-md">
            <div class="font-medium text-sm mb-1">${senderName}</div>
            <div class="text-sm leading-relaxed">${msg.content}</div>
            <div class="message-time">${currentTime}</div>
          </div>
          ${isSender ? `<img src="${avatarUrl}" alt="${senderName}" class="w-10 h-10 rounded-full flex-shrink-0" />` : ''}
        `;

        chatMessages.appendChild(messageDiv);
        // Chỉ scroll nếu autoScroll=true và user đang ở cuối
        if (autoScroll && isChatAtBottom()) {
          setTimeout(() => scrollChatToBottom(), 60);
        }
      }

      // Check authentication
      function checkAuth() {
        // Gọi API /auth/me để kiểm tra đăng nhập
        // Nếu không hợp lệ, chuyển hướng về trang login
        return fetch('/auth/me', { credentials: 'include' })
          .then(res => {
            if (res.status !== 200) {
              window.location.href = '/auth/login';
              return false;
            }
            return true;
          })
          .catch(() => {
            window.location.href = '/auth/login';
            return false;
          });
      }

      // Logout function
      function logout() {
        // Gọi API logout nếu có, hoặc chỉ chuyển hướng
        window.location.href = '/auth/login';
      }

      // Handle page unload to save state
      window.addEventListener('beforeunload', function() {
        if (currentRoom) {
          saveChatState();
        }
      });

      // Initialize
      document.addEventListener('DOMContentLoaded', function() {
        checkAuth().then((ok) => {
          if (ok) {
            getUserInfo();
            // Nếu cần, có thể gọi thêm các hàm khác ở đây
          }
        });
      });

      // Mobile sidebar toggle
      document.getElementById('sidebarToggle').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('open');
      });

      // Close sidebar when clicking outside on mobile
      document.addEventListener('click', function(e) {
        const sidebar = document.querySelector('.sidebar');
        const toggle = document.getElementById('sidebarToggle');
        
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !toggle.contains(e.target) && 
            sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
        }
      });

// Scroll to bottom with smooth behavior
function scrollChatToBottom(smooth = true) {
  if (!chatMessages) return;
  chatMessages.scrollTo({
    top: chatMessages.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto'
  });
}

// Kiểm tra user có đang ở cuối khung chat không
function isChatAtBottom() {
  if (!chatMessages) return true;
  return chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 80;
}

// Sửa lại loadMessages để scroll mượt sau khi load xong (chỉ scroll một lần)
async function loadMessages() {
  if (!currentRoom || !currentUserId) return;
  try {
    const response = await fetch(`/chat/history/${currentRoom}`, {
      credentials: 'include'
    });
    if (response.status === 200) {
      const result = await response.json();
      if (result.success && result.data) {
        chatMessages.innerHTML = '';
        result.data.forEach(msg => {
          displayMessage(msg, false); // Không scroll từng message
        });
        // Scroll to bottom sau khi load xong
        setTimeout(() => scrollChatToBottom(false), 150);
      }
    }
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

// Sửa lại displayMessage để chỉ scroll khi có tin nhắn mới nếu user đang ở cuối
function displayMessage(msg, autoScroll = true) {
  const isSender = msg.sender?.userId === currentUserId;
  const currentTime = new Date(msg.createdAt).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const messageDiv = document.createElement('div');
  messageDiv.className = `flex items-end space-x-3 ${isSender ? 'justify-end' : 'justify-start'}`;
  const avatarUrl = isSender
    ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    : 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face';
  const senderName = isSender ? 'You' : (msg.sender?.userName || 'User');
  const bubbleClass = isSender ? 'sent' : 'received';
  messageDiv.innerHTML = `
    ${!isSender ? `<img src="${avatarUrl}" alt="${senderName}" class="w-10 h-10 rounded-full flex-shrink-0" />` : ''}
    <div class="message-bubble ${bubbleClass} p-4 max-w-xs lg:max-w-md">
      <div class="font-medium text-sm mb-1">${senderName}</div>
      <div class="text-sm leading-relaxed">${msg.content}</div>
      <div class="message-time">${currentTime}</div>
    </div>
    ${isSender ? `<img src="${avatarUrl}" alt="${senderName}" class="w-10 h-10 rounded-full flex-shrink-0" />` : ''}
  `;
  chatMessages.appendChild(messageDiv);
  // Chỉ scroll nếu autoScroll=true và user đang ở cuối
  if (autoScroll && isChatAtBottom()) {
    setTimeout(() => scrollChatToBottom(), 60);
  }
}

// Khi nhận tin nhắn mới từ socket, autoScroll=true
// Khi loadMessages (lịch sử), autoScroll=false cho từng message, chỉ scroll một lần sau khi load xong
// Khi gửi tin nhắn, form submit sẽ trigger socket.on('message') nên cũng auto scroll nếu user đang ở cuối

// Nếu muốn scroll mượt khi user tự kéo, có thể thêm event listener:
chatMessages?.addEventListener('wheel', function(e) {
  // Có thể custom thêm nếu muốn, hiện tại browser đã mượt
});

// Gửi tin nhắn khi bấm Enter, xuống dòng khi Shift+Enter
messageInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit ? form.requestSubmit() : form.submit();
  }
});
