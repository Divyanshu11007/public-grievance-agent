/* =========================================
   SOCKET.IO GLOBAL CLIENT
========================================= */

const socket =
  io("http://localhost:5000", {

    transports: [
      "websocket"
    ],

    reconnection: true,

    reconnectionAttempts: 10,

    reconnectionDelay: 1000,

});

/* =========================================
   CONNECTION EVENTS
========================================= */

socket.on(
  "connect",
  () => {

    console.log(
      "✅ Socket Connected:",
      socket.id
    );

  }
);

socket.on(
  "disconnect",
  () => {

    console.log(
      "❌ Socket Disconnected"
    );

  }
);

/* =========================================
   GLOBAL NOTIFICATION
========================================= */

function showToast(
  message,
  type = "info"
) {

  const toast =
    document.createElement(
      "div"
    );

  toast.className =
    `toast ${type}`;

  toast.innerHTML = `

    <div class="toast-content">

      <span>
        ${message}
      </span>

    </div>

  `;

  document.body.appendChild(
    toast
  );

  setTimeout(() => {

    toast.classList.add(
      "show"
    );

  }, 100);

  setTimeout(() => {

    toast.classList.remove(
      "show"
    );

    setTimeout(() => {

      toast.remove();

    }, 300);

  }, 4000);

}

/* =========================================
   NEW COMPLAINT EVENT
========================================= */

socket.on(
  "newComplaint",
  complaint => {

    console.log(
      "📢 New Complaint:",
      complaint
    );

    showToast(

      `New Complaint: ${complaint.issue}`,

      "info"

    );

    /* =========================
       AUTO RELOAD SECTIONS
    ========================= */

    if (
      typeof loadComplaints ===
      "function"
    ) {

      loadComplaints();

    }

    if (
      typeof loadCitizenComplaints ===
      "function"
    ) {

      loadCitizenComplaints();

    }

    if (
      typeof loadAnalytics ===
      "function"
    ) {

      loadAnalytics();

    }

  }
);

/* =========================================
   STATUS UPDATED EVENT
========================================= */

socket.on(
  "statusUpdated",
  data => {

    console.log(
      "🔄 Status Updated:",
      data
    );

    showToast(

      `Complaint status changed to ${data.status}`,

      "success"

    );

    if (
      typeof loadComplaints ===
      "function"
    ) {

      loadComplaints();

    }

    if (
      typeof loadCitizenComplaints ===
      "function"
    ) {

      loadCitizenComplaints();

    }

  }
);

/* =========================================
   CRITICAL ALERT EVENT
========================================= */

socket.on(
  "criticalAlert",
  alert => {

    console.log(
      "🚨 Critical Alert:",
      alert
    );

    showToast(

      `Critical Alert: ${alert.message}`,

      "danger"

    );

    if (
      typeof loadAlerts ===
      "function"
    ) {

      loadAlerts();

    }

  }
);

/* =========================================
   NEW ALERT EVENT
========================================= */

socket.on(
  "newAlert",
  alert => {

    console.log(
      "⚠ New Alert:",
      alert
    );

    showToast(

      `Alert: ${alert.title}`,

      "warning"

    );

    if (
      typeof loadAlerts ===
      "function"
    ) {

      loadAlerts();

    }

  }
);

/* =========================================
   LIVE ESCALATION EVENT
========================================= */

socket.on(
  "escalation",
  escalation => {

    console.log(
      "📈 Escalation:",
      escalation
    );

    showToast(

      `Escalated Complaint: ${escalation.issue}`,

      "danger"

    );

  }
);

/* =========================================
   OFFICER ASSIGNED EVENT
========================================= */

socket.on(
  "officerAssigned",
  data => {

    console.log(
      "👮 Officer Assigned:",
      data
    );

    showToast(

      `Officer assigned to complaint`,

      "success"

    );

  }
);

/* =========================================
   AI ANALYSIS EVENT
========================================= */

socket.on(
  "aiAnalysis",
  data => {

    console.log(
      "🤖 AI Analysis Ready:",
      data
    );

    showToast(

      `AI Analysis Completed`,

      "info"

    );

  }
);

/* =========================================
   JOIN ROLE ROOM
========================================= */

function joinRoom(
  role
) {

  socket.emit(
    "joinRoom",
    role
  );

  console.log(
    `Joined room: ${role}`
  );

}

/* =========================================
   SEND LIVE LOCATION
========================================= */

function sendLiveLocation(
  lat,
  lng
) {

  socket.emit(
    "liveLocation",

    {

      lat,
      lng,

    }
  );

}

/* =========================================
   TRACK LOCATION
========================================= */

function startLiveTracking() {

  if (
    navigator.geolocation
  ) {

    navigator.geolocation.watchPosition(

      position => {

        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;

        sendLiveLocation(
          lat,
          lng
        );

      },

      error => {

        console.log(error);

      },

      {

        enableHighAccuracy: true,

      }

    );

  }

}

/* =========================================
   CONNECTION ERROR
========================================= */

socket.on(
  "connect_error",
  err => {

    console.log(
      "Socket Error:",
      err.message
    );

    showToast(

      "Realtime server unavailable",

      "danger"

    );

  }
);

/* =========================================
   EXPOSE SOCKET GLOBALLY
========================================= */

window.socket = socket;