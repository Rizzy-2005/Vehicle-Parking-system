document.getElementById('signup-btn').addEventListener('click', async () => {
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

        
        clearForm(); // Clear form on successful signup
        showPopup("Sign Up Successful", "Your account has been created successfully!", "success");
    } catch (error) {
        console.error("Error:", error);
        showPopup("Sign Up Failed", "An error occurred. Please try again.", "error");
    }
});


document.getElementById('login-btn').addEventListener('click', () => {
    showPopup("Login", "Please login with your credentials.", "info");
});

// Function to display popup
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

// Function to clear form inputs after successful signup
function clearForm() {
    document.getElementById('Name').value = '';
    document.getElementById('Phone').value = '';
    document.getElementById('UserId').value = '';
    document.getElementById('pass').value = '';
    document.getElementById('cpass').value = '';
}