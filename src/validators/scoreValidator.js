const { body, param } = require('express-validator');
const MESSAGES = require('../constants/messages');
const validate = require('../middleware/validationMiddleware');

/**
 * Validator rules for submitting/updating a score
 */
const submitScoreValidator = [
  param('id')
    .isMongoId()
    .withMessage(MESSAGES.REGISTRATION.REQUIRED_TOURNAMENT_ID),
  body('playerId')
    .isMongoId()
    .withMessage(MESSAGES.REGISTRATION.REQUIRED_PLAYER_ID),
  body('score')
    .notEmpty()
    .withMessage(MESSAGES.SCORE.REQUIRED_SCORE)
    .isInt({ min: 0 })
    .withMessage(MESSAGES.SCORE.INVALID_SCORE),
  validate
];

module.exports = {
  submitScoreValidator
};
