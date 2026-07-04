import express from "express";
import {
  upload,
  uploadMediaFile,
  getMediaList,
  deleteMediaFile
} from "../controllers/mediaController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// GET all media list
router.get("/", getMediaList);

// POST Upload media asset (Multer middleware intercepts 'file' field)
router.post("/upload", upload.single("file"), uploadMediaFile);

// DELETE media asset (requires Admin RBAC)
router.delete("/:id", authorizeRoles("Admin"), deleteMediaFile);

export default router;
