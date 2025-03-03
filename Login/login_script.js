document.getElementById('login-btn').addEventListener('click', async () => {
    const userID = document.getElementById('Id').value.trim();
    const password = document.getElementById('pass').value.trim(); // Fixed casing

    if (!userID || !password) {
        return showPopup("Missing Information", "All fields are required!", "error");
    }

    const logData = { userID, password }; // Fixed property name

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData),
        });

        const result = await response.json();

        if (response.status === 409) {
            return showPopup("Login Failed", "User ID doesn't exist", "error"); // Fixed showPopup call
        }

        if (response.status === 401) {
            return showPopup("Login Failed", "Invalid password", "error");
        }

        if (!response.ok) {
            throw new Error(result.message);
        }

        clearForm();
        showPopup("Login Successful", "You have successfully logged in!", "success");
    } catch (error) {
        console.error("Error:", error);
        showPopup("Login Failed", "An error occurred. Please try again.", "error");
    }
});

document.getElementById('signup-btn').addEventListener('click', () => {
    window.location.href = '../signup.html'; // Adjust path if needed
});

function showPopup(title, message, type) {
    const popupOverlay = document.getElementById("popup-overlay");
    const popupContent = document.getElementById("popup-content");
    const popupTitle = document.getElementById("popup-title");
    const popupMessage = document.getElementById("popup-message");
    const popupBtn = document.getElementById("popup-close-btn");

    popupTitle.textContent = title;
    popupMessage.textContent = message;

    popupContent.className = "popup-content";
    if (type === "error") {
        popupContent.classList.add("popup-error");
    }

    popupOverlay.classList.add("active");

    popupBtn.onclick = () => {
        popupOverlay.classList.remove("active");
    };

    popupOverlay.onclick = (e) => {
        if (e.target === popupOverlay) {
            popupOverlay.classList.remove("active");
        }
    };
}

function clearForm() {
    document.getElementById('Id').value = ''; // Fixed field names
    document.getElementById('pass').value = '';
}
