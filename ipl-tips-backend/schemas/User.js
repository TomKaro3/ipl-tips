const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String, // 🔐 NEW
  tips: { type: Object, default: {} },
  score: { type: Number, default: 0 },
  roundScores: { type: Map, of: Number, default: {} }
});

module.exports = mongoose.model("User", userSchema);
