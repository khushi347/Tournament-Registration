const { body } = require('express-validator');
const MESSAGES = require('../constants/messages');
const validate = require('../middleware/validationMiddleware');

/**
 * Validator rules for creating a Tournament
 */
const createTournamentValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage(MESSAGES.TOURNAMENT.REQUIRED_NAME),
  body('maxPlayers')
    .notEmpty()
    .withMessage(MESSAGES.TOURNAMENT.REQUIRED_MAX_PLAYERS)
    .isInt({ gt: 0 })
    .withMessage(MESSAGES.TOURNAMENT.INVALID_MAX_PLAYERS),
  validate
];

module.exports = {
  createTournamentValidator
};
