const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');
const { createTournamentValidator } = require('../validators/tournamentValidator');
const { registerPlayerValidator } = require('../validators/registrationValidator');
const { submitScoreValidator } = require('../validators/scoreValidator');
const { validateIdParam, validateTournamentPlayerParams } = require('../validators/sharedValidator');

// POST /tournaments
router.post('/', createTournamentValidator, tournamentController.createTournament);

// POST /tournaments/:id/register
router.post('/:id/register', registerPlayerValidator, tournamentController.registerPlayer);

// POST /tournaments/:id/score
router.post('/:id/score', submitScoreValidator, tournamentController.submitScore);

// GET /tournaments/:id/leaderboard
router.get('/:id/leaderboard', validateIdParam, tournamentController.getLeaderboard);

// GET /tournaments/:id/player/:playerId
router.get('/:id/player/:playerId', validateTournamentPlayerParams, tournamentController.getPlayerStats);

module.exports = router;
