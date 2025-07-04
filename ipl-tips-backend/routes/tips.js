const express = require('express');
const router = express.Router();
const User = require('../schemas/User');

// GET user tips for a round
router.get('/:userId/:round', async (req, res) => {
  try {
    const { userId, round } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).send("User not found");
    res.json(user.tips?.[`round${round}`] || {});
  } catch (err) {
    res.status(500).send("Error fetching tips");
  }
});

// PUT update user tips for a round (replace all tips for that round)
router.put('/:userId/:round', async (req, res) => {
  try {
    const { userId, round } = req.params;
    const newTips = req.body; // expect { matchId1: 'home', matchId2: 'draw' }

    // TODO: Check if round is still open for tips here (optional but recommended)

    const user = await User.findById(userId);
    if (!user) return res.status(404).send("User not found");

    user.tips = user.tips || {};
    user.tips[`round${round}`] = newTips;

    await user.save();
    res.send("Tips updated");
  } catch (err) {
    res.status(500).send("Error updating tips");
  }
});

module.exports = router;
