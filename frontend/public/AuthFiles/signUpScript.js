document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  try {
    const response = await fetch("http://ample-miracle-production.up.railway.app/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    if (result.status === "success") {
      alert("Signup successful!");
      window.location.href = "Login.html";
    } else {
      alert(result.message);
    }
  } catch (err) {
    alert("Request failed: " + err.message);
  }
});

// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(icon => {
  icon.addEventListener('click', () => {
    const input = icon.previousElementSibling;
    input.type = input.type === 'password' ? 'text' : 'password';
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
  });
});
