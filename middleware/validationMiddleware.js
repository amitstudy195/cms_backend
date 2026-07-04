/**
 * Express middleware to validate request bodies using Zod schemas.
 * Intercepts bad payloads before routing, resolving HTTP 400 responses.
 */
export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed; // overwrite with validated/sanitized inputs
    next();
  } catch (error) {
    // Check if it is a Zod validation error (contains 'issues' property)
    if (error.issues) {
      const formattedErrors = error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message
      }));
      
      res.status(400);
      return next(new Error(JSON.stringify({
        type: "ValidationError",
        details: formattedErrors
      })));
    }
    next(error);
  }
};
