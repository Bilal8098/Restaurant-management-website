
function toggleProfile() {
  const box = document.getElementById('profileActions');
  box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
}

document.addEventListener("DOMContentLoaded", () => {
const viewButtons = document.querySelectorAll(".view-btn");
viewButtons.forEach(button => {
    button.addEventListener("click", function() {
        const tableName = this.closest(".table-card").querySelector(".table-name").textContent;
        alert(`You clicked on ${tableName}`);
    });
});

const addTableButton = document.querySelector(".add-table-button");
addTableButton.addEventListener("click", () => {
    alert("Adding a new table");
});
});
function toggleNav() {
  const navLinks = document.getElementById('navLinks');
  navLinks.classList.toggle('active');
}

