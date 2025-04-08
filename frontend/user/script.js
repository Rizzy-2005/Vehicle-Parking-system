document.addEventListener("DOMContentLoaded", function () {
    const searchBtn = document.querySelector(".search-btn");
    const stateSelect = document.getElementById("state");
    const citySelect = document.getElementById("city");
    const tableBody = document.getElementById("branchesTableBody");

    // Common functions that run on all pages
    loginConfirm();
    setupLogoutModal();

    // Check which page we're on and run appropriate functions
    if (document.getElementById("branchesTableBody")) {
        loadStates();
        fetchBranches();
        
        // Set up event listeners for the branches page
        if (stateSelect) stateSelect.addEventListener("change", loadCities);
        if (searchBtn) searchBtn.addEventListener("click", fetchBranches);
        
        // Refresh branch data every 5 seconds
        setInterval(() => {
            console.log("Branch refresh triggered at", new Date().toLocaleTimeString());
            fetchBranches();
        }, 5000);
    }

    if (document.getElementById("vehicleTableBody")) {
        getVehicleDetails();
        
        // Refresh vehicle data every 5 seconds
        setInterval(() => {
            console.log("Vehicle refresh triggered at", new Date().toLocaleTimeString());
            getVehicleDetails();
        }, 5000);
    }
    
    // Check if we're on the update user details page
    if (document.getElementById("userDetailsForm")) {
        console.log("User details form detected");
        user_details();
        
        const userForm = document.getElementById("userDetailsForm");
        userForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Prevent default form submission
            updateUserDetails();
        });
    }

    // Function to set up logout modal
    function setupLogoutModal() {
        const logoutModal = document.getElementById("logoutModal");
        const closeLogoutModal = document.getElementById("closeLogoutModal");
        const confirmLogoutBtn = document.getElementById("confirmLogout");
        const cancelLogoutBtn = document.getElementById("cancelLogout");
        const logoutBtn = document.getElementById("logoutBtn");

        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                logoutModal.style.display = "flex"; // Show modal
            });
        }

        if (closeLogoutModal) {
            closeLogoutModal.addEventListener("click", () => {
                logoutModal.style.display = "none";
            });
        }

        if (cancelLogoutBtn) {
            cancelLogoutBtn.addEventListener("click", () => {
                logoutModal.style.display = "none";
            });
        }

        if (confirmLogoutBtn) {
            confirmLogoutBtn.addEventListener("click", () => {
                logoutModal.style.display = "none";
                logout(); // Proceed with logout
            });
        }

        // Optional: Close modal when clicking outside it
        window.addEventListener("click", (event) => {
            if (event.target === logoutModal) {
                logoutModal.style.display = "none";
            }
        });
    }

    function logout() {
        fetch("http://localhost:3000/user/logout")
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    localStorage.removeItem("userToken"); // Remove stored token
                    sessionStorage.clear(); // Clear session storage
                    window.location.replace(data.redirectUrl); // Redirect to login page
                }
            })
            .catch(error => console.error("Error during logout:", error));
    }

    // Fetch states and populate dropdown
    function loadStates() {
        loginConfirm();

        fetch("http://localhost:3000/user/get_states")
            .then(response => response.json())
            .then(states => {
                stateSelect.innerHTML = '<option value="">Select State</option>';
                states.forEach(state => {
                    const option = document.createElement("option");
                    option.value = state;
                    option.textContent = state;
                    stateSelect.appendChild(option);
                });
            })
            .catch(error => console.error("Error fetching states:", error));
    }

    //login confirmation
    async function loginConfirm() {
        try {
            const response = await fetch("http://localhost:3000/user/");
            const result = await response.json();

            if (result.name) {
                const usernameEl = document.getElementById("username");
                if (usernameEl) {
                    usernameEl.textContent = result.name;
                }
                console.log(result.name);
            }

            if (response.status === 401) {
                return showPopup("Not proper Login", "Try to login again", "error", result.redirectUrl);
            }
        }
        catch (error) {
            console.error("Error in login confirmation: ", error);
            showPopup("Connection Error", "Could not connect to the server", "error");
        }
    }

    function showPopup(title, message, type, redirectUrl) {
        const popupOverlay = document.getElementById("unique-popup-overlay");
        const popupBox = document.getElementById("unique-popup-box");
        const popupTitle = document.getElementById("unique-popup-heading");
        const popupMessage = document.getElementById("unique-popup-text");
        const popupButton = document.getElementById("unique-popup-button");
        
        popupTitle.textContent = title;
        popupMessage.textContent = message;
        popupBox.className = "unique-popup-box";
        
        if (type === "error") {
            popupBox.classList.add("unique-popup-error");
        }
        
        popupOverlay.classList.add("active-popup");
        
        popupButton.onclick = () => {
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
            popupOverlay.classList.remove("active-popup");
        };
        
        popupOverlay.onclick = (e) => {
            if (e.target === popupOverlay) {
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                }
                popupOverlay.classList.remove("active-popup");
            }
        };
    }
    
    // Fetch cities based on selected state
    function loadCities() {
        const state = stateSelect.value;
        if (!state) {
            citySelect.innerHTML = '<option value="">Select City</option>';
            return;
        }

        fetch(`http://localhost:3000/user/get_cities?state=${encodeURIComponent(state)}`)
            .then(response => response.json())
            .then(cities => {
                citySelect.innerHTML = '<option value="">Select City</option>';
                cities.forEach((city, index) => {
                    const option = document.createElement("option");
                    option.value = city;
                    option.textContent = city;
                    citySelect.appendChild(option);

                    // Auto-select first city
                    if (index === 0) citySelect.value = city;
                });
            })
            .catch(error => console.error("Error fetching cities:", error));
    }

    // Fetch branch details based on selected state and city, or load all branches if no selection
    function fetchBranches() {
        const state = stateSelect.value.trim();
        const city = citySelect.value.trim();
    
        let url = "http://localhost:3000/user/search_branches";
        const params = new URLSearchParams();
    
        if (state) params.append("state", state);
        if (city) params.append("city", city);
    
        // Append params if any
        if (params.toString()) url += `?${params.toString()}`;
    
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error("Server error: Unable to fetch branches.");
                return response.json();
            })
            .then(data => {
                if (!tableBody) {
                    console.error("Table body element not found");
                    return;
                }
                
                tableBody.innerHTML = ""; // Clear previous results
    
                if (!data.length) {
                    displayMessage("No branches found.", "info");
                    return;
                }
    
                data.forEach(branch => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${branch.name}</td>
                        <td>${branch.address}, ${branch.city || city}, ${branch.state || state}</td>
                        <td class="availability">
                            <div class="vehicle-count"><span>🏍</span> ${branch.available_bike_slots}</div>
                            <div class="vehicle-count"><span>🚗</span> ${branch.available_car_slots}</div>
                        </td>
                        <td>${branch.phone}</td>
                    `;
                    tableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error("Error fetching branches:", error);
                displayMessage("An error occurred. Please check your internet connection.", "error");
            });
    }
    
    // Display messages inside the table
    function displayMessage(message, type) {
        if (!tableBody) return;
        tableBody.innerHTML = `<tr><td colspan="4" class="${type}">${message}</td></tr>`;
    }

    // Event Listeners for keyboard shortcuts
    document.addEventListener("keypress", function (event) {
        const activeElement = document.activeElement;

        // Prevent "Enter" from triggering search when selecting a dropdown option
        if (event.key === "Enter" && activeElement.tagName !== "SELECT") {
            if (document.getElementById("branchesTableBody")) {
                fetchBranches();
            }
        }
    });

    function getVehicleDetails() {
        const url = "http://localhost:3000/user/vehicle_details";
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error("Server error: Unable to fetch vehicles.");
                return response.json();
            })
            .then(data => {
                console.log("Fetched vehicle details:", data); // Debugging
                const vehicleBody = document.getElementById("vehicleTableBody");
                if (!vehicleBody) {
                    console.error("Error: vehicleTableBody element not found.");
                    return;
                }
    
                vehicleBody.innerHTML = ""; // Clear previous results
        
                if (!Array.isArray(data) || data.length === 0) {
                    vehicleBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No vehicles found.</td></tr>`;
                    return;
                }
        
                data.forEach(vehicle => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${vehicle.vehicle_name || "N/A"}</td>
                        <td>${vehicle.branch_name || "N/A"}</td>
                        <td>${vehicle.slot_id || "N/A"}</td>
                        <td><span class="status ${vehicle.status === 'Parked' ? 'parked' : 'checked-out'}">${vehicle.status || "Unknown"}</span></td>
                    `;
                    row.addEventListener("click", () => showDetails(vehicle));
                    vehicleBody.appendChild(row);
                });
            })
            .catch(error => console.error("Error fetching vehicles:", error));
    }
    
    function showDetails(vehicle) {
        // Store vehicle details in localStorage
        localStorage.setItem("selectedVehicle", JSON.stringify(vehicle));
        // Redirect to the details page
        window.location.href = "vehicle_info.html"; 
    }

    function user_details() {
        console.log("Fetching user details...");
        fetch("http://localhost:3000/user/get_user_details")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch user details: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("User details received:", data);
                
                if (data.error) {
                    console.error("Error fetching user details:", data.error);
                    return;
                }

                const userIdField = document.getElementById("useridField");
                const userNameField = document.getElementById("usernameField");
                const phoneField = document.getElementById("phoneField");
                
                console.log("Form fields:", {
                    userIdField: userIdField ? "Found" : "Not found",
                    userNameField: userNameField ? "Found" : "Not found",
                    phoneField: phoneField ? "Found" : "Not found"
                });

                if (userIdField) userIdField.value = data.user_id || "N/A";
                if (userNameField) userNameField.value = data.user_name || "N/A";
                if (phoneField) phoneField.value = data.phone_no || "N/A";
            })
            .catch(error => {
                console.error("Error fetching user details:", error);
            });
    }

    function updateUserDetails() {
        const username = document.getElementById("usernameField").value.trim();
        const phone = document.getElementById("phoneField").value.trim();
        const userId = document.getElementById("useridField").value.trim();
        
        if (!username || !phone) {
            showPopup("Error", "Username and phone number are required", "error");
            return;
        }
        
        console.log("Updating user details...", { username, phone,userId});
        
        fetch("http://localhost:3000/user/update_user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_name: username,
                phone_no: phone,
                userId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showPopup("Success", "User details updated successfully", "success");
            } else {
                showPopup("Error", data.error || "Failed to update user details", "error");
            }
        })
        .catch(error => {
            console.error("Error updating user details:", error);
            showPopup("Error", "Failed to connect to server", "error");
        });
    }
});