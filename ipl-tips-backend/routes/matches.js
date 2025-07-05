const express = require('express');
const router = express.Router();
const Match = require('../schemas/Match');
const axios = require('axios');

// common headers when calling the dribl API so it looks like a real browser
const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/117.0.0.0 Safari/537.36',
};

// GET all matches
// matches.js (Express route)
router.get("/", async (req, res) => {
  try {
    const round = req.query.round;  // e.g. "R15"
    let query = {};
    if (round) {
      query.round = round;  // make sure this matches your DB field name exactly
    }
    const matches = await Match.find(query);
    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch matches" });
  }
});


// For importing fixtures (before round has started)
router.post('/importfixtures/:round', async (req, res) => {
  const round = req.params.round;
  console.log('Importing round:', round);

  const url = `https://mc-api.dribl.com/api/fixtures?league=gld4J2geNW&type_round=roundrobin_${round}`;

  try {
    const { data } = await axios.get(url, { headers: REQUEST_HEADERS });

    if (!data?.data) {
      return res.status(400).send('No match data found');
    }

    const newMatches = data.data.map((item) => {
      const attr = item.attributes;
      const utcTime = new Date(attr.date);
      const auTime = new Date(
        utcTime.toLocaleString('en-US', { timeZone: 'Australia/Sydney' })
      );
      return {
        match_id: item.hash_id,
        round: attr.round,
        home_team: attr.home_team_name.trim(),
        away_team: attr.away_team_name.trim(),
        home_score: attr.home_score,
        away_score: attr.away_score,
        date: auTime,
      };
    });

    await Match.deleteMany({ round: 'R' + round });
    await Match.insertMany(newMatches);

    console.log('Matches imported:', newMatches.length);
    res.send('Imported round ' + round);
  } catch (err) {
    console.error('Import error:', err.message);
    res.status(500).send('Failed to import matches');
  }
});


// For importing results (after round is over)
router.post('/importresults/:round', async (req, res) => {
  const round = req.params.round;
  console.log('Importing round:', round);

  const url = `https://mc-api.dribl.com/api/results?league=gld4J2geNW&type_round=roundrobin_${round}`;

  try {
    const { data } = await axios.get(url, { headers: REQUEST_HEADERS });

    if (!data?.data) {
      return res.status(400).send('No match data found');
    }

    const newMatches = data.data.map((item) => {
      const attr = item.attributes;
      const utcTime = new Date(attr.date);
      const auTime = new Date(
        utcTime.toLocaleString('en-US', { timeZone: 'Australia/Sydney' })
      );
      return {
        match_id: item.hash_id,
        round: attr.round,
        home_team: attr.home_team_name.trim(),
        away_team: attr.away_team_name.trim(),
        home_score: attr.home_score,
        away_score: attr.away_score,
        date: auTime,
      };
    });

    await Match.deleteMany({ round: 'R' + round });
    await Match.insertMany(newMatches);

    console.log('Matches imported:', newMatches.length);
    res.send('Imported round ' + round);
  } catch (err) {
    console.error('Import error:', err.message);
    res.status(500).send('Failed to import matches');
  }
});

  // GET /api/matches/rounds - returns array of rounds e.g. ["R1", "R2", "R3"]
router.get('/rounds', async (req, res) => {
  try {
    const rounds = await Match.distinct('round');
    // rounds might be like ['R1', 'R2', 'R3', ...]
    res.json(rounds);
  } catch (err) {
    console.error("Failed to fetch rounds:", err);
    res.status(500).json({ message: "Failed to fetch rounds" });
  }
});


  // Delete all matches (for testing/reset)
router.delete('/clear', async (req, res) => {
    try {
      await Match.deleteMany({});
      res.send("All matches deleted");
    } catch (err) {
      res.status(500).send("Failed to delete matches");
    }
  });

module.exports = router;
