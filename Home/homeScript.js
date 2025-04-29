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
}

function gotoTables() {
  window.location.href = '../Table/Tables.html';
}

function gotoMenu() {
  window.location.href = '../Menu/Menu.html';
}

async function fetchTables() {
  const response = await fetch('http://localhost:5000/get_tables');
  const data = await response.json();
  const container = document.getElementById('tablesContainer');

  if (data.status === 'success') {
    data.tables.slice(0, 2).forEach(table => {
      const card = document.createElement('div');
      card.className = 'table-card';

      card.innerHTML = `
          <img src="data:image/png;base64,${table.Image || ''}" alt="Table ${table.TableID}" />
          <div class="overlay">
              <div class="detail">Location: ${table.Location}</div>
              <div class="detail">Seats: ${table.NumberOfSeats}</div>
              <button class="reserve-btn">Reserve</button>
          </div>
      `;

      // Select the reserve button INSIDE the card
      const reserveButton = card.querySelector('.reserve-btn');
      reserveButton.addEventListener('click', () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          alert('Please log in first.');
          return window.location.href = '../AuthFiles/Login.html';
        }
        // redirect to the reserve page with tableId as query
        window.location.href = `../Reservations/Reservation.html?tableId=${table.TableID}`;
      });

      container.appendChild(card);
    });
  }
}


async function fetchFeedbacks() {
  const response = await fetch('http://localhost:5000/get_feedbacks');
  const data = await response.json();
  const container = document.getElementById('feedbacksContainer');

  if (data.status === 'success') {
      data.feedbacks.forEach(feedback => {
          const feedbackBox = document.createElement('div');
          feedbackBox.className = 'feedback-box';
          feedbackBox.innerHTML = `
              <i class="fas fa-user-circle"></i>
              <div class="feedback-text">${feedback.feedback}</div>
          `;
          container.appendChild(feedbackBox);
      });
  }
}

const logoutButton = document.getElementById('logOut');
logoutButton.addEventListener('click', function () {
  // Clear the userId from localStorage
  localStorage.removeItem('userId');
  // Redirect to login page
  window.location.href = "../AuthFiles/Login.html";
});
// Call functions when page loads
window.onload = () => {
  fetchMenuItems();
  fetchTables();
  fetchFeedbacks();
};
document.getElementById('prof').addEventListener(
  'click',
  () =>{window.location.href = '../Profile/profile.html'}
);