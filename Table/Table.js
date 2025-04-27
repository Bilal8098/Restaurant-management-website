async function loadTables() {
    try {
      const response = await fetch('http://127.0.0.1:5000/get_tables');
      const data = await response.json();

      if (data.status === 'success') {
        const tablesContainer = document.getElementById('tables-container');

        // Insert before the "add-table" div
        const addTableDiv = document.querySelector('.add-table');

        data.tables.forEach(table => {
          const card = document.createElement('div');
          card.className = 'table-card';

          const img = document.createElement('img');
          if (table.Image) {
            img.src = `data:image/png;base64,${table.Image}`;
          } else {
            img.alt = 'No Image';
          }

          const cardContent = document.createElement('div');
          cardContent.className = 'table-card-content';

          const tableName = document.createElement('div');
          tableName.className = 'table-name';
          tableName.textContent = `Table ${table.TableID} - ${table.Location}`;

          const viewButton = document.createElement('button');
          viewButton.className = 'view-btn';
          viewButton.textContent = 'Reserve';

          cardContent.appendChild(tableName);
          cardContent.appendChild(viewButton);

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

  // Load tables when the page loads
  window.addEventListener('DOMContentLoaded', loadTables);