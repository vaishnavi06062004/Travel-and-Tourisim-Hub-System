// File: js/admin.js

// Admin credentials (login functionality)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "1234";

// Admin login functionality
function adminLogin() {
  const username = document.getElementById("admin-username").value;
  const password = document.getElementById("admin-password").value;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    window.location.href = "admin-dashboard.html"; // Redirect to Admin Dashboard
  } else {
    document.getElementById("login-error").textContent = "Invalid credentials!";
  }
}

// File: js/admin.js
