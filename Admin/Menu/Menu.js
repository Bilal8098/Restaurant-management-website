
window.addEventListener('DOMContentLoaded', fetchMenuItems);

// Toast notification functions
function showToast(message, isSuccess = true) {
  const toast = document.getElementById('toast');
  toast.style.display = 'block';
  toast.textContent = message;
  toast.style.backgroundColor = isSuccess ? '#27ae60' : '#e74c3c';
  setTimeout(() => (toast.style.display = 'none'), 3000);
}

// Modal state
let currentItemId = null;

function showModal(title, currentPrice = '') {
  const modal = document.getElementById('modalOverlay');
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalInput').value = currentPrice;
  modal.style.display = 'flex';
  document.getElementById('modalInput').focus();
}

function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
  currentItemId = null;
}

// Modal confirm handler
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modalConfirm').addEventListener('click', handleModalConfirm);
});

function handleModalConfirm() {
  const priceInput = document.getElementById('modalInput');
  const price = parseFloat(priceInput.value);
  if (isNaN(price) || price < 0) {
    showToast(!isNaN(price) ? 'Price cannot be negative' : 'Please enter a valid number', false);
    priceInput.focus();
    return;
  }

  fetch('http://localhost:5000/update_price', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: currentItemId, price })
  })
    .then(res => res.json())
    .then(data => {
      showToast(data.message, data.status === 'success');
      if (data.status === 'success') fetchMenuItems();
      closeModal();
    })
    .catch(err => {
      console.error('Update error:', err);
      showToast('Update failed. Please try again.', false);
      closeModal();
    });
}

// Fetch & render
function fetchMenuItems() {
  const menuGrid = document.getElementById('menu-grid');
  menuGrid.innerHTML = '<div class="loading-spinner">Loading menu items...</div>';

  fetch('http://localhost:5000/get_menu_items')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      console.log('get_menu_items response:', data);
      menuGrid.innerHTML = '';

      if (data.status === 'success') {
        if (!data.menu_items.length) {
          menuGrid.innerHTML = '<div class="empty-message">No menu items found.</div>';
          return;
        }

        data.menu_items.forEach(item => {
          // Inspect item shape
          console.log('Rendering item:', item);
          const card = document.createElement('div');
          card.className = 'menu-item';

          // Image + Price
          const menuCard = document.createElement('div');
          menuCard.className = 'menu-card';
          const img = document.createElement('img');
          img.src = item.Image ? `data:image/jpeg;base64,${item.Image}` : 'default-image.jpg';
          img.alt = item.ItemName;
          img.loading = 'lazy';
          menuCard.appendChild(img);

          const priceLabel = document.createElement('div');
          priceLabel.style.display = 'flex';
          priceLabel.style.justifyContent = 'center';
          priceLabel.className = 'menu-price';
          priceLabel.innerText = `$${Number(item.Price).toFixed(2)}`;
          menuCard.appendChild(priceLabel);

          // Name
          const nameLabel = document.createElement('div');
          nameLabel.className = 'menu-label';
          nameLabel.innerText = item.ItemName;

          // Actions
          const actions = document.createElement('div');
          actions.className = 'menu-actions';

          // Edit button
          const editBtn = document.createElement('button');
          editBtn.className = 'edit-btn';
          editBtn.setAttribute('data-id', item.ItemID);
          editBtn.innerHTML = '<i class="fas fa-edit"></i>Edit Price';
          editBtn.addEventListener('click', () => updateMenuItem(item.ItemID, item.Price));
          actions.appendChild(editBtn);

          // Delete button
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'delete-btn';
          deleteBtn.setAttribute('data-id', item.ItemID);
          deleteBtn.innerHTML = '<i class="fas fa-trash"></i>Delete';
          deleteBtn.addEventListener('click', () => deleteMenuItem(item.ItemID));
          actions.appendChild(deleteBtn);

          card.append(menuCard, nameLabel, actions);
          menuGrid.appendChild(card);
        });
      } else {
        showToast(`Failed to load menu: ${data.message}`, false);
        menuGrid.innerHTML = `<div class="error-message">Error: ${data.message}</div>`;
      }
    })
    .catch(err => {
      console.error('Fetch error:', err);
      showToast('Failed to load menu. Please try again.', false);
      menuGrid.innerHTML = `<div class="error-message">Network error: ${err.message}</div>`;
    });
}

function updateMenuItem(id, currentPrice) {
  currentItemId = id;
  showModal(`Update Price for Item #${id}`, currentPrice);
  console.log('✏️  updateMenuItem called for ID:', id, 'price:', currentPrice);
}

function deleteMenuItem(id) {
  if (!confirm(`Are you sure you want to delete item #${id}?`)) return;

  // Disable button feedback
  const btn = document.querySelector(`.delete-btn[data-id='${id}']`);
  if (btn) {
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Deleting...';
    btn.disabled = true;
  }

  fetch('http://localhost:5000/delete_menu_item', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      showToast(data.message, data.status === 'success');
      if (data.status === 'success') fetchMenuItems();
    })
    .catch(err => {
      console.error('Delete error:', err);
      showToast('Failed to delete item. Please try again.', false);
    })
    .finally(() => {
      if (btn) {
        btn.innerHTML = '<i class="fas fa-trash"></i>Delete';
        btn.disabled = false;
      }
    });
}

// Enter key in modal input
const modalInput = document.getElementById('modalInput');
if (modalInput) {
  modalInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') handleModalConfirm();
  });
}