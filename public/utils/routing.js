/* =========================================
   utils/routing.js
   Smart Department Routing Utility
========================================= */

/* =========================================
   DEPARTMENT KEYWORDS
========================================= */

const departmentKeywords = {

  Water: [

    "water",
    "pipeline",
    "pipe",
    "leakage",
    "drain",
    "sewer",
    "drainage",
    "tank",
    "tap",
    "supply",
    "flood"

  ],

  Electricity: [

    "electricity",
    "power",
    "transformer",
    "wire",
    "voltage",
    "electric",
    "short circuit",
    "street light",
    "blackout"

  ],

  Roads: [

    "road",
    "street",
    "pothole",
    "traffic",
    "bridge",
    "highway",
    "construction",
    "footpath"

  ],

  Sanitation: [

    "garbage",
    "waste",
    "trash",
    "cleaning",
    "dirty",
    "sanitation",
    "dump",
    "smell",
    "toilet"

  ],

  Health: [

    "hospital",
    "health",
    "ambulance",
    "medicine",
    "medical",
    "disease",
    "infection",
    "mosquito"

  ],

  Police: [

    "crime",
    "theft",
    "fight",
    "violence",
    "police",
    "security",
    "robbery",
    "harassment"

  ],

  Environment: [

    "pollution",
    "tree",
    "smoke",
    "air",
    "environment",
    "river",
    "chemical",
    "factory"

  ],

  Transport: [

    "bus",
    "transport",
    "metro",
    "train",
    "auto",
    "taxi",
    "vehicle",
    "parking"

  ]

};

/* =========================================
   CLEAN TEXT
========================================= */

const cleanText =
  text => {

    if (!text) return "";

    return text

      .toLowerCase()

      .replace(/[^\w\s]/g, "")

      .trim();

  };

/* =========================================
   SCORE DEPARTMENT
========================================= */

const scoreDepartment =
  (
    text,
    keywords
  ) => {

    let score = 0;

    keywords.forEach(
      keyword => {

        if (
          text.includes(
            keyword
          )
        ) {

          score++;

        }

      }
    );

    return score;

  };

/* =========================================
   AUTO ROUTE DEPARTMENT
========================================= */

const autoRouteDepartment =
  complaintText => {

    try {

      const text =
        cleanText(
          complaintText
        );

      let bestDepartment =
        "General";

      let highestScore = 0;

      Object.keys(
        departmentKeywords
      ).forEach(
        department => {

          const score =
            scoreDepartment(

              text,

              departmentKeywords[
                department
              ]

            );

          if (
            score >
            highestScore
          ) {

            highestScore =
              score;

            bestDepartment =
              department;

          }

        }
      );

      return {

        department:
          bestDepartment,

        confidence:
          highestScore,

      };

    } catch (error) {

      console.log(
        "Routing Error:",
        error.message
      );

      return {

        department:
          "General",

        confidence: 0,

      };

    }

  };

/* =========================================
   MULTI-DEPARTMENT ROUTING
========================================= */

const multiDepartmentRouting =
  complaintText => {

    try {

      const text =
        cleanText(
          complaintText
        );

      const results = [];

      Object.keys(
        departmentKeywords
      ).forEach(
        department => {

          const score =
            scoreDepartment(

              text,

              departmentKeywords[
                department
              ]

            );

          if (score > 0) {

            results.push({

              department,
              score,

            });

          }

        }
      );

      results.sort(
        (a, b) =>
          b.score - a.score
      );

      return results;

    } catch (error) {

      console.log(
        "Multi Routing Error:",
        error.message
      );

      return [];

    }

  };

/* =========================================
   ROUTE PRIORITY
========================================= */

const routePriority =
  risk => {

    switch (risk) {

      case "Critical":

        return "Immediate";

      case "High":

        return "Urgent";

      case "Medium":

        return "Normal";

      default:

        return "Low";

    }

  };

/* =========================================
   ASSIGN OFFICER
========================================= */

const assignOfficer =
  (
    department,
    officers
  ) => {

    try {

      const filtered =
        officers.filter(

          officer =>

            officer.department ===
            department

        );

      if (
        filtered.length === 0
      ) {

        return null;

      }

      /* =========================
         LEAST ACTIVE OFFICER
      ========================= */

      filtered.sort(
        (a, b) =>

          (
            a.activeComplaints ||
            0
          ) -

          (
            b.activeComplaints ||
            0
          )

      );

      return filtered[0];

    } catch (error) {

      console.log(
        "Officer Assignment Error:",
        error.message
      );

      return null;

    }

  };

/* =========================================
   ESCALATION CHECK
========================================= */

const shouldEscalate =
  complaint => {

    try {

      const criticalRisk =

        complaint.risk ===
        "Critical";

      const unresolved =
        complaint.status !==
        "Resolved";

      const createdAt =
        new Date(
          complaint.createdAt
        );

      const now =
        new Date();

      const diffHours =

        (
          now - createdAt
        ) /

        (1000 * 60 * 60);

      /* =========================
         ESCALATION RULES
      ========================= */

      if (
        criticalRisk &&
        unresolved
      ) {

        return true;

      }

      if (
        diffHours > 48 &&
        unresolved
      ) {

        return true;

      }

      return false;

    } catch (error) {

      console.log(
        "Escalation Error:",
        error.message
      );

      return false;

    }

  };

/* =========================================
   SLA CALCULATION
========================================= */

const calculateSLA =
  risk => {

    switch (risk) {

      case "Critical":

        return "2 Hours";

      case "High":

        return "12 Hours";

      case "Medium":

        return "24 Hours";

      case "Low":

        return "72 Hours";

      default:

        return "48 Hours";

    }

  };

/* =========================================
   EXPORTS
========================================= */

module.exports = {

  autoRouteDepartment,

  multiDepartmentRouting,

  routePriority,

  assignOfficer,

  shouldEscalate,

  calculateSLA,

};