/* =========================================
   utils/duplicate.js
   Duplicate Complaint Detection Utility
========================================= */

/* =========================================
   CLEAN TEXT
========================================= */

const cleanText =
  text => {

    if (!text) return "";

    return text

      .toLowerCase()

      .replace(/[^\w\s]/g, "")

      .replace(/\s+/g, " ")

      .trim();

  };

/* =========================================
   TOKENIZE WORDS
========================================= */

const tokenize =
  text => {

    return cleanText(text)
      .split(" ")
      .filter(word => word.length > 2);

  };

/* =========================================
   JACCARD SIMILARITY
========================================= */

const jaccardSimilarity =
  (text1, text2) => {

    const set1 =
      new Set(
        tokenize(text1)
      );

    const set2 =
      new Set(
        tokenize(text2)
      );

    const intersection =
      [...set1].filter(
        word =>
          set2.has(word)
      );

    const union =
      new Set([

        ...set1,
        ...set2

      ]);

    if (union.size === 0)
      return 0;

    return (
      intersection.length /
      union.size
    );

  };

/* =========================================
   CHECK DUPLICATE
========================================= */

const isDuplicateComplaint =
  (
    newComplaint,
    existingComplaints,
    threshold = 0.60
  ) => {

    try {

      const matches = [];

      existingComplaints.forEach(
        complaint => {

          const existingText = `

            ${complaint.issue || ""}

            ${complaint.description || ""}

          `;

          const similarity =
            jaccardSimilarity(

              newComplaint,

              existingText

            );

          if (
            similarity >=
            threshold
          ) {

            matches.push({

              complaintId:
                complaint._id,

              issue:
                complaint.issue,

              similarity:
                similarity.toFixed(
                  2
                ),

              status:
                complaint.status,

              department:
                complaint.department,

            });

          }

        }
      );

      return {

        isDuplicate:
          matches.length > 0,

        duplicates:
          matches,

      };

    } catch (error) {

      console.log(
        "Duplicate Detection Error:",
        error.message
      );

      return {

        isDuplicate: false,
        duplicates: [],

      };

    }

  };

/* =========================================
   FIND BEST MATCH
========================================= */

const findBestMatch =
  (
    newComplaint,
    existingComplaints
  ) => {

    try {

      let bestMatch = null;

      let highestScore = 0;

      existingComplaints.forEach(
        complaint => {

          const text = `

            ${complaint.issue || ""}

            ${complaint.description || ""}

          `;

          const score =
            jaccardSimilarity(

              newComplaint,
              text

            );

          if (
            score >
            highestScore
          ) {

            highestScore =
              score;

            bestMatch = {

              complaint,

              score:
                score.toFixed(
                  2
                ),

            };

          }

        }
      );

      return bestMatch;

    } catch (error) {

      console.log(
        "Best Match Error:",
        error.message
      );

      return null;

    }

  };

/* =========================================
   GROUP DUPLICATES
========================================= */

const groupDuplicateComplaints =
  complaints => {

    try {

      const visited =
        new Set();

      const groups = [];

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

          const group = [

            complaint

          ];

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

              const similarity =
                jaccardSimilarity(

                  `${complaint.issue} ${complaint.description}`,

                  `${otherComplaint.issue} ${otherComplaint.description}`

                );

              if (
                similarity >=
                0.65
              ) {

                group.push(
                  otherComplaint
                );

                visited.add(
                  otherIndex
                );

              }

            }
          );

          if (
            group.length > 1
          ) {

            groups.push({

              groupId:
                `dup_${index + 1}`,

              count:
                group.length,

              complaints:
                group,

            });

          }

        }
      );

      return groups;

    } catch (error) {

      console.log(
        "Group Duplicate Error:",
        error.message
      );

      return [];

    }

  };

/* =========================================
   EXPORTS
========================================= */

module.exports = {

  cleanText,

  tokenize,

  jaccardSimilarity,

  isDuplicateComplaint,

  findBestMatch,

  groupDuplicateComplaints,

};