function showPopup(title, message, type,redirectUrl) {
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
    
    popupBtn.onclick = () => {
        if(redirectUrl || title == "Sign Up Successful")
        {
            window.location.href = redirectUrl;
        }
        popupOverlay.classList.remove("active");
    };
    
    // Also close popup when clicking outside
    popupOverlay.onclick = (e) => {
        if (e.target === popupOverlay) {
            popupOverlay.classList.remove("active");
        }
    };
}
const isLoginPage = window.location.pathname.includes('login.html');
const isSignupPage = window.location.pathname.includes('signup.html');
const isAdminPage = window.location.pathname.includes('adminLogin.html');

document.addEventListener('DOMContentLoaded', function() {
    if (isLoginPage) {
        initLoginPage();
    }
    if (isSignupPage) {
        initSignupPage();
    }
    if (isAdminPage){
        initAdminPage();
    }
});

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
    
    function clearLoginForm() {
        document.getElementById('Id').value = '';
        document.getElementById('pass').value = '';
    }
    
    async function handleLogin() {
        const userID = document.getElementById('Id').value.trim();
        const password = document.getElementById('pass').value.trim();
    
        if (!userID || !password) {
            return showPopup("Missing Information", "All fields are required!", "error");
        }
    
        const logData = { userID, password };
    
        try {
            const response = await fetch('http://localhost:3000/login/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logData),
            });
    
            const result = await response.json();

            console.log(response.status);

            if (response.status === 409) {
                clearLoginForm();
                return showPopup("Login Failed", "Invalid Credentials", "error");
            }
            if (!response.ok) {
                throw new Error(result.message);
            }
            showPopup("Login Successful", "You have successfully logged in!", "success",result.redirectUrl);

        } catch (error) {
            console.error("Error:", error);
            showPopup("Login Failed", "An error occurred. Please try again.", "error");
        }
    }
}

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
            window.location.href = 'login.html';
        });
    }

    function clearSignupForm() {
        document.getElementById('Name').value = '';
        document.getElementById('Gender').value = '';
        document.getElementById('Phone').value = '';
        document.getElementById('UserId').value = '';
        document.getElementById('pass').value = '';
        document.getElementById('cpass').value = '';
    }

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
    
        const userData = { name, gender, phone, userId, password };
    
        try {
            const response = await fetch('http://localhost:3000/login/signup', {
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
            showPopup("Sign Up Successful", "Your account has been created successfully!", "success","login.html");
        } catch (error) {
            console.error("Error:", error);
            showPopup("Sign Up Failed", "An error occurred. Please try again.", "error");
        }
    }
}
function initAdminPage(){
    const signInBtn = document.getElementById('signIn');
    if (signInBtn){
        signInBtn.addEventListener('click',handleSignIn)
    }

    const passwordInput = document.getElementById('password');
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

    function clearLoginForm() {
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    async function handleSignIn() {
        const userName = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
    
        if (!userName || !password) {
            return showPopup("Field Empty Error", "All Fields are required", "error");
        }
    
        signData = { userName, password }
    
        try {
            const response = await fetch("http://localhost:3000/login/admin", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signData)
            });
    
            const result = await response.json();

            if (response.status === 401) {
                clearLoginForm();
                return showPopup("Login Failed", result.message, "error");
            }
            if (!response.ok) {
                clearLoginForm();
                throw new Error(result.message || "Login failed");  
            }

            showPopup("Login Successful", "You have successfully logged in!", "success",result.redirectUrl);

        } catch (error) {
            console.error("Error:", error);
            showPopup("Login Failed", "An error occurred. Please try again.", "error");
        }
    }}