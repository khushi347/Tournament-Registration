const ApiError = require('../utils/apiError');
const HTTP_STATUS = require('../constants/httpStatuses');
const MESSAGES = require('../constants/messages');

/**
 * Global Error Handler Middleware
 * Intercepts all thrown exceptions, formats them, and returns standard success: false responses.
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // Default to internal server error if not an instance of ApiError
  if (!(err instanceof ApiError)) {
    statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    message = err.message || MESSAGES.SERVER.INTERNAL_ERROR;
  }

  // Handle Mongoose validation or parsing exceptions if they slip through
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    // Extract first validation error message
    const firstErrorKey = Object.keys(err.errors)[0];
    message = err.errors[firstErrorKey].message;
  }

  // Handle Mongo CastError (e.g. invalid MongoDB ObjectId format)
  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Invalid identifier format: ${err.value}`;
  }

  // Handle Mongo Duplicate Key Exception (code 11000)
  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    
    // Customize conflict message based on key pattern if possible
    if (err.keyValue && Object.keys(err.keyValue).includes('email')) {
      message = MESSAGES.PLAYER.EMAIL_EXISTS;
    } else if (err.keyValue && Object.keys(err.keyValue).includes('tournament') && Object.keys(err.keyValue).includes('player')) {
      // This maps to both Registration and Score compound keys
      message = MESSAGES.REGISTRATION.ALREADY_REGISTERED;
    } else {
      message = 'Resource duplicate index violation';
    }
  }

  // Log error stacks to console during local development or non-production test suites
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    console.error(`[Error Log] Status: ${statusCode} | Message: ${message}`);
    console.error(err.stack);
  }

  return res.status(statusCode).json({
    success: false,
    message
  });
};

/**
 * Route Not Found (404) Middleware
 * Triggered when a request does not match any registered routes.
 */
const notFoundHandler = (req, res, next) => {
  next(new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.SERVER.NOT_FOUND));
};

module.exports = {
  errorHandler,
  notFoundHandler
};
