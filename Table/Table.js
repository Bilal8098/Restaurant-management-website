async function loadTables() {
    try {
      const response = await fetch('http://127.0.0.1:5000/get_tables');
      const data = await response.json();
  
      if (data.status === 'success') {
        const tablesContainer = document.getElementById('tables-container');
        const addTableDiv = document.querySelector('.add-table');
  
        data.tables.forEach(table => {
          const card = document.createElement('div');
          card.className = 'table-card';
  
          const img = document.createElement('img');
          if (table.Image) {
            img.src = `data:image/png;base64,${table.Image}`;
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => openImagePreview(img.src));
          } else {
            img.alt = 'No Image';
          }
          
  
          const cardContent = document.createElement('div');
          cardContent.className = 'table-card-content';
  
          const tableName = document.createElement('div');
          tableName.className = 'table-name';
          tableName.textContent = `Table ${table.TableID} - ${table.Location}`;
  
          const reserveButton = document.createElement('button');
          reserveButton.className = 'view-btn';
          reserveButton.textContent = 'Reserve';
  
          
          reserveButton.addEventListener('click', () => {
            const userToken = localStorage.getItem('userId');
            
            if (!userToken) {
              alert('Please log in first.');
              window.location.href = '../AuthFiles/Login.html'; 

            } else {
              window.location.href = `../Reservations/Reservation.html?tableId=${table.TableID}`;            }
          });
  
          cardContent.appendChild(tableName);
          cardContent.appendChild(reserveButton);
  
          card.appendChild(img);
          card.appendChild(cardContent);
  
          tablesContainer.insertBefore(card, addTableDiv);
        });
      } else {
        console.error('Failed to load tables:', data.message);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  }
  
  window.addEventListener('DOMContentLoaded', loadTables);
  

  // Setup modal preview
const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('preview-img');
const closeBtn = document.querySelector('.close');

function openImagePreview(src) {
  modal.style.display = 'block';
  modalImg.src = src;
  
}

closeBtn.onclick = function () {
  modal.style.display = 'none';
};

window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};
