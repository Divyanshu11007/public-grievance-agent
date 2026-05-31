/* =========================================
   utils/sentiment.js
   Complaint Sentiment Analysis Utility
========================================= */

/* =========================================
   POSITIVE WORDS
========================================= */

const positiveWords = [

  "good",
  "great",
  "excellent",
  "resolved",
  "clean",
  "fixed",
  "helpful",
  "safe",
  "working",
  "improved",
  "happy",
  "satisfied",
  "fast",
  "success",
  "thank",
  "thanks",
  "appreciate"

];

/* =========================================
   NEGATIVE WORDS
========================================= */

const negativeWords = [

  "bad",
  "worst",
  "dirty",
  "broken",
  "damage",
  "delay",
  "problem",
  "issue",
  "danger",
  "unsafe",
  "angry",
  "frustrated",
  "leak",
  "flood",
  "garbage",
  "pollution",
  "crime",
  "smell",
  "pothole",
  "powercut",
  "corruption",
  "harassment",
  "emergency",
  "critical",
  "failure",
  "complaint"

];

/* =========================================
   CRITICAL WORDS
========================================= */

const criticalWords = [

  "death",
  "fire",
  "murder",
  "accident",
  "emergency",
  "critical",
  "collapse",
  "explosion",
  "riot",
  "attack",
  "violence",
  "flood",
  "electrocution",
  "severe",
  "hospital",
  "ambulance"

];

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
   TOKENIZE
========================================= */

const tokenize =
  text => {

    return cleanText(text)

      .split(" ")

      .filter(word => word);

  };

/* =========================================
   SENTIMENT ANALYSIS
========================================= */

const analyzeSentiment =
  text => {

    try {

      const words =
        tokenize(text);

      let positive = 0;

      let negative = 0;

      words.forEach(
        word => {

          if (
            positiveWords.includes(
              word
            )
          ) {

            positive++;

          }

          if (
            negativeWords.includes(
              word
            )
          ) {

            negative++;

          }

        }
      );

      /* =========================
         SCORE
      ========================= */

      const score =
        positive -
        negative;

      let sentiment =
        "Neutral";

      if (score > 1) {

        sentiment =
          "Positive";

      }

      if (score < -1) {

        sentiment =
          "Negative";

      }

      return {

        sentiment,

        score,

        positiveWords:
          positive,

        negativeWords:
          negative,

      };

    } catch (error) {

      console.log(
        "Sentiment Error:",
        error.message
      );

      return {

        sentiment:
          "Neutral",

        score: 0,

      };

    }

  };

/* =========================================
   RISK SCORING
========================================= */

const calculateRisk =
  text => {

    try {

      const words =
        tokenize(text);

      let riskScore = 0;

      /* =========================
         NEGATIVE WEIGHT
      ========================= */

      words.forEach(
        word => {

          if (
            negativeWords.includes(
              word
            )
          ) {

            riskScore += 1;

          }

          if (
            criticalWords.includes(
              word
            )
          ) {

            riskScore += 3;

          }

        }
      );

      /* =========================
         DETERMINE RISK
      ========================= */

      let risk = "Low";

      if (riskScore >= 2) {

        risk = "Medium";

      }

      if (riskScore >= 5) {

        risk = "High";

      }

      if (riskScore >= 8) {

        risk = "Critical";

      }

      return {

        risk,

        riskScore,

      };

    } catch (error) {

      console.log(
        "Risk Error:",
        error.message
      );

      return {

        risk: "Medium",

        riskScore: 0,

      };

    }

  };

/* =========================================
   EMOTION DETECTION
========================================= */

const detectEmotion =
  text => {

    try {

      const cleaned =
        cleanText(text);

      if (

        cleaned.includes(
          "angry"
        ) ||

        cleaned.includes(
          "furious"
        )

      ) {

        return "Anger";

      }

      if (

        cleaned.includes(
          "sad"
        ) ||

        cleaned.includes(
          "depressed"
        )

      ) {

        return "Sadness";

      }

      if (

        cleaned.includes(
          "fear"
        ) ||

        cleaned.includes(
          "danger"
        )

      ) {

        return "Fear";

      }

      if (

        cleaned.includes(
          "happy"
        ) ||

        cleaned.includes(
          "thank"
        )

      ) {

        return "Joy";

      }

      return "Neutral";

    } catch (error) {

      console.log(
        "Emotion Error:",
        error.message
      );

      return "Neutral";

    }

  };

/* =========================================
   PRIORITY DETECTION
========================================= */

const detectPriority =
  (
    sentiment,
    risk
  ) => {

    try {

      if (
        risk ===
        "Critical"
      ) {

        return "Immediate";

      }

      if (
        risk ===
          "High" &&
        sentiment ===
          "Negative"
      ) {

        return "Urgent";

      }

      if (
        risk ===
        "Medium"
      ) {

        return "Normal";

      }

      return "Low";

    } catch (error) {

      console.log(
        "Priority Error:",
        error.message
      );

      return "Normal";

    }

  };

/* =========================================
   COMPLETE ANALYSIS
========================================= */

const fullSentimentAnalysis =
  text => {

    try {

      const sentimentData =
        analyzeSentiment(
          text
        );

      const riskData =
        calculateRisk(
          text
        );

      const emotion =
        detectEmotion(
          text
        );

      const priority =
        detectPriority(

          sentimentData
          .sentiment,

          riskData.risk

        );

      return {

        sentiment:
          sentimentData
          .sentiment,

        sentimentScore:
          sentimentData
          .score,

        emotion,

        risk:
          riskData.risk,

        riskScore:
          riskData
          .riskScore,

        priority,

      };

    } catch (error) {

      console.log(
        "Full Analysis Error:",
        error.message
      );

      return {

        sentiment:
          "Neutral",

        risk: "Medium",

        priority:
          "Normal",

      };

    }

  };

/* =========================================
   EXPORTS
========================================= */

module.exports = {

  analyzeSentiment,

  calculateRisk,

  detectEmotion,

  detectPriority,

  fullSentimentAnalysis,

};