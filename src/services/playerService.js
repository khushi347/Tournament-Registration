const Player = require('../models/player');
const ApiError = require('../utils/apiError');
const HTTP_STATUS = require('../constants/httpStatuses');
const MESSAGES = require('../constants/messages');

/**
 * Player Service
 * Handles business logic related to players
 */
class PlayerService {
  /**
   * Create a new player
   * @param {object} playerData - Player data ({ name, email, country })
   * @returns {Promise<object>} Created player document
   */
  async createPlayer(playerData) {
    const { name, email, country } = playerData;

    // Email unique check
    const existingPlayer = await Player.findOne({ email: email.toLowerCase() });
    if (existingPlayer) {
      throw new ApiError(HTTP_STATUS.CONFLICT, MESSAGES.PLAYER.EMAIL_EXISTS);
    }

    const player = await Player.create({
      name,
      email,
      country
    });

    return player;
  }

  /**
   * Get players with optional search, pagination
   * @param {object} options - query options ({ search, page, limit })
   * @returns {Promise<object>} List of players and pagination details
   */
  async getPlayers(options = {}) {
    const { search = '', page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Player.countDocuments(query);
    const players = await Player.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    return {
      players,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get player by ID
   * @param {string} id - Player ID
   * @returns {Promise<object>} Player document
   */
  async getPlayerById(id) {
    const player = await Player.findById(id).lean();
    if (!player) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.PLAYER.NOT_FOUND);
    }
    return player;
  }
}

module.exports = new PlayerService();
