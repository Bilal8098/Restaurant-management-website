window.addEventListener('DOMContentLoaded', () => {
  fetchMenuItems();
});

function fetchMenuItems() {
  fetch('http://localhost:5000/get_menu_items')
    .then(response => response.json())
    .then(data => {
      if (data.status === "success") {
        const menuGrid = document.getElementById('menu-grid');
        data.menu_items.forEach(item => {
          const menuItem = document.createElement('div');
          menuItem.classList.add('menu-item');

          const menuCard = document.createElement('div');
          menuCard.classList.add('menu-card');

          const menuImage = document.createElement('img');
          if (item.Image) {
            menuImage.src = `data:image/jpeg;base64,${item.Image}`;
          } else {
            menuImage.src = 'default-image.jpg'; // fallback image if no image exists
          }
          menuImage.alt = item.ItemName;

          const menuPrice = document.createElement('div');
          menuPrice.classList.add('menu-price');
          menuPrice.innerText = `${item.Price}$`;

          menuCard.appendChild(menuImage);
          menuCard.appendChild(menuPrice);
          menuItem.appendChild(menuCard);

          const menuLabel = document.createElement('div');
          menuLabel.classList.add('menu-label');
          menuLabel.innerText = item.ItemName;

          menuItem.appendChild(menuLabel);
          menuGrid.appendChild(menuItem);
        });
      } else {
        console.error('Failed to fetch menu items:', data.message);
      }
    })
    .catch(error => {
      console.error('Error fetching menu:', error);
    });
}

