const { param } = require('express-validator');
const MESSAGES = require('../constants/messages');
const validate = require('../middleware/validationMiddleware');

/**
 * Validates that the 'id' parameter is a valid Mongo ID
 */
const validateIdParam = [
  param('id')
    .isMongoId()
    .withMessage(MESSAGES.REGISTRATION.REQUIRED_TOURNAMENT_ID),
  validate
];

/**
 * Validates that both 'id' and 'playerId' parameters are valid Mongo IDs
 */
const validateTournamentPlayerParams = [
  param('id')
    .isMongoId()
    .withMessage(MESSAGES.REGISTRATION.REQUIRED_TOURNAMENT_ID),
  param('playerId')
    .isMongoId()
    .withMessage(MESSAGES.REGISTRATION.REQUIRED_PLAYER_ID),
  validate
];

module.exports = {
  validateIdParam,
  validateTournamentPlayerParams
};
