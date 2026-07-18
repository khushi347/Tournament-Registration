const Tournament = require('../models/tournament');
const ApiError = require('../utils/apiError');
const HTTP_STATUS = require('../constants/httpStatuses');
const MESSAGES = require('../constants/messages');

/**
 * Tournament Service
 * Handles business logic related to tournaments
 */
class TournamentService {
  /**
   * Create a new tournament
   * @param {object} tournamentData - Tournament data ({ name, maxPlayers })
   * @returns {Promise<object>} Created tournament document
   */
  async createTournament(tournamentData) {
    const { name, maxPlayers } = tournamentData;

    const tournament = await Tournament.create({
      name,
      maxPlayers
    });

    return tournament;
  }

  /**
   * Get tournament by ID
   * @param {string} id - Tournament ID
   * @returns {Promise<object>} Tournament document
   */
  async getTournamentById(id) {
    const tournament = await Tournament.findById(id).lean();
    if (!tournament) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.TOURNAMENT.NOT_FOUND);
    }
    return tournament;
  }

  /**
   * Get all tournaments with optional pagination/search
   * @param {object} options - query options ({ search, page, limit })
   * @returns {Promise<object>} List of tournaments and pagination details
   */
  async getTournaments(options = {}) {
    const { search = '', page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const total = await Tournament.countDocuments(query);
    const tournaments = await Tournament.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    return {
      tournaments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new TournamentService();
