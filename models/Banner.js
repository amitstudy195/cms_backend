import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a banner title"],
      trim: true
    },
    imageURL: {
      type: String,
      required: [true, "Please add a banner image URL"]
    },
    targetURL: {
      type: String,
      trim: true,
      default: ""
    },
    active: {
      type: Boolean,
      default: true
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
