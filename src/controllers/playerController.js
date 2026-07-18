const playerService = require('../services/playerService');
const ApiResponse = require('../utils/apiResponse');
const HTTP_STATUS = require('../constants/httpStatuses');
const MESSAGES = require('../constants/messages');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Player Controller
 * Handles player-related API HTTP interactions
 */
class PlayerController {
  /**
   * Create a new Player
   */
  createPlayer = asyncHandler(async (req, res) => {
    const { name, email, country } = req.body;
    const player = await playerService.createPlayer({ name, email, country });
    
    new ApiResponse(
      HTTP_STATUS.CREATED,
      MESSAGES.PLAYER.CREATED,
      player
    ).send(res);
  });

  /**
   * Get all Players (supports pagination & search query)
   */
  getPlayers = asyncHandler(async (req, res) => {
    const { search, page, limit } = req.query;
    const data = await playerService.getPlayers({ search, page, limit });

    // Include pagination at the root response level alongside the primary dataset
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Players retrieved successfully',
      data: data.players,
      pagination: data.pagination
    });
  });
}

module.exports = new PlayerController();
