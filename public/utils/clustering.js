/* =========================================
   utils/clustering.js
   AI Complaint Clustering Utility
========================================= */

/* =========================================
   TEXT CLEANER
========================================= */

const cleanText =
  text => {

    return text

      .toLowerCase()

      .replace(/[^\w\s]/gi, "")

      .trim();

  };

/* =========================================
   KEYWORD EXTRACTION
========================================= */

const extractKeywords =
  text => {

    const stopWords = [

      "the",
      "is",
      "are",
      "a",
      "an",
      "of",
      "to",
      "and",
      "for",
      "in",
      "on",
      "with",
      "my",
      "our",
      "their",
      "this",
      "that",
      "there",
      "issue",
      "problem",
      "complaint"

    ];

    return cleanText(text)

      .split(" ")

      .filter(

        word =>

          word.length > 2 &&

          !stopWords.includes(word)

      );

  };

/* =========================================
   SIMILARITY SCORE
========================================= */

const similarityScore =
  (text1, text2) => {

    const words1 =
      extractKeywords(text1);

    const words2 =
      extractKeywords(text2);

    const commonWords =
      words1.filter(

        word =>
          words2.includes(word)

      );

    const totalWords =
      new Set([

        ...words1,
        ...words2

      ]).size;

    if (totalWords === 0)
      return 0;

    return (
      commonWords.length /
      totalWords
    );

  };

/* =========================================
   CLUSTER COMPLAINTS
========================================= */

const clusterComplaints =
  complaints => {

    try {

      const clusters = [];

      const visited =
        new Set();

      const threshold =
        0.30;

      complaints.forEach(

        (
          complaint,
          index
        ) => {

          if (
            visited.has(index)
          ) {

            return;

          }

          const cluster = {

            clusterId:
              `cluster_${index + 1}`,

            topic:
              complaint.department ||
              "General",

            complaints: [
              complaint
            ],

            keywords:
              extractKeywords(

                complaint.issue +
                " " +
                (
                  complaint.description ||
                  ""
                )

              ),

            riskLevel:
              complaint.risk ||
              "Medium",

            count: 1,

          };

          visited.add(index);

          complaints.forEach(

            (
              otherComplaint,
              otherIndex
            ) => {

              if (

                index ===
                  otherIndex ||

                visited.has(
                  otherIndex
                )

              ) {

                return;

              }

              const score =
                similarityScore(

                  complaint.issue +
                    " " +
                    (
                      complaint.description ||
                      ""
                    ),

                  otherComplaint.issue +
                    " " +
                    (
                      otherComplaint.description ||
                      ""
                    )

                );

              if (
                score >=
                threshold
              ) {

                cluster
                .complaints
                .push(
                  otherComplaint
                );

                cluster.count++;

                visited.add(
                  otherIndex
                );

              }

            }

          );

          /* =====================
             UNIQUE KEYWORDS
          ===================== */

          cluster.keywords = [

            ...new Set(
              cluster.keywords
            )

          ].slice(0, 10);

          clusters.push(
            cluster
          );

        }

      );

      return clusters;

    } catch (error) {

      console.log(
        "Clustering Error:",
        error.message
      );

      return [];

    }

  };

/* =========================================
   WARD ANALYTICS
========================================= */

const generateWardAnalytics =
  complaints => {

    try {

      const wards = {};

      complaints.forEach(
        complaint => {

          const ward =
            complaint.ward ||
            "Unknown";

          if (!wards[ward]) {

            wards[ward] = {

              ward,

              total: 0,

              resolved: 0,

              pending: 0,

              critical: 0,

              departments: {},

            };

          }

          wards[ward].total++;

          /* =====================
             STATUS COUNTS
          ===================== */

          if (
            complaint.status ===
            "Resolved"
          ) {

            wards[ward]
            .resolved++;

          } else {

            wards[ward]
            .pending++;

          }

          /* =====================
             RISK COUNTS
          ===================== */

          if (
            complaint.risk ===
            "Critical"
          ) {

            wards[ward]
            .critical++;

          }

          /* =====================
             DEPARTMENT COUNTS
          ===================== */

          const dept =
            complaint.department ||
            "General";

          if (

            !wards[ward]
            .departments[dept]

          ) {

            wards[ward]
            .departments[dept] = 0;

          }

          wards[ward]
          .departments[dept]++;

        }
      );

      return Object.values(
        wards
      );

    } catch (error) {

      console.log(
        "Ward Analytics Error:",
        error.message
      );

      return [];

    }

  };

/* =========================================
   HEATMAP DATA
========================================= */

const generateHeatmapData =
  complaints => {

    try {

      return complaints

        .filter(

          c =>
            c.location &&
            c.location
            .coordinates

        )

        .map(c => ({

          lat:
            c.location
            .coordinates[1],

          lng:
            c.location
            .coordinates[0],

          intensity:

            c.risk ===
            "Critical"

              ? 1

              : c.risk ===
                "High"

              ? 0.8

              : c.risk ===
                "Medium"

              ? 0.5

              : 0.3,

          issue:
            c.issue,

          department:
            c.department,

        }));

    } catch (error) {

      console.log(
        "Heatmap Error:",
        error.message
      );

      return [];

    }

  };

/* =========================================
   TREND ANALYSIS
========================================= */

const generateTrendData =
  complaints => {

    try {

      const trends = {};

      complaints.forEach(
        complaint => {

          const date =
            new Date(
              complaint.createdAt
            )
            .toLocaleDateString();

          if (
            !trends[date]
          ) {

            trends[date] = 0;

          }

          trends[date]++;

        }
      );

      return {

        labels:
          Object.keys(
            trends
          ),

        data:
          Object.values(
            trends
          ),

      };

    } catch (error) {

      console.log(
        "Trend Error:",
        error.message
      );

      return {

        labels: [],
        data: [],

      };

    }

  };

/* =========================================
   RISK DISTRIBUTION
========================================= */

const riskDistribution =
  complaints => {

    try {

      const risks = {

        Low: 0,
        Medium: 0,
        High: 0,
        Critical: 0,

      };

      complaints.forEach(
        complaint => {

          const risk =
            complaint.risk ||
            "Medium";

          if (
            risks[risk] !==
            undefined
          ) {

            risks[risk]++;

          }

        }
      );

      return risks;

    } catch (error) {

      console.log(
        "Risk Distribution Error:",
        error.message
      );

      return {};

    }

  };

/* =========================================
   DEPARTMENT ANALYTICS
========================================= */

const departmentAnalytics =
  complaints => {

    try {

      const departments =
        {};

      complaints.forEach(
        complaint => {

          const dept =
            complaint.department ||
            "General";

          if (
            !departments[
              dept
            ]
          ) {

            departments[
              dept
            ] = 0;

          }

          departments[
            dept
          ]++;

        }
      );

      return departments;

    } catch (error) {

      console.log(
        "Department Analytics Error:",
        error.message
      );

      return {};

    }

  };

/* =========================================
   EXPORTS
========================================= */

module.exports = {

  clusterComplaints,

  generateWardAnalytics,

  generateHeatmapData,

  generateTrendData,

  riskDistribution,

  departmentAnalytics,

};