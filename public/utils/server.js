/* =========================================
   SMART GOVERNANCE SERVER - DEBUGGED
========================================= */

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");

const Sentiment = require("sentiment");
const stringSimilarity = require("string-similarity");
const { GoogleGenerativeAI } = require("@google/generative-ai");

/* =========================================
   IMPORT ROUTES (Fixed paths)
========================================= */

const User = require("./models/User");
const Complaint = require("./models/Complaint");
const Alert = require("./models/Alert");
const auth = require("./middleware/auth");

// Import route files
const authRoutes = require("./routes/auth");
const complaintRoutes = require("./routes/complaint");
const alertRoutes = require("./routes/alert");
const analyticsRoutes = require("./routes/analytics");
const chatRoutes = require("./routes/chat");

/* =========================================
   APP CONFIG
========================================= */

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

/* =========================================
   MIDDLEWARE
========================================= */

app.use(cors());
app.use(express.json());
app.use(express.static("public/pages")); // Fixed: points to pages folder
app.use("/css", express.static("public/css"));
app.use("/js", express.static("public/js"));

/* =========================================
   MAKE IO AVAILABLE TO ROUTES
========================================= */

app.set("io", io);

/* =========================================
   GEMINI AI (Using stable model)
========================================= */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Changed to stable model

/* =========================================
   SENTIMENT
========================================= */

const sentiment = new Sentiment();

/* =========================================
   MONGODB CONNECTION (Fixed with options)
========================================= */

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.log("❌ MongoDB Error:", err.message));

/* =========================================
   SOCKET.IO
========================================= */

io.on("connection", (socket) => {
  console.log("✅ User Connected:", socket.id);
  socket.on("disconnect", () => console.log("❌ User Disconnected:", socket.id));
});

/* =========================================
   AI UTILITIES (For inline use)
========================================= */

function autoDepartment(issue) {
  issue = issue.toLowerCase();
  if (issue.includes("garbage") || issue.includes("waste") || issue.includes("clean")) return "Sanitation";
  if (issue.includes("road") || issue.includes("pothole") || issue.includes("street")) return "Road";
  if (issue.includes("water") || issue.includes("pipeline")) return "Water";
  if (issue.includes("light") || issue.includes("electric")) return "Electricity";
  return "General";
}

function riskScore(text) {
  text = text.toLowerCase();
  if (text.includes("death") || text.includes("fire") || text.includes("accident")) return "Critical";
  if (text.includes("urgent") || text.includes("danger")) return "High";
  if (text.includes("problem")) return "Medium";
  return "Low";
}

function clusterType(department) {
  const clusters = {
    Sanitation: "Urban Cleanliness",
    Road: "Infrastructure",
    Water: "Utilities",
    Electricity: "Power",
    General: "Public Issues",
  };
  return clusters[department] || "General Cluster";
}

/* =========================================
   ROUTES (Using route files)
========================================= */

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/chat", chatRoutes);

/* =========================================
   FALLBACK ROUTES (in case route files have issues)
========================================= */

// Register fallback
app.post("/api/auth/register-fallback", async (req, res) => {
  try {
    const { name, username, password, role, phone, address, email } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.json({ success: false, message: "Username exists" });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, username, password: hashed, role: role || "citizen", phone, address, email });
    await user.save();
    res.json({ success: true, message: "Registration Successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login fallback
app.post("/api/auth/login-fallback", async (req, res) => {
  try {
    let { username, password } = req.body;
    let user = await User.findOne({ username });
    if (!user && username.includes("@")) user = await User.findOne({ email: username });
    if (!user) return res.json({ success: false, message: "User not found" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false, message: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token, user: { name: user.name, role: user.role, id: user._id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================================
   DEFAULT ROUTE
========================================= */

app.get("/", (req, res) => {
  res.sendFile("login.html", { root: "./public/pages" });
});

/* =========================================
   SERVER START
========================================= */

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Login: http://localhost:${PORT}/login.html`);
  console.log(`📊 API: http://localhost:${PORT}/api`);
});