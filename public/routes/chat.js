/* =========================================
   CHAT ROUTES
========================================= */

const express =
  require("express");

const router =
  express.Router();

/* =========================================
   GEMINI AI
========================================= */

const {
  GoogleGenerativeAI
} = require(
  "@google/generative-ai"
);

/* =========================================
   MODELS
========================================= */

const Complaint =
  require("../models/Complaint");

const Alert =
  require("../models/Alert");

/* =========================================
   MIDDLEWARE
========================================= */

const auth =
  require("../middleware/auth");

/* =========================================
   GEMINI CONFIG
========================================= */

const genAI =
  new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
  );

const model =
  genAI.getGenerativeModel({

    model:
      "gemini-2.5-flash",

  });

/* =========================================
   AI SYSTEM PROMPT
========================================= */

const systemPrompt = `

You are Smart Governance AI Assistant.

Your role:
- Help citizens register complaints
- Help officers understand complaints
- Help admins with analytics
- Be concise and professional
- Suggest departments automatically
- Give civic guidance
- Explain complaint statuses

Departments:
- Sanitation
- Road
- Water
- Electricity
- General

Risk Levels:
- Low
- Medium
- High
- Critical

Never generate harmful or illegal content.

`;

/* =========================================
   GENERAL CHAT
========================================= */

router.post(
  "/",
  auth,
  async (req, res) => {

    try {

      const {

        message

      } = req.body;

      if (!message) {

        return res.status(400).json({

          success: false,

          message:
            "Message required",

        });

      }

      /* =========================
         GEMINI RESPONSE
      ========================= */

      const result =
        await model.generateContent(

          `
          ${systemPrompt}

          User:
          ${message}

          AI:
          `

        );

      const reply =
        result.response.text();

      res.json({

        success: true,

        reply,

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        reply:
          "AI service unavailable",

      });

    }

  }
);

/* =========================================
   AI COMPLAINT SUMMARY
========================================= */

router.post(
  "/summary/:id",
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
         GENERATE SUMMARY
      ========================= */

      const result =
        await model.generateContent(

          `
          Summarize this public grievance complaint.

          Complaint:
          ${complaint.issue}

          Description:
          ${complaint.description}

          Department:
          ${complaint.department}

          Risk:
          ${complaint.risk}

          Give:
          - short summary
          - urgency
          - suggested action

          `

        );

      const summary =
        result.response.text();

      complaint.aiSummary =
        summary;

      await complaint.save();

      res.json({

        success: true,

        summary,

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Summary generation failed",

      });

    }

  }
);

/* =========================================
   AI INCIDENT ANALYSIS
========================================= */

router.get(
  "/incident-analysis",
  auth,
  async (req, res) => {

    try {

      const complaints =
        await Complaint.find()
        .sort({
          createdAt: -1
        })
        .limit(20);

      const alerts =
        await Alert.find()
        .sort({
          createdAt: -1
        })
        .limit(10);

      const complaintText =
        complaints.map(c =>

          `
          Issue: ${c.issue}
          Department: ${c.department}
          Risk: ${c.risk}
          Status: ${c.status}
          `

        ).join("\n");

      const alertText =
        alerts.map(a =>

          `
          Alert: ${a.message}
          Priority: ${a.priority}
          `

        ).join("\n");

      /* =========================
         GEMINI ANALYSIS
      ========================= */

      const result =
        await model.generateContent(

          `
          Analyze city governance incidents.

          Complaints:
          ${complaintText}

          Alerts:
          ${alertText}

          Provide:
          - major issues
          - recurring problems
          - high risk zones
          - suggested improvements
          - officer recommendations

          `

        );

      const analysis =
        result.response.text();

      res.json({

        success: true,

        analysis,

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Analysis failed",

      });

    }

  }
);

/* =========================================
   AI SMART SEARCH
========================================= */

router.post(
  "/smart-search",
  auth,
  async (req, res) => {

    try {

      const {

        query

      } = req.body;

      const complaints =
        await Complaint.find();

      const searchable =
        complaints.map(c =>

          `
          Complaint:
          ${c.issue}

          Department:
          ${c.department}

          Status:
          ${c.status}

          Risk:
          ${c.risk}
          `

        ).join("\n");

      /* =========================
         AI SEARCH
      ========================= */

      const result =
        await model.generateContent(

          `
          Search relevant complaints.

          User Query:
          ${query}

          Complaints:
          ${searchable}

          Return most relevant complaint insights.

          `

        );

      const response =
        result.response.text();

      res.json({

        success: true,

        result:
          response,

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Search failed",

      });

    }

  }
);

/* =========================================
   AI GOVERNANCE TIPS
========================================= */

router.get(
  "/tips",
  auth,
  async (req, res) => {

    try {

      const result =
        await model.generateContent(

          `
          Generate 5 smart city governance tips
          for citizens and officers.
          Keep them short and practical.
          `

        );

      const tips =
        result.response.text();

      res.json({

        success: true,

        tips,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          "Unable to generate tips",

      });

    }

  }
);

/* =========================================
   EXPORT ROUTER
========================================= */

module.exports =
  router;