const express = require('express');
const router = express.Router();
const Match = require('../schemas/Match'); // adjust path if needed
const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");


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
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });
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

    const newMatches = parsed.data.map(item => {
      const attr = item.attributes;
      const utcTime = new Date(attr.date); // from API
      const auTime = new Date(utcTime.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
      return {
        match_id: item.hash_id,
        round: attr.round,
        home_team: attr.home_team_name.trim(),
        away_team: attr.away_team_name.trim(),
        home_score: attr.home_score,
        away_score: attr.away_score,
        date: auTime
        
      };
    });

    await Match.deleteMany({ round: "R" + round });
    await Match.insertMany(newMatches);

    console.log('Matches imported:', newMatches.length);
    res.send("Imported round " + round);
  } catch (err) {
    console.error("Puppeteer import error:", err.message);
    res.status(500).send("Failed to import matches");
  }
});


// For importing results (after round is over)
router.post('/importresults/:round', async (req, res) => {
    const round = req.params.round;
    console.log('Importing round:', round);
  
    const url = `https://mc-api.dribl.com/api/results?league=gld4J2geNW&type_round=roundrobin_${round}`;
  
    try {
      const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
      });
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
  
      const newMatches = parsed.data.map(item => {
        const attr = item.attributes;
        const utcTime = new Date(attr.date); // from API
        const auTime = new Date(utcTime.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
        return {
          match_id: item.hash_id,
          round: attr.round,
          home_team: attr.home_team_name.trim(),
          away_team: attr.away_team_name.trim(),
          home_score: attr.home_score,
          away_score: attr.away_score,
          date: auTime
          
        };
      });
  
      await Match.deleteMany({ round: "R" + round });
      await Match.insertMany(newMatches);
  
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
