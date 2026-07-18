const express = require('express');
const router = express.Router();

const healthRoutes = require('./healthRoutes');
const playerRoutes = require('./playerRoutes');
const tournamentRoutes = require('./tournamentRoutes');

// Mount routes
router.use('/health', healthRoutes);
router.use('/players', playerRoutes);
router.use('/tournaments', tournamentRoutes);

module.exports = router;
