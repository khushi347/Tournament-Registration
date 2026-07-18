const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
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
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index to prevent a player registering for the same tournament twice
registrationSchema.index({ tournament: 1, player: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
