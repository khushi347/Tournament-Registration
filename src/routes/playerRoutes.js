const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const { createPlayerValidator } = require('../validators/playerValidator');

// POST /players
router.post('/', createPlayerValidator, playerController.createPlayer);

// GET /players (Search/list players)
router.get('/', playerController.getPlayers);

module.exports = router;
