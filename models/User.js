/* =========================================
   USER MODEL
========================================= */

const mongoose =
  require("mongoose");

/* =========================================
   USER SCHEMA
========================================= */

const userSchema =
  new mongoose.Schema(

    {

      /* =========================
         BASIC INFO
      ========================= */

      name: {

        type: String,

        required: true,

        trim: true,

      },

      username: {

        type: String,

        required: true,

        unique: true,

        trim: true,

        lowercase: true,

      },

      password: {

        type: String,

        required: true,

      },

      /* =========================
         ROLE
      ========================= */

      role: {

        type: String,

        enum: [

          "admin",
          "officer",
          "citizen"

        ],

        default: "citizen",

      },

      /* =========================
         CONTACT INFO
      ========================= */

      email: {

        type: String,

        default: "",

        trim: true,

      },

      phone: {

        type: String,

        default: "",

        trim: true,

      },

      address: {

        type: String,

        default: "",

        trim: true,

      },

      /* =========================
         PROFILE
      ========================= */

      profileImage: {

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

      city: {

        type: String,

        default: "Unknown",

      },

      /* =========================
         ACCOUNT STATUS
      ========================= */

      isActive: {

        type: Boolean,

        default: true,

      },

      isVerified: {

        type: Boolean,

        default: false,

      },

      /* =========================
         LOGIN TRACKING
      ========================= */

      lastLogin: {

        type: Date,

      },

      /* =========================
         STATS
      ========================= */

      totalComplaints: {

        type: Number,

        default: 0,

      },

      resolvedComplaints: {

        type: Number,

        default: 0,

      },

      /* =========================
         AI / SYSTEM FLAGS
      ========================= */

      riskLevel: {

        type: String,

        enum: [

          "Low",
          "Medium",
          "High"

        ],

        default: "Low",

      }

    },

    {

      timestamps: true,

    }

  );

/* =========================================
   INDEXES
========================================= */

userSchema.index({
  username: 1
});

userSchema.index({
  role: 1
});

/* =========================================
   EXPORT MODEL
========================================= */

module.exports =
  mongoose.model(
    "User",
    userSchema
  );