const Registration = require('../models/registration');
const Tournament = require('../models/tournament');
const Player = require('../models/player');
const ApiError = require('../utils/apiError');
const HTTP_STATUS = require('../constants/httpStatuses');
const MESSAGES = require('../constants/messages');

/**
 * Registration Service
 * Handles business logic for registering players to tournaments
 */
class RegistrationService {
  /**
   * Register a player for a tournament
   * @param {string} tournamentId - Tournament ID
   * @param {string} playerId - Player ID
   * @returns {Promise<object>} Created registration document
   */
  async registerPlayer(tournamentId, playerId) {
    // 1. Verify tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.TOURNAMENT.NOT_FOUND);
    }

    // 2. Verify player exists
    const player = await Player.findById(playerId);
    if (!player) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.PLAYER.NOT_FOUND);
    }

    // 3. Verify duplicate registration is not allowed
    const existingRegistration = await Registration.findOne({
      tournament: tournamentId,
      player: playerId
    });
    if (existingRegistration) {
      throw new ApiError(HTTP_STATUS.CONFLICT, MESSAGES.REGISTRATION.ALREADY_REGISTERED);
    }

    // 4. Verify capacity limit is not exceeded
    const currentRegistrationCount = await Registration.countDocuments({
      tournament: tournamentId
    });
    
    if (currentRegistrationCount >= tournament.maxPlayers) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, MESSAGES.TOURNAMENT.FULL);
    }

    // 5. Create registration record
    const registration = await Registration.create({
      tournament: tournamentId,
      player: playerId
    });

    return registration;
  }
}

module.exports = new RegistrationService();
