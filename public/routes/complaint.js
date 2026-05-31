/* =========================================
   COMPLAINT ROUTES
========================================= */

const express =
  require("express");

const router =
  express.Router();

const Sentiment =
  require("sentiment");

const stringSimilarity =
  require("string-similarity");

/* =========================================
   MODELS
========================================= */

const Complaint =
  require("../models/Complaint");

const Alert =
  require("../models/Alert");

const User =
  require("../models/User");

/* =========================================
   MIDDLEWARE
========================================= */

const auth =
  require("../middleware/auth");

const {
  roleAuth
} = require("../middleware/auth");

/* =========================================
   SENTIMENT
========================================= */

const sentiment =
  new Sentiment();

/* =========================================
   AI HELPERS
========================================= */

/* ========= AUTO DEPARTMENT ========= */

function autoDepartment(
  issue
) {

  issue =
    issue.toLowerCase();

  if (
    issue.includes("garbage") ||
    issue.includes("waste") ||
    issue.includes("clean")
  ) {

    return "Sanitation";

  }

  if (
    issue.includes("road") ||
    issue.includes("pothole")
  ) {

    return "Road";

  }

  if (
    issue.includes("water") ||
    issue.includes("pipeline")
  ) {

    return "Water";

  }

  if (
    issue.includes("light") ||
    issue.includes("electric")
  ) {

    return "Electricity";

  }

  return "General";

}

/* ========= RISK SCORE ========= */

function riskScore(
  issue
) {

  issue =
    issue.toLowerCase();

  if (
    issue.includes("fire") ||
    issue.includes("death") ||
    issue.includes("accident")
  ) {

    return "Critical";

  }

  if (
    issue.includes("danger") ||
    issue.includes("urgent")
  ) {

    return "High";

  }

  if (
    issue.includes("problem")
  ) {

    return "Medium";

  }

  return "Low";

}

/* ========= CLUSTER ========= */

function complaintCluster(
  department
) {

  const clusters = {

    Sanitation:
      "Urban Cleanliness",

    Road:
      "Infrastructure",

    Water:
      "Utilities",

    Electricity:
      "Power",

    General:
      "Citizen Issues",

  };

  return (
    clusters[department] ||
    "General Cluster"
  );

}

/* =========================================
   CREATE COMPLAINT
========================================= */

router.post(
  "/",
  auth,
  async (req, res) => {

    try {

      const {

        issue,
        description,
        lat,
        lng,
        ward,
        address

      } = req.body;

      /* =========================
         VALIDATION
      ========================= */

      if (
        !issue ||
        !lat ||
        !lng
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Required fields missing",

        });

      }

      /* =========================
         USER
      ========================= */

      const user =
        await User.findById(
          req.user.id
        );

      /* =========================
         DUPLICATE DETECTION
      ========================= */

      const existing =
        await Complaint.find();

      let duplicate =
        false;

      let duplicateScore =
        0;

      existing.forEach(c => {

        const score =
          stringSimilarity.compareTwoStrings(

            c.issue.toLowerCase(),

            issue.toLowerCase()

          );

        if (score > 0.7) {

          duplicate =
            true;

          duplicateScore =
            score;

        }

      });

      /* =========================
         AI FEATURES
      ========================= */

      const department =
        autoDepartment(issue);

      const risk =
        riskScore(issue);

      const cluster =
        complaintCluster(
          department
        );

      const sentimentResult =
        sentiment.analyze(issue);

      /* =========================
         CREATE COMPLAINT
      ========================= */

      const complaint =
        new Complaint({

          citizen:
            user.name,

          citizenId:
            user._id,

          issue,

          description,

          department,

          duplicate,

          duplicateScore,

          sentiment:
            sentimentResult.score,

          risk,

          cluster,

          ward:
            ward || "Unknown",

          address:
            address || "",

          location: {

            lat,
            lng,

          },

          timeline: [

            {

              status:
                "Pending",

              updatedBy:
                user.name,

              note:
                "Complaint created",

            }

          ]

        });

      await complaint.save();

      /* =========================
         UPDATE USER STATS
      ========================= */

      user.totalComplaints += 1;

      await user.save();

      /* =========================
         CREATE ALERT
      ========================= */

      if (
        risk === "Critical"
      ) {

        const alert =
          new Alert({

            title:
              "Critical Complaint",

            message:
              issue,

            type:
              "Critical",

            priority:
              "Critical",

            complaintId:
              complaint._id,

            ward:
              ward || "Unknown",

            targetRole:
              "admin",

            location: {

              lat,
              lng,

            }

          });

        await alert.save();

      }

      /* =========================
         RESPONSE
      ========================= */

      res.status(201).json({

        success: true,

        message:
          "Complaint submitted successfully",

        complaint,

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
   GET ALL COMPLAINTS
========================================= */

router.get(
  "/",
  auth,
  async (req, res) => {

    try {

      let complaints;

      /* =========================
         ROLE BASED FETCH
      ========================= */

      if (
        req.user.role ===
        "citizen"
      ) {

        complaints =
          await Complaint.find({

            citizenId:
              req.user.id,

          }).sort({

            createdAt: -1,

          });

      } else {

        complaints =
          await Complaint.find()
          .sort({

            createdAt: -1,

          });

      }

      res.json({

        success: true,

        complaints,

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
   GET SINGLE COMPLAINT
========================================= */

router.get(
  "/:id",
  auth,
  async (req, res) => {

    try {

      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {

        return res.status(404).json({

          success: false,

          message:
            "Complaint not found",

        });

      }

      /* =========================
         INCREMENT VIEWS
      ========================= */

      complaint.views += 1;

      await complaint.save();

      res.json({

        success: true,

        complaint,

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
   UPDATE STATUS
========================================= */

router.put(
  "/:id/status",
  auth,
  roleAuth([
    "admin",
    "officer"
  ]),
  async (req, res) => {

    try {

      const {

        status,
        note

      } = req.body;

      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {

        return res.status(404).json({

          success: false,

          message:
            "Complaint not found",

        });

      }

      /* =========================
         UPDATE STATUS
      ========================= */

      complaint.status =
        status;

      complaint.timeline.push({

        status,

        updatedBy:
          req.user.username,

        note:
          note || "",

      });

      await complaint.save();

      /* =========================
         RESOLVED STATS
      ========================= */

      if (
        status === "Resolved"
      ) {

        const user =
          await User.findById(
            complaint.citizenId
          );

        if (user) {

          user.resolvedComplaints += 1;

          await user.save();

        }

      }

      res.json({

        success: true,

        message:
          "Status updated",

        complaint,

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
   DELETE COMPLAINT
========================================= */

router.delete(
  "/:id",
  auth,
  roleAuth([
    "admin"
  ]),
  async (req, res) => {

    try {

      const complaint =
        await Complaint.findByIdAndDelete(
          req.params.id
        );

      if (!complaint) {

        return res.status(404).json({

          success: false,

          message:
            "Complaint not found",

        });

      }

      res.json({

        success: true,

        message:
          "Complaint deleted",

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