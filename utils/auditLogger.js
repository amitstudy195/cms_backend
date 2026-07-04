import AuditLog from "../models/AuditLog.js";

/**
 * Creates an audit log record in MongoDB.
 * Swallows errors internally to ensure that a logging failure
 * does not interrupt the primary user transaction.
 */
export const logActivity = async (action, performedBy, targetId, details = {}) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      targetId: targetId.toString(),
      details
    });
  } catch (error) {
    console.error(`Audit logging failed: ${error.message}`);
  }
};
export default logActivity;
