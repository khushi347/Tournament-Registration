const tournamentService = require('../services/tournamentService');
const registrationService = require('../services/registrationService');
const scoreService = require('../services/scoreService');
const ApiResponse = require('../utils/apiResponse');
const HTTP_STATUS = require('../constants/httpStatuses');
const MESSAGES = require('../constants/messages');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Tournament Controller
 * Handles HTTP operations for tournaments, registrations, scores, and leaderboards
 */
class TournamentController {
  /**
   * Create a new Tournament
   */
  createTournament = asyncHandler(async (req, res) => {
    const { name, maxPlayers } = req.body;
    const tournament = await tournamentService.createTournament({ name, maxPlayers });

    new ApiResponse(
      HTTP_STATUS.CREATED,
      MESSAGES.TOURNAMENT.CREATED,
      tournament
    ).send(res);
  });

  /**
   * Register a player for a Tournament
   */
  registerPlayer = asyncHandler(async (req, res) => {
    const tournamentId = req.params.id;
    const { playerId } = req.body;

    const registration = await registrationService.registerPlayer(tournamentId, playerId);

    new ApiResponse(
      HTTP_STATUS.CREATED,
      MESSAGES.REGISTRATION.SUCCESS,
      registration
    ).send(res);
  });

  /**
   * Submit or update a player's score
   */
  submitScore = asyncHandler(async (req, res) => {
    const tournamentId = req.params.id;
    const { playerId, score } = req.body;

    const savedScore = await scoreService.submitScore(tournamentId, playerId, score);

    new ApiResponse(
      HTTP_STATUS.OK,
      MESSAGES.SCORE.SUBMITTED,
      savedScore
    ).send(res);
  });

  /**
   * Get the tournament Leaderboard
   * Returns sorted rankings. Supports optional search and pagination.
   */
  getLeaderboard = asyncHandler(async (req, res) => {
    const tournamentId = req.params.id;
    const { page, limit, search } = req.query;

    const data = await scoreService.getLeaderboard(tournamentId, { page, limit, search });

    // Format matches standard API Response envelope structure
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Leaderboard retrieved successfully',
      data: data.rankings,
      pagination: data.pagination
    });
  });

  /**
   * Get a player's rank and stats within a tournament
   */
  getPlayerStats = asyncHandler(async (req, res) => {
    const { id: tournamentId, playerId } = req.params;

    const stats = await scoreService.getPlayerStats(tournamentId, playerId);

    new ApiResponse(
      HTTP_STATUS.OK,
      'Player tournament stats retrieved successfully',
      stats
    ).send(res);
  });
}

module.exports = new TournamentController();
