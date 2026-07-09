import express from "express";
import { registerUser, loginUser, getUsers, updateUserRole } from "../controllers/authController.js";
import { validate } from "../middleware/validationMiddleware.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register a user with validation
router.post("/register", validate(registerSchema), registerUser);

// Login a user with validation
router.post("/login", validate(loginSchema), loginUser);

// Admin-secured user management endpoints
router.get("/users", protect, authorizeRoles("Admin"), getUsers);
router.put("/users/:id/role", protect, authorizeRoles("Admin"), updateUserRole);

export default router;
