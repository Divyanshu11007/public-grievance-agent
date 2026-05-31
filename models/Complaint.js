/* =========================================
   COMPLAINT MODEL
========================================= */

const mongoose =
  require("mongoose");

/* =========================================
   COMPLAINT SCHEMA
========================================= */

const complaintSchema =
  new mongoose.Schema(

    {

      /* =========================
         CITIZEN INFO
      ========================= */

      citizen: {

        type: String,

        required: true,

        trim: true,

      },

      citizenId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

      },

      /* =========================
         COMPLAINT DETAILS
      ========================= */

      issue: {

        type: String,

        required: true,

        trim: true,

      },

      description: {

        type: String,

        default: "",

      },

      category: {

        type: String,

        default: "General",

      },

      department: {

        type: String,

        enum: [

          "Sanitation",
          "Road",
          "Water",
          "Electricity",
          "General"

        ],

        default: "General",

      },

      /* =========================
         AI FEATURES
      ========================= */

      duplicate: {

        type: Boolean,

        default: false,

      },

      duplicateScore: {

        type: Number,

        default: 0,

      },

      sentiment: {

        type: Number,

        default: 0,

      },

      risk: {

        type: String,

        enum: [

          "Low",
          "Medium",
          "High",
          "Critical"

        ],

        default: "Low",

      },

      cluster: {

        type: String,

        default: "General Cluster",

      },

      aiSummary: {

        type: String,

        default: "",

      },

      /* =========================
         STATUS
      ========================= */

      status: {

        type: String,

        enum: [

          "Pending",
          "Assigned",
          "In Progress",
          "Resolved",
          "Rejected"

        ],

        default: "Pending",

      },

      priority: {

        type: String,

        enum: [

          "Low",
          "Medium",
          "High"

        ],

        default: "Medium",

      },

      /* =========================
         OFFICER ASSIGNMENT
      ========================= */

      assignedOfficer: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

      },

      officerNotes: {

        type: String,

        default: "",

      },

      /* =========================
         LOCATION
      ========================= */

      ward: {

        type: String,

        default: "Unknown",

      },

      address: {

        type: String,

        default: "",

      },

      location: {

        lat: {

          type: Number,

          required: true,

        },

        lng: {

          type: Number,

          required: true,

        }

      },

      /* =========================
         MEDIA
      ========================= */

      image: {

        type: String,

        default: "",

      },

      attachment: {

        type: String,

        default: "",

      },

      /* =========================
         TIMELINE
      ========================= */

      timeline: [

        {

          status: String,

          updatedBy: String,

          note: String,

          time: {

            type: Date,

            default: Date.now,

          }

        }

      ],

      /* =========================
         TRACKING
      ========================= */

      trackingId: {

        type: String,

      },

      views: {

        type: Number,

        default: 0,

      },

      escalationLevel: {

        type: Number,

        default: 0,

      }

    },

    {

      timestamps: true,

    }

  );

/* =========================================
   AUTO TRACKING ID
========================================= */

complaintSchema.pre(
  "save",
  function (next) {

    if (!this.trackingId) {

      this.trackingId =
        "CMP-" +
        Date.now();

    }

    next();

  }
);

/* =========================================
   INDEXES
========================================= */

complaintSchema.index({
  department: 1
});

complaintSchema.index({
  status: 1
});

complaintSchema.index({
  risk: 1
});

complaintSchema.index({
  ward: 1
});

/* =========================================
   EXPORT MODEL
========================================= */

module.exports =
  mongoose.model(
    "Complaint",
    complaintSchema
  );