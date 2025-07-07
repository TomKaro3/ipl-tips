const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  match_id: String,
  round: String,
  home_team: String,
  away_team: String,
  home_score: Number,
  away_score: Number,
  date: Date,
  home_logo: String,  // Storing home team logo
  away_logo: String,  // Storing away team logo
  ground_name: String,  // Storing the ground name
  field_name: String,  // Storing field name
  competition_name: String,  // Storing competition name
  league_name: String,  // Storing league name
  status: String,  // Storing match status
  match_hash_id: String,  // Match hash for future reference
  home_team_hash_id: String,  // Home team hash id
  away_team_hash_id: String,  // Away team hash id
  forfeit_team_hash_id: String,  // Forfeit team hash id (if applicable)
});

module.exports = mongoose.model('Match', matchSchema);
