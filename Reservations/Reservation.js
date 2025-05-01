 // Function to extract query parameters
 function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  window.onload = () => {
    // Get userId from localStorage and tableId from URL
    const userId = localStorage.getItem('userId');
    const tableId = getQueryParam('tableId');

    // Fill the input fields
    document.getElementById('user_id').value = userId;
    document.getElementById('user_id').readOnly = true; // make it readonly
    document.getElementById('table_id').value = tableId;
    document.getElementById('table_id').readOnly = true; // make it readonly
  };

  document.querySelector("button").addEventListener("click", function (e) {
    e.preventDefault();

// inside your click handler, extend the data object:
const data = {
  user_id: document.getElementById('user_id').value,
  table_id: document.getElementById('table_id').value,
  name: document.getElementById('name').value,
  phone_number: document.getElementById('phone_number').value,
  start_date: document.getElementById('start_date').value,
  start_time: document.getElementById('start_time').value,
  end_date: document.getElementById('end_date').value,
  end_time: document.getElementById('end_time').value
};


    fetch("http://localhost:5000/reserve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
      alert(response.message);
      // optional: redirect to another page after successful reservation
    })
    .catch(error => {
      alert("An error occurred while sending the request");
      console.error(error);
    });
  });