const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true
    },
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: [0, 'Score must be non-negative (>= 0)']
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index to ensure one score entry per player per tournament
scoreSchema.index({ tournament: 1, player: 1 }, { unique: true });

const Score = mongoose.model('Score', scoreSchema);

module.exports = Score;
