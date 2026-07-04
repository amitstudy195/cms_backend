import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, "Audit action is required"],
      trim: true,
      index: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User performing the action is required"],
      index: true
    },
    targetId: {
      type: String,
      required: [true, "Target document identifier is required"],
      index: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: { createdAt: "timestamp", updatedAt: false } // Only capture createdAt timestamp
  }
);

// Optional: Expire logs automatically after 90 days for database optimization
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
