document.querySelector('.butt').addEventListener('click', async e => {
    e.preventDefault();
    const email    = document.querySelector('.email').value;
    const password = document.querySelector('.password').value;
  
    const res = await fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    });
  
    const data = await res.json();
    if (data.status === 'success') {
      // save user_id for session
      localStorage.setItem('userId', data.user_id);
      // go to home
      window.location.href = "../Home/homepage.html";
    } else {
      alert(data.message);
    }
  });