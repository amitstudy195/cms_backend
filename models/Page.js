import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a page title"],
      trim: true
    },
    slug: {
      type: String,
      required: [true, "Please add a URL slug"],
      unique: true,
      trim: true,
      lowercase: true
    },
    content: {
      type: String,
      required: [true, "Please add the page content body"]
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: {
        values: ["Draft", "Published", "Scheduled", "Pending Approval"],
        message: "Status must be Draft, Published, Scheduled, or Pending Approval"
      },
      default: "Draft"
    },
    type: {
      type: String,
      enum: ["page", "banner"],
      default: "page"
    },
    featuredImage: {
      type: String,
      default: ""
    },
    publishedAt: {
      type: Date
    },
    seo: {
      metaTitle: {
        type: String,
        trim: true,
        default: ""
      },
      metaDescription: {
        type: String,
        trim: true,
        default: ""
      }
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to populate publishedAt if status changes to Published
pageSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "Published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const Page = mongoose.model("Page", pageSchema);

export default Page;
