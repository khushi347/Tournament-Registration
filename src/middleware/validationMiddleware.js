const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');
const HTTP_STATUS = require('../constants/httpStatuses');

/**
 * Validation Middleware
 * Checks if express-validator rules yielded any errors, formatting them into an ApiError.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Fetch the first error message to keep API response message clean and concise
    const firstErrorMessage = errors.array()[0].msg;
    const allErrors = errors.array();
    
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, firstErrorMessage, allErrors));
  }
  next();
};

module.exports = validate;
