// Preview the selected image
function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const output = document.getElementById('imagePreview');
        output.src = reader.result;
    }
    reader.readAsDataURL(event.target.files[0]);
}

// Function to handle form submission
function submitForm() {
    const itemName = document.getElementById('itemName').value;
    const price = document.getElementById('price').value;
    const imageInput = document.getElementById('imageInput').files[0];

    if (!itemName || !price || !imageInput) {
        alert('Please fill in all fields and upload an image.');
        return;
    }

    const reader = new FileReader();
    reader.onloadend = function() {
        const imageBase64 = reader.result.split(',')[1]; // Get base64 encoded image (after 'data:image/png;base64,')

        // Prepare the form data
        const formData = new FormData();
        formData.append('ItemName', itemName);
        formData.append('Price', price);
        formData.append('Image', imageBase64);

        // Send the data to the Flask backend
        fetch('http://localhost:5000/add_menu_item', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Menu item added successfully!');
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            alert('An error occurred: ' + error);
        });
    }

    reader.readAsDataURL(imageInput);
}
