import path from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// DB & middleware imports
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Routes imports
import authRoutes from "./routes/authRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";

// Load Environment variables
dotenv.config();

// Establish MongoDB connection
connectDB();

const app = express();

// Apply Cors and Parsers Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Map uploads folder as static files directory
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Welcome / Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CMS Admin Panel REST API Service is online."
  });
});

// API Routes Mounting
app.use("/api/auth", authRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/media", mediaRoutes);

// Fallbacks for unhandled routes (404)
app.use(notFound);

// Centralized error logger/handler (500/400)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
