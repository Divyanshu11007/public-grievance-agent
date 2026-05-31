/* =========================================
   ADMIN DASHBOARD JS - FIXED
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
let trendChart;

window.onload = () => {
    loadAnalytics();
    loadComplaints();
    loadAlerts();
    loadHeatmap();
    loadWardAnalytics();
    loadClusters();
    loadTrends();
    setupSocket();
};

async function loadAnalytics() {
    try {
        const res = await fetch(`${API}/analytics/dashboard`, { headers });
        const data = await res.json();
        if (data.success) {
            const a = data.analytics;
            document.getElementById("totalComplaints").innerText = a.totalComplaints || 0;
            document.getElementById("resolvedComplaints").innerText = a.status?.resolved || 0;
            document.getElementById("pendingComplaints").innerText = a.status?.pending || 0;
            document.getElementById("criticalComplaints").innerText = a.risk?.criticalRisk || 0;
        }
    } catch (error) {
        console.error("Analytics error:", error);
    }
}

async function loadComplaints() {
    try {
        const res = await fetch(`${API}/complaints`, { headers });
        const data = await res.json();
        const complaints = data.complaints || [];
        const container = document.getElementById("complaintsContainer");
        container.innerHTML = "";
        
        if (complaints.length === 0) {
            container.innerHTML = '<div style="text-align:center; color:#94a3b8; padding:40px;">No complaints yet</div>';
            return;
        }
        
        complaints.forEach(c => {
            container.innerHTML += `
                <div class="complaint-card">
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
                    <div class="tracking" style="font-size:12px; color:#94a3b8; margin-top:10px;">
                        🆔 ${c.trackingId || 'N/A'}
                    </div>
                    <div class="actions">
                        <select id="status-${c._id}" onchange="updateStatus('${c._id}', this.value)">
                            <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="In Progress" ${c.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                            <option value="Rejected" ${c.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                        <button class="btn-sm" onclick="generateSummary('${c._id}')">AI Summary</button>
                    </div>
                    <div id="summary-${c._id}" class="summary-box" style="display:none;"></div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Load complaints error:", error);
    }
}

async function updateStatus(id, status) {
    try {
        const res = await fetch(`${API}/complaints/${id}/status`, {
            method: "PUT",
            headers,
            body: JSON.stringify({ status, note: "Updated by admin" })
        });
        const data = await res.json();
        if (data.success) {
            alert("✅ Status updated!");
            loadComplaints();
            loadAnalytics();
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
        const res = await fetch(`${API}/chat/summary/${id}`, { method: "POST", headers });
        const data = await res.json();
        summaryDiv.innerHTML = `<strong>🤖 AI Summary:</strong><br>${data.summary || "Summary not available"}`;
        summaryDiv.style.display = "block";
    } catch (error) {
        summaryDiv.innerHTML = "Summary not available";
        summaryDiv.style.display = "block";
    }
}

async function loadAlerts() {
    try {
        const res = await fetch(`${API}/alerts`, { headers });
        const data = await res.json();
        const alerts = data.alerts || [];
        const container = document.getElementById("alertsContainer");
        container.innerHTML = "";
        
        if (alerts.length === 0) {
            container.innerHTML = '<div style="text-align:center; color:#94a3b8; padding:20px;">No alerts</div>';
            return;
        }
        
        alerts.forEach(alert => {
            container.innerHTML += `
                <div class="alert-card">
                    <strong>🚨 ${alert.title || 'Alert'}</strong>
                    <p>${alert.message}</p>
                    <small>Priority: ${alert.priority || 'Normal'}</small>
                </div>
            `;
        });
    } catch (error) {
        console.error("Alerts error:", error);
    }
}

async function loadHeatmap() {
    try {
        const res = await fetch(`${API}/analytics/heatmap`, { headers });
        const data = await res.json();
        const points = data.heatmap || [];
        
        map = L.map("map").setView([28.6139, 77.2090], 11);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
        
        points.forEach(point => {
            let color = "#10b981"; // green for low
            if (point.risk === "High") color = "#f59e0b";
            if (point.risk === "Critical") color = "#ef4444";
            
            L.circleMarker([point.lat, point.lng], {
                radius: 8,
                fillColor: color,
                color: color,
                weight: 1,
                opacity: 1,
                fillOpacity: 0.7
            }).addTo(map).bindPopup(`Risk: ${point.risk || 'Low'}`);
        });
    } catch (error) {
        console.error("Heatmap error:", error);
    }
}

async function loadWardAnalytics() {
    try {
        const res = await fetch(`${API}/analytics/wards`, { headers });
        const data = await res.json();
        const wards = data.wards || {};
        const container = document.getElementById("wardAnalytics");
        container.innerHTML = "";
        
        Object.keys(wards).forEach(ward => {
            const w = wards[ward];
            container.innerHTML += `
                <div class="ward-card">
                    <h4>${ward}</h4>
                    <p>Total: ${w.total || 0} | Resolved: ${w.resolved || 0} | Pending: ${w.pending || 0}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error("Ward error:", error);
    }
}

async function loadClusters() {
    try {
        const res = await fetch(`${API}/analytics/clusters`, { headers });
        const data = await res.json();
        const clusters = data.clusters || {};
        const container = document.getElementById("clusterContainer");
        container.innerHTML = "";
        
        Object.keys(clusters).forEach(cluster => {
            container.innerHTML += `
                <div class="cluster-card">
                    <h4>${cluster}</h4>
                    <p>Complaints: ${clusters[cluster].length}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error("Cluster error:", error);
    }
}

async function loadTrends() {
    try {
        const res = await fetch(`${API}/analytics/trends`, { headers });
        const data = await res.json();
        const trends = data.trends || {};
        
        const labels = Object.keys(trends);
        const values = Object.values(trends);
        
        const ctx = document.getElementById("trendChart").getContext("2d");
        if (trendChart) trendChart.destroy();
        
        trendChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Complaints",
                    data: values,
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: "white" } }
                }
            }
        });
    } catch (error) {
        console.error("Trends error:", error);
    }
}

function setupSocket() {
    if (window.socket) {
        window.socket.on("newComplaint", () => {
            loadComplaints();
            loadAnalytics();
            loadHeatmap();
            loadWardAnalytics();
            loadClusters();
            loadTrends();
        });
        window.socket.on("criticalAlert", () => {
            loadAlerts();
            alert("🚨 Critical Alert Received!");
        });
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login.html";
}
