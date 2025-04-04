document.addEventListener("DOMContentLoaded", function () {
    const searchBtn = document.querySelector(".search-btn");
    const stateSelect = document.getElementById("state");
    const citySelect = document.getElementById("city");
    const tableBody = document.getElementById("branchesTableBody");

    if (document.getElementById("vehicleTableBody")) {
        getVehicleDetails();
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

    
    const logoutModal = document.getElementById("logoutModal");
    const closeLogoutModal = document.getElementById("closeLogoutModal");
    const confirmLogoutBtn = document.getElementById("confirmLogout");
    const cancelLogoutBtn = document.getElementById("cancelLogout");

    document.getElementById("logoutBtn").addEventListener("click", () => {
    logoutModal.style.display = "flex"; // Show modal
    });

    closeLogoutModal.addEventListener("click", () => {
    logoutModal.style.display = "none";
    });

    cancelLogoutBtn.addEventListener("click", () => {
    logoutModal.style.display = "none";
    });

    confirmLogoutBtn.addEventListener("click", () => {
    logoutModal.style.display = "none";
    logout(); // Proceed with logout
    });

    // Optional: Close modal when clicking outside it
    window.addEventListener("click", (event) => {
    if (event.target === logoutModal) {
        logoutModal.style.display = "none";
    }
    });



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
    

    // Attach to Logout Button
   
    loginConfirm(); 
    //login confirmation
    async function loginConfirm()
    {
      try
      {
        const response = await fetch("http://localhost:3000/user/");
        const result = await response.json();

        if(response.status === 401)
        {
          return showPopup("Not proper Login", "Try to login again", "error",result.redirectUrl); 
        }
        if(!response.ok)
        {
          return showPopup("Branch not loaded",result.message,"error");
        }
      }
      catch(error)
      {
        console.error("Error in login confirmation: ",error);
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
        tableBody.innerHTML = `<tr><td colspan="4" class="${type}">${message}</td></tr>`;
    }

    // Event Listeners
    stateSelect.addEventListener("change", loadCities);
    searchBtn.addEventListener("click", fetchBranches);

    document.addEventListener("keypress", function (event) {
        const activeElement = document.activeElement;

        // Prevent "Enter" from triggering search when selecting a dropdown option
        if (event.key === "Enter" && activeElement.tagName !== "SELECT") {
            fetchBranches();
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
        window.location.href = "vehicle_info.html"; // Change to actual details page
    }
    
    
    // Load states and all branches on page load
   

    loadStates();
    fetchBranches();
});
