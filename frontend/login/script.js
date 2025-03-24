// Common utility functions
function clearSignupForm() {
    document.getElementById('Name').value = '';
    document.getElementById('Gender').value = '';
    document.getElementById('Phone').value = '';
    document.getElementById('UserId').value = '';
    document.getElementById('pass').value = '';
    document.getElementById('cpass').value = '';
}


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
const isBranchPage = window.location.pathname.includes('available_branches.html') || window.location.pathname === '/available_branches';
const isAdminPage = window.location.pathname.includes('admin')|| window.location.pathname === '/admin';

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

    if (isBranchPage){
        initBranchPage();
    }

    if (isAdminPage){
        initAdminPage()
    }
});

function initAdminPage(){
    const signInBtn = document.getElementById('signIn');
    if (signInBtn){
        signInBtn.addEventListener('click',handleSignIn)
    }

    async function handleSignIn() {
        const userName = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
    
        if (!userName || !password) {
            return showPopup("Field Empty Error", "All Fields are required", "error");
        }
    
        signData = { userName, password }
    
        try {
            const response = await fetch("http://localhost:3000/admin", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signData)
            });
    
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || "Login failed");
            }
        
            // Define clearLoginForm or use inline code to clear fields
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            
            showPopup("Login Successful", "You have successfully logged in!", "success");
            // Uncomment this if you need to store the token
            // if (result.token) {
            //     localStorage.setItem("authToken", result.token);
            //     window.location.href = "admin_dashboard.html";
            // }
        } catch (error) {
            console.error("Error:", error);
            showPopup("Login Failed", "An error occurred. Please try again.", "error");
        }
    }}




async function loadBranch() {
    try{
        let response = await fetch("/branch");
        let result = await response.json();
        let branchBody = document.getElementById('tableBody');

        branchBody.innerHTML = "";
        
        result.forEach(branch => {
            let row = document.createElement('tr');

            row.innerHTML = `
            <td>${branch.branch_name}</td>
            <td>${branch.street}</td>
            <td>${branch.city}</td>
            <td>${branch.state}</td>
            <td class="availability">
            <div class="vehicle-count">
              <span>🏍</span>
              ${branch.max_slots_bike}
            </div>
            <div class="vehicle-count">
              <span>🚗</span>
              ${branch.max_slots_car}
            </div>
          </td>
            <td>${branch.phone_no}</td>
            `;
            branchBody.appendChild(row);
        });

    }catch(error){

    }
}
function initBranchPage(){
    const welcome = document.getElementById('welcome');
    const logout = document.getElementById("logout");
    if(logout) {
        logout.addEventListener("click", function () {
            localStorage.removeItem("userName"); // Remove stored data
            window.location.href = "login.html"; // Redirect to login page
        });
    }
    const token = localStorage.getItem("authToken");
    if (token){
        try{
            console.log("Works Here");
            console.log("Token:", token);
            const userData = JSON.parse(atob(token.split('.')[1]));

            welcome.textContent = `Welcome, ${userData.name}`;
        }catch (error){
            console.error("Invalid token:",error);
            welcome.textContent = "Welcome, Guest!";
        }
    }
    else{
        welcome.textContent = "Welcome, Guest!";
    }
    loadBranch();



}

// Login page initialization
function initLoginPage() {
    const loginBtn = document.getElementById('login-btn');
    const passwordInput = document.getElementById('pass');
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function () {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                togglePassword.textContent = 'visibility'
            } else {
                passwordInput.type = 'password';
                togglePassword.textContent = 'visibility_off'
            }
        });
    }
    
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
            console.log(response.status);

            if (response.status === 409) {
                return showPopup("Login Failed", "User ID doesn't exist", "error");
            }
    
            if (response.status === 401) {
                return showPopup("Login Failed", "Invalid password", "error");
            }
    
            if (!response.ok) {
                throw new Error(result.message);
            }
    
            //clearLoginForm();
            //showPopup("Login Successful", "You have successfully logged in!", "success");
            if (response.status === 200){
                localStorage.setItem("authToken",result.token);
                window.location.href="available_branches.html";
            }
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

    const passwordInput = document.getElementById('pass');
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function () {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                togglePassword.textContent = 'visibility'
            } else {
                passwordInput.type = 'password';
                togglePassword.textContent = 'visibility_off'
            }
        });
    }

        const count = document.getElementById('count');
        const lower = document.getElementById('lowercase');
        const upper = document.getElementById('uppercase');
        const digit = document.getElementById('digits');
        let isValid = false;
        passwordInput.addEventListener('input',function(){
            const password = passwordInput.value;
            const hasCount = password.length>=8
            count.classList.toggle("valid",hasCount);
            count.classList.toggle('invalid',!hasCount);
            count.innerHTML = hasCount ? '✅ 8+ Characters':'❌ 8+ Characters'

            const hasLower = /[a-z]/.test(password);
            lower.classList.toggle("valid",hasLower);
            lower.classList.toggle('invalid',!hasLower);
            lower.innerHTML = hasLower?'✅ lowercase':'❌ lowercase';

            const hasGreater = /[A-Z]/.test(password);
            upper.classList.toggle('valid',hasGreater);
            upper.classList.toggle('invalid',!hasGreater);
            upper.innerHTML = hasGreater?'✅ uppercase':'❌ uppercase';

            const hasDigit = /\d/.test(password);
            digit.classList.toggle('valid',hasDigit);
            digit.classList.toggle('invalid',!hasDigit);
            digit.innerHTML = hasDigit?'✅ digits':'❌ digits';
            isValid = hasCount && hasLower && hasGreater && hasDigit;
        });

        const confirmPasswordInput = document.getElementById('cpass');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    
    if (toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener('click', function () {
            if (confirmPasswordInput.type === 'password') {
                confirmPasswordInput.type = 'text';
                toggleConfirmPassword.textContent = 'visibility'
            } else {
                confirmPasswordInput.type = 'password';
                toggleConfirmPassword.textContent = 'visibility_off'
            }
        });
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', handleSignup);
    }
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = '/';
        });
    }

    // Handle signup form submission
    async function handleSignup(event) {
        const name = document.getElementById('Name').value.trim();
        const gender = document.getElementById('Gender').value.trim();
        const phone = document.getElementById('Phone').value.trim();
        const userId = document.getElementById('UserId').value.trim();
        const password = document.getElementById('pass').value.trim();
        const confirmPassword = document.getElementById('cpass').value.trim();
        
        



        if (!name ||!gender || !phone || !userId || !password || !confirmPassword) {
            return showPopup("Missing Information", "All fields are required!", "error");
        }

        if (!isValid){
            event.preventDefault();
            return showPopup("Password Error","All rules must be followed","error");
        }
    
        if (password !== confirmPassword) {
            return showPopup("Password Error", "Passwords do not match!", "error");
        }
    
        const userData = { name,gender, phone, userId, password };
    
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