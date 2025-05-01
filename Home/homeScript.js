function toggleProfile() {
  const box = document.getElementById('profileActions');
  box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
}

async function fetchMenuItems() {
  const response = await fetch('http://localhost:5000/get_menu_items');
  const data = await response.json();
  const container = document.getElementById('menuContainer');

  if (data.status === 'success') {
      data.menu_items.slice(0, 3).forEach(item => {  // only first 4 items
          const card = document.createElement('div');
          card.className = 'image-box';
          card.innerHTML = `
              <img src="data:image/png;base64,${item.Image}" alt="${item.ItemName}" />
              <div class="overlay">
                  <div class="detail">Price: $${item.Price}</div>
              </div>
          `;
          container.appendChild(card);
      });
  }
};

// Event Handlers
const handlers = {
  toggleProfile: (e) => {
    e.stopPropagation();
    elements.profileActions.classList.toggle('active');
  },
  handleLogout: () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userId');
    window.location.href = "../AuthFiles/Login.html";
  },
  handleReserveTable: (tableId) => {
    if (!state.currentUser) {
      alert('Please log in to reserve a table.');
      window.location.href = '../AuthFiles/Login.html';
      return;
    }
    window.location.href = `../Reservations/Reservation.html?tableId=${tableId}`;
  },
  handleAddToCart: (itemId) => {
    if (!state.currentUser) {
      alert('Please log in to add items to cart.');
      window.location.href = '../AuthFiles/Login.html';
      return;
    }
    // Add to cart logic here
    console.log('Added item to cart:', itemId);
  },
  submitFeedback: async (e) => {
    e.preventDefault(); // Prevent default form submission
    
    const feedbackText = elements.feedbackInput.value.trim();
    
    if (!feedbackText) {
      alert('Please write your feedback before submitting.');
      return;
    }
    
    if (!state.currentUser) {
      alert('Please log in to submit feedback.');
      window.location.href = '../AuthFiles/Login.html';
      return;
    }
    
    try {
      elements.sendBtn.disabled = true;
      elements.sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      
      const response = await apiService.submitFeedback(
        state.currentUser.id, 
        feedbackText
      );
      
      if (response.status === 'success') {
        elements.feedbackInput.value = '';
        await loadFeedbacks();
        showToast('Feedback submitted successfully!');
      } else {
        throw new Error(response.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast(error.message, 'error');
    } finally {
      elements.sendBtn.disabled = false;
      elements.sendBtn.innerHTML = 'Send <i class="fas fa-paper-plane"></i>';
    }
  }
};document.addEventListener('click', (e) => {
  if (!e.target.closest('.profile') && elements.profileActions.classList.contains('active')) {
    elements.profileActions.classList.remove('active');
  }
});

// Toast Notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Data Loading Functions
async function loadMenuItems() {
  utils.showLoader(elements.menuContainer);
  
  const response = await apiService.fetchMenuItems();
  
  if (response.status === 'success') {
    elements.menuContainer.innerHTML = '';
    response.menu_items.slice(0, 4).forEach(item => {
      const card = components.createMenuCard(item);
      elements.menuContainer.appendChild(card);
    });
    
    // Add event listeners to "Add to cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        handlers.handleAddToCart(e.currentTarget.dataset.id);
      });
    });
  } else {
    utils.showError(elements.menuContainer, response.message);
  }
}

async function loadTables() {
  utils.showLoader(elements.tablesContainer);
  
  const response = await apiService.fetchTables();
  
  if (response.status === 'success') {
    elements.tablesContainer.innerHTML = '';
    response.tables.slice(0, 3).forEach(table => {
      const card = components.createTableCard(table);
      elements.tablesContainer.appendChild(card);
    });
    
    // Add event listeners to reserve buttons
    document.querySelectorAll('.reserve-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        handlers.handleReserveTable(e.currentTarget.dataset.id);
      });
    });
  } else {
    utils.showError(elements.tablesContainer, response.message);
  }
}

async function loadFeedbacks() {
  utils.showLoader(elements.feedbacksContainer);
  
  const response = await apiService.fetchFeedbacks();
  
  if (response.status === 'success') {
    elements.feedbacksContainer.innerHTML = '';
    response.feedbacks.forEach(feedback => {
      const item = components.createFeedbackItem(feedback);
      elements.feedbacksContainer.appendChild(item);
    });
  } else {
    utils.showError(elements.feedbacksContainer, response.message);
  }
}

// Initialize App
function init() {
  // Add event listeners
  elements.sendBtn.addEventListener('click', handlers.submitFeedback);
  elements.logoutBtn.addEventListener('click', handlers.handleLogout);
  elements.profileBtn.addEventListener('click', () => {
    window.location.href = '../Profile/profile.html';
  });
  
  // Close profile dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.profile') && !e.target.closest('.profile-actions')) {
      elements.profileActions.classList.remove('active');
    }
  });
  
  // Load data
  loadMenuItems();
  loadTables();
  loadFeedbacks();
  updateProfileInfo();

  
  // Add animation to sections
  document.querySelectorAll('.section').forEach((section, index) => {
    section.style.animationDelay = `${index * 0.1}s`;
  });
}
// Start the application
document.addEventListener('DOMContentLoaded', init);

// Update user info in profile dropdown
// Update the API_BASE to match your backend URL
const API_BASE = 'http://localhost:5000';

async function updateProfileInfo() {
  try {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      document.getElementById('profileUserName').textContent = 'Guest';
      document.getElementById('profileUserEmail').textContent = '';
      return;
    }

    const resp = await fetch(`${API_BASE}/get_profile?user_id=${userId}`);
    const json = await resp.json();
    
    if (json.status === 'success') {
      document.getElementById('profileUserName').textContent = json.profile.name || 'User';
      document.getElementById('profileUserEmail').textContent = json.profile.email || '';
    } else {
      document.getElementById('profileUserName').textContent = 'User';
      document.getElementById('profileUserEmail').textContent = '';
      console.error('Failed to fetch profile:', json.message);
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    document.getElementById('profileUserName').textContent = 'User';
    document.getElementById('profileUserEmail').textContent = '';
  }
}
// Enhanced toggle function
function toggleProfile() {
  const profileActions = document.getElementById('profileActions');
  profileActions.classList.toggle('active');
  
  // Close when clicking outside
  if (profileActions.classList.contains('active')) {
    document.addEventListener('click', closeProfileOnClickOutside);
  } else {
    document.removeEventListener('click', closeProfileOnClickOutside);
  }
}

function closeProfileOnClickOutside(e) {
  if (!e.target.closest('.profile') && !e.target.closest('.profile-actions')) {
    document.getElementById('profileActions').classList.remove('active');
    document.removeEventListener('click', closeProfileOnClickOutside);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  updateProfileInfo();
  
  // Profile button event listeners
  document.getElementById('prof').addEventListener('click', () => {
    window.location.href = '../Profile/profile.html';
  });
  
  document.getElementById('logOut').addEventListener('click', () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userId');
    window.location.href = "../AuthFiles/Login.html";
  });
});
