const { body, param } = require('express-validator');
const MESSAGES = require('../constants/messages');
const validate = require('../middleware/validationMiddleware');

/**
 * Validator rules for registering a player to a tournament
 */
const registerPlayerValidator = [
  param('id')
    .isMongoId()
    .withMessage(MESSAGES.REGISTRATION.REQUIRED_TOURNAMENT_ID),
  body('playerId')
    .isMongoId()
    .withMessage(MESSAGES.REGISTRATION.REQUIRED_PLAYER_ID),
  validate
];

module.exports = {
  registerPlayerValidator
};
