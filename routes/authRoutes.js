import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { validate } from "../middleware/validationMiddleware.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";

const router = express.Router();

// Register a user with validation
router.post("/register", validate(registerSchema), registerUser);

// Login a user with validation
router.post("/login", validate(loginSchema), loginUser);

export default router;
