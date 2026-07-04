import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: [true, "Asset name is required"],
      trim: true
    },
    generatedName: {
      type: String,
      required: [true, "Generated name is required"],
      trim: true
    },
    url: {
      type: String,
      required: [true, "Cloudinary / Storage URL path is required"]
    },
    publicId: {
      type: String,
      default: "" // Cloudinary public_id (empty if local file upload)
    },
    fileType: {
      type: String,
      required: [true, "File type is required"],
      trim: true
    },
    fileSize: {
      type: String,
      required: [true, "File size is required"],
      trim: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Media = mongoose.model("Media", mediaSchema);

export default Media;
