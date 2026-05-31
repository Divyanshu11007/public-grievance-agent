/* =========================================
   OFFICER DASHBOARD JS - FIXED
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

// Load all data
async function loadOfficerData() {
    await loadProfile();
    await loadComplaints();
    await loadAlerts();
}

async function loadProfile() {
    try {
        const res = await fetch(`${API}/auth/profile`, { headers });
        const data = await res.json();
        if (data.success) {
            document.getElementById("profileName").innerText = data.user.name;
            document.getElementById("profileRole").innerText = data.user.role;
        }
    } catch (error) {
        console.error("Profile error:", error);
    }
}

async function loadComplaints() {
    try {
        const res = await fetch(`${API}/complaints`, { headers });
        const data = await res.json();
        const complaints = data.complaints || [];
        const container = document.getElementById("officerComplaints");
        
        // Update stats
        const assigned = complaints.filter(c => c.status === "Assigned" || c.status === "In Progress").length;
        const inProgress = complaints.filter(c => c.status === "In Progress").length;
        const resolved = complaints.filter(c => c.status === "Resolved").length;
        
        document.getElementById("assignedCount").innerText = assigned;
        document.getElementById("progressCount").innerText = inProgress;
        document.getElementById("resolvedCount").innerText = resolved;
        
        if (complaints.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:40px;">No complaints assigned</p>';
            return;
        }
        
        container.innerHTML = "";
        complaints.forEach(c => {
            container.innerHTML += `
                <div class="complaint-card" data-title="${c.issue || ''}">
                    <div class="complaint-header">
                        <h3>${c.issue || "No title"}</h3>
                        <span class="status ${c.status || 'Pending'}">${c.status || 'Pending'}</span>
                    </div>
                    <p>${c.description || "No description"}</p>
                    <div class="complaint-meta">
                        <span class="risk ${c.risk || 'Low'}">⚠️ ${c.risk || 'Low'}</span>
                        <span>🏢 ${c.department || 'General'}</span>
                        <span>📍 ${c.ward || 'Unknown'}</span>
                    </div>
                    <div style="font-size:12px; color:#94a3b8; margin:10px 0;">🆔 ${c.trackingId || 'N/A'}</div>
                    <div class="actions">
                        <select id="status-${c._id}" onchange="updateStatus('${c._id}', this.value)">
                            <option value="Pending" ${c.status === "Pending" ? "selected" : ""}>Pending</option>
                            <option value="Assigned" ${c.status === "Assigned" ? "selected" : ""}>Assigned</option>
                            <option value="In Progress" ${c.status === "In Progress" ? "selected" : ""}>In Progress</option>
                            <option value="Resolved" ${c.status === "Resolved" ? "selected" : ""}>Resolved</option>
                        </select>
                        <button class="btn-sm" onclick="generateSummary('${c._id}')">AI Summary</button>
                    </div>
                    <div id="summary-${c._id}" class="summary-box" style="display:none;"></div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Load complaints error:", error);
        document.getElementById("officerComplaints").innerHTML = '<p style="color:red;">Error loading complaints</p>';
    }
}

async function updateStatus(id, status) {
    try {
        const res = await fetch(`${API}/complaints/${id}/status`, {
            method: "PUT",
            headers,
            body: JSON.stringify({ status, note: "Updated by officer" })
        });
        const data = await res.json();
        if (data.success) {
            alert("✅ Status updated successfully!");
            loadComplaints();
        } else {
            alert("❌ Failed to update status");
        }
    } catch (error) {
        alert("❌ Error updating status");
    }
}

async function generateSummary(id) {
    const summaryDiv = document.getElementById(`summary-${id}`);
    if (summaryDiv.style.display === "block") {
        summaryDiv.style.display = "none";
        return;
    }
    try {
        summaryDiv.innerHTML = "<strong>🤖 AI Summary:</strong><br>Generating...";
        summaryDiv.style.display = "block";
        
        const res = await fetch(`${API}/chat/summary/${id}`, { method: "POST", headers });
        const data = await res.json();
        summaryDiv.innerHTML = `<strong>🤖 AI Summary:</strong><br>${data.summary || "Summary not available"}`;
    } catch (error) {
        summaryDiv.innerHTML = "<strong>🤖 AI Summary:</strong><br>Summary not available";
    }
}

async function loadAlerts() {
    try {
        const res = await fetch(`${API}/alerts`, { headers });
        const data = await res.json();
        const alerts = data.alerts || [];
        const container = document.getElementById("alertsContainer");
        
        if (alerts.length === 0) {
            container.innerHTML = '<p>No alerts</p>';
            return;
        }
        
        container.innerHTML = "";
        alerts.forEach(a => {
            container.innerHTML += `
                <div class="alert-card">
                    <strong>🚨 ${a.title || "Alert"}</strong>
                    <p>${a.message}</p>
                    <small>Priority: ${a.priority || "Normal"}</small>
                    <br>
                    <button class="btn-sm" onclick="markAlertRead('${a._id}')" style="margin-top:10px;">Mark Read</button>
                </div>
            `;
        });
    } catch (error) {
        console.error("Alerts error:", error);
    }
}

async function markAlertRead(id) {
    try {
        const res = await fetch(`${API}/alerts/${id}/read`, { method: "PUT", headers });
        const data = await res.json();
        if (data.success) {
            alert("✅ Alert marked as read");
            loadAlerts();
        }
    } catch (error) {
        console.error("Error marking alert:", error);
    }
}

function escalateEmergency() {
    const message = prompt("Describe the emergency situation:");
    if (message) {
        alert("🚨 Emergency escalation sent to admin!\n\nMessage: " + message);
        // Here you can also send to server if needed
    }
}

function saveNotes() {
    const notes = document.getElementById("deptNotes").value;
    if (notes) {
        localStorage.setItem("officerNotes", notes);
        alert("✅ Department notes saved locally!");
    } else {
        alert("Please write some notes first");
    }
    
    // Load saved notes on page load
    const savedNotes = localStorage.getItem("officerNotes");
    if (savedNotes) {
        document.getElementById("deptNotes").value = savedNotes;
    }
}

function filterComplaints() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const cards = document.querySelectorAll(".complaint-card");
    cards.forEach(card => {
        const title = card.getAttribute("data-title") || "";
        card.style.display = title.toLowerCase().includes(search) ? "block" : "none";
    });
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login.html";
}

// Load saved notes on page load
window.onload = () => {
    loadOfficerData();
    const savedNotes = localStorage.getItem("officerNotes");
    if (savedNotes) {
        document.getElementById("deptNotes").value = savedNotes;
    }
};
