const API_BASE = 'http://localhost:5000';

window.onload = async () => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    return window.location.href = '../AuthFiles/Login.html';
  }
  document.getElementById('userId').value = userId;

  // fetch profile
  const resp = await fetch(`${API_BASE}/get_profile?user_id=${userId}`);
  const json = await resp.json();
  if (json.status === 'success') {
    document.getElementById('email').value = json.profile.email;
    document.getElementById('phone').value = json.profile.phone;
  } else {
    alert(json.message);
  }
};

// document.getElementById('profileForm').addEventListener('submit', async e => {
//   e.preventDefault();

//   const formData = new FormData();
//   formData.append('user_id',    document.getElementById('userId').value);
//   formData.append('email',      document.getElementById('email').value);
//   formData.append('phone',      document.getElementById('phone').value);
//   formData.append('oldPassword',document.getElementById('oldPassword').value);
//   formData.append('newPassword',document.getElementById('newPassword').value);

//   const resp = await fetch(`${API_BASE}/update_profile`, {
//     method: 'POST',
//     body: formData
//   });
//   const json = await resp.json();

//   if (json.status === 'success') {
//     const msg = document.createElement('div');
//     msg.innerText = 'Changes saved!';
//     Object.assign(msg.style, {
//       position: 'fixed',
//       top: '50%',
//       left: '50%',
//       transform: 'translate(-50%, -50%)',
//       backgroundColor: 'rgba(0,123,255,0.9)',
//       color: '#fff',
//       padding: '20px 40px',
//       borderRadius: '8px',
//       fontSize: '20px',
//       textAlign: 'center',
//       zIndex: '9999'
//     });
//     document.body.appendChild(msg);

//     setTimeout(() => window.location.href = 'ALASAYA.html', 1000);
//   } else {
//     alert(json.message);
//   }
// });
