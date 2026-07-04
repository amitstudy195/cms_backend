import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect Routes (Verify JWT Token)
export const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database, omit password field
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401);
        return next(new Error("Not authorized, user not found"));
      }

      next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      res.status(401);
      return next(new Error("Not authorized, token validation failed"));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error("Not authorized, no token provided"));
  }
};

// Grant Access to Specific Roles (RBAC Check)
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error("Not authorized, credentials missing"));
    }

    if (!roles.includes(req.user.role)) {
      res.status(403); // 403 Forbidden status code
      return next(
        new Error(
          `Access Denied: User role "${req.user.role}" does not have privileges for this action`
        )
      );
    }

    next();
  };
};
