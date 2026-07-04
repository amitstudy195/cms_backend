// Centralized Express Error Handling Middleware

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";
  let details = null;

  // Check if error is our custom JSON validation error from Zod
  if (message.startsWith('{"type":"ValidationError"')) {
    try {
      const parsedError = JSON.parse(message);
      statusCode = 400;
      message = "Validation Error";
      details = parsedError.details;
    } catch (e) {
      // fallback if JSON parsing fails
    }
  }

  // Check for Mongoose bad ObjectId CastError
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = "Resource not found (Invalid ID format)";
  }

  // Check for Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Check for Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    message = `Duplicate field value entered: ${Object.keys(err.keyValue).join(", ")}`;
  }

  res.status(statusCode || 500).json({
    success: false,
    message,
    errors: details, // detailed list of Zod errors: [{ field: "title", message: "..." }]
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
};

// 404 Route Not Found Middleware helper
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - API endpoint ${req.originalUrl} does not exist`);
  res.status(404);
  next(error);
};
