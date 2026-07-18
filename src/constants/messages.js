/**
 * API response messages
 */
const MESSAGES = {
  HEALTH: {
    OK: 'Health status retrieved successfully'
  },
  PLAYER: {
    CREATED: 'Player created successfully',
    NOT_FOUND: 'Player not found',
    EMAIL_EXISTS: 'Email already registered',
    REQUIRED_NAME: 'Name is required',
    REQUIRED_EMAIL: 'Email is required',
    INVALID_EMAIL: 'Must be a valid email address',
    REQUIRED_COUNTRY: 'Country is required'
  },
  TOURNAMENT: {
    CREATED: 'Tournament created successfully',
    NOT_FOUND: 'Tournament not found',
    REQUIRED_NAME: 'Tournament name is required',
    REQUIRED_MAX_PLAYERS: 'Max players capacity is required',
    INVALID_MAX_PLAYERS: 'Max players must be a positive integer greater than 0',
    FULL: 'Tournament is full'
  },
  REGISTRATION: {
    SUCCESS: 'Player registered for tournament successfully',
    ALREADY_REGISTERED: 'Player is already registered for this tournament',
    REQUIRED_TOURNAMENT_ID: 'Valid Tournament ID is required',
    REQUIRED_PLAYER_ID: 'Valid Player ID is required'
  },
  SCORE: {
    SUBMITTED: 'Score submitted successfully',
    NOT_REGISTERED: 'Player is not registered for this tournament',
    REQUIRED_SCORE: 'Score is required',
    INVALID_SCORE: 'Score must be a non-negative integer (>= 0)'
  },
  SERVER: {
    INTERNAL_ERROR: 'Internal server error',
    NOT_FOUND: 'Route not found'
  }
};

module.exports = MESSAGES;
