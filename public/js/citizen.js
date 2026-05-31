/* =========================================
   CITIZEN DASHBOARD JS - FIXED
========================================= */

const API = "http://localhost:5000/api";

const token = localStorage.getItem("token");
if (!token) {
    alert("Please login first");
    window.location.href = "/login.html";
}

const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
};

let map;
let marker;

window.onload = () => {
    loadCitizenComplaints();
    loadCitizenStats();
    initializeMap();
    setupSocket();
};

function initializeMap() {
    map = L.map("citizenMap").setView([28.6139, 77.2090], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(map);
    
    map.on("click", function(e) {
        const { lat, lng } = e.latlng;
        document.getElementById("lat").value = lat;
        document.getElementById("lng").value = lng;
        if (marker) map.removeLayer(marker);
        marker = L.marker([lat, lng]).addTo(map);
    });
}

// FIXED: Use Current Location function
function useCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                document.getElementById("lat").value = lat;
                document.getElementById("lng").value = lng;
                
                map.setView([lat, lng], 15);
                if (marker) map.removeLayer(marker);
                marker = L.marker([lat, lng]).addTo(map);
                
                alert("✅ Location detected! Map moved to your location.");
            },
            error => {
                console.error("Location error:", error);
                if (error.code === 1) {
                    alert("❌ Please allow location access in your browser settings.");
                } else {
                    alert("❌ Could not get your location. Please click on the map instead.");
                }
            }
        );
    } else {
        alert("❌ Geolocation is not supported by your browser. Please click on the map.");
    }
}

async function submitComplaint() {
    try {
        const issue = document.getElementById("issue").value;
        const description = document.getElementById("description").value;
        const ward = document.getElementById("ward").value;
        const address = document.getElementById("address").value;
        const lat = document.getElementById("lat").value;
        const lng = document.getElementById("lng").value;

        if (!issue || !lat || !lng) {
            alert("Please fill all required fields and select location on map");
            return;
        }

        const res = await fetch(`${API}/complaints`, {
            method: "POST",
            headers,
            body: JSON.stringify({ issue, description, ward, address, lat, lng }),
        });

        const data = await res.json();
        if (data.success) {
            alert("✅ Complaint Submitted Successfully!");
            document.getElementById("complaintForm").reset();
            document.getElementById("lat").value = "";
            document.getElementById("lng").value = "";
            if (marker) map.removeLayer(marker);
            loadCitizenComplaints();
            loadCitizenStats();
        } else {
            alert("❌ " + data.message);
        }
    } catch (error) {
        console.error(error);
        alert("❌ Server error");
    }
}

async function loadCitizenComplaints() {
    try {
        const res = await fetch(`${API}/complaints`, { headers });
        const data = await res.json();
        const complaints = data.complaints || [];
        const container = document.getElementById("citizenComplaints");
        container.innerHTML = "";

        if (complaints.length === 0) {
            container.innerHTML = '<div class="complaint-card" style="text-align:center; color:#94a3b8;">No complaints yet. Submit your first complaint above!</div>';
            return;
        }

        complaints.forEach(c => {
            container.innerHTML += `
                <div class="complaint-card">
                    <div class="complaint-header">
                        <h3>${c.issue}</h3>
                        <span class="status ${c.status.replace(/ /g, '-')}">${c.status}</span>
                    </div>
                    <p>${c.description || "No description"}</p>
                    <div class="complaint-meta">
                        <span>🏢 ${c.department || "General"}</span>
                        <span class="risk ${c.risk}">⚠️ ${c.risk || "Low"}</span>
                        <span>📍 ${c.ward || "Unknown"}</span>
                    </div>
                    <div class="tracking">
                        🆔 Tracking ID: ${c.trackingId}
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error(error);
    }
}

async function loadCitizenStats() {
    try {
        const res = await fetch(`${API}/complaints`, { headers });
        const data = await res.json();
        const complaints = data.complaints || [];
        
        document.getElementById("totalComplaints").innerText = complaints.length;
        document.getElementById("resolvedComplaints").innerText = complaints.filter(c => c.status === "Resolved").length;
        document.getElementById("pendingComplaints").innerText = complaints.filter(c => c.status === "Pending").length;
    } catch (error) {
        console.error(error);
    }
}

function setupSocket() {
    if (window.socket) {
        window.socket.on("statusUpdated", () => {
            loadCitizenComplaints();
            loadCitizenStats();
        });
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login.html";
}
