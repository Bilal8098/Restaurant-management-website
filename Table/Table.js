 // Particle System
 class ParticleSystem {
  constructor() {
    this.canvas = document.querySelector('.particle-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticle(x, y) {
    return {
      x,
      y,
      size: Math.random() * 8 + 3,  // Larger particles (3-11px)
      speedX: Math.random() * 3 - 1.5,  // Faster movement
      speedY: Math.random() * 3 - 1.5,
      life: 1,
      opacity: 10
    };
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Create new particles
    if(Math.random() < 0.3) {
      this.particles.push(this.createParticle(
        Math.random() * this.canvas.width,
        Math.random() * this.canvas.height
      ));
    }

    // Update particles
    this.particles.forEach((p, index) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.life -= 0.01;

      this.ctx.fillStyle = `rgba(0, 0, 0, ${p.life * 0.3})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();

      if(p.life <= 0) {
        this.particles.splice(index, 1);
      }
    });

    requestAnimationFrame(() => this.animate());
  }
}

// Initialize particle system
new ParticleSystem();

// Table Loading Function
async function loadTables() {
  try {
    const response = await fetch('http://127.0.0.1:5000/get_tables');
    const data = await response.json();

    if (data.status === 'success') {
      const container = document.getElementById('tables-container');
      container.innerHTML = data.tables.map(table => `
        <div class="table-card">
          <img src="${table.Image ? `data:image/png;base64,${table.Image}` : 'placeholder.jpg'}" 
               alt="Table ${table.TableID}" 
               onclick="openImagePreview('${table.Image ? `data:image/png;base64,${table.Image}` : 'placeholder.jpg'}')">
          <div class="table-name">Table ${table.TableID}<br>${table.Location}</div>
          <button class="view-btn" 
                  onclick="handleReserve(${table.TableID})">
            Reserve Now
          </button>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading tables:', error);
  }
}

// Reservation Handler
function handleReserve(tableId) {
  const userToken = localStorage.getItem('userId');
  if (!userToken) {
    alert('Please log in first.');
    window.location.href = '../AuthFiles/Login.html';
  } else {
    window.location.href = `../Reservations/Reservation.html?tableId=${tableId}`;
  }
}

// Image Preview
function openImagePreview(src) {
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('preview-img');
  modal.style.display = 'block';
  modalImg.src = src;
}

// Close Modal
document.querySelector('.close').onclick = () => {
  document.getElementById('image-modal').style.display = 'none';
};

// Initialize
window.addEventListener('DOMContentLoaded', () =>{
  new ParticleSystem();
  loadTables();
});