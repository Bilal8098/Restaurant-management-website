// Function to handle form submission
function submitForm() {
    const location = document.querySelector('input[placeholder="Location"]').value;
    const numberOfSeats = document.querySelector('input[placeholder="Number of seats"]').value;
    const imageInput = document.querySelector('.uploadImage img');

    // Check if the required fields are filled
    if (!location || !numberOfSeats) {
        alert('Please fill in all fields.');
        return;
    }

    // Convert the image to base64 if it's selected (image source will change after upload)
    let imageBase64 = null;
    const imageSrc = imageInput.src;
    if (imageSrc && imageSrc !== "../assets/addIcon.png") {  // Ensure an image is uploaded
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            imageBase64 = canvas.toDataURL('image/png').split(',')[1]; // Extract base64 part only
            sendData(location, numberOfSeats, imageBase64);
        };
        img.src = imageSrc;
    } else {
        alert('Please upload an image.');
        return;
    }

    // Function to send form data to Flask backend
    function sendData(location, numberOfSeats, imageBase64) {
        const formData = new FormData();
        formData.append('Location', location);
        formData.append('NumberOfSeats', numberOfSeats);
        formData.append('Image', imageBase64); // Send the image as base64

        // Send the data to the Flask backend
        fetch('http://localhost:5000/add_table', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Table added successfully!');
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            alert('An error occurred: ' + error);
        });
    }
}

// Preview the selected image
function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const output = document.getElementById('imagePreview');
        output.src = reader.result;
    }
    reader.readAsDataURL(event.target.files[0]);
}
