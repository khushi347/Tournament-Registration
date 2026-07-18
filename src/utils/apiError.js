/**
 * Custom operational API Error class that extends the standard Error object.
 * Used to throw formatted errors from services and controllers.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g. 400, 404, 409, 500)
   * @param {string} message - Error description
   * @param {Array} [errors=[]] - Array of specific error details (like validation issues)
   * @param {string} [stack=''] - Custom error stack trace
   */
  constructor(statusCode, message, errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
