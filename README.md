# Public Grievance Resolution Agent

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-black)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## Overview

A **Smart Governance Platform** that bridges the gap between citizens and government authorities. Citizens can register complaints, track their status in real-time, and get AI-powered assistance. The system automatically detects complaint departments and risk levels, ensuring faster resolution of public grievances.

### Problem Statement
Citizens face difficulties in reporting public issues like garbage collection, road damage, water leakage, and electricity problems. There is no unified platform to track complaint status or get timely updates.

### Solution
A comprehensive grievance resolution system with:
- **AI-powered department routing**
- **Real-time status tracking**
- **Role-based dashboards** (Citizen, Officer, Admin)
- **Emergency escalation** for critical issues
- **AI Chatbot** for instant assistance

---

## Features

### For Citizens
| Feature | Description |
|---------|-------------|
| **Smart Registration** | Role-based access with secure authentication |
| **Map Location** | Click on map or use GPS to mark complaint location |
| **AI Department Routing** | Automatically routes to Sanitation, Road, Water, or Electricity |
| **Risk Detection** | Critical/High/Medium/Low based on keywords |
| **Tracking ID** | Unique ID for each complaint |
| **AI Chatbot** | 24/7 assistance for queries |
| **Status Tracking** | Real-time updates (Pending → Assigned → In Progress → Resolved) |
| **History View** | Complete complaint history with timelines |

### For Officers
| Feature | Description |
|---------|-------------|
| **Assigned Complaints** | View complaints assigned to you |
| **Status Update** | Update complaint status |
| **Emergency Escalation** | Direct alert to Admin for urgent issues |
| **AI Summary** | Get AI-generated complaint analysis |
| **Department Notes** | Save internal notes locally |
| **AI Insights** | Real-time analytics dashboard |

### For Admin
| Feature | Description |
|---------|-------------|
| **Complete Analytics** | Total, Pending, Assigned, In Progress, Resolved |
| **Heatmap View** | Visualize complaint locations |
| **Live Alerts** | Real-time critical alerts from officers |
| **Status Management** | Update any complaint status |
| **AI Summary** | AI analysis for any complaint |
| **Search & Filter** | Search by title, ID, department, ward |
| **Ward Analytics** | Complaint distribution by ward |

### AI Capabilities
| Feature | How it works |
|---------|---------------|
| **Department Routing** | Keywords like "garbage" → Sanitation, "pothole" → Road |
| **Risk Detection** | "fire" → Critical (2hrs), "urgent" → High (12hrs) |
| **Duplicate Detection** | 70% similarity threshold |
| **Sentiment Analysis** | Positive/Neutral/Negative detection |
| **AI Chatbot** | Gemini AI + Local fallback responses |

---

## Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Backend** | Node.js + Express.js | Server & API |
| **Database** | LowDB (File-based) | Lightweight storage |
| **Real-time** | Socket.io | Live updates |
| **Maps** | Leaflet + OpenStreetMap | Location selection |
| **AI** | Google Gemini API | AI features |
| **Frontend** | HTML5, CSS3, JavaScript | UI/UX |
| **Icons** | Font Awesome 6 | Visual elements |
| **Fonts** | Google Inter | Typography |

---

## Project Structure

public_grievance/
│
├── server.js # Main server entry point
├── package.json # Dependencies
├── .env # Environment variables
├── db.json # Database (auto-generated)
│
├── models/ # Database models
│ ├── User.js
│ ├── Complaint.js
│ └── Alert.js
│
├── middleware/ # Authentication
│ └── auth.js
│
├── routes/ # API routes
│ ├── auth.js
│ ├── complaint.js
│ ├── alert.js
│ ├── analytics.js
│ └── chat.js
│
├── utils/ # Utility functions
│ ├── ai.js
│ ├── sentiment.js
│ ├── routing.js
│ ├── duplicate.js
│ └── clustering.js
│
└── public/ # Frontend files
├── pages/ # HTML pages
│ ├── login.html
│ ├── register.html
│ ├── citizen.html
│ ├── officer.html
│ └── admin.html
├── css/ # Stylesheets
│ └── style.css
└── js/ # Client-side scripts
├── app.js
├── socket.js
├── citizen.js
├── officer.js
├── admin.js
└── chatbot.js

---

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Step-by-Step Guide

1. **Clone the repository**

git clone https://github.com/Divyanshu11007/public-grievance-agent.git
cd public-grievance-agent
npm install
node server.js
http://localhost:5000/register.html

2.## Demo Accounts

| Role | Username | Password |
|------|----------|----------|
|**Citizen** | `citizen` | `123456` |
|**Officer** | `officer` | `123456` |
|**Admin** | `admin` | `123456` |

**Note:** You can also register your own account by selecting the role during registration.

## Risk Levels & Resolution SLA

| Level | Color | Resolution Time | Keywords |
|-------|-------|-----------------|----------|
| 🔴 Critical | Red | 2 hours | fire, accident, death, emergency |
| 🟠 High | Orange | 12 hours | urgent, danger, severe |
| 🟡 Medium | Yellow | 24 hours | problem, issue |
| 🟢 Low | Green | 72 hours | general complaints |

**Note:** Risk levels are automatically detected by AI based on keywords in the complaint description.

## Map Features

| Feature | Description |
|---------|-------------|
|**Click to Select** | Click anywhere on the map to mark complaint location |
|**Search Location** | Search by city, landmark, or full address |
|**Current Location** | Use device GPS to auto-detect your location |
|**Marker Popup** | Shows selected location details with coordinates |

**Note:** You can also type any address or landmark in the search box to quickly find your location.

## Complaint Status Flow
 
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Pending   │────▶│   Assigned  │────▶│ In Progress │────▶│  Resolved   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      ↑                   ↑                   ↑                   ↑
   Submitted          Officer           Working on         Completed
   by Citizen         Assigned           the issue

## AI Chatbot Commands

| Question | Response |
|----------|----------|
| "How to submit a complaint?" | Shows step-by-step submission guide |
| "How to track my complaint?" | Explains tracking process with ID |
| "How long to resolve?" | Shows SLA based on risk level |
| "Which department handles garbage?" | Shows department routing rules |
| "What is critical risk?" | Explains risk levels and resolution time |

**Note:** AI automatically detects risk levels and departments from your complaint text.

## Team Contributions

### Vansh Gupta - Backend Developer
- Created initial project files
- Setup Express server, Socket.io, MongoDB connection
- Designed database models (User, Complaint, Alert)
- Implemented basic authentication and routes
- Initial AI integration (Gemini API setup)

---

### Divyanshu Gupte - Debugging & UI Developer
- **Debugged files** - Fixed authentication, routing, and database issues
- **Redesigned complete UI** - Modern glass-morphism design for all dashboards
- **Added map location search** - Search any address/landmark with auto-location
- **Implemented live alerts system** - Real-time escalations with mark as read
- **Created status-based sections** - Pending, Assigned, In Progress, Resolved
- **Enhanced AI chatbot** - Improved responses with local fallback
- **Fixed Socket.io issues** - Real-time notifications working
- **Tested all features** - Ensured 100% functionality
- **Deployed on GitHub** - Final project hosting
- **Created documentation** - Professional README and setup guides

---

## 📊 Work Summary

| Phase | Primary Contributor |
|-------|---------------------|
| Initial Project Structure | Vansh Gupta |
| Backend Setup & Database Models | Vansh Gupta |
| Debugging & Bug Fixes | Divyanshu Gupte |
| UI/UX Redesign | Divyanshu Gupte |
| Feature Additions (Map, Alerts, Sections) | Divyanshu Gupte |
| AI Chatbot Enhancement | Divyanshu Gupte |
| Testing & Quality Assurance | Divyanshu Gupte |
| Deployment & Documentation | Divyanshu Gupte |

---

## Acknowledgements

| Service | Purpose |
|---------|---------|
| [OpenStreetMap](https://www.openstreetmap.org/) | Free map tiles |
| [Leaflet.js](https://leafletjs.com/) | Interactive maps |
| [Google Gemini AI](https://deepmind.google/technologies/gemini/) | AI capabilities |
| [Font Awesome](https://fontawesome.com/) | Icons |
| [Google Fonts](https://fonts.google.com/) | Inter font family |

---

## 📄 License

This project is licensed under the **MIT License** - feel free to use, modify, and distribute.

