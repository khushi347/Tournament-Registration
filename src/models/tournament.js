const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    maxPlayers: {
      type: Number,
      required: true,
      min: [1, 'Max players capacity must be greater than zero']
    }
  },
  {
    timestamps: true
  }
);

const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;
