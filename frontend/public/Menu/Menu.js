document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("loader").style.display = "none";
  document.querySelector(".container").style.display = "block";
  initParticles();
});

function fetchMenuItems() {
fetch('https://ample-miracle-production.up.railway.app/get_menu_items')
      .then(response => response.json())
      .then(data => {
          if (data.status === "success") {
              const menuGrid = document.getElementById('menu-grid');
              data.menu_items.forEach((item, index) => {
                  const cyberCard = document.createElement('div');
                  cyberCard.className = 'cyber-card';
                  cyberCard.innerHTML = `
                      <div class="cyber-image">
                          ${item.Image ? 
                              `<img src="data:image/jpeg;base64,${item.Image}" />` : 
                              `<div class="image-placeholder"><i class="fas fa-utensils"></i></div>`
                          }
                          <div class="holographic-label">${item.Category || 'Special'}</div>
                      </div>
                      <div class="cyber-content">
                          <h3 class="cyber-title">${item.ItemName}</h3>
                          <div class="cyber-description">
                              ${item.Price || '100'}$
                          </div>
                      </div>
                  `;

                  cyberCard.style.transitionDelay = `${index * 0.1}s`;
                  menuGrid.appendChild(cyberCard);
              });

              // Add intersection observer for scroll animations
              const observer = new IntersectionObserver((entries) => {
                  entries.forEach(entry => {
                      if (entry.isIntersecting) {
                          entry.target.style.opacity = 1;
                          entry.target.style.transform = 'translateY(0)';
                      }
                  });
              }, { threshold: 0.1 });

              document.querySelectorAll('.cyber-card').forEach(card => {
                  card.style.opacity = 0;
                  card.style.transform = 'translateY(50px)';
                  observer.observe(card);
              });

          } else {
              console.error('Failed to fetch menu items:', data.message);
          }
      })
      .catch(error => {
          console.error('Error fetching menu:', error);
      });
}

function initParticles() {
  const canvas = document.querySelector('.particles');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  }

  class Particle {
      constructor() {
          this.reset();
      }

      reset() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.size = Math.random() * 2 + 1;
          this.speedX = Math.random() * 3 - 1.5;
          this.speedY = Math.random() * 3 - 1.5;
      }

      update() {
          this.x += this.speedX;
          this.y += this.speedY;

          if (this.x > canvas.width || this.x < 0) this.reset();
          if (this.y > canvas.height || this.y < 0) this.reset();
      }

      draw() {
          ctx.fillStyle = `rgba(0, 0, 0, ${this.size/3})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
      }
  }

  function init() {
      for (let i = 0; i < 100; i++) {
          particles.push(new Particle());
      }
  }

  function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
          particle.update();
          particle.draw();
      });
      requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener('resize', resize);
  init();
  animate();
}

window.addEventListener('DOMContentLoaded', () => {
  fetchMenuItems();
});