const { body } = require('express-validator');
const MESSAGES = require('../constants/messages');
const validate = require('../middleware/validationMiddleware');

/**
 * Validator rules for creating a Player
 */
const createPlayerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage(MESSAGES.PLAYER.REQUIRED_NAME),
  body('email')
    .trim()
    .notEmpty()
    .withMessage(MESSAGES.PLAYER.REQUIRED_EMAIL)
    .isEmail()
    .withMessage(MESSAGES.PLAYER.INVALID_EMAIL),
  body('country')
    .trim()
    .notEmpty()
    .withMessage(MESSAGES.PLAYER.REQUIRED_COUNTRY),
  validate
];

module.exports = {
  createPlayerValidator
};
