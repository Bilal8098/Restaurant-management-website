  // Create floating particles
  function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;
    
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
        
        // Random color between primary and accent
        const colorValue = Math.random();
        const color = colorValue < 0.5 ? 
            `rgba(0, 0, 0, ${opacity})` : 
            `rgba(0, 0, 0, ${opacity})`;
        particle.style.background = color;
        
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

// Create floating elements
function createFloatingElements() {
    const container = document.getElementById('floatingElements');
    const elementCount = 10;
    
    for (let i = 0; i < elementCount; i++) {
        const element = document.createElement('div');
        element.classList.add('floating-element');
        
        const size = Math.random() * 100 + 50;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const blur = Math.random() * 10 + 5;
        const delay = Math.random() * 5;
        const duration = Math.random() * 20 + 20;
        
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
        element.style.left = `${posX}%`;
        element.style.top = `${posY}%`;
        element.style.filter = `blur(${blur}px)`;
        element.style.animation = `floatElement ${duration}s ease-in-out ${delay}s infinite`;
        
        container.appendChild(element);
    }
    
    // Add CSS for floating element animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatElement {
            0% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(50px, 50px) rotate(180deg); }
            100% { transform: translate(0, 0) rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Create confetti effect
function createConfetti() {
    const colors = ['#000'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        const size = Math.random() * 10 + 5;
        const posX = Math.random() * window.innerWidth;
        const delay = Math.random() * 3;
        const duration = Math.random() * 3 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.left = `${posX}px`;
        confetti.style.animationDelay = `${delay}s`;
        confetti.style.animationDuration = `${duration}s`;
        confetti.style.backgroundColor = color;
        
        // Random shape
        if (Math.random() > 0.5) {
            confetti.style.borderRadius = '50%';
        } else {
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        }
        
        document.body.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            confetti.remove();
        }, duration * 1000);
    }
}

// Preview the selected image
function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const output = document.getElementById('imagePreview');
        output.src = reader.result;
        output.style.transform = 'scale(1.05)';
        setTimeout(() => {
            output.style.transform = 'scale(1)';
        }, 300);
    }
    reader.readAsDataURL(event.target.files[0]);
}

// Function to handle form submission
function submitForm() {
    const location = document.getElementById('location').value;
    const numberOfSeats = document.getElementById('seats').value;
    const imageInput = document.getElementById('imagePreview');

    // Check if the required fields are filled
    if (!location || !numberOfSeats) {
        showError('Please fill in all fields.');
        return;
    }

    // Convert the image to base64 if it's selected
    let imageBase64 = null;
    const imageSrc = imageInput.src;
    if (imageSrc && imageSrc.indexOf('addIcon.png') === -1) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            imageBase64 = canvas.toDataURL('image/png').split(',')[1];
            sendData(location, numberOfSeats, imageBase64);
        };
        img.src = imageSrc;
    } else {
        showError('Please upload an image.');
        return;
    }
}

// Function to send form data to Flask backend
function sendData(location, numberOfSeats, imageBase64) {
    const formData = new FormData();
    formData.append('Location', location);
    formData.append('NumberOfSeats', numberOfSeats);
    formData.append('Image', imageBase64);

    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;

    // Send the data to the Flask backend
    fetch('http://localhost:5000/add_table', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showSuccess('Table added successfully!');
            createConfetti();
        } else {
            showError('Error: ' + data.message);
        }
    })
    .catch(error => {
        showError('An error occurred: ' + error);
    })
    .finally(() => {
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Table';
        submitBtn.disabled = false;
    });
}

// Show error message
function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.position = 'fixed';
    errorElement.style.top = '20px';
    errorElement.style.left = '50%';
    errorElement.style.transform = 'translateX(-50%)';
    errorElement.style.backgroundColor = '#FF2E00';
    errorElement.style.color = 'white';
    errorElement.style.padding = '15px 30px';
    errorElement.style.borderRadius = '10px';
    errorElement.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    errorElement.style.zIndex = '1000';
    errorElement.style.animation = 'fadeIn 0.3s ease';
    
    document.body.appendChild(errorElement);
    
    setTimeout(() => {
        errorElement.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            errorElement.remove();
        }, 300);
    }, 3000);
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translateX(-50%) translateY(0); }
            to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
}

// Show success message
function showSuccess(message) {
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.textContent = message;
    successElement.style.position = 'fixed';
    successElement.style.top = '20px';
    successElement.style.left = '50%';
    successElement.style.transform = 'translateX(-50%)';
    successElement.style.backgroundColor = '#4CAF50';
    successElement.style.color = 'white';
    successElement.style.padding = '15px 30px';
    successElement.style.borderRadius = '10px';
    successElement.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    successElement.style.zIndex = '1000';
    successElement.style.animation = 'fadeIn 0.3s ease';
    
    document.body.appendChild(successElement);
    
    setTimeout(() => {
        successElement.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            successElement.remove();
        }, 300);
    }, 3000);
}

// Initialize effects when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    createFloatingElements();
});