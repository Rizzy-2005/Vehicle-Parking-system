// Common utility functions
function showPopup(title, message, type) {
    const popupOverlay = document.getElementById("popup-overlay");
    const popupContent = document.getElementById("popup-content");
    const popupTitle = document.getElementById("popup-title");
    const popupMessage = document.getElementById("popup-message");
    const popupBtn = document.getElementById("popup-close-btn");
    
    // Set popup content
    popupTitle.textContent = title;
    popupMessage.textContent = message;
    
    // Reset classes and add appropriate type class
    popupContent.className = "popup-content";
    if (type === "error") {
        popupContent.classList.add("popup-error");
    }
    
    // Show popup
    popupOverlay.classList.add("active");
    
    // Close popup when OK button is clicked
    popupBtn.onclick = () => {
        popupOverlay.classList.remove("active");
    };
    
    // Also close popup when clicking outside
    popupOverlay.onclick = (e) => {
        if (e.target === popupOverlay) {
            popupOverlay.classList.remove("active");
        }
    };
}

// Determine which page we're on
const isLoginPage = window.location.pathname.includes('login.html') || window.location.pathname === '/' || window.location.pathname === '';
const isSignupPage = window.location.pathname.includes('signup.html') || window.location.pathname === '/signup';

// Initialize the page based on which HTML we're viewing
document.addEventListener('DOMContentLoaded', function() {
    // Login page functionality
    if (isLoginPage) {
        initLoginPage();
    }
    
    // Signup page functionality
    if (isSignupPage) {
        initSignupPage();
    }
});

// Login page initialization
function initLoginPage() {
    const loginBtn = document.getElementById('login-btn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // Function to clear login form
    function clearLoginForm() {
        document.getElementById('Id').value = '';
        document.getElementById('pass').value = '';
    }
    
    // Handle login form submission
    async function handleLogin() {
        const userID = document.getElementById('Id').value.trim();
        const password = document.getElementById('pass').value.trim();
    
        if (!userID || !password) {
            return showPopup("Missing Information", "All fields are required!", "error");
        }
    
        const logData = { userID, password };
    
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logData),
            });
    
            const result = await response.json();
    
            if (response.status === 409) {
                return showPopup("Login Failed", "User ID doesn't exist", "error");
            }
    
            if (response.status === 401) {
                return showPopup("Login Failed", "Invalid password", "error");
            }
    
            if (!response.ok) {
                throw new Error(result.message);
            }
    
            clearLoginForm();
            showPopup("Login Successful", "You have successfully logged in!", "success");
        } catch (error) {
            console.error("Error:", error);
            showPopup("Login Failed", "An error occurred. Please try again.", "error");
        }
    }
}

// Signup page initialization
function initSignupPage() {
    const signupBtn = document.getElementById('signup-btn');
    const loginBtn = document.getElementById('login-btn');
    
    if (signupBtn) {
        signupBtn.addEventListener('click', handleSignup);
    }
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = '/';
        });
    }
    
    // Function to clear signup form
    function clearSignupForm() {
        document.getElementById('Name').value = '';
        document.getElementById('Phone').value = '';
        document.getElementById('UserId').value = '';
        document.getElementById('pass').value = '';
        document.getElementById('cpass').value = '';
    }
    
    // Handle signup form submission
    async function handleSignup() {
        const name = document.getElementById('Name').value.trim();
        const phone = document.getElementById('Phone').value.trim();
        const userId = document.getElementById('UserId').value.trim();
        const password = document.getElementById('pass').value.trim();
        const confirmPassword = document.getElementById('cpass').value.trim();
    
        if (!name || !phone || !userId || !password || !confirmPassword) {
            return showPopup("Missing Information", "All fields are required!", "error");
        }
    
        if (password !== confirmPassword) {
            return showPopup("Password Error", "Passwords do not match!", "error");
        }
    
        const userData = { name, phone, userId, password };
    
        try {
            const response = await fetch('http://localhost:3000/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
    
            const result = await response.json();
    
            if (response.status === 409) {
                return showPopup("User ID Already Exists", "Please choose a different User ID.", "error");
            }
            
            if (!response.ok) {
                throw new Error(result.message);
            }
    
            clearSignupForm();
            showPopup("Sign Up Successful", "Your account has been created successfully!", "success");
        } catch (error) {
            console.error("Error:", error);
            showPopup("Sign Up Failed", "An error occurred. Please try again.", "error");
        }
    }
}