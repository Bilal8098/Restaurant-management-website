function signUp() {
    // Get form data
    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector('input[type="password"]').value;
    const confirmPassword = document.querySelector('input[type="password"]:nth-of-type(2)').value;

    // Validate password match
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Prepare data to send
    const data = new FormData();
    data.append('email', email);
    data.append('password', password);

    // Send POST request to Flask backend
    fetch('http://127.0.0.1:5000/signup', {
      method: 'POST',
      body: data
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        alert("Sign up successful! You can now log in.");
        window.location.href = "Login.html"; // Redirect to login page
      } else {
        alert(data.message); // Show error message from Flask
      }
    })
    .catch(error => {
      alert("Error: " + error.message);
    });
  }

  // Add event listener to sign up button
  document.querySelector('button').addEventListener('click', signUp);
  
  const toggles = document.querySelectorAll('.toggle-password');
  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const input = toggle.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        toggle.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = 'password';
        toggle.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  });