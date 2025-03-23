document.addEventListener("DOMContentLoaded", function () {
    const searchBtn = document.querySelector(".search-btn");
    const stateSelect = document.getElementById("state");
    const citySelect = document.getElementById("city");
    const tableBody = document.getElementById("branchesTableBody");

    // Fetch states and populate dropdown
    function loadStates() {
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

    // Load states and all branches on page load
    loadStates();
    fetchBranches();
});
