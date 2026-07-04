import express from "express";
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners
} from "../controllers/bannerController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getBanners)
  .post(createBanner);

// Reordering action maps here (must be declared BEFORE :id wildcard route)
router.put("/reorder", reorderBanners);

router.route("/:id")
  .put(updateBanner)
  .delete(authorizeRoles("Admin"), deleteBanner);

export default router;
