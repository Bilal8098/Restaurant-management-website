const API_BASE = 'https://ample-miracle-production.up.railway.app';

// Password toggle functionality
const setupPasswordToggles = () => {
  const toggleOldPassword = document.getElementById('toggleOldPassword');
  const oldPassword = document.getElementById('oldPassword');
  const toggleNewPassword = document.getElementById('toggleNewPassword');
  const newPassword = document.getElementById('newPassword');

  toggleOldPassword.addEventListener('click', () => {
    const type = oldPassword.getAttribute('type') === 'password' ? 'text' : 'password';
    oldPassword.setAttribute('type', type);
    toggleOldPassword.innerHTML = type === 'password' ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
  });

  toggleNewPassword.addEventListener('click', () => {
    const type = newPassword.getAttribute('type') === 'password' ? 'text' : 'password';
    newPassword.setAttribute('type', type);
    toggleNewPassword.innerHTML = type === 'password' ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
  });
};

window.onload = async () => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    return window.location.href = '../AuthFiles/Login.html';
  }
  document.getElementById('userId').value = userId;

  // Setup password toggles
  setupPasswordToggles();

  // fetch profile
  try {
    const resp = await fetch(`${API_BASE}/get_profile?user_id=${userId}`);
    const json = await resp.json();
    
    if (json.status === 'success') {
      document.getElementById('email').value = json.profile.email;
    } else {
      showAlert('error', json.message || 'Failed to load profile data');
    }
  } catch (error) {
    showAlert('error', 'Network error. Please try again.');
  }
};

// Form submission handler (uncomment when ready)
document.getElementById('profileForm').addEventListener('submit', async e => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('user_id', document.getElementById('userId').value);
  formData.append('email', document.getElementById('email').value);
  formData.append('oldPassword', document.getElementById('oldPassword').value);
  formData.append('newPassword', document.getElementById('newPassword').value);

  try {
    const resp = await fetch(`${API_BASE}/update_profile`, {
      method: 'POST',
      body: formData
    });
    const json = await resp.json();

    if (json.status === 'success') {
      showAlert('success', 'Changes saved successfully!');
      setTimeout(() => window.location.href = 'ALASAYA.html', 1500);
    } else {
      showAlert('error', json.message || 'Failed to update profile');
    }
  } catch (error) {
    showAlert('error', 'Network error. Please try again.');
  }
});

// Improved alert/notification system
function showAlert(type, message) {
  const alertDiv = document.createElement('div');
  alertDiv.innerHTML = `
    <div class="alert-${type}">
      <i class="bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}"></i>
      ${message}
    </div>
  `;
  
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.style.opacity = '0';
    setTimeout(() => alertDiv.remove(), 300);
  }, 3000);
}