/* =========================================
   ANALYTICS ROUTES
========================================= */

const express =
  require("express");

const router =
  express.Router();

/* =========================================
   MODELS
========================================= */

const Complaint =
  require("../models/Complaint");

const User =
  require("../models/User");

const Alert =
  require("../models/Alert");

/* =========================================
   MIDDLEWARE
========================================= */

const auth =
  require("../middleware/auth");

const {
  roleAuth
} = require("../middleware/auth");

/* =========================================
   DASHBOARD ANALYTICS
========================================= */

router.get(
  "/dashboard",
  auth,
  async (req, res) => {

    try {

      /* =========================
         FETCH DATA
      ========================= */

      const complaints =
        await Complaint.find();

      const users =
        await User.find();

      const alerts =
        await Alert.find();

      /* =========================
         TOTAL COUNTS
      ========================= */

      const totalComplaints =
        complaints.length;

      const totalCitizens =
        users.filter(
          u => u.role === "citizen"
        ).length;

      const totalOfficers =
        users.filter(
          u => u.role === "officer"
        ).length;

      const totalAdmins =
        users.filter(
          u => u.role === "admin"
        ).length;

      const totalAlerts =
        alerts.length;

      /* =========================
         STATUS COUNTS
      ========================= */

      const pending =
        complaints.filter(
          c => c.status === "Pending"
        ).length;

      const assigned =
        complaints.filter(
          c => c.status === "Assigned"
        ).length;

      const inProgress =
        complaints.filter(
          c =>
            c.status ===
            "In Progress"
        ).length;

      const resolved =
        complaints.filter(
          c => c.status === "Resolved"
        ).length;

      const rejected =
        complaints.filter(
          c => c.status === "Rejected"
        ).length;

      /* =========================
         RISK ANALYTICS
      ========================= */

      const lowRisk =
        complaints.filter(
          c => c.risk === "Low"
        ).length;

      const mediumRisk =
        complaints.filter(
          c => c.risk === "Medium"
        ).length;

      const highRisk =
        complaints.filter(
          c => c.risk === "High"
        ).length;

      const criticalRisk =
        complaints.filter(
          c => c.risk === "Critical"
        ).length;

      /* =========================
         DEPARTMENT ANALYTICS
      ========================= */

      const sanitation =
        complaints.filter(
          c =>
            c.department ===
            "Sanitation"
        ).length;

      const road =
        complaints.filter(
          c =>
            c.department ===
            "Road"
        ).length;

      const water =
        complaints.filter(
          c =>
            c.department ===
            "Water"
        ).length;

      const electricity =
        complaints.filter(
          c =>
            c.department ===
            "Electricity"
        ).length;

      const general =
        complaints.filter(
          c =>
            c.department ===
            "General"
        ).length;

      /* =========================
         DUPLICATE ANALYTICS
      ========================= */

      const duplicates =
        complaints.filter(
          c => c.duplicate
        ).length;

      /* =========================
         RESPONSE
      ========================= */

      res.json({

        success: true,

        analytics: {

          totalComplaints,

          totalCitizens,

          totalOfficers,

          totalAdmins,

          totalAlerts,

          status: {

            pending,
            assigned,
            inProgress,
            resolved,
            rejected,

          },

          risk: {

            lowRisk,
            mediumRisk,
            highRisk,
            criticalRisk,

          },

          departments: {

            sanitation,
            road,
            water,
            electricity,
            general,

          },

          duplicates,

        }

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  }
);

/* =========================================
   HEATMAP DATA
========================================= */

router.get(
  "/heatmap",
  auth,
  async (req, res) => {

    try {

      const complaints =
        await Complaint.find();

      const heatmap =
        complaints.map(c => ({

          lat:
            c.location.lat,

          lng:
            c.location.lng,

          risk:
            c.risk,

          department:
            c.department,

          issue:
            c.issue,

          ward:
            c.ward,

        }));

      res.json({

        success: true,

        heatmap,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  }
);

/* =========================================
   WARD ANALYTICS
========================================= */

router.get(
  "/wards",
  auth,
  async (req, res) => {

    try {

      const complaints =
        await Complaint.find();

      const wardMap = {};

      complaints.forEach(c => {

        const ward =
          c.ward || "Unknown";

        if (!wardMap[ward]) {

          wardMap[ward] = {

            total: 0,

            resolved: 0,

            pending: 0,

            critical: 0,

          };

        }

        wardMap[ward].total++;

        if (
          c.status === "Resolved"
        ) {

          wardMap[ward]
            .resolved++;

        }

        if (
          c.status === "Pending"
        ) {

          wardMap[ward]
            .pending++;

        }

        if (
          c.risk === "Critical"
        ) {

          wardMap[ward]
            .critical++;

        }

      });

      res.json({

        success: true,

        wards:
          wardMap,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  }
);

/* =========================================
   CLUSTER ANALYTICS
========================================= */

router.get(
  "/clusters",
  auth,
  async (req, res) => {

    try {

      const complaints =
        await Complaint.find();

      const clusters = {};

      complaints.forEach(c => {

        const cluster =
          c.cluster ||
          "General Cluster";

        if (!clusters[cluster]) {

          clusters[cluster] = [];

        }

        clusters[cluster].push({

          issue:
            c.issue,

          department:
            c.department,

          risk:
            c.risk,

          status:
            c.status,

        });

      });

      res.json({

        success: true,

        clusters,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  }
);

/* =========================================
   TREND ANALYTICS
========================================= */

router.get(
  "/trends",
  auth,
  async (req, res) => {

    try {

      const complaints =
        await Complaint.find();

      const monthly = {};

      complaints.forEach(c => {

        const date =
          new Date(
            c.createdAt
          );

        const key =
          `${date.getFullYear()}-${date.getMonth() + 1}`;

        if (!monthly[key]) {

          monthly[key] = 0;

        }

        monthly[key]++;

      });

      res.json({

        success: true,

        trends:
          monthly,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  }
);

/* =========================================
   OFFICER PERFORMANCE
========================================= */

router.get(
  "/officers",
  auth,
  roleAuth([
    "admin"
  ]),
  async (req, res) => {

    try {

      const officers =
        await User.find({

          role: "officer"

        });

      const performance =
        await Promise.all(

          officers.map(
            async officer => {

              const assigned =
                await Complaint.find({

                  assignedOfficer:
                    officer._id

                });

              const resolved =
                assigned.filter(
                  c =>
                    c.status ===
                    "Resolved"
                ).length;

              return {

                officer:
                  officer.name,

                assigned:
                  assigned.length,

                resolved,

              };

            }
          )

        );

      res.json({

        success: true,

        performance,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  }
);

/* =========================================
   EXPORT ROUTER
========================================= */

module.exports =
  router;