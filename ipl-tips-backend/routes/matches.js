const express = require('express');
const router = express.Router();
const Fixture = require('../schemas/Fixture');
const Result = require('../schemas/Result');
const puppeteer = require("puppeteer");

// 🔐 Middleware to restrict access to admin only
function isAdmin(req, res, next) {
  console.log("🔍 Session on admin route:", req.session);
  if (req.session.username === 'admin') {
    return next(); // ✅ let them through
  }
  return res.status(403).json({ error: "Forbidden: Admins only" });
}

async function launchBrowser() {
  return await puppeteer.launch({
    headless: "new",
    executablePath: '/usr/bin/google-chrome-stable',
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

// GET /matches?round=R17 — returns both fixtures and results (flattened)
router.get("/", async (req, res) => {
  try {
    const round = req.query.round; // e.g. "R17"
    if (!round) return res.status(400).json({ message: "Round is required" });

    const roundFilter = { "attributes.round": round };

    const [rawFixtures, rawResults] = await Promise.all([
      Fixture.find({ ...roundFilter, type: "fixtures" }).lean(),
      Result.find({ ...roundFilter, type: "results" }).lean(),
    ]);

    const flatten = (match) => {
      const attr = match.attributes || {};
      return {
        match_id: attr.match_hash_id || match.match_id || match._id.toString(),
        date: attr.date,
        round: attr.round,
        home_team_name: attr.home_team_name,
        away_team_name: attr.away_team_name,
        home_logo: attr.home_logo,
        away_logo: attr.away_logo,
        home_score: attr.home_score,
        away_score: attr.away_score,
        status: attr.status,
        type: match.type, // 'fixtures' or 'results'
      };
    };

    const combined = [...rawFixtures, ...rawResults]
      .map(flatten)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(combined);
  } catch (err) {
    console.error("Error fetching matches:", err);
    res.status(500).json({ message: "Failed to fetch matches" });
  }
});



// For importing fixtures (before round has started)
router.post('/importfixtures/:round', isAdmin, async (req, res) => {
  const round = req.params.round;
  console.log('Importing round:', round);

  const url = `https://mc-api.dribl.com/api/fixtures?league=gld4J2geNW&type_round=roundrobin_${round}`;

  try {
    const browser = await launchBrowser();
    const page = await browser.newPage();

    // Set user-agent (realistic browser)
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/117.0.0.0 Safari/537.36'
    );

    // Optional: set viewport for good measure
    await page.setViewport({ width: 1280, height: 800 });

    // Go to the URL and wait for network to be idle
    const response = await page.goto(url, { waitUntil: 'networkidle2' });

    // Check for status code 200
    if (!response || response.status() !== 200) {
      await browser.close();
      return res.status(response ? response.status() : 500).send("Failed to load data page");
    }

    // Wait a bit to ensure any JS finishes (can tweak ms)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Grab the raw page content text
    const bodyText = await page.evaluate(() => document.body.innerText);

    await browser.close();

    // Try parsing JSON
    let parsed;
    try {
      parsed = JSON.parse(bodyText);
    } catch (jsonErr) {
      console.error("JSON parse error:", jsonErr.message);
      console.error("Received data:", bodyText);
      return res.status(500).send("Failed to parse JSON response");
    }

    if (!parsed?.data) {
      return res.status(400).send("No match data found");
    }

    const newFixtures = parsed.data.map(item => {
      const attr = item.attributes;
      const utcTime = new Date(attr.date);
      const auTime = new Date(utcTime.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
      return {
        match_id: item.hash_id,
        round: attr.round,
        home_team_name: attr.home_team_name.trim(),
        away_team_name: attr.away_team_name.trim(),
        home_score: attr.home_score,
        away_score: attr.away_score,
        date: auTime
      };
    });

    await Fixture.deleteMany({ round: "R" + round });
    await Fixture.insertMany(newFixtures);

    console.log('Matches imported:', newMatches.length);
    res.send("Imported round " + round);
  } catch (err) {
    console.error("Puppeteer import error:", err.message);
    res.status(500).send("Failed to import matches");
  }
});


// For importing results (after round is over)
router.post('/importresults/:round', isAdmin, async (req, res) => {
    const round = req.params.round;
    console.log('Importing round:', round);
  
    const url = `https://mc-api.dribl.com/api/results?league=gld4J2geNW&type_round=roundrobin_${round}`;
  
    try {
      const browser = await launchBrowser();
      const page = await browser.newPage();
  
      // Set user-agent (realistic browser)
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/117.0.0.0 Safari/537.36'
      );
  
      // Optional: set viewport for good measure
      await page.setViewport({ width: 1280, height: 800 });
  
      // Go to the URL and wait for network to be idle
      const response = await page.goto(url, { waitUntil: 'networkidle2' });
  
      // Check for status code 200
      if (!response || response.status() !== 200) {
        await browser.close();
        return res.status(response ? response.status() : 500).send("Failed to load data page");
      }
  
      // Wait a bit to ensure any JS finishes (can tweak ms)
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      // Grab the raw page content text
      const bodyText = await page.evaluate(() => document.body.innerText);
  
      await browser.close();
  
      // Try parsing JSON
      let parsed;
      try {
        parsed = JSON.parse(bodyText);
      } catch (jsonErr) {
        console.error("JSON parse error:", jsonErr.message);
        console.error("Received data:", bodyText);
        return res.status(500).send("Failed to parse JSON response");
      }
  
      if (!parsed?.data) {
        return res.status(400).send("No match data found");
      }
  
      const newResults = parsed.data.map(item => {
        const attr = item.attributes;
        const utcTime = new Date(attr.date);
        const auTime = new Date(utcTime.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
        return {
          match_id: item.hash_id,
          round: attr.round,
          home_team_name: attr.home_team_name.trim(),
          away_team_name: attr.away_team_name.trim(),
          home_score: attr.home_score,
          away_score: attr.away_score,
          date: auTime
        };
      });

      await Result.deleteMany({ round: "R" + round });
      await Result.insertMany(newResults);
  
      console.log('Matches imported:', newMatches.length);
      res.send("Imported round " + round);
    } catch (err) {
      console.error("Puppeteer import error:", err.message);
      res.status(500).send("Failed to import matches");
    }
  });

  // GET /api/matches/rounds - returns array of rounds e.g. ["R1", "R2", "R3"]
router.get('/rounds', async (req, res) => {
  try {
    const fixtureRounds = await Fixture.distinct('attributes.round', { type: "fixtures" });
    const resultRounds = await Result.distinct('attributes.round', { type: "results" });
    const allRounds = Array.from(new Set([...fixtureRounds, ...resultRounds]));
    res.json(allRounds);
  } catch (err) {
    console.error("Failed to fetch rounds:", err);
    res.status(500).json({ message: "Failed to fetch rounds" });
  }
});


  // Delete all matches (for testing/reset)
router.delete('/clear', async (req, res) => {
    try {
      await Fixture.deleteMany({});
      await Result.deleteMany({});
      res.send("All matches deleted");
    } catch (err) {
      res.status(500).send("Failed to delete matches");
    }
  });

module.exports = router;