window.addEventListener('DOMContentLoaded', () => {
    fetchMenuItems();
  });
  
  function fetchMenuItems() {
    fetch('http://localhost:5000/api/menu')  // أو الرابط بتاع الـ API
      .then(response => response.json())
      .then(data => {
        const menuGrid = document.querySelector('.menu-grid');
        data.forEach(item => {
          const menuItem = document.createElement('div');
          menuItem.classList.add('menu-item');
  
          const menuCard = document.createElement('div');
          menuCard.classList.add('menu-card');
  
          const menuImage = document.createElement('img');
          menuImage.src = item.image_url || 'default-image.jpg';  // إذا كان في صورة للمينيو
          menuImage.alt = item.name;
  
          const menuPrice = document.createElement('div');
          menuPrice.classList.add('menu-price');
          menuPrice.innerText = `${item.price}$`;
  
          menuCard.appendChild(menuImage);
          menuCard.appendChild(menuPrice);
          menuItem.appendChild(menuCard);
  
          const menuLabel = document.createElement('div');
          menuLabel.classList.add('menu-label');
          menuLabel.innerText = item.name;
  
          menuItem.appendChild(menuLabel);
          menuGrid.appendChild(menuItem);
        });
      })
      .catch(error => {
        console.error('Error fetching menu:', error);
      });
  }
  