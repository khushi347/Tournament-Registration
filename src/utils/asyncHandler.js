/**
 * Wraps express route handlers and routes any rejected promises to the next() error handler middleware.
 * Eliminates repetitive try-catch blocks in controller code.
 * @param {Function} requestHandler - Asynchronous Express middleware/controller function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

module.exports = asyncHandler;
