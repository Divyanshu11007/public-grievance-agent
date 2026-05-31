/* =========================================
   AI CHATBOT JS - FIXED
========================================= */

const API = "http://localhost:5000/api";
const token = localStorage.getItem("token");

function toggleChatbot() {
    const chatbot = document.getElementById("chatbotContainer");
    chatbot.style.display = chatbot.style.display === "flex" ? "none" : "flex";
}

async function sendChatMessage() {
    const input = document.getElementById("chatbotInput");
    const message = input.value.trim();
    if (!message) return;
    
    const chatBox = document.getElementById("chatbotMessages");
    appendMessage("user", message);
    input.value = "";
    
    try {
        const res = await fetch(`${API}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message }),
        });
        const data = await res.json();
        appendMessage("ai", data.reply || getLocalResponse(message));
    } catch (error) {
        appendMessage("ai", getLocalResponse(message));
    }
}

function getLocalResponse(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes("track") || msg.includes("status")) {
        return "🔍 To track your complaint, go to 'My Complaints' section. You'll see the Status (Pending/In Progress/Resolved) and Tracking ID for each complaint. Share the Tracking ID with support for faster resolution.";
    }
    else if (msg.includes("complaint") && msg.includes("submit")) {
        return "📝 To submit a complaint: 1) Fill the issue title and description, 2) Click on the map to mark location, 3) Click Submit Complaint button. You'll receive a Tracking ID immediately.";
    }
    else if (msg.includes("department")) {
        return "🏢 Complaints are automatically routed to: Sanitation, Road, Water, Electricity, or General department based on keywords in your issue description.";
    }
    else if (msg.includes("risk")) {
        return "⚠️ Risk levels: Low (minor issues), Medium (regular problems), High (urgent matters), Critical (emergencies like fire, accident, death). Critical complaints trigger immediate alerts.";
    }
    else if (msg.includes("how long") || msg.includes("time")) {
        return "⏰ Resolution SLA: Low risk - 72 hours, Medium risk - 24 hours, High risk - 12 hours, Critical - 2 hours.";
    }
    else if (msg.includes("admin") || msg.includes("officer")) {
        return "👮 Admin can view all complaints, change status, and view analytics. Officers can update status of assigned complaints.";
    }
    else if (msg.includes("hello") || msg.includes("hi")) {
        return "👋 Hello! I'm your Smart Governance AI Assistant. How can I help you today? You can ask about submitting complaints, tracking status, departments, or resolution time.";
    }
    else {
        return "💡 I can help you with:\n- Submitting complaints\n- Tracking complaint status\n- Understanding departments & risk levels\n- Resolution timelines\n- Contacting admin\n\nPlease ask me anything about the grievance system!";
    }
}

function appendMessage(sender, text) {
    const chatBox = document.getElementById("chatbotMessages");
    const messageDiv = document.createElement("div");
    messageDiv.className = sender === "user" ? "chat-user" : "chat-ai";
    messageDiv.innerHTML = `<span>${text}</span>`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function clearChat() {
    const chatBox = document.getElementById("chatbotMessages");
    chatBox.innerHTML = '<div class="chat-ai"><span>👋 Hello! I\'m your Smart Governance AI Assistant. Ask me anything about the grievance system!</span></div>';
}

function minimizeChat() {
    const body = document.getElementById("chatbotBody");
    if (body) body.style.display = body.style.display === "none" ? "flex" : "none";
}

// Initialize chat on page load
window.addEventListener("load", () => {
    const chatBox = document.getElementById("chatbotMessages");
    if (chatBox && chatBox.children.length === 0) {
        chatBox.innerHTML = '<div class="chat-ai"><span>👋 Hello! I\'m your Smart Governance AI Assistant. Ask me anything about the grievance system!</span></div>';
    }
});
