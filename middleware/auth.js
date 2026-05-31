/* =========================================
   JWT AUTH MIDDLEWARE
========================================= */

const jwt =
  require("jsonwebtoken");

/* =========================================
   AUTH MIDDLEWARE
========================================= */

const auth = (
  req,
  res,
  next
) => {

  try {

    /* =========================
       GET TOKEN
    ========================= */

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {

      return res.status(401).json({

        success: false,

        message:
          "Access denied. No token provided",

      });

    }

    /* =========================
       EXTRACT TOKEN
    ========================= */

    const token =
      authHeader.startsWith(
        "Bearer "
      )
        ? authHeader.split(" ")[1]
        : authHeader;

    if (!token) {

      return res.status(401).json({

        success: false,

        message:
          "Invalid token format",

      });

    }

    /* =========================
       VERIFY TOKEN
    ========================= */

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    /* =========================
       STORE USER
    ========================= */

    req.user = {

      id: decoded.id,

      role: decoded.role,

      username:
        decoded.username,

    };

    next();

  } catch (error) {

    console.log(
      "AUTH ERROR:",
      error.message
    );

    return res.status(403).json({

      success: false,

      message:
        "Unauthorized access",

    });

  }

};

/* =========================================
   ROLE CHECK MIDDLEWARE
========================================= */

const roleAuth = (
  roles = []
) => {

  return (
    req,
    res,
    next
  ) => {

    try {

      if (
        !roles.includes(
          req.user.role
        )
      ) {

        return res.status(403).json({

          success: false,

          message:
            "Permission denied",

        });

      }

      next();

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };

};

/* =========================================
   EXPORTS
========================================= */

module.exports =
  auth;

module.exports.roleAuth =
  roleAuth;