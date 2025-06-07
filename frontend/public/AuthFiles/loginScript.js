document.querySelector('.butt').addEventListener('click', async e => {
    e.preventDefault();
    const email    = document.querySelector('.email').value;
    const password = document.querySelector('.password').value;
  
    const res = await fetch('https://ample-miracle-production.up.railway.app/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    });
  
    const data = await res.json();
    if (data.status === 'success') {
      // save user_id for session
      localStorage.setItem('userId', data.user_id);
      // go to home
      window.location.href = "../index.html";
    } else {
      alert(data.message);
    }
  });
  function togglePassword() {
    const password = document.getElementById("password");
    const icon = document.querySelector(".toggle-password");

    if (password.type === "password") {
      password.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      password.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  }