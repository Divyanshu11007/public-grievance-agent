/* =========================================
   utils/ai.js
   Gemini Multi-Model Fallback System
========================================= */

const axios = require("axios");

/* =========================================
   AVAILABLE MODELS
========================================= */

const GEMINI_MODELS = [

  "gemini-2.5-flash",

  "gemini-2.5-pro",

  "gemini-2.0-flash",

  "gemini-2.0-flash-lite",

  "gemini-3.5-flash",

  "gemini-3.1-flash-lite",

  "gemini-3.1-pro",

  "gemini-2.5-flash-lite",

  "gemini-3-flash"

];

/* =========================================
   API KEY
========================================= */

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY;

/* =========================================
   GENERIC GEMINI CALL
========================================= */

const callGemini =
  async prompt => {

    for (const model of GEMINI_MODELS) {

      try {

        console.log(
          `Trying model: ${model}`
        );

        const url =

          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

        const response =
          await axios.post(

            url,

            {

              contents: [

                {

                  parts: [

                    {

                      text: prompt

                    }

                  ]

                }

              ],

              generationConfig: {

                temperature: 0.7,

                maxOutputTokens: 2048

              }

            },

            {

              headers: {

                "Content-Type":
                  "application/json"

              },

              timeout: 20000

            }

          );

        /* =========================
           SUCCESS
        ========================= */

        const text =

          response.data
          ?.candidates?.[0]
          ?.content?.parts?.[0]
          ?.text;

        if (text) {

          console.log(
            `Success using: ${model}`
          );

          return {

            success: true,

            model,

            text

          };

        }

      } catch (error) {

        console.log(

          `Model failed: ${model}`,

          error.response?.data ||
          error.message

        );

      }

    }

    /* =========================
       ALL FAILED
    ========================= */

    return {

      success: false,

      model: null,

      text:
        "AI service unavailable."

    };

  };

/* =========================================
   AI SUMMARY
========================================= */

const generateSummary =
  async complaint => {

    const prompt = `

      You are a Smart Governance AI.

      Analyze this complaint and provide:

      1. Short Summary
      2. Department
      3. Risk Level
      4. Suggested Action

      Complaint:
      ${complaint}

    `;

    const result =
      await callGemini(
        prompt
      );

    return result.text;

  };

/* =========================================
   SENTIMENT ANALYSIS
========================================= */

const analyzeSentiment =
  async text => {

    const prompt = `

      Analyze sentiment.

      Return ONLY:
      Positive
      Neutral
      Negative

      Text:
      ${text}

    `;

    const result =
      await callGemini(
        prompt
      );

    return result.text.trim();

  };

/* =========================================
   RISK SCORE
========================================= */

const generateRiskScore =
  async text => {

    const prompt = `

      Analyze severity.

      Return ONLY:
      Low
      Medium
      High
      Critical

      Complaint:
      ${text}

    `;

    const result =
      await callGemini(
        prompt
      );

    return result.text.trim();

  };

/* =========================================
   AUTO ROUTING
========================================= */

const autoRouteDepartment =
  async text => {

    const prompt = `

      Determine department.

      Return ONLY one:
      Water
      Electricity
      Roads
      Sanitation
      Health
      Police
      Environment
      Transport

      Complaint:
      ${text}

    `;

    const result =
      await callGemini(
        prompt
      );

    return result.text.trim();

  };

/* =========================================
   CHATBOT
========================================= */

const governanceChatbot =
  async message => {

    const prompt = `

      You are a Government AI Assistant.

      Help citizens regarding:
      complaints,
      tracking,
      departments,
      emergencies.

      User:
      ${message}

    `;

    const result =
      await callGemini(
        prompt
      );

    return result.text;

  };

/* =========================================
   DUPLICATE DETECTION
========================================= */

const detectDuplicate =
  async (
    newComplaint,
    existingComplaints
  ) => {

    try {

      const existingText =
        existingComplaints

        .map(c =>

          `${c.issue} ${c.description}`

        )

        .join("\n");

      const prompt = `

        Check duplicate complaint.

        Existing:
        ${existingText}

        New:
        ${newComplaint}

        Return ONLY:
        Duplicate
        OR
        Unique

      `;

      const result =
        await callGemini(
          prompt
        );

      return result.text
        .toLowerCase()
        .includes(
          "duplicate"
        );

    } catch (error) {

      console.log(
        "Duplicate Error:",
        error.message
      );

      return false;

    }

  };

/* =========================================
   SEMANTIC SIMILARITY
========================================= */

const semanticSimilarity =
  async (
    text1,
    text2
  ) => {

    try {

      const prompt = `

        Compare these two complaints.

        Return ONLY a similarity score
        between 0 and 1.

        Complaint 1:
        ${text1}

        Complaint 2:
        ${text2}

      `;

      const result =
        await callGemini(
          prompt
        );

      const score =
        parseFloat(
          result.text
        );

      if (isNaN(score)) {

        return 0.5;

      }

      return score;

    } catch (error) {

      console.log(
        "Similarity Error:",
        error.message
      );

      return 0.5;

    }

  };

/* =========================================
   CLUSTERING
========================================= */

const clusterComplaints =
  complaints => {

    const grouped = {};

    complaints.forEach(
      complaint => {

        const dept =

          complaint.department ||
          "General";

        if (!grouped[dept]) {

          grouped[dept] = [];

        }

        grouped[dept]
        .push(complaint);

      }
    );

    return grouped;

  };

/* =========================================
   EXPORTS
========================================= */

module.exports = {

  callGemini,

  generateSummary,

  analyzeSentiment,

  generateRiskScore,

  autoRouteDepartment,

  governanceChatbot,

  detectDuplicate,

  semanticSimilarity,

  clusterComplaints

};