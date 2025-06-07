// DOM Elements
const elements = {
  menuContainer: document.getElementById('menuContainer'),
  tablesContainer: document.getElementById('tablesContainer'),
  feedbacksContainer: document.getElementById('feedbacksContainer'),
  profileActions: document.getElementById('profileActions'),
  sendBtn: document.querySelector('.send-btn'),
  feedbackInput: document.querySelector('.input-container input'),
  logoutBtn: document.getElementById('logOut'),
  profileBtn: document.getElementById('prof')
};

// State Management
const state = {
  isLoading: false,
  currentUser: JSON.parse(localStorage.getItem('userId')) || null
};


    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('loader').style.display = 'none';
        document.querySelector('.container').style.display = 'block';
      }, 
    );

  

// Utility Functions
const utils = {
  showLoader: () => {
    document.getElementById('loader').style.display = 'flex';
    document.querySelector('.container').style.display = 'none';
  },
  hideLoader: () => {
    document.getElementById('loader').style.display = 'none';
    document.querySelector('.container').style.display = 'block';
  },
  showError: (element, message) => {
    element.innerHTML = `<div class="error-message">${message}</div>`;
  },
  animateElement: (element, animation) => {
    element.style.animation = `${animation} 0.6s ease forwards`;
  },
  formatPrice: (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
};

// API Service
const apiService = {
  fetchMenuItems: async () => {
    try {
      const response = await fetch('https://ample-miracle-production.up.railway.app/get_menu_items');
      return await response.json();
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return { status: 'error', message: 'Failed to fetch menu items' };
    }
  },
  fetchTables: async () => {
    try {
      const response = await fetch('https://ample-miracle-production.up.railway.app/get_tables');
      return await response.json();
    } catch (error) {
      console.error('Error fetching tables:', error);
      return { status: 'error', message: 'Failed to fetch tables' };
    }
  },
  fetchFeedbacks: async () => {
    try {
      const response = await fetch('https://ample-miracle-production.up.railway.app/get_feedbacks');
      return await response.json();
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      return { status: 'error', message: 'Failed to fetch feedbacks' };
    }
  },
  submitFeedback: async (userId, feedbackText) => {
    try {
      console.log('Submitting feedback with:', { userId, feedbackText });
      
      const response = await fetch('https://ample-miracle-production.up.railway.app/add_feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          feedback: feedbackText
        })
      });
      
      const data = await response.json();
      console.log('Feedback submission response:', data);
      return data;
      
    } catch (error) {
      console.error('API Error:', error);
      return { status: 'error', message: 'Failed to submit feedback' };
    }
  }
};

// UI Components
const components = {
  createMenuCard: (item) => {
    const card = document.createElement('div');
    card.className = 'menu-card animate-slide-up';
    card.innerHTML = `
      <div class="card-badge">🔥 Popular</div>
      <div class="image-container">
        <img src="data:image/png;base64,${item.Image}" 
             alt="${item.ItemName}" 
             loading="lazy"
             onerror="this.src='assets/fallback-image.png'" />
      </div>
      <div class="menu-content">
        <h3 class="menu-title">${item.ItemName}</h3>
        <div class="menu-meta">
          <span class="menu-price">${utils.formatPrice(item.Price)}</span>
        </div>
      </div>
    `;
    return card;
  },
  createTableCard: (table) => {
    const card = document.createElement('div');
    card.className = 'table-card animate-slide-up';
    card.innerHTML = `
      <div class="table-image-container">
        <img src="data:image/png;base64,${table.Image || ''}" alt="Table ${table.TableID}" loading="lazy" />
      </div>
      <div class="table-overlay">
        <h3>Table ${table.TableID}</h3>
        <div class="table-details">
          <span><i class="fas fa-map-marker-alt"></i> ${table.Location}</span>
          <span><i class="fas fa-chair"></i> ${table.NumberOfSeats} seats</span>
        </div>
        <button class="reserve-btn see-all" data-id="${table.TableID}">
          Reserve Now <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    `;
    return card;
  },
  createFeedbackItem: (feedback) => {
    const item = document.createElement('div');
    item.className = 'feedback-item animate-slide-up';
    item.innerHTML = `
      <div class="feedback-header">
        <div class="user-avatar">
          <i class="fas fa-user-circle" style="color: white;"></i>
        </div>
        <div class="user-info">
          <h4 style="color: white;">${feedback.UserEmail}</h4>
          <div class="rating">
            ${Array(5).fill().map((_, i) => 
              `<i class="fas fa-star ${i < (feedback.rating || 4) ? 'active' : ''}" style="color: gold;"></i>`
            ).join('')}
          </div>
        </div>
      </div>
      <div class="feedback-content" style="color: white;">${feedback.feedback}</div>
    `;
    return item;
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
    window.location.href = "AuthFiles/Login.html";
  },
  handleReserveTable: (tableId) => {
    if (!state.currentUser) {
      alert('Please log in to reserve a table.');
      window.location.href = 'AuthFiles/Login.html';
      return;
    }
    window.location.href = `Reservations/Reservation.html?tableId=${tableId}`;
  },
  handleAddToCart: (itemId) => {
    if (!state.currentUser) {
      alert('Please log in to add items to cart.');
      window.location.href = 'AuthFiles/Login.html';
      return;
    }
    // Add to cart logic here
    console.log('Added item to cart:', itemId);
  },
  submitFeedback: async (e) => {
    e.preventDefault(); // This should be at the very top
    
    const feedbackText = elements.feedbackInput.value.trim();
    
    if (!feedbackText) {
      showToast('Please write your feedback before submitting.', 'error');
      return;
    }
    
    if (!state.currentUser) {
      showToast('Please log in to submit feedback.', 'error');
      window.location.href = 'AuthFiles/Login.html';
      return;
    }
    
    try {
      // Disable button during submission
      elements.sendBtn.disabled = true;
      elements.sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      
      const response = await apiService.submitFeedback(
        state.currentUser, // Changed from state.currentUser.id
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
      console.error('Feedback submission error:', error);
      showToast(error.message, 'error');
    } finally {
      elements.sendBtn.disabled = false;
      elements.sendBtn.innerHTML = 'Send <i class="fas fa-paper-plane"></i>';
    }
  }
};

document.addEventListener('click', (e) => {
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

async function loadAllData() {
  utils.showLoader();
  
  try {
    // Load all data in parallel
    await Promise.all([
      loadMenuItems(),
      loadTables(),
      loadFeedbacks()
    ]);
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    utils.hideLoader();
  }
}
// Initialize App
function init() {
  // Add event listeners
  elements.sendBtn.addEventListener('click', handlers.submitFeedback);
  elements.logoutBtn.addEventListener('click', handlers.handleLogout);
  elements.profileBtn.addEventListener('click', () => {
    window.location.href = 'Profile/profile.html';
  });
  
  // Close profile dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.profile') && !e.target.closest('.profile-actions')) {
      elements.profileActions.classList.remove('active');
    }
  });
  
  // Load data
  loadAllData();
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
const API_BASE = 'https://ample-miracle-production.up.railway.app';

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
    window.location.href = 'Profile/profile.html';
  });
  
  document.getElementById('logOut').addEventListener('click', () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userId');
    window.location.href = "AuthFiles/Login.html";
  });
});
