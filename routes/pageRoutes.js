import express from "express";
import {
  getPages,
  getPageById,
  createPage,
  updatePage,
  deletePage
} from "../controllers/pageController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { createPageSchema, updatePageSchema } from "../validators/pageValidator.js";

const router = express.Router();

// Apply auth protector to all routes in this directory
router.use(protect);

// GET and POST mappings (POST validates payload via Zod)
router.route("/")
  .get(getPages)
  .post(validate(createPageSchema), createPage);

// GET, PUT, and DELETE mappings (PUT validates payload via Zod, DELETE requires Admin)
router.route("/:id")
  .get(getPageById)
  .put(validate(updatePageSchema), updatePage)
  .delete(authorizeRoles("Admin"), deletePage);

export default router;
