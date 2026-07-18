const mongoose = require('mongoose');
const Score = require('../models/score');
const Registration = require('../models/registration');
const Tournament = require('../models/tournament');
const Player = require('../models/player');
const ApiError = require('../utils/apiError');
const HTTP_STATUS = require('../constants/httpStatuses');
const MESSAGES = require('../constants/messages');

/**
 * Score Service
 * Handles business logic related to player scores, leaderboard calculations, and ranks
 */
class ScoreService {
  /**
   * Submit or update a player's score for a tournament
   * @param {string} tournamentId - Tournament ID
   * @param {string} playerId - Player ID
   * @param {number} scoreValue - Player score
   * @returns {Promise<object>} Saved score document
   */
  async submitScore(tournamentId, playerId, scoreValue) {
    // 1. Verify player is registered for the tournament
    const isRegistered = await Registration.exists({
      tournament: tournamentId,
      player: playerId
    });

    if (!isRegistered) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, MESSAGES.SCORE.NOT_REGISTERED);
    }

    // 2. Submit or update score (upsert because of compound index)
    const score = await Score.findOneAndUpdate(
      { tournament: tournamentId, player: playerId },
      { score: scoreValue },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    return score;
  }

  /**
   * Get Leaderboard for a tournament with optional pagination/sorting/search
   * @param {string} tournamentId - Tournament ID
   * @param {object} options - Query filters ({ page, limit, search })
   * @returns {Promise<object>} Leaderboard list and pagination metadata
   */
  async getLeaderboard(tournamentId, options = {}) {
    const { page = 1, limit = 10, search = '' } = options;
    const skip = (page - 1) * limit;

    // 1. Verify tournament exists
    const tournamentExists = await Tournament.exists({ _id: tournamentId });
    if (!tournamentExists) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.TOURNAMENT.NOT_FOUND);
    }

    // 2. Build aggregation pipeline
    const pipeline = [
      { $match: { tournament: new mongoose.Types.ObjectId(tournamentId) } },
      {
        $lookup: {
          from: 'players',
          localField: 'player',
          foreignField: '_id',
          as: 'playerDetails'
        }
      },
      { $unwind: '$playerDetails' }
    ];

    // Search filter if provided (matching name or country)
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'playerDetails.name': { $regex: search, $options: 'i' } },
            { 'playerDetails.country': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Sort rules: score descending, then player name ascending
    pipeline.push({
      $sort: {
        score: -1,
        'playerDetails.name': 1
      }
    });

    // Count total matched records for metadata
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Score.aggregate(countPipeline);
    const total = countResult[0] ? countResult[0].total : 0;

    // Paginate matching records
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Format output fields
    pipeline.push({
      $project: {
        _id: 0,
        playerId: '$player',
        name: '$playerDetails.name',
        country: '$playerDetails.country',
        score: 1
      }
    });

    const rankings = await Score.aggregate(pipeline);

    // Map ranks sequentially based on pagination offset
    const rankedLeaderboard = rankings.map((item, index) => ({
      rank: skip + index + 1,
      playerId: item.playerId,
      name: item.name,
      country: item.country,
      score: item.score
    }));

    return {
      rankings: rankedLeaderboard,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get a player's rank and score in a specific tournament
   * @param {string} tournamentId - Tournament ID
   * @param {string} playerId - Player ID
   * @returns {Promise<object>} Ranked statistics object
   */
  async getPlayerStats(tournamentId, playerId) {
    // 1. Verify player exists
    const player = await Player.findById(playerId).lean();
    if (!player) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.PLAYER.NOT_FOUND);
    }

    // 2. Verify tournament exists
    const tournamentExists = await Tournament.exists({ _id: tournamentId });
    if (!tournamentExists) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.TOURNAMENT.NOT_FOUND);
    }

    // 3. Verify player is registered
    const isRegistered = await Registration.exists({
      tournament: tournamentId,
      player: playerId
    });
    if (!isRegistered) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, MESSAGES.SCORE.NOT_REGISTERED);
    }

    // 4. Aggregate ranks for all registered players in this tournament
    // This allows accurate rank calculations even for players who haven't submitted a score yet (implicitly 0)
    const pipeline = [
      { $match: { tournament: new mongoose.Types.ObjectId(tournamentId) } },
      {
        $lookup: {
          from: 'scores',
          let: { player_id: '$player', tournament_id: '$tournament' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$player', '$$player_id'] },
                    { $eq: ['$tournament', '$$tournament_id'] }
                  ]
                }
              }
            }
          ],
          as: 'scoreEntry'
        }
      },
      {
        $addFields: {
          score: { $ifNull: [{ $arrayElemAt: ['$scoreEntry.score', 0] }, 0] }
        }
      },
      {
        $lookup: {
          from: 'players',
          localField: 'player',
          foreignField: '_id',
          as: 'playerDetails'
        }
      },
      { $unwind: '$playerDetails' },
      {
        $sort: {
          score: -1,
          'playerDetails.name': 1
        }
      },
      {
        $group: {
          _id: null,
          playersList: {
            $push: {
              playerId: '$player',
              name: '$playerDetails.name',
              score: '$score'
            }
          }
        }
      },
      {
        $unwind: {
          path: '$playersList',
          includeArrayIndex: 'rankIndex'
        }
      },
      {
        $match: {
          'playersList.playerId': new mongoose.Types.ObjectId(playerId)
        }
      },
      {
        $project: {
          _id: 0,
          playerId: '$playersList.playerId',
          name: '$playersList.name',
          score: '$playersList.score',
          rank: { $add: ['$rankIndex', 1] }
        }
      }
    ];

    const result = await Registration.aggregate(pipeline);

    if (!result || result.length === 0) {
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to compute rankings.');
    }

    return result[0];
  }
}

module.exports = new ScoreService();
