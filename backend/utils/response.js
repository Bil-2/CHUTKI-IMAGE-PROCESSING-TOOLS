// utils/response.js

// Success response
export const successResponse = (res, data = null, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

// Error response
export const errorResponse = (res, message = "Error occurred", statusCode = 500, error = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (error && process.env.NODE_ENV === "development") {
    response.error = error.message;
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
};

// Validation error response
export const validationErrorResponse = (res, errors, message = "Validation failed") => {
  return res.status(400).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
};

// Not found response
export const notFoundResponse = (res, resource = "Resource") => {
  return res.status(404).json({
    success: false,
    message: `${resource} not found`,
    timestamp: new Date().toISOString(),
  });
};

// Unauthorized response
export const unauthorizedResponse = (res, message = "Unauthorized") => {
  return res.status(401).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
};

// Forbidden response
export const forbiddenResponse = (res, message = "Forbidden") => {
  return res.status(403).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
};
