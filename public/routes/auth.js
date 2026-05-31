/* =========================================
   AUTH ROUTES
========================================= */

const express =
  require("express");

const bcrypt =
  require("bcryptjs");

const jwt =
  require("jsonwebtoken");

const router =
  express.Router();

/* =========================================
   MODELS
========================================= */

const User =
  require("../models/User");

/* =========================================
   REGISTER
========================================= */

router.post(
  "/register",
  async (req, res) => {

    try {

      const {

        name,
        username,
        password,
        role,
        phone,
        address,
        email

      } = req.body;

      /* =========================
         VALIDATION
      ========================= */

      if (
        !name ||
        !username ||
        !password
      ) {

        return res.status(400).json({

          success: false,

          message:
            "All required fields must be filled",

        });

      }

      /* =========================
         CHECK USER EXISTS
      ========================= */

      const existingUser =
        await User.findOne({

          username:
            username.toLowerCase(),

        });

      if (existingUser) {

        return res.status(400).json({

          success: false,

          message:
            "Username already exists",

        });

      }

      /* =========================
         HASH PASSWORD
      ========================= */

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      /* =========================
         CREATE USER
      ========================= */

      const user =
        new User({

          name,

          username:
            username.toLowerCase(),

          password:
            hashedPassword,

          role:
            role || "citizen",

          phone:
            phone || "",

          address:
            address || "",

          email:
            email || "",

        });

      await user.save();

      res.status(201).json({

        success: true,

        message:
          "Registration successful",

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Server error",

      });

    }

  }
);

/* =========================================
   LOGIN
========================================= */

router.post(
  "/login",
  async (req, res) => {

    try {

      const {

        username,
        password

      } = req.body;

      /* =========================
         VALIDATION
      ========================= */

      if (
        !username ||
        !password
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Username and password required",

        });

      }

      /* =========================
         FIND USER
      ========================= */

      const user =
        await User.findOne({

          username:
            username.toLowerCase(),

        });

      if (!user) {

        return res.status(404).json({

          success: false,

          message:
            "User not found",

        });

      }

      /* =========================
         CHECK PASSWORD
      ========================= */

      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isMatch) {

        return res.status(401).json({

          success: false,

          message:
            "Invalid credentials",

        });

      }

      /* =========================
         UPDATE LAST LOGIN
      ========================= */

      user.lastLogin =
        new Date();

      await user.save();

      /* =========================
         GENERATE TOKEN
      ========================= */

      const token =
        jwt.sign(

          {

            id: user._id,

            role: user.role,

            username:
              user.username,

          },

          process.env.JWT_SECRET,

          {

            expiresIn: "7d",

          }

        );

      /* =========================
         RESPONSE
      ========================= */

      res.json({

        success: true,

        token,

        user: {

          id: user._id,

          name: user.name,

          username:
            user.username,

          role: user.role,

          phone:
            user.phone,

          email:
            user.email,

        }

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Server error",

      });

    }

  }
);

/* =========================================
   GET PROFILE
========================================= */

const auth =
  require("../middleware/auth");

router.get(
  "/profile",
  auth,
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.user.id
        ).select("-password");

      if (!user) {

        return res.status(404).json({

          success: false,

          message:
            "User not found",

        });

      }

      res.json({

        success: true,

        user,

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
   UPDATE PROFILE
========================================= */

router.put(
  "/profile",
  auth,
  async (req, res) => {

    try {

      const {

        name,
        phone,
        address,
        email

      } = req.body;

      const user =
        await User.findByIdAndUpdate(

          req.user.id,

          {

            name,
            phone,
            address,
            email,

          },

          {

            new: true,

          }

        ).select("-password");

      res.json({

        success: true,

        message:
          "Profile updated",

        user,

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