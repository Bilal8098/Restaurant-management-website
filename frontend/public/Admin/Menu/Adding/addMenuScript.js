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

    // Show toast notification
    function showToast(message, isSuccess = true) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.style.background = isSuccess 
            ? 'linear-gradient(to right, #27ae60, #2ecc71)'
            : 'linear-gradient(to right, #e74c3c, #c0392b)';
        toast.style.display = 'block';
        
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 300);
        }, 3000);
        
        // Add CSS for slide out animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes toastSlideOut {
                from { opacity: 1; transform: translateX(-50%) translateY(0); }
                to { opacity: 0; transform: translateX(-50%) translateY(20px); }
            }
        `;
        document.head.appendChild(style);
    }

    // Function to handle form submission
    function submitForm() {
        const itemName = document.getElementById('itemName').value;
        const price = document.getElementById('price').value;
        const imageInput = document.getElementById('imageInput').files[0];

        if (!itemName || !price || !imageInput) {
            showToast('Please fill in all fields and upload an image', false);
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;

        const reader = new FileReader();
        reader.onloadend = function() {
            const imageBase64 = reader.result.split(',')[1];

            // Prepare the form data
            const formData = new FormData();
            formData.append('ItemName', itemName);
            formData.append('Price', price);
            formData.append('Image', imageBase64);

            // Send the data to the Flask backend
            fetch('https://ample-miracle-production.up.railway.app/add_menu_item', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    showToast('Menu item added successfully!', true);
                    // Reset form
                    document.getElementById('itemName').value = '';
                    document.getElementById('price').value = '';
                    document.getElementById('imagePreview').src = '../../../assets/addIcon.png';
                    document.getElementById('imageInput').value = '';
                } else {
                    showToast('Error: ' + data.message, false);
                }
            })
            .catch(error => {
                showToast('An error occurred: ' + error, false);
            })
            .finally(() => {
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Item';
                submitBtn.disabled = false;
            });
        }

        reader.readAsDataURL(imageInput);
    }