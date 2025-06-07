  // Create floating particles
  function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      const size = Math.random() * 5 + 2;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = Math.random() * 10 + 10;
      const opacity = Math.random() * 0.5 + 0.1;
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      particle.style.opacity = opacity;
      particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite alternate`;
      
      particlesContainer.appendChild(particle);
    }
    
    // Add CSS for floating animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(10px, 10px) rotate(5deg); }
        50% { transform: translate(20px, -10px) rotate(-5deg); }
        75% { transform: translate(-10px, 15px) rotate(5deg); }
        100% { transform: translate(-20px, -5px) rotate(-5deg); }
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize particles when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    createParticles();
  });

  // Your existing JavaScript code goes here
  window.addEventListener('DOMContentLoaded', fetchMenuItems);

  // Toast notification functions
  function showToast(message, type = 'success') {
    const toast = document.getElementById("toast");
    toast.innerText = message;
  
    // Optional: Change color depending on type
    if (type === 'error') {
      toast.style.background = 'linear-gradient(to right, #e53935, #d32f2f)'; // red
    } else {
      toast.style.background = 'linear-gradient(to right, var(--primary), var(--accent))'; // default
    }
  
    // Make it visible
    toast.style.display = 'block';
  
    // Automatically hide after 3 seconds
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("loader").style.display = "none";
    document.querySelector(".scroll-wrapper").style.display = "block";
  });

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
    if (isNaN(price)) {
      showToast('Please enter a valid number', false);
      priceInput.focus();
      return;
    }
    if (price < 0) {
      showToast('Price cannot be negative', false);
      priceInput.focus();
      return;
    }

    fetch('https://ample-miracle-production.up.railway.app/update_price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
    ItemID: currentItemId,  // 🔁 renamed from `id` to `ItemID`
    Price: price            // 🔁 renamed from `price` to `Price`
  })      })
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

    fetch('https://ample-miracle-production.up.railway.app/get_menu_items')
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
          menuGrid.innerHTML = `<div class="empty-message">Error: ${data.message}</div>`;
        }
      })
      .catch(err => {
        console.error('Fetch error:', err);
        showToast('Failed to load menu. Please try again.', false);
        menuGrid.innerHTML = `<div class="empty-message">Network error: ${err.message}</div>`;
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

    fetch('https://ample-miracle-production.up.railway.app/delete_menu_item', {
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