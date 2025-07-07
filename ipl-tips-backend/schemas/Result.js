const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  type: String,
  match_id: String,
  name: String,  // Match name (e.g., "Albion Park White Eagles FG vs Wollongong United FC FG")
  date: Date,  // Date of the match (e.g., "2025-06-22 05:00:00")
  round: String,
  full_round: String,
  ground_name: String,
  field_name: String,
  home_team_name: String,
  home_logo: String,
  away_team_name: String,
  away_logo: String,
  competition_name: String,
  league_name: String,
  status: { type: String, default: 'complete' },
  bye_flag: Boolean,
  is_unstructured: Boolean,
  league_result_access: String,
  home_score: Number,
  home_score_extra: { type: Number, default: null },
  home_score_penalty: { type: Number, default: null },
  home_score_half: { type: Number, default: null },
  home_score_extra_half: { type: Number, default: null },
  away_score: Number,
  away_score_extra: { type: Number, default: null },
  away_score_penalty: { type: Number, default: null },
  away_score_half: { type: Number, default: null },
  away_score_extra_half: { type: Number, default: null },
  allocated_center_referee: Boolean,
  allocated_assistant_referee_1: Boolean,
  allocated_assistant_referee_2: Boolean,
  allocated_fourth_official: Boolean,
  allocated_game_leader: Boolean,
  referee_count: { type: Number, default: 0 },
  enable_referees_allocated: Boolean,
  match_hash_id: String,
  home_team_hash_id: String,
  away_team_hash_id: String,
  forfeit_team_hash_id: { type: String, default: null }
});

module.exports = mongoose.model('Result', resultSchema);
