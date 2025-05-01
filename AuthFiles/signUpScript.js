    // Handle form submission
    document.querySelector('#signup-form').addEventListener('submit', function (e) {
      e.preventDefault();

      const email = document.querySelector('input[name="email"]').value;
      const password = document.querySelector('input[name="password"]').value;
      const confirmPassword = document.querySelector('input[name="confirm-password"]').value;

      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      fetch('http://127.0.0.1:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          alert("Sign up successful! You can now log in.");
          window.location.href = "Login.html";
        } else {
          alert(data.message);
        }
      })
      .catch(err => {
        alert("Error: " + err.message);
      });
    });

    // Show/hide password toggles
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