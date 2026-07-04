import fs from "fs";
import path from "path";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Media from "../models/Media.js";

// Ensure local uploads fallback directory exists
const localUploadDir = "./uploads";
if (!fs.existsSync(localUploadDir)) {
  fs.mkdirSync(localUploadDir, { recursive: true });
}

let storage;
let isCloudinaryConfigured = false;

// 1. Attempt to configure Cloudinary Storage
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: "cms_assets",
        allowed_formats: ["jpg", "png", "jpeg", "gif", "pdf"],
        transformation: [{ width: 1200, crop: "limit", quality: "auto:good" }]
      }
    });
    isCloudinaryConfigured = true;
    console.log("Cloudinary Media Storage provider active.");
  } catch (err) {
    console.warn("Cloudinary configuration failed. Falling back to local disk storage.", err.message);
  }
}

// 2. Fallback to Local disk storage if Cloudinary is not configured
if (!isCloudinaryConfigured) {
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, localUploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
  });
  console.log("Local Disk Media Storage provider active (fallback).");
}

// Multer Filter definitions
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported. Upload PNG, JPG, GIF, or PDF only."), false);
  }
};

// Create Multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @desc    Upload media file (Cloudinary or local storage)
// @route   POST /api/media/upload
// @access  Private
export const uploadMediaFile = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      return next(new Error("Please upload a file"));
    }

    let mediaAsset;

    if (isCloudinaryConfigured) {
      // req.file contains parameters populated by multer-storage-cloudinary
      const { originalname, path: cloudPath, filename, mimetype, size } = req.file;

      mediaAsset = await Media.create({
        originalName: originalname,
        generatedName: filename,
        url: cloudPath, // Cloudinary secure URL
        publicId: filename, // Cloudinary public_id
        fileType: mimetype,
        fileSize: size ? `${(size / 1024).toFixed(1)} KB` : "0 KB",
        uploadedBy: req.user._id
      });
    } else {
      // Local storage parameters
      const { originalname, filename, mimetype, size } = req.file;
      const fileUrl = `/uploads/${filename}`;

      mediaAsset = await Media.create({
        originalName: originalname,
        generatedName: filename,
        url: fileUrl,
        publicId: "", // no publicId for local files
        fileType: mimetype,
        fileSize: `${(size / 1024).toFixed(1)} KB`,
        uploadedBy: req.user._id
      });
    }

    res.status(201).json({
      success: true,
      message: `File uploaded successfully to ${isCloudinaryConfigured ? "Cloudinary" : "local storage"}`,
      data: mediaAsset
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all media assets list
// @route   GET /api/media
// @access  Private
export const getMediaList = async (req, res, next) => {
  try {
    const media = await Media.find()
      .populate("uploadedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: media.length,
      data: media
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete media file (from disk or Cloudinary)
// @route   DELETE /api/media/:id
// @access  Private/Admin (RBAC Protected)
export const deleteMediaFile = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      res.status(404);
      return next(new Error("Media asset not found"));
    }

    if (media.publicId) {
      // 1. Delete from Cloudinary
      try {
        await cloudinary.uploader.destroy(media.publicId);
        console.log(`Cloudinary asset destroyed: ${media.publicId}`);
      } catch (err) {
        console.error(`Failed to destroy Cloudinary asset: ${err.message}`);
      }
      
      // Remove database record
      await media.deleteOne();
      
      res.status(200).json({
        success: true,
        message: "Media asset deleted successfully from Cloudinary and database"
      });
    } else {
      // 2. Delete from local filesystem
      const absolutePath = path.resolve(".", "uploads", media.generatedName);
      
      fs.unlink(absolutePath, async (err) => {
        if (err) {
          console.error(`Failed to remove file from disk: ${err.message}`);
        }

        await media.deleteOne();

        res.status(200).json({
          success: true,
          message: "Media asset deleted successfully from disk and database"
        });
      });
    }
  } catch (error) {
    next(error);
  }
};
