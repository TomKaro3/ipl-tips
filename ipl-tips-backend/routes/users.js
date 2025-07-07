const express = require('express');
const router = express.Router();
const User = require('../schemas/User');
const Match = require('../schemas/Match');
  
const bcrypt = require('bcryptjs'); // at top

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Username taken" });

    const hashedPassword = await bcrypt.hash(password, 10); // 🔐 hash that shii

    const newUser = new User({ username, password: hashedPassword, tips: {} });
    await newUser.save();

    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Error creating user" });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password); // 🔐 compare hashed
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

    // ✅ Store username in session
    req.session.username = user.username;

    res.json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Error logging in" });
  }
});

  router.post('/tip', async (req, res) => {
    const { username, round, tips } = req.body;
  
    try {
      console.log("👉 Received tips from frontend:");
      console.log("username:", username);
      console.log("round:", round);
      console.log("tips:", tips);
  
      const roundKey = `tips.${round}`;
  
      const update = {};
      for (const [matchId, choice] of Object.entries(tips)) {
        update[`${roundKey}.${matchId}`] = choice; // eg. tips.round15.matchId = 'home'
      }
  
      console.log("🔨 Update payload:", update);
  
      const result = await User.findOneAndUpdate(
        { username },        // find user
        { $set: update },    // set new tips
        { new: true, upsert: false } // return updated doc
      );
  
      if (!result) {
        return res.status(404).json({ message: "User not found" });
      }
  
      console.log("✅ Tips saved for user:", username);
      res.json({ message: "✅ Tips saved successfully!" });
    } catch (err) {
      console.error("❌ Error saving tips:", err);
      res.status(500).json({ message: "Failed to save tips" });
    }
  });

// GET leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find().sort({ score: -1 }).select('username score');
    res.json(users);
  } catch (err) {
    console.error("Failed to fetch leaderboard:", err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

const calculateScores = require("../utils/scoring");

// POST /api/users/calculate-scores/:round
router.post('/calculate-scores/:round', async (req, res) => {
  const round = req.params.round;

  try {
    await calculateScores(round);
    res.json({ message: `Scores calculated for round ${round}` });
  } catch (err) {
    console.error("Failed to calculate scores:", err);
    res.status(500).json({ error: 'Failed to calculate scores' });
  }
});

  // GET /api/users/:username - Fetch user info including tips
  router.get('/:username', async (req, res) => {
    try {
      const username = req.params.username;
      const user = await User.findOne({ username }).select('-password -__v'); // exclude sensitive stuff
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

module.exports = router;
