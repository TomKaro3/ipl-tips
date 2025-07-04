const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  match_id: String,
  round: String,
  home_team: String,
  away_team: String,
  home_score: Number,
  away_score: Number,
  date: Date
});

module.exports = mongoose.model('Match', matchSchema);
