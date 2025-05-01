// Table.js
async function loadTables() {
  try {
      const loadingSpinner = document.getElementById('loading-spinner');
      const tablesContainer = document.getElementById('tables-container');
      
      // Show loading state
      loadingSpinner.style.display = 'block';
      tablesContainer.innerHTML = '<div class="table-card skeleton"></div><div class="table-card skeleton"></div>';

      const response = await fetch('http://127.0.0.1:5000/get_tables');
      
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
    
    document.addEventListener('DOMContentLoaded', () => {
      
        document.getElementById("loader").style.display = "none";
        document.querySelector(".container").style.display = "block";
      },  
    );

      const data = await response.json();
      loadingSpinner.style.display = 'none';

      if (data.status === 'success') {
          tablesContainer.innerHTML = '';

          if (data.tables.length === 0) {
              tablesContainer.innerHTML = `
                  <div class="empty-state">
                      <img src="../../assets/empty-tables.svg" alt="No tables">
                      <p>No tables found. Add one to get started!</p>
                  </div>
              `;
              return;
          }

          data.tables.forEach(table => {
              const card = document.createElement('div');
              card.className = 'table-card';
              card.innerHTML = `
                  <div class="card-glare"></div>
                  <img src="${table.Image ? `data:image/png;base64,${table.Image}` : '../../assets/table-placeholder.svg'}">
                  <div class="table-card-content">
                      <div class="table-name">Table ${table.TableID} - ${table.Location}</div>
                      <div class="card-buttons">
                          <button class="delete-btn">Delete</button>
                      </div>
                  </div>
              `;

              const deleteBtn = card.querySelector('.delete-btn');
              deleteBtn.addEventListener('click', () => showDeleteModal(card, table.TableID));

              const img = card.querySelector('img');
              if (table.Image) {
                  img.addEventListener('click', () => openImagePreview(img.src));
              }

              tablesContainer.appendChild(card);
          });
      } else {
          showToast(data.message || 'Failed to load tables', 'error');
      }
  } catch (error) {
      loadingSpinner.style.display = 'none';
      showToast(`Error: ${error.message}`, 'error');
      console.error('Fetch error:', error);
  }
}

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

window.onload = loadTables;

let tableToDelete = null;
let cardToDelete = null;

// Show the delete confirmation modal
function showDeleteModal(card, tableID) {
    const modal = document.getElementById('delete-modal');
    modal.style.display = 'block';
    tableToDelete = tableID;
    cardToDelete = card;
}

// Confirm delete action
document.getElementById('confirm-delete').onclick = async function () {
    if (!tableToDelete) return;

    try {
        const response = await fetch('http://127.0.0.1:5000/delete_table', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ table_id: tableToDelete })
        });

        const data = await response.json();

        if (data.status === 'success') {
            cardToDelete.remove();  // Remove the table card from the UI
            showToast(data.message, 'success');
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }

    document.getElementById('delete-modal').style.display = 'none';  // Hide the modal after the action
    tableToDelete = null;
    cardToDelete = null;
};

// Cancel the delete action
document.getElementById('cancel-delete').onclick = function () {
    document.getElementById('delete-modal').style.display = 'none';  // Close the modal
    tableToDelete = null;  // Reset the table to delete
    cardToDelete = null;   // Reset the card to delete
};
