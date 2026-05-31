require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");

const Sentiment = require("sentiment");
const stringSimilarity = require("string-similarity");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const adapter = new JSONFile('db.json');
const db = new Low(adapter, { users: [], complaints: [], alerts: [] });

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static("public/pages"));
app.use("/css", express.static("public/css"));
app.use("/js", express.static("public/js"));

// Gemini AI Setup
let genAI, model;
let geminiAvailable = false;

try {
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        geminiAvailable = true;
        console.log("✅ Gemini AI is ENABLED");
    } else {
        console.log("⚠️ Gemini AI is DISABLED (using local responses only)");
    }
} catch (error) {
    console.log("⚠️ Gemini AI setup failed, using local responses");
}

const sentiment = new Sentiment();

async function initDB() {
    await db.read();
    db.data ||= { users: [], complaints: [], alerts: [] };
    await db.write();
    console.log("✅ Local Database Ready");
}
initDB();

const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: "No token" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: "Invalid token" });
    }
};

io.on("connection", (socket) => {
    console.log("✅ User Connected:", socket.id);
    socket.on("disconnect", () => console.log("❌ User Disconnected:", socket.id));
});

function autoDepartment(issue) {
    issue = issue.toLowerCase();
    if (issue.includes("garbage") || issue.includes("waste") || issue.includes("clean")) return "Sanitation";
    if (issue.includes("road") || issue.includes("pothole") || issue.includes("street")) return "Road";
    if (issue.includes("water") || issue.includes("pipeline") || issue.includes("leak")) return "Water";
    if (issue.includes("light") || issue.includes("electric") || issue.includes("power")) return "Electricity";
    return "General";
}

function riskScore(text) {
    text = text.toLowerCase();
    if (text.includes("death") || text.includes("fire") || text.includes("accident") || text.includes("emergency")) return "Critical";
    if (text.includes("urgent") || text.includes("danger") || text.includes("severe")) return "High";
    if (text.includes("problem") || text.includes("issue")) return "Medium";
    return "Low";
}

// IMPROVED: Direct answers without generic menu
function getLocalResponse(message) {
    const msg = message.toLowerCase();
    
    // Time/Resolution questions
    if (msg.includes("how long") || msg.includes("time") || msg.includes("sla") || msg.includes("take") || msg.includes("resolve") || msg.includes("when will")) {
        return "⏰ Resolution time depends on the risk level of your complaint:\n\n🔴 Critical complaints (fire, accident, emergency): 2 hours\n🟠 High risk complaints: 12 hours\n🟡 Medium risk complaints: 24 hours\n🟢 Low risk complaints: 72 hours\n\nThe system automatically detects the risk level based on keywords in your complaint. You can check your complaint's status anytime in 'My Complaints' section.";
    }
    // Tracking questions
    else if (msg.includes("track") || msg.includes("status") || msg.includes("check") || msg.includes("where is my")) {
        return "🔍 To track your complaint:\n\n1. Go to 'My Complaints' section on your dashboard\n2. Each complaint shows a unique Tracking ID\n3. Status updates automatically when an admin or officer reviews it\n4. You'll receive real-time notifications when your complaint status changes\n\nYou can also share your Tracking ID with support for faster resolution.";
    }
    // Submission questions
    else if (msg.includes("submit") || msg.includes("register") || msg.includes("file") || msg.includes("how to add")) {
        return "📝 To submit a complaint:\n\n1. Enter your Issue Title and Description\n2. Select your Ward Number / Area\n3. Click on the map to mark your exact location\n4. Click 'Submit Complaint'\n\nYou'll receive a unique Tracking ID immediately. Your complaint will be automatically routed to the right department based on keywords!";
    }
    // Department questions
    else if (msg.includes("department") || msg.includes("routing") || msg.includes("which department")) {
        return "🏢 Complaints are automatically sent to the right department:\n\n• 🗑️ Sanitation - garbage, waste, cleaning\n• 🛣️ Road - potholes, roads, street lights\n• 💧 Water - water leakage, pipeline issues\n• ⚡ Electricity - power cuts, transformer issues\n• 🏥 Health - medical, hospital, disease\n• 👮 Police - crime, theft, security\n\nThe AI reads your complaint and routes it automatically - no need to select anything!";
    }
    // Risk level questions
    else if (msg.includes("risk") || msg.includes("level") || msg.includes("priority") || msg.includes("critical")) {
        return "⚠️ Risk levels are automatically detected:\n\n🔴 Critical - emergency situations like fire, accident, death (2 hour resolution)\n🟠 High - urgent matters that need quick attention (12 hours)\n🟡 Medium - regular problems that need fixing (24 hours)\n🟢 Low - minor issues that can wait (72 hours)\n\nCritical complaints trigger instant alerts to Admin for immediate action.";
    }
    // Hello/Hi
    else if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
        return "👋 Hello! I'm your AI Assistant. How can I help you today?\n\nYou can ask me about:\n• Complaint resolution time\n• How to track your complaint\n• How to submit a complaint\n• Department routing\n• Risk levels\n\nJust type your question!";
    }
    // Default - don't show generic menu, just ask for clarification
    else {
        return "I can help you with complaint-related questions. Try asking:\n\n• 'How long to resolve a complaint?'\n• 'How to track my complaint?'\n• 'How to submit a complaint?'\n• 'Which department handles garbage?'\n• 'What is a critical risk complaint?'";
    }
}

// ========== AUTH ROUTES ==========

app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, username, email, password, role } = req.body;
        await db.read();
        const existing = db.data.users.find(u => u.username === username || u.email === email);
        if (existing) return res.json({ success: false, message: "Username or email exists" });
        const hashed = await bcrypt.hash(password, 10);
        const user = { id: Date.now().toString(), name, username, email, password: hashed, role: role || "citizen", totalComplaints: 0, createdAt: new Date() };
        db.data.users.push(user);
        await db.write();
        res.json({ success: true, message: "Registration Successful" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        let { username, password } = req.body;
        await db.read();
        let user = db.data.users.find(u => u.username === username);
        if (!user && username?.includes("@")) user = db.data.users.find(u => u.email === username);
        if (!user) return res.json({ success: false, message: "User not found" });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.json({ success: false, message: "Invalid credentials" });
        const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ success: true, token, user: { name: user.name, role: user.role, id: user.id } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get("/api/auth/profile", auth, async (req, res) => {
    try {
        await db.read();
        const user = db.data.users.find(u => u.id === req.user.id);
        res.json({ success: true, user: { name: user.name, role: user.role, email: user.email } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== COMPLAINT ROUTES ==========

app.post("/api/complaints", auth, async (req, res) => {
    try {
        const { issue, description, lat, lng, ward, address } = req.body;
        if (!issue || !lat || !lng) return res.status(400).json({ success: false, message: "Required fields missing" });
        await db.read();
        const user = db.data.users.find(u => u.id === req.user.id);
        const department = autoDepartment(issue);
        const risk = riskScore(issue);
        const complaint = {
            _id: Date.now().toString(),
            citizen: user.name, citizenId: user.id,
            issue, description: description || "",
            department, risk, ward: ward || "Unknown", address: address || "",
            location: { lat, lng }, status: "Pending",
            trackingId: "CMP-" + Date.now(),
            timeline: [{ status: "Pending", updatedBy: user.name, note: "Complaint created", time: new Date() }],
            createdAt: new Date()
        };
        db.data.complaints.push(complaint);
        user.totalComplaints = (user.totalComplaints || 0) + 1;
        await db.write();
        if (risk === "Critical") {
            const alert = { _id: Date.now().toString(), message: `Critical: ${issue}`, priority: "Critical", complaintId: complaint._id, read: false, createdAt: new Date() };
            db.data.alerts.push(alert);
            await db.write();
            io.emit("criticalAlert", alert);
        }
        io.emit("newComplaint", complaint);
        res.status(201).json({ success: true, message: "Complaint Submitted", complaint });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get("/api/complaints", auth, async (req, res) => {
    try {
        await db.read();
        let complaints;
        if (req.user.role === "citizen") complaints = db.data.complaints.filter(c => c.citizenId === req.user.id).reverse();
        else complaints = [...db.data.complaints].reverse();
        res.json({ success: true, complaints });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put("/api/complaints/:id/status", auth, async (req, res) => {
    try {
        const { status, note } = req.body;
        await db.read();
        const complaint = db.data.complaints.find(c => c._id === req.params.id);
        if (!complaint) return res.status(404).json({ success: false });
        complaint.status = status;
        complaint.timeline.push({ status, updatedBy: req.user.username, note: note || "", time: new Date() });
        await db.write();
        io.emit("statusUpdated", complaint);
        res.json({ success: true, complaint });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== ANALYTICS ==========

app.get("/api/analytics/dashboard", auth, async (req, res) => {
    try {
        await db.read();
        const complaints = db.data.complaints;
        res.json({
            success: true,
            analytics: {
                totalComplaints: complaints.length,
                status: { pending: complaints.filter(c => c.status === "Pending").length, resolved: complaints.filter(c => c.status === "Resolved").length },
                risk: { criticalRisk: complaints.filter(c => c.risk === "Critical").length }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get("/api/alerts", auth, async (req, res) => {
    try {
        await db.read();
        res.json({ success: true, alerts: db.data.alerts.reverse() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put("/api/alerts/:id/read", auth, async (req, res) => {
    try {
        await db.read();
        const alert = db.data.alerts.find(a => a._id === req.params.id);
        if (alert) alert.read = true;
        await db.write();
        res.json({ success: true });
    } catch (error) {
        res.json({ success: true });
    }
});

// ========== CHAT ROUTE ==========

app.post("/api/chat", auth, async (req, res) => {
    try {
        const { message } = req.body;
        
        if (geminiAvailable && model) {
            try {
                const prompt = `You are a helpful AI assistant for a Public Grievance Resolution System. Answer the user's question directly and concisely. Keep responses friendly and helpful. User question: ${message}`;
                const result = await model.generateContent(prompt);
                const reply = result.response.text();
                if (reply && reply.length > 0) {
                    console.log("✅ Gemini response sent");
                    return res.json({ success: true, reply });
                }
            } catch (geminiError) {
                console.log("⚠️ Gemini failed:", geminiError.message);
            }
        }
        
        console.log("📝 Using local response fallback");
        const localReply = getLocalResponse(message);
        res.json({ success: true, reply: localReply });
        
    } catch (error) {
        console.log("Chat error:", error.message);
        res.json({ success: true, reply: getLocalResponse(req.body.message) });
    }
});

app.post("/api/chat/summary/:id", auth, async (req, res) => {
    try {
        await db.read();
        const complaint = db.data.complaints.find(c => c._id === req.params.id);
        const summary = `Issue: ${complaint.issue}\nDepartment: ${complaint.department}\nRisk: ${complaint.risk}\nStatus: ${complaint.status}\nTracking ID: ${complaint.trackingId}`;
        res.json({ success: true, summary });
    } catch (error) {
        res.json({ success: true, summary: "Summary not available" });
    }
});

app.get("/api/analytics/heatmap", auth, async (req, res) => {
    try {
        await db.read();
        const heatmap = db.data.complaints.map(c => ({ lat: c.location.lat, lng: c.location.lng, risk: c.risk }));
        res.json({ success: true, heatmap });
    } catch (error) {
        res.json({ success: true, heatmap: [] });
    }
});

app.get("/api/analytics/wards", auth, async (req, res) => {
    try {
        await db.read();
        const wards = {};
        db.data.complaints.forEach(c => {
            const ward = c.ward || "Unknown";
            if (!wards[ward]) wards[ward] = { total: 0, resolved: 0, pending: 0, critical: 0 };
            wards[ward].total++;
            if (c.status === "Resolved") wards[ward].resolved++;
            if (c.status === "Pending") wards[ward].pending++;
            if (c.risk === "Critical") wards[ward].critical++;
        });
        res.json({ success: true, wards });
    } catch (error) {
        res.json({ success: true, wards: {} });
    }
});

app.get("/api/analytics/clusters", auth, async (req, res) => {
    try {
        await db.read();
        const clusters = {};
        db.data.complaints.forEach(c => {
            const dept = c.department || "General";
            if (!clusters[dept]) clusters[dept] = [];
            clusters[dept].push(c.issue);
        });
        res.json({ success: true, clusters });
    } catch (error) {
        res.json({ success: true, clusters: {} });
    }
});

app.get("/api/analytics/trends", auth, async (req, res) => {
    try {
        await db.read();
        const trends = {};
        db.data.complaints.forEach(c => {
            const date = new Date(c.createdAt).toLocaleDateString();
            trends[date] = (trends[date] || 0) + 1;
        });
        res.json({ success: true, trends });
    } catch (error) {
        res.json({ success: true, trends: {} });
    }
});

app.post("/api/alerts", auth, async (req, res) => {
    try {
        const { title, message, priority, targetRole } = req.body;
        await db.read();
        const alert = {
            _id: Date.now().toString(),
            title: title || "System Alert",
            message: message,
            priority: priority || "Medium",
            targetRole: targetRole || "all",
            read: false,
            createdAt: new Date()
        };
        db.data.alerts.push(alert);
        await db.write();
        io.emit("newAlert", alert);
        res.status(201).json({ success: true, alert });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get("/", (req, res) => {
    res.sendFile("login.html", { root: "./public/pages" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Register: http://localhost:${PORT}/register.html`);
    console.log(`🔐 Login: http://localhost:${PORT}/login.html`);
    console.log(`✅ No MongoDB needed! Data saved in db.json`);
});
